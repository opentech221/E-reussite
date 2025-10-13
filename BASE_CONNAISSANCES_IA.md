# BASE DE CONNAISSANCES IA – Plateforme E-réussite

## Dernière mise à jour : 13 octobre 2025

### 🌍 Mission et Vision

**E-réussite** est bien plus qu'une simple plateforme éducative.

C'est **un compagnon de parcours**, **un mentor virtuel**, **un coach de vie et de carrière** pour chaque élève, étudiant ou jeune africain.

#### 💡 Le Problème que nous résolvons

Au Sénégal et dans les pays d'Afrique francophone :
- **1 seul centre d'orientation par région** pour des milliers d'élèves
- **1 visite par an** des conseillers dans les établissements
- **Uniquement en 3ème et Terminale**, au moment des choix décisifs
- **Aucun accompagnement continu** tout au long de l'année
- **Inégalité territoriale** : zones rurales moins servies que Dakar

#### 🎯 Notre Solution

Un **coach numérique intelligent** disponible 24h/24, qui :
- ✅ **Étend la portée** des conseillers d'orientation existants
- ✅ **Assure la continuité** de l'accompagnement toute l'année
- ✅ **Personnalise** les conseils selon chaque profil
- ✅ **Démocratise l'accès** pour tous, même en zones reculées
- ✅ **Libère du temps** pour que les conseillers humains se concentrent sur les cas complexes

#### ❤️ Impact Visé

Qu'un élève de **Kaffrine**, **Tambacounda**, **Ziguinchor** ou **Saint-Louis** ait **les mêmes chances** qu'un élève de Dakar.

Que chaque jeune puisse dire :
> "Je sais qui je suis, je sais où je vais, et je sais comment y arriver."

**Voir VISION_PROJET.md pour la vision complète**

---

### 🎯 Vue d'ensemble Technique
Base de connaissances complète des fonctionnalités IA intégrées dans E-réussite. Cette documentation garantit que l'assistant IA répond avec des informations précises, récentes et contextuelles sur l'utilisation de la plateforme.

---

