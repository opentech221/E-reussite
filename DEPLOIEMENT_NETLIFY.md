# 🚀 Déploiement Netlify - Guide Rapide

## ⚡ Installation en 5 minutes

### 1️⃣ Installer Netlify CLI
```bash
npm install -g netlify-cli
```

### 2️⃣ Connexion
```bash
netlify login
```
*(Une fenêtre de navigateur s'ouvrira pour l'authentification)*

### 3️⃣ Initialiser le site
```bash
netlify init
```
**Choisissez :**
- ✅ Create & configure a new site
- 📛 Site name: `e-reussite` (ou votre nom préféré)

### 4️⃣ Générer le secret CRON
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
**📋 Copiez** le résultat (ex: `a3f9e8d7c6b5a4...`)

### 5️⃣ Configurer les variables (3 variables requises)

#### Via Dashboard (recommandé) :
1. Ouvrez : `netlify open`
2. **Site settings** → **Environment variables** → **Add a variable**
3. Ajoutez :

| Variable | Valeur | Où ? |
|----------|--------|------|
| `VITE_SUPABASE_URL` | `https://xxx.supabase.co` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` | Supabase → Settings → API → service_role ⚠️ |
| `CRON_SECRET` | `a3f9e8d7...` | Généré à l'étape 4 |

#### Ou via CLI :
```bash
netlify env:set VITE_SUPABASE_URL "https://xxx.supabase.co"
netlify env:set SUPABASE_SERVICE_ROLE_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
netlify env:set CRON_SECRET "a3f9e8d7c6b5a4931e8f2d7c6b5a4931e8f"
```

### 6️⃣ Déployer
```bash
# Option A : Script automatique (Windows PowerShell)
.\deploy-netlify.ps1

# Option B : Commandes manuelles
npm run build
netlify deploy --prod
```

### 7️⃣ Vérifier
```bash
# Ouvrir le dashboard
netlify open

# Voir les logs de la fonction
netlify functions:log competition-reminders
```

---

## ✅ C'est tout !

Votre fonction s'exécutera **automatiquement toutes les 15 minutes**.

---

## 🔍 Tester manuellement (sans attendre)

```bash
# Remplacez VOTRE_SITE et VOTRE_CRON_SECRET
curl -X POST https://VOTRE_SITE.netlify.app/.netlify/functions/competition-reminders \
  -H "Authorization: Bearer VOTRE_CRON_SECRET"
```

**Résultat attendu :**
```json
{
  "success": true,
  "message": "Rappels de compétitions envoyés avec succès",
  "data": { "reminders_count": 2 }
}
```

---

## 🆘 Problèmes ?

### ❌ "CRON_SECRET non configuré"
```bash
netlify env:set CRON_SECRET "votre_secret"
netlify deploy --prod
```

### ❌ "Unauthorized"
Vérifiez que le header `Authorization: Bearer XXX` correspond exactement à `CRON_SECRET`.

### ❌ Fonction ne s'exécute pas
Vérifiez `netlify.toml` :
```toml
[[functions]]
  path = "netlify/functions/competition-reminders.js"
  schedule = "*/15 * * * *"
```

---

## 📊 Utilisation gratuite

- **2,880 exécutions/mois** (toutes les 15 min)
- **~4 heures/mois** de compute time
- **100% gratuit** avec Netlify Free Tier ✅

---

## 📚 Plus d'infos

Voir `GUIDE_NETLIFY_CRON.md` pour le guide complet avec monitoring, dépannage, etc.
