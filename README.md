# Comité Social ESITH — Questions de conférence

Application web en français : le public pose des questions depuis son téléphone, sans compte. L’application est organisée en trois parties distinctes.

## Les trois parties

### 1. Page principale projetée — `/`

Affiche en plein écran le titre et l’intervenant de l’événement mis en avant, un grand QR code et l’adresse lisible à scanner. L’adresse encodée est toujours absolue et construite depuis `NEXT_PUBLIC_SITE_URL`, suivie de `/question?code=...`. La page ne contient aucun lien ou accès à l’administration.

L’événement mis en avant se choisit dans `/admin` avec le bouton **Afficher sur la page principale**. S’il n’y en a pas encore, l’événement le plus récemment créé est utilisé.

### 2. Page question — `/question`

Le QR ouvre `/question?code=CODE-EVENEMENT`. Le formulaire est mobile-first, sans compte, connexion ou captcha. Le participant écrit une question de 5 à 300 caractères, ajoute éventuellement son prénom, ou reste anonyme. Après l’envoi, une confirmation permet d’en poser une autre. La fermeture de réception affiche **Les questions sont closes**.

La route historique `/e/[code]` redirige vers la nouvelle adresse `/question?code=...` afin de ne pas invalider d’anciens QR. La page ne comporte aucun lien vers l’administration.

Les envois passent par une route API serveur. L’anti-spam vérifie un cookie d’appareil, une limite d’un envoi par 30 secondes et le maximum par appareil configurable pour chaque événement, un plafond IP de 10 envois en 10 minutes, un honeypot, une attente minimale de 3 secondes, la longueur et le contenu nettoyé de la question.

### 3. Administration cachée — `/admin`

Cette URL n’est liée depuis aucune page publique. Elle demande `ADMIN_PASSWORD` et utilise un cookie de session signé, `httpOnly`, `SameSite=Strict` et `Secure` en production, valable 12 heures. Cinq erreurs de mot de passe depuis la même adresse IP pseudonymisée bloquent les essais pendant 15 minutes. La page porte `noindex` et `/robots.txt` exclut `/admin` et `/api/`.

L’administration permet de créer des événements, modifier titre/intervenant, choisir l’événement projeté, créer/imprimer un QR en PNG ou SVG, consulter les questions avec actualisation en direct et rafraîchissement de secours, les approuver/masquer/supprimer/épingler/marquer comme répondues, ouvrir ou fermer la réception, activer la modération préalable, régler le quota par appareil, exporter le CSV et ouvrir `/ecran?code=...` pour projeter une question épinglée.

## Installation et commandes

Prérequis : Node.js 20+ et npm. Pour le développement local :

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Renseignez les variables ci-dessous et appliquez `supabase/schema.sql` avant d’utiliser les pages connectées aux données. Contrôles et serveur de production :

```bash
npm run lint
npm run build
npm start
```

## Variables d’environnement

| Variable | Utilisation |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Origine HTTPS publique du site, sans barre oblique finale, par exemple `https://comite-social.vercel.app`. Le QR est construit depuis cette valeur, jamais depuis `localhost`. |
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique anon, limitée par les règles RLS pour lecture/Realtime. |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé secrète serveur, uniquement pour les routes et pages serveur. Ne jamais l’exposer dans le navigateur. |
| `ADMIN_PASSWORD` | Mot de passe fort pour `/admin`. |
| `SESSION_SECRET` | Secret aléatoire d’au moins 32 caractères pour signer la session et créer les empreintes pseudonymisées. |

Générez un secret avec `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`. `.env.local` est ignoré par Git.

Pour tester le scan depuis un téléphone pendant le développement, configurez `NEXT_PUBLIC_SITE_URL` avec une URL HTTPS publiquement accessible qui pointe vers votre instance (par exemple un tunnel de développement). Ne mettez pas `localhost` dans cette variable : le téléphone ne pourrait pas joindre l’ordinateur via cette adresse.

## Supabase et déploiement Vercel

1. Créez un projet Supabase, puis dans **SQL Editor**, exécutez le fichier `supabase/schema.sql`. Il crée les tables `events`, `questions`, `settings`, les tables de quotas et de tentatives admin, les index, la fonction SQL de limitation et les règles RLS. Si le schéma avait déjà été appliqué, réexécutez le fichier pour installer la limitation des tentatives admin.
2. Dans **Project Settings → API**, copiez l’URL du projet, la clé `anon` et la clé `service_role`. Renseignez les variables dans `.env.local` pour le développement.
3. Dans Vercel, importez le dépôt comme projet **Next.js** et ajoutez les six variables du tableau aux environnements appropriés. `NEXT_PUBLIC_SITE_URL` doit être l’URL HTTPS finale utilisée par les participants. Redéployez après une modification de cette variable.
4. Ouvrez `/admin` directement, connectez-vous, créez l’événement, modifiez le titre/intervenant si besoin, puis cliquez **Afficher sur la page principale**. Vérifiez `/` et scannez le QR avec un téléphone hors Wi-Fi local.
5. En production, testez l’envoi, la modération sans rechargement, l’épinglage sur `/ecran?code=...`, puis la fermeture de réception.

