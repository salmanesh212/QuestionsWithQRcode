# Guide agent du projet

## Structure

- `src/app`: routes Next.js App Router, pages `/e/[code]`, `/admin`, `/ecran` et routes `/api`.
- `src/components`: composants d’interface côté client pour participant, administration et projecteur.
- `src/lib`: création des clients Supabase, authentification par cookie signé, types et utilitaires.
- `supabase/schema.sql`: tables, index, règles RLS, publication Realtime et fonction SQL de limitation.

## Commandes

- `npm install`: installer les dépendances.
- `npm run dev`: lancer le serveur de développement.
- `npm run lint`: vérifier le code avec ESLint.
- `npm run build`: compiler pour la production.
- `npm start`: servir la compilation de production.

Configurer `.env.local` depuis `.env.example` avant d’utiliser les pages, et appliquer `supabase/schema.sql` au projet Supabase.

## Conventions importantes

- Toute écriture de données passe par les routes API serveur et le client Supabase service role.
- Ne jamais exposer la clé service role dans un composant client ni dans une variable `NEXT_PUBLIC_*`.
- L’accès public à Supabase est en lecture seule et soumis aux règles RLS ; seuls les contenus approuvés sont lisibles.
- Toute l’interface destinée à l’utilisateur doit rester en français.
