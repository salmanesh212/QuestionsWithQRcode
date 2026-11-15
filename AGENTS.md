# Guide agent du projet

## Structure

- `src/app/page.tsx`: page principale projetée avec QR absolu vers `/question`.
- `src/app/question`: formulaire public mobile; `/e/[code]` reste un redirect de compatibilité.
- `src/app/admin`: administration sans lien depuis les interfaces publiques, protégée par cookie.
- `src/app/ecran`: écran plein format pour une question épinglée.
- `src/app/api`: routes serveur pour questions, événements, authentification, blocage de tentatives et export.
- `src/components`: composants d’interface participant, administration et projecteur.
- `src/lib`: accès Supabase, sélection d’événement, authentification signée, types et utilitaires.
- `supabase/schema.sql`: tables, index, RLS, Realtime et fonctions atomiques de quotas/login.

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
- Construire toute URL QR depuis `NEXT_PUBLIC_SITE_URL`, jamais depuis l’origine de la requête ou localhost.
- Garder `/admin` absent des liens publics; utiliser aussi `robots.ts` et les métadonnées noindex.
- Toute l’interface destinée à l’utilisateur doit rester en français.
