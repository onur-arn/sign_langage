# Configuration de la base de données PostgreSQL

## Option 1 : Neon (Recommandé - Gratuit)

### 1. Créer un compte gratuit
- Va sur [neon.tech](https://neon.tech)

- Connecte-toi avec GitHub

### 2. Créer une base de données
- Clique sur "Create a project"

- Région: Choisir la plus proche (ex: Frankfurt pour l'Europe)
- PostgreSQL version: 16 (par défaut)

### 3. Récupérer les URLs de connexion
Une fois créé, tu verras deux URLs :
```
DATABASE_URL=postgresql://username:password@host.neon.tech/dbname?sslmode=require
DIRECT_URL=postgresql://username:password@host.neon.tech/dbname?sslmode=require
```

### 4. Configurer ton projet
1. Copie ces URLs dans ton fichier `.env`
2. Exécute les commandes suivantes :
```bash
npx prisma generate
npx prisma db push
npm run seed
```

## Option 2 : Vercel Postgres

### Si tu déploies sur Vercel :
1. Va dans ton projet Vercel
2. Onglet "Storage" → "Create Database" → "Postgres"
3. Vercel va automatiquement créer les variables d'environnement
4. En local, récupère les variables avec :
```bash
vercel env pull .env.local
```

## Option 3 : Supabase

### 1. Créer un compte
- Va sur [supabase.com](https://supabase.com)
- Clique sur "Start your project"

### 2. Créer un projet

- Database password: (génère un mot de passe fort)
- Region: (la plus proche)

### 3. Récupérer l'URL de connexion
- Va dans Settings → Database
- Section "Connection string" → Mode "Session"
- Copie l'URL et remplace `[YOUR-PASSWORD]` par ton mot de passe

## Déploiement en production

### Sur Vercel :
1. Crée une base de données Vercel Postgres
2. Les variables d'environnement seront automatiquement configurées
3. Ajoute ces commandes dans vercel.json (si nécessaire) :
```json
{
  "buildCommand": "npx prisma generate && npx prisma db push && npm run build"
}
```

### Variables d'environnement en production :
N'oublie pas d'ajouter dans les settings Vercel :
- `DATABASE_URL` (fourni automatiquement par Vercel Postgres)
- `DIRECT_URL` (fourni automatiquement par Vercel Postgres)
- `NEXTAUTH_SECRET` (ton secret NextAuth)
- `NEXTAUTH_URL` (l'URL de ton site en production)

## Migrations

### Pour créer une migration :
```bash
npx prisma migrate dev --name nom_de_la_migration
```

### Pour appliquer en production :
```bash
npx prisma migrate deploy
```

## Troubleshooting

### Erreur "Can't reach database server"
- Vérifie que ton IP est autorisée (Neon/Supabase autorisent toutes les IPs par défaut)
- Vérifie que l'URL contient `?sslmode=require`

### Erreur "SSL connection required"
- Ajoute `?sslmode=require` à la fin de ton URL

### En développement, je veux utiliser SQLite
Modifie le [schema.prisma](prisma/schema.prisma) :
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```
Puis `npx prisma generate && npx prisma db push`
