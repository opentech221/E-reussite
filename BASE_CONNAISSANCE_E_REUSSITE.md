# 📚 BASE DE CONNAISSANCE E-RÉUSSITE
## Document de référence pour le Coach IA

**Date de création** : 13 octobre 2025  
**Dernière mise à jour** : 13 octobre 2025  
**Version** : 2.0

---

## 🎯 VISION & MISSION

### Vision d'E-réussite
**E-réussite est une plateforme d'apprentissage innovante conçue pour révolutionner l'éducation au Sénégal.**

Notre vision :
- 🎓 **Démocratiser l'accès à une éducation de qualité** pour tous les élèves sénégalais
- 🚀 **Transformer l'apprentissage** en une expérience interactive, engageante et personnalisée
- 🌍 **Préparer les élèves** aux examens nationaux (BFEM, BAC) avec des ressources adaptées au programme sénégalais
- 💡 **Utiliser la technologie** (IA, gamification, analytics) pour maximiser la réussite scolaire
- 🤝 **Créer une communauté d'apprenants** motivés et solidaires

### Mission
- Fournir des **cours complets et structurés** conformes au programme officiel sénégalais
- Offrir un **suivi personnalisé** avec statistiques détaillées et recommandations IA
- **Motiver par la gamification** : points, badges, niveaux, défis, classements
- **Accompagner 24/7** avec un Coach IA intelligent et bienveillant
- **Préparer efficacement** aux examens avec des quiz et examens blancs

---

## 🏗️ ARCHITECTURE DE LA PLATEFORME

### 1. Système d'Abonnement (Nouveau - Oct 2025)

#### Modèle Freemium
- **Essai gratuit** : 7 jours d'accès illimité à toutes les fonctionnalités
- **Abonnement payant** : 1000 FCFA pour un accès à vie (unique paiement)

#### États d'abonnement
1. **Aucun abonnement** : Utilisateur non inscrit
2. **Trial (Essai)** : 7 jours gratuits dès l'inscription
3. **Active (Actif)** : Paiement effectué → Accès illimité à vie
4. **Expired (Expiré)** : Essai terminé sans paiement → Accès limité

#### Méthodes de paiement (Mobile Money)
- 📱 **Orange Money** (Sénégal)
- 📱 **Wave** (Sénégal)
- 📱 **Free Money** (Sénégal)
- 📱 **MTN Money** (Sénégal)

#### Pages dédiées
- `/payment` : Formulaire de paiement + Historique des transactions
- `/profile` : Informations utilisateur + Statut d'abonnement avec badge

---

### 2. Système de Chapitres

#### Structure
- **Matières** : Mathématiques, Français, SVT, Physique-Chimie, Anglais, Histoire-Géo, etc.
- **Niveaux** : BFEM (Brevet), BAC (Baccalauréat)
- **Chapitres** : Unités d'apprentissage complètes

#### Contenu de chaque chapitre
- 📝 **Description** détaillée du sujet
- 🎥 **Vidéo explicative** (YouTube intégrée)
- 📄 **Contenu texte** structuré en sections
- 🎯 **Objectifs pédagogiques** clairs
- ⏱️ **Durée estimée** (15-45 minutes)
- 📊 **Niveau de difficulté** (Facile, Moyen, Difficile)

#### Progression
- Suivi du **pourcentage de complétion** par chapitre
- Déblocage de **badges** après complétion
- Gain de **points** en fonction de la difficulté
- Historique complet des chapitres complétés

---

### 3. Système de Quiz

#### Types de quiz
- **Quiz de chapitre** : Valide la compréhension d'un chapitre spécifique
- **Quiz de révision** : Mélange plusieurs chapitres d'une matière
- **Examens blancs** : Simulation d'examens nationaux (BFEM/BAC)

#### Caractéristiques
- ⏱️ **Durée limitée** (5-30 minutes selon le type)
- 📊 **Difficulté graduée** (Facile → Moyen → Difficile)
- ❓ **Questions variées** : QCM, Vrai/Faux, Réponses courtes
- ✅ **Correction instantanée** avec explications détaillées
- 🎯 **Score en pourcentage** + Note (A, B, C, D, E, F)
- 📈 **Statistiques détaillées** par matière et chapitre

