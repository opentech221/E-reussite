# 🎯 GUIDE COMPLET - Badges & Rappels Automatiques

## 3️⃣ AJOUTER PLUS DE BADGES

### 📋 **Étapes (5 minutes)**

1. **Ouvrir** : Supabase SQL Editor
2. **Copier-coller** : Contenu de `ADD_MORE_BADGES.sql`
3. **Exécuter** : Run

**Résultat** : 24 nouveaux badges ajoutés ! 🎉

### 🏅 **Catégories de badges ajoutés**

| Catégorie | Badges | Exemples |
|-----------|--------|----------|
| 🎓 Éducatifs | 4 | Premier Pas, Assidu, Expert du Sujet |
| ⚡ Performance | 4 | Éclair, Tireur d'Élite, Perfectionniste |
| 🏆 Classement | 4 | Roi du Podium, Champion Régional |
| 🎮 Spéciaux | 4 | Noctambule, Anniversaire, Fondateur |
| 📊 Matières | 4 | Génie des Maths, Scientifique, Littéraire |
| 🎪 Communauté | 4 | Mentor, Influenceur, Légende |

**Total badges** : 16 (Phase 2) + 24 (nouveaux) = **40 badges** ! 🎊

---

## 4️⃣ PLANIFIER LES RAPPELS

Vous avez **2 options** pour les rappels automatiques :

---

### 📋 **OPTION A : pg_cron (Supabase Pro/Team)**

**Avantages** :
- ✅ Directement dans PostgreSQL
- ✅ Aucun code frontend nécessaire
- ✅ Très fiable

**Inconvénient** :
- ⚠️ Nécessite Supabase Pro ($25/mois) ou Team

#### **Setup (5 minutes)**

1. **Activer pg_cron** :
   - Aller sur : Supabase Dashboard > Database > Extensions
   - Rechercher : `pg_cron`
   - Cliquer : **Enable**

2. **Configurer le job** :
   - Ouvrir : Supabase SQL Editor
   - Copier-coller : Contenu de `SETUP_CRON_REMINDERS.sql`
   - Exécuter : Run

3. **Vérifier** :
```sql
SELECT * FROM cron.job WHERE jobname = 'competition-reminders';
```

**C'est tout ! Les rappels s'enverront automatiquement toutes les 15 minutes** ✅

---

### 📋 **OPTION B : Vercel Cron (GRATUIT)**

**Avantages** :
- ✅ **100% GRATUIT** (jusqu'à 100 invocations/jour)
- ✅ Fonctionne avec Supabase Free Tier
- ✅ Facile à configurer

**Inconvénient** :
- ⚠️ Nécessite déploiement sur Vercel

#### **Setup (10 minutes)**

##### **1. Fichiers déjà créés** ✅
- `api/cron/competition-reminders.js` → Endpoint API
- `vercel.json` → Configuration cron

##### **2. Générer CRON_SECRET**

```bash
# Dans PowerShell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copier le résultat (ex: `a7f3d9e2b1c4...`)

##### **3. Ajouter dans `.env.local`**

```env
# .env.local (déjà existant)
VITE_SUPABASE_URL=https://qbvdrkhdjjpuowthwinf.supabase.co
VITE_SUPABASE_ANON_KEY=votre_anon_key

# NOUVEAU - Ajouter ces 2 lignes:
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
CRON_SECRET=a7f3d9e2b1c4... (votre secret généré ci-dessus)
```

**Trouver Service Role Key** :
- Supabase Dashboard > Settings > API
- Copier **`service_role` (secret)** ⚠️ PAS anon !

##### **4. Déployer sur Vercel**

```bash
# Si pas encore installé Vercel CLI
npm install -g vercel

# Se connecter
vercel login

# Déployer
vercel

# Suivre les instructions...
```

##### **5. Configurer Variables Vercel**

1. Aller sur : https://vercel.com/dashboard
2. Sélectionner : Votre projet
3. Aller dans : Settings > Environment Variables
4. Ajouter :
   - `VITE_SUPABASE_URL` = `https://qbvdrkhdjjpuowthwinf.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY` = `eyJhbGciOi...` (votre service role key)
   - `CRON_SECRET` = `a7f3d9e2b1c4...` (votre secret)

5. **Redéployer** : `vercel --prod`

##### **6. Tester manuellement**

```bash
# Dans votre terminal
curl -X GET \
  -H "Authorization: Bearer a7f3d9e2b1c4..." \
  https://votre-app.vercel.app/api/cron/competition-reminders
```

**Résultat attendu** :
```json
{
  "success": true,
  "notifications_created": 2,
  "message": "2 reminder(s) scheduled"
}
```

---

## ✅ **VÉRIFICATION**

### **Pour pg_cron (Option A)**

```sql
-- Voir les exécutions récentes
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'competition-reminders')
ORDER BY start_time DESC LIMIT 5;
```

### **Pour Vercel Cron (Option B)**

1. Vercel Dashboard > Votre projet > Logs
2. Chercher : `/api/cron/competition-reminders`
3. Voir les exécutions toutes les 15 minutes

---

## 📊 **MONITORING - Les 2 options**

### **Voir notifications créées**

```sql
SELECT 
    type,
    title,
    scheduled_for,
    is_sent,
    created_at
FROM competition_notifications
WHERE type = 'reminder'
ORDER BY created_at DESC
LIMIT 10;
```

### **Statistiques**

```sql
SELECT 
    type,
    COUNT(*) as total,
    COUNT(CASE WHEN is_sent THEN 1 END) as sent,
    COUNT(CASE WHEN NOT is_sent THEN 1 END) as pending
FROM competition_notifications
GROUP BY type;
```

---

## 🎯 **RÉCAPITULATIF**

### **Ce qui va se passer automatiquement** :

1. ⏰ **Toutes les 15 minutes** : Le cron s'exécute
2. 🔍 **Vérification** : `schedule_competition_reminders()` cherche les compétitions qui commencent dans 1h
3. 📝 **Création** : Des notifications sont créées pour chaque participant inscrit
4. 🔔 **Envoi** : Les notifications apparaissent dans NotificationPanel
5. 📱 **Push** : (si VAPID configuré) Notification push sur mobile/desktop

---

## 💡 **RECOMMANDATION**

- **Si Supabase Free** → **Option B (Vercel)** ✅
- **Si Supabase Pro** → **Option A (pg_cron)** (plus simple)

---

## 🚀 **PROCHAINES ÉTAPES**

Après avoir configuré les rappels :

1. ✅ Créer une compétition qui démarre dans 1h
2. ✅ S'inscrire à cette compétition
3. ✅ Attendre 15 minutes
4. ✅ Vérifier que la notification a été créée
5. ✅ Voir la notification dans NotificationPanel 🔔

---

**Questions ? Besoin d'aide pour le setup ?** 😊
