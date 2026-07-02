# Sign Language Translator

Application web de traduction en **langue des signes** — convertit du texte, des fichiers PDF ou de la voix en animations d'avatar LSF/ASL/TİD en temps réel.

Cette initiative a été créée pour soutenir les personnes sourdes et malentendantes en rendant la communication plus accessible grâce à la langue des signes. Elle bénéficie également à toute personne ayant des difficultés à communiquer à l'écrit.

Projet soutenu par l'Union Européenne.

Déployé sur [sign-langage.vercel.app](https://sign-langage.vercel.app)

---

## Fonctionnalités

- **Traduction texte → signes** : saisie libre convertie en animation d'avatar
- **Import PDF** : extraction du texte et traduction automatique
- **Entrée vocale** : transcription audio puis traduction
- **Avatar animé** : rendu 3D des signes via `SignAvatarPlayer`
- **Multilingue** : interface en Français, Anglais et Turc
- **Mode sombre** : thème clair/sombre switchable
- **Authentification** : inscription soumise à validation admin (statut PENDING → APPROVED)
- **Panneau admin** : gestion des utilisateurs et des demandes d'accès
- **Dictionnaire de signes** : base de données de signes avec catégories et URLs d'animation
- **Cache de synonymes IA** : optimisation des lookups de synonymes générés par IA

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Framework | Next.js 14 (App Router) |
| Langage | TypeScript |
| Auth | NextAuth.js |
| ORM | Prisma |
| Base de données | PostgreSQL |
| Déploiement | Vercel |
| Styling | CSS Modules / PostCSS |

---

## Architecture

```
sign_langage/
├── app/
│   ├── page.tsx          # Page d'accueil (redirection auth)
│   ├── dashboard/        # Interface principale de traduction
│   ├── admin/            # Panneau d'administration
│   ├── auth/login/       # Authentification
│   └── api/              # Routes API Next.js
├── components/           # Composants React réutilisables
├── contexts/             # Contextes React (langue, thème)
├── hooks/                # Hooks personnalisés
├── lib/                  # Utilitaires partagés
├── prisma/
│   └── schema.prisma     # Modèles : User, Translation, Sign, SynonymCache
└── scripts/              # Scripts utilitaires
```

### Modèles de base de données

- **User** — compte utilisateur avec rôle (`USER` / `ADMIN`) et statut d'approbation
- **Translation** — historique des traductions par utilisateur (texte, PDF, voix)
- **Sign** — dictionnaire de signes avec catégorie et URL d'animation
- **SynonymCache** — cache composite pour les synonymes générés par IA

---

## Installation

```bash
# Cloner le dépôt
git clone https://github.com/onur-arn/sign_langage.git
cd sign_langage

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Renseigner : DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL

# Initialiser la base de données
npx prisma migrate dev

# Lancer le serveur de développement
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

---

## Variables d'environnement

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | URL de connexion PostgreSQL |
| `DIRECT_URL` | URL directe (pour environnements serverless) |
| `NEXTAUTH_SECRET` | Secret JWT pour NextAuth |
| `NEXTAUTH_URL` | URL publique de l'application |

---

## Flux utilisateur

1. L'utilisateur s'inscrit → statut `PENDING`
2. Un admin approuve le compte → statut `APPROVED`
3. L'utilisateur se connecte et accède au dashboard
4. Il saisit du texte / importe un PDF / utilise sa voix
5. L'avatar anime la traduction en langue des signes
