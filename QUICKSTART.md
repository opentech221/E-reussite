# 🚀 QUICK START GUIDE - E-RÉUSSITE

## 📦 Installation

```bash
# Cloner le repository
git clone https://github.com/opentech221/E-reussite.git
cd E-reussite

# Installer les dépendances
npm install
```

## ⚙️ Configuration

Créer un fichier `.env` à la racine :

```env
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_anon_key
```

## 🗄️ Configuration Base de Données

### 1. Créer un projet Supabase
- Aller sur https://app.supabase.com
- Créer un nouveau projet
- Noter l'URL et l'ANON KEY

### 2. Exécuter les migrations
Dans le SQL Editor de Supabase :

```sql
-- Copier-coller le contenu de :
-- database/migrations/001_merge_profile_tables.sql
```

### 3. Peupler la base
Toujours dans le SQL Editor :

```sql
-- Copier-coller le contenu de :
-- database/seed/001_initial_content.sql
```

## 🏃 Démarrage

```bash
npm run dev
```

Application disponible sur : http://localhost:3000

## ✅ Vérifications

- [ ] Page d'accueil charge
- [ ] Page `/courses` affiche les matières
- [ ] Page `/shop` affiche les produits
- [ ] Inscription/Connexion fonctionne

## 📚 Structure du Projet

```
E-reussite/
├── src/
│   ├── components/     # Composants réutilisables
│   ├── contexts/       # Contextes React (Auth)
│   ├── hooks/          # Custom hooks
│   ├── lib/            # Helpers et utilitaires
│   │   └── supabaseDB.js  # ⭐ Helpers BDD
│   ├── pages/          # Pages de l'application
│   └── main.jsx        # Point d'entrée
├── database/
│   ├── migrations/     # Scripts de migration SQL
│   └── seed/           # Scripts de seed
├── public/             # Assets statiques + PWA
└── ROADMAP.md         # ⭐ Plan complet du projet
```

## 🔑 Fonctionnalités Clés

### Actuellement Fonctionnelles
✅ Authentification (Supabase Auth)  
✅ Page Courses connectée à la BDD  
✅ Système de profils utilisateurs  
✅ Helpers BDD complets  
✅ PWA (Service Worker)  

### En Développement
🔨 Dashboard avec vraies stats  
🔨 Quiz/Exam fonctionnels  
🔨 Système de paiement  
🔨 Panel Admin CRUD  
🔨 Chatbot IA  

## 📖 Documentation

- **ROADMAP.md** : Plan complet sur 6 phases
- **ACTIONS_IMMEDIATES.md** : Étapes prioritaires
- **README.md** : Documentation générale

## 🐛 Debugging

### Erreurs communes

**"Cannot find module supabaseDB"**
→ Vérifier que `src/lib/supabaseDB.js` existe

**"Table 'matieres' is empty"**
→ Exécuter le script de seed `001_initial_content.sql`

**Page blanche**
→ Ouvrir la console (F12) et vérifier les erreurs

## 🤝 Contribution

1. Créer une branche pour votre feature
2. Commiter avec des messages clairs
3. Tester localement
4. Créer une Pull Request

## 📞 Support

- GitHub Issues : https://github.com/opentech221/E-reussite/issues
- Documentation Supabase : https://supabase.com/docs

---

**Version:** 1.0.0  
**Dernière mise à jour:** 2 octobre 2025
