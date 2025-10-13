# 🚀 Guide de Migration 004 - Points History

## 📋 Étapes pour exécuter la migration

### 1. Ouvrir Supabase Dashboard

1. Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet **E-Réussite**
3. Dans le menu latéral gauche, cliquez sur **SQL Editor**

### 2. Copier le SQL

Le fichier SQL à exécuter se trouve ici :
```
database/migrations/004_points_history.sql
```

**Contenu à copier** (tout le fichier) :

```sql
-- ============================================
-- MIGRATION 004: Points History Tracking
-- ============================================

CREATE TABLE IF NOT EXISTS user_points_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points_earned INT NOT NULL,
  action_type TEXT NOT NULL,
  action_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_points_history_user_id ON user_points_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_points_history_created_at ON user_points_history(created_at);
CREATE INDEX IF NOT EXISTS idx_user_points_history_user_created ON user_points_history(user_id, created_at DESC);

ALTER TABLE user_points_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own points history"
  ON user_points_history
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert points history"
  ON user_points_history
  FOR INSERT
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION get_user_points_history(
  p_user_id UUID,
  p_days INT DEFAULT 7
)
RETURNS TABLE (
  date DATE,
  points_earned INT,
  actions_count INT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(created_at) as date,
    SUM(points_earned)::INT as points_earned,
    COUNT(*)::INT as actions_count
  FROM user_points_history
  WHERE user_id = p_user_id
    AND created_at >= NOW() - (p_days || ' days')::INTERVAL
  GROUP BY DATE(created_at)
  ORDER BY DATE(created_at) ASC;
END;
$$;

SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'user_points_history'
ORDER BY ordinal_position;

SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'user_points_history';

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'user_points_history';
```

### 3. Exécuter dans SQL Editor

1. Dans Supabase SQL Editor, cliquez sur **"+ New query"**
2. Collez tout le contenu du fichier SQL ci-dessus
3. Cliquez sur **"Run"** (ou appuyez sur `Ctrl+Enter`)

### 4. Vérifier le résultat

Vous devriez voir plusieurs sections de résultats :

#### ✅ Résultat 1 : Colonnes de la table
```
table_name              | column_name      | data_type
user_points_history     | id               | uuid
user_points_history     | user_id          | uuid
user_points_history     | points_earned    | integer
user_points_history     | action_type      | text
user_points_history     | action_details   | jsonb
user_points_history     | created_at       | timestamp with time zone
```

#### ✅ Résultat 2 : Indexes créés
```
3 indexes affichés :
- idx_user_points_history_user_id
- idx_user_points_history_created_at
- idx_user_points_history_user_created
```

#### ✅ Résultat 3 : RLS Policies
```
2 policies affichées :
- Users can view their own points history (SELECT)
- Service role can insert points history (INSERT)
```

### 5. Si erreur "already exists"

Si vous voyez des erreurs comme `"already exists"`, c'est **NORMAL** ! 

Cela signifie que la table/index/policy existe déjà. Le SQL utilise `IF NOT EXISTS` pour éviter les doublons.

**Action** : Ignorez ces erreurs et passez à l'étape suivante.

---

## 🧪 Test après migration

### 1. Vérifier que la table existe

Dans SQL Editor, exécutez :

```sql
SELECT * FROM user_points_history LIMIT 5;
```

**Résultat attendu** : 
- Si aucune donnée : Table vide (normal, aucun historique encore)
- Si données : Vos points existants

### 2. Tester l'application

1. **Rafraîchir le Dashboard**
   - Appuyez sur `Ctrl+Shift+R` (rafraîchissement dur)
   - Ou fermez et rouvrez l'onglet

2. **Vérifier le nouveau graphique**
   - Scrollez jusqu'à la section avant le "Leaderboard"
   - Vous devriez voir une nouvelle carte "📊 Évolution des Points"

