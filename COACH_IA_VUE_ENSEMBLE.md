# 🎯 Coach IA Flottant - Vue d'ensemble des améliorations

**Date** : 9 octobre 2025  
**Statut** : Plan prêt, en attente de validation  
**Durée totale** : 8-11 jours

---

## 📊 Résumé exécutif

### Fonctionnalités demandées

| Fonctionnalité | Priorité | Durée | Complexité |
|----------------|----------|-------|------------|
| 📸 Upload images | ⭐⭐⭐ Haute | 1-2 jours | Moyenne |
| 💾 Historique conversations | ⭐⭐⭐ Haute | 1-2 jours | Moyenne |
| ✏️ Édition messages | ⭐⭐ Moyenne | 1 jour | Faible |
| 📁 Types données multiples | ⭐⭐ Moyenne | 1-2 jours | Moyenne |
| 🎨 Interactions avancées | ⭐ Basse | 2-3 jours | Élevée |

### Impact utilisateur

- **Avant** : Chat basique texte uniquement, pas d'historique
- **Après** : Assistant multimodal avec images, historique persistant, édition

---

## 🏗️ Architecture proposée

### Base de données

```
┌─────────────────────────────────────────────────────────┐
│                    SUPABASE                             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📊 ai_conversations                                    │
│  ├── id (UUID)                                          │
│  ├── user_id (UUID) → auth.users                       │
│  ├── title (TEXT)                                       │
│  ├── context_page (TEXT) - quiz/chapitre/exam          │
│  ├── is_pinned (BOOLEAN)                                │
│  ├── total_messages (INT)                               │
│  └── created_at / updated_at                            │
│                                                         │
│  💬 ai_messages                                         │
│  ├── id (UUID)                                          │
│  ├── conversation_id → ai_conversations                │
│  ├── role (user/assistant/system)                      │
│  ├── content (TEXT)                                     │
│  ├── content_type (text/image/code/latex)              │
│  ├── is_edited / is_deleted                             │
│  └── created_at / updated_at                            │
│                                                         │
│  📎 ai_message_attachments                              │
│  ├── id (UUID)                                          │
│  ├── message_id → ai_messages                          │
│  ├── type (image/pdf/file)                             │
│  ├── file_path (TEXT) → Storage                        │
│  ├── file_name / file_size                             │
│  └── created_at                                         │
│                                                         │
│  💾 STORAGE: ai-chat-attachments                        │
│  └── {user_id}/{conversation_id}/{file}                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Frontend

```
src/
├── components/AICoach/
│   ├── FloatingAICoach.jsx ⭐ Principal
│   ├── ConversationList.jsx (liste gauche)
│   ├── ChatWindow.jsx (zone centrale)
│   ├── MessageList.jsx (messages)
│   ├── MessageItem.jsx (un message)
│   ├── MessageInput.jsx (input enrichi)
│   ├── ImageUploader.jsx (upload)
│   ├── MessageActions.jsx (éditer/copier/suppr)
│   └── ExportMenu.jsx (export PDF/TXT)
│
├── lib/
│   ├── aiConversationService.js (CRUD conversations)
│   ├── aiStorageService.js (upload fichiers)
│   └── contextualAIService.js (déjà existant)
│
└── hooks/
    ├── useAIConversation.js
    └── useImageUpload.js
