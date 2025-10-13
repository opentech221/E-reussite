# ✅ PHASE 4 - GUIDE DE TEST

## 🎯 OBJECTIF
Tester le tableau de bord `/progress` avec toutes les fonctionnalités.

---

## 📋 CHECKLIST COMPLÈTE

### ✅ Étape 1 : Accès à la page
- [ ] L'application tourne (`npm run dev`)
- [ ] Vous êtes connecté
- [ ] Cliquez sur "Progression" dans la navbar
- [ ] URL = `http://localhost:3000/progress`
- [ ] Page charge sans erreur (pas de page blanche)
- [ ] Titre visible : "📊 Tableau de progression"

---

### ✅ Étape 2 : Cartes de statistiques

**Vérifier les 4 cartes** :

| Carte | Attendu | Réel | OK ? |
|-------|---------|------|------|
| 💰 Points totaux | 1,950 | _____ | ⬜ |
| 🏆 Niveau | 10 | _____ | ⬜ |
| 🔥 Série actuelle | X jours | _____ | ⬜ |
| 🎯 Leçons complétées | 18 | _____ | ⬜ |

**Vérifications visuelles** :
- [ ] Cartes alignées en grille (2x2 ou 4x1)
- [ ] Fond coloré (jaune, violet, orange, bleu)
- [ ] Icônes visibles
- [ ] Textes lisibles

---

### ✅ Étape 3 : Showcase des badges

**Vérifier la section "🏅 Badges"** :

| Badge | Icône | État | Visible ? |
|-------|-------|------|-----------|
| Apprenant Assidu | 🎓 | Gagné | ⬜ |
| Finisseur | 📚 | Gagné | ⬜ |
| Maître de cours | 🌟 | Gagné | ⬜ |
| Expert | 🚀 | Gagné | ⬜ |
| Série d'apprentissage | 🔥 | Verrouillé | ⬜ |

**Vérifications visuelles** :
- [ ] Compteur : "4/5" affiché en haut
- [ ] Badges gagnés : **couleur complète** avec ✓
- [ ] Badge verrouillé : **grayscale** avec 🔒
- [ ] Dates d'obtention affichées (ex: "6 oct 2025")

---

### ✅ Étape 4 : Liste des défis

**Vérifier la section "🎯 Défis de la semaine"** :

| Défi | Progression | Complété ? | Réclamé ? | OK ? |
|------|-------------|------------|-----------|------|
| 📖 Semaine studieuse | 18/5 | ✅ | ❌ | ⬜ |
| 🎯 Marathon | 6/3 | ✅ | ❌ | ⬜ |
| ⚡ Rapide | 18/5 | ✅ | ❌ | ⬜ |
| 🔬 Spécialiste | 9/10 | ❌ | ❌ | ⬜ |

**Vérifications visuelles** :
- [ ] Badge vert en haut : "+400 pts à réclamer"
- [ ] Barres de progression animées (remplies à X%)
- [ ] Défis complétés : fond vert clair
- [ ] Bouton "Réclamer X points" visible sur défis complétés
- [ ] Guide d'utilisation en bas

---

### ✅ Étape 5 : Réclamation de récompense

**Test fonctionnel** :

1. **Avant réclamation** :
   - [ ] Note les points actuels : ________
   - [ ] Trouve le défi "Semaine studieuse" (18/5)
   - [ ] Bouton "Réclamer 100 points" visible

2. **Pendant réclamation** :
   - [ ] Clique sur "Réclamer 100 points"
   - [ ] Bouton montre "Réclamation..." avec spinner

3. **Après réclamation** :
   - [ ] Toast vert : "🎉 Récompense réclamée !"
   - [ ] Description : "+100 points ajoutés à votre total"
   - [ ] Bouton remplacé par "✓ Récompense réclamée"
   - [ ] Fond du défi devient gris clair
   - [ ] Badge en haut : "+300 pts à réclamer" (400 - 100)

4. **Vérification des points** :
   - [ ] Carte "Points totaux" mise à jour : 2,050 (1,950 + 100)

**Répéter pour les 2 autres défis** :
- [ ] Marathon : +200 pts → Total = 2,250
- [ ] Rapide : +100 pts → Total = 2,350

---

### ✅ Étape 6 : Graphiques

**Graphique 1 : Points sur 7 jours (LineChart)** :
- [ ] Graphique visible (ligne violette)
- [ ] Axe X : 7 jours (Lun, Mar, Mer, Jeu, Ven, Sam, Dim)
- [ ] Axe Y : Points (0 - max)
- [ ] Points reliés par ligne
- [ ] Hover affiche tooltip avec valeur

