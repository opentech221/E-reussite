# 🧪 TESTS D'INTÉGRATION - MATCHING CONTEXTUEL

## 📅 Date : 23 octobre 2025

---

## 🎯 OBJECTIF

Valider que le nouveau système de matching prend correctement en compte les dimensions socio-économiques et religieuses dans le calcul de compatibilité des métiers.

---

## 📋 SCÉNARIOS DE TEST

### **TEST 1 : Étudiant Rural avec Contraintes Financières Élevées** 🌾💰

**Profil utilisateur** :
- **Nom** : Aminata (BFEM)
- **Localisation** : Rural (village de Casamance)
- **Contrainte financière** : Élevée (études longues difficiles)
- **Réseau familial** : Limité
- **Accès Internet** : Limité
- **Importance religieuse** : Modérée (50/100)

**Réponses au questionnaire** :
```javascript
const answersAminata = {
  Q1: ['Mathématiques', 'SVT', 'Physique'],              // Matières aimées
  Q2: ['Français', 'Anglais'],                            // Matières détestées
  Q3: 'Terrain',                                           // Environnement travail
  Q4: 5,   // Scientifique (Mathématiques)
  Q5: 2,   // Littéraire (Lecture/Écriture)
  Q6: 4,   // Technique (Réparer)
  Q7: 2,   // Artistique (Créer)
  Q8: 4,   // Social (Aider)
  Q9: 2,   // Commercial (Vendre)
  Q10: 4,  // Scientifique (Expériences)
  Q11: 2,  // Littéraire (Débat)
  Q12: 5,  // Technique (Construire)
  Q13: 'Élevée (études longues difficiles)',              // Contrainte financière
  Q14: 'Oui, mais limité',                                // Réseau familial
  Q15: 'rural',                                            // Localisation
  Q16: 'Limité',                                           // Accès Internet
  Q17: 3,                                                  // Importance religieuse (1-5)
  Q18: 'Avoir un métier stable et aider ma communauté',  // Objectifs carrière
  Q19: 'rural',                                            // Lieu de travail préféré
  Q20: 'Indépendance financière et respect de la famille' // Aspirations
};
```

**Résultats attendus** :
- ✅ **Métiers favorisés** (compatibilité > 70) :
  - Électricien Bâtiment (low financial + rural + technique)
  - Mécanicien Automobile (low financial + semi-urban + technique)
  - Agronome (medium financial + rural + scientifique)
  
- ❌ **Métiers pénalisés** (compatibilité < 50) :
  - Ingénieur Informatique (high financial -15, urban -5)
  - Médecin Généraliste (high financial -15, urban -5)
  - Data Scientist (high financial -15, urban -5)

**Critères de validation** :
- [ ] Au moins 1 métier avec `financial_requirement = 'low'` dans le Top 3
- [ ] Au moins 1 métier avec `preferred_location = 'rural'` dans le Top 5
- [ ] Aucun métier avec `financial_requirement = 'high'` dans le Top 5
- [ ] Score de compatibilité pour Électricien > 75

---

### **TEST 2 : Étudiant Urbain avec Fort Réseau Professionnel** 🏙️🤝

