# 🎯 MISE À JOUR DES PAGES - Guide rapide

**Date** : 7 octobre 2025  
**Objectif** : Connecter Quiz, Leaderboard et Badges aux vraies données

---

## 📁 FICHIERS À MODIFIER

### 1. QuizList (pages vides)
**Fichier** : `src/pages/QuizList.jsx`  
**Problème** : Affiche "0 quiz disponibles"  
**Solution** : Vérifier la requête Supabase

### 2. Leaderboard (données partielles)
**Fichier** : `src/pages/Leaderboard.jsx`  
**Problème** : Affiche "1 participant" au lieu de 3  
**Solution** : Afficher tous les utilisateurs du classement

### 3. Badges (page vide)
**Fichier** : `src/pages/Badges.jsx`  
**Problème** : Affiche "0 badges obtenus" au lieu de 4  
**Solution** : Connecter à `user_badges` table

---

## 🔧 DIAGNOSTIC ÉTAPE PAR ÉTAPE

### Étape 1 : Vérifier QuizList.jsx

```bash
# Ouvrir le fichier
code src/pages/QuizList.jsx
```

**Ce qu'il faut vérifier** :
- ✅ Import de `supabase` depuis `@/lib/customSupabaseClient`
- ✅ Requête vers table `quizzes`
- ✅ Filtrage par niveau utilisateur (BFEM/BAC)

**Requête attendue** :
```javascript
const { data: quizzes } = await supabase
  .from('quizzes')
  .select(`
    *,
    quiz_questions(count)
  `)
  .order('created_at', { ascending: false });
```

---

### Étape 2 : Vérifier Leaderboard.jsx

```bash
# Ouvrir le fichier
code src/pages/Leaderboard.jsx
```

**Ce qu'il faut vérifier** :
- ✅ Requête vers `user_points`
- ✅ JOIN avec `profiles` pour récupérer les usernames
- ✅ ORDER BY `total_points DESC`
- ✅ LIMIT 10 ou plus

**Requête attendue** :
```javascript
const { data: leaderboard } = await supabase
  .from('user_points')
  .select(`
    *,
    profiles:user_id (
      username,
      avatar_url
    )
  `)
  .order('total_points', { ascending: false })
  .limit(10);
```

**Affichage attendu** :
```
Position 1: opentech (vous) - 1,950 pts - Niveau 5
Position 2: Utilisateur - 30 pts - Niveau 1
Position 3: Utilisateur - 0 pts - Niveau 1
```

---

### Étape 3 : Vérifier Badges.jsx

```bash
# Ouvrir le fichier
code src/pages/Badges.jsx
```

**Ce qu'il faut vérifier** :
- ✅ Requête vers `user_badges` (badges gagnés)
- ✅ Liste complète des badges disponibles
- ✅ Affichage conditionnel (gagné = couleur, verrouillé = gris)

**Requête attendue** :
```javascript
// Badges gagnés
const { data: earnedBadges } = await supabase
  .from('user_badges')
  .select('*')
  .eq('user_id', user.id);

// Liste des badges disponibles (hardcodé ou depuis table badges)
const allBadges = [
  {
    name: 'Apprenant Assidu',
    description: 'Complétez 10 leçons',
    icon: '🎓',
    points: 50,
    rarity: 'Commun'
  },
  {
    name: 'Finisseur',
    description: 'Complétez 5 chapitres',
    icon: '📚',
    points: 100,
    rarity: 'Peu commun'
  },
  // ... autres badges
];
```

**Affichage attendu** :
```
Badges obtenus: 4/12

✅ Apprenant Assidu (Gagné le 05/10/2025)
✅ Finisseur (Gagné le 05/10/2025)
✅ Maître de cours (Gagné le 06/10/2025)
✅ Expert (Gagné le 06/10/2025)
🔒 Premier Pas (À débloquer)
🔒 Chercheur de Savoir (À débloquer)
...
```

---

## 🚀 ACTIONS RAPIDES

### Option A : Diagnostic automatique

```javascript
// Ajouter dans chaque page (temporairement)
useEffect(() => {
  console.log('🔍 DEBUG - User:', user?.id);
  console.log('🔍 DEBUG - Data loaded:', data);
  console.log('🔍 DEBUG - Loading state:', loading);
  console.log('🔍 DEBUG - Error:', error);
}, [user, data, loading, error]);
```

### Option B : Test SQL direct

```sql
-- Test 1: Vérifier les quiz
SELECT COUNT(*) as total_quizzes FROM quizzes;

-- Test 2: Vérifier le classement
SELECT 
  user_id,
  total_points,
  level,
  lessons_completed
FROM user_points
ORDER BY total_points DESC
LIMIT 10;

-- Test 3: Vérifier les badges utilisateur
SELECT 
  badge_name,
  earned_at
FROM user_badges
WHERE user_id = 'b8fe56ad-e6e8-44f8-940f-a9e1d1115097';
-- Résultat attendu: 4 lignes
```

---

## ✅ CHECKLIST DE VALIDATION

### QuizList
- [ ] Import correct de supabase
- [ ] Requête vers table `quizzes`
- [ ] Données affichées dans la console
- [ ] Cartes quiz visibles sur la page

### Leaderboard
- [ ] Import correct de supabase
- [ ] Requête vers `user_points` avec JOIN profiles
- [ ] Au moins 3 utilisateurs affichés
- [ ] Votre position correcte (1ère place)

### Badges
- [ ] Import correct de supabase
- [ ] Requête vers `user_badges`
- [ ] 4 badges affichés comme gagnés (couleur)
- [ ] Autres badges affichés comme verrouillés (gris)
- [ ] Total correct (4/12)

---

## 📝 COMMANDES UTILES

```bash
# Ouvrir VS Code sur les 3 fichiers
code src/pages/QuizList.jsx src/pages/Leaderboard.jsx src/pages/Badges.jsx

# Rechercher les requêtes Supabase
grep -r "supabase.from" src/pages/

# Vérifier les imports
grep -r "import.*supabase" src/pages/

# Redémarrer le serveur de dev
npm run dev
```

---

## 🎯 RÉSULTAT ATTENDU

Après les corrections, les 3 pages devront afficher :

### QuizList
```
X Quiz disponibles
Y Questions au total
Z Minutes de contenu
[Liste des quiz avec cartes cliquables]
```

### Leaderboard
```
🏆 Classement
1,950 pts - Record actuel
3 Participants
#1 Votre position

Top 3:
1. opentech (vous) - 1,950 pts
2. Utilisateur - 30 pts
3. Utilisateur - 0 pts
```

### Badges
```
🏆 Badges et Réalisations
4 Badges obtenus
150 Points de badges
8 À débloquer

[4 badges en couleur]
[8 badges en gris]
```

---

**Prêt à commencer ?** Indiquez-moi par quelle page vous voulez commencer ! 🚀

1. QuizList (le plus simple)
2. Leaderboard (rapide)
3. Badges (le plus important)
