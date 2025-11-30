# 🎯 Modules Admin - Guide de Test

## ✅ Modules Complétés

### 1. AdminLayout (Navigation Modulaire)
**Fichier**: `src/components/admin/AdminLayout.jsx`

**Fonctionnalités**:
- ✅ Sidebar collapsible avec 8 modules organisés en 4 sections :
  - **Général**: Dashboard
  - **Gestion des Données**: Utilisateurs, Cours & Contenus, Quiz & Examens
  - **Fonctionnalités**: Orientation, Gamification
  - **Système**: Analytics & Rapports, Paramètres
- ✅ Topbar avec :
  - Recherche globale
  - Notifications (badge avec compteur)
  - Menu profil utilisateur
- ✅ Navigation active avec highlight
- ✅ Responsive design
- ✅ Déconnexion intégrée

**Test**: Accédez à `/admin` et vérifiez la sidebar et la topbar

---

### 2. AdminUsersPage (Gestion Utilisateurs)
**Fichier**: `src/pages/admin/AdminUsersPage.jsx`

**Fonctionnalités**:
- ✅ **3 Cartes de Statistiques** :
  - Total Utilisateurs
  - Actifs Aujourd'hui
  - Nouveaux (7 derniers jours)

- ✅ **Système de Filtres** :
  - Recherche par nom/email
  - Filtre par rôle (student, teacher, coach, parent, admin)
  - Filtre par niveau (3e, Seconde, Première, Terminale)
  - Bouton Export CSV

- ✅ **Table Utilisateurs** :
  - Colonnes: Nom, Email, Rôle (badge), Niveau, Région, Points
  - Actions: Voir détails, Éditer, Supprimer
  - Pagination (20 utilisateurs par page)

- ✅ **3 Modales** :
  - **Détails**: Affiche profil complet + stats gamification (points, séries, quiz) + badges obtenus
  - **Édition**: Form pour modifier nom, email, rôle, niveau, région
  - **Suppression**: Confirmation avec nom utilisateur

- ✅ **Intégrations** :
  - adminService.getUsers() avec filtres
  - adminService.getUserDetails() pour modal
  - adminService.updateUser() pour édition
  - adminService.deleteUser() pour suppression
  - adminService.exportUsersToCSV() pour export

**Test**: Accédez à `/admin/users`

**Tests fonctionnels à effectuer**:
1. ✅ Vérifier que les 3 cartes stats affichent les données
2. ✅ Tester la recherche par nom/email
3. ✅ Tester les filtres par rôle et niveau
4. ✅ Cliquer sur "Voir détails" (icône œil) → Modal avec stats complètes
5. ✅ Cliquer sur "Éditer" (icône crayon) → Modal édition
6. ✅ Cliquer sur "Supprimer" (icône poubelle) → Modal confirmation
7. ✅ Tester la pagination si plus de 20 utilisateurs
8. ✅ Tester l'export CSV

---

## 🚀 URL de Test

### Développement Local
- **Base Admin**: http://localhost:3000/admin
- **Module Users**: http://localhost:3000/admin/users

### Production
- **Base Admin**: https://ereussite.netlify.app/admin
- **Module Users**: https://ereussite.netlify.app/admin/users

---

## 🔑 Prérequis pour Tester

### 1. Compte Admin
Pour accéder aux pages admin, vous devez être connecté avec un compte ayant `role = 'admin'` dans la table `profiles`.

**Vérification dans Supabase**:
```sql
SELECT id, email, role FROM profiles WHERE role = 'admin';
```

**Créer un admin si nécessaire**:
```sql
-- 1. Créer compte dans auth.users via Supabase Dashboard
-- 2. Mettre à jour le profil
UPDATE profiles SET role = 'admin' WHERE email = 'votre-email@example.com';
```

### 2. Données de Test
Pour tester pleinement le module Users, assurez-vous d'avoir :
- ✅ Plusieurs utilisateurs dans `profiles` (différents rôles, niveaux, régions)
- ✅ Données dans `user_points` (points, quiz complétés, séries)
- ✅ Badges dans `user_badges` pour certains utilisateurs
- ✅ Progression dans `user_progress`

---

## 🎨 Composants UI Utilisés

- ✅ **Card** (shadcn/ui)
- ✅ **Button** (shadcn/ui)
- ✅ **Input** (shadcn/ui)
- ✅ **Badge** (shadcn/ui)
- ✅ **Select** (shadcn/ui)
- ✅ **Dialog** (shadcn/ui) - **CRÉÉ**
- ✅ **Table** (shadcn/ui)
- ✅ **Recharts** (AreaChart pour graphiques)
- ✅ **Lucide React** (icônes)
- ✅ **Framer Motion** (animations)
- ✅ **Sonner** (toasts notifications)

---

## 📊 Services Admin Intégrés

Le module Users utilise `adminService.js` qui fournit :

