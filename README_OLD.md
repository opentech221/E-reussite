# 🎓 E-Réussite

> Plateforme d'apprentissage en ligne nouvelle génération pour le BFEM et le Baccalauréat en Afrique francophone

[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-4.0-purple.svg)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-2.30-green.svg)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.0-cyan.svg)](https://tailwindcss.com/)

---

## 🌟 Fonctionnalités

### ✅ Actuellement Disponibles
- 🔐 **Authentification** complète (Supabase Auth)
- 📚 **Cours** par niveau (BFEM, BAC) avec chapitres et leçons
- 📝 **Quiz** interactifs avec sauvegarde des résultats
- 📊 **Dashboard** personnalisé avec statistiques
- 🏆 **Gamification** : badges, points, classements
- 🛒 **Boutique** : annales, fiches, produits
- 📱 **PWA** : mode hors-ligne avec Service Worker
- 🎨 **UI moderne** : Radix UI + TailwindCSS

### 🚧 En Développement
- 💰 Paiement mobile (Orange Money, Wave)
- 🤖 Chatbot IA éducatif (OpenAI)
- 👨‍💼 Panel Admin complet (CRUD)
- 📈 Analytics avancées
- 🎓 Certificats de complétion

---

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+
- Compte Supabase ([Créer un compte](https://app.supabase.com))
- Git

### Installation

```bash
# Cloner le repository
git clone https://github.com/opentech221/E-reussite.git
cd E-reussite

# Installer les dépendances
npm install
```

### Configuration

1. **Créer un fichier `.env` à la racine :**

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_anon_key_ici
```

2. **Configurer la base de données Supabase :**

Dans le SQL Editor de Supabase :

```sql
-- 1. Exécuter la migration
-- Copier-coller : database/migrations/001_merge_profile_tables.sql

-- 2. Peupler avec du contenu
-- Copier-coller : database/seed/001_initial_content.sql
```

3. **Démarrer l'application :**

```bash
npm run dev
```

Application disponible sur : **http://localhost:3000** 🎉

---

## 📁 Structure du Projet

```
E-reussite/
├── src/
│   ├── components/       # Composants UI réutilisables
│   │   ├── ui/          # Composants Radix UI
│   │   ├── layouts/     # Layouts (Public, Private, Admin)
│   │   └── admin/       # Composants Admin
│   ├── contexts/        # Contextes React
│   │   └── SupabaseAuthContext.jsx  # Auth + Session
│   ├── hooks/           # Custom hooks
│   ├── lib/             # Utilitaires
│   │   ├── supabaseDB.js           # ⭐ Helpers BDD complets
│   │   ├── customSupabaseClient.js # Client Supabase
│   │   ├── simpleGamification.js   # Engine gamification
│   │   └── simpleEducationalChatbot.js # Chatbot
│   ├── pages/           # Pages de l'application
│   │   ├── Home.jsx
│   │   ├── Courses.jsx  # ⭐ Connectée à Supabase
│   │   ├── Dashboard.jsx
│   │   ├── Quiz.jsx
│   │   ├── admin/       # Pages admin
│   │   └── ...
│   └── main.jsx         # Point d'entrée
├── database/
│   ├── migrations/      # Scripts SQL de migration
│   └── seed/           # Scripts de seed (données initiales)
├── public/
│   ├── sw.js           # Service Worker PWA
│   └── manifest.json   # Manifest PWA
├── ROADMAP.md          # ⭐ Plan complet du projet
├── ACTIONS_IMMEDIATES.md  # Guide étapes prioritaires
└── QUICKSTART.md       # Guide d'installation détaillé
```

---

## 🗄️ Base de Données

### Schéma Supabase (25 tables)

**Contenu Pédagogique :**
- `matieres` - Matières (Maths, Français, etc.)
- `chapitres` - Chapitres par matière
- `lecons` - Leçons avec PDF/vidéo
- `quiz` & `quiz_questions` - Quiz interactifs
- `annales` - Annales corrigées
- `fiches_revision` - Fiches de révision
- `exam_simulations` - Simulations d'examens

**Utilisateurs & Progression :**
- `profiles` - Profils utilisateurs
- `user_progression` - Leçons complétées
- `quiz_results` - Résultats de quiz
- `exam_results` - Résultats d'examens
- `user_errors` - Tracking des erreurs

**Gamification :**
- `badges` & `user_badges` - Système de badges
- `monthly_challenges` - Défis mensuels
- `challenge_participants` - Participants

**E-commerce :**
- `products` - Produits (numériques/physiques)
- `orders` & `order_items` - Commandes
- `payments` - Paiements

**Autres :**
- `user_notifications` - Notifications
- `ai_conversations` - Historique chatbot
- `activity_logs` - Logs d'activité

### Seed Data (Inclus)
- ✅ 13 matières (BFEM + BAC)
- ✅ 17 chapitres
- ✅ 9 leçons
- ✅ 6 quiz (15 questions)
- ✅ 10 badges
- ✅ 9 produits

---

## 🛠️ Scripts NPM

```bash
npm run dev          # Démarrer en développement
npm run build        # Build de production
npm run preview      # Preview du build
npm run test:e2e     # Tests E2E Playwright
npm run analyze      # Analyser le bundle
```

---

## 🧪 Tests

### Tests E2E (Playwright)

```bash
# Installer Playwright
npx playwright install

# Lancer les tests
npm run test:e2e
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| **[QUICKSTART.md](./QUICKSTART.md)** | Guide d'installation pas-à-pas |
| **[ROADMAP.md](./ROADMAP.md)** | Plan complet sur 6 phases (~35 jours) |
| **[ACTIONS_IMMEDIATES.md](./ACTIONS_IMMEDIATES.md)** | Étapes prioritaires à faire maintenant |
| **[PLATFORM_STATUS.md](./PLATFORM_STATUS.md)** | État actuel de la plateforme |

---

## 🎯 Roadmap

### Phase 1 : Fondations ✅ (En cours)
- [x] Helpers BDD complets
- [x] Page Courses connectée
- [ ] Dashboard avec vraies stats
- [ ] Quiz/Exam fonctionnels

### Phase 2 : Core Features (Semaine 1-2)
- [ ] Système de notifications temps réel
- [ ] Leaderboard dynamique
- [ ] Analytics de performance

### Phase 3 : E-commerce (Semaine 2-3)
- [ ] Intégration Orange Money
- [ ] Workflow commande complet
- [ ] Historique d'achats

### Phase 4 : Admin (Semaine 3-4)
- [ ] CRUD Matières/Chapitres/Leçons
- [ ] CRUD Quiz/Questions
- [ ] Gestion utilisateurs

### Phase 5 : IA & Avancé (Semaine 4-6)
- [ ] Chatbot OpenAI
- [ ] Génération quiz IA
- [ ] Recommendations personnalisées

[Voir ROADMAP.md pour le plan complet →](./ROADMAP.md)

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment contribuer :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 🔒 Sécurité

⚠️ **IMPORTANT :** Ne commitez JAMAIS vos clés API réelles

- Utilisez `.env` pour les secrets
- Ajoutez `.env` dans `.gitignore`
- Créez un `.env.example` avec des valeurs factices

---

## 🌍 Déploiement

### Vercel (Recommandé)

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel
```

### Autres options
- Netlify
- Render
- Cloudflare Pages

[Voir ROADMAP.md section Déploiement →](./ROADMAP.md#-déploiement)

---

## 📊 Stack Technique

| Technologie | Version | Utilisation |
|-------------|---------|-------------|
| React | 18.2 | UI Framework |
| Vite | 4.0 | Build tool |
| Supabase | 2.30 | Backend (Auth + BDD + Storage) |
| TailwindCSS | 3.0 | Styling |
| Radix UI | Latest | Composants accessibles |
| Framer Motion | 10.16 | Animations |
| React Router | 6.16 | Routing |
| Recharts | 3.2 | Graphiques |
| Lucide React | 0.292 | Icônes |

---

## 📄 Licence

MIT © 2025 E-Réussite

Vous êtes libre d'utiliser ce projet pour des fins personnelles ou commerciales.

---

## 💪 Support

Besoin d'aide ?
- 📧 Email : support@e-reussite.com
- 🐛 Issues : [GitHub Issues](https://github.com/opentech221/E-reussite/issues)
- 📖 Documentation : [Voir docs/](./docs/)

---

## 🙏 Remerciements

- [Supabase](https://supabase.com) pour la plateforme backend
- [Radix UI](https://radix-ui.com) pour les composants accessibles
- [shadcn/ui](https://ui.shadcn.com) pour l'inspiration UI
- La communauté React et Vite

---

## 🌟 Star History

Si ce projet vous aide, n'hésitez pas à lui donner une ⭐ !

---

**Fait avec ❤️ pour révolutionner l'éducation en Afrique 🌍**

🇸🇳 Sénégal • 🇨🇮 Côte d'Ivoire • 🇲🇱 Mali • 🇧🇯 Bénin • 🇧🇫 Burkina Faso • Et toute l'Afrique francophone
