# 🎯 GUIDE RAPIDE - Ajouter Clé API Claude (2 minutes)

---

## 📍 Étape 1 : Obtenir la Clé (1 min)

### **A. Ouvrir Console Anthropic**

```
🌐 URL: https://console.anthropic.com/
```

### **B. Se connecter / Créer compte**

- Email + Mot de passe
- Vérifier l'email
- Accepter les conditions

### **C. Créer une clé API**

```
1. Cliquer sur "API Keys" (menu gauche)
2. Cliquer sur "Create Key"
3. Nom : E-reussite-Coach-IA
4. Cliquer sur "Create Key"
5. ✅ COPIER LA CLÉ (elle commence par sk-ant-api03-)
```

⚠️ **IMPORTANT** : La clé ne s'affiche qu'**une seule fois** !

---

## 📍 Étape 2 : Ajouter dans .env (30 sec)

### **A. Ouvrir le fichier .env**

```
Emplacement: E-reussite/.env
```

Si le fichier n'existe pas → Créer un nouveau fichier `.env` à la racine

### **B. Ajouter cette ligne**

```env
VITE_CLAUDE_API_KEY=sk-ant-api03-COLLER_VOTRE_CLE_ICI
```

**Exemple** :

```env
VITE_CLAUDE_API_KEY=sk-ant-api03-Abc123xyz789...
```

### **C. Sauvegarder**

```
Ctrl + S
```

---

## 📍 Étape 3 : Redémarrer (10 sec)

### **A. Arrêter le serveur**

```bash
Ctrl + C (dans le terminal)
```

### **B. Relancer**

```bash
npm run dev
```

---

## ✅ Vérification (10 sec)

### **A. Ouvrir la console navigateur**

```
F12 → Console
```

### **B. Taper cette commande**

```javascript
console.log(import.meta.env.VITE_CLAUDE_API_KEY)
```

### **C. Résultat attendu**

```javascript
✅ "sk-ant-api03-Abc123xyz789..."
```

**Si `undefined`** → Redémarrer le serveur à nouveau

---

## 🎉 C'est Terminé !

### **Vous pouvez maintenant**

1. ✅ Utiliser Coach IA avec Claude
2. ✅ Basculer entre Gemini et Claude
3. ✅ Claude pour raisonnement complexe
4. ✅ Gemini pour analyse d'images

---

## 🔒 Sécurité - Rappels

### ✅ **À FAIRE**

- ✅ Garder la clé dans `.env` uniquement
- ✅ Vérifier que `.env` est dans `.gitignore`
- ✅ Ne jamais partager la clé

### ❌ **À NE JAMAIS FAIRE**

- ❌ Commiter `.env` dans Git
- ❌ Partager la clé publiquement
- ❌ Hardcoder la clé dans le code

---

## 📞 Besoin d'Aide ?

### **Erreur : "Clé invalide"**

```javascript
❌ Error: Invalid API key
```

**Solutions** :
1. Vérifier que la clé commence par `sk-ant-api03-`
2. Vérifier qu'il n'y a pas d'espace avant/après
3. Régénérer une nouvelle clé sur console.anthropic.com

### **Erreur : "undefined"**

```javascript
❌ undefined
```

**Solutions** :
1. Vérifier que la variable commence par `VITE_`
2. Redémarrer le serveur (`npm run dev`)
3. Vérifier que `.env` est à la racine du projet

---

## 🚀 Prochaine Étape

**Une fois la clé configurée**, dites-moi :

✅ "Clé configurée, continue !"

Et je modifierai `AIAssistantSidebar.jsx` pour intégrer le sélecteur Claude/Gemini ! 🎯

---

**Temps total : 2 minutes** ⏱️