3. **État vide (si pas d'historique)**
   - Icône calendrier 📅
   - Message : "Pas encore de données"
   - Sous-texte encourageant

4. **Compléter un quiz**
   - Allez dans "Quiz" → Choisissez un quiz → Complétez-le
   - Retournez au Dashboard (`Ctrl+Shift+R`)
   - Le graphique devrait maintenant afficher une barre/point pour aujourd'hui

5. **Vérifier les fonctionnalités**

   ✅ **4 cartes de stats en haut** :
   - 🔵 Total points (bleu)
   - 🟢 Moyenne/jour (vert)
   - 🟡 Record (jaune/ambre)
   - 🟣 Jours actifs (violet)

   ✅ **Boutons de toggle** :
   - "Ligne" : Graphique en ligne
   - "Zone" : Graphique en zone (rempli)

   ✅ **Graphique interactif** :
   - Survolez les points → Tooltip apparaît
   - Tooltip montre : Date, Points, Nombre d'actions, Détails

   ✅ **Responsive** :
   - Réduisez la fenêtre → Le graphique s'adapte
   - Mobile-friendly

---

## 🐛 Dépannage

### Problème 1 : "Table already exists"

**Cause** : La table a déjà été créée lors d'un test précédent.

**Solution** : 
- Ignorez l'erreur (le SQL utilise `IF NOT EXISTS`)
- OU supprimez la table et réexécutez :
  ```sql
  DROP TABLE IF EXISTS user_points_history CASCADE;
  ```
  Puis réexécutez la migration complète.

### Problème 2 : Le graphique ne s'affiche pas

**Vérifications** :
1. ✅ Migration exécutée avec succès ?
2. ✅ Dashboard rafraîchi (`Ctrl+Shift+R`) ?
3. ✅ Console browser sans erreur ? (F12 → Console)
4. ✅ État vide affiché (icône calendrier) ? → Normal si pas d'historique

**Solution** :
- Ouvrez la console (F12)
- Cherchez des erreurs rouges
- Si erreur `user_points_history does not exist` → Migration non exécutée
- Si erreur `permission denied` → Problème RLS policies

### Problème 3 : Les points ne s'enregistrent pas dans l'historique

**Vérification** :
```sql
SELECT * FROM user_points_history WHERE user_id = 'VOTRE_USER_ID';
```

**Si vide après avoir complété un quiz** :
1. Vérifiez la console browser pour erreurs
2. Vérifiez que `awardPoints` est bien appelé
3. Vérifiez les policies RLS :
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'user_points_history';
   ```

### Problème 4 : Erreur "function does not exist"

**Cause** : La fonction `get_user_points_history` n'a pas été créée.

**Solution** :
Exécutez uniquement la partie fonction :
```sql
CREATE OR REPLACE FUNCTION get_user_points_history(
  p_user_id UUID,
  p_days INT DEFAULT 7
)
RETURNS TABLE (
  date DATE,
  points_earned INT,
  actions_count INT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(created_at) as date,
    SUM(points_earned)::INT as points_earned,
    COUNT(*)::INT as actions_count
  FROM user_points_history
  WHERE user_id = p_user_id
    AND created_at >= NOW() - (p_days || ' days')::INTERVAL
  GROUP BY DATE(created_at)
  ORDER BY DATE(created_at) ASC;
END;
$$;
```

---

## 📊 Exemple de données attendues

Après avoir complété 3 quiz aujourd'hui (5 oct), la table devrait contenir :

```sql
id                                   | user_id      | points_earned | action_type      | created_at
-------------------------------------|--------------|---------------|------------------|-------------------
uuid-1                               | your-uuid    | 100           | quiz_completion  | 2025-10-05 10:30
uuid-2                               | your-uuid    | 50            | quiz_completion  | 2025-10-05 14:20
uuid-3                               | your-uuid    | 75            | quiz_completion  | 2025-10-05 16:45
```

Et le graphique affichera :
- **05 oct** : 225 points (3 actions)

---

## 🎯 Checklist finale

Avant de dire que tout fonctionne, vérifiez :

- [ ] Migration exécutée sans erreur bloquante
- [ ] Table `user_points_history` existe (vérifiée via SQL)
- [ ] Fonction `get_user_points_history` créée
- [ ] Dashboard rafraîchi
- [ ] Nouveau graphique visible dans Dashboard
- [ ] État vide affiché si pas d'historique (icône calendrier)
- [ ] Quiz complété → Entrée dans `user_points_history`
- [ ] Dashboard rafraîchi → Graphique mis à jour avec données
- [ ] 4 cartes de stats affichées
- [ ] Boutons Ligne/Zone fonctionnent
- [ ] Tooltip affiche les détails au survol
- [ ] Responsive sur mobile

---

## 📞 Support

Si vous rencontrez des problèmes :

1. **Vérifiez la console browser** (F12) pour erreurs JavaScript
2. **Vérifiez la console Supabase** pour erreurs SQL
3. **Consultez** `GRAPHIQUE_POINTS_IMPLEMENTATION.md` pour détails techniques
4. **Réessayez** la migration depuis zéro si nécessaire

---

## ✅ Prochaines étapes

Une fois le graphique fonctionnel :

1. **Phase 4 : Défis quotidiens/hebdomadaires**
   - Défis personnalisés
   - Récompenses bonus
   - Progression visuelle

2. **Phase 5 : Notifications push**
   - Rappels quotidiens
   - Notifications de nouveaux badges
   - Rappels de streak

Bon courage ! 🚀
