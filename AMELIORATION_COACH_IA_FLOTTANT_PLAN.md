# 🚀 Plan d'amélioration - Coach IA Flottant

**Date** : 9 octobre 2025  
**Objectif** : Transformer le coach IA en assistant multimodal complet  
**Priorité** : Haute

---

## 🎯 Fonctionnalités demandées

### 1. **Upload d'images** 📸
- Prendre photo avec caméra
- Upload depuis fichiers
- Prévisualisation avant envoi
- Analyse par IA (OCR, résolution problèmes)

### 2. **Historique des conversations** 💾
- Sauvegarde automatique dans Supabase
- Liste des conversations passées
- Recherche dans l'historique
- Reprise de conversations

### 3. **Édition des messages** ✏️
- Modifier messages envoyés
- Supprimer messages
- Copier messages
- Régénérer réponse IA

### 4. **Types de données multiples** 📁
- Texte (déjà fait)
- Images (à faire)
- Fichiers PDF (à faire)
- Code (syntaxe highlighting)
- LaTeX/équations mathématiques

### 5. **Interactions avancées** 🎨
- Mode sombre/clair
- Taille police réglable
- Export conversation (PDF/TXT)
- Partage conversation
- Favoris/épingler messages

---

## 📋 Architecture technique

### Base de données (Supabase)

```sql
-- Table: ai_conversations
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL, -- Titre auto-généré
  context_page TEXT, -- Page d'origine (dashboard, quiz, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_pinned BOOLEAN DEFAULT FALSE,
  total_messages INT DEFAULT 0
);

-- Table: ai_messages
CREATE TABLE ai_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES ai_conversations ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  content_type TEXT DEFAULT 'text', -- text, image, code, latex
  attachments JSONB, -- Images, fichiers
  metadata JSONB, -- Contexte additionnel
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_edited BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Table: ai_message_attachments
CREATE TABLE ai_message_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID REFERENCES ai_messages ON DELETE CASCADE,
  type TEXT NOT NULL, -- image, pdf, file
  file_path TEXT, -- Chemin Supabase Storage
  file_name TEXT,
  file_size INT,
  mime_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes pour performance
CREATE INDEX idx_conversations_user ON ai_conversations(user_id);
CREATE INDEX idx_messages_conversation ON ai_messages(conversation_id);
CREATE INDEX idx_messages_created ON ai_messages(created_at DESC);
```

### Supabase Storage

```
Buckets:
- ai-chat-attachments
  ├── images/
  │   └── {user_id}/{conversation_id}/{message_id}.jpg
  ├── documents/
  │   └── {user_id}/{conversation_id}/{message_id}.pdf
  └── exports/
      └── {user_id}/conversation-{date}.pdf
```

---

## 🎨 Composants React

### Structure des fichiers

```
src/
├── components/
│   ├── AICoach/
│   │   ├── FloatingAICoach.jsx (principal)
│   │   ├── ChatWindow.jsx (fenêtre chat)
│   │   ├── MessageList.jsx (liste messages)
│   │   ├── MessageItem.jsx (un message)
│   │   ├── MessageInput.jsx (input enrichi)
│   │   ├── ImageUploader.jsx (upload images)
│   │   ├── FileUploader.jsx (upload fichiers)
│   │   ├── ConversationHistory.jsx (historique)
│   │   ├── ConversationList.jsx (liste conversations)
│   │   ├── MessageActions.jsx (éditer/supprimer/copier)
│   │   ├── ExportMenu.jsx (export PDF/TXT)
│   │   └── SettingsPanel.jsx (paramètres)
│   └── ...
├── lib/
│   ├── contextualAIService.js (existant)
│   ├── aiConversationService.js (nouveau)
│   ├── aiStorageService.js (nouveau)
│   └── aiExportService.js (nouveau)
└── hooks/
    ├── useAIConversation.js (nouveau)
    ├── useImageUpload.js (nouveau)
    └── useMessageActions.js (nouveau)
```

---

## 🔧 Fonctionnalités détaillées

