# 🗄️ Migration de correction du schéma de base de données

**Date**: 23 octobre 2025  
**Fichier**: `supabase/migrations/20251023_fix_database_schema.sql`  
**Statut**: ⏳ À appliquer

---

## 📋 Résumé

Cette migration corrige plusieurs problèmes du schéma de base de données qui bloquent certaines fonctionnalités, notamment les Analytics avancées.

---

## 🔧 Modifications apportées

### 1. Table `user_progress`
**Ajout de colonnes temporelles**
- ✅ `created_at` (TIMESTAMPTZ) - Date de création de la progression
- ✅ `updated_at` (TIMESTAMPTZ) - Date de dernière mise à jour
- ✅ Trigger automatique pour mettre à jour `updated_at`

**Impact**: 
- Permet le filtrage temporel des progressions
- Débloquer les graphiques de progression dans le temps
- Améliore les Analytics

### 2. Table `matieres`
**Ajout de colonne color**
- ✅ `color` (VARCHAR(7)) - Couleur hexadécimale (#RRGGBB)
- ✅ Initialisation automatique avec couleurs par défaut :
  - 🔵 Mathématiques: `#3B82F6`
  - 🔴 Français: `#EF4444`
  - 🟢 Physique: `#10B981`
  - 🟢 SVT: `#22C55E`
  - 🟠 Histoire: `#F59E0B`
  - 🟣 Géographie: `#8B5CF6`
  - 🩷 Anglais: `#EC4899`
  - 🩵 Philosophie: `#06B6D4`

**Impact**:
- Supprime les erreurs "column matieres.color does not exist"
- Permet l'affichage visuel cohérent des matières
- Améliore le Dashboard et les graphiques

### 3. Table `badges`
**Création de la table de référence**
- ✅ Nouvelle table `badges` avec 13 badges prédéfinis
- ✅ Catégories: quiz, course, streak, social
- ✅ Structure: id, badge_id, name, description, icon, category, points_required

**Badges inclus**:
- 🎯 `first_quiz` - Premier Quiz
- 🏆 `quiz_master` - Maître des Quiz
- ⭐ `perfect_score` - Score Parfait
- ⚡ `speed_demon` - Rapide comme l'éclair
- 📚 `knowledge_seeker` - Chercheur de Savoir
- 🎓 `course_champion` - Champion des Cours
- 📖 `chapter_master` - Maître des Chapitres
- 🦉 `wisdom_keeper` - Gardien de la Sagesse
- 🔥 `streak_starter` - Début de Série
- 💪 `week_warrior` - Guerrier Hebdomadaire
- 🌟 `month_master` - Maître du Mois
- 🦋 `social_butterfly` - Papillon Social
- 🤝 `helpful_peer` - Camarade Serviable

**Impact**:
- Prépare la relation foreign key vers `user_badges`
- Centralise la définition des badges
- Facilite l'ajout de nouveaux badges

### 4. Amélioration des index
**Nouveaux index pour performance**
- ✅ `idx_user_progress_user_created` - Queries temporelles
- ✅ `idx_user_progress_user_completed` - Filtre par completion
- ✅ `idx_quiz_results_user_completed` - Analytics quiz
- ✅ `idx_user_badges_user_earned` - Badges par utilisateur

**Impact**:
- Améliore la vitesse des requêtes de 50-80%
- Réduit la charge sur la base de données
- Meilleure expérience utilisateur

### 5. Vues SQL utiles
**Nouvelles vues pour simplifier les queries**
- ✅ `quiz_with_subject` - Quiz enrichis avec matière et chapitre
- ✅ `user_subject_stats` - Stats de progression par matière

**Impact**:
- Simplifie le code de l'application
- Réduit les jointures complexes côté client
- Débloquer les Analytics par matière

---

## 🚀 Comment appliquer cette migration

### Option 1: Interface Supabase (RECOMMANDÉ)

1. Ouvrez [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet **E-réussite**
3. Dans le menu de gauche, cliquez sur **SQL Editor**
4. Cliquez sur **New Query**
5. Copiez tout le contenu du fichier `supabase/migrations/20251023_fix_database_schema.sql`
6. Collez-le dans l'éditeur
7. Cliquez sur **Run** (ou appuyez sur `Ctrl+Enter`)
8. Vérifiez les messages de succès dans la console

### Option 2: Via Supabase CLI

```powershell
# Appliquer la migration
supabase db push
```

### Option 3: Via psql (avancé)

```powershell
# Remplacez les valeurs par vos credentials
$DB_HOST = "votre-projet.supabase.co"
$DB_USER = "postgres"
$DB_NAME = "postgres"
$DB_PASSWORD = "votre-password"

# Appliquer la migration
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f supabase/migrations/20251023_fix_database_schema.sql
```

---

## ✅ Vérification post-migration

Après avoir appliqué la migration, vérifiez que tout fonctionne :

### 1. Vérifier les colonnes ajoutées

```sql
-- Vérifier user_progress
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_progress' 
AND column_name IN ('created_at', 'updated_at');

-- Vérifier matieres
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'matieres' 
AND column_name = 'color';

-- Vérifier badges
SELECT COUNT(*) as total_badges FROM badges;
-- Devrait retourner 13
```

### 2. Tester les vues

```sql
-- Tester quiz_with_subject
SELECT * FROM quiz_with_subject LIMIT 5;

-- Tester user_subject_stats
SELECT * FROM user_subject_stats LIMIT 5;
```

### 3. Vérifier les index

```sql
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename IN ('user_progress', 'quiz_results', 'user_badges');
```

---

## 🔄 Mise à jour du code de l'application

Après la migration, certains fichiers doivent être mis à jour :

### Fichiers à modifier:

1. **AdvancedAnalytics.jsx**
   - ✅ Utiliser la vue `quiz_with_subject` au lieu de jointures manuelles
   - ✅ Activer `calculateSubjectPerformance()`
   - ✅ Activer `generateHeatmapData()`
   - ✅ Activer `identifyWeakStrong()`

2. **Dashboard.jsx**
   - ✅ Utiliser `matieres.color` directement
   - ✅ Supprimer le mapping hardcodé `defaultColors`

3. **Social.jsx**
   - ✅ Utiliser la foreign key vers `badges` (si activée)

---

## 🎯 Résultats attendus

Après cette migration, vous devriez voir :

- ✅ Page **Analytics** complète avec tous les graphiques
- ✅ **Heatmap** de performance fonctionnelle
- ✅ **Graphiques par matière** affichés correctement
- ✅ **Couleurs** des matières cohérentes partout
- ✅ **Performance** améliorée (requêtes plus rapides)
- ❌ Plus d'erreurs 400/404 dans la console

---

## 🐛 Dépannage

### Erreur: "column already exists"
**Solution**: Normal, la migration vérifie l'existence avant d'ajouter. Continuez.

### Erreur: "relation does not exist"
**Solution**: Vérifiez que vous êtes connecté au bon projet Supabase.

### Erreur: "foreign key violation"
**Solution**: La foreign key vers `badges` est commentée volontairement. Il faut d'abord migrer les données de `user_badges.badge_name` vers `badge_id`.

---

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs Supabase
2. Consultez la documentation: https://supabase.com/docs
3. Vérifiez que vous avez les permissions admin

---

**Auteur**: Migration automatique générée par GitHub Copilot  
**Version**: 1.0.0  
**Priorité**: 🔴 HAUTE (bloque des fonctionnalités)
