# 🗺️ ROADMAP COMPLÈTE - E-RÉUSSITE

**Projet:** Plateforme d'apprentissage en ligne E-Réussite  
**Date de création:** 2 octobre 2025  
**Statut:** En développement actif  
**Stack:** React + Vite + Supabase + TailwindCSS

---

## 📊 ÉTAT ACTUEL DU PROJET

### ✅ **CE QUI FONCTIONNE**
- ✅ Authentification Supabase (Login/Signup/Reset Password)
- ✅ Structure UI complète (Navbar, Footer, Layouts)
- ✅ Composants UI (Radix UI + TailwindCSS)
- ✅ Service Worker PWA configuré
- ✅ Base de données Supabase (25 tables créées)
- ✅ Helpers BDD créés (`src/lib/supabaseDB.js`)
- ✅ Système de routing (React Router)

### 🔴 **CE QUI NÉCESSITE DU TRAVAIL**
- 🔴 Pages avec données mock (Dashboard, Courses, Quiz, Exam)
- 🔴 Pas de contenu réel dans la BDD (matieres, chapitres, lecons vides)
- 🔴 Système de paiement non implémenté
- 🔴 Panel Admin basique (CRUD incomplet)
- 🔴 Chatbot IA non fonctionnel
- 🔴 Gamification simplifiée
- 🔴 Analytics avec placeholders

---

## 🎯 PLAN D'ACTION PAR PHASES

---

## 📍 PHASE 1 : FONDATIONS (PRIORITÉ CRITIQUE)
**Durée estimée:** 3-5 jours  
**Objectif:** Stabiliser l'infrastructure et connecter les données

### Task 1.1: Migration BDD ⏱️ 2h
**Fichiers:** `database/migrations/001_merge_profile_tables.sql`
- [ ] Exécuter la migration sur Supabase Dashboard
- [ ] Fusionner `user_profiles` dans `profiles`
- [ ] Vérifier intégrité des données
- [ ] Créer backup avant migration

**Commandes:**
```sql
-- Dans Supabase SQL Editor
-- Copier-coller le contenu de 001_merge_profile_tables.sql
```

---

### Task 1.2: Peupler la base avec contenu exemple ⏱️ 4-6h
**Fichiers:** `database/seed/001_initial_content.sql` (à créer)

**Contenu à insérer:**
- [ ] 10-15 matières (BFEM + BAC)
- [ ] 3-5 chapitres par matière
- [ ] 5-10 leçons par chapitre
- [ ] 20-30 questions de quiz
- [ ] 5-10 annales par matière
- [ ] 10-15 badges
- [ ] 5-10 produits boutique

**Script exemple:**
```sql
-- Insérer matières BFEM
INSERT INTO matieres (name, level) VALUES
  ('Mathématiques', 'bfem'),
  ('Français', 'bfem'),
  ('Physique-Chimie', 'bfem'),
  ('SVT', 'bfem'),
  ('Histoire-Géographie', 'bfem');

-- Insérer chapitres pour Mathématiques BFEM
INSERT INTO chapitres (matiere_id, title, description, "order") VALUES
  (1, 'Théorème de Thalès', 'Introduction aux rapports de proportionnalité', 1),
  (1, 'Équations du second degré', 'Résolution et factorisation', 2),
  (1, 'Fonctions linéaires', 'Représentation graphique', 3);

-- etc...
```

---

### Task 1.3: Tester les nouveaux helpers ⏱️ 2h
**Fichiers:** `src/lib/supabaseDB.js`

- [ ] Créer page de test `/test-db`
- [ ] Tester `courseHelpers.getMatieresByLevel('bfem')`
- [ ] Tester `quizHelpers.getQuiz(1)`
- [ ] Tester `progressHelpers.getUserProgress(userId)`
- [ ] Vérifier les jointures SQL

---

### Task 1.4: Remplacer Courses.jsx ⏱️ 1h
**Fichiers:** 
- `src/pages/Courses.jsx` → renommer en `Courses.old.jsx`
- `src/pages/CoursesConnected.jsx` → renommer en `Courses.jsx`
- `src/App.jsx` (vérifier import)