### 1. Upload d'images 📸

#### Interface utilisateur

```jsx
// Bouton caméra dans MessageInput
<div className="flex gap-2">
  <button onClick={openCamera}>
    <Camera className="w-5 h-5" />
  </button>
  <button onClick={openFileUpload}>
    <Image className="w-5 h-5" />
  </button>
  <input
    type="file"
    accept="image/*"
    capture="environment" // Caméra arrière mobile
    ref={cameraInputRef}
  />
</div>

// Prévisualisation
{selectedImages.map((img, i) => (
  <div key={i} className="relative">
    <img src={img.preview} className="w-20 h-20 rounded" />
    <button onClick={() => removeImage(i)}>
      <X className="w-4 h-4" />
    </button>
  </div>
))}
```

#### Traitement backend

```javascript
// aiStorageService.js
async uploadImage(file, conversationId, messageId) {
  const path = `images/${userId}/${conversationId}/${messageId}_${Date.now()}.jpg`;
  
  // Compresser image
  const compressed = await compressImage(file, {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.8
  });
  
  // Upload vers Supabase Storage
  const { data, error } = await supabase.storage
    .from('ai-chat-attachments')
    .upload(path, compressed);
  
  return data.path;
}

// Envoyer à Gemini Vision
async analyzeImage(imageUrl, question) {
  const model = this.genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash-exp' // Supporte vision
  });
  
  const imagePart = {
    inlineData: {
      data: await fileToBase64(imageUrl),
      mimeType: 'image/jpeg'
    }
  };
  
  const result = await model.generateContent([
    question,
    imagePart
  ]);
  
  return result.response.text();
}
```

### 2. Historique des conversations 💾

#### Interface - Liste conversations

```jsx
// ConversationList.jsx
<div className="h-full overflow-y-auto">
  {conversations.map(conv => (
    <div
      key={conv.id}
      onClick={() => loadConversation(conv.id)}
      className="p-3 hover:bg-gray-100 cursor-pointer border-b"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-sm">{conv.title}</h4>
          <p className="text-xs text-gray-500">
            {conv.total_messages} messages • {formatDate(conv.updated_at)}
          </p>
        </div>
        <div className="flex gap-1">
          <button onClick={() => pinConversation(conv.id)}>
            <Pin className={conv.is_pinned ? 'text-blue-600' : ''} />
          </button>
          <button onClick={() => deleteConversation(conv.id)}>
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </div>
    </div>
  ))}
</div>
```

#### Service - Gestion conversations

```javascript
// aiConversationService.js
class AIConversationService {
  async createConversation(userId, contextPage) {
    const { data, error } = await supabase
      .from('ai_conversations')
      .insert({
        user_id: userId,
        title: 'Nouvelle conversation',
        context_page: contextPage
      })
      .select()
      .single();
    
    return data;
  }
  
  async saveMessage(conversationId, role, content, attachments = []) {
    const { data, error } = await supabase
      .from('ai_messages')
      .insert({
        conversation_id: conversationId,
        role,
        content,
        attachments: attachments.length > 0 ? attachments : null
      })
      .select()
      .single();
    
    // Mettre à jour titre si premier message
    if (role === 'user') {
      await this.updateConversationTitle(conversationId, content);
    }
    
    return data;
  }
  
  async updateConversationTitle(conversationId, firstMessage) {
    // Générer titre intelligent (premiers mots)
    const title = firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : '');
    
    await supabase
      .from('ai_conversations')
      .update({ 
        title,
        total_messages: supabase.sql`total_messages + 1`,
        updated_at: new Date()
      })
      .eq('id', conversationId);
  }
  
  async loadConversation(conversationId) {
    const { data: messages } = await supabase
      .from('ai_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true });
    
    return messages;
  }
  
  async searchConversations(userId, query) {
    const { data } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('user_id', userId)
      .ilike('title', `%${query}%`)
      .order('updated_at', { ascending: false });
    
    return data;
  }
}
```

### 3. Édition des messages ✏️

