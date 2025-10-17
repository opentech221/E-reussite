# 📊 TEMPLATE GOOGLE SHEETS - Coach IA v3.0 Tracking

## 🎯 Instructions de création (Lundi 21 Oct 9h30)

### **Étape 1 : Créer le document**
1. Ouvrir [Google Sheets](https://sheets.google.com)
2. Cliquer **"Nouveau document vierge"**
3. Renommer : **"Coach IA v3.0 - Tracking 21-28 Oct 2025"**

---

### **Étape 2 : Structure du tableau**

#### **FEUILLE 1 : Métriques Quotidiennes**

**Ligne 1 (En-têtes)** :
```
| A: Date | B: Temps (min) | C: Application (%) | D: NPS (/10) | E: Retour (%) | F: Sample | G: Notes |
```

**Lignes 2-8 (Données à collecter)** :
```
21/10/2025 | [À remplir] | [À remplir] | [À remplir] | [À remplir] | [À remplir] | Baseline Day 1
22/10/2025 |             |             |             |             |             | Jour 2
23/10/2025 |             |             |             |             |             | Jour 3
24/10/2025 |             |             |             |             |             | Jour 4
25/10/2025 |             |             |             |             |             | Jour 5
26/10/2025 |             |             |             |             |             | Jour 6
27/10/2025 |             |             |             |             |             | Jour 7
28/10/2025 |             |             |             |             |             | Final report 📊
```

**Ligne 10 (Moyennes - Formules)** :
```
MOYENNE | =AVERAGE(B2:B8) | =AVERAGE(C2:C8) | =AVERAGE(D2:D8) | =AVERAGE(E2:E8) | =SUM(F2:F8) | Moyenne semaine
```

**Ligne 11 (Min/Max)** :
```
MIN     | =MIN(B2:B8)     | =MIN(C2:C8)     | =MIN(D2:D8)     | =MIN(E2:E8)     |             | Valeur minimale
MAX     | =MAX(B2:B8)     | =MAX(C2:C8)     | =MAX(D2:D8)     | =MAX(E2:E8)     |             | Valeur maximale
```

**Ligne 13 (Objectifs - Seuils de succès)** :
```
OBJECTIF VERT ✅ | ≥ 3.9 | ≥ 21 | ≥ 9.0 | ≥ 37.5 |  | 4/4 = Communication immédiate
OBJECTIF JAUNE ⚠️ | ≥ 3.5 | ≥ 19 | ≥ 8.1 | ≥ 33.8 |  | 3/4 = Communication + amélioration
SEUIL ROUGE ❌    | < 3.5 | < 19 | < 8.1 | < 33.8 |  | <3/4 = Itération v3.1
```

**Ligne 16 (Status Final - Formules)** :
```
STATUS | =IF(B10>=3.9,"✅","❌") | =IF(C10>=21,"✅","❌") | =IF(D10>=9,"✅","❌") | =IF(E10>=37.5,"✅","❌") | =COUNTIF(B16:E16,"✅") | Score /4
```

---

#### **FEUILLE 2 : Conversion NPS → /10**

**Table de référence** (à copier-coller) :

| NPS Score | Équivalent /10 | Catégorie |
|-----------|----------------|-----------|
| > 70      | 10/10          | Excellent 🌟 |
| 50-70     | 9/10           | Très bon ✅ |
| 20-50     | 8/10           | Bon ⚠️ |
| 0-20      | 7/10           | Moyen ⚠️ |
| -20-0     | 6/10           | Faible ❌ |
| < -20     | < 6/10         | Critique 🚨 |

**Formule de conversion automatique** (à utiliser dans Feuille 1, colonne D) :
```
=IF(NPS_VALUE>70, 10, IF(NPS_VALUE>50, 9, IF(NPS_VALUE>20, 8, IF(NPS_VALUE>0, 7, 6))))
```

**Note** : Remplacer `NPS_VALUE` par la valeur brute NPS récupérée de Metric 3.

---

#### **FEUILLE 3 : Données Détaillées**

**Colonnes supplémentaires pour analyse approfondie** :

| Date | Users Quiz 24h | Users Exam 72h | Promoters | Passives | Detractors | Returning Users | One-time Users | Avg Messages/Conv |
|------|----------------|----------------|-----------|----------|------------|-----------------|----------------|-------------------|
| 21/10 |               |                |           |          |            |                 |                |                   |
| ...   |               |                |           |          |            |                 |                |                   |

**Source des données** :
- `Users Quiz 24h` : Metric 2, colonne `users_did_quiz`
- `Users Exam 72h` : Metric 2, colonne `users_did_exam`
- `Promoters/Passives/Detractors` : Metric 3
- `Returning/One-time Users` : Metric 4
- `Avg Messages/Conv` : Metric 5

---

### **Étape 3 : Formatage conditionnel**

#### **Pour la ligne 10 (Moyennes)** :

1. Sélectionner cellule **B10** (Temps moyen)
2. Menu **Format** → **Mise en forme conditionnelle**
3. Règle 1 : 
   - Si `≥ 3.9` → Fond **VERT** (#d9ead3)
   - Si `≥ 3.5` → Fond **JAUNE** (#fff2cc)
   - Si `< 3.5` → Fond **ROUGE** (#f4cccc)

4. Répéter pour **C10, D10, E10** avec leurs seuils respectifs

#### **Pour la ligne 16 (Status Final)** :

1. Sélectionner **F16** (Score /4)
2. Règle :
   - Si `= 4` → Fond **VERT** + Texte **"🎉 COMMUNICATION"**
   - Si `= 3` → Fond **JAUNE** + Texte **"✅ GO avec note"**
   - Si `= 2` → Fond **ORANGE** + Texte **"⚠️ Itération v3.1"**
   - Si `≤ 1` → Fond **ROUGE** + Texte **"❌ Post-mortem"**

---

### **Étape 4 : Graphiques recommandés**

#### **Graphique 1 : Évolution temporelle (Ligne)**

- **Type** : Graphique en courbes
- **Axe X** : Date (A2:A8)
- **Séries** :
  - Temps (B2:B8) - Couleur bleue
  - Application (C2:C8) - Couleur verte
  - NPS (D2:D8) - Couleur violette
  - Retour (E2:E8) - Couleur orange
- **Ligne horizontale** : Objectifs (3.9, 21, 9.0, 37.5)

#### **Graphique 2 : Indicateur jauge (Gauge)**

- **Objectif** : Afficher score final /4
- **Zones** :
  - 4/4 : VERT (0-100%)
  - 3/4 : JAUNE (75%)
  - 2/4 : ORANGE (50%)
  - ≤1/4 : ROUGE (≤25%)

---

## 📝 Template remplissage quotidien (22-28 Oct)

### **Routine 9h00-9h30** :

1. **Exécuter SQL Metric 1** → Noter `value` dans **B[ligne_du_jour]**
2. **Exécuter SQL Metric 2** → Noter `value` dans **C[ligne_du_jour]**
3. **Exécuter SQL Metric 3** → 
   - Noter `value` (NPS brut)
   - Convertir avec table Feuille 2
   - Entrer conversion dans **D[ligne_du_jour]**
4. **Exécuter SQL Metric 4** → Noter `value` dans **E[ligne_du_jour]**
5. **Noter `sample_size`** (Metric 1) dans **F[ligne_du_jour]**
6. **Calculer Δ vs veille** :
   ```
   = (B[aujourd'hui] - B[hier]) / B[hier] * 100
   ```
   Exemple : Si hier 3.2min, aujourd'hui 3.5min → +9.4%
7. **Noter observations** dans **G[ligne_du_jour]** :
   - Anomalies détectées
   - Événements particuliers (bug, déploiement, etc.)
   - Verbatims utilisateurs intéressants

---

## 🎯 Exemple de remplissage (Baseline 21 Oct)

**Hypothèse résultats lundi 21 Oct 9h00** :

| Date | Temps | Application | NPS | Retour | Sample | Notes |
|------|-------|-------------|-----|--------|--------|-------|
| 21/10 | 3.2 | 18.5 | 7.8 | 28.3 | 87 | Baseline Day 1 - NPS faible, temps OK |

**Interprétation** :
- ✅ Temps : 3.2min (82% objectif) → JAUNE ⚠️
- ❌ Application : 18.5% (88% objectif) → ROUGE ❌
- ❌ NPS : 7.8/10 (87% objectif) → ROUGE ❌
- ❌ Retour : 28.3% (75% objectif) → ROUGE ❌

**Score Jour 1** : **0/4 verts** → ⚠️ **Surveiller évolution jours suivants**

**Note importante** : Baseline Day 1 peut être faible (effet démarrage). L'important est la **moyenne semaine** et la **tendance** (amélioration continue).

---

## 📊 Template rapport final (28 Oct après-midi)

### **À générer dans Feuille 4 : Rapport Final**

```markdown
# 📊 COACH IA v3.0 - RAPPORT ANALYTICS SEMAINE 1
**Période** : 21-28 octobre 2025  
**Généré le** : 28/10/2025

---

## 🎯 RÉSULTATS GLOBAUX

| Métrique | Objectif | Moyenne | MIN | MAX | Écart-type | Status |
|----------|----------|---------|-----|-----|------------|--------|
| **Temps conversation** | ≥ 3.9 min | [B10] | [B11] | [B12] | =STDEV(B2:B8) | [B16] |
| **Application conseils** | ≥ 21% | [C10] | [C11] | [C12] | =STDEV(C2:C8) | [C16] |
| **NPS satisfaction** | ≥ 9.0/10 | [D10] | [D11] | [D12] | =STDEV(D2:D8) | [D16] |
| **Retour 7 jours** | ≥ 37.5% | [E10] | [E11] | [E12] | =STDEV(E2:E8) | [E16] |

**Score global** : [F16]/4 métriques vertes ✅

---

## 📈 ANALYSE TENDANCES

### Évolution quotidienne :
- **Tendance générale** : [Croissante ↗ / Stable → / Décroissante ↘]
- **Jour le plus performant** : [Date avec MAX moyennes]
- **Jour le moins performant** : [Date avec MIN moyennes]

### Observations qualitatives :
- [Copier colonne G Notes pour chaque jour]
- [Identifier patterns : jours semaine vs weekend, événements spéciaux, etc.]

---

## 💡 INSIGHTS CLÉS

### Points forts ✅ :
- [Lister métriques vertes]
- [Verbatims positifs utilisateurs]

### Points d'amélioration ⚠️ :
- [Lister métriques jaunes/rouges]
- [Causes identifiées]

### Recommandations 🚀 :
- [Actions v3.1 si nécessaire]
- [Optimisations suggérées]

---

## 🎯 DÉCISION FINALE

### Scénario sélectionné :

- [ ] **A - Communication immédiate** (4/4 verts) 🎉
  - Annonce utilisateurs in-app
  - Slides investisseurs
  - Article blog

- [ ] **B - Communication + amélioration** (3/4 verts) ✅
  - Communication avec note transparence
  - Plan amélioration métrique(s) faible(s)

- [ ] **C - Itération v3.1 ciblée** (2/4 verts) ⚠️
  - Sprint 1 semaine (29 Oct - 4 Nov)
  - Focus sur [métriques rouges]
  - Re-test Semaine 2 (5-12 Nov)

- [ ] **D - Post-mortem + redesign** (<2/4 verts) ❌
  - Analyse approfondie causes échec
  - Redesign v4.0 (2-3 semaines)

### Prochaines actions :
1. [Action immédiate 1]
2. [Action immédiate 2]
3. [Action immédiate 3]

---

**Validé par** : [Votre nom]  
**Date** : 28/10/2025
```

---

## ✅ Checklist de validation (avant lundi 21 Oct)

- [ ] Document Google Sheets créé
- [ ] Structure tableau (Feuilles 1-4) OK
- [ ] Formules moyennes/min/max testées
- [ ] Formatage conditionnel appliqué
- [ ] Graphiques créés
- [ ] Table conversion NPS → /10 présente
- [ ] Template rapport final copié
- [ ] Alarmes quotidiennes configurées (9h00, 22-28 Oct)
- [ ] Accès Supabase SQL Editor vérifié
- [ ] Requêtes SQL sauvegardées dans favoris/snippets

---

## 🔗 Ressources

- **Fichier SQL** : `scripts/analytics/coach_ia_metrics.sql`
- **Documentation** : `MONITORING_COACH_IA_V3_ANALYTICS.md`
- **Checklist** : `CHECKLIST_COACH_IA_V3_SUIVI.md`
- **Supabase** : [Votre URL projet].supabase.co

---

**Système prêt pour lundi 21 Oct 9h00 ! 🚀**