**Commandes:**
```bash
# Dans le terminal
mv src/pages/Courses.jsx src/pages/Courses.old.jsx
mv src/pages/CoursesConnected.jsx src/pages/Courses.jsx
```

---

### Task 1.5: Connecter Dashboard ⏱️ 3-4h
**Fichier:** `src/pages/Dashboard.jsx`

**Remplacer mock data par:**
```javascript
// Stats réelles
const { data: quizResults } = await dbHelpers.quiz.getUserQuizResults(userId, 50);
const { data: examResults } = await dbHelpers.exam.getUserExamResults(userId);
const { data: progression } = await dbHelpers.progress.getUserProgress(userId);
const { data: badges } = await dbHelpers.gamification.getUserBadges(userId);

// Calculer stats
const averageScore = quizResults.reduce((sum, r) => sum + r.score, 0) / quizResults.length;
const coursesCompleted = [...new Set(progression.map(p => p.lecon.chapitre.matiere_id))].length;
```

---

## 📍 PHASE 2 : FONCTIONNALITÉS CORE (PRIORITÉ HAUTE)
**Durée estimée:** 5-7 jours  
**Objectif:** Quiz/Exam fonctionnels + vraies stats

### Task 2.1: Page Quiz fonctionnelle ⏱️ 4-5h
**Fichier:** `src/pages/Quiz.jsx`

**À implémenter:**
- [ ] Charger quiz depuis `dbHelpers.quiz.getQuiz(quizId)`
- [ ] Afficher questions avec options (JSON parsing)
- [ ] Timer fonctionnel
- [ ] Calcul score en temps réel
- [ ] Sauvegarder résultat dans `quiz_results`
- [ ] Tracker erreurs dans `user_errors`
- [ ] Award points via gamification

**Exemple code:**
```javascript
const { data: quiz } = await dbHelpers.quiz.getQuiz(quizId);
const questions = quiz.quiz_questions;

// Soumission
const score = calculateScore(userAnswers, questions);
await dbHelpers.quiz.saveQuizResult(userId, quizId, score);
await completeQuiz(quizId, score); // Award points
```

---

### Task 2.2: Page Exam simulation ⏱️ 4-5h
**Fichier:** `src/pages/Exam.jsx`

**À implémenter:**
- [ ] Charger exam depuis `dbHelpers.exam.getExam(examId)`
- [ ] Timer countdown fonctionnel
- [ ] Mode plein écran
- [ ] Chargement PDF (si disponible)
- [ ] Sauvegarder résultat
- [ ] Générer rapport de performance

---

### Task 2.3: Page Leaderboard dynamique ⏱️ 2-3h
**Fichier:** `src/pages/Leaderboard.jsx`

**À implémenter:**
- [ ] Utiliser `profiles` avec tri par `points`
- [ ] Filtres par région (si colonne existe)
- [ ] Filtres par niveau (BFEM/BAC)
- [ ] Position de l'utilisateur actuel
- [ ] Top 10, Top 50, Top 100

**Query:**
```javascript
const { data } = await supabase
  .from('profiles')
  .select('id, full_name, avatar_url, points, level')
  .order('points', { ascending: false })
  .limit(50);
```

---

### Task 2.4: Système de notifications temps réel ⏱️ 3-4h
**Fichier:** `src/components/NotificationCenter.jsx`

**À implémenter:**
- [ ] Subscribe à `user_notifications` avec Realtime
- [ ] Badge compteur non-lus
- [ ] Toast sur nouvelle notification
- [ ] Mark as read
- [ ] Filtres (system, badge, achievement)

**Code Realtime:**
```javascript
useEffect(() => {
  const channel = supabase
    .channel('notifications')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'user_notifications',
      filter: `user_id=eq.${userId}`
    }, payload => {
      toast({
        title: payload.new.title,
        description: payload.new.message
      });
    })
    .subscribe();

  return () => supabase.removeChannel(channel);
}, [userId]);
```