#### Interface - Actions sur message

```jsx
// MessageActions.jsx
<div className="opacity-0 group-hover:opacity-100 transition-opacity">
  <Menu>
    <MenuButton>
      <MoreVertical className="w-4 h-4" />
    </MenuButton>
    <MenuItems>
      <MenuItem onClick={handleEdit}>
        <Edit2 className="w-4 h-4" />
        Modifier
      </MenuItem>
      <MenuItem onClick={handleCopy}>
        <Copy className="w-4 h-4" />
        Copier
      </MenuItem>
      <MenuItem onClick={handleRegenerate}>
        <RefreshCw className="w-4 h-4" />
        Régénérer
      </MenuItem>
      <MenuItem onClick={handleDelete} className="text-red-600">
        <Trash2 className="w-4 h-4" />
        Supprimer
      </MenuItem>
    </MenuItems>
  </Menu>
</div>

// Mode édition
{isEditing ? (
  <div className="flex gap-2 items-end">
    <textarea
      value={editedContent}
      onChange={e => setEditedContent(e.target.value)}
      className="flex-1 p-2 border rounded"
    />
    <button onClick={saveEdit}>
      <Check className="w-5 h-5 text-green-600" />
    </button>
    <button onClick={cancelEdit}>
      <X className="w-5 h-5 text-red-600" />
    </button>
  </div>
) : (
  <div className="prose">{message.content}</div>
)}
```

#### Service - Édition

```javascript
async editMessage(messageId, newContent) {
  const { data, error } = await supabase
    .from('ai_messages')
    .update({
      content: newContent,
      is_edited: true,
      updated_at: new Date()
    })
    .eq('id', messageId)
    .select()
    .single();
  
  return data;
}

async deleteMessage(messageId) {
  // Soft delete
  await supabase
    .from('ai_messages')
    .update({ is_deleted: true })
    .eq('id', messageId);
}

async regenerateResponse(messageId) {
  // Récupérer message original
  const { data: originalMessage } = await supabase
    .from('ai_messages')
    .select('content, conversation_id')
    .eq('id', messageId)
    .single();
  
  // Supprimer ancienne réponse
  const { data: messages } = await supabase
    .from('ai_messages')
    .select('id')
    .eq('conversation_id', originalMessage.conversation_id)
    .gt('created_at', originalMessage.created_at)
    .eq('role', 'assistant')
    .limit(1);
  
  if (messages.length > 0) {
    await this.deleteMessage(messages[0].id);
  }
  
  // Régénérer réponse
  return await this.generateResponse(originalMessage.content, originalMessage.conversation_id);
}
```

### 4. Types de données multiples 📁

#### Rendu messages enrichis

```jsx
// MessageItem.jsx
const renderContent = (message) => {
  switch (message.content_type) {
    case 'text':
      return <ReactMarkdown>{message.content}</ReactMarkdown>;
    
    case 'image':
      return (
        <div>
          <img src={message.attachments[0].url} className="max-w-md rounded" />
          <p className="mt-2 text-sm">{message.content}</p>
        </div>
      );
    
    case 'code':
      return (
        <SyntaxHighlighter language={message.metadata?.language || 'javascript'}>
          {message.content}
        </SyntaxHighlighter>
      );
    
    case 'latex':
      return (
        <div>
          <BlockMath math={message.content} />
        </div>
      );
    
    case 'pdf':
      return (
        <div className="flex items-center gap-2 p-3 bg-gray-100 rounded">
          <FileText className="w-8 h-8" />
          <div>
            <p className="font-semibold">{message.attachments[0].file_name}</p>
            <p className="text-xs text-gray-500">
              {formatFileSize(message.attachments[0].file_size)}
            </p>
          </div>
          <button onClick={() => downloadFile(message.attachments[0].url)}>
            <Download className="w-5 h-5" />
          </button>
        </div>
      );
    
    default:
      return <p>{message.content}</p>;
  }
};
```

### 5. Export et partage 📤

#### Service export

