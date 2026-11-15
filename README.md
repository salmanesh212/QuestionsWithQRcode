# QR Questions — Questions et QCM interactifs

Application web générique qui permet à un public de scanner un QR code pour poser
une question, participer à un QCM ou contribuer à une discussion depuis son
téléphone, sans compte ni connexion.

Le projet n'est lié à aucun club, école ou événement particulier. Il peut être
utilisé pour une conférence, une formation, un cours, un atelier, une réunion,
un événement associatif ou toute autre activité nécessitant des questions
interactives. Le nom, le logo, les couleurs et les textes peuvent être adaptés
au thème de chaque organisation.

## Fonctionnement

### 1. Écran principal — `/`

Affiche le titre de l'activité, un QR code et l'adresse publique à scanner.
L'adresse est construite depuis `NEXT_PUBLIC_SITE_URL` et pointe vers le
formulaire participant de l'événement sélectionné.

### 2. Formulaire participant — `/user`

Le participant scanne le QR code, écrit une question de 5 à 300 caractères et
peut ajouter son prénom ou rester anonyme. Le formulaire est mobile-first et
ne demande aucun compte. La route `/question` reste disponible comme alias de
compatibilité.

### 3. Administration — `/admin`

L'administration protégée permet de :

- créer plusieurs activités et choisir celle affichée sur l'écran principal ;
- personnaliser le titre et l'intervenant ;
- générer un QR code en PNG ou SVG ;
- consulter les questions reçues en temps réel ;
- approuver, masquer, supprimer, épingler ou marquer une question comme répondue ;
- activer la modération préalable et régler les limites anti-spam ;
- exporter les questions en CSV ;
- projeter une question approuvée avec `/ecran?code=...`.

## Personnalisation du thème

La structure fonctionnelle reste la même, quel que soit le contexte
d'utilisation. Pour adapter l'application à une organisation, remplacez
notamment :

- le nom et le logo dans les composants de marque ;
- les couleurs et les polices dans `src/app/globals.css` et `src/app/layout.tsx` ;
- les textes de présentation dans les pages et composants de l'interface ;
- les titres, intervenants et événements depuis `/admin`.

Ainsi, la même base peut devenir une application de questions pour une
conférence, un outil de QCM pour une classe ou une plateforme d'interaction
pour un événement.

## Installation

Prérequis : Node.js 20+ et npm.

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Renseignez les variables d'environnement et appliquez `supabase/schema.sql`
avant d'utiliser les fonctionnalités connectées aux données.

Commandes de vérification et de production :

```bash
npm run lint
npm run build
npm start
```

## Variables d'environnement

| Variable | Utilisation |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | URL HTTPS publique du site, sans barre oblique finale. Les QR codes sont construits depuis cette valeur. |
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique anon, limitée par les règles RLS. |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé secrète serveur, uniquement pour les routes et pages serveur. |
| `ADMIN_PASSWORD` | Mot de passe de l'administration. |
| `SESSION_SECRET` | Secret aléatoire d'au moins 32 caractères pour signer la session. |

Ne publiez jamais `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD` ou
`SESSION_SECRET`. Le fichier `.env.local` est ignoré par Git.

## Supabase et déploiement

1. Créez un projet Supabase et exécutez `supabase/schema.sql` dans le SQL Editor.
2. Copiez l'URL, la clé `anon` et la clé `service_role` dans `.env.local`.
3. Importez le dépôt dans Vercel comme projet Next.js.
4. Ajoutez les six variables d'environnement dans Vercel pour les environnements
   nécessaires, puis redéployez.
5. Ouvrez `/admin`, créez une activité et choisissez-la pour l'affichage.
6. Vérifiez le scan du QR depuis un téléphone et testez l'envoi d'une question.

Pour tester avec un téléphone en développement, utilisez une URL HTTPS
publiquement accessible. N'utilisez pas `localhost` dans `NEXT_PUBLIC_SITE_URL`.

## Sécurité et limites

- Les écritures passent par les routes API serveur.
- Les questions publiques sont limitées aux contenus approuvés.
- L'anti-spam utilise un cookie d'appareil, des limites par appareil et par IP,
  un honeypot et un délai minimal avant l'envoi.
- L'administration utilise un cookie de session signé et une limitation des
  tentatives de connexion.
- Le vote public n'est pas activé dans cette version ; les votes affichés dans
  l'administration servent uniquement de statistique.

## Structure du projet

- `src/app/page.tsx` : écran principal et QR code.
- `src/app/user/page.tsx` : formulaire participant.
- `src/app/admin/page.tsx` et `src/components/admin-*` : administration.
- `src/app/ecran/page.tsx` et `src/components/screen-view.tsx` : projection.
- `src/app/api` : envoi, quotas, authentification et modération.
- `src/lib` : Supabase, session, types et utilitaires.
- `supabase/schema.sql` : tables, index, RLS, Realtime et limites atomiques.