**Profil utilisateur** :
- **Nom** : Moussa (BAC)
- **Localisation** : Urbain (Dakar)
- **Contrainte financière** : Faible (famille peut financer)
- **Réseau familial** : Fort (famille d'entrepreneurs)
- **Accès Internet** : Fort et stable
- **Importance religieuse** : Faible (20/100)

**Réponses au questionnaire** :
```javascript
const answersMoussa = {
  Q1: ['Économie', 'Mathématiques', 'Anglais'],
  Q2: ['SVT', 'Physique'],
  Q3: 'Bureau',
  Q4: 3,   // Scientifique
  Q5: 4,   // Littéraire
  Q6: 2,   // Technique
  Q7: 3,   // Artistique
  Q8: 3,   // Social
  Q9: 5,   // Commercial
  Q10: 2,  // Scientifique
  Q11: 4,  // Littéraire
  Q12: 1,  // Technique
  Q13: 'Faible (famille peut financer)',
  Q14: 'Oui, réseau fort (entrepreneurs, professionnels)',
  Q15: 'urban',
  Q16: 'Fort et stable',
  Q17: 1,  // Importance religieuse faible
  Q18: 'Créer ma propre entreprise et innover',
  Q19: 'urban',
  Q20: 'Réussite financière et impact social'
};
```

**Résultats attendus** :
- ✅ **Métiers favorisés** :
  - Entrepreneur (medium financial + requires_network bonus +10)
  - Responsable Marketing (medium financial + requires_network bonus +10)
  - Expert Comptable (medium financial + requires_network bonus +10)
  - Ingénieur Informatique (requires_network bonus +10, urban match)
  
- ❌ **Métiers pénalisés** :
  - Électricien Bâtiment (rural -5, pas de réseau nécessaire)
  - Agronome (rural -5)
  - Vétérinaire (rural -5)

**Critères de validation** :
- [ ] Au moins 3 métiers avec `requires_network = true` dans le Top 5
- [ ] Entrepreneur dans le Top 3
- [ ] Aucun métier avec `preferred_location = 'rural'` dans le Top 5
- [ ] Score de compatibilité pour métiers urbains > 80

---

### **TEST 3 : Étudiant avec Forte Importance Religieuse** 🕌📿

**Profil utilisateur** :
- **Nom** : Fatou (BAC)
- **Localisation** : Semi-urbain (Thiès)
- **Contrainte financière** : Moyenne
- **Réseau familial** : Modéré
- **Accès Internet** : Modéré
- **Importance religieuse** : Très élevée (90/100)

**Réponses au questionnaire** :
```javascript
const answersFatou = {
  Q1: ['Français', 'Histoire-Géographie', 'SVT'],
  Q2: ['Mathématiques', 'Physique'],
  Q3: 'Mixte',
  Q4: 2,   // Scientifique
  Q5: 4,   // Littéraire
  Q6: 1,   // Technique
  Q7: 3,   // Artistique
  Q8: 5,   // Social (très élevé)
  Q9: 2,   // Commercial
  Q10: 3,  // Scientifique
  Q11: 4,  // Littéraire
  Q12: 1,  // Technique
  Q13: 'Moyenne',
  Q14: 'Oui, mais limité',
  Q15: 'semi-urban',
  Q16: 'Modéré',
  Q17: 5,  // Importance religieuse maximale (90/100 après normalisation)
  Q18: 'Aider les personnes en difficulté tout en respectant mes valeurs',
  Q19: 'semi-urban',
  Q20: 'Servir ma communauté et avoir un impact positif'
};
```

**Résultats attendus** :
- ✅ **Métiers favorisés** :
  - **Assistant Social** (religious_friendly = 'friendly' → +10 bonus)
  - Psychologue (social élevé, semi-urban compatible)
  - Gestionnaire RH (social + commercial)
  
- ⚠️ **Métiers neutres** :
  - Tous les métiers avec `religious_friendly = 'neutral'` (pas de bonus/pénalité)

**Critères de validation** :
- [ ] Assistant Social reçoit un bonus de +10 points
- [ ] Assistant Social dans le Top 3 si score social élevé
- [ ] Différence de score entre Assistant Social et autres métiers sociaux visible
- [ ] Aucun métier avec `religious_friendly = 'challenging'` dans le Top 5 (si ajouté plus tard)

---

### **TEST 4 : Étudiant sans Contraintes (Profil Privilégié)** 🎓✨

**Profil utilisateur** :
- **Nom** : Ibrahima (BAC)
- **Localisation** : Urbain (Dakar)
- **Contrainte financière** : Faible (aucune contrainte)
- **Réseau familial** : Fort (famille de médecins)
- **Accès Internet** : Fort et stable
- **Importance religieuse** : Modérée (50/100)

**Réponses au questionnaire** :
```javascript
const answersIbrahima = {
  Q1: ['Mathématiques', 'Physique', 'SVT', 'Chimie'],
  Q2: ['Arts plastiques'],
  Q3: 'Bureau',
  Q4: 5,   // Scientifique (très élevé)
  Q5: 2,   // Littéraire
  Q6: 4,   // Technique
  Q7: 1,   // Artistique
  Q8: 4,   // Social
  Q9: 2,   // Commercial
  Q10: 5,  // Scientifique
  Q11: 2,  // Littéraire
  Q12: 4,  // Technique
  Q13: 'Faible (famille peut financer)',
  Q14: 'Oui, réseau fort (entrepreneurs, professionnels)',
  Q15: 'urban',
  Q16: 'Fort et stable',
  Q17: 3,  // Importance religieuse modérée
  Q18: 'Devenir médecin et aider les gens',
  Q19: 'urban',
  Q20: 'Excellence professionnelle et contribution à la santé publique'
};
```

**Résultats attendus** :
- ✅ **Métiers favorisés** (basé principalement sur intérêts scientifiques) :
  - Médecin Généraliste (scientifique 95 + social 80 + pas de pénalité financière)
  - Ingénieur Informatique (scientifique 90 + technique 85 + réseau bonus)
  - Data Scientist (scientifique 95 + technique 80 + réseau bonus)
  - Pharmacien (scientifique 85 + pas de pénalité)
  
- ℹ️ **Métiers écartés** :
  - Métiers artistiques (score artistique faible)
  - Métiers littéraires (score littéraire faible)

**Critères de validation** :
- [ ] Aucune pénalité financière appliquée (financial_constraint = 'Faible')
- [ ] Bonus réseau de +10 pour tous les métiers `requires_network = true`
- [ ] Classement basé principalement sur la similarité des intérêts
- [ ] Médecin Généraliste ou Ingénieur Informatique dans le Top 2
- [ ] Score de compatibilité pour Top 1 > 85

---

## 🔍 MÉTHODE DE VALIDATION

### **Étape 1 : Préparation**
1. S'assurer que la migration SQL a été exécutée (20 métiers avec nouveaux champs)
2. Vérifier que `orientationService.js` contient les 20 questions (Q1-Q20)
3. Lancer le serveur de développement : `npm run dev`

### **Étape 2 : Exécution des tests**

Pour chaque profil :

```javascript
// Dans la console du navigateur (après avoir ouvert /orientation)
import { calculateOrientationScores, matchCareers } from '../services/orientationService';

// Exemple pour TEST 1 (Aminata)
const answersAminata = { /* voir ci-dessus */ };
const scores = calculateOrientationScores(answersAminata);
console.log('Scores domaines:', scores.domainScores);
console.log('Préférences contextuelles:', scores.preferences);

const matches = await matchCareers(scores.domainScores, scores.preferences, 'bfem');
console.log('Top 10 métiers:', matches.slice(0, 10));
```

### **Étape 3 : Vérification des résultats**

Pour chaque test, vérifier :
1. ✅ **Scores de domaines** calculés correctement (0-100)
2. ✅ **Préférences contextuelles** extraites (`financial_constraint`, `network_access`, etc.)
3. ✅ **Top 5 métiers** correspondent aux attentes
4. ✅ **Pénalités/bonus appliqués** :
   - Financial : -15 (high mismatch), -7 (medium mismatch)
   - Network : +10 (strong), +5 (limited)
   - Location : -5 (urban/rural mismatch)
   - Religious : +10 (friendly + high importance), -10 (challenging + high importance)

### **Étape 4 : Analyse des écarts**

Si les résultats ne correspondent pas :
- Vérifier les valeurs des métiers dans la table `careers`
- Ajuster les poids dans `matchCareers()` si nécessaire
- Tester avec des profils intermédiaires

---

## 📊 TABLEAU DE SUIVI DES TESTS

| Test | Profil | Exécuté | Résultat | Notes |
|------|--------|---------|----------|-------|
| 1 | Aminata (rural, contrainte financière) | ⬜ | - | - |
| 2 | Moussa (urbain, fort réseau) | ⬜ | - | - |
| 3 | Fatou (importance religieuse élevée) | ⬜ | - | - |
| 4 | Ibrahima (sans contraintes) | ⬜ | - | - |

---

## 🐛 DEBUG - Commandes utiles

### Vérifier les métiers en base
```sql
SELECT slug, title, financial_requirement, requires_network, preferred_location, religious_friendly
FROM careers
WHERE financial_requirement = 'low';
```

### Logs de matching détaillés
```javascript
// Ajouter dans matchCareers() avant le return
console.group('🎯 Matching détaillé');
compatibleCareers.forEach(career => {
  console.log(`${career.title}:`, {
    baseScore: career.compatibilityScore,
    financialPenalty: '...',
    networkBonus: '...',
    locationPenalty: '...',
    religiousAdjustment: '...'
  });
});
console.groupEnd();
```

---

## ✅ CRITÈRES DE SUCCÈS GLOBAUX

- [ ] Les 4 tests produisent des Top 5 cohérents avec le profil
- [ ] Les pénalités financières sont appliquées correctement
- [ ] Les bonus réseau sont visibles dans les scores
- [ ] Les ajustements de localisation fonctionnent
- [ ] Le bonus religieux pour Assistant Social est appliqué
- [ ] Aucune erreur console pendant les tests
- [ ] Les scores de compatibilité restent entre 0 et 100

---

**Date de validation prévue** : 23 octobre 2025  
**Responsable** : Équipe E-Réussite  
**Durée estimée** : 30-45 minutes pour les 4 tests