```javascript
// aiExportService.js
class AIExportService {
  async exportToPDF(conversationId) {
    const messages = await aiConversationService.loadConversation(conversationId);
    
    // Utiliser jsPDF
    const doc = new jsPDF();
    let yPos = 20;
    
    doc.setFontSize(18);
    doc.text('Conversation avec Coach IA', 20, yPos);
    yPos += 15;
    
    messages.forEach(msg => {
      doc.setFontSize(12);
      doc.setTextColor(msg.role === 'user' ? '#2563EB' : '#059669');
      doc.text(msg.role === 'user' ? 'Vous' : 'Coach IA', 20, yPos);
      yPos += 7;
      
      doc.setFontSize(10);
      doc.setTextColor('#000000');
      const lines = doc.splitTextToSize(msg.content, 170);
      doc.text(lines, 20, yPos);
      yPos += lines.length * 5 + 10;
      
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
    });
    
    doc.save(`conversation-${Date.now()}.pdf`);
  }
  
  async exportToMarkdown(conversationId) {
    const messages = await aiConversationService.loadConversation(conversationId);
    
    let markdown = `# Conversation avec Coach IA\n\n`;
    markdown += `Date: ${new Date().toLocaleDateString('fr-FR')}\n\n---\n\n`;
    
    messages.forEach(msg => {
      markdown += `**${msg.role === 'user' ? 'Vous' : 'Coach IA'}**: ${msg.content}\n\n`;
    });
    
    return markdown;
  }
  
  async shareConversation(conversationId) {
    // Générer lien partageable
    const shareToken = uuidv4();
    
    await supabase
      .from('ai_conversation_shares')
      .insert({
        conversation_id: conversationId,
        share_token: shareToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours
      });
    
    return `${window.location.origin}/shared-conversation/${shareToken}`;
  }
}
```

---

## 🎨 Interface utilisateur complète

### Vue principale

```
╔═══════════════════════════════════════════════════════════╗
║  Coach IA - Mathématiques                    [_] [□] [X]  ║
╠═══════════════════════════════════════════════════════════╣
║  ┌─────────────────┐ ┌────────────────────────────────┐  ║
║  │ 📝 Conversations│ │  💬 Discussion active          │  ║
║  ├─────────────────┤ ├────────────────────────────────┤  ║
║  │ 📌 Épinglées    │ │  🤖 Coach: Bonjour ! Comment   │  ║
║  │ • Équations     │ │     puis-je t'aider ?          │  ║
║  │ • Géométrie     │ │                                │  ║
║  │                 │ │  👤 Vous: Explique les         │  ║
║  │ 📋 Récentes     │ │     équations 2nd degré        │  ║
║  │ • Quiz Math     │ │     [📸 image.jpg]             │  ║
║  │ • Aide examen   │ │                                │  ║
║  │ • Cours chapitre│ │  🤖 Coach: Voici l'explication │  ║
║  │                 │ │     ax² + bx + c = 0           │  ║
║  │ 🔍 [Recherche]  │ │     ...                        │  ║
║  │                 │ │     [✏️] [📋] [🔄] [🗑️]       │  ║
║  │                 │ │                                │  ║
║  │ [+ Nouvelle]    │ ├────────────────────────────────┤  ║
║  └─────────────────┘ │  📎 [📸] [📁] [💾] [⚙️]       │  ║
║                      │  ┌──────────────────────────┐  │  ║
║                      │  │ Pose ta question...      │  ║
║                      │  └──────────────────────────┘  │  ║
║                      │           [Envoyer] [🎤]       │  ║
║                      └────────────────────────────────┘  ║
╚═══════════════════════════════════════════════════════════╝
```

---

## 📱 Responsive mobile

```jsx
// Version mobile adaptée
const isMobile = window.innerWidth < 768;

