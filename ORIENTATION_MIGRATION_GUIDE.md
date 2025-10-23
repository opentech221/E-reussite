# 📋 GUIDE DE MIGRATION - Champs Socio-économiques

## 📅 Date : 23 octobre 2025

---

## 🎯 OBJECTIF

Ajouter 4 nouveaux champs à la table `careers` pour supporter le matching contextuel basé sur :
- **Contraintes financières** de l'étudiant
- **Réseau familial/professionnel** disponible
- **Localisation géographique** préférée
- **Compatibilité religieuse** du métier

---

## 📁 FICHIERS CONCERNÉS

| Fichier | Description |
|---------|-------------|
| `ORIENTATION_MIGRATION_ADD_SOCIO_FIELDS.sql` | Script SQL de migration complet |
| `ORIENTATION_MVP_SETUP.md` | Documentation mise à jour avec les nouveaux champs |
| `src/services/orientationService.js` | Algorithme de matching mis à jour |

---

## ⚙️ ÉTAPES D'EXÉCUTION

### **ÉTAPE 1 : Sauvegarde de sécurité** ✅

Avant toute modification, **sauvegarder la table `careers`** :

#### Option A : Via Supabase Dashboard
1. Aller dans **Table Editor** > `careers`
2. Cliquer sur **"Export to CSV"** ou **"Export to JSON"**
3. Sauvegarder le fichier avec le nom : `careers_backup_23oct2025.csv`

#### Option B : Via SQL (si vous avez accès direct)
```sql
CREATE TABLE careers_backup_23oct2025 AS 
SELECT * FROM careers;
```

---

### **ÉTAPE 2 : Exécuter la migration** 🚀

1. **Ouvrir Supabase SQL Editor** :
   - Dashboard Supabase > **SQL Editor**
   - Ou : https://app.supabase.com/project/[VOTRE_PROJECT_ID]/sql

2. **Copier le contenu complet** du fichier `ORIENTATION_MIGRATION_ADD_SOCIO_FIELDS.sql`

3. **Coller dans l'éditeur SQL**

4. **Exécuter le script** :
   - Cliquer sur **"Run"**
   - Ou appuyer sur `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

5. **Vérifier les résultats** :
   - Le script affiche automatiquement les 20 métiers avec leurs nouveaux champs
   - Vérifier que toutes les lignes sont présentes et cohérentes

---

### **ÉTAPE 3 : Vérification manuelle** ✔️

Exécuter cette requête pour contrôler les valeurs :

```sql
-- Compter les métiers par valeur de chaque champ
SELECT 
  financial_requirement, 
  COUNT(*) as count 
FROM careers 
GROUP BY financial_requirement;

SELECT 
  requires_network, 
  COUNT(*) as count 
FROM careers 
GROUP BY requires_network;

SELECT 
  preferred_location, 
  COUNT(*) as count 
FROM careers 
GROUP BY preferred_location;

SELECT 
  religious_friendly, 
  COUNT(*) as count 