## Guide du jour J

1. Ouvrir `/admin` directement et se connecter.
2. Créer l’événement, vérifier le titre et l’intervenant, puis le choisir pour l’affichage principal.
3. Projeter `/` en plein écran : le QR et l’adresse `/question?code=...` apparaissent au centre. En alternative, l’admin peut télécharger le PNG pour une impression rapide ou le SVG pour une impression redimensionnable.
4. Laisser la réception ouverte. Activer la modération préalable si chaque question doit être validée avant publication.
5. Modérer les questions dans le tableau de bord. Utiliser l’export CSV si nécessaire. Ouvrir l’écran projecteur depuis l’admin et épingler une question approuvée.
6. Fermer la réception à la fin de la conférence.

## Hypothèses et limites

- L’événement projeté est un réglage global : un seul événement apparaît sur `/` à la fois. Sans sélection explicite, le plus récent est utilisé.
- Les limites reposent sur des tables et fonctions SQL atomiques Supabase pour fonctionner en serverless sur Vercel. Les adresses IP sont hachées avec `SESSION_SECRET`; elles ne sont pas stockées en clair. Vercel doit fournir un `x-forwarded-for` fiable.
- Le verrouillage du mot de passe est partagé par adresse IP (après hachage) et nécessite le schéma SQL à jour. Des personnes partageant la même IP partagent aussi ce verrouillage.
- Le filtre de mots inappropriés est une liste française modifiable dans `src/lib/utils.ts`; il peut être adapté au contexte de l’événement.
- Les lectures publiques Supabase sont limitées aux questions approuvées. Toutes les écritures passent par les routes serveur avec la clé `service_role`.
- Le tri par votes et le compteur existent dans l’admin, mais cette version n’expose pas de vote public.

## Structure du projet

- `src/app/page.tsx` : page principale projetée et QR absolu.
- `src/app/question/page.tsx` : formulaire participant.
- `src/app/admin/page.tsx` et `src/components/admin-*` : administration protégée.
- `src/app/ecran/page.tsx` et `src/components/screen-view.tsx` : affichage de la question épinglée.
- `src/app/api` : API d’envoi, quotas, authentification et modération.
- `src/lib` : clients Supabase, session, sélection de l’événement et utilitaires.
- `supabase/schema.sql` : tables, index, RLS, Realtime et limites atomiques.

## Refonte de l’interface (novembre 2026)

Hypothèses retenues : le logo joint au brief est la source de marque à utiliser et a été converti en PNG pour l’interface. Le fichier source fourni est un JPEG compressé ; le relevé des aplats donne un bleu dominant `#02557D` et un vert `#C0D800`. Le bleu profond `#0A3F5F` est conservé pour les titres et les textes sur fond vert afin de maintenir le contraste. Le vert sert d’accent ou de fond de bouton, jamais de texte sur blanc. Les polices Poppins, Inter et Cairo sont chargées avec `next/font`.

La navigation d’administration est composée de liens d’ancrage vers les sections déjà prises en charge. Les opérations d’événement, les QR, l’export, les règles de modération et les flux Realtime continuent d’utiliser les routes API et clients existants. Aucun endpoint ni schéma de données n’a été modifié dans cette passe de présentation.

Fichiers modifiés ou ajoutés pour cette passe :

- `public/logo.png` : logo fourni converti en PNG.
- `src/app/globals.css` : tokens, composants visuels, responsive, focus, mouvements réduits et styles des trois zones.
- `src/app/layout.tsx` : polices et icônes globales.
- `src/app/page.tsx` : écran QR de projection.
- `src/app/question/page.tsx` et `src/components/participant-form.tsx` : en-tête, formulaire mobile, états accessibles et SEO noindex.
- `src/components/admin-login.tsx` et `src/components/admin-panel.tsx` : identité de connexion et navigation admin responsive.
- `src/components/screen-view.tsx` et `src/app/ecran/page.tsx` : écran question plein format.
- `src/components/brand.tsx` : identité de marque et décoration en vagues.
