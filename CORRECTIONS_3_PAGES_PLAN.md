# 🔧 Plan de Correction - 3 Pages Dashboard

**Date** : 7 octobre 2025, 02:20 AM  
**Objectif** : Connecter Quiz, Leaderboard et Badges aux vraies données Supabase

---

## 🔍 DIAGNOSTIC

### 1. Badges.jsx ❌ PROBLÈME MAJEUR
**Symptôme** : Affiche "0 badges obtenus" au lieu de 4

**Cause racine** :
```javascript
// Ligne 323 : Utilise dbHelpers (ancienne version)
const badges = await dbHelpers.getUserBadges(user.id);
```

**Problème** :
- `dbHelpers.getUserBadges()` ne retourne pas les vrais badges
- Le fallback mock retourne seulement 3 badges hardcodés
- Ne query PAS la table `user_badges` de Supabase

**Solution** :
```javascript
// Remplacer par query directe Supabase
const { data: badgesData } = await supabase
  .from('user_badges')
  .select('badge_name')
  .eq('user_id', user.id);

// Extraire les noms de badges
const badgeNames = badgesData?.map(b => b.badge_name) || [];
```

---

### 2. Leaderboard.jsx ✅ FONCTIONNE CORRECTEMENT
**Symptôme** : Affiche "1 participant" au lieu de 3

**Analyse du code** :
```javascript
// Lignes 339-388 : Code CORRECT
const { data: profilesData } = await supabase
  .from('profiles')
  .select('id, full_name, avatar_url');

const { data: pointsData } = await supabase
  .from('user_points')
  .select('user_id, total_points, level, current_streak');

// Merge les données pour tous les profils
const enrichedUsers = profilesData.map(profile => {
  const userPoints = pointsData?.find(p => p.user_id === profile.id);
  return {
    id: profile.id,
    display_name: profile.full_name || 'Utilisateur',
    total_points: userPoints?.total_points || 0,
    // ... autres données
  };
});
```

**Conclusion** : ✅ Le code charge bien TOUS les profils

**Vérifications à faire** :
1. Vérifier si la table `profiles` contient 3 entrées
2. Vérifier si les profils sont bien liés aux user_points

**Requête SQL diagnostic** :
```sql
-- Vérifier nombre de profils
SELECT COUNT(*) FROM profiles;

-- Vérifier profils avec leurs points
SELECT 
  p.id, 
  p.full_name,
  COALESCE(up.total_points, 0) as points
FROM profiles p
LEFT JOIN user_points up ON up.user_id = p.id
ORDER BY points DESC;
```

---

### 3. QuizList.jsx ⚠️ VÉRIFICATION NÉCESSAIRE
**Symptôme** : Affiche "0 quiz disponibles"

**Analyse du code** :
```javascript
// Ligne 16 : Utilise dbHelpers.quiz.getQuizzes()
const { data, error } = await dbHelpers.quiz.getQuizzes();
```

**Problème possible** :
- La table `quizzes` est peut-être vide
- Ou le helper ne query pas correctement

**Solution** :
1. **Option A** : Vérifier si la table contient des quiz
2. **Option B** : Remplacer par query directe Supabase si le helper est incorrect

**Requête SQL diagnostic** :
```sql
-- Vérifier nombre de quiz
SELECT COUNT(*) FROM quizzes;

-- Voir tous les quiz
SELECT 
  id, 
  title, 
  chapitre_id,
  difficulty,
  time_limit
FROM quizzes
ORDER BY created_at DESC;
```

**Solution de remplacement** :
```javascript
// Si dbHelpers ne marche pas
const { data: quizzes, error } = await supabase
  .from('quizzes')
  .select(`
    *,
    chapitre:chapitres(nom, matiere_id),
    questions:quiz_questions(count)
  `)
  .order('created_at', { ascending: false });
```

---

## 🎯 ORDRE DE CORRECTION

### Priorité 1 : Badges.jsx (CRITIQUE)
**Temps estimé** : 5 minutes  
**Impact** : ⭐⭐⭐ ÉLEVÉ (4 badges cachés)

**Actions** :
1. Remplacer `dbHelpers.getUserBadges()` par query Supabase directe
2. Mapper les badge_name vers les IDs du dictionnaire BADGE_DEFINITIONS
3. Tester l'affichage

---

### Priorité 2 : Leaderboard.jsx (DIAGNOSTIC)
**Temps estimé** : 5 minutes  
**Impact** : ⭐⭐ MOYEN (affichage cohérence)

**Actions** :
1. Exécuter les requêtes SQL de diagnostic
2. Vérifier le nombre de profils
3. Si nécessaire, créer 2 profils tests supplémentaires

---

