# 🐛 GUIDE DE DÉPANNAGE RAPIDE - Quiz Interactif

**Date** : 14 octobre 2025

---

## ❌ PROBLÈME 1 : Réponse correcte marquée "Incorrect"

### Symptômes
- Tu cliques sur "Dakar" (bonne réponse)
- Le système affiche "❌ Incorrect"
- Fond rouge au lieu de vert

### Diagnostic
```bash
# Vérifie que les fichiers sont bien sauvegardés
git status
```

### Solutions

**Solution A** : Redémarrer le serveur
```bash
# Arrête le serveur (Ctrl+C dans le terminal)
# Relance
npm run dev
```

**Solution B** : Vider le cache du navigateur
```
1. Ouvre DevTools (F12)
2. Onglet "Network"
3. Coche "Disable cache"
4. Recharge la page (Ctrl+F5)
```

**Solution C** : Vérifier le code source dans le navigateur
```
1. Ouvre DevTools (F12)
2. Onglet "Sources"
3. Cherche "InteractiveQuiz.jsx"
4. Va à la ligne 216
5. Vérifie : const isCorrect = index === currentQuestion.correct_answer;
```

---

## ❌ PROBLÈME 2 : Pas de feedback du Coach IA

### Symptômes
- Quiz terminé
- Toast apparaît
- Mais aucun message dans la conversation

### Diagnostic
```javascript
// Ouvre DevTools (F12) → Console
// Cherche ces messages :
// ✅ "Session terminée: ..."
// ❌ "Erreur ajout message coach: ..."
```

### Solutions

**Solution A** : Vérifie la conversation active
```
1. Dans DevTools (F12) → Console
2. Tape : localStorage.getItem('currentConversationId')
3. Si null → Pas de conversation créée
```

**Solution B** : Recharge la page avant de lancer le quiz
```
1. Va sur /coach-ia
2. Recharge (F5)
3. Lance le quiz
4. Termine
5. Vérifie le message
```

**Solution C** : Vérifie Supabase
```
1. Va sur Supabase Dashboard
2. Table Editor → ai_conversations
3. Vérifie qu'il y a des conversations pour ton user_id
4. Table Editor → ai_messages
5. Vérifie les messages après le quiz
```

---

## ❌ PROBLÈME 3 : Erreur "Table doesn't exist"

### Symptômes
```
Error: relation "interactive_quiz_sessions" does not exist
```

### Solution
```sql
-- Le schema SQL n'a pas été exécuté
-- Va sur Supabase Dashboard → SQL Editor
-- Copie le contenu de database/QUIZ_INTERACTIF_SCHEMA.sql
-- Exécute-le
```

---

## ❌ PROBLÈME 4 : Score ne s'incrémente pas

### Symptômes
- Réponse correcte validée (✅ vert)
- Mais score reste à 0/50

### Diagnostic
```javascript
// Dans InteractiveQuiz.jsx, vérifie le hook
const { score, ... } = useInteractiveQuiz(...);
console.log('Score actuel:', score); // Doit augmenter
```

### Solution
```javascript
// Vérifie dans useInteractiveQuiz.js ligne ~260
// Que submitAnswer incrémente bien le score
if (isCorrect) {
  setScore(prev => prev + 10); // ← Cette ligne doit être présente
}
```

---

## ❌ PROBLÈME 5 : Badge non débloqué malgré 80%+

### Symptômes
- Score ≥ 80%
- Mais message dit "Pas de badge"

### Diagnostic
```sql
-- Vérifie dans Supabase SQL Editor
SELECT * FROM interactive_quiz_sessions 
WHERE user_id = 'TON_USER_ID' 
ORDER BY created_at DESC 
LIMIT 1;

-- Vérifie la colonne badge_unlocked
```

### Solution
```javascript
// Vérifie dans useInteractiveQuiz.js ligne ~290
// Fonction calculateFinalStats
const badgeUnlocked = percentage >= 80 ? {
  name: 'Quiz Master',
  icon: '🏆',
  description: 'Score ≥ 80%'
} : null;
```

---

## 🔍 COMMANDES DE DEBUG UTILES

### Vérifier l'état du quiz en cours
```javascript
// Dans DevTools Console pendant le quiz
// Copie-colle et exécute :
const quizState = {
  questions: window.__quizQuestions,
  currentIndex: window.__currentQuestionIndex,
  score: window.__quizScore,
  answers: window.__userAnswers
};
console.table(quizState);
```

### Vérifier les données Supabase
```sql
-- Sessions récentes
SELECT id, user_id, status, score, score_percentage, created_at 
FROM interactive_quiz_sessions 
WHERE user_id = 'TON_USER_ID' 
ORDER BY created_at DESC 
LIMIT 5;

-- Questions d'une session
SELECT question_text, user_answer, is_correct 
FROM interactive_quiz_questions 
WHERE session_id = 'SESSION_ID';

-- Messages Coach IA
SELECT role, content, created_at 
FROM ai_messages 
WHERE conversation_id = 'CONVERSATION_ID' 
ORDER BY created_at DESC 
LIMIT 5;
```

### Forcer un message de test du Coach IA
```javascript
// Dans DevTools Console
// Teste si sendMessage fonctionne
sendMessage('Test message automatique 🤖', { isSystemMessage: true });
```

---

## 📞 SI RIEN NE FONCTIONNE

### Étape 1 : Vérifier les logs serveur
```bash
# Terminal où tourne npm run dev
# Cherche les erreurs en rouge
```

### Étape 2 : Vérifier les logs navigateur
```
1. F12 → Console
2. Cherche les erreurs rouges
3. Copie le message d'erreur complet
```

### Étape 3 : Réinitialiser complètement
```bash
# Arrête le serveur
Ctrl+C

# Vide le cache npm
npm cache clean --force

# Réinstalle les dépendances
rm -rf node_modules
npm install

# Relance
npm run dev
```

### Étape 4 : Vérifie les versions
```bash
node --version  # Doit être ≥ 16
npm --version   # Doit être ≥ 8
```

---

## ✅ CHECKLIST DE VALIDATION

Après chaque correction, vérifie :

- [ ] Serveur redémarré (`npm run dev`)
- [ ] Page rechargée (Ctrl+F5)
- [ ] Cache navigateur vidé
- [ ] Console sans erreurs (F12)
- [ ] User connecté (vérifie icône profil)
- [ ] Conversation créée (vérifie barre latérale)
- [ ] Schema SQL exécuté (vérifie tables dans Supabase)

---

## 📱 CONTACT RAPIDE

Si problème persistant :
1. Copie l'erreur exacte de la console (F12)
2. Fais un screenshot du problème
3. Note ce que tu as testé
4. Dis-moi et je t'aide !

---

**Dernière mise à jour** : 14 octobre 2025  
**Status** : Prêt pour dépannage rapide 🛠️