---

### Task 2.5: Badges page fonctionnelle ⏱️ 2-3h
**Fichier:** `src/pages/Badges.jsx`

- [ ] Charger tous les badges disponibles
- [ ] Charger badges utilisateur
- [ ] Afficher locked/unlocked
- [ ] Progress bars pour badges progressifs
- [ ] Conditions d'obtention

---

## 📍 PHASE 3 : E-COMMERCE (PRIORITÉ HAUTE)
**Durée estimée:** 5-7 jours  
**Objectif:** Système de paiement fonctionnel

### Task 3.1: Panier persistant ⏱️ 2-3h
**Fichier:** `src/hooks/useCart.jsx`

**Remplacer localStorage par BDD:**
- [ ] Créer table `cart_items` (si pas déjà existante)
- [ ] Sauvegarder ajouts en BDD
- [ ] Synchroniser avec localStorage pour offline
- [ ] Merger au login

---

### Task 3.2: Page Checkout ⏱️ 4-5h
**Fichier:** `src/pages/Checkout.jsx` (à créer)

**Workflow:**
1. Résumé de commande
2. Formulaire d'adresse
3. Choix mode de paiement
4. Confirmation

**À implémenter:**
- [ ] Créer commande (`orders` + `order_items`)
- [ ] Calculer total avec taxes
- [ ] Générer numéro de commande unique

---

### Task 3.3: Intégration Orange Money API ⏱️ 6-8h
**Fichier:** `src/lib/payments/orangeMoney.js` (à créer)