FROM careers 
GROUP BY religious_friendly;
```

**Résultats attendus** :
- `financial_requirement` : ~6 low, ~8 medium, ~6 high
- `requires_network` : ~12 true, ~8 false
- `preferred_location` : ~12 urban, ~5 semi-urban, ~3 rural
- `religious_friendly` : ~19 neutral, ~1 friendly

---

### **ÉTAPE 4 : Tests d'intégration** 🧪

#### Test 1 : Matching financier
Simuler un profil avec contrainte financière élevée :
```javascript
const testPreferences = {
  financial_constraint: 'Élevée (études longues difficiles)',
  // ...autres préférences
};
```
**Résultat attendu** : les métiers `financial_requirement = 'high'` (Ingénieur Info, Médecin, Avocat, etc.) doivent avoir une pénalité de -15 points.

#### Test 2 : Matching réseau
Profil avec réseau familial faible + métier nécessitant un réseau :
```javascript
const testPreferences = {
  network_access: 'Limité',
  // ...
};
```
**Résultat attendu** : métiers avec `requires_network = true` reçoivent un bonus réduit (+5 au lieu de +10).

#### Test 3 : Matching localisation
Profil rural + métier urbain :
```javascript
const testPreferences = {
  location: 'rural',
  // ...
};
```
**Résultat attendu** : métiers avec `preferred_location = 'urban'` ont une pénalité de -5 points.

#### Test 4 : Matching religieux
Profil avec importance religieuse élevée (80/100) :
```javascript
const testPreferences = {
  religious_importance: 80,
  // ...
};
```
**Résultat attendu** : 
- Métiers `religious_friendly = 'friendly'` (Assistant Social) : +10 points
- Métiers `religious_friendly = 'challenging'` : -10 points

---

## 🔄 ROLLBACK (si nécessaire)

Si la migration pose problème, **revenir en arrière** :

```sql
-- Supprimer les nouvelles colonnes
ALTER TABLE careers 
DROP COLUMN IF EXISTS financial_requirement,
DROP COLUMN IF EXISTS requires_network,
DROP COLUMN IF EXISTS preferred_location,
DROP COLUMN IF EXISTS religious_friendly;

-- Restaurer depuis la sauvegarde (si Option B)
DROP TABLE careers;
ALTER TABLE careers_backup_23oct2025 RENAME TO careers;
```

Ou restaurer le CSV/JSON exporté via **Table Editor > Import**.

---

## 📊 VALEURS ASSIGNÉES PAR MÉTIER

| Métier | Financial | Network | Location | Religious |
|--------|-----------|---------|----------|-----------|
| Ingénieur Informatique | high | ✅ | urban | neutral |
| Médecin Généraliste | high | ✅ | urban | neutral |
| Data Scientist | high | ✅ | urban | neutral |
| Pharmacien | high | ✅ | urban | neutral |
| Expert Comptable | medium | ✅ | urban | neutral |
| Responsable Marketing | medium | ✅ | urban | neutral |
| Entrepreneur | medium | ✅ | semi-urban | neutral |
| Gestionnaire RH | medium | ✅ | urban | neutral |
| Designer Graphique | low | ✅ | urban | neutral |
| Community Manager | low | ✅ | urban | neutral |
| Journaliste | medium | ✅ | urban | neutral |
| Photographe Pro | low | ✅ | semi-urban | neutral |
| Avocat | high | ✅ | urban | neutral |
| Assistant Social | low | ❌ | semi-urban | **friendly** |
| Psychologue | medium | ❌ | urban | neutral |
| Électricien Bâtiment | low | ❌ | rural | neutral |
| Mécanicien Auto | low | ❌ | semi-urban | neutral |
| Technicien Info | medium | ❌ | urban | neutral |
| Agronome | medium | ❌ | rural | neutral |
| Vétérinaire | high | ❌ | rural | neutral |

---

## ✅ CHECKLIST DE VALIDATION

- [ ] Sauvegarde de la table `careers` effectuée
- [ ] Script SQL `ORIENTATION_MIGRATION_ADD_SOCIO_FIELDS.sql` exécuté sans erreur
- [ ] Requête de vérification affiche 20 métiers avec les 4 nouveaux champs
- [ ] Comptage par valeur cohérent (voir ÉTAPE 3)
- [ ] Test d'intégration 1 (financier) : ✅
- [ ] Test d'intégration 2 (réseau) : ✅
- [ ] Test d'intégration 3 (localisation) : ✅
- [ ] Test d'intégration 4 (religieux) : ✅
- [ ] Commit git : `git add . && git commit -m "feat: Ajout champs socio-économiques matching orientation"`

---

## 📞 SUPPORT

En cas de problème :
1. **Vérifier les logs Supabase** (Dashboard > Logs)
2. **Consulter la documentation** : `ORIENTATION_MVP_SETUP.md`
3. **Rollback si nécessaire** (voir section ROLLBACK ci-dessus)

---

**Durée estimée de la migration** : ~2 minutes  
**Impact utilisateur** : Aucun (si migration exécutée hors heures de pointe)
