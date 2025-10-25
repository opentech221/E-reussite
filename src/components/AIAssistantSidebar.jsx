import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  X,
  Send,
  Maximize2,
  Minimize2,
  Trash2,
  Sparkles,
  MessageCircle,
  Loader2,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Calculator,
  PenTool,
  BookOpen,
  Star,
  Bot,
  User,
  History,
  Image as ImageIcon,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useLocation } from 'react-router-dom';
import { getContextualAI } from '@/lib/contextualAIService';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

// 🎯 NOUVEAUX COMPOSANTS COACH IA
import useAIConversation from '@/hooks/useAIConversation';
import aiConversationService from '@/lib/aiConversationService';
import ImageUploader from '@/components/ImageUploader';
import ConversationList from '@/components/ConversationList';
import MessageItem from '@/components/MessageItem';
import ImagePreview from '@/components/ImagePreview';

// 🎯 MULTI-PROVIDER IA (Gemini + Claude)
import { useMultiProviderAI } from '@/hooks/useMultiProviderAI';
import AIProviderSelectorCompact from '@/components/AIProviderSelectorCompact';

// 🎯 PERPLEXITY - Mode recherche avancée
import PerplexitySearchMode from '@/components/PerplexitySearchMode';

// 🔥 SERVICE DE DONNÉES EN TEMPS RÉEL
import realtimeDataService from '@/lib/realtimeDataService';

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
    loadConversations,
    createConversation,
    loadConversation,
    deleteConversation,
    togglePinConversation,
    searchConversations,
    sendMessage,
    sendMessageWithImages,
    editMessage,
    deleteMessage
  } = useAIConversation(null, 'dashboard', { page: 'dashboard' }); // null = pas de conversation spécifique au démarrage

  // 🎯 MULTI-PROVIDER IA (Gemini + Claude)
  const {
    currentProvider,
    generateResponse,
    analyzeImage,
    switchProvider,
    getProviderInfo
  } = useMultiProviderAI();

  // États UI
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [currentContext, setCurrentContext] = useState({});
  
  // 🎯 NOUVEAU: Mode Perplexity activé/désactivé
  const [perplexityMode, setPerplexityMode] = useState(false);

  // TODO: Implémenter renameConversation dans le hook
  const renameConversation = async (conversationId, newTitle) => {
    console.warn('renameConversation non implémenté dans le hook');
    // Appel temporaire direct au service
    try {
      await aiConversationService.renameConversation(conversationId, newTitle);
      // Recharger les conversations
      loadConversations();
    } catch (err) {
      console.error('Erreur rename:', err);
    }
  };

  console.log('🤖 [AIAssistantSidebar] Composant monté', { 
    user: !!user, 
    userProfile: !!userProfile,
    conversations: conversations?.length || 0,
    currentConversation: currentConversation?.id
  });

  // Scroll auto vers le bas
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mise à jour du contexte selon la page
  useEffect(() => {
    if (user && location) {
      updateContext();
    }
  }, [location.pathname, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  /**
   * Récupère les données réelles de l'utilisateur depuis Supabase
   */
  /**
   * � Récupère TOUTES les données utilisateur en temps réel
   * Utilise le nouveau service centralisé realtimeDataService
   */
  const fetchUserRealData = async () => {
    console.log('📊 [fetchUserRealData] Récupération données complètes via realtimeDataService', { userId: user?.id });
    
    if (!user) {
      console.warn('⚠️ [fetchUserRealData] Pas d\'utilisateur connecté');
      return {};
    }

    try {
      // Récupérer TOUTES les données via le service centralisé
      const completeData = await realtimeDataService.getUserCompleteData(user.id);
      
      // Générer le résumé contextuel pour le prompt IA
      const contextSummary = realtimeDataService.generateContextSummary(completeData);
      
      console.log('✅ [fetchUserRealData] Données complètes récupérées:', {
        badges: completeData.gamification.totalBadges,
        chapters: completeData.progress.completedChapters,
        orientation: completeData.orientation.hasCompletedTest,
        studyPlan: completeData.studyPlan.totalTasks,
        subscription: completeData.subscription.status
      });

      // Retourner au format compatible avec l'ancien code
      return {
        // Format ancien (pour compatibilité)
        userName: completeData.profile.full_name || user.email?.split('@')[0] || 'Étudiant',
        level: completeData.gamification.level,
        totalPoints: completeData.gamification.points,
        currentStreak: completeData.gamification.currentStreak,
        maxStreak: completeData.gamification.longestStreak,
        completionRate: completeData.progress.completionRate,
        totalBadges: completeData.gamification.totalBadges,
        rank: completeData.profile.rank,
        matieres: Object.keys(completeData.progress.bySubject),
        weakSubjects: completeData.analytics.weakSubjects,
        strongSubjects: completeData.analytics.strongSubjects,
        lastActivity: completeData.gamification.lastActivityDate || 'Aujourd\'hui',
        recentBadges: completeData.gamification.badges.slice(0, 3).map(b => b.badge_name),
        badgesDetails: completeData.gamification.badges,
        completedChapters: completeData.progress.completedChapters,
        completedChaptersDetails: [], // Pas besoin de détails ici
        totalQuizzes: 0,
        averageScore: 0,
        
        // 🔥 NOUVELLES DONNÉES COMPLÈTES
        completeData, // Toutes les données structurées
        contextSummary // Résumé formaté pour le prompt IA
      };
    } catch (error) {
      console.error('❌ [fetchUserRealData] Erreur récupération données:', error);
      return {
        userName: userProfile?.full_name || 'Étudiant',
        level: userProfile?.level || 1,
        totalPoints: userProfile?.points || 0,
        currentStreak: userProfile?.current_streak || 0
      };
    }
  };

  const updateContext = () => {
    console.log('📍 [updateContext] Changement de page:', location.pathname);
    const path = location.pathname;
    let page = 'unknown';
    let section = 'general';

    // Déterminer la page/section
    if (path.includes('/dashboard')) {
      page = 'Dashboard';
      section = 'overview';
    } else if (path.includes('/historique')) {
      page = 'Historique';
      section = 'activity-history';
    } else if (path.includes('/my-courses')) {
      page = 'Cours';
      section = 'course-list';
    } else if (path.includes('/course/')) {
      page = 'Cours';
      section = 'chapter-detail';
    } else if (path.includes('/quiz')) {
      page = 'Quiz';
      section = 'quiz-taking';
    } else if (path.includes('/exam')) {
      page = 'Examens';
      section = 'exam-taking';
    } else if (path.includes('/progress')) {
      page = 'Progression';
      section = 'stats-view';
    } else if (path.includes('/study-plan')) {
      page = 'Plan d\'Étude';
      section = 'planning';
    } else if (path.includes('/challenges')) {
      page = 'Défis';
      section = 'challenge-list';
    } else if (path.includes('/badges')) {
      page = 'Badges';
      section = 'badge-collection';
    } else if (path.includes('/leaderboard')) {
      page = 'Classement';
      section = 'ranking';
    } else if (path.includes('/analytics')) {
      page = 'Analytiques';
      section = 'analytics-view';
    } else if (path.includes('/coach-ia')) {
      page = 'Coach IA';
      section = 'ai-assistant';
    } else if (path.includes('/chatbot')) {
      page = 'Chatbot';
      section = 'chatbot';
    } else if (path.includes('/quiz-review')) {
      page = 'Quiz - Révision';
      section = 'quiz-review';
    } else if (path.includes('/orientation')) {
      page = 'Orientation Professionnelle';
      section = 'career-guidance';
    } else if (path.includes('/settings')) {
      page = 'Paramètres';
      section = 'user-settings';
    } else if (path.includes('/my-shared-links')) {
      page = 'Mes Liens Partagés';
      section = 'shared-links';
    } else if (path.includes('/social')) {
      page = 'Réseau Social';
      section = 'social-feed';
    } else if (path.includes('/payment')) {
      page = 'Paiement';
      section = 'subscription';
    } else if (path.includes('/test-debug')) {
      page = 'Test Debug';
      section = 'debug';
    } else if (path.includes('/profile')) {
      page = 'Profil';
      section = 'settings';
    }

    console.log('✅ [updateContext] Contexte mis à jour:', { page, section });
    setCurrentContext({ page, section });
  };

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
      // Debug : État initial
      console.log('🔍 [handleSendMessage] État initial:', {
        currentConversation: currentConversation?.id,
        conversationsCount: conversations?.length,
        user: !!user
      });

      // Créer une nouvelle conversation si nécessaire
      let activeConvId = currentConversation?.id;
      console.log('🔍 [handleSendMessage] activeConvId initial:', activeConvId);
      
      // 🎯 RÉCUPÉRER LE CONTEXTE UTILISATEUR EN PREMIER
      console.log('📊 [handleSendMessage] Récupération contexte utilisateur...');
      const userContext = await fetchUserRealData();
      console.log('✅ [handleSendMessage] Contexte utilisateur récupéré:', {
        userName: userContext.userName,
        level: userContext.level,
        totalPoints: userContext.totalPoints,
        completedChapters: userContext.completedChapters
      });
      
      // Contexte de la page actuelle
      const pageContext = {
        page: currentContext.page || location.pathname,
        section: currentContext.section
      };
      
      if (!activeConvId) {
        console.log('🆕 [handleSendMessage] Création nouvelle conversation');
        const contextPage = pageContext.page;
        const contextData = {
          section: pageContext.section,
          userContext
        };
        
        const newConv = await createConversation(contextPage, contextData);
        activeConvId = newConv?.id;
        console.log('✅ [handleSendMessage] Conversation créée:', activeConvId);
        
        if (!activeConvId) {
          throw new Error('Impossible de créer la conversation');
        }
      }

      // Envoyer le message avec ou sans images + CONTEXTE
      if (selectedImages.length > 0) {
        console.log('📸 [handleSendMessage] Envoi avec', selectedImages.length, 'images + contexte utilisateur');
        await sendMessageWithImages(userMessage, selectedImages, activeConvId, userContext);
        setSelectedImages([]); // Clear après envoi
      } else {
        console.log('💬 [handleSendMessage] Envoi texte simple + contexte utilisateur');
        await sendMessage(userMessage, 'text', null, activeConvId, userContext, pageContext);
      }

      // L'IA répondra automatiquement via le hook avec le contexte enrichi

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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearHistory = () => {
    setMessages([]);
    const aiService = getContextualAI();
    if (aiService) {
      aiService.clearHistory(`sidebar-${user.id}`);
    }
    toast({
      title: '🗑️ Historique effacé',
      description: 'La conversation a été réinitialisée'
    });
  };

  const handleCopyMessage = (content) => {
    navigator.clipboard.writeText(content);
    toast({
      title: '✅ Copié',
      description: 'Message copié dans le presse-papier'
    });
  };

  const handleFeedback = (messageId, isPositive) => {
    toast({
      title: isPositive ? '👍 Merci !' : '👎 Noté',
      description: isPositive 
        ? 'Votre retour nous aide à améliorer l\'IA'
        : 'Nous allons améliorer cette réponse'
    });
    // TODO: Envoyer feedback au backend
  };

  const getWelcomeMessage = () => {
    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'cher étudiant';
    
    const messages = {
      'Dashboard': `👋 Salut ${userName} ! Je peux t'expliquer tes statistiques, te conseiller sur tes prochaines actions, ou répondre à tes questions !`,
      'Cours': `📚 Bonjour ${userName} ! Besoin d'aide avec un concept ? Je suis là pour expliquer, donner des exemples, ou suggérer des méthodes d'apprentissage !`,
      'Quiz': `🎯 Salut ${userName} ! Prêt pour le quiz ? Je peux t'aider à comprendre les questions, expliquer les réponses, ou donner des astuces !`,
      'Examens': `📝 Bonjour ${userName} ! Examen en cours ? Je peux t'expliquer les concepts, clarifier les questions, ou t'encourager !`,
      'Progression': `📊 Salut ${userName} ! Analysons ta progression ensemble ! Je peux interpréter tes stats et te recommander des actions !`,
      'Coach IA': `🤖 Bonjour ${userName} ! Besoin de clarifications sur l'analyse ? Je peux approfondir les prédictions et expliquer les recommandations !`,
      'Défis': `🏆 Salut ${userName} ! Envie de réussir les défis ? Je peux te donner des stratégies et te motiver !`,
      'Badges': `🎖️ Bonjour ${userName} ! Veux-tu débloquer plus de badges ? Je peux t'expliquer comment les obtenir !`,
      'Classement': `🏅 Salut ${userName} ! Analysons ton classement ! Je peux te conseiller pour progresser !`,
      'Profil': `⚙️ Bonjour ${userName} ! Besoin d'aide avec ton profil ? Je suis là pour t'assister !`
    };

    return messages[currentContext.page] || `👋 Bonjour ${userName} ! Je suis ton assistant IA personnel. Comment puis-je t'aider aujourd'hui ?`;
  };

  if (!user) return null;

  return (
    <>
      {/* Bouton flottant */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-primary via-blue-600 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-primary/50 flex items-center justify-center group transition-all duration-300 hover:scale-110"
          >
            <Brain className="w-7 h-7 group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse border-2 border-white"></span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isExpanded && setIsOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className={`fixed top-0 right-0 h-full z-50 bg-white dark:bg-slate-800 shadow-2xl flex flex-col ${
                isExpanded ? 'w-full md:w-2/3 lg:w-1/2' : 'w-full md:w-96'
              }`}
            >
              {/* En-tête */}
              <div className="bg-gradient-to-r from-primary via-blue-600 to-purple-600 dark:from-primary/90 dark:via-blue-700 dark:to-purple-700 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 dark:bg-white/30 backdrop-blur rounded-full flex items-center justify-center">
                    <Brain className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Assistant IA</h3>
                    <p className="text-xs text-blue-100 dark:text-blue-200">
                      {currentContext.page} • {messages.length} messages
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* NOUVEAU: Bouton mode Perplexity */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPerplexityMode(!perplexityMode)}
                    className={`text-white hover:bg-white/20 ${perplexityMode ? 'bg-purple-500/30' : ''}`}
                    title={perplexityMode ? "Mode IA normal" : "Mode recherche Perplexity"}
                  >
                    <Search className="w-4 h-4" />
                  </Button>
                  
                  {/* NOUVEAU: Bouton historique */}
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

              {/* 🎯 SÉLECTEUR DE PROVIDER IA COMPACT */}
              <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 relative">
                <AIProviderSelectorCompact
                  currentProvider={currentProvider}
                  onProviderChange={switchProvider}
                />
              </div>

              {/* Layout avec sidebar historique */}
              <div className="flex-1 flex overflow-hidden max-w-full">
                {/* Sidebar historique conversations */}
                {showHistory && (
                  <div className="w-full sm:w-80 max-w-full border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col overflow-x-hidden">
                    {/* Header avec bouton fermeture */}
                    <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                      <h4 className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                        <History className="w-4 h-4" />
                        Historique
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowHistory(false)}
                        className="text-slate-500 hover:text-slate-700 dark:text-slate-200 h-8 w-8 p-0"
                        title="Fermer l'historique"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {/* Liste conversations */}
                    <div className="flex-1 overflow-hidden max-w-full">
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
                        onPinConversation={togglePinConversation}
                        onRenameConversation={renameConversation}
                        onDeleteConversation={deleteConversation}
                        loading={loading.conversations}
                      />
                    </div>
                  </div>
                )}

                {/* Zone principale messages */}
                <div className="flex-1 flex flex-col overflow-x-hidden max-w-full">
                  {/* MODE PERPLEXITY ou CHAT NORMAL */}
                  {perplexityMode ? (
                    <PerplexitySearchMode 
                      userContext={{
                        subject: currentContext.section,
                        level: userProfile?.level || 'BFEM'
                      }}
                    />
                  ) : (
                    <>
                      {/* Messages */}
                      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 bg-slate-50 dark:bg-slate-900 max-w-full">
                {/* Message de bienvenue */}
                {messages.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-4 border border-blue-200 dark:border-blue-700"
                  >
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-sm text-slate-700 dark:text-slate-200">{getWelcomeMessage()}</p>
                        
                        {/* Suggestions contextuelles */}
                        <div className="mt-3 space-y-2">
                          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">💡 Suggestions :</p>
                          <div className="flex flex-wrap gap-2">
                            {currentContext.page === 'Dashboard' && (
                              <>
                                <button
                                  onClick={() => setInputValue('Explique-moi mes statistiques')}
                                  className="px-3 py-1 bg-white dark:bg-slate-700 rounded-full text-xs text-slate-700 dark:text-slate-200 hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transition-colors"
                                >
                                  Explique mes stats
                                </button>
                                <button
                                  onClick={() => setInputValue('Que dois-je faire maintenant ?')}
                                  className="px-3 py-1 bg-white dark:bg-slate-700 rounded-full text-xs text-slate-700 dark:text-slate-200 hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transition-colors"
                                >
                                  Prochaine action ?
                                </button>
                              </>
                            )}
                            {currentContext.page === 'Cours' && (
                              <>
                                <button
                                  onClick={() => setInputValue('Donne-moi des exemples')}
                                  className="px-3 py-1 bg-white rounded-full text-xs text-slate-700 dark:text-slate-200 hover:bg-primary hover:text-white transition-colors"
                                >
                                  Des exemples
                                </button>
                                <button
                                  onClick={() => setInputValue('Comment mieux mémoriser ?')}
                                  className="px-3 py-1 bg-white rounded-full text-xs text-slate-700 dark:text-slate-200 hover:bg-primary hover:text-white transition-colors"
                                >
                                  Méthodes mémorisation
                                </button>
                              </>
                            )}
                            {(currentContext.page === 'Quiz' || currentContext.page === 'Examens') && (
                              <>
                                <button
                                  onClick={() => setInputValue('Donne-moi des astuces')}
                                  className="px-3 py-1 bg-white rounded-full text-xs text-slate-700 dark:text-slate-200 hover:bg-primary hover:text-white transition-colors"
                                >
                                  Astuces réussite
                                </button>
                                <button
                                  onClick={() => setInputValue('Comment gérer le stress ?')}
                                  className="px-3 py-1 bg-white rounded-full text-xs text-slate-700 dark:text-slate-200 hover:bg-primary hover:text-white transition-colors"
                                >
                                  Gérer le stress
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions rapides - Affichées au démarrage */}
                    <div className="mt-4 space-y-2">
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2">
                        <Sparkles className="w-3 h-3" />
                        Actions rapides
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            setInputValue("J'ai besoin d'aide en mathématiques");
                            inputRef.current?.focus();
                          }}
                          className="flex flex-col items-center gap-2 p-3 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-xl transition-colors group"
                        >
                          <Calculator className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-200">Maths</span>
                        </button>
                        <button
                          onClick={() => {
                            setInputValue("Comment améliorer mon français ?");
                            inputRef.current?.focus();
                          }}
                          className="flex flex-col items-center gap-2 p-3 bg-white dark:bg-slate-800 hover:bg-green-50 dark:hover:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-xl transition-colors group"
                        >
                          <PenTool className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform" />
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-200">Français</span>
                        </button>
                        <button
                          onClick={() => {
                            setInputValue("Quelles sont les meilleures techniques d'étude ?");
                            inputRef.current?.focus();
                          }}
                          className="flex flex-col items-center gap-2 p-3 bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded-xl transition-colors group"
                        >
                          <BookOpen className="w-5 h-5 text-purple-600 group-hover:scale-110 transition-transform" />
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-200">Méthodes</span>
                        </button>
                        <button
                          onClick={() => {
                            setInputValue("Comment me préparer efficacement aux examens ?");
                            inputRef.current?.focus();
                          }}
                          className="flex flex-col items-center gap-2 p-3 bg-white dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-orange-900/30 border border-orange-200 dark:border-orange-700 rounded-xl transition-colors group"
                        >
                          <Star className="w-5 h-5 text-orange-600 group-hover:scale-110 transition-transform" />
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-200">Examens</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Historique messages avec MessageItem */}
                {Array.isArray(messages) && messages.map((message) => (
                  <MessageItem
                    key={message.id}
                    message={message}
                    onEdit={editMessage}
                    onDelete={deleteMessage}
                    canEdit={message.role === 'user'}
                    canDelete={true}
                  />
                ))}

                {/* Indicateur chargement */}
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

              {/* Input avec upload image */}
              <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 space-y-3">
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
                      className="w-full px-4 py-2 pr-10 border border-slate-300 dark:border-slate-600 rounded-xl 
                                 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 
                                 placeholder-slate-400 dark:placeholder-slate-400
                                 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent 
                                 resize-none disabled:bg-slate-100 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
                    />
                    <div className="absolute bottom-2 right-2 text-xs text-slate-400 dark:text-slate-500">
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

                <p className="text-xs text-slate-500 dark:text-slate-400 text-center flex items-center justify-center gap-2">
                  💡 <kbd className="px-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded">Entrée</kbd> pour envoyer
                  {selectedImages.length > 0 && (
                    <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                      <ImageIcon className="w-3 h-3" />
                      {selectedImages.length} image(s)
                    </span>
                  )}
                </p>
              </div>
              </>
                  )}
            </div>
          </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

// Wrapper avec gestion d'erreur pour éviter crash
const SafeAIAssistantSidebar = () => {
  try {
    return <AIAssistantSidebar />;
  } catch (error) {
    console.error('❌ [AIAssistantSidebar] Erreur critique:', error);
    return null; // Ne pas bloquer le reste de l'application
  }
};

export default SafeAIAssistantSidebar;
