# Configuration PostgreSQL pour Restaurant App

## Étape 1 : Installer PostgreSQL

### Option A : Via l'installeur Windows (recommandé)

1. Téléchargez PostgreSQL 15+ : https://www.postgresql.org/download/windows/
2. Lancez l'installeur `.exe`
3. Suivez l'assistant d'installation :
   - **Port** : `5432` (par défaut)
   - **Utilisateur PostgreSQL** : `postgres`
   - **Mot de passe** : `password` (ou votre choix)
   - **Locale** : `French, France`
4. Cochez la case pour installer **pgAdmin** (optionnel mais utile)

### Option B : Via Chocolatey (si installé)

```powershell
choco install postgresql15
```

### Option C : Via WSL2 + Docker

```bash
docker run --name postgres_restaurant \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=restaurant \
  -p 5432:5432 \
  -d postgres:15-alpine
```

---

## Étape 2 : Vérifier l'installation

Ouvrez PowerShell et testez :

```powershell
psql --version
```

Résultat attendu : `psql (PostgreSQL) 15.x` ou supérieur

---

## Étape 3 : Créer la base de données

Lancez `psql` en tant que superuser :

```powershell
psql -U postgres
```

Vous serez invité à entrer le mot de passe. Tapez ensuite :

```sql
CREATE DATABASE restaurant;
\q
```

Résultat : la base `restaurant` est créée.

---

## Étape 4 : Vérifier la connexion

Testez la connexion avec vos credentials :

```powershell
psql -U postgres -h localhost -d restaurant
```

Si cela fonctionne, vous êtes connecté ✅

---

## Étape 5 : Configurer `.env`

Modifiez votre fichier `.env` dans le projet :

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/restaurant
```

Remplacez `password` par votre mot de passe PostgreSQL réel.

---

## Étape 6 : Exécuter la migration Prisma

Une fois PostgreSQL en cours d'exécution et `.env` configuré :

```powershell
cd c:\Users\hp\restaurant-app
npm run prisma:migrate:dev -- --name init
```

Cela créera toutes les tables dans la base `restaurant` ✅

---

## Commandes utiles PostgreSQL

```powershell
# Se connecter à la base restaurant
psql -U postgres -h localhost -d restaurant

# Lister les tables
\dt

# Voir la structure d'une table
\d Product

# Quitter
\q
```

---

## Dépannage

| Problème | Solution |
|----------|----------|
| `psql: command not found` | PostgreSQL n'est pas dans le PATH. Redémarrez PowerShell après l'installation. |
| `FATAL: password authentication failed` | Le mot de passe est incorrect. Vérifiez `.env` |
| `FATAL: database "restaurant" does not exist` | Créez la base avec `CREATE DATABASE restaurant;` |
| `FATAL: listen() failed` | Le port 5432 est déjà utilisé. Arrêtez l'ancienne instance PostgreSQL. |

---

## Commandes Prisma disponibles

```powershell
npm run prisma:migrate:dev    # Créer/mettre à jour la migration
npm run prisma:migrate:deploy # Déployer les migrations (prod)
npm run prisma:db:push        # Pousser le schéma directement (dev seulement)
npm run prisma:generate       # Regénérer le client Prisma
```

---

## Vérifier que tout fonctionne

Après la migration :

```powershell
npm run dev
```

L'app devrait démarrer sans erreurs Prisma ! 🎉
