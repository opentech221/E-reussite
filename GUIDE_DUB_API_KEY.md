# 🔑 GUIDE DE RÉCUPÉRATION CLÉ API DUB.CO
Date: 10 octobre 2025

---

## 📋 Étapes pour obtenir votre clé API Dub.co

### **1. Accéder au Dashboard Dub.co**
- Allez sur: https://app.dub.co
- Connectez-vous avec votre compte

### **2. Naviguer vers les Tokens**
- Cliquez sur **Settings** (⚙️) dans la barre latérale
- Sélectionnez **API Tokens** ou **Tokens**

### **3. Créer un nouveau token**
- Cliquez sur **"Create Token"** ou **"New API Key"**
- **Nom du token**: `E-reussite-production`
- **Permissions** (cochez toutes ces cases):
  - ✅ `links:create` - Créer des liens
  - ✅ `links:read` - Lire les liens
  - ✅ `links:update` - Modifier les liens
  - ✅ `links:delete` - Supprimer les liens
  - ✅ `analytics:read` - Lire les analytics

### **4. Copier la clé**
- ⚠️ **ATTENTION** : La clé ne s'affichera **qu'une seule fois** !
- Copiez-la immédiatement
- Format attendu: `dub_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### **5. Configurer le domaine personnalisé (optionnel)**
Si vous voulez des liens `e-reuss.it` au lieu de `dub.sh`:

#### **Option A: Domaine gratuit dub.sh**
- Pas de configuration nécessaire
- Vos liens seront: `https://dub.sh/abcd1234`

#### **Option B: Domaine personnalisé (recommandé)**
1. Allez dans **Settings** → **Domains**
2. Cliquez **"Add Domain"**
3. Entrez votre domaine: `e-reuss.it` (ou `lnk.e-reussite.com`)
4. Ajoutez l'enregistrement CNAME dans votre registrar DNS:
   ```
   Type: CNAME
   Name: e-reuss.it (ou lnk)
   Value: cname.dub.co
   TTL: 3600
   ```
5. Attendez propagation DNS (5-30 min)
6. Vérifiez dans Dub.co (bouton "Verify")

---

## 🔧 Configuration dans E-reussite

### **Après avoir obtenu votre clé**:

1. **Ouvrez** `.env` dans VSCode
2. **Remplacez** la ligne:
   ```env
   VITE_DUB_API_KEY=your_dub_api_key_here
   ```
   Par:
   ```env
   VITE_DUB_API_KEY=dub_VotreCléCopiéeIci
   ```

3. **Sauvegardez** le fichier (Ctrl+S)

4. **Redémarrez** le serveur de développement:
   ```bash
   # Arrêtez avec Ctrl+C dans le terminal
   npm run dev
   ```

---

## ✅ Test de la clé API

Pour vérifier que tout fonctionne, vous pouvez exécuter ce test:

```javascript
// Test rapide dans la console navigateur (F12)
import { Dub } from 'dub';

const dub = new Dub({ token: 'VotreCléIci' });

// Créer un lien de test
const link = await dub.links.create({
  url: 'https://e-reussite.com',
  domain: 'dub.sh' // ou 'e-reuss.it' si configuré
});

console.log('✅ Lien créé:', link.shortLink);
```

---

## 🔒 Sécurité

- ❌ **NE JAMAIS** commiter le fichier `.env` sur Git
- ✅ Le fichier est déjà dans `.gitignore`
- ✅ En production, utiliser des variables d'environnement serveur
- ⚠️ Les clés `VITE_*` sont visibles côté client (navigateur)

---

## 📊 Plans Dub.co

| Plan | Prix | Liens/mois | Analytics | Domaines personnalisés |
|------|------|------------|-----------|------------------------|
| **Free** | $0 | 1,000 | Basiques | 1 |
| **Pro** | $20 | 25,000 | Avancées | 10 |
| **Business** | $49 | 100,000 | Complètes | Illimité |

**Recommandation**: Plan **Pro** pour E-reussite (suffisant pour démarrer)

---

## 🆘 Problèmes courants

### **Erreur: "Invalid API key"**
- Vérifiez que la clé commence par `dub_`
- Vérifiez qu'il n'y a pas d'espaces avant/après
- Régénérez une nouvelle clé si nécessaire

### **Erreur: "Domain not found"**
- Utilisez `dub.sh` au lieu de votre domaine personnalisé
- Ou configurez correctement le DNS (voir section domaine)

### **Erreur: "Rate limit exceeded"**
- Vous avez dépassé le quota du plan gratuit
- Attendez 1 heure ou upgradez vers Pro

---

## 📚 Documentation officielle

- [Dub.co API Reference](https://dub.co/docs/api-reference)
- [TypeScript SDK](https://www.npmjs.com/package/dub)
- [Exemples de code](https://dub.co/docs/sdks/typescript/overview)

---

**Prêt à créer votre premier lien court ? 🚀**
