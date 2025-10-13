# 🔧 SOLUTION RAPIDE LEADERBOARD

## Problème
Le Leaderboard n'affiche qu'1 utilisateur au lieu de 3, même après Ctrl+Shift+R.
La console ne montre aucune erreur ni le message de debug.

## Hypothèses
1. **RLS (Row Level Security)** : Supabase bloque l'accès aux autres profils
2. **Cache navigateur** : Le code n'a pas été rechargé malgré HMR
3. **Filtre manquant** : Un filtre ou condition cache les autres utilisateurs

## Solutions à tester

### ✅ Solution 1 : Vérifier les politiques RLS (PRIORITAIRE)

Exécutez dans Supabase SQL Editor :
```sql
-- Voir si RLS est activé
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'profiles';

-- Voir les politiques RLS
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

**Si `rowsecurity = true`** → Il y a probablement une politique qui bloque la lecture des autres profils.

**Solution** : Désactiver temporairement RLS pour les tests :
```sql
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
```

Ou créer une politique permissive :
```sql
CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT 
USING (true);
```

---

### ✅ Solution 2 : Vider tout le cache navigateur

1. Ouvrir la page Leaderboard
2. **F12** → Onglet **Application** (Chrome) ou **Stockage** (Firefox)
3. Clic droit sur le site → **Clear site data** / **Effacer les données du site**
4. Cocher :
   - ✅ Local Storage
   - ✅ Session Storage
   - ✅ Cookies
   - ✅ Cache Storage
5. Cliquer sur **Clear data**
6. **Fermer complètement le navigateur**
7. Rouvrir et tester

---

### ✅ Solution 3 : Tester en mode navigation privée

1. Ouvrir une **fenêtre de navigation privée** (Ctrl+Shift+N)
2. Aller sur http://localhost:3000/leaderboard
3. Se connecter
4. Vérifier combien d'utilisateurs s'affichent

Si ça affiche 3 utilisateurs → C'est un problème de cache  
Si ça affiche toujours 1 → C'est un problème RLS ou de code

---

### ✅ Solution 4 : Ajouter des logs de debug partout

Dans `Leaderboard.jsx`, ligne 337, remplacer la fonction `fetchLeaderboard` par :

```javascript
const fetchLeaderboard = async () => {
  console.log('🚀 FETCH START');
  setLoading(true);
  try {
    // Fetch all profiles
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url');

    console.log('👥 Profiles fetched:', profilesData?.length, profilesData);
    if (profilesError) {
      console.error('❌ Profiles error:', profilesError);
      throw profilesError;
    }

    // Fetch all user_points
    const { data: pointsData } = await supabase
      .from('user_points')
      .select('user_id, total_points, level, current_streak');

    console.log('💰 Points fetched:', pointsData?.length);

    // ... rest of the code
  } catch (error) {
    console.error('❌ Error fetching leaderboard:', error);
  }
};
```

---

## Prochaine étape

**TESTEZ D'ABORD** : Exécutez `check_rls_profiles.sql` dans Supabase et partagez le résultat.

Cela nous dira si le problème vient de RLS (très probable).