**Graphique 2 : Répartition des points (PieChart)** :
- [ ] Graphique circulaire visible
- [ ] Couleurs : Violet (leçons), Bleu (chapitres), Vert (cours), Orange (défis)
- [ ] Pourcentages affichés
- [ ] Légende en bas

**Graphique 3 : Progression globale (BarChart)** :
- [ ] Barres horizontales visibles
- [ ] 3 barres : Leçons, Chapitres, Cours
- [ ] Couleurs différentes (violet, bleu, vert)
- [ ] Valeurs affichées sur les barres

---

### ✅ Étape 7 : Responsive

**Test desktop (>1024px)** :
- [ ] Grille 3 colonnes (badges à gauche, défis à droite large)
- [ ] Cartes stats : 4 en ligne horizontale
- [ ] Graphiques : 2 côte à côte en bas

**Test tablette (768-1024px)** :
- [ ] Navigation fonctionne
- [ ] Éléments s'adaptent
- [ ] Scrolling fluide

**Test mobile (<768px)** :
- [ ] Menu hamburger visible
- [ ] Lien "Progression" dans menu
- [ ] Cartes empilées (1 colonne)
- [ ] Badges et défis empilés
- [ ] Graphiques s'adaptent (scrolling horizontal si besoin)

---

### ✅ Étape 8 : Performance

**Chargement** :
- [ ] Page charge en < 2 secondes
- [ ] Pas de flash de contenu non stylisé
- [ ] Spinner affiché pendant chargement

**Interactions** :
- [ ] Réclamation de défi : < 1 seconde
- [ ] Rafraîchissement des données automatique après réclamation
- [ ] Pas de lag lors du scroll

---

## 🐛 DÉPANNAGE

### Problème 1 : Page blanche
**Solution** :
1. Ouvrir console (F12)
2. Regarder erreurs rouges
3. Vérifier import de composants
4. Vérifier route dans App.jsx

### Problème 2 : "0 points" ou "0 badges"
**Solution** :
1. Vérifier user_id correct
2. Vérifier données dans Supabase :
   ```sql
   SELECT * FROM user_points WHERE user_id = 'USER_ID';
   SELECT * FROM user_badges WHERE user_id = 'USER_ID';
   ```

### Problème 3 : Défis non affichés
**Solution** :
1. Vérifier semaine 40 générée :
   ```sql
   SELECT * FROM learning_challenges WHERE week_number = 40;
   ```
2. Si vide, exécuter migration 012

### Problème 4 : Erreur lors réclamation
**Solution** :
1. Vérifier permissions RLS sur `complete_learning_challenge()`
2. Vérifier défi complété mais non réclamé :
   ```sql
   SELECT * FROM user_learning_challenges 
   WHERE user_id = 'USER_ID' 
     AND is_completed = true 
     AND reward_claimed = false;
   ```

### Problème 5 : Graphiques vides
**Solution** :
1. Vérifier historique non vide :
   ```sql
   SELECT COUNT(*) FROM user_points_history WHERE user_id = 'USER_ID';
   ```
2. Si 0, compléter quelques leçons d'abord

---

## 📊 RÉSULTATS ATTENDUS

| Métrique | Avant | Après réclamation | Différence |
|----------|-------|-------------------|------------|
| Points | 1,950 | 2,350 | +400 |
| Badges | 4/5 | 4/5 | 0 |
| Défis réclamés | 0/4 | 3/4 | +3 |
| Niveau | 10 | 10 | 0 |

---

## ✅ VALIDATION FINALE

**Cocher si tout fonctionne** :

- [ ] ✅ Page accessible via navbar
- [ ] ✅ Statistiques affichées correctement
- [ ] ✅ Badges gagnés/verrouillés visibles
- [ ] ✅ Défis avec barres de progression
- [ ] ✅ Réclamation fonctionne (3 défis)
- [ ] ✅ Points mis à jour (+400)
- [ ] ✅ Graphiques affichés
- [ ] ✅ Responsive (mobile + desktop)
- [ ] ✅ Pas d'erreur console
- [ ] ✅ Performance acceptable

**Si TOUT est coché** → 🎉 **PHASE 4 VALIDÉE !** 🎉

---

## 🚀 PROCHAINES ACTIONS

Après validation :
1. ⏳ Compléter le défi Spécialiste (1 leçon restante → +150 pts)
2. ⏳ Maintenir série 7 jours (badge 🔥)
3. ⏳ Planifier Phase 5 (si nécessaire)

---

**Créé le** : 7 octobre 2025, 01:12 AM  
**Durée du test** : ~15 minutes
