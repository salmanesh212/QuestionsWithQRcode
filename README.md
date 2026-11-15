# Comité Social ESITH — Questions en direct

Application web en français permettant au public de poser une question depuis un QR code, sans compte ni connexion. L’équipe du Comité Social gère les événements et modère les questions depuis `/admin`. L’écran plein format se trouve sur `/ecran?code=CODE-EVENEMENT`.

## Fonctionnalités

- Formulaire mobile public avec prénom facultatif, anonymat, compteur de caractères et confirmation d’envoi.
- Modération préalable facultative, approbation, masquage, suppression, épinglage et statut « répondue ».
- Actualisation Supabase Realtime pour les questions approuvées et rafraîchissement de secours régulier côté administration pour les files en attente.
- QR code d’événement exportable en PNG ou SVG, CSV des questions et statistiques simples.
- Anti-spam serveur : cookie appareil anonyme, attente minimale de 3 secondes, champ honeypot, 1 envoi par 30 secondes, limite par appareil réglable et plafond IP de 10 envois par tranche de 10 minutes.
- Pas de Supabase Auth. L’administration utilise un mot de passe et un cookie de session signé, limité à 12 heures.

## Prérequis

- Node.js 20 ou plus récent et npm.
- Un projet Supabase gratuit.

## Installation locale

```bash
npm install
Copy-Item .env.example .env.local
```

Renseignez les valeurs de `.env.local` (voir ci-dessous), puis démarrez le serveur :

```bash
npm run dev
```

Visitez [http://localhost:3000](http://localhost:3000), puis ouvrez `/admin` pour créer un événement.

Commandes de production : `npm run lint`, `npm run build`, puis `npm start`.

## Variables d’environnement

| Variable | Usage |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique anon, utilisée uniquement par le navigateur pour Realtime/lecture publique. |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé serveur pour les routes Next.js. Ne jamais la publier ni la préfixer `NEXT_PUBLIC_`. |
| `ADMIN_PASSWORD` | Mot de passe unique de l’administration. |
| `SESSION_SECRET` | Valeur aléatoire longue utilisée pour signer les cookies et pseudonymiser les limites. |
| `NEXT_PUBLIC_APP_URL` | Origine du site, par exemple `http://localhost:3000` ou l’URL Vercel de production. Sans barre oblique finale. |

Générez un secret local avec `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`. `.env.local` est ignoré par Git.

## ÉTAPES MANUELLES POUR MOI

1. Créer un compte sur Supabase et un projet dans la région la plus proche des participants (Maroc/Europe si disponible). Garder l’URL du projet et ses clés à portée de main.
2. Dans Supabase, ouvrir **SQL Editor**, créer une requête, coller le contenu de `supabase/schema.sql`, puis l’exécuter. Vérifier que les tables `events`, `questions`, `settings`, `device_limits` et `ip_limits` sont créées.
3. Dans **Project Settings → API**, copier l’URL, la clé `anon` publique et la clé `service_role` secrète. Dans le dossier du projet, copier `.env.example` vers `.env.local` puis renseigner toutes les variables. Choisir un vrai mot de passe admin et un `SESSION_SECRET` aléatoire.
4. Lancer localement `npm install`, `npm run dev`, vérifier `/admin` et créer un événement de test. Pour les usages locaux sans Supabase configuré, les pages nécessitent néanmoins un projet fonctionnel.
5. Sur Vercel, créer un nouveau projet en important ce dossier (ou son dépôt Git), framework **Next.js**, puis ajouter les six variables d’environnement dans **Settings → Environment Variables** pour Production, Preview et Development selon le besoin. `NEXT_PUBLIC_APP_URL` doit être l’URL publique exacte de la production.
6. Déployer sur Vercel. Tester le lien QR sur un téléphone en réseau mobile : envoyer une question, la modérer dans `/admin`, puis épingler une question et vérifier `/ecran?code=...`.
7. Pour un domaine personnalisé, le configurer dans Vercel, mettre à jour `NEXT_PUBLIC_APP_URL`, puis redéployer afin que les QR codes utilisent la bonne adresse.

## Guide du jour J

1. Ouvrir `/admin` et entrer le mot de passe configuré dans `ADMIN_PASSWORD`.
2. Créer l’événement avec son titre, le nom de l’intervenant et sa date. Le code URL est généré depuis le titre, modifiable à la création, et doit être unique.
3. Dans la carte QR, télécharger le PNG pour une impression simple ou le SVG pour une impression nette à toute taille. Scanner le QR imprimé et vérifier que le formulaire indique le bon événement.
4. Laisser la réception ouverte. Activer **Modération préalable** si les questions doivent être validées avant publication. Les limites par appareil sont réglables à partir de 1 question.
5. Pendant la conférence, approuver les questions, les masquer, les épingler, les marquer comme répondues ou les supprimer. Utiliser la recherche, le filtre et le tri par votes/date. Exporter les questions en CSV au besoin.
6. Ouvrir **Ouvrir le projecteur**, mettre le navigateur en plein écran (F11) et épingler une question approuvée. L’écran se met à jour en direct.
7. Fermer la réception à la fin. La page des participants affichera alors « Les questions sont closes ».

## Hypothèses et limites

- Les quotas IP sont partagés par événement et utilisent `x-forwarded-for`, comme transmis par Vercel. Derrière un proxy différent, vérifier que cet en-tête est fiable.
- Les compteurs reposent sur des tables Supabase et une fonction SQL atomique afin de fonctionner sur Vercel sans stockage local.
- Le filtre d’injures est volontairement limité à une petite liste française modifiable dans `src/lib/utils.ts` ; il faut l’adapter au contexte du club.
- Les questions publiques ne peuvent être lues qu’après approbation, et seulement tant que l’événement reste ouvert. Le tableau de bord utilise la clé serveur via ses routes API.
- La clé service role contourne RLS : la stocker exclusivement dans les variables serveur Vercel et dans `.env.local`, jamais dans le navigateur ni dans Git.
- Le vote est affiché à titre de statistique mais aucun vote public n’est exposé dans cette première version.

## Structure

- `src/app`: pages App Router et API.
- `src/components`: formulaires et interfaces client.
- `src/lib`: accès Supabase, session admin et utilitaires.
- `supabase/schema.sql`: schéma, index, RLS et fonction de quotas.
