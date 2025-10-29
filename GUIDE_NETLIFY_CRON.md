# =============================================
# GUIDE CONFIGURATION NETLIFY - E-Réussite
# =============================================

## 🎯 Vue d'ensemble

Netlify permet d'exécuter des fonctions planifiées **gratuitement** :
- ✅ **1,000 heures** de fonction par mois (gratuit)
- ✅ **125,000 requêtes** par mois (gratuit)
- ✅ **Scheduled Functions** intégrées (pas de cron externe)

Notre fonction s'exécute **toutes les 15 minutes** = **96 exécutions/jour** = **2,880 exécutions/mois**.

---

## 📋 ÉTAPE 1 : Prérequis

### 1.1 Installer Netlify CLI
```bash
npm install -g netlify-cli
```

### 1.2 Connexion à Netlify
```bash
netlify login
```

### 1.3 Générer le secret CRON
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
**Copiez** le résultat (ex: `a3f9e8d7c6b5a4...`).

---

## 📋 ÉTAPE 2 : Créer le site Netlify

### 2.1 Initialiser le site
```bash
netlify init
```

Choisissez :
- **Create & configure a new site** ✅
- **Team** : Votre compte
- **Site name** : `e-reussite` (ou autre nom)

### 2.2 Configuration automatique
Netlify détectera automatiquement :
- ✅ Build command : `npm run build`
- ✅ Publish directory : `dist`
- ✅ Functions directory : `netlify/functions`

---

## 📋 ÉTAPE 3 : Configurer les variables d'environnement

### 3.1 Via le Dashboard Netlify

1. Allez sur **https://app.netlify.com**
2. Sélectionnez votre site **e-reussite**
3. **Site settings** → **Environment variables**
4. Ajoutez ces variables :

| Variable | Valeur | Où la trouver ? |
|----------|--------|-----------------|
| `VITE_SUPABASE_URL` | `https://xxx.supabase.co` | Supabase Dashboard → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` | Supabase Dashboard → Project Settings → API → service_role (secret) |
| `CRON_SECRET` | `a3f9e8d7c6b5...` | Généré à l'étape 1.3 |

### 3.2 Via CLI (alternative)
```bash
# VITE_SUPABASE_URL
netlify env:set VITE_SUPABASE_URL "https://xxx.supabase.co"

# SUPABASE_SERVICE_ROLE_KEY
netlify env:set SUPABASE_SERVICE_ROLE_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# CRON_SECRET
netlify env:set CRON_SECRET "a3f9e8d7c6b5a4931e8f2d7c6b5a4931e8f2d7c6b5a4931e8f2d7c6b5a4931e"
```

---

## 📋 ÉTAPE 4 : Déployer l'application

### 4.1 Build et déploiement
```bash
netlify deploy --prod
```

### 4.2 Vérification
Netlify affichera :
```
✅ Deploy is live!
   Website URL:  https://e-reussite.netlify.app
   Functions:    https://e-reussite.netlify.app/.netlify/functions/competition-reminders
```

---

## 📋 ÉTAPE 5 : Vérifier la fonction planifiée

### 5.1 Dashboard Netlify
1. **Site settings** → **Functions**
2. Vous devriez voir : `competition-reminders`
3. **Schedule** : `*/15 * * * *` (toutes les 15 minutes)

### 5.2 Tester manuellement (sans attendre 15 min)
```bash
curl -X POST https://e-reussite.netlify.app/.netlify/functions/competition-reminders \
  -H "Authorization: Bearer VOTRE_CRON_SECRET" \
  -H "Content-Type: application/json"
```

**Résultat attendu :**
```json
{
  "success": true,
  "message": "Rappels de compétitions envoyés avec succès",
  "data": { "reminders_count": 3 },
  "timestamp": "2025-10-29T14:30:00.000Z"
}
```

---

## 📋 ÉTAPE 6 : Monitoring et logs

### 6.1 Voir les logs en temps réel
```bash
netlify functions:log competition-reminders
```

### 6.2 Dashboard Netlify
1. **Functions** → `competition-reminders`
2. Onglet **Logs**
3. Vous verrez :
   ```
   ✅ Authentification réussie
   ✅ Rappels envoyés avec succès: { reminders_count: 2 }
   ```

### 6.3 Vérifier dans Supabase
```sql
-- Voir les rappels créés dans les dernières 24h
SELECT 
    cn.type,
    cn.message,
    cn.created_at,
    u.email,
    c.name as competition_name,
    c.starts_at
FROM competition_notifications cn
JOIN users u ON u.id = cn.user_id
JOIN competitions c ON c.id = cn.competition_id
WHERE cn.type = 'reminder'
  AND cn.created_at > NOW() - INTERVAL '24 hours'
ORDER BY cn.created_at DESC;
```

---

## 🔧 DÉPANNAGE

### Erreur : "CRON_SECRET non configuré"
```bash
netlify env:set CRON_SECRET "votre_secret_généré"
netlify deploy --prod
```

### Erreur : "Unauthorized"
Vérifiez que le header `Authorization: Bearer CRON_SECRET` correspond exactement à la variable d'environnement.

### Fonction ne s'exécute pas automatiquement
1. Vérifiez `netlify.toml` :
   ```toml
   [[functions]]
     path = "netlify/functions/competition-reminders.js"
     schedule = "*/15 * * * *"
   ```
2. Redéployez : `netlify deploy --prod`

### Erreur Supabase RPC
Vérifiez que la fonction `schedule_competition_reminders()` existe :
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'schedule_competition_reminders';
```

---

## 📊 STATISTIQUES UTILISATION

### Calcul mensuel
- **96 exécutions/jour** × 30 jours = **2,880 exécutions/mois**
- **~5 secondes/exécution** = **4 heures/mois**

### Limites Netlify (gratuit)
- ✅ **125,000 requêtes/mois** → Vous utilisez **2.3%**
- ✅ **1,000 heures/mois** → Vous utilisez **0.4%**

**Résultat : Largement dans les limites gratuites !** 🎉

---

## 🚀 COMMANDES RAPIDES

```bash
# Déployer en production
netlify deploy --prod

# Voir les logs en direct
netlify functions:log competition-reminders

# Tester localement
netlify dev

# Voir les variables d'environnement
netlify env:list

# Ouvrir le dashboard
netlify open
```

---

## ✅ CHECKLIST FINALE

- [ ] Netlify CLI installé (`netlify --version`)
- [ ] Site créé (`netlify init`)
- [ ] Variables d'environnement configurées (3 variables)
- [ ] `netlify.toml` créé avec scheduled function
- [ ] Déployé en production (`netlify deploy --prod`)
- [ ] Fonction testée manuellement (curl)
- [ ] Logs vérifiés (aucune erreur)
- [ ] Notifications créées dans Supabase (requête SQL)

---

## 📚 RESSOURCES

- [Netlify Scheduled Functions](https://docs.netlify.com/functions/scheduled-functions/)
- [Netlify CLI](https://docs.netlify.com/cli/get-started/)
- [Supabase Functions](https://supabase.com/docs/guides/functions)

---

**Prêt à déployer ? Lancez `netlify init` !** 🚀
