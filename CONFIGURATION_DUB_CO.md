# 🔑 CONFIGURATION DUB.CO - LIENS COURTS

**Date**: 10 octobre 2025  
**Temps estimé**: 5 minutes

---

## 🎯 Pourquoi configurer Dub.co ?

Dub.co permet de créer des **liens courts personnalisés** pour partager tes recherches Perplexity :

**Avant** :
```
https://e-reussite.com/perplexity/search?q=programme-bfem-maths-2025&result=abc123def456...
```

**Après** :
```
https://e-reuss.it/ABC123
```

**Avantages** :
- 🎯 Liens courts faciles à partager
- 📊 Analytics (combien de clics, d'où, quand)
- 🎨 Image preview personnalisée
- 🔗 Domaine personnalisé (e-reuss.it)

---

## 📋 ÉTAPE 1: Récupérer la clé API (2 min)

### **1.1 Se connecter à Dub.co**

Ouvre : https://app.dub.co/login

**Identifiants** : (utilise ton compte existant)

### **1.2 Aller dans Settings → API Keys**

URL directe : https://app.dub.co/settings/tokens

### **1.3 Créer une nouvelle clé**

1. Clique **Create Token**
2. **Name** : `E-reussite Production`
3. **Permissions** :
   - ✅ `links:create` (créer liens)
   - ✅ `links:read` (lire liens)
   - ✅ `analytics:read` (voir stats)
4. Clique **Create**

### **1.4 Copier la clé**

⚠️ **IMPORTANT** : Copie la clé maintenant, elle ne sera plus affichée !

Format : `dub_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

## 🔧 ÉTAPE 2: Ajouter dans .env (1 min)

### **2.1 Ouvrir le fichier .env**

```powershell
code .env
```

### **2.2 Ajouter la clé API**

Trouve la ligne avec `VITE_DUB_API_KEY` et remplace :

```env
# Dub.co - Liens courts
VITE_DUB_API_KEY=dub_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Exemple réel** :
```env
VITE_DUB_API_KEY=dub_1234567890abcdef1234567890abcdef
```

### **2.3 Sauvegarder**

Ctrl+S pour sauvegarder le fichier

---

## 🔄 ÉTAPE 3: Relancer l'app (1 min)

### **3.1 Arrêter l'app**

Dans le terminal où `npm run dev` tourne :
- Appuie sur `Ctrl+C`
- Confirme avec `Y`

### **3.2 Relancer l'app**

```powershell
npm run dev
```

**Durée** : ~5-10 secondes

---

## 🧪 ÉTAPE 4: Tester le partage (1 min)

### **4.1 Ouvrir l'app**

http://localhost:3000

### **4.2 Faire une recherche Perplexity**

1. Assistant IA (🧠)
2. Mode Recherche (🔍)
3. Pose une question : `"Programme BFEM maths 2025"`
4. Attends la réponse (~2-3s)

### **4.3 Cliquer sur Partager**

1. Clique **🔗 Partager**
2. Attends 1-2 secondes
3. ✅ Un lien court apparaît et se copie automatiquement

### **4.4 Tester le lien**

1. Ouvre un nouvel onglet
2. Colle le lien (Ctrl+V)
3. ✅ Vérifie que ça redirige vers ta recherche

---

## 📊 ÉTAPE 5: Voir les analytics (optionnel)

### **5.1 Dashboard Dub.co**

https://app.dub.co/links

### **5.2 Liens créés**

Tu verras tous les liens courts générés :
- 📝 URL d'origine
- 🔗 Lien court
- 📊 Nombre de clics
- 🌍 Pays des visiteurs
- 📱 Appareils (mobile/desktop)

---

## 🎯 EXEMPLES D'UTILISATION

### **Cas 1: Partage WhatsApp**

```
Salut ! J'ai trouvé ça sur le programme du BFEM 2025 :
https://e-reuss.it/ABC123

C'est super complet avec toutes les sources ! 📚
```

### **Cas 2: Email prof**

```
Bonjour M. Diop,

Voici une recherche que j'ai faite sur les nouvelles épreuves du BAC :
https://e-reuss.it/XYZ789

Les sources sont citées en bas.

Cordialement,
Fatou
```

### **Cas 3: Post groupe Facebook**

```
🎓 Révisions BFEM - Programme Maths complet !

J'ai fait une recherche approfondie avec sources officielles :
👉 https://e-reuss.it/MATH25

15 sources vérifiées ✅
Partagez pour aider vos camarades ! 📖
```

---

## 🔐 SÉCURITÉ

### **⚠️ NE JAMAIS partager ta clé API**

❌ **PAS dans Git** : Le fichier `.env` est déjà dans `.gitignore`  
❌ **PAS sur Discord/WhatsApp** : Quelqu'un pourrait créer des liens à ta place  
❌ **PAS dans le code source** : Utilise toujours `import.meta.env.VITE_DUB_API_KEY`

### **✅ Si ta clé est compromise**

1. Aller sur https://app.dub.co/settings/tokens
2. Cliquer **Revoke** sur la clé compromise
3. Créer une nouvelle clé
4. Mettre à jour `.env`
5. Relancer l'app

---

## 🎨 PERSONNALISATION (optionnel)

### **Domaine personnalisé**

Par défaut, les liens utilisent `dub.sh`. Tu peux configurer `e-reuss.it` :

1. **Acheter le domaine** : e-reuss.it (chez Namecheap, OVH, etc.)
2. **Ajouter dans Dub.co** : Settings → Domains → Add domain
3. **Configurer DNS** : Ajouter l'enregistrement CNAME
4. **Attendre propagation** : 5-10 minutes

Ensuite, les liens seront `https://e-reuss.it/ABC123` 🎉

---

## 📈 LIMITES & QUOTAS

| Plan | Liens/mois | Analytics | Custom domain |
|------|------------|-----------|---------------|
| **Free** | 100 | ✅ | ❌ |
| **Pro** | 1,000 | ✅ | ✅ |
| **Business** | 10,000 | ✅ | ✅ |

**Estimation E-réussite** :
- Partages/jour : ~5-10
- Partages/mois : ~150-300
- **Plan recommandé** : Pro ($12/mois) ou Business si croissance forte

---

## 🐛 DÉPANNAGE

### **Erreur : "Invalid API key"**

**Cause** : Clé mal copiée ou révoquée

**Solution** :
1. Vérifier `.env` → Clé commence bien par `dub_`
2. Pas d'espaces avant/après la clé
3. Créer une nouvelle clé si besoin

### **Erreur : "Rate limit exceeded"**

**Cause** : Trop de liens créés trop vite

**Solution** :
1. Attendre 1 minute
2. Réessayer
3. Si fréquent, passer au plan Pro

### **Lien ne redirige pas**

**Cause** : DNS pas encore propagé (si domaine custom)

**Solution** :
1. Attendre 10-30 minutes
2. Vider cache navigateur (Ctrl+Shift+Delete)
3. Tester en navigation privée

---

## ✅ CHECKLIST

### **Configuration**
- [ ] Clé API récupérée depuis Dub.co dashboard
- [ ] Ajoutée dans `.env` avec `VITE_DUB_API_KEY=`
- [ ] App relancée (`npm run dev`)

### **Test**
- [ ] Recherche Perplexity effectuée
- [ ] Bouton **Partager** cliqué
- [ ] Lien court généré (format `dub.sh/xxx` ou `e-reuss.it/xxx`)
- [ ] Lien copié automatiquement
- [ ] Lien testé dans navigateur (redirige bien)

### **Analytics**
- [ ] Dashboard Dub.co ouvert (https://app.dub.co/links)
- [ ] Liens créés visibles
- [ ] Clics trackés

---

## 🎉 RÉSULTAT FINAL

**Sans Dub.co** :
```
Partage impossible ou lien très long (200+ caractères)
```

**Avec Dub.co** :
```
https://e-reuss.it/ABC123
✅ Court
✅ Cliquable
✅ Trackable
✅ Professionnel
```

---

**PROCHAINE ÉTAPE** : Récupère ta clé API maintenant ! 🔑

**Lien direct** : https://app.dub.co/settings/tokens
