# 📖 Guide d'exécution - Migration 003 : Gamification

## 🎯 Objectif
Cette migration crée les tables nécessaires pour le système de gamification :
- **user_points** : Points, niveaux, streaks
- **user_progress** : Progression dans les leçons
- **user_badges** : Badges et achievements

## 📋 Étapes d'exécution

### 1️⃣ Accéder à Supabase Dashboard
1. Ouvrez [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet **E-Réussite**
3. Allez dans **SQL Editor** (icône dans le menu de gauche)

### 2️⃣ Exécuter la migration
1. Cliquez sur **New Query**
2. Ouvrez le fichier `003_gamification_tables.sql`
3. Copiez **TOUT le contenu** du fichier
4. Collez dans l'éditeur SQL
5. Cliquez sur **Run** (▶️ en bas à droite)

### 3️⃣ Vérifier la création des tables
Exécutez ces requêtes pour vérifier :

```sql
-- Vérifier user_points
SELECT * FROM user_points LIMIT 5;

-- Vérifier user_progress
SELECT * FROM user_progress LIMIT 5;

-- Vérifier user_badges
SELECT * FROM user_badges LIMIT 5;

-- Lister toutes les tables
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
```

### 4️⃣ Vérifier les politiques RLS
```sql
-- Voir les politiques de user_points
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'user_points';

-- Voir les politiques de user_progress
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'user_progress';

-- Voir les politiques de user_badges
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'user_badges';
```

## ✅ Résultat attendu

Vous devriez voir :
- ✅ 3 nouvelles tables créées
- ✅ 9 politiques RLS créées (3 par table)
- ✅ 1 type ENUM : `badge_type`
- ✅ 4 fonctions utilitaires
- ✅ 2 triggers automatiques

## 🎨 Structure des tables

### Table: `user_points`
| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Identifiant unique |
| `user_id` | UUID | Référence au profil |
| `total_points` | INTEGER | Points totaux |
| `level` | INTEGER | Niveau actuel |
| `points_to_next_level` | INTEGER | Points manquants |
| `current_streak` | INTEGER | Jours consécutifs |
| `longest_streak` | INTEGER | Record de streak |
| `quizzes_completed` | INTEGER | Nombre de quiz |
| `lessons_completed` | INTEGER | Nombre de leçons |

### Table: `user_progress`
| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Identifiant unique |
| `user_id` | UUID | Référence au profil |
| `chapitre_id` | UUID | Référence au chapitre |
| `completed` | BOOLEAN | Leçon terminée ? |
| `progress_percentage` | INTEGER | % de progression |
| `time_spent` | INTEGER | Temps en secondes |

### Table: `user_badges`
| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Identifiant unique |
| `user_id` | UUID | Référence au profil |
| `badge_name` | VARCHAR | Nom du badge |
| `badge_type` | ENUM | Type de badge |
| `badge_description` | TEXT | Description |
| `badge_icon` | VARCHAR | Emoji/icône |
| `earned_at` | TIMESTAMP | Date d'obtention |

## 🔧 Fonctions automatiques

### 1. `calculate_level(points)`
Calcule le niveau en fonction des points.
- 0-99 points → Niveau 1
- 100-399 points → Niveau 2
- 400-899 points → Niveau 3

### 2. `calculate_points_to_next_level(level)`
Calcule les points nécessaires pour le prochain niveau.

### 3. `update_user_level()` (Trigger)
Met à jour automatiquement le niveau quand les points changent.

### 4. `init_user_points()` (Trigger)
Crée automatiquement user_points lors de l'inscription d'un utilisateur.

## 🛡️ Sécurité (RLS)

Toutes les tables ont des politiques RLS pour :
- ✅ Lecture : Utilisateur voit ses propres données + données publiques (classement)
- ✅ Insertion : Uniquement ses propres données
- ✅ Mise à jour : Uniquement ses propres données
- ❌ Suppression : Non autorisée (protection des données)

## 🐛 Dépannage

### Erreur : "relation user_points already exists"
➡️ Les tables existent déjà. Vous pouvez :
1. Ignorer l'erreur (la migration utilise `CREATE TABLE IF NOT EXISTS`)
2. Ou supprimer d'abord : `DROP TABLE IF EXISTS user_points, user_progress, user_badges CASCADE;`

### Erreur : "type badge_type already exists"
➡️ Le type ENUM existe déjà, ignorez l'erreur.

### Erreur : "function calculate_level already exists"
➡️ Utilisez `CREATE OR REPLACE FUNCTION` (déjà fait dans le fichier).

## 📊 Prochaines étapes

Après cette migration :
1. ✅ Tables gamification créées
2. ⏭️ Intégrer dans le code React (attribuer points après quiz)
3. ⏭️ Afficher niveau/badges dans le Dashboard
4. ⏭️ Leaderboard avec vraies données user_points
5. ⏭️ Système d'attribution automatique des badges

## 💡 Notes importantes

- Les points sont attribués via la fonction `completeQuiz()` (déjà existante)
- Le niveau se met à jour automatiquement grâce au trigger
- Les badges seront attribués dans le code React (Phase 2 Étape 3)
- Les streaks nécessiteront une vérification quotidienne (cron job ou cloud function)

---

🎉 **Bonne chance avec la migration !**