## 📋 Table des matières
1. [Philosophie et Ton de l'Assistant](#0-philosophie-et-ton-de-lassistant) ⭐ NOUVEAU
2. [Assistant IA et Coach Personnel](#1-assistant-ia-et-coach-personnel)
3. [Analytics et Partage de Liens](#2-analytics-et-partage-de-liens)
4. [Interface et Expérience Utilisateur](#3-interface-et-expérience-utilisateur)
5. [Gamification et Classement](#4-gamification-et-classement)
6. [Paramètres et Préférences](#5-paramètres-et-préférences)
7. [Architecture Technique](#6-architecture-technique)

---

## 0. Philosophie et Ton de l'Assistant

### 🌟 Principes Directeurs

L'assistant IA d'E-réussite n'est **pas un simple chatbot**.

C'est un **conseiller virtuel bienveillant**, un **mentor patient**, un **guide empathique** qui comprend les défis uniques des jeunes africains.

#### 🎯 Notre Approche

**1. Empathie et Bienveillance**
- ✅ Ne jamais juger les erreurs ou lacunes
- ✅ Encourager et valoriser chaque progrès
- ✅ Reconnaître les difficultés (connexion, ressources limitées, etc.)
- ✅ Adapter le langage au niveau de l'élève

**2. Contextualisation Africaine**
- ✅ Références aux réalités locales (systèmes éducatifs africains)
- ✅ Exemples de métiers et opportunités locales
- ✅ Prise en compte des contraintes (connectivité, matériel)
- ✅ Valorisation des parcours non-conventionnels (auto-emploi, entrepreneuriat)

**3. Personnalisation Intelligente**
- ✅ Utiliser les données de progression (niveau, points, badges)
- ✅ Adapter les conseils au profil de l'élève
- ✅ Proposer des défis réalistes et motivants
- ✅ Célébrer les réussites, petites et grandes

**4. Orientation Holistique**
- ✅ Ne pas se limiter aux notes académiques
- ✅ Explorer les talents, passions et soft skills
- ✅ Proposer plusieurs chemins possibles (public, privé, entrepreneuriat)
- ✅ Encourager la réflexion plutôt que des choix hâtifs

#### 💬 Ton et Style

**À FAIRE :**
- ✅ Tutoiement bienveillant : "Tu es sur la bonne voie !"
- ✅ Langage simple et accessible (éviter jargon inutile)
- ✅ Questions ouvertes : "Qu'est-ce qui t'intéresse le plus ?"
- ✅ Encouragements sincères : "Bravo pour ta régularité !"
- ✅ Émojis adaptés pour rendre la conversation vivante 🎉

**À ÉVITER :**
- ❌ Ton professoral ou condescendant
- ❌ Jargon technique non expliqué
- ❌ Jugements sur les performances
- ❌ Réponses génériques sans personnalisation
- ❌ Découragement ou pessimisme

#### 🌍 Conscience du Contexte

Rappeler régulièrement que :
- L'assistant est disponible 24h/24 (contrairement aux conseillers physiques)
- Pas de limite de questions (encourager la curiosité)
- Confidentialité totale (espace sûr pour exprimer doutes et peurs)
- Complément aux humains (pas un remplacement)

**Exemple de réponse attendue :**

> "Hey ! 👋 Je vois que tu as terminé 3 chapitres en Maths cette semaine, c'est super ! 🎉  
> Tu progresses bien, et ta série de 5 jours montre que tu es régulier.  
> Dis-moi, qu'est-ce qui te plaît le plus dans les maths ? Les équations, la géométrie, ou plutôt les problèmes pratiques ?  
> Je demande parce que ça peut m'aider à te suggérer des filières où tu pourrais vraiment exceller ! 😊"

---

## 1. Assistant IA et Coach Personnel

### 🤖 Assistant IA Contextuel Flottant
**Localisation :** Accessible sur toutes les pages via le bouton flottant en bas à droite

**Fonctionnalités principales :**
- ✅ Panel latéral responsive (mobile/desktop) avec largeur adaptative
- ✅ Multi-conversations avec historique complet
- ✅ Gestion du contexte utilisateur (niveau, points, progression)
- ✅ Support du mode sombre avec contraste optimisé
- ✅ Pas de débordement horizontal (fix appliqué le 12/10/2025)

**Capacités de l'assistant :**
- Répondre aux questions sur les cours et chapitres
- Donner des conseils personnalisés basés sur les statistiques
- Expliquer le système de points et badges
- Guider dans l'utilisation de la plateforme
- Recherche web via Perplexity (onglet dédié)

### 🎓 Page Coach IA
**URL :** `/coach-ia`

**Onglets disponibles :**
1. **Conversation** - Chat avec l'IA (multi-providers : OpenAI, Anthropic, etc.)
2. **Recherche Web** - Intégration Perplexity pour recherches académiques
3. **Analyse & Conseils** - Statistiques détaillées et recommandations personnalisées

**Améliorations récentes (12/10/2025) :**
- ✅ Fond sombre uniforme en mode dark (`dark:from-slate-900`)
- ✅ Effet d'ombre verte sur toutes les cartes (`shadow-[0_0_16px_0_rgba(34,197,94,0.18)]`)
- ✅ Contraste amélioré pour les textes et labels
- ✅ Stats rapides dans le header (niveau, points, série)
- ✅ 4 cartes statistiques colorées (chapitres, badges, score, niveau)

**Statistiques affichées :**
- Niveau et progression
- Total de points
- Série quotidienne (streak)
- Chapitres complétés
- Badges obtenus
- Score moyen

---

## 2. Analytics et Partage de Liens

### 🔗 Système de Liens Partagés
**Localisation :** Page "Mes Liens Partagés" (accessible via menu utilisateur)

**Fonctionnalités :**
- ✅ Création de liens courts pour cours, quiz et examens
- ✅ Tracking automatique des clics avec Edge Function Supabase
- ✅ Analytics détaillées par lien :
  - Nombre total de clics
  - Répartition par pays (avec drapeaux emoji)
  - Répartition par appareil (Desktop, Mobile, Tablet)
  - Répartition par navigateur (Chrome, Safari, Firefox, etc.)
  - Dates et heures de chaque clic

**Améliorations UI récentes (12/10/2025) :**
- ✅ Filtres avec badges décorés visibles en dark mode
- ✅ Labels "Cours", "Quiz", "Examen" avec fond adapté au thème
- ✅ Bouton "Voir détaillé" stylisé avec icônes
- ✅ Auto-refresh des analytics au chargement
- ✅ Cartes analytics avec effet d'ombre et bordures

**Classification des liens :**
- Type "course" → Badge bleu "Cours"
- Type "quiz" → Badge vert "Quiz"
- Type "exam" → Badge orange "Examen"

---

## 3. Interface et Expérience Utilisateur

### 🎨 Design System Unifié
**Mise à jour majeure : 12 octobre 2025**

**Palette de couleurs principale :**
- Vert primaire : `rgb(34, 197, 94)` - Utilisé pour les effets d'ombre et accents
- Bleu : Stats et éléments interactifs
- Orange : Séries et défis
- Jaune : Points et récompenses

**Effets d'ombre verte standardisés :**
```css
/* Light mode */
shadow-[0_0_16px_0_rgba(34,197,94,0.18)]

/* Dark mode */
dark:shadow-[0_0_24px_0_rgba(34,197,94,0.25)]

/* Hover states */
dark:hover:shadow-[0_0_35px_rgba(34,197,94,0.25)]
```

**Pages avec design mis à jour (12/10/2025) :**
1. ✅ **Classement (Leaderboard)** :
   - Header avec gradient vert
   - Titre en `dark:text-green-300`
   - Toutes les cartes avec ombre verte
   - Labels et badges décorés (niveau, quiz, badges)
   - Badge "Vous" en gradient vert

2. ✅ **Dashboard** :
   - Section Top 10 avec cartes ombrées vertes
   - Labels "Classement" et "Top 10" visibles en dark
   - Badges niveau et quiz colorés et contrastés

3. ✅ **Coach IA** :
   - Fond sombre uniforme en mode dark
   - 4 cartes stats avec bordures colorées et ombres vertes
   - Contraste texte optimisé pour dark mode

### 📱 Responsive Design
**Status :** ✅ Validé et verrouillé (voir ARCHITECTURE.md)

**Breakpoints standardisés :**
- Mobile : < 640px
- Tablet : 640px - 1024px
- Desktop : > 1024px

**Corrections appliquées (12/10/2025) :**
- ✅ `overflow-x-hidden` sur tous les layouts
- ✅ `max-w-full` sur conteneurs principaux
- ✅ Assistant IA flottant : largeur responsive (`w-full sm:w-80`)
- ✅ Pas de débordement horizontal sur aucune page

### 🌓 Mode Sombre
**Activation :** Via Settings → Préférences → Thème

**Améliorations récentes :**
- ✅ Tous les fonds de page en `dark:bg-slate-900` ou `dark:bg-slate-950`
- ✅ Cards en `dark:bg-slate-800` avec bordures `dark:border-slate-700`
- ✅ Textes en `dark:text-white` ou `dark:text-slate-200`
- ✅ Labels et badges avec fond foncé et bordures visibles
- ✅ Ombres blanches remplacées par ombres vertes pour harmonie

---

## 4. Gamification et Classement

### 🏆 Système de Classement
**Localisation :** Page "Classement" (`/leaderboard`)

**Catégories de classement :**
1. Points Totaux (par défaut)
2. Séries quotidiennes (Streak)
3. Quiz complétés
4. Leçons terminées
5. Badges obtenus

**Filtres temporels :**
- Tout temps
- Cette semaine
- Ce mois

**Vue régionale :**
- Afrique de l'Ouest
- Afrique du Nord
- Afrique Centrale
- Afrique de l'Est
- Afrique Australe

**Améliorations visuelles (12/10/2025) :**
- ✅ Cartes utilisateurs avec ombre verte
- ✅ Badge "Vous" en gradient vert pour l'utilisateur connecté
- ✅ Badges décoratifs : Niveau, Quiz, Badges (avec couleurs et bordures)
- ✅ Médailles : 🥇 (1er), 🥈 (2e), 🥉 (3e)
- ✅ Header avec effet d'ombre verte et titre en vert clair en dark mode

**Statistiques affichées :**
- Record actuel (top user)
- Nombre de participants
- Position de l'utilisateur

### 🎖️ Système de Points et Badges
**Gain de points :**
- Quiz complété : 10-50 points (selon score)
- Chapitre terminé : 20 points
- Examen passé : 30-100 points (selon score)
- Série quotidienne : Bonus multiplicateur

**Niveaux :**
- Basés sur le total de points
- Visible sur le profil et dans le classement
- Affiché dans les badges décoratifs

---

## 5. Paramètres et Préférences

### ⚙️ Page Paramètres (Settings)
**URL :** `/settings`

**Sections disponibles :**

1. **Profil** :
   - Nom complet
   - Email
   - Bio
   - Avatar
   - Localisation
   - École/Université

2. **Préférences** :
   - Thème (Clair / Sombre / Système)
   - Langue (Français par défaut)

3. **Notifications** ✨ **(Mis à jour - 13/10/2025)** :
   - Email notifications (activé par défaut)
   - Push notifications PWA ⚠️ **Désactivées en développement**
     - Configuration complète effectuée (VAPID, SQL, Service Worker)
     - Désactivées en mode dev (problème FCM en localhost)
     - S'activeront automatiquement en production (HTTPS)
     - Documentation complète : `NOTIFICATIONS_PUSH_STATUT_FINAL.md`
   - Notifications in-app (activé par défaut)
   - Marketing/Newsletter (désactivé par défaut)
   - **Fix appliqué :** Colonne `preferences` ajoutée à la table `profiles`
   - **Stockage :** Format JSONB dans Supabase
   - **Table push_subscriptions :** Créée avec 15 colonnes, RLS, triggers

4. **Sécurité** :
   - Changement de mot de passe
   - Authentification à deux facteurs (2FA)
   - Sessions actives

**Structure des préférences (JSON) :**
```json
{
  "notifications": {
    "email": true,
    "push": true,
    "inApp": true,
    "marketing": false
  },
  "theme": "system",
  "language": "fr"
}
```

---

## 6. Architecture Technique

### 🏗️ Structure Validée
**Document de référence :** `ARCHITECTURE.md` (créé le 12/10/2025)

**Règle fondamentale :**
> L'architecture actuelle (layouts, responsive, overflow, sidebar) est stable et validée. Aucune modification future ne doit la casser sans validation explicite.

**Composants clés verrouillés :**
1. **Layouts** :
   - `PrivateLayout.jsx` - Avec `overflow-x-hidden` et `max-w-full`
   - `PublicLayout.jsx` - Avec `overflow-x-hidden` et `max-w-full`

2. **Assistant IA** :
   - `AIAssistantSidebar.jsx` - Largeur responsive et gestion overflow

3. **Navigation** :
   - `Sidebar.jsx` - Labels visibles en dark mode
   - `Navbar.jsx` - Responsive et accessible

**Stack technique :**
- Frontend : React 18 + Vite
- Styling : Tailwind CSS 3.x
- Backend : Supabase (Auth, Database, Storage, Edge Functions)
- IA : OpenAI, Anthropic, Perplexity
- Analytics : Custom tracking avec Supabase

### 📊 Base de données
**Tables principales :**
- `profiles` - Profils utilisateurs (avec `preferences` JSONB depuis 12/10/2025)
- `user_points` - Système de points et niveaux
- `user_badges` - Badges obtenus
- `quiz_results` - Résultats des quiz
- `exam_results` - Résultats des examens
- `shared_links` - Liens partagés
- `link_clicks` - Analytics des clics
- `conversations` - Historique des conversations IA
- `messages` - Messages des conversations

**Index optimisés :**
- `idx_profiles_preferences` (GIN) sur `profiles.preferences`
- Index sur les foreign keys pour performances

---

## 📝 Changelog Récent (12 octobre 2025)

### ✨ Nouvelles fonctionnalités
1. **Colonne preferences dans profiles** - Stockage des préférences utilisateur
2. **Onglet Notifications dans Settings** - Gestion complète des notifications
3. **Effet d'ombre verte unifié** - Design harmonisé sur toutes les pages

### 🎨 Améliorations UI/UX
1. **Classement** :
   - Labels et badges décorés avec couleurs et bordures
   - Badge "Vous" en gradient vert
   - Header avec effet d'ombre verte
   - Titre en vert clair en mode sombre

2. **Dashboard** :
   - Section Top 10 avec cartes ombrées vertes
   - Labels niveau et quiz décorés et contrastés
   - Label "Top 10" dans un badge vert décoré

3. **Coach IA** :
   - Fond sombre uniforme en mode dark
   - Cartes statistiques avec ombres vertes
   - Contraste texte optimisé

4. **Liens Partagés** :
   - Filtres avec badges visibles en dark mode
   - Boutons analytics stylisés
   - Auto-refresh des données

### 🐛 Corrections de bugs
1. **PGRST204** - Colonne preferences manquante (RÉSOLU)
2. **Overflow horizontal** - Sur assistant IA et layouts (RÉSOLU)
3. **Labels invisibles en dark mode** - Contraste amélioré (RÉSOLU)
4. **Analytics non rafraîchies** - Auto-refresh ajouté (RÉSOLU)
5. **Push notifications AbortError** - Vérification VAPID ajoutée, désactivation gracieuse si non configuré (RÉSOLU)

### 🔒 Architecture
- Document `ARCHITECTURE.md` créé avec règle de non-régression
- Layouts et responsive design verrouillés
- Procédure de validation obligatoire pour changements structurels

---

## 🚀 Utilisation de cette Base de Connaissances

### Pour l'Assistant IA
Cette documentation permet à l'assistant IA de :
- ✅ Répondre avec précision sur toutes les fonctionnalités
- ✅ Guider les utilisateurs sur les dernières mises à jour
- ✅ Expliquer le fonctionnement des systèmes (points, badges, analytics)
- ✅ Référencer les pages et URLs correctes
- ✅ Donner des conseils basés sur les capacités réelles de la plateforme

### Procédure de mise à jour
1. **Après chaque nouvelle fonctionnalité majeure** → Mettre à jour cette base
2. **Après correction de bug critique** → Documenter dans Changelog
3. **Après changement UI/UX significatif** → Mettre à jour la section concernée
4. **Date de modification** → Toujours mettre à jour en haut du document

---

## 📞 Questions Fréquentes

### Comment activer les notifications ?
→ Settings → Notifications → Cocher les types souhaités → Enregistrer

**Note :** Les notifications push nécessitent une configuration VAPID. Si le bouton n'apparaît pas, consultez `CONFIGURATION_NOTIFICATIONS_PUSH.md` pour la configuration complète.

### Où voir mon classement ?
→ Menu principal → Classement ou icône 🏆 dans le header

### Comment partager un cours ?
→ Page du cours → Bouton "Partager" → Lien copié → Consulter analytics dans "Mes Liens Partagés"

### Le mode sombre ne fonctionne pas ?
→ Settings → Préférences → Thème → Sélectionner "Sombre"

### Comment contacter le coach IA ?
→ Bouton flottant en bas à droite de toute page OU page dédiée `/coach-ia`

---

**Dernière vérification :** 12 octobre 2025 - 22h30
**Prochaine révision recommandée :** À chaque ajout de fonctionnalité majeure

> 💡 Cette base de connaissances est vivante et doit être maintenue à jour pour garantir la pertinence des réponses de l'assistant IA.