```

---

## 🎨 Maquettes UI

### Vue desktop complète

```
╔════════════════════════════════════════════════════════════════════╗
║  🤖 Coach IA - Mathématiques                  [_] [□] [X]          ║
╠═══════════════╦════════════════════════════════════════════════════╣
║ 📚 HISTORIQUE ║                    💬 DISCUSSION                   ║
║               ║                                                    ║
║ 🔍 Recherche  ║  🤖 Bonjour ! Je suis ton coach IA.              ║
║ [_________]   ║     Comment puis-je t'aider aujourd'hui ?         ║
║               ║                                                    ║
║ 📌 Épinglées  ║  👤 Explique-moi les équations du 2nd degré       ║
║ • Équations   ║     [📸 image.jpg - 245 KB]                       ║
║ • Trigono...  ║     ┌────────────────────────────────┐            ║
║               ║     │ [Image d'équation manuscrite]  │            ║
║ 📋 Récentes   ║     └────────────────────────────────┘            ║
║ • Quiz Math   ║                                                    ║
║   12 messages ║  🤖 Je vois ton exercice ! Pour résoudre          ║
║   Il y a 2h   ║     ax² + bx + c = 0, il faut utiliser...        ║
║               ║     [✏️ Modifier] [📋 Copier] [🔄 Régénérer]     ║
║ • Aide examen ║                                                    ║
║   8 messages  ║  👤 Merci ! Et le discriminant ?                  ║
║   Il y a 5h   ║                                                    ║
║               ║  🤖 Le discriminant Δ = b² - 4ac permet...        ║
║ • Géométrie   ║                                                    ║
║   15 messages ║                                                    ║
║   Hier        ║                                                    ║
║               ║                                                    ║
║ [+ Nouvelle]  ║  ┌─────────────────────────────────────────────┐ ║
║               ║  │ 📸 🖼️ 📄 📝 | Ta question ici...          │ ║
║               ║  └─────────────────────────────────────────────┘ ║
║               ║                                    [Envoyer] [🎤] ║
╚═══════════════╩════════════════════════════════════════════════════╝
```

### Vue mobile

```
┌────────────────────────────────┐
│ ← 🤖 Coach IA     [⋮] [×]      │
├────────────────────────────────┤
│                                │
│  🤖 Bonjour ! Comment puis-je  │
│     t'aider ?                  │
│                                │
│  👤 Explique les équations     │
│     [📸 photo.jpg]             │
│                                │
│  🤖 Pour résoudre ax² + bx...  │
│                                │
│                                │
│                                │
│                                │
├────────────────────────────────┤
│ 📸 🖼️ 📁  Écris un message...  │
│                      [Envoyer] │
└────────────────────────────────┘
```

---

## ⚡ Flux utilisateur

### Scénario 1 : Upload image + Question

```
1. Utilisateur ouvre Coach IA flottant
   └─> Charge conversation active OU crée nouvelle

2. Clique sur icône 📸
   └─> Ouvre sélecteur fichier / caméra

3. Sélectionne image (exercice math manuscrit)
   └─> Prévisualisation + bouton suppression

4. Tape question : "Comment résoudre cet exercice ?"
   └─> Envoie message + image

5. Backend :
   ├─> Compresse image (1920px max, <1MB)
   ├─> Upload Supabase Storage
   ├─> Sauvegarde message + attachment en BDD
   └─> Envoie à Gemini Vision API

6. Gemini analyse image + texte
   └─> Retourne réponse structurée

7. Sauvegarde réponse en BDD
   └─> Affiche dans chat avec formatage

8. Utilisateur peut :
   ├─> Modifier sa question → Regénère réponse
   ├─> Copier réponse
   ├─> Épingler conversation
   └─> Continuer discussion
```

### Scénario 2 : Reprendre conversation

```
1. Utilisateur ouvre Coach IA
   └─> Voit liste conversations (gauche)

2. Clique sur conversation "Quiz Mathématiques"
   └─> Charge tous les messages

3. Scroll vers haut
   └─> Voit historique complet

4. Continue discussion
   └─> Nouveaux messages ajoutés

5. Conversation auto-sauvegardée
   └─> Accessible depuis n'importe quelle page
```

---

## 🔧 Technologies utilisées

### NPM Packages

| Package | Usage | Taille |
|---------|-------|--------|
| `browser-image-compression` | Compresser images avant upload | 45 KB |
| `uuid` | Générer IDs uniques fichiers | 8 KB |
| `react-markdown` | Rendu Markdown dans réponses IA | 60 KB |
| `react-syntax-highlighter` | Coloration syntaxe code | 120 KB |
| `katex` + `react-katex` | Rendu équations LaTeX | 300 KB |
| `jspdf` | Export conversations PDF | 180 KB |

**Total** : ~710 KB (gzipped: ~200 KB)

### APIs externes

| Service | Fonctionnalité | Coût gratuit |
|---------|----------------|--------------|
| Google Gemini 2.0 Flash | Chat texte | 50 req/jour |
| Google Gemini Vision | Analyse images | 1500 images/jour |
| Supabase Storage | Stockage fichiers | 1 GB gratuit |
| Supabase Database | PostgreSQL | Illimité (plan gratuit) |

---

## 💰 Estimation coûts

### Plan gratuit (suffisant pour début)

- **Gemini API** : 50 conversations/jour + 1500 images/jour = **$0**
- **Supabase Storage** : 1 GB = **$0**
- **Supabase Database** : 500 MB = **$0**

**Total** : **$0/mois** ✅

### Si croissance (100+ utilisateurs/jour)

- **Gemini API** : $0.075 / 1000 requêtes = **~$5/mois**
- **Supabase Storage** : 5 GB = $0.021/GB = **~$0.10/mois**
- **Supabase Database** : Inclus = **$0**

**Total** : **~$5-10/mois** ✅

---

## ⏱️ Planning détaillé

### Phase 1 : Images + Historique (3-4 jours) ⭐ PRIORITAIRE

**Jour 1-2 : Backend**
- [x] Créer tables Supabase (conversations, messages, attachments)
- [x] Configurer RLS policies
- [x] Créer Storage bucket
- [x] Créer services JS (aiConversationService, aiStorageService)
- [x] Tests unitaires services

**Jour 3-4 : Frontend**
- [ ] Composant ConversationList (liste historique)
- [ ] Composant ImageUploader (upload + preview)
- [ ] Intégration Gemini Vision API
- [ ] Sauvegarde auto messages
- [ ] Tests UI

**Livrables** :
- ✅ Upload images fonctionnel
- ✅ Historique persistant
- ✅ Reprise conversations
- ✅ Analyse images par IA

### Phase 2 : Édition + Actions (2-3 jours)

**Jour 5-6 : Actions messages**
- [ ] Menu contextuel (éditer/copier/supprimer)
- [ ] Modal édition message
- [ ] Régénération réponse IA
- [ ] Copie dans presse-papier
- [ ] Confirmation suppression

**Jour 7 : Recherche + Filtres**
- [ ] Barre recherche conversations
- [ ] Filtre par date/page
- [ ] Épingler/désépingler
- [ ] Tri conversations

**Livrables** :
- ✅ Modifier messages
- ✅ Régénérer réponses
- ✅ Recherche conversations
- ✅ Organisation conversations

### Phase 3 : Export + Partage (2 jours)

**Jour 8 : Export**
- [ ] Export PDF avec jsPDF
- [ ] Export Markdown
- [ ] Export TXT simple
- [ ] Download local

**Jour 9 : Partage**
- [ ] Générer lien partageable
- [ ] Page publique conversation
- [ ] Expiration liens (7 jours)
- [ ] Statistiques partage

**Livrables** :
- ✅ Export conversations
- ✅ Partage public
- ✅ Paramètres avancés

### Phase 4 : Polish + Tests (1-2 jours)

**Jour 10-11 : Finitions**
- [ ] Mode sombre
- [ ] Animations fluides
- [ ] Responsive mobile
- [ ] Raccourcis clavier
- [ ] Tests E2E complets

**Livrables** :
- ✅ UX polie
- ✅ Tests passants
- ✅ Documentation utilisateur
- ✅ Prêt production

---

## ✅ Checklist démarrage

### Préparation (30 min)
- [ ] Lire `AMELIORATION_COACH_IA_FLOTTANT_PLAN.md`
- [ ] Lire `DEMARRAGE_RAPIDE_COACH_IA_PHASE1.md`
- [ ] Valider architecture avec équipe

### Base de données (30 min)
- [ ] Ouvrir Supabase SQL Editor
- [ ] Copier/coller script SQL complet
- [ ] Exécuter (créer tables + indexes + RLS)
- [ ] Créer Storage bucket
- [ ] Vérifier tables créées

### Code (2h)
- [ ] Installer NPM packages
- [ ] Créer `aiConversationService.js`
- [ ] Créer `aiStorageService.js`
- [ ] Créer `useAIConversation.js` hook
- [ ] Créer `useImageUpload.js` hook

### Tests (1h)
- [ ] Tester création conversation
- [ ] Tester sauvegarde message
- [ ] Tester upload image
- [ ] Tester chargement historique
- [ ] Vérifier RLS policies

---

## 🎯 Décision requise

### Questions pour vous

1. **Priorité Phase 1** ?
   - ✅ OUI → Commencer immédiatement (images + historique)
   - ❌ NON → Ajuster plan

2. **Budget API** ?
   - ✅ Plan gratuit OK pour tests
   - ⚠️ Prévoir $5-10/mois si croissance

3. **Timeline** ?
   - ⚡ Urgent (1 semaine) → Phase 1 + 2
   - 📅 Normal (2 semaines) → Phase 1 + 2 + 3
   - 🎨 Complet (3 semaines) → Toutes phases

4. **Démarrage** ?
   - 🚀 GO → Je commence par créer les tables SQL
   - ⏸️ ATTENDRE → Ajuster plan avant

---

## 📞 Prochaine action

**Option A : Démarrage immédiat**
```bash
# 1. Je crée le fichier SQL complet
# 2. Vous l'exécutez dans Supabase
# 3. Je crée les services JavaScript
# 4. Tests en 1h
```

**Option B : Review plan**
```
# 1. Questions/modifications sur le plan ?
# 2. Ajustements fonctionnalités ?
# 3. Puis démarrage Phase 1
```

**Que souhaitez-vous faire ?** 🚀
