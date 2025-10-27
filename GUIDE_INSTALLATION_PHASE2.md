# 🚀 PROCÉDURE DE RÉINSTALLATION COMPLÈTE
**Phase 1 + Phase 2 - Compétitions avec Notifications & Badges**

---

## ⚠️ PROBLÈME DIAGNOSTIQUÉ

L'erreur `operator does not exist: character varying = uuid` + 404 sur `complete_competition_participant` indique que :
1. ❌ Les fonctions SQL n'ont **pas été exécutées** dans Supabase Dashboard
2. ❌ Ou des anciennes versions bugguées existent encore en base
3. ❌ Les dépendances entre fonctions ne sont pas respectées

---

## 🛠️ SOLUTION: RÉINSTALLATION PROPRE

### 📋 ÉTAPE 1: Ouvrir Supabase Dashboard

1. **Aller sur**: https://supabase.com/dashboard/project/qbvdrkhdjjpuowthwinf
2. **Cliquer sur**: SQL Editor (dans la barre latérale gauche)
3. **Créer**: New Query

---

### 🧹 ÉTAPE 2: Nettoyer l'existant (1 minute)

**Copier-coller** tout le contenu de `REINSTALL_COMPETITIONS_PHASE2.sql` dans le SQL Editor.

**Cliquer sur** `Run` → Ce script va :
- ✅ Supprimer tous les triggers
- ✅ Supprimer toutes les fonctions (CASCADE)
- ✅ Supprimer toutes les policies conflictuelles

