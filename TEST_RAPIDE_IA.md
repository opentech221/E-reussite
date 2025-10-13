# 🎯 TEST ASSISTANT IA - CHECKLIST RAPIDE

## ⚡ ACTIONS IMMÉDIATES

### 1️⃣ Ouvrir et rafraîchir
```
1. Allez sur : http://localhost:5173
2. Appuyez sur F12 (ouvrir la console)
3. Appuyez sur F5 (rafraîchir)
```

### 2️⃣ Vérifier la console
**Cherchez ces messages** :
- ✅ `🤖 [AIAssistantSidebar] Composant monté`
- ✅ `✅ [fetchUserRealData] user_points: {...}`
- ❌ PAS d'erreur `max_streak`

### 3️⃣ Ouvrir l'assistant
**Cliquez** sur le bouton flottant (en bas à droite) avec icône 🧠

### 4️⃣ Poser une question
**Tapez** : `Quels sont mes points actuels ?`

### 5️⃣ Vérifier la réponse
**L'IA doit** :
- ✅ Mentionner VOS vrais points
- ✅ Mentionner votre niveau
- ✅ Être encourageante

---

## ✅ RÉSULTAT ATTENDU

```
Console : Pas d'erreur ✅
Bouton IA : Visible ✅
Panneau : S'ouvre ✅
Réponse : Avec vos vraies données ✅
```

---

## ❌ EN CAS DE PROBLÈME

**Si erreur dans la console** :
→ Copiez l'erreur complète et envoyez-la moi

**Si bouton invisible** :
→ Vérifiez que vous êtes connecté (compte utilisateur)

**Si IA ne répond pas** :
→ Vérifiez la clé API Gemini dans `.env`

**Si réponses incorrectes** :
→ Vérifiez les logs `fetchUserRealData` dans la console

---

## 🎉 SI TOUT MARCHE

**Dites-moi simplement** : "Ça marche !" ou "Tout OK !"

**Ensuite on passe à** : Système de Quiz (étape 2)

---

## 📊 PROGRESSION DU PROJET

```
█████████████████░░░░ 85%

✅ Dashboard
✅ Courses  
✅ Examens
✅ Assistant IA (en test)
❌ Quiz (prochaine étape)
```

**Il ne reste que les Quiz à faire !** 🎯
