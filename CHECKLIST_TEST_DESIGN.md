# ✅ Checklist de Test - Modernisation Design

## 🎯 Tests à effectuer après déploiement

### 1. Navigation Publique (NavbarPublic)

#### Desktop
- [ ] Logo E-Réussite visible avec effet glow au hover
- [ ] 6 liens de navigation affichés horizontalement
- [ ] Lien actif souligné avec barre gradient animée
- [ ] Transition fluide de la barre lors du changement de page
- [ ] Boutons "Connexion" et "Inscription" visibles
- [ ] Effet hover sur tous les éléments cliquables
- [ ] Gradient visible dans le fond de la navbar

#### Mobile (< 768px)
- [ ] Menu hamburger visible à droite
- [ ] Clic ouvre le menu avec animation slide
- [ ] Liens empilés verticalement dans le menu
- [ ] Boutons en bas du menu mobile
- [ ] Fermeture du menu après clic sur un lien
- [ ] Animation fluide à l'ouverture/fermeture

#### Tests techniques
```bash
# Ouvrir la console navigateur
# Vérifier aucune erreur React
# Network tab : vérifier chargement des fonts
# Lighthouse : score Performance > 90
```

---

### 2. Navigation Privée (NavbarPrivate)

#### Desktop
- [ ] Logo redirige vers /dashboard
- [ ] 7 liens avec icônes affichés (Dashboard, Cours, Progression, etc.)
- [ ] Badge panier affiche le nombre correct d'articles
- [ ] Cloche notifications fonctionnelle
- [ ] Bouton "Assistant IA" visible
- [ ] Bouton profil avec icône User
- [ ] Bouton Admin visible si role=admin
- [ ] Bouton Déconnexion fonctionne
- [ ] Indicateur de page active avec fond gradient

#### Mobile
- [ ] Menu hamburger fonctionne
- [ ] Tous les liens avec icônes dans le menu
- [ ] Panier affiche badge même dans menu mobile
- [ ] Grille 2 colonnes pour les boutons d'action
- [ ] Scroll fluide si menu dépasse la hauteur écran

#### Tests fonctionnels
```javascript
// Dans la console
localStorage.clear(); // Vider le panier
// Recharger → badge doit disparaître

// Ajouter articles au panier
// Badge doit s'animer et afficher le bon nombre

// Tester déconnexion
// Doit rediriger vers /
```

---

### 3. Page Panier (Cart)

#### État vide
- [ ] Icône panier avec effet glow
- [ ] Message "Votre panier est vide"
- [ ] Bouton "Découvrir la boutique" avec gradient
- [ ] Clic redirige vers /shop

#### Avec articles
- [ ] Chaque article affiché avec icône, nom, prix
- [ ] Boutons +/- modifient la quantité
- [ ] Quantité 0 supprime l'article
- [ ] Prix total mis à jour en temps réel
- [ ] Bouton "Vider le panier" fonctionne
- [ ] Card résumé sticky sur desktop
- [ ] Moyens de paiement affichés (4 badges)
- [ ] Bouton "Passer au paiement" affiche toast

#### Responsive
- [ ] 1 colonne sur mobile
- [ ] 3 colonnes sur desktop (2 + 1 sidebar)
- [ ] Scroll fluide sur mobile

#### Tests
```javascript
// Ajouter 3 articles différents
// Modifier quantités
// Vérifier calcul total
// Vider et vérifier état vide
```

---

### 4. Page Profil (Profile)

#### Chargement
- [ ] Spinner visible pendant chargement
- [ ] Message "Chargement du profil..."

#### Card profil (gauche)
- [ ] Photo/icône utilisateur
- [ ] Nom complet affiché
- [ ] Email affiché
- [ ] Badge abonnement coloré selon type :
  - Premium → gradient jaune-orange avec Crown
  - Standard → gradient bleu-cyan avec Award
  - Free → gradient slate avec User
- [ ] Date membre depuis
- [ ] Niveau
- [ ] Parcours

#### Card informations (droite)
- [ ] Mode lecture : infos dans des cards slate-50
- [ ] Bouton "Modifier le profil" fonctionne
- [ ] Mode édition : formulaire avec inputs
- [ ] Modification sauvegardée dans Supabase
- [ ] Toast de confirmation
- [ ] Retour en mode lecture après sauvegarde

#### Card commandes
- [ ] Si vide : message + icône
- [ ] Si commandes : liste avec :
  - Numéro commande
  - Date
  - Montant
  - Status coloré (completed=vert, pending=jaune)
  - Liste articles
- [ ] Animation progressive des commandes

#### Tests
```javascript
// Se connecter avec compte test
// Modifier nom, niveau, parcours
// Sauvegarder
// Recharger la page
// Vérifier persistance des données
```

---

### 5. Page Abonnements (Pricing)

#### Header
- [ ] Badge "Tarifs transparents" visible
- [ ] Titre en très grand format
- [ ] Gradient animé sur le titre

#### Cards offres
- [ ] 3 plans affichés côte à côte sur desktop
- [ ] Badge "Le plus populaire" sur plan Hebdomadaire
- [ ] Icônes différentes par plan :
  - Journalier → Zap (bleu)
  - Hebdomadaire → TrendingUp (violet)
  - Mensuel → Crown (jaune-orange)
- [ ] Prix en très grand format
- [ ] Features avec checks dans circles gradient
- [ ] Hover scale-105 sur chaque card
- [ ] Boutons CTA avec gradient correspondant
- [ ] Clic affiche toast

#### Section paiements
- [ ] Card principale visible
- [ ] 4 moyens de paiement en grille
- [ ] Chaque méthode dans une card colorée
- [ ] Hover scale sur chaque méthode
- [ ] Badges réassurance en bas