**Résultat attendu** : "Success" (même s'il y a des warnings "does not exist")

---

### 📦 ÉTAPE 3: Réinstaller Phase 2 Notifications (3 minutes)

**3.1 Ouvrir le fichier** `ADD_COMPETITIONS_NOTIFICATIONS.sql`

**3.2 Copier TOUT le contenu** (307 lignes)

**3.3 Coller dans SQL Editor** → Cliquer `Run`

**Ce qui va être créé** :
```sql
✅ 4 tables:
   - push_subscriptions (notifications web push)
   - competition_notifications (historique notifications)
   - competition_badges (catalogue 12 badges)
   - user_badges (badges gagnés par utilisateur)

✅ 3 triggers:
   - notify_competition_registration (notif inscription)
   - notify_leaderboard_update (notif nouveau record)
   - notify_badge_earned (notif badge gagné)

✅ 8 RLS policies (sécurité Supabase)

✅ 16 badges seeded (🥇 Champion, ⚡ Speedster, etc.)
```

**Résultat attendu** : "Success. No rows returned"

---

### 🔧 ÉTAPE 4: Réinstaller fonctions Notifications (2 minutes)

**4.1 Ouvrir le fichier** `ADD_COMPETITIONS_NOTIFICATIONS_FUNCTIONS.sql`

**4.2 Copier TOUT le contenu** (455 lignes)

**4.3 Coller dans SQL Editor** → Cliquer `Run`

**Ce qui va être créé** :
```sql
✅ create_notification() - Créer une notification
✅ get_user_notifications() - Récupérer les notifications
✅ mark_notifications_read() - Marquer comme lues
✅ get_unread_notifications_count() - Compter non lues
✅ schedule_competition_reminders() - Rappels automatiques
✅ check_and_award_badges() - Attribution badges
✅ get_user_badges() - Récupérer badges utilisateur
✅ check_personal_record() - Vérifier nouveau record
```

**Résultat attendu** : "Success. No rows returned"

---

### 🏆 ÉTAPE 5: Réinstaller fonctions Compétitions (2 minutes)

**5.1 Ouvrir le fichier** `ADD_COMPETITIONS_FUNCTIONS.sql`

**5.2 Copier TOUT le contenu** (487 lignes)

**5.3 Coller dans SQL Editor** → Cliquer `Run`

**Ce qui va être créé** :
```sql
✅ join_competition() - Inscription
✅ submit_competition_answer() - Soumettre réponse
✅ complete_competition_participant() - ⭐ FIX ligne 239
✅ update_competition_ranks() - Calcul rangs
✅ update_francophone_leaderboard() - Classement régional
✅ get_competition_leaderboard() - Récupérer leaderboard
```

**IMPORTANT** : Cette étape contient le fix de la ligne 239 :
```sql
-- ✅ CORRECT (après fix)
PERFORM create_notification(
    v_participant.user_id,
    'competition_completed',
    v_competition.title || ' terminé !',
    'Rang #' || v_rank || ' - Score: ' || v_participant.score || ' points',
    v_participant.competition_id,  -- ⭐ competition_id SÉPARÉ
    jsonb_build_object(...)
);
```

**Résultat attendu** : "Success. No rows returned"

---

### ✅ ÉTAPE 6: Vérification (30 secondes)

**6.1 Copier-coller ce SQL** dans le SQL Editor :

```sql
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
      'join_competition',
      'submit_competition_answer',
      'complete_competition_participant',
      'update_competition_ranks',
      'update_francophone_leaderboard',
      'get_competition_leaderboard',
      'create_notification',
      'check_and_award_badges',
      'check_personal_record',
      'get_user_notifications',
      'mark_notifications_read',
      'get_user_badges',
      'schedule_competition_reminders'
  )
ORDER BY routine_name;
```

**6.2 Cliquer** `Run`

**Résultat attendu** :
```
✅ 13 lignes retournées (13 fonctions installées)
```

**Si vous voyez moins de 13** → Une fonction n'a pas été créée, relire les erreurs dans SQL Editor.

---

### 🧪 ÉTAPE 7: Test dans l'app (1 minute)

**7.1 Retourner sur** http://localhost:3000/competitions

**7.2 Recharger la page** (F5)

**7.3 Cliquer sur une compétition** → Démarrer Quiz

**7.4 Répondre aux 10 questions**

**7.5 Terminer le quiz**

**Résultat attendu** :
```
✅ Modal de résultats s'affiche
✅ Score affiché
✅ Rang affiché
✅ Badges affichés (si gagnés)
✅ Bouton "Partager" visible
✅ Aucune erreur dans Console
```

---

## 🔥 SI L'ERREUR PERSISTE

### Cas 1: "404 complete_competition_participant"
→ La fonction n'existe pas dans Supabase
→ **Solution**: Réexécuter `ADD_COMPETITIONS_FUNCTIONS.sql`

### Cas 2: "operator does not exist: character varying = uuid"
→ Problème de type de données (paramètre mal passé)
→ **Solution**: Vérifier dans `competitionService.js` ligne 173 :
```javascript
// ✅ CORRECT
const { data, error } = await supabase.rpc('complete_competition_participant', {
    p_participant_id: participantId  // ⭐ Doit être UUID, pas STRING
});
```

### Cas 3: Fonction existe mais erreur
→ Ancienne version bugguée encore en cache
→ **Solution**: Exécuter le nettoyage (ÉTAPE 2) puis réinstaller (ÉTAPE 3-5)

---

## 📊 ÉTAT FINAL ATTENDU

```
Base de données Supabase:
├── ✅ 4 nouvelles tables (notifications, badges)
├── ✅ 3 triggers (notif auto)
├── ✅ 13 fonctions RPC
├── ✅ 16 badges seeded
└── ✅ 8 RLS policies

Frontend React:
├── ✅ NotificationPanel (cloche avec compteur)
├── ✅ SocialShareModal (partage WhatsApp/Twitter)
├── ✅ pushNotificationService (Web Push)
├── ✅ Service Worker (public/sw.js)
└── ✅ CompetitionQuizPage (intégration complète)
```

---

## ⏱️ TEMPS TOTAL

- **Nettoyage**: 1 min
- **Phase 2 Notifications**: 3 min
- **Phase 2 Fonctions**: 2 min
- **Phase 1 Fonctions**: 2 min
- **Vérification**: 30 sec
- **Test**: 1 min

**TOTAL**: ~10 minutes pour une installation propre

---

## 🎯 OBJECTIF

Après cette procédure :
1. ✅ Toutes les fonctions SQL seront installées
2. ✅ Les dépendances seront respectées (notifications → compétitions)
3. ✅ Le quiz se terminera sans erreur 404
4. ✅ Les badges seront attribués automatiquement
5. ✅ Le partage social fonctionnera

**C'est parti ! 🚀**
