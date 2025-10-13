# ✅ GUIDE DE TEST - ASSISTANT IA CONTEXTUEL

**Date** : 8 octobre 2025  
**Objectif** : Valider que l'Assistant IA fonctionne correctement après correction du bug `max_streak`

---

## 🎯 **TESTS À EFFECTUER**

### **TEST 1 : Ouverture de la console et vérification des erreurs** 🔍

**Actions** :
1. Ouvrez votre navigateur sur http://localhost:5173
2. Appuyez sur **F12** pour ouvrir les DevTools
3. Allez dans l'onglet **Console**
4. Appuyez sur **F5** pour rafraîchir la page

**✅ Résultat attendu** :
- Plus d'erreur `column user_points.max_streak does not exist`
- Vous devriez voir des logs comme :
  ```
  🤖 [AIAssistantSidebar] Composant monté
  🔍 [fetchUserRealData] Requête user_points...
  ✅ [fetchUserRealData] user_points: {total_points: X, level: Y, ...}
  ```

**❌ Si vous voyez encore des erreurs** :
- Copiez l'erreur exacte
- Faites Ctrl+Shift+R (hard refresh) pour vider le cache
- Si l'erreur persiste, envoyez-moi le message d'erreur complet

---

### **TEST 2 : Ouverture de l'Assistant IA** 💬

**Actions** :
1. Cherchez le **bouton flottant** en bas à droite de l'écran
   - Il devrait avoir une icône de cerveau (🧠) ou robot
   - Couleur : bleu/violet
2. **Cliquez** sur ce bouton

**✅ Résultat attendu** :
- Un panneau latéral s'ouvre sur le côté droit
- Titre : "Assistant IA Contextuel" ou similaire
- Zone de chat avec un champ de saisie en bas
- Message de bienvenue de l'IA

**❌ Si ça ne marche pas** :
- Le bouton est-il visible ?
- Y a-t-il des erreurs dans la console ?
- Envoyez-moi une capture d'écran

---

### **TEST 3 : Poser une question sur vos données** 📊

**Actions** :
1. Dans le chat, tapez : **"Quels sont mes points actuels ?"**
2. Appuyez sur **Entrée** ou cliquez sur le bouton Envoyer
3. Attendez la réponse (peut prendre 3-5 secondes)

**✅ Résultat attendu** :
- L'IA répond avec VOS vrais points (ex: "Tu as actuellement 1250 points")
- Elle mentionne votre niveau
- Elle utilise des données réelles de VOTRE compte

**Exemple de réponse attendue** :
```
"Super question ! 🎯 
Tu as actuellement 1250 points et tu es au niveau 5.
Tu es à 150 points du niveau 6 !
Continue comme ça ! 🚀"
```

**❌ Si l'IA ne répond pas ou dit des choses fausses** :
- Vérifiez la console pour des erreurs
- Notez la réponse exacte de l'IA
- Vérifiez que vous êtes bien connecté (icône utilisateur en haut à droite)

---

### **TEST 4 : Tester le contexte dynamique** 🎨

**Actions** :
1. Allez sur la page **Dashboard** (`/dashboard`)
2. Ouvrez l'assistant IA
3. Posez : **"Résume ma progression"**
4. Fermez l'assistant
5. Allez sur la page **Courses** (`/courses`)
6. Rouvrez l'assistant IA
7. Posez : **"Quels chapitres puis-je étudier ?"**

**✅ Résultat attendu** :
- Sur le Dashboard : l'IA parle de vos stats globales
- Sur Courses : l'IA parle des matières et chapitres disponibles
- Les réponses sont **différentes** selon la page

**❌ Si l'IA donne les mêmes réponses partout** :
- Le contexte ne fonctionne peut-être pas
- Vérifiez les logs dans la console (recherchez "updateContext")

---

### **TEST 5 : Vérifier les données chargées** 🔍

**Actions** :
1. Dans la console (F12), cherchez ces logs :
   ```
   ✅ [fetchUserRealData] user_points: {...}
   ✅ [fetchUserRealData] user_badges: X badges
   ✅ [fetchUserRealData] chapitres complétés: Y chapitres
   ```

**✅ Résultat attendu** :
- `user_points` contient : `total_points`, `level`, `current_streak`, `longest_streak`
- `user_badges` : nombre de badges que vous avez
- Chapitres complétés : liste de vos chapitres terminés

**❌ Si vous voyez "0 badges", "0 chapitres"** :
- C'est peut-être normal si vous venez de créer votre compte
- Essayez de compléter un chapitre ou gagner un badge d'abord

---

### **TEST 6 : Tester différentes questions** 💡

**Questions à poser** :
1. "Quels badges ai-je débloqués ?"
2. "Quel est mon meilleur streak ?"
3. "Combien de temps ai-je étudié ?"
4. "Quelles sont mes matières ?"
5. "Donne-moi des conseils pour progresser"

**✅ Résultat attendu** :
- Réponses personnalisées avec VOS données
- Mentions de vos badges réels
- Statistiques exactes
- Ton motivant et encourageant

---

## 📋 **CHECKLIST FINALE**

Cochez mentalement chaque point :

- [ ] ✅ Pas d'erreur `max_streak` dans la console
- [ ] ✅ Bouton flottant de l'IA visible
- [ ] ✅ Panneau latéral s'ouvre correctement
- [ ] ✅ L'IA répond aux questions
- [ ] ✅ Les réponses contiennent VOS vraies données
- [ ] ✅ Le contexte change selon la page
- [ ] ✅ Les logs dans la console sont propres
- [ ] ✅ Interface fluide et responsive

**Si tous les points sont ✅** → L'Assistant IA fonctionne parfaitement ! 🎉  
**Si un point est ❌** → Notez lequel et envoyez-moi les détails

---

## 🎯 **APRÈS LES TESTS**

### **Si tout fonctionne ✅**
Dites-moi : "Tout marche !" et on passe à l'étape suivante (système de Quiz)

### **Si problème ❌**
Envoyez-moi :
1. La capture d'écran de l'erreur
2. Les logs de la console (copier-coller)
3. La question que vous avez posée
4. La réponse de l'IA (si elle a répondu)

---

## 🚀 **COMMENCEZ MAINTENANT !**

1. **Ouvrez** http://localhost:5173
2. **Appuyez** sur F12 (console)
3. **Rafraîchissez** avec F5
4. **Suivez** les tests ci-dessus
5. **Revenez** me dire le résultat !

**Bonne chance ! 🎯**