#### Responsive
- [ ] 1 colonne sur mobile
- [ ] 3 colonnes sur desktop
- [ ] Espacements adaptés

#### Tests
```javascript
// Cliquer sur chaque bouton d'abonnement
// Vérifier toast avec bon nom de plan
// Tester sur différents devices
```

---

### 6. Tests Cross-Browser

#### Chrome/Edge
- [ ] Toutes les fonctionnalités OK
- [ ] Gradients affichés correctement
- [ ] Animations fluides
- [ ] Backdrop-blur fonctionne

#### Firefox
- [ ] Même comportement que Chrome
- [ ] Vérifier backdrop-blur (peut nécessiter flag)

#### Safari (Mac/iOS)
- [ ] Gradients OK
- [ ] Backdrop-blur fonctionne
- [ ] Animations 60fps
- [ ] Touch gestures sur iOS

---

### 7. Tests Performance

#### Lighthouse (Chrome DevTools)
```
Objectifs :
- Performance : > 90
- Accessibility : > 95
- Best Practices : > 95
- SEO : > 90
```

#### Métriques Web Vitals
```
- LCP (Largest Contentful Paint) : < 2.5s
- FID (First Input Delay) : < 100ms
- CLS (Cumulative Layout Shift) : < 0.1
```

#### Outils de test
```bash
# Lighthouse CLI
npm install -g lighthouse
lighthouse http://localhost:3000 --view

# Bundle size
npm run build
# Vérifier taille des chunks < 200kb
```

---

### 8. Tests Accessibilité

#### Navigation au clavier
- [ ] Tab parcourt tous les éléments dans l'ordre logique
- [ ] Enter/Space active les boutons
- [ ] Focus visible sur tous les éléments
- [ ] Échap ferme les menus/modals

#### Lecteur d'écran
- [ ] Tester avec NVDA (Windows) ou VoiceOver (Mac)
- [ ] Tous les éléments annoncés correctement
- [ ] Alt texts présents sur images
- [ ] ARIA labels sur boutons d'icônes

#### Contraste
- [ ] Utiliser extension "WCAG Color contrast checker"
- [ ] Tous les textes passent AA (4.5:1)
- [ ] Éléments interactifs passent AA (3:1)

---

### 9. Tests Responsive

#### Breakpoints à tester
```
Mobile S : 320px
Mobile M : 375px
Mobile L : 425px
Tablet : 768px
Laptop : 1024px
Desktop : 1440px
4K : 2560px
```

#### Chrome DevTools
- [ ] Device toolbar activé
- [ ] Tester tous les presets
- [ ] Mode portrait et paysage
- [ ] Vérifier débordements horizontaux

---

### 10. Tests Fonctionnels E2E

#### Parcours utilisateur complet
```
1. Arriver sur page d'accueil
2. Cliquer sur "Tarifs"
3. Voir les 3 offres
4. Cliquer sur "Inscription"
5. Créer un compte
6. Redirection vers dashboard
7. Aller sur "Nos cours"
8. Ajouter un cours au panier
9. Voir le badge panier (1)
10. Aller au panier
11. Modifier quantité
12. Aller au profil
13. Modifier informations
14. Sauvegarder
15. Se déconnecter
```

---

## 🐛 Bugs connus et solutions

### Bug 1 : Backdrop-blur ne fonctionne pas sur Firefox
**Solution** : Activer flag `layout.css.backdrop-filter.enabled` dans about:config

### Bug 2 : Animations saccadées sur mobile bas de gamme
**Solution** : Réduire complexité animations, utiliser `will-change: transform`

### Bug 3 : Badge panier ne se met pas à jour
**Solution** : Vérifier useCart hook, forceUpdate si nécessaire

---

## 📊 Métriques de succès

### Objectifs quantitatifs
- ✅ Score Lighthouse > 90 sur toutes les métriques
- ✅ Temps de chargement < 3s (3G)
- ✅ Taux de rebond < 40%
- ✅ Temps sur page > 2 min

### Objectifs qualitatifs
- ✅ Design moderne et cohérent
- ✅ Navigation intuitive
- ✅ Animations fluides
- ✅ Accessibilité WCAG AA

---

## 📝 Rapport de test

### Template
```markdown
## Test du [DATE]

### Environnement
- OS : Windows 11 / macOS Sonoma / Ubuntu 22.04
- Navigateur : Chrome 120 / Firefox 121 / Safari 17
- Device : Desktop / Tablet / Mobile

### Résultats
- NavbarPublic : ✅ OK / ❌ Bugs trouvés
- NavbarPrivate : ✅ OK / ❌ Bugs trouvés
- Cart : ✅ OK / ❌ Bugs trouvés
- Profile : ✅ OK / ❌ Bugs trouvés
- Pricing : ✅ OK / ❌ Bugs trouvés

### Bugs trouvés
1. [Description du bug]
   - Sévérité : Critique / Majeur / Mineur
   - Steps to reproduce
   - Screenshot

### Performance
- Lighthouse Score : 92/100
- LCP : 2.1s
- FID : 50ms
- CLS : 0.05

### Recommandations
- [Liste des améliorations suggérées]
```

---

## 🚀 Déploiement

### Checklist pré-déploiement
- [ ] Tous les tests passent
- [ ] Build production réussie
- [ ] Pas d'erreurs console
- [ ] Pas de warnings React
- [ ] Variables d'environnement configurées
- [ ] Base de données migrée
- [ ] Assets optimisés

### Commandes
```bash
# Build
npm run build

# Tester le build localement
npm run preview

# Déployer (adapter selon plateforme)
vercel deploy --prod
# ou
netlify deploy --prod
```

---

© 2025 E-Réussite - Checklist de test v2.0