#### Scoring
- **90-100%** → Note A (Excellent)
- **80-89%** → Note B (Très bien)
- **70-79%** → Note C (Bien)
- **60-69%** → Note D (Assez bien)
- **50-59%** → Note E (Passable)
- **0-49%** → Note F (Insuffisant)

---

### 4. Système de Gamification

#### Points
- **Quiz complété** : 10-50 points (selon difficulté et score)
- **Chapitre terminé** : 20-100 points (selon durée et difficulté)
- **Série quotidienne** : +5 points par jour consécutif
- **Défis gagnés** : 50-200 points
- **Examens réussis** : 100-500 points

#### Niveaux
- Progression automatique basée sur les points totaux
- **Niveau 1** : 0-100 points (Débutant)
- **Niveau 2** : 100-300 points (Novice)
- **Niveau 3** : 300-600 points (Intermédiaire)
- **Niveau 4** : 600-1000 points (Avancé)
- **Niveau 5** : 1000-1500 points (Expert)
- **Niveau 6+** : 1500+ points (Maître)

#### Badges (14 badges disponibles)
1. **Premier Pas** : Créer son compte
2. **Débutant Motivé** : Compléter le premier chapitre
3. **Apprenant Assidu** : Compléter 10 chapitres
4. **Maître des Quiz** : Réussir 5 quiz avec 80%+
5. **Champion de Cours** : Compléter 20 chapitres
6. **Gardien de la Sagesse** : Compléter 50 chapitres
7. **Série 7 Jours** : Connexion 7 jours consécutifs
8. **Série 30 Jours** : Connexion 30 jours consécutifs
9. **Série 100 Jours** : Connexion 100 jours consécutifs
10. **Premier A** : Obtenir sa première note A (90%+)
11. **Expert des Examens** : Réussir 3 examens blancs
12. **Perfectionniste** : Score parfait 100% sur un quiz
13. **Champion du Classement** : Top 3 du leaderboard
14. **Légende** : Top 1 du leaderboard

#### Série quotidienne (Streak)
- +1 jour à chaque connexion quotidienne
- Reset à 0 après 24h d'inactivité
- Affichage avec emoji 🔥
- Encourage la régularité et l'assiduité

---

### 5. Tableau de Bord (Dashboard)

#### Vue d'ensemble
- 📊 **Statistiques principales** en un coup d'œil
- 📈 **Graphiques de progression** (derniers 7 jours)
- 🎯 **Objectifs du jour** personnalisés
- 🏆 **Derniers badges débloqués**
- 📚 **Chapitres en cours** avec % complétion

#### Cartes statistiques
- **Niveau actuel** avec barre de progression
- **Points totaux** accumulés
- **Série actuelle** (jours consécutifs)
- **Taux de complétion** global (%)
- **Badges débloqués** (X/14)
- **Score moyen** sur tous les quiz
- **Temps d'étude** total

#### Sections
- **Progression récente** : Timeline des activités
- **Chapitres recommandés** : Suggestions IA
- **Défis actifs** : Challenges en cours
- **Notifications** : Rappels et encouragements

---

### 6. Coach IA (Gemini 1.5 Flash)

#### Capacités
- 💬 **Conversation contextuelle** : Comprend le profil et les stats de l'élève
- 🎓 **Explications pédagogiques** : Répond aux questions sur les cours
- 📊 **Analyse des performances** : Identifie forces et faiblesses
- 🎯 **Recommandations personnalisées** : Suggère chapitres et quiz adaptés
- 📸 **Analyse d'images** : Aide avec photos d'exercices (Vision API)
- 🔍 **Mode Recherche Perplexity** : Recherche web éducative en temps réel
- 📝 **Génération de plans d'étude** : Planning personnalisé

#### 3 Onglets de la page Coach IA
1. **Conversations** : Chat standard avec historique
2. **Analyses & conseils** : Forces/Faiblesses + Plan d'étude
3. **Recherche Perplexity** : Recherche web éducative

#### Fournisseurs IA disponibles
- **Gemini 1.5 Flash** (par défaut) - Gratuit
- **Gemini 1.5 Pro** - Plus puissant
- **Claude 3.5 Sonnet** - API Anthropic
- **Perplexity** - Mode recherche web