{isMobile ? (
  // Plein écran sur mobile
  <div className="fixed inset-0 bg-white z-50">
    <ChatWindow />
  </div>
) : (
  // Fenêtre flottante sur desktop
  <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-lg shadow-2xl">
    <ChatWindow />
  </div>
)}
```

---

## 🔐 Sécurité et permissions

### RLS Policies (Supabase)

```sql
-- Conversations: Utilisateur voit uniquement ses conversations
CREATE POLICY "Users can view own conversations"
ON ai_conversations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations"
ON ai_conversations FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Messages: Accès via conversation
CREATE POLICY "Users can view messages of own conversations"
ON ai_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM ai_conversations
    WHERE id = ai_messages.conversation_id
    AND user_id = auth.uid()
  )
);

-- Attachments: Sécurité Storage
CREATE POLICY "Users can upload to own folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'ai-chat-attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

---

## 📊 Métriques et analytics

```javascript
// Tracker utilisation
const trackAIUsage = async (action, metadata) => {
  await supabase.from('ai_usage_analytics').insert({
    user_id: userId,
    action, // message_sent, image_uploaded, conversation_created
    metadata,
    created_at: new Date()
  });
};

// Exemples métriques
- Nombre messages/jour
- Conversations actives
- Images uploadées
- Temps réponse moyen
- Taux satisfaction (👍/👎)
```

---

## 🚀 Plan de déploiement

### Phase 1 (3-4 jours) ✅ Prioritaire
1. ✅ Upload images + preview
2. ✅ Analyse images par Gemini Vision
3. ✅ Sauvegarde historique Supabase
4. ✅ Liste conversations
5. ✅ Reprise conversation

### Phase 2 (2-3 jours)
6. ✅ Édition messages
7. ✅ Suppression messages
8. ✅ Régénération réponse
9. ✅ Copier message
10. ✅ Recherche conversations

### Phase 3 (2 jours)
11. ✅ Export PDF
12. ✅ Export Markdown
13. ✅ Partage conversation
14. ✅ Mode sombre
15. ✅ Paramètres personnalisation

### Phase 4 (1-2 jours)
16. ✅ Upload PDF
17. ✅ Syntax highlighting code
18. ✅ Rendu LaTeX
19. ✅ Reconnaissance vocale
20. ✅ Tests complets

---

## 💰 Coûts estimés

### API Gemini
- **Images** : ~$0.0025 par image (1500 images gratuites/jour)
- **Texte** : Gratuit (50 req/jour avec cache)
- **Total** : ~$0-5/mois (usage normal)

### Supabase Storage
- **Gratuit** : 1 GB
- **Au-delà** : $0.021/GB/mois
- **Estimation** : $0-2/mois

### Total mensuel : **$0-7/mois** 🎉

---

## ✅ Checklist implémentation

### Base de données
- [ ] Créer tables (conversations, messages, attachments)
- [ ] Créer indexes
- [ ] Configurer RLS policies
- [ ] Créer Storage bucket

### Services
- [ ] aiConversationService.js
- [ ] aiStorageService.js
- [ ] aiExportService.js
- [ ] imageCompressionService.js

### Composants
- [ ] ImageUploader.jsx
- [ ] ConversationHistory.jsx
- [ ] MessageActions.jsx
- [ ] ExportMenu.jsx
- [ ] SettingsPanel.jsx

### Hooks
- [ ] useAIConversation.js
- [ ] useImageUpload.js
- [ ] useMessageActions.js

### Tests
- [ ] Upload image
- [ ] Sauvegarde message
- [ ] Édition message
- [ ] Export conversation
- [ ] Recherche

---

## 📚 Dépendances NPM

```json
{
  "dependencies": {
    "react-markdown": "^9.0.0",
    "react-syntax-highlighter": "^15.5.0",
    "katex": "^0.16.9",
    "react-katex": "^3.0.1",
    "jspdf": "^2.5.1",
    "browser-image-compression": "^2.0.2",
    "uuid": "^9.0.1"
  }
}
```

---

Voulez-vous que je commence l'implémentation ? Par quelle fonctionnalité souhaitez-vous commencer ? 🚀

**Recommandation** : Commencer par la Phase 1 (upload images + historique) qui apporte le plus de valeur immédiate.
