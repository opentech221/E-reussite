# 🔧 CORRECTION - Stats Dashboard manquantes

**Date** : 8 octobre 2025  
**Problème** : Certaines stats ne s'affichent pas correctement

---

## ❌ **PROBLÈMES IDENTIFIÉS**

### 1. **"0 jours consécutifs"**
- **Cause** : Récupère depuis `gamification.streakDays` qui est 0
- **Solution** : Utiliser `user_points.current_streak` à la place

### 2. **"0% de moyenne"**
- **Cause** : Le calcul `averageScore` est hardcodé à 0 ligne 176
- **Solution** : Calculer la vraie moyenne des quiz + examens

### 3. **"Aucun quiz réalisé" par matière**
- **Cause** : Le calcul par matière ne compte pas les quiz de la table `quiz_results`
- **Solution** : Joindre `quiz_results` avec les chapitres/matières

---

## 🔧 **CORRECTIONS À APPLIQUER**

### **Correction 1 : Streak (jours consécutifs)**

**Fichier** : `src/pages/Dashboard.jsx` ligne ~603

```javascript
// ❌ AVANT
currentStreak: gamification?.streakDays || 0,

// ✅ APRÈS
currentStreak: userPointsData?.current_streak || 0,
```

**Ajout nécessaire** : Récupérer `user_points` plus tôt dans la fonction

```javascript
// Ligne ~430, ajouter :
const { data: userPointsData } = await supabase
  .from('user_points')
  .select('current_streak, longest_streak, quizzes_completed')
  .eq('user_id', user.id)
  .single();
```

---

### **Correction 2 : Score moyen**

**Fichier** : `src/pages/Dashboard.jsx` ligne ~176 et ~600

```javascript
// ❌ AVANT (ligne 176)
const averageScore = 0;

// ✅ APRÈS - Calculer la vraie moyenne
const averageScore = await calculateAverageScore(userId);

// Fonction à ajouter :
const calculateAverageScore = async (userId) => {
  // 1. Moyenne des quiz
  const { data: quizResults } = await supabase
    .from('quiz_results')
    .select('score')
    .eq('user_id', userId);
  
  // 2. Moyenne des examens  
  const { data: examResults } = await supabase
    .from('exam_results')
    .select('score')
    .eq('user_id', userId);
  
  const allScores = [
    ...(quizResults || []).map(r => r.score),
    ...(examResults || []).map(r => r.score)
  ];
  
  if (allScores.length === 0) return 0;
  
  const avg = allScores.reduce((sum, score) => sum + score, 0) / allScores.length;
  return Math.round(avg);
};
```

---

### **Correction 3 : "Aucun quiz réalisé" par matière**

**Fichier** : `src/pages/Dashboard.jsx` ligne ~145-185

Le code récupère la progression par matière mais ne compte pas les quiz.

```javascript
// Ajouter après avoir récupéré les chapitres de la matière :

// Compter les quiz réalisés pour cette matière
const quizIds = allChapitres.map(c => c.id);

const { data: quizzesDone, error: quizError } = await supabase
  .from('quiz_results')
  .select('quiz_id, quiz!inner(chapitre_id)')
  .eq('user_id', userId)
  .in('quiz.chapitre_id', quizIds);

const quizCount = quizzesDone?.length || 0;

// Dans le return :
return {
  ...matiereData,
  quizzesCompleted: quizCount  // Ajouter cette ligne
};
```

---

## 🚀 **SOLUTION RAPIDE : SQL pour vérifier**

Vous pouvez vérifier vos vraies stats avec :

```sql
-- Votre streak actuel
SELECT current_streak, longest_streak 
FROM user_points 
WHERE user_id = auth.uid();

-- Votre score moyen (quiz + examens)
WITH all_scores AS (
  SELECT score FROM quiz_results WHERE user_id = auth.uid()
  UNION ALL
  SELECT score FROM exam_results WHERE user_id = auth.uid()
)
SELECT 
  COUNT(*) as total_tests,
  ROUND(AVG(score)) as average_score
FROM all_scores;

-- Quiz par matière
SELECT 
  m.name as matiere,
  COUNT(DISTINCT qr.id) as quiz_count
FROM quiz_results qr
JOIN quiz q ON q.id = qr.quiz_id
JOIN chapitres c ON c.id = q.chapitre_id
JOIN matieres m ON m.id = c.matiere_id
WHERE qr.user_id = auth.uid()
GROUP BY m.name;
```

---

## ⏱️ **TEMPS ESTIMÉ POUR CORRECTIONS**

| Correction | Difficulté | Temps |
|------------|------------|-------|
| 1. Streak | ⭐ Facile | 10 min |
| 2. Score moyen | ⭐⭐ Moyen | 20 min |
| 3. Quiz par matière | ⭐⭐⭐ Difficile | 30 min |
| **TOTAL** | | **~1h** |

---

## 💡 **RECOMMANDATION**

**Option A** : Je peux faire ces corrections maintenant (1h)  
**Option B** : On continue avec ce qui marche et on corrige ça plus tard  
**Option C** : Vous testez d'abord un quiz pour voir si tout le reste marche bien

**Que préférez-vous ?** 🤔