#### Contexte fourni au Coach IA
- Nom de l'utilisateur
- Niveau actuel et points
- Chapitres complétés (avec détails)
- Score moyen et nombre de quiz
- Badges débloqués (récents)
- Matières étudiées
- Points forts et faibles
- Série actuelle
- Page actuelle (dashboard, chapter, quiz, etc.)

---

### 7. Examens

#### Types d'examens
- **Examens blancs BFEM** : Simulation officielle du Brevet
- **Examens blancs BAC** : Simulation officielle du Baccalauréat
- **Examens de matière** : Tests complets par matière

#### Fonctionnalités
- ⏱️ **Durée réelle** (2-4 heures selon l'examen)
- 📊 **Barème officiel** conforme au programme sénégalais
- ✅ **Correction automatique** avec barème détaillé
- 📈 **Statistiques détaillées** par matière
- 🎯 **Prédiction de note** basée sur les performances
- 📄 **Génération de bulletin** téléchargeable
- 🏆 **Classement** par rapport aux autres élèves

#### Résultats sauvegardés
- Historique complet de tous les examens passés
- Page `/exam-results` avec vue détaillée
- Graphiques d'évolution des scores
- Recommandations de révision post-examen

---

### 8. Système de Classement (Leaderboard)

#### Types de classements
- **Global** : Tous les utilisateurs
- **Par niveau** : BFEM ou BAC
- **Par matière** : Mathématiques, Français, etc.
- **Hebdomadaire** : Classement de la semaine

#### Critères de classement
- **Points totaux** (principal)
- **Badges débloqués** (secondaire)
- **Score moyen** (tertiaire)
- **Série actuelle** (bonus)

#### Affichage
- Top 100 utilisateurs
- Position de l'utilisateur connecté (mis en surbrillance)
- Badges visibles pour chaque utilisateur
- Évolution de position (↑ ↓)

---

### 9. Profil Utilisateur

#### Informations affichées
- 👤 **Identité** : Prénom, Email
- 📊 **Statistiques complètes** : Niveau, Points, Badges, Série
- 🎯 **Objectifs personnels** définis par l'élève
- 📈 **Graphique de progression** (30 derniers jours)
- 🏆 **Collection de badges** débloqués
- 💳 **Statut d'abonnement** avec badge visuel
  - Badge Trial : Compte à rebours des jours restants
  - Badge Active : "Accès illimité" avec date d'activation
  - Badge Expired : "Abonnement expiré" avec CTA réactivation

#### Paramètres
- **Niveau scolaire** : BFEM, BAC
- **Matières favorites** : Personnalisation du contenu
- **Notifications** : Activer/désactiver les rappels
- **Thème** : Dark mode / Light mode (Nouveau - Oct 2025)
- **Langue** : Français (par défaut)

---

### 10. Notifications

#### Types de notifications
- 🎉 **Badges débloqués** : Notification immédiate
- 🔥 **Série en danger** : Rappel si risque de rupture
- 📚 **Nouveau contenu** : Chapitres ou quiz ajoutés
- 🎯 **Objectifs atteints** : Félicitations
- ⏰ **Rappels d'étude** : Suggestions quotidiennes
- 🏆 **Position leaderboard** : Changements importants

#### Affichage
- Badge rouge avec compteur sur l'icône 🔔
- Page dédiée `/notifications` avec liste complète
- Toast notifications pour actions importantes
- Emails (optionnel, désactivable)

---

## 🆕 DERNIÈRES MISES À JOUR (Octobre 2025)

### ✅ Système d'abonnement (13 oct 2025)
- Essai gratuit 7 jours automatique
- Paiement Mobile Money intégré (Orange, Wave, Free, MTN)
- Page `/payment` avec historique des transactions
- Affichage du statut dans Profile avec badges visuels
- Fonction SQL idempotente (pas de duplicata)

### ✅ Dark Mode complet (12 oct 2025)
- Toggle Dark/Light dans tous les composants
- Couleurs adaptées (contraste WCAG AAA)
- Persistance du choix dans localStorage
- Support complet : Dashboard, Chapitres, Quiz, Profile, Coach IA

### ✅ Nettoyage UI Coach IA (13 oct 2025)
- Suppression statistiques redondantes onglet "Conversations"
- Suppression Hero card + stats onglet "Analyses & conseils"
- Interface épurée et focalisée
- Conservation sections essentielles (Forces/Faiblesses, Plan d'étude)

### ✅ Amélioration base de données (Oct 2025)
- Tables : `user_subscriptions`, `payment_transactions`
- Fonction `complete_payment` idempotente
- RLS (Row Level Security) activée
- Indexes optimisés pour performances

---

## 🎓 CONTENU PÉDAGOGIQUE

### Matières disponibles (BFEM)
1. **Mathématiques** : Algèbre, Géométrie, Fonctions, Statistiques
2. **Français** : Grammaire, Conjugaison, Orthographe, Littérature
3. **SVT** : Biologie, Géologie, Environnement
4. **Physique-Chimie** : Mécanique, Électricité, Réactions chimiques
5. **Anglais** : Vocabulaire, Grammaire, Compréhension
6. **Histoire-Géographie** : Histoire du Sénégal, Géographie africaine
7. **Éducation Civique** : Citoyenneté, Institutions sénégalaises

### Matières disponibles (BAC)
- Séries : **L** (Littéraire), **S** (Scientifique), **STEG** (Technique)
- Matières spécialisées selon la série
- Coefficients officiels respectés

### Format des cours
- 📝 **Cours complet** : 1500-3000 mots par chapitre
- 🎥 **Vidéo** : 10-20 minutes (YouTube embed)
- 🖼️ **Illustrations** : Schémas, graphiques, tableaux
- 📚 **Exercices d'application** : 5-15 par chapitre
- ✅ **Corrigés détaillés** avec explications

---

## 📱 TECHNOLOGIES UTILISÉES

### Frontend
- **React 18** avec Vite
- **Tailwind CSS** pour le design
- **Framer Motion** pour les animations
- **Lucide React** pour les icônes
- **Recharts** pour les graphiques

### Backend
- **Supabase** (PostgreSQL + Auth + Storage)
- **Row Level Security** pour la sécurité

### IA
- **Google Gemini 1.5 Flash** (API gratuite)
- **Google Gemini 1.5 Pro** (API payante)
- **Claude 3.5 Sonnet** (Anthropic)
- **Perplexity AI** (Recherche web)

### Paiement
- **Mobile Money APIs** (Orange, Wave, Free, MTN)
- Mode demo intégré pour tests

---

## 🎯 COMMENT UTILISER CETTE BASE DE CONNAISSANCES

### Pour le Coach IA
Quand un utilisateur pose une question :
1. **Contextualise** : Utilise ses stats (niveau, points, badges, etc.)
2. **Sois précis** : Référence des fonctionnalités RÉELLES de la plateforme
3. **Guide** : Suggère des actions concrètes (chapitres, quiz, examens)
4. **Motive** : Mentionne ses progrès et encourage

### Exemples de bonnes réponses

❌ **Mauvaise réponse** (générique, obsolète) :
> "E-réussite est une plateforme d'apprentissage avec des cours et des exercices."

✅ **Bonne réponse** (contextuelle, précise) :
> "Salut opentech ! 👋 E-réussite est ta plateforme d'apprentissage personnalisée qui t'accompagne dans ta préparation au BFEM et BAC. Tu as actuellement 2800 points (niveau 6) et 2 jours de série 🔥 ! La plateforme te propose :
> - 📚 Cours complets conformes au programme sénégalais
> - 🎯 Quiz et examens blancs pour valider tes connaissances
> - 🏆 Système de gamification (14 badges à débloquer)
> - 💬 Coach IA (moi !) disponible 24/7
> - 💳 Essai gratuit 7 jours puis 1000 FCFA pour accès illimité à vie
> 
> Tu as déjà débloqué 8 badges, continue comme ça ! 💪"

---

## 📞 SUPPORT

### En cas de problème technique
- Email : support@e-reussite.sn (fictif pour le moment)
- Page FAQ intégrée
- Coach IA peut aider avec questions techniques basiques

### Feedback utilisateur
- Bouton "Signaler un problème" dans chaque page
- Formulaire de suggestion d'amélioration
- Sondages de satisfaction périodiques

---

**Ce document doit être mis à jour à chaque nouvelle fonctionnalité ajoutée.**

**Dernière révision** : 13 octobre 2025, 18:00
