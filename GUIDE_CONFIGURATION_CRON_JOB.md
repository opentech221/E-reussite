# 🔧 Guide de Configuration du Cron Job

## Problème Résolu

**Erreur** : `impossible de trouver une entrée valide pour le travail 'daily-streak-reminder'`

**Cause** : `current_setting('app.settings.service_role_key')` n'existe pas dans Supabase PostgreSQL.

**Solution** : Utiliser la clé service_role directement dans le SQL.

---

## 📋 Instructions Pas-à-Pas

### Étape 1 : Récupérer ta Service Role Key

1. **Ouvrir Supabase Dashboard**
2. **Project Settings** (icône engrenage en bas à gauche)
3. **API** (menu gauche)
4. **Project API keys** section
5. Copier la **`service_role`** key (commence par `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

⚠️ **ATTENTION** : Cette clé donne un accès complet à ta base de données. **Ne JAMAIS** la committer dans Git ou la partager publiquement.

---

### Étape 2 : Préparer le Script SQL

1. Ouvrir le fichier `setup_daily_streak_reminder_cron.sql`

2. Chercher cette ligne :
   ```sql
   'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',  -- ⚠️ REMPLACER
   ```

3. Remplacer `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` par ta vraie clé service_role

**Exemple** :
```sql
'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFidmRya2hkampwdW93dGh3aW5mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTYzODMxMDQwMCwiZXhwIjoxOTUzODg2NDAwfQ.VOTRE_SIGNATURE_ICI',
```

---

### Étape 3 : Supprimer l'Ancien Job (si existe)

Dans **Supabase SQL Editor**, exécute :

```sql
-- Supprimer le job s'il existe déjà
SELECT cron.unschedule('daily-streak-reminder');
```

**Résultat attendu** :
- `true` si le job existait et a été supprimé
- `false` si le job n'existait pas (c'est OK)

---

### Étape 4 : Créer le Nouveau Job

Copie le script complet avec **TA CLÉ** remplacée :

```sql
-- Créer le cron job avec la vraie clé service_role
SELECT cron.schedule(
  'daily-streak-reminder',
  '0 21 * * *',
  $$
  SELECT net.http_post(
    url := 'https://qbvdrkhdjjpuowthwinf.supabase.co/functions/v1/send-daily-streak-reminder',
    headers := jsonb_build_object(
      'Authorization', 
      'Bearer TA_VRAIE_CLÉ_ICI',
      'Content-Type',
      'application/json'
    ),
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
```

**Résultat attendu** :
```
jobid
-----
1
```

Un `jobid` (entier) signifie que le job a été créé avec succès ! ✅

---

### Étape 5 : Vérifier le Job

```sql
-- Vérifier que le job existe
SELECT 
  jobid,
  jobname,
  schedule,
  active,
  database,
  command
FROM cron.job
WHERE jobname = 'daily-streak-reminder';
```

**Résultat attendu** :
```
jobid | jobname                 | schedule    | active | database | command
------|-------------------------|-------------|--------|----------|----------
1     | daily-streak-reminder   | 0 21 * * *  | t      | postgres | SELECT net.http_post(...)
```

✅ Si tu vois une ligne avec `active = t`, c'est bon !

---

### Étape 6 : Tester Manuellement

**Avant de tester**, assure-toi que l'Edge Function est déployée :
```bash
supabase functions deploy send-daily-streak-reminder
```

Ensuite, teste l'appel HTTP :

```sql
-- Test manuel (avec TA CLÉ remplacée)
SELECT net.http_post(
  url := 'https://qbvdrkhdjjpuowthwinf.supabase.co/functions/v1/send-daily-streak-reminder',
  headers := jsonb_build_object(
    'Authorization', 
    'Bearer TA_VRAIE_CLÉ_ICI',
    'Content-Type',
    'application/json'
  ),
  body := '{}'::jsonb
) AS request_id;
```

**Résultat attendu** :
```
request_id
----------
123456789
```

Un entier = succès ! ✅

---

### Étape 7 : Vérifier les Logs

1. **Supabase Dashboard** → **Edge Functions**
2. Cliquer sur **send-daily-streak-reminder**
3. Onglet **Logs**
4. Chercher les lignes contenant `[Cron]`

**Logs attendus** :
```
[Cron] Starting daily streak reminder job...
[Cron] Found 3 users at risk
[Cron] Found 2 active subscriptions
[Cron] Job complete: 2 sent, 0 failed
```

---

## 🐛 Dépannage

### Erreur : `could not find valid entry for job`

**Cause** : Le job n'a jamais été créé ou a échoué à la création.

**Solution** :
1. Vérifier que `cron.schedule()` retourne un `jobid` (pas NULL)
2. Si NULL, vérifier les logs PostgreSQL pour l'erreur
3. S'assurer que l'extension `pg_cron` est activée :
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'pg_cron';
   ```

### Erreur : `404 Not Found` lors du test

**Cause** : L'Edge Function n'est pas déployée.

**Solution** :
```bash
supabase functions deploy send-daily-streak-reminder
```

### Erreur : `401 Unauthorized`

**Cause** : La clé service_role est incorrecte ou manquante.

**Solution** :
1. Vérifier que tu as copié la **vraie** clé depuis Supabase Dashboard
2. Vérifier qu'il n'y a pas d'espaces avant/après la clé
3. La clé doit commencer par `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.`

### Le Job Ne S'Exécute Pas à 21h

**Vérifier l'historique** :
```sql
SELECT 
  start_time,
  end_time,
  status,
  return_message
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'daily-streak-reminder')
ORDER BY start_time DESC
LIMIT 5;
```

**Si vide** : Le job n'a jamais été exécuté (attendre 21h ou tester manuellement).

**Si erreurs** : Vérifier `return_message` pour le détail.

---

## 🔒 Sécurité

### ⚠️ IMPORTANT : Ne JAMAIS committer la clé service_role

La clé service_role donne un **accès complet** à ta base de données. Elle doit rester **secrète**.

**Bonnes pratiques** :

1. **Créer un fichier .sql local (non versionné)** :
   ```bash
   # Ajouter au .gitignore
   echo "setup_daily_streak_reminder_cron_WITH_KEY.sql" >> .gitignore
   ```

2. **Copier le script et remplacer la clé dans ce fichier local**

3. **Ne committer QUE la version avec le placeholder** :
   ```sql
   'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',  -- ⚠️ REMPLACER
   ```

4. **Exécuter le script local dans Supabase SQL Editor**

---

## ✅ Checklist Finale

Avant de considérer le cron job comme configuré :

- [ ] Service role key récupérée depuis Supabase Dashboard
- [ ] Clé remplacée dans le script SQL (version locale)
- [ ] Edge Function déployée (`supabase functions deploy`)
- [ ] VAPID keys configurées (`supabase secrets set`)
- [ ] Ancien job supprimé (`cron.unschedule`)
- [ ] Nouveau job créé (`cron.schedule` → retourne jobid)
- [ ] Job visible dans `cron.job` avec `active = t`
- [ ] Test manuel réussi (net.http_post → retourne request_id)
- [ ] Logs Edge Function montrent `[Cron]` messages
- [ ] Fichier avec clé réelle ajouté au .gitignore

---

## 📝 Alternative : Utiliser Supabase Dashboard

Si tu préfères ne pas mettre la clé dans SQL, utilise **Supabase Cron Jobs UI** (si disponible) :

1. Dashboard → Project Settings → Cron Jobs
2. New Cron Job
3. Name: `daily-streak-reminder`
4. Schedule: `0 21 * * *`
5. Endpoint: `https://qbvdrkhdjjpuowthwinf.supabase.co/functions/v1/send-daily-streak-reminder`
6. Headers: Ajouter `Authorization: Bearer [service_role_key]`

Cela évite de mettre la clé dans SQL.

---

**Dernière mise à jour** : 22 Octobre 2025  
**Status** : Guide complet avec solution au problème `current_setting`  
**Next** : Remplacer la clé → Créer le job → Tester
