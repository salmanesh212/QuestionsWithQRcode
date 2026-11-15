-- Comité Social ESITH — à exécuter dans l'éditeur SQL du projet Supabase.
create extension if not exists pgcrypto;

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 160),
  speaker text not null default '',
  event_date date,
  code text not null unique check (code ~ '^[a-z0-9-]{1,45}$'),
  is_open boolean not null default true,
  premoderation boolean not null default false,
  max_per_device integer not null default 3 check (max_per_device between 1 and 100),
  created_at timestamptz not null default now()
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  question text not null check (char_length(question) between 5 and 300),
  first_name text,
  is_anonymous boolean not null default false,
  status text not null default 'approved' check (status in ('pending', 'approved', 'hidden')),
  is_pinned boolean not null default false,
  is_answered boolean not null default false,
  votes integer not null default 0 check (votes >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Empreintes pseudonymisées conservées côté base pour appliquer les quotas.
create table if not exists public.device_limits (
  event_id uuid not null references public.events(id) on delete cascade,
  device_hash text not null,
  question_count integer not null default 0,
  last_question_at timestamptz,
  primary key (event_id, device_hash)
);
create table if not exists public.ip_limits (
  event_id uuid not null references public.events(id) on delete cascade,
  ip_hash text not null,
  window_started_at timestamptz not null default now(),
  question_count integer not null default 0,
  primary key (event_id, ip_hash)
);

create index if not exists questions_event_created_idx on public.questions(event_id, created_at desc);
create index if not exists questions_event_status_idx on public.questions(event_id, status);
create index if not exists questions_event_votes_idx on public.questions(event_id, votes desc);
create index if not exists questions_pinned_idx on public.questions(event_id, is_pinned) where is_pinned = true;
alter table public.questions replica identity full;

alter table public.events enable row level security;
alter table public.questions enable row level security;
alter table public.settings enable row level security;
alter table public.device_limits enable row level security;
alter table public.ip_limits enable row level security;

-- La clé anon ne peut jamais écrire. Les écrans publics lisent uniquement les
-- événements ouverts et les questions approuvées. Les routes serveur utilisent
-- la clé service_role, qui contourne RLS et ne doit jamais quitter le serveur.
drop policy if exists "Événements ouverts lisibles" on public.events;
create policy "Événements ouverts lisibles" on public.events for select to anon, authenticated using (is_open = true);
drop policy if exists "Questions approuvées lisibles" on public.questions;
create policy "Questions approuvées lisibles" on public.questions for select to anon, authenticated using (
  status = 'approved'
);
revoke all on public.events, public.questions, public.settings, public.device_limits, public.ip_limits from anon, authenticated;
grant select on public.events, public.questions to anon, authenticated;

-- L'exécution atomique applique 1 question / 30 secondes et 3 par défaut
-- (configurable par événement) ainsi que 10 / 10 minutes par IP.
create or replace function public.check_question_limits(
  p_event_id uuid, p_device_hash text, p_ip_hash text, p_max_device integer
) returns boolean
language plpgsql security definer set search_path = public as $$
declare
  v_device device_limits%rowtype;
  v_ip ip_limits%rowtype;
  v_now timestamptz := now();
begin
  perform pg_advisory_xact_lock(hashtextextended(p_event_id::text || ':device:' || p_device_hash, 0));
  perform pg_advisory_xact_lock(hashtextextended(p_event_id::text || ':ip:' || p_ip_hash, 0));
  insert into device_limits(event_id, device_hash) values (p_event_id, p_device_hash) on conflict do nothing;
  select * into v_device from device_limits where event_id = p_event_id and device_hash = p_device_hash for update;
  insert into ip_limits(event_id, ip_hash) values (p_event_id, p_ip_hash) on conflict do nothing;
  select * into v_ip from ip_limits where event_id = p_event_id and ip_hash = p_ip_hash for update;
  if v_device.question_count >= p_max_device then return false; end if;
  if v_device.last_question_at is not null and v_device.last_question_at > v_now - interval '30 seconds' then return false; end if;
  if v_ip.window_started_at <= v_now - interval '10 minutes' then
    update ip_limits set window_started_at = v_now, question_count = 0 where event_id = p_event_id and ip_hash = p_ip_hash;
    v_ip.question_count := 0;
  end if;
  if v_ip.question_count >= 10 then return false; end if;
  update device_limits set question_count = question_count + 1, last_question_at = v_now where event_id = p_event_id and device_hash = p_device_hash;
  update ip_limits set question_count = question_count + 1 where event_id = p_event_id and ip_hash = p_ip_hash;
  return true;
end;
$$;
revoke all on function public.check_question_limits(uuid, text, text, integer) from public, anon, authenticated;
grant execute on function public.check_question_limits(uuid, text, text, integer) to service_role;

-- Supabase Realtime: active les changements PostgreSQL consommés par le projecteur
-- et l'administration. Les règles SELECT ci-dessus restent appliquées.
do $$ begin
  alter publication supabase_realtime add table public.questions;
exception when duplicate_object then null;
when undefined_object then null;
end $$;