**Documentation:** [Orange Money API](https://developer.orange.com/)

**Étapes:**
1. [ ] Créer compte développeur Orange
2. [ ] Obtenir credentials (API Key, Secret)
3. [ ] Implémenter initiation paiement
4. [ ] Implémenter vérification statut
5. [ ] Webhook pour confirmation
6. [ ] Mettre à jour statut commande

**Code exemple:**
```javascript
export const initiateOrangeMoneyPayment = async (amount, orderReferenc, phoneNumber) => {
  const response = await fetch('https://api.orange.com/orange-money-webpay/dev/v1/webpayment', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.VITE_ORANGE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      merchant_key: process.env.VITE_ORANGE_MERCHANT_KEY,
      currency: 'XOF',
      order_id: orderReference,
      amount: amount,
      return_url: `${window.location.origin}/payment/success`,
      cancel_url: `${window.location.origin}/payment/cancel`,
      notif_url: `${process.env.VITE_API_URL}/webhooks/orange-money`,
      lang: 'fr',
      reference: phoneNumber
    })
  });

  return await response.json();
};
```

---

### Task 3.4: Alternative Wave / Stripe ⏱️ 4-6h
**Fichier:** `src/lib/payments/wave.js` ou `stripe.js`

- [ ] Même logique qu'Orange Money
- [ ] Permettre choix du provider

---

### Task 3.5: Historique commandes ⏱️ 2h
**Fichier:** `src/pages/Orders.jsx` (à créer)

- [ ] Liste des commandes utilisateur
- [ ] Statuts (pending, paid, delivered, cancelled)
- [ ] Téléchargement factures PDF
- [ ] Tracking de livraison (physique)

---

## 📍 PHASE 4 : PANEL ADMIN COMPLET (PRIORITÉ MOYENNE)
**Durée estimée:** 5-7 jours  
**Objectif:** Interface admin complète avec CRUD

### Task 4.1: CRUD Matières ⏱️ 3-4h
**Fichier:** `src/pages/admin/AdminCourses.jsx`

**À implémenter:**
- [ ] Liste des matières avec filtres
- [ ] Modal création matière
- [ ] Modal édition
- [ ] Suppression (avec confirmation)
- [ ] Upload icône matière

---

### Task 4.2: CRUD Chapitres & Leçons ⏱️ 4-5h
**Fichier:** `src/pages/admin/AdminCourses.jsx`

**À implémenter:**
- [ ] Vue hiérarchique (Matière > Chapitre > Leçon)
- [ ] Drag & drop pour réorganiser ordre
- [ ] Upload PDF leçon (Supabase Storage)
- [ ] Upload vidéo (ou lien YouTube/Vimeo)
- [ ] Markdown editor pour contenu texte
- [ ] Toggle `is_free_preview`

---

### Task 4.3: CRUD Quiz & Questions ⏱️ 4-5h
**Fichier:** `src/pages/admin/AdminQuizzes.jsx` (à créer)

**À implémenter:**
- [ ] Créer quiz par chapitre
- [ ] Ajouter questions (QCM)
- [ ] Options en JSON: `["A", "B", "C", "D"]`
- [ ] Réponse correcte (A, B, C, D)
- [ ] Explication de réponse
- [ ] Preview quiz

---

### Task 4.4: Gestion Utilisateurs ⏱️ 3-4h
**Fichier:** `src/pages/admin/AdminUsers.jsx`

**À implémenter:**
- [ ] Liste avec pagination
- [ ] Filtres (role, subscription, level)
- [ ] Modifier role (student/teacher/admin)
- [ ] Bloquer/débloquer utilisateur
- [ ] Stats par utilisateur
- [ ] Export CSV

---

### Task 4.5: Gestion Produits ⏱️ 2-3h
**Fichier:** `src/pages/admin/AdminProducts.jsx`

**À implémenter:**
- [ ] CRUD produits
- [ ] Upload image produit
- [ ] Upload fichier (PDF, ZIP) pour numériques
- [ ] Gestion stock (physiques)
- [ ] Prix, description, catégorie

---

### Task 4.6: Dashboard Admin avec vraies métriques ⏱️ 3-4h
**Fichier:** `src/pages/admin/AdminDashboard.jsx`

**À implémenter:**
- [ ] KPIs temps réel (utilisateurs actifs, revenus, inscriptions)
- [ ] Graphiques Recharts (revenus, inscriptions par jour/mois)
- [ ] Top cours
- [ ] Top produits vendus
- [ ] Taux de complétion moyen
- [ ] Export rapports

---

## 📍 PHASE 5 : IA & AVANCÉ (PRIORITÉ BASSE)
**Durée estimée:** 7-10 jours  
**Objectif:** Chatbot fonctionnel + analytics avancées

### Task 5.1: Intégration OpenAI API ⏱️ 4-5h
**Fichier:** `src/lib/ai/openai.js` (à créer)

**Setup:**
```bash
npm install openai
```

**Code:**
```javascript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Attention: utiliser un backend en prod
});

export const sendChatMessage = async (userMessage, context = {}) => {
  const systemPrompt = `Tu es un assistant éducatif pour E-Réussite, 
    une plateforme d'apprentissage pour les élèves africains préparant le BFEM et le BAC.
    Réponds en français, sois pédagogue et encourageant.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ],
    temperature: 0.7,
    max_tokens: 500
  });

  return completion.choices[0].message.content;
};
```

---

### Task 5.2: Chatbot UI amélioré ⏱️ 3-4h
**Fichier:** `src/components/ChatbotAdvanced.jsx`

**À implémenter:**
- [ ] Historique conversations
- [ ] Suggestions de questions
- [ ] Markdown rendering
- [ ] Code syntax highlighting
- [ ] Export conversation PDF
- [ ] Feedback (👍 👎)

---

### Task 5.3: Générateur de quiz IA ⏱️ 5-6h
**Fichier:** `src/lib/ai/quizGenerator.js` (à créer)

**Fonctionnalité:**
- [ ] Générer 5-10 questions depuis un chapitre
- [ ] Parser réponse OpenAI en JSON
- [ ] Sauvegarder dans `quiz` + `quiz_questions`
- [ ] Interface admin pour générer

**Prompt exemple:**
```javascript
const prompt = `Génère 5 questions QCM sur le sujet: "${chapitreTitle}".
Format JSON:
[
  {
    "question": "...",
    "options": ["A", "B", "C", "D"],
    "correct": "A",
    "explanation": "..."
  }
]`;
```

---

### Task 5.4: Analytics avancées ⏱️ 4-5h
**Fichier:** `src/pages/Analytics.jsx` (à créer)

**À implémenter:**
- [ ] Temps d'étude par matière (graphique)
- [ ] Évolution score moyen (ligne)
- [ ] Heatmap d'activité (calendrier)
- [ ] Points forts/faibles par matière
- [ ] Recommendations IA basées sur erreurs

---

### Task 5.5: Notifications push (PWA) ⏱️ 3-4h
**Fichier:** `public/sw.js` (modifier)

**À implémenter:**
- [ ] Demander permission notifications
- [ ] Envoyer depuis backend (à créer)
- [ ] Rappels d'étude
- [ ] Nouveaux cours disponibles
- [ ] Défis mensuels

---

## 📍 PHASE 6 : OPTIMISATIONS & POLISH (ONGOING)
**Durée estimée:** Continu  
**Objectif:** Performance, SEO, UX

### Task 6.1: Performance ⏱️ 2-3h
- [ ] Lazy loading images
- [ ] Code splitting optimisé
- [ ] Compression assets
- [ ] CDN setup
- [ ] Lighthouse score > 90

---

### Task 6.2: SEO ⏱️ 2-3h
- [ ] Meta tags dynamiques
- [ ] Sitemap.xml
- [ ] Robots.txt
- [ ] Schema.org markup
- [ ] Open Graph images

---

### Task 6.3: Tests ⏱️ 4-5h
- [ ] Tests unitaires (Vitest)
- [ ] Tests E2E Playwright (étendre)
- [ ] Test coverage > 70%

---

### Task 6.4: Documentation ⏱️ 2-3h
- [ ] README complet
- [ ] API documentation
- [ ] Guide déploiement
- [ ] Guide contribution

---

## 📊 MÉTRIQUES DE SUCCÈS

### Phase 1 (Fondations)
- ✅ 0 erreur console
- ✅ Toutes les pages chargent depuis BDD
- ✅ 100% des helpers fonctionnels

### Phase 2 (Core Features)
- ✅ Quiz fonctionnels avec sauvegarde
- ✅ Dashboard avec vraies stats
- ✅ Notifications temps réel

### Phase 3 (E-commerce)
- ✅ Commande complète possible
- ✅ Au moins 1 provider de paiement
- ✅ Confirmation email

### Phase 4 (Admin)
- ✅ CRUD complet sur tous les modèles
- ✅ Upload fichiers fonctionnel
- ✅ Métriques temps réel

### Phase 5 (IA)
- ✅ Chatbot répond en <2s
- ✅ Génération quiz fonctionnelle
- ✅ Recommendations pertinentes

---

## 🚀 DÉPLOIEMENT

### Environnements
1. **Development:** localhost:3000
2. **Staging:** staging.e-reussite.com
3. **Production:** e-reussite.com

### Checklist pré-déploiement
- [ ] Variables d'environnement configurées
- [ ] Migrations BDD exécutées
- [ ] Tests E2E passent
- [ ] Lighthouse score > 85
- [ ] Backup BDD effectué
- [ ] Monitoring configuré (Sentry, Analytics)

---

## 📞 SUPPORT & RESSOURCES

- **Documentation Supabase:** https://supabase.com/docs
- **Documentation React:** https://react.dev
- **Radix UI:** https://www.radix-ui.com
- **TailwindCSS:** https://tailwindcss.com
- **Orange Money API:** https://developer.orange.com

---

## 📝 NOTES

- Toujours créer une branche pour chaque feature
- Commit réguliers avec messages clairs
- Code review avant merge
- Tests avant push en production

---

**Dernière mise à jour:** 2 octobre 2025  
**Version:** 1.0.0  
**Maintenu par:** Équipe E-Réussite
