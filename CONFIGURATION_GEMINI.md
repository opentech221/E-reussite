# 🔐 CONFIGURATION GOOGLE GEMINI API

## 📍 **Étape 1 : Obtenir votre clé API**

### Option A : Via Google AI Studio (Recommandé)
1. **Ouvrir** : https://makersuite.google.com/app/apikey
2. **Se connecter** avec votre compte Google
3. **Cliquer** sur "Create API Key" ou "Get API Key"
4. **Sélectionner** un projet Google Cloud (ou en créer un nouveau)
5. **Copier** la clé générée (format : `AIza...`)

### Option B : Via Google Cloud Console
1. **Ouvrir** : https://console.cloud.google.com/
2. **Activer** l'API "Generative Language API"
3. **Aller** dans "APIs & Services" > "Credentials"
4. **Créer** une clé API
5. **Copier** la clé générée

---

## 📝 **Étape 2 : Configurer le fichier .env**

### 1. Ouvrir le fichier `.env`
Fichier situé à la racine du projet : `E-reussite\.env`

### 2. Remplacer le placeholder
Trouver cette ligne :
```env
VITE_GEMINI_API_KEY=VOTRE_CLE_GEMINI_ICI
```

Remplacer par votre vraie clé :
```env
VITE_GEMINI_API_KEY=AIzaSyC1234567890abcdefghijklmnopqrstuvwxyz
```

### 3. Enregistrer le fichier
**Important** : Assurez-vous que le fichier `.env` est bien enregistré

---

## 🚀 **Étape 3 : Redémarrer le serveur**

### Si le serveur est déjà lancé :
1. **Arrêter** : Appuyez sur `Ctrl + C` dans le terminal
2. **Relancer** : 
```bash
npm run dev
```

### Si le serveur n'est pas lancé :
```bash
npm run dev
```

**Le serveur doit redémarrer pour charger la nouvelle variable d'environnement !**

---

## ✅ **Étape 4 : Vérifier que ça fonctionne**

### 1. Ouvrir l'application
Aller sur : http://localhost:5173

### 2. Se connecter
Utiliser vos identifiants habituels

### 3. Cliquer sur le bouton flottant 🤖
En bas à droite de l'écran, vous devriez voir un bouton bleu avec l'icône cerveau

### 4. Envoyer un message de test
Exemples de messages :
- "Bonjour, peux-tu m'aider ?"
- "Explique-moi mes statistiques"
- "Comment puis-je améliorer mes résultats ?"

### 5. Vérifier la réponse
- ✅ **Si vous recevez une réponse** : Tout fonctionne parfaitement ! 🎉
- ❌ **Si erreur** : Voir section Dépannage ci-dessous

---

## 🔍 **DÉPANNAGE**

### Erreur : "Service IA non disponible"

**Cause possible 1** : Clé API incorrecte
- **Solution** : Vérifiez que vous avez bien copié la clé complète (commence par `AIza`)
- **Vérifier** dans `.env` qu'il n'y a pas d'espaces avant/après la clé

**Cause possible 2** : Variable d'environnement non chargée
- **Solution** : Redémarrez complètement le serveur (Ctrl+C puis `npm run dev`)

**Cause possible 3** : Clé API non activée
- **Solution** : 
  1. Allez sur https://console.cloud.google.com/
  2. Vérifiez que "Generative Language API" est activée
  3. Attendez 2-3 minutes après activation

### Erreur : "API Key not valid"

**Cause** : Clé API invalide ou révoquée
- **Solution** : 
  1. Retournez sur https://makersuite.google.com/app/apikey
  2. Créez une nouvelle clé
  3. Remplacez l'ancienne dans `.env`
  4. Redémarrez le serveur

### Message : "Quota exceeded"

**Cause** : Limite gratuite dépassée (60 requêtes/minute)
- **Solution** :
  1. Attendez quelques minutes
  2. Ou activez la facturation sur Google Cloud (optionnel)

### Bouton flottant n'apparaît pas

**Vérifications** :
1. Vous êtes bien connecté ?
2. Le bouton est en bas à droite de l'écran
3. Essayez de scroller vers le bas
4. Vérifiez la console (F12) pour des erreurs JavaScript

---

## 📊 **LIMITES & QUOTAS**

### Gratuit (par défaut)
- ✅ **60 requêtes par minute**
- ✅ **1500 requêtes par jour**
- ✅ Idéal pour usage personnel/test

### Si vous dépassez les limites
Vous pouvez activer la facturation sur Google Cloud :
- https://console.cloud.google.com/billing

**Tarifs Gemini Pro** (si facturation activée) :
- Gratuit jusqu'à 1 million de tokens/mois
- Très peu coûteux au-delà

---

## 🔒 **SÉCURITÉ**

### ⚠️ NE JAMAIS :
- ❌ Partager votre clé API publiquement
- ❌ Commiter le fichier `.env` sur GitHub
- ❌ Copier-coller votre clé dans des forums/chats

### ✅ BONNES PRATIQUES :
- ✅ Le fichier `.env` est déjà dans `.gitignore`
- ✅ Régénérez votre clé si vous pensez qu'elle a été compromise
- ✅ Utilisez des restrictions d'API (Google Cloud Console)

---

## 📞 **SUPPORT**

### Si problème persiste :
1. **Vérifier** la console navigateur (F12) pour erreurs
2. **Vérifier** le terminal serveur pour logs
3. **Consulter** la documentation : `AMELIORATIONS_ASSISTANT_IA.md`
4. **Chercher** dans : `RECAPITULATIF_AMELIORATIONS_IA.md`

### Logs utiles :
```javascript
// Dans la console navigateur (F12)
✅ [Contextual AI] Service Gemini initialisé
✅ [Contextual AI] Réponse reçue: ...

❌ [Contextual AI] Erreur: ...
```

---

## 🎉 **FÉLICITATIONS !**

Une fois la clé configurée, vous aurez accès à un **Assistant IA intelligent** disponible **partout** dans l'application !

### Ce que vous pouvez faire :
- 💬 Poser des questions sur vos cours
- 📊 Comprendre vos statistiques
- 🎯 Obtenir des conseils personnalisés
- 🧠 Expliquer des concepts difficiles
- 📚 Suggérer des méthodes d'étude
- ⚡ Actions rapides (Maths, Français, Méthodes, Examens)

**Profitez-en bien ! 🚀**