```javascript
// Stats dashboard
getDashboardStats() // KPIs globaux

// Gestion utilisateurs
getUsers(filters) // Liste avec filtres
getUserDetails(userId) // Détails complets
updateUser(userId, updates) // Mise à jour
deleteUser(userId) // Suppression
exportUsersToCSV(filters) // Export CSV
```

---

## 🐛 Points de Test Critiques

### Sécurité
- [ ] Vérifier que seuls les admins peuvent accéder à `/admin/*`
- [ ] Vérifier que AdminRoute protège correctement les routes
- [ ] Tester la suppression d'utilisateur (RLS policies)

### Performance
- [ ] Vérifier le temps de chargement initial
- [ ] Tester avec 100+ utilisateurs (pagination)
- [ ] Vérifier que les filtres ne rechargent que les données nécessaires

### UX/UI
- [ ] Vérifier le responsive design (mobile/tablet/desktop)
- [ ] Tester les animations (Framer Motion)
- [ ] Vérifier les toasts de notification (succès/erreur)
- [ ] Tester la sidebar collapsible
- [ ] Vérifier les états de chargement (spinners)

### Fonctionnel
- [ ] Export CSV génère le bon fichier
- [ ] Modal détails charge toutes les données (profil, points, badges)
- [ ] Édition sauvegarde correctement dans Supabase
- [ ] Suppression retire l'utilisateur de la liste
- [ ] Filtres s'appliquent correctement
- [ ] Recherche fonctionne (nom ET email)

---

## 📝 Modules Suivants à Créer

### 3. AdminCoursesPage
- CRUD complet pour cours/chapitres
- Upload de contenus
- Preview de cours
- Statistiques d'inscription et complétion

### 4. AdminQuizPage
- Créateur de quiz multi-étapes
- Gestion des questions/réponses
- Statistiques par quiz (tentatives, scores moyens)

### 5. AdminOrientationPage
- Tests d'orientation réalisés
- CRUD fiches métiers
- Stats régionales des tests

### 6. AdminGamificationPage
- Configuration badges personnalisés
- Classements globaux et régionaux
- Récompenses manuelles

### 7. AdminAnalyticsPage
- Graphiques avancés (croissance utilisateurs, activité)
- Exports PDF
- Requêtes personnalisées

### 8. AdminSettingsPage
- Gestion rôles & permissions
- Configuration site
- Logs d'activité
- Backups base de données

---

## 🚀 Commandes Utiles

### Développement
```bash
npm run dev              # Démarrer serveur local
npm run build            # Build production
npm run preview          # Preview du build
```

### Déploiement
```bash
netlify deploy --prod    # Déployer en production
netlify open:admin       # Ouvrir dashboard Netlify
```

### Tests
```bash
# Tester la compilation
npm run build

# Vérifier les erreurs TypeScript/ESLint
npm run lint (si configuré)
```

---

## 📌 Notes Importantes

1. **AdminDashboardNew vs AdminDashboard**:
   - `AdminDashboardNew.jsx` = Version moderne avec tous les KPIs
   - `AdminDashboard.jsx` = Ancienne version (peut être supprimée)
   - Route `/admin` utilise maintenant `AdminDashboardNew`

2. **Composants Legacy**:
   - `AdminUsers.jsx` = Ancienne version basique
   - `AdminUsersPage.jsx` = Nouvelle version complète
   - Route `/admin/users` utilise maintenant `AdminUsersPage`

3. **adminService.js**:
   - Service centralisé pour toutes les opérations admin
   - 800+ lignes avec méthodes organisées par fonctionnalité
   - Retourne toujours `{success: boolean, data?: any, error?: string}`

---

## ✅ Checklist de Validation

### AdminLayout
- [x] Sidebar affichée avec 8 modules
- [x] Navigation fonctionne entre modules
- [x] Topbar affiche recherche + notifications
- [x] Bouton collapse sidebar fonctionne
- [x] Déconnexion redirige vers `/`

### AdminUsersPage
- [ ] 3 cartes stats chargent les données
- [ ] Table affiche les utilisateurs
- [ ] Recherche filtre par nom/email
- [ ] Filtres rôle/niveau fonctionnent
- [ ] Modal détails affiche profil + stats + badges
- [ ] Modal édition sauvegarde les modifications
- [ ] Modal suppression retire l'utilisateur
- [ ] Export CSV télécharge le fichier
- [ ] Pagination fonctionne (si >20 users)
- [ ] Toasts affichent succès/erreurs

---

## 🎯 Prochaines Étapes

1. ✅ **Tester module Users** (en cours)
2. ⏳ Créer AdminCoursesPage
3. ⏳ Créer AdminQuizPage
4. ⏳ Créer AdminOrientationPage
5. ⏳ Créer AdminGamificationPage
6. ⏳ Créer AdminAnalyticsPage
7. ⏳ Créer AdminSettingsPage
8. ⏳ Tests E2E complets
9. ⏳ Déploiement production

---

**Date de création**: 29 novembre 2025
**Version**: 1.0.0
**Statut**: Module Users prêt pour test 🚀