### Priorité 3 : QuizList.jsx (VÉRIFICATION)
**Temps estimé** : 10 minutes  
**Impact** : ⭐ FAIBLE (feature bonus)

**Actions** :
1. Exécuter requête SQL pour compter les quiz
2. Si 0 quiz : Créer des quiz de test
3. Si quiz existent : Vérifier le helper dbHelpers.quiz.getQuizzes()
4. Si le helper ne marche pas : Remplacer par query directe

---

## 📝 MAPPING BADGES

### Badges en base de données (user_badges)

| badge_name | Points | Icône | Catégorie |
|------------|--------|-------|-----------|
| Apprenant Assidu | 50 | 🎓 | learning |
| Finisseur | 100 | 📚 | learning |
| Maître de cours | 150 | 🌟 | learning |
| Série d'apprentissage | 30 | 🔥 | consistency |

### Mapping vers BADGE_DEFINITIONS

```javascript
const BADGE_NAME_MAPPING = {
  'Apprenant Assidu': 'knowledge_seeker',        // 10 leçons
  'Finisseur': 'chapter_master',                 // 5 chapitres
  'Maître de cours': 'course_champion',          // 1 cours complet
  'Série d\'apprentissage': 'daily_learner'      // 7 jours
};
```

**Problème** : Les IDs dans BADGE_DEFINITIONS ne correspondent pas aux badge_name !

**Solutions** :
1. **Option A** : Créer un mapping badge_name → badge_id
2. **Option B** : Modifier BADGE_DEFINITIONS pour utiliser les vrais noms
3. **Option C** : Modifier la DB pour utiliser les IDs du code

---

## 🚀 IMPLÉMENTATION

### Badges.jsx - Correction

#### 1. Ajouter le mapping en haut du fichier
```javascript
// Mapping entre les noms de badges en DB et les IDs de définition
const DB_BADGE_MAPPING = {
  'Apprenant Assidu': 'knowledge_seeker',
  'Finisseur': 'chapter_master',
  'Maître de cours': 'course_champion',
  'Série d\'apprentissage': 'daily_learner',
  'Expert': 'wisdom_keeper',
  'Premier Pas': 'first_lesson',
  'Excellence': 'perfect_score',
  'Maître des Quiz': 'quiz_master'
};
```

#### 2. Modifier fetchUserBadges
```javascript
const fetchUserBadges = useCallback(async () => {
  if (!user) {
    setLoading(false);
    return;
  }
  
  try {
    // Query directe Supabase
    const { data: badgesData, error } = await supabase
      .from('user_badges')
      .select('badge_name')
      .eq('user_id', user.id);
    
    if (error) throw error;
    
    // Convertir les badge_name en badge_id
    const badgeIds = badgesData
      ?.map(b => DB_BADGE_MAPPING[b.badge_name])
      .filter(Boolean) || [];
    
    setUserBadges(badgeIds);
    
  } catch (error) {
    console.error('Error fetching badges:', error);
    setUserBadges([]);
  } finally {
    setLoading(false);
  }
}, [user]);
```

---

## ✅ TESTS

### Test Badges
1. Ouvrir http://localhost:3000/badges
2. Vérifier "4 Badges obtenus" (au lieu de 0)
3. Vérifier les 4 badges en couleur :
   - Knowledge Seeker (Apprenant Assidu)
   - Daily Learner (Série d'apprentissage)
   - Chapter Master (Finisseur)
   - Course Champion (Maître de cours)

### Test Leaderboard
1. Ouvrir http://localhost:3000/leaderboard
2. Vérifier "3 Participants" (au lieu de 1)
3. Vérifier le top 3 :
   - 🥇 Position 1 : 1,950 pts
   - 🥈 Position 2 : 30 pts
   - 🥉 Position 3 : 0 pts

### Test Quiz
1. Ouvrir http://localhost:3000/quiz
2. Si "0 quiz" : Exécuter diagnostic SQL
3. Si quiz existent : Vérifier leur affichage

---

## 📊 RÉSULTAT ATTENDU

| Page | Avant | Après |
|------|-------|-------|
| Badges | ❌ 0 badges | ✅ 4 badges obtenus |
| Leaderboard | ⚠️ 1 participant | ✅ 3 participants affichés |
| Quiz | ⚠️ 0 quiz | ✅ Nombre réel de quiz (ou message approprié) |

---

## 🔄 PROCHAINES ÉTAPES

Après corrections :
1. Tester toutes les pages ensemble
2. Vérifier cohérence des données
3. Réclamer les 400 points de défis
4. Compléter 1 leçon pour le défi "Spécialiste" (9/10)

**Temps total estimé** : 20 minutes  
**Impact** : Toutes les pages dashboard afficheront les vraies données
