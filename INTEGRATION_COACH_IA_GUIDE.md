/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * GUIDE D'INTÉGRATION - COACH IA PHASE 1
 * Description: Instructions pour intégrer les nouveaux composants
 * Date: 9 octobre 2025
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

## ✅ COMPOSANTS CRÉÉS (4/4)

1. ✅ **ImageUploader.jsx** (270 lignes)
   - Upload multi-images avec preview
   - Drag & drop + camera mobile
   - Validation + compression automatique

2. ✅ **ConversationList.jsx** (350 lignes)
   - Sidebar historique conversations
   - Search, pin, edit, delete
   - Grouped display (pinned / recent)

3. ✅ **MessageItem.jsx** (280 lignes)
   - Affichage message avec images
   - Edit/delete/copy/regenerate
   - Lightbox intégré

4. ✅ **ImagePreview.jsx** (320 lignes)
   - Modal full-screen avec zoom
   - Navigation clavier
   - Rotation + téléchargement

## 🔧 INTÉGRATION DANS AIAssistantSidebar.jsx

### ÉTAPE 1: Imports (Ligne 1-35)

Ajouter après les imports existants :

```javascript
// 🎯 NOUVEAUX COMPOSANTS COACH IA
import useAIConversation from '@/hooks/useAIConversation';
import ImageUploader from '@/components/ImageUploader';
import ConversationList from '@/components/ConversationList';
import MessageItem from '@/components/MessageItem';
import ImagePreview from '@/components/ImagePreview';

// Ajouter History et ImageIcon dans les imports lucide-react
import {
  Brain,
  X,
  Send,
  // ... autres imports existants
  History,        // ← NOUVEAU
  Image as ImageIcon  // ← NOUVEAU
} from 'lucide-react';
```

### ÉTAPE 2: États (Ligne ~32-45)

REMPLACER les anciens états par :

```javascript
const AIAssistantSidebar = () => {
  const { user, userProfile } = useAuth();
  const location = useLocation();
  const { toast } = useToast();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // 🎯 HOOK CONVERSATION IA (remplace l'ancien état messages)
  const {
    conversations,
    currentConversation,
    messages,
    loading,
    error,
    createConversation,
    loadConversation,
    deleteConversation,
    togglePin,
    renameConversation,
    searchConversations,
    sendMessage,
    sendMessageWithImage,
    editMessage,
    deleteMessage
  } = useAIConversation(user?.id);

  // États UI
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showHistory, setShowHistory] = useState(false); // ← NOUVEAU
  const [inputValue, setInputValue] = useState('');
  const [selectedImages, setSelectedImages] = useState([]); // ← NOUVEAU
  const [isLoadingAI, setIsLoadingAI] = useState(false); // ← Renommé de isLoading
  const [currentContext, setCurrentContext] = useState({});

  console.log('🤖 [AIAssistantSidebar] Composant monté', { 
    user: !!user, 
    userProfile: !!userProfile,
    conversations: conversations.length,
    currentConversation: currentConversation?.id
  });
```

### ÉTAPE 3: Fonction handleSendMessage (Ligne ~305-370)

REMPLACER la fonction handleSendMessage par :

```javascript
const handleSendMessage = async () => {
  console.log('💬 [handleSendMessage] Envoi message...', { 
    inputValue, 
    isLoadingAI,
    hasImages: selectedImages.length > 0,
    currentConversation: currentConversation?.id
  });
  
  if (!inputValue.trim() || isLoadingAI) return;

  const userMessage = inputValue.trim();
  setInputValue('');
  setIsLoadingAI(true);

  try {
    // Créer une nouvelle conversation si nécessaire
    if (!currentConversation) {
      console.log('🆕 [handleSendMessage] Création nouvelle conversation');
      const contextPage = currentContext.page || location.pathname;
      const contextData = {
        section: currentContext.section,
        userContext: await fetchUserRealData()
      };
      
      await createConversation(contextPage, contextData);
    }

    // Envoyer le message avec ou sans images
    if (selectedImages.length > 0) {
      console.log('📸 [handleSendMessage] Envoi avec', selectedImages.length, 'images');
      await sendMessageWithImage(userMessage, selectedImages[0]);
      setSelectedImages([]);
    } else {
      console.log('💬 [handleSendMessage] Envoi texte simple');
      await sendMessage(userMessage);
    }

    toast({
      title: '✅ Message envoyé',
      description: selectedImages.length > 0 ? 'Image incluse' : 'Texte envoyé',
    });

  } catch (error) {
    console.error('❌ Erreur message IA:', error);
    
    toast({
      variant: 'destructive',
      title: 'Erreur',
      description: 'Impossible d\'envoyer le message'
    });
  } finally {
    setIsLoadingAI(false);
  }
};
```

### ÉTAPE 4: Header Panel (Ligne ~470-500)

MODIFIER le header pour ajouter le bouton historique :

```javascript
{/* En-tête */}
<div className="bg-gradient-to-r from-primary via-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
      <Brain className="w-6 h-6" />
    </div>
    <div>
      <h3 className="font-bold text-lg">Assistant IA</h3>
      <p className="text-xs text-blue-100">
        {currentContext.page} • {messages.length} messages
      </p>
    </div>
  </div>

  <div className="flex items-center gap-2">
    {/* NOUVEAU: Toggle historique conversations */}
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setShowHistory(!showHistory)}
      className="text-white hover:bg-white/20"
      title="Historique conversations"
    >
      <History className="w-4 h-4" />
    </Button>
    
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setIsExpanded(!isExpanded)}
      className="text-white hover:bg-white/20"
    >
      {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
    </Button>
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setIsOpen(false)}
      className="text-white hover:bg-white/20"
    >
      <X className="w-4 h-4" />
    </Button>
  </div>
</div>
```

