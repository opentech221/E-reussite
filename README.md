# 🌍 E-réussite

## Plateforme d'Orientation et d'Accompagnement Scolaire pour l'Afrique Francophone

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green.svg)](https://supabase.com/)
[![Made in Senegal](https://img.shields.io/badge/Made%20in-Senegal%20🇸🇳-green.svg)](https://github.com/opentech221)

---

## 💡 La Vision

> **"Réduire la distance entre l'élève et son avenir."**

Au Sénégal et dans les pays d'Afrique francophone, **l'orientation scolaire est un luxe réservé à quelques privilégiés**.

- **1 seul centre d'orientation par région** pour des milliers d'élèves
- **1 visite par an** des conseillers dans les établissements
- **Accompagnement insuffisant** au moment des choix décisifs
- **Inégalité territoriale** : zones rurales délaissées

### Notre Solution

**E-réussite** est un **coach numérique intelligent** disponible 24h/24, qui accompagne chaque élève tout au long de son parcours scolaire et professionnel.

Un coach qui ne remplace pas les humains, mais qui **étend leur portée**.

📖 **[Lire la vision complète](VISION_PROJET.md)**

---

## 🎯 Fonctionnalités Principales

### 🧭 Orientation Personnalisée
- Quiz et tests d'aptitudes interactifs
- Plan de carrière adapté aux réalités africaines
- Exploration des opportunités (public, privé, entrepreneuriat)
- Accompagnement continu, pas une simple visite annuelle

### 📚 Plateforme Éducative Complète
- Cours structurés par matière et niveau (BFEM, BAC)
- Exercices et quiz avec correction automatique
- Examens blancs conformes aux programmes nationaux
- Suivi de progression détaillé

### 🤖 Coach IA Contextuel
- Assistant disponible 24h/24 sur toutes les pages
- Compréhension du contexte éducatif africain
- Conseils personnalisés basés sur les performances
- Recherche web intégrée (Perplexity)
- Multi-conversations avec historique

### 🏆 Gamification et Motivation
- Système de points et niveaux (1-100+)
- Badges de réussite et d'excellence
- Compétitions régionales (Afrique de l'Ouest, Nord, Centre, Est, Sud)
- Classements dynamiques (Top 10, Top 100)
- Séries quotidiennes (streaks)

### 📊 Analytics et Suivi
- Dashboard personnalisé avec statistiques détaillées
- Graphiques de progression interactifs
- Analyse des forces et faiblesses
- Recommandations adaptées

---

## 🚀 Technologies Utilisées

### Frontend
- **React 18** avec Vite pour des performances optimales
- **Tailwind CSS 3** avec design system personnalisé
- **Framer Motion** pour animations fluides
- **Recharts** pour visualisations de données
- **Lucide React** pour icônes modernes

### Backend
- **Supabase** (PostgreSQL + RLS)
- **Edge Functions** pour logique métier
- **Real-time subscriptions** pour mises à jour live
- **Row Level Security** pour sécurité granulaire

### IA et Intégration
- **Multi-provider AI** (OpenAI, Anthropic, Google, etc.)
- **Perplexity API** pour recherche web contextuelle
- **VAPID Push Notifications** (production)
- **Service Worker** pour expérience offline

---

## 📦 Installation

### Prérequis
- Node.js 18+ 
- npm ou yarn
- Compte Supabase (gratuit)

### Étapes

```bash
# 1. Cloner le repository
git clone https://github.com/opentech221/E-reussite.git
cd E-reussite

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env.local

# 4. Éditer .env.local avec vos clés
# VITE_SUPABASE_URL=votre_url_supabase
# VITE_SUPABASE_ANON_KEY=votre_cle_anonyme
# VITE_OPENAI_API_KEY=votre_cle_openai (optionnel)
# VITE_PERPLEXITY_API_KEY=votre_cle_perplexity (optionnel)

# 5. Lancer le serveur de développement
npm run dev
```

Le site sera accessible sur `http://localhost:3000`

---

## 📚 Documentation Complète

### Guides Principaux

- **[VISION_PROJET.md](VISION_PROJET.md)** - Mission et impact social ⭐
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Architecture technique
- **[BASE_CONNAISSANCES_IA.md](BASE_CONNAISSANCES_IA.md)** - Documentation IA

### Corrections et Améliorations

- **[CORRECTION_FINALE_SCHEMA_BDD.md](CORRECTION_FINALE_SCHEMA_BDD.md)** - Schéma BDD final
- **[SESSION_COMPLETE_12_13_OCT_2025.md](SESSION_COMPLETE_12_13_OCT_2025.md)** - Session complète de debug
- **[CONFIGURATION_NOTIFICATIONS_PUSH.md](CONFIGURATION_NOTIFICATIONS_PUSH.md)** - Configuration push

---

## 🤝 Contribuer

Ce projet est ouvert aux contributions !

### Qui peut contribuer ?

- 💻 **Développeurs** - Améliorations techniques
- 👨‍🏫 **Éducateurs** - Contenu pédagogique
- 🧭 **Conseillers d'orientation** - Expertise métier
- 🌍 **Traducteurs** - Langues locales (Wolof, Bambara, etc.)
- 🧪 **Testeurs** - Retours utilisateurs

### Comment Contribuer ?

1. **Fork** le projet
2. **Créer** une branche : `git checkout -b feature/ma-feature`
3. **Commit** vos changements : `git commit -m 'Ajout de ma feature'`
4. **Push** vers la branche : `git push origin feature/ma-feature`
5. **Ouvrir** une Pull Request

### Guidelines

- Respecter l'architecture existante (voir `ARCHITECTURE.md`)
- Tester sur mobile ET desktop
- Documenter les nouvelles fonctionnalités
- Utiliser le design system (ombres vertes, dark mode)

---

## 📞 Contact

**Créateur :** opentech221  
**GitHub :** [@opentech221](https://github.com/opentech221)  
**Pays :** Sénégal 🇸🇳

Pour toute question ou collaboration :
- Ouvrir une [Issue](https://github.com/opentech221/E-reussite/issues)
- Ou une [Discussion](https://github.com/opentech221/E-reussite/discussions)

---

## 🎖️ Licence

Ce projet est sous licence **MIT** - voir le fichier [LICENSE](LICENSE) pour plus de détails.

Vous êtes libre de :
- ✅ Utiliser le code pour vos projets
- ✅ Modifier et adapter selon vos besoins
- ✅ Distribuer avec ou sans modifications
- ✅ Utiliser commercialement

**Condition :** Inclure la licence et le copyright d'origine.

---

## 🚀 Feuille de Route

### ✅ Phase 1 - MVP (Complété)
- [x] Interface utilisateur responsive
- [x] Système d'authentification
- [x] Cours et chapitres
- [x] Quiz et examens
- [x] Coach IA contextuel
- [x] Dashboard et analytics
- [x] Gamification (points, badges, niveaux)
- [x] Classements régionaux

### 🔄 Phase 2 - Optimisation (En cours)
- [x] Push notifications (configuré)
- [x] Design system unifié (ombres vertes)
- [x] Dark mode optimisé
- [ ] Tests utilisateurs (Sénégal)
- [ ] Optimisations performances
- [ ] Mode offline avancé

### 🔮 Phase 3 - Expansion (Futur)
- [ ] Application mobile native
- [ ] Support multilingue (Wolof, Bambara, etc.)
- [ ] Partenariats établissements
- [ ] API ouverte pour développeurs

### 🌍 Phase 4 - Impact (Long terme)
- [ ] Déploiement dans 5 pays africains
- [ ] 100,000+ élèves accompagnés
- [ ] Certification ministères de l'éducation

---

## 🌟 Remerciements

À tous ceux qui croient en cette vision :

- Aux **conseillers d'orientation** qui font de leur mieux avec peu de moyens
- Aux **élèves** qui osent rêver malgré les obstacles
- Aux **parents** qui sacrifient tout pour l'éducation de leurs enfants
- Aux **contributeurs** qui font grandir ce projet

**Ce projet est pour vous, avec vous.** 🙏

---

## 📖 Citations Inspirantes

> *"L'éducation est l'arme la plus puissante pour changer le monde."*  
> — Nelson Mandela

> *"Un enfant, un enseignant, un livre et un stylo peuvent changer le monde."*  
> — Malala Yousafzai

**Et aujourd'hui, ajoutons :**

> *"Un enfant, un coach IA, une plateforme et une vision peuvent changer l'Afrique."* ✨  
> — E-réussite

---

## 🎓 Messages Clés

### Pour les Élèves

Tu n'es pas seul. Tu as le droit de rêver, d'hésiter, de te tromper, de recommencer.

E-réussite est là pour t'accompagner, pas pour te juger.

**Ton avenir t'appartient.** 🚀

### Pour les Parents

Votre enfant mérite d'être guidé dans ses choix.

E-réussite complète votre rôle en apportant expertise et informations actualisées.

Ensemble, donnons-lui les meilleures chances de réussite. 💪

### Pour les Enseignants et Conseillers

Vous faites un travail extraordinaire avec des moyens limités.

E-réussite est un outil **pour vous**, pas **contre vous**.

Il vous permet de mieux suivre vos élèves et d'identifier ceux qui ont besoin d'un accompagnement humain renforcé. 🤝

---

<div align="center">

**Ensemble, transformons l'avenir de la jeunesse africaine !** 🌍✨

Made with ❤️ in Senegal 🇸🇳

</div>