### ÉTAPE 5: Zone Messages (Ligne ~510-700)

ENVELOPPER le contenu dans un layout avec sidebar :

```javascript
{/* Layout avec sidebar historique optionnel */}
<div className="flex-1 flex overflow-hidden">
  {/* Sidebar historique conversations */}
  {showHistory && (
    <div className="w-80 border-r border-slate-200 bg-white">
      <ConversationList
        conversations={conversations}
        currentConversationId={currentConversation?.id}
        onSelectConversation={loadConversation}
        onCreateConversation={async () => {
          const contextPage = currentContext.page || location.pathname;
          await createConversation(contextPage, {
            section: currentContext.section,
            userContext: await fetchUserRealData()
          });
        }}
        onPinConversation={togglePin}
        onRenameConversation={renameConversation}
        onDeleteConversation={deleteConversation}
        loading={loading.conversations}
      />
    </div>
  )}

  {/* Zone principale messages */}
  <div className="flex-1 flex flex-col">
    {/* Messages */}
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
      {/* Message de bienvenue - GARDER TEL QUEL */}
      {messages.length === 0 && (
        {/* ... code existant du message bienvenue ... */}
      )}

      {/* NOUVEAU: Historique messages avec MessageItem */}
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          onEdit={editMessage}
          onDelete={deleteMessage}
          canEdit={message.role === 'user'}
          canDelete={true}
        />
      ))}

      {/* Indicateur chargement - MODIFIER isLoading → isLoadingAI */}
      {isLoadingAI && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-start gap-3"
        >
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0">
            <Bot className="w-4 h-4" />
          </div>
          <div className="bg-white rounded-2xl rounded-bl-none p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse delay-150"></span>
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse delay-300"></span>
            </div>
          </div>
        </motion.div>
      )}

      <div ref={messagesEndRef} />
    </div>

    {/* NOUVEAU: Input avec upload image */}
    <div className="p-4 bg-white border-t border-slate-200 space-y-3">
      {/* Uploader images */}
      {(selectedImages.length > 0 || inputValue.trim()) && (
        <ImageUploader
          onImagesSelected={setSelectedImages}
          maxImages={1}
          disabled={isLoadingAI}
        />
      )}

      {/* Zone input texte */}
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Posez votre question..."
            disabled={isLoadingAI}
            rows={2}
            className="w-full px-4 py-2 pr-10 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none disabled:bg-slate-100 disabled:cursor-not-allowed"
          />
          <div className="absolute bottom-2 right-2 text-xs text-slate-400">
            {inputValue.length}/500
          </div>
        </div>
        <Button
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || isLoadingAI}
          className="h-10 px-4"
        >
          {isLoadingAI ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>

      <p className="text-xs text-slate-500 text-center flex items-center justify-center gap-2">
        💡 <kbd className="px-1 bg-slate-100 rounded">Entrée</kbd> pour envoyer
        {selectedImages.length > 0 && (
          <span className="flex items-center gap-1 text-blue-600">
            <ImageIcon className="w-3 h-3" />
            {selectedImages.length} image(s)
          </span>
        )}
      </p>
    </div>
  </div>
</div>
```

### ÉTAPE 6: Fermeture du Panel (Ligne ~750-770)

Fermer correctement le composant :

```javascript
            </motion.div>  {/* Fin Panel */}
          </>
        )}
      </AnimatePresence>
    </>
  );
};
```

## 🎯 MODIFICATIONS GLOBALES

### Rechercher/Remplacer dans tout le fichier :

1. **`isLoading`** → **`isLoadingAI`** (éviter conflit avec hook)
2. **`{messages.map((message, index) =>`** → **`{messages.map((message) =>`** (MessageItem gère l'animation)
3. **Supprimer** le `handleClearHistory` de l'ancien header (optionnel)
4. **Supprimer** l'ancien affichage de messages (lignes avec `motion.div` + `max-w-[85%]`)

## ✅ VÉRIFICATIONS POST-INTÉGRATION

1. Imports tous présents ✓
2. Hook useAIConversation initialisé ✓
3. États showHistory et selectedImages définis ✓
4. MessageItem remplace l'ancien rendu ✓
5. ImageUploader visible dans input ✓
6. ConversationList toggle avec History button ✓
7. isLoadingAI au lieu de isLoading ✓

## 🚀 PROCHAINES ÉTAPES

Après intégration :

1. **Tester en dev** : `npm run dev`
2. **Vérifier console** : Pas d'erreurs import
3. **Tester flows** :
   - Créer conversation
   - Envoyer message texte
   - Upload image
   - Toggle historique
   - Edit message
   - Delete message
   - Pin conversation

4. **Intégrer Gemini Vision** (Phase 1B)
5. **Tests end-to-end** (Phase 1C)

## 📝 NOTES

- Les anciens messages (ancien système) ne seront PAS migrés automatiquement
- Une nouvelle conversation sera créée au premier message
- L'historique dans `ai_conversations` existant est préservé (migrations non destructives)
- Images stockées dans `ai-chat-attachments` bucket privé

## 🐛 TROUBLESHOOTING

**Erreur import** : Vérifier chemins relatifs `@/components/` et `@/hooks/`
**Hook error** : Vérifier `user?.id` défini avant appel hook
**Storage error** : Vérifier bucket créé avec `create_storage_bucket.sql`
**Messages vides** : Normal, nouvelle conversation démarre vide

---

**Fichier créé le** : 9 octobre 2025
**Phase** : 1 - Frontend Integration
**Status** : Documentation complète ✅
