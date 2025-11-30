/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * PAGE COACH IA - VERSION FUSIONNÉE
 * Description: Page dédiée au Coach IA avec onglets (Conversation + Analyse + Recherche Perplexity)
 * Date: 10 octobre 2025
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { 
  Bot, 
  Sparkles, 
  MessageSquare, 
  Send,
  Paperclip,
  Loader2,
  Clock,
  TrendingUp,
  BookOpen,
  Award,
  Brain,
  Target,
  Trophy,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  ChevronRight,
  Globe,
  Lightbulb
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useAIConversation } from '@/hooks/useAIConversation';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import ConversationList from '@/components/ConversationList';
import MessageItem from '@/components/MessageItem';
import AIProviderSelectorCompact from '@/components/AIProviderSelectorCompact';
import { useMultiProviderAI } from '@/hooks/useMultiProviderAI';
import AICoachService from '@/lib/aiCoachService';
import aiConversationService from '@/lib/aiConversationService';
import { checkProfileCompleteness, getOrientationFromProfile } from '@/services/profileOrientationService';
import PerplexitySearchMode from '@/components/PerplexitySearchMode';
import InteractiveQuiz from '@/components/InteractiveQuiz';
import QuizHistory from '@/components/QuizHistory';
import QuizRevisionSuggestions from '@/components/QuizRevisionSuggestions';
import QuizLeaderboard from '@/components/QuizLeaderboard';

const CoachIA = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ÉTATS - CONVERSATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const [userProfile, setUserProfile] = useState(null);
  const [userStats, setUserStats] = useState({
    level: 1,
    totalPoints: 0,
    currentStreak: 0,
    completedChapters: 0,
    totalBadges: 0,
    averageScore: 0
  });
  const [userMessage, setUserMessage] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [showHistory, setShowHistory] = useState(true);
  const [activeTab, setActiveTab] = useState('conversation');
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ÉTAT - QUIZ INTERACTIF
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const [showInteractiveQuiz, setShowInteractiveQuiz] = useState(false);
  const [quizConfig, setQuizConfig] = useState({
    subject: 'Mathématiques',
    chapter: null,
    difficulty: 'medium'
  });
  const [lastQuizSession, setLastQuizSession] = useState(null);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ÉTATS - ANALYSE IA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [studyPlan, setStudyPlan] = useState(null);
  const [motivationalMessage, setMotivationalMessage] = useState('');
  const [aiCoach, setAiCoach] = useState(null);

  // Multi-provider IA
  const { currentProvider, switchProvider } = useMultiProviderAI();

  // Contexte actuel
  const currentContext = {
    page: 'coach-ia',
    section: 'conversation'
  };

  // Hook de conversation
  const {
    conversations,
    currentConversation,
    messages,
    loading,
    sending,
    createConversation,
    loadConversation,
    sendMessage,
    sendMessageWithImages,
    deleteConversation,
    renameConversation,
    togglePinConversation
  } = useAIConversation(null, currentContext.page, currentContext);

  // Charger le profil utilisateur + orientation
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        setUserProfile(data);
        
        // 🆕 Charger données d'orientation pour enrichir contexte Coach IA
        try {
          const orientationData = await getOrientationFromProfile(user.id);
          if (orientationData) {
            // Ajouter au profil pour utilisation dans les suggestions IA
            setUserProfile(prev => ({
              ...prev,
              orientation: orientationData
            }));
            console.log('✅ [Coach IA] Contexte orientation chargé:', orientationData);
          }
        } catch (err) {
          console.error('❌ Erreur chargement orientation:', err);
        }
      }
    };

    fetchProfile();
  }, [user]);

  // Charger les statistiques complètes
  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user) return;

      try {
        // 1. Profil de base
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();

        // 2. Points et streak depuis user_points
        const { data: pointsData } = await supabase
          .from('user_points')
          .select('total_points, level, current_streak')
          .eq('user_id', user.id)
          .single();

        // 3. Chapitres complétés
        const { data: progressData } = await supabase
          .from('user_progress')
          .select('id')
          .eq('user_id', user.id)
          .eq('completed', true);

        // 4. Badges
        const { data: badgesData } = await supabase
          .from('user_badges')
          .select('id')
          .eq('user_id', user.id);

        // 5. Score moyen des quiz
        const { data: quizResults } = await supabase
          .from('quiz_results')
          .select('score, total_questions')
          .eq('user_id', user.id);

        let avgScore = 0;
        if (quizResults && quizResults.length > 0) {
          const validResults = quizResults.filter(r => r.total_questions > 0);
          if (validResults.length > 0) {
            avgScore = Math.round(
              validResults.reduce((sum, r) => sum + (r.score / r.total_questions) * 100, 0) / validResults.length
            );
          }
        }

        // Mettre à jour l'état
        setUserStats({
          level: pointsData?.level || 1,
          totalPoints: pointsData?.total_points || 0,
          currentStreak: pointsData?.current_streak || 0,
          completedChapters: progressData?.length || 0,
          totalBadges: badgesData?.length || 0,
          averageScore: avgScore
        });
      } catch (error) {
        console.error('❌ Erreur chargement stats:', error);
      }
    };

    fetchUserStats();
  }, [user]);

  // Initialiser l'analyse IA
  useEffect(() => {
    if (user && activeTab === 'analyse') {
      initializeCoach();
    }
  }, [user, activeTab]);

  // Initialiser le coach IA et générer l'analyse
  const initializeCoach = async () => {
    setLoadingAnalysis(true);
    try {
      const coach = new AICoachService(user.id);
      setAiCoach(coach);

      // Analyser les performances
      const performanceAnalysis = await coach.analyzePerformance();
      setAnalysis(performanceAnalysis);

      // Générer message motivant
      const message = coach.generateMotivationalMessage(performanceAnalysis);
      setMotivationalMessage(message);

      // Générer plan d'étude
      const plan = await coach.generateStudyPlan(null, 2);
      setStudyPlan(plan);

      console.log('🤖 [Coach IA] Analyse complète:', {
        analysis: performanceAnalysis,
        plan
      });

    } catch (error) {
      console.error('❌ [Coach IA] Erreur initialisation:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de charger l\'analyse IA'
      });
    } finally {
      setLoadingAnalysis(false);
    }
  };

  // Rafraîchir l'analyse
  const handleRefreshAnalysis = async () => {
    try {
      // Recharger les stats utilisateur
      const { data: pointsData } = await supabase
        .from('user_points')
        .select('total_points, level, current_streak')
        .eq('user_id', user.id)
        .single();

      const { data: progressData } = await supabase
        .from('user_progress')
        .select('id')
        .eq('user_id', user.id)
        .eq('completed', true);

      const { data: badgesData } = await supabase
        .from('user_badges')
        .select('id')
        .eq('user_id', user.id);

      const { data: quizResults } = await supabase
        .from('quiz_results')
        .select('score, total_questions')
        .eq('user_id', user.id);

      let avgScore = 0;
      if (quizResults && quizResults.length > 0) {
        const validResults = quizResults.filter(r => r.total_questions > 0);
        if (validResults.length > 0) {
          avgScore = Math.round(
            validResults.reduce((sum, r) => sum + (r.score / r.total_questions) * 100, 0) / validResults.length
          );
        }
      }

      setUserStats({
        level: pointsData?.level || 1,
        totalPoints: pointsData?.total_points || 0,
        currentStreak: pointsData?.current_streak || 0,
        completedChapters: progressData?.length || 0,
        totalBadges: badgesData?.length || 0,
        averageScore: avgScore
      });

      // Recharger l'analyse IA
      await initializeCoach();
      
      toast({
        title: '✅ Analyse mise à jour',
        description: 'Vos données ont été analysées à nouveau'
      });
    } catch (error) {
      console.error('❌ Erreur rafraîchissement:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de rafraîchir les données'
      });
    }
  };

  // Fonction utilitaire pour couleur de grade
  const getGradeColor = (grade) => {
    if (grade === 'A' || grade === 'A+') return 'bg-green-500 text-white';
    if (grade === 'B' || grade === 'B+') return 'bg-blue-500 text-white';
    if (grade === 'C') return 'bg-yellow-500 text-white';
    return 'bg-orange-500 text-white';
  };

  // Récupérer les données utilisateur enrichies
  const fetchUserRealData = async () => {
    if (!user) return {};

    try {
      // Récupérer user_points
      const { data: userPointsData } = await supabase
        .from('user_points')
        .select('total_points, level, current_streak, longest_streak, quizzes_completed, lessons_completed')
        .eq('user_id', user.id)
        .single();

      // Récupérer progression
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id);

      // Récupérer badges avec JOIN
      const { data: badgesData } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      // Récupérer chapitres complétés
      const { data: completedChapitres } = await supabase
        .from('user_progress')
        .select(`
          chapitre_id,
          completed,
          progress_percentage,
          chapitres (
            id,
            title,
            matieres (
              name
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('completed', true);

      const matieres = [...new Set(
        completedChapitres?.map(c => c.chapitres?.matieres?.name).filter(Boolean) || []
      )];

      return {
        userName: userProfile?.full_name || user.email?.split('@')[0] || 'Étudiant',
        level: userPointsData?.level || 1,
        totalPoints: userPointsData?.total_points || 0,
        currentStreak: userPointsData?.current_streak || 0,
        completedChapters: completedChapitres?.length || 0,
        totalBadges: badgesData?.length || 0,
        matieres,
        recentBadges: badgesData?.slice(0, 3).map(b => b.badges.name) || []
      };
    } catch (error) {
      console.error('Erreur récupération données:', error);
      return {
        userName: userProfile?.full_name || 'Étudiant',
        level: 1,
        totalPoints: 0
      };
    }
  };

  // Gérer l'envoi de message
  const handleSendMessage = async () => {
    if (!userMessage.trim() && selectedImages.length === 0) return;

    try {
      // Récupérer contexte utilisateur
      const userContext = await fetchUserRealData();
      const pageContext = {
        page: 'coach-ia',
        section: 'conversation'
      };

      // Créer conversation si nécessaire
      let activeConvId = currentConversation?.id;
      
      if (!activeConvId) {
        const newConv = await createConversation('coach-ia', {
          section: 'conversation',
          userContext
        });
        activeConvId = newConv?.id;
      }

      // Envoyer message
      if (selectedImages.length > 0) {
        await sendMessageWithImages(userMessage, selectedImages, activeConvId, userContext);
        setSelectedImages([]);
      } else {
        await sendMessage(userMessage, 'text', null, activeConvId, userContext, pageContext);
      }

      setUserMessage('');
    } catch (error) {
      console.error('Erreur envoi message:', error);
    }
  };

  // Gérer sélection d'images
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    setSelectedImages(prev => [...prev, ...files]);
  };

  return (
    <>
      <Helmet>
        <title>Coach IA - E-Réussite</title>
        <meta name="description" content="Votre coach IA personnel avec conversation et analyse de performances" />
      </Helmet>

  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
        <div className="container mx-auto p-4 lg:p-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-gradient-to-r from-blue-50 via-green-50 to-pink-50 dark:from-slate-800 dark:via-green-900/30 dark:to-slate-900 rounded-2xl p-6 shadow-[0_0_32px_0_rgba(34,197,94,0.18)] dark:shadow-[0_0_40px_0_rgba(34,197,94,0.25)]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Bot className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    Coach IA
                    <Sparkles className="w-6 h-6 text-yellow-500" />
                  </h1>
                  <p className="text-slate-600 dark:text-slate-300">Conversation & Analyse personnalisée</p>
                </div>
              </div>

              {/* Stats rapides */}
              <div className="hidden lg:flex items-center gap-4">
                <div className="text-center px-4 py-2 bg-white/80 dark:bg-slate-700/80 backdrop-blur rounded-lg shadow-md border border-white/20 dark:border-slate-600/30">
                  <p className="text-xs text-slate-600 dark:text-slate-300">Niveau</p>
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{userStats.level}</p>
                </div>
                <div className="text-center px-4 py-2 bg-white/80 dark:bg-slate-700/80 backdrop-blur rounded-lg shadow-md border border-white/20 dark:border-slate-600/30">
                  <p className="text-xs text-slate-600 dark:text-slate-300">Points</p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">{userStats.totalPoints}</p>
                </div>
                <div className="text-center px-4 py-2 bg-white/80 dark:bg-slate-700/80 backdrop-blur rounded-lg shadow-md border border-white/20 dark:border-slate-600/30">
                  <p className="text-xs text-slate-600 dark:text-slate-300">Série</p>
                  <p className="text-xl font-bold text-orange-600 dark:text-orange-400">🔥 {userStats.currentStreak}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Onglets principaux */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            {/* Conteneur scrollable pour les onglets */}
            <div className="relative">
              <div className="overflow-x-auto scrollbar-hide">
                <TabsList className="inline-flex w-auto min-w-full lg:w-auto gap-2 p-1">
                  <TabsTrigger value="conversation" className="gap-2 flex-shrink-0">
                    <MessageSquare className="w-4 h-4" />
                    <span className="hidden sm:inline">Conversation</span>
                  </TabsTrigger>
                  <TabsTrigger value="recherche" className="gap-2 flex-shrink-0">
                    <Globe className="w-4 h-4" />
                    <span className="hidden sm:inline">Recherche Web</span>
                  </TabsTrigger>
                  <TabsTrigger value="analyse" className="gap-2 flex-shrink-0">
                    <Brain className="w-4 h-4" />
                    <span className="hidden sm:inline">Analyse & Conseils</span>
                  </TabsTrigger>
                  <TabsTrigger value="history" className="gap-2 flex-shrink-0">
                    <BarChart3 className="w-4 h-4" />
                    <span className="hidden sm:inline">Historique Quiz</span>
                  </TabsTrigger>
                  <TabsTrigger value="suggestions" className="gap-2 flex-shrink-0">
                    <Target className="w-4 h-4" />
                    <span className="hidden sm:inline">Suggestions</span>
                  </TabsTrigger>
                  <TabsTrigger value="leaderboard" className="gap-2 flex-shrink-0">
                    <Trophy className="w-4 h-4" />
                    <span className="hidden sm:inline">Classement</span>
                  </TabsTrigger>
                </TabsList>
              </div>
              {/* Indicateur de scroll (visible uniquement si nécessaire) */}
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none lg:hidden" />
            </div>

            {/* ONGLET 1: CONVERSATION */}
            <TabsContent value="conversation" className="space-y-4">
              {/* Provider Selector */}
              <Card className="border-blue-200 dark:border-blue-700">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <AIProviderSelectorCompact
                      currentProvider={currentProvider}
                      onProviderChange={switchProvider}
                    />
                    <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      {conversations.length} conversation{conversations.length > 1 ? 's' : ''}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Interface de conversation */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Sidebar conversations */}
                {showHistory && (
                  <Card className="lg:col-span-3 h-[calc(100vh-200px)] overflow-hidden flex flex-col shadow-[0_0_16px_0_rgba(34,197,94,0.10)] dark:shadow-[0_0_24px_0_rgba(34,197,94,0.18)] dark:bg-slate-800 dark:border-slate-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Conversations</CardTitle>
                      <CardDescription>Historique</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto p-0">
                      <ConversationList
                        conversations={conversations}
                        currentConversationId={currentConversation?.id}
                        onSelectConversation={loadConversation}
                        onCreateConversation={async () => {
                          const userContext = await fetchUserRealData();
                          await createConversation('coach-ia', { userContext });
                        }}
                        onPinConversation={togglePinConversation}
                        onRenameConversation={renameConversation}
                        onDeleteConversation={deleteConversation}
                        loading={loading.conversations}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Zone de chat */}
                <Card className={`${showHistory ? 'lg:col-span-9' : 'lg:col-span-12'} h-[calc(100vh-200px)] flex flex-col shadow-[0_0_16px_0_rgba(34,197,94,0.10)] dark:shadow-[0_0_24px_0_rgba(34,197,94,0.18)] dark:bg-slate-900 dark:border-slate-700`}>
                  <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{currentConversation?.title || 'Nouvelle conversation'}</CardTitle>
                        <CardDescription>{messages.length} message{messages.length > 1 ? 's' : ''}</CardDescription>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setShowHistory(!showHistory)}>
                        {showHistory ? 'Masquer' : 'Afficher'} l'historique
                      </Button>
                    </div>
                  </CardHeader>

                  {/* Messages */}
                  <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Quiz Interactif */}
                    {showInteractiveQuiz ? (
                      <InteractiveQuiz
                        userId={user?.id}
                        config={quizConfig}
                        onComplete={async (results) => {
                          setShowInteractiveQuiz(false);
                          
                          // Calculer le pourcentage
                          const scorePercent = Math.round((results.correctAnswers / results.totalQuestions) * 100);
                          
                          // Message de félicitations selon performance
                          let congratsMessage = '';
                          if (scorePercent >= 80) {
                            congratsMessage = `🎉 Félicitations ! Tu as brillamment réussi avec ${scorePercent}% de bonnes réponses ! ${results.badgeEarned ? '\n🏆 Tu as débloqué un badge : ' + results.badgeEarned.name + ' ' + results.badgeEarned.icon + ' !' : ''}`;
                          } else if (scorePercent >= 60) {
                            congratsMessage = `👍 Bravo ! Tu as obtenu ${scorePercent}% ! C'est un bon score, continue sur cette lancée !`;
                          } else {
                            congratsMessage = `💪 Tu as obtenu ${scorePercent}%. Ne te décourage pas ! L'important c'est de progresser. Veux-tu qu'on révise ensemble les notions où tu as eu des difficultés ?`;
                          }
                          
                          // Créer un message automatique du Coach IA dans la conversation
                          const coachFeedback = `📊 **Quiz Interactif Terminé !**\n\n${congratsMessage}\n\n**Résumé de ta performance :**\n✅ Bonnes réponses : ${results.correctAnswers}/${results.totalQuestions}\n📈 Score : ${scorePercent}%\n⏱️ Temps écoulé : ${Math.floor(results.timeElapsed / 60)}min ${results.timeElapsed % 60}s\n\n${scorePercent >= 80 ? '🌟 Excellente maîtrise du sujet !' : scorePercent >= 60 ? '👏 Bon travail, tu progresses bien !' : '💡 Continue à t\'entraîner, tu vas y arriver !'}`;
                          
                          try {
                            // CORRECTION : Attendre que la conversation soit prête
                            let conversationToUse = currentConversation;
                            
                            if (!conversationToUse?.id) {
                              console.log('🔄 Création d\'une nouvelle conversation pour le feedback...');
                              conversationToUse = await createConversation();
                              
                              // Attendre un peu que la conversation soit bien enregistrée
                              await new Promise(resolve => setTimeout(resolve, 500));
                            }
                            
                            if (conversationToUse?.id) {
                              console.log('📤 Envoi du feedback dans la conversation:', conversationToUse.id);
                              
                              // CORRECTION : Envoyer directement avec role 'assistant' via le service
                              const messageResult = await aiConversationService.saveMessage(
                                conversationToUse.id,
                                'assistant', // ← Role correct pour le Coach IA
                                coachFeedback,
                                'text',
                                { quiz_feedback: true, score: scorePercent }
                              );
                              
                              if (messageResult.success) {
                                console.log('✅ Feedback envoyé avec succès !');
                                // Recharger la conversation pour afficher le nouveau message
                                await loadConversation(conversationToUse.id);
                              } else {
                                console.error('❌ Erreur sauvegarde feedback');
                              }
                            } else {
                              console.error('❌ Impossible de créer une conversation pour le feedback');
                              // Fallback : afficher au moins le toast
                              toast({
                                title: "🎉 Quiz terminé !",
                                description: congratsMessage,
                                duration: 8000
                              });
                            }
                          } catch (error) {
                            console.error('❌ Erreur ajout message coach:', error);
                            // Fallback : afficher le toast même en cas d'erreur
                            toast({
                              title: "🎉 Quiz terminé !",
                              description: congratsMessage,
                              duration: 8000
                            });
                          }
                          
                          // NOUVEAU : Sauvegarder la dernière session pour les suggestions
                          setLastQuizSession({
                            sessionId: results.sessionId,
                            results: results,
                            questions: results.questions || [],
                            userAnswers: results.userAnswers || []
                          });
                          
                          // Toast notification toujours affiché
                          toast({
                            title: "Quiz terminé !",
                            description: `${scorePercent}% - ${results.correctAnswers}/${results.totalQuestions} bonnes réponses`,
                            duration: 5000
                          });
                          
                          // NOUVEAU : Basculer vers l'onglet suggestions après 2 secondes
                          setTimeout(() => {
                            setActiveTab('suggestions');
                          }, 2000);
                        }}
                        onCancel={() => setShowInteractiveQuiz(false)}
                      />
                    ) : messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center py-12">
                        <Bot className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
                        <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2">Commencez une conversation</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6">
                          Posez-moi des questions sur vos cours, statistiques ou demandez des conseils !
                        </p>
                        
                        {/* Bouton Quiz Interactif */}
                        <Button
                          onClick={() => setShowInteractiveQuiz(true)}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 gap-2"
                        >
                          <Sparkles className="w-4 h-4" />
                          Lancer un Quiz Interactif
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((msg) => (
                          <MessageItem 
                            key={msg.id} 
                            message={msg} 
                            isUser={msg.role === 'user'}
                            canEdit={false}
                            canDelete={false}
                            onEdit={() => {}}
                            onDelete={() => {}}
                          />
                        ))}
                      </div>
                    )}
                    {sending && (
                      <div className="flex items-center gap-2 text-slate-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">L'IA réfléchit...</span>
                      </div>
                    )}
                  </CardContent>

                  {/* Input zone */}
                  <CardContent className="border-t p-4">
                    {/* Bouton Quiz Interactif (toujours visible) */}
                    {!showInteractiveQuiz && (
                      <div className="mb-3">
                        <Button
                          onClick={() => setShowInteractiveQuiz(true)}
                          variant="outline"
                          className="w-full bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-300 dark:border-purple-700 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 gap-2"
                        >
                          <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <span className="text-purple-700 dark:text-purple-300">Lancer un Quiz Interactif</span>
                        </Button>
                      </div>
                    )}
                    
                    {selectedImages.length > 0 && (
                      <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                        {selectedImages.map((img, i) => (
                          <div key={i} className="relative flex-shrink-0">
                            <img src={URL.createObjectURL(img)} alt={`Sélection ${i + 1}`} className="w-20 h-20 object-cover rounded-lg border" />
                            <button onClick={() => setSelectedImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs">×</button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <input type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" id="image-upload" />
                      <label htmlFor="image-upload">
                        <Button variant="outline" size="icon" className="cursor-pointer" asChild>
                          <span><Paperclip className="w-4 h-4" /></span>
                        </Button>
                      </label>

                      <input
                        type="text"
                        value={userMessage}
                        onChange={(e) => setUserMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                        placeholder="Posez votre question..."
                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={sending}
                      />

                      <Button
                        onClick={handleSendMessage}
                        disabled={sending || (!userMessage.trim() && selectedImages.length === 0)}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      >
                        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ONGLET 2: RECHERCHE WEB PERPLEXITY PRO */}
            <TabsContent value="recherche" className="space-y-6">
              <Card className="border-purple-200 dark:border-purple-700 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500 rounded-lg">
                      <Globe className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Recherche Web Intelligente</CardTitle>
                      <CardDescription className="text-sm">
                        Powered by Perplexity AI Pro • Recherche en temps réel avec sources fiables
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 overflow-hidden">
                  <PerplexitySearchMode 
                    userContext={{
                      subject: userProfile?.favorite_subject || 'général',
                      level: userProfile?.level || 'BFEM'
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* ONGLET 3: ANALYSE & CONSEILS */}
            <TabsContent value="analyse" className="space-y-6">
              {loadingAnalysis ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-lg font-medium">Analyse de vos performances en cours...</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">Cela peut prendre quelques secondes</p>
                  </CardContent>
                </Card>
              ) : analysis ? (
                <>
                  {/* Forces & Faiblesses */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Trophy className="w-5 h-5 text-green-500" />
                          Points Forts
                        </CardTitle>
                        <CardDescription>Matières où vous excellez</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {analysis.strengths && analysis.strengths.length > 0 ? (
                          analysis.strengths.map((strength, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                              <div className="text-2xl">{strength.icon || '✅'}</div>
                              <div className="flex-1">
                                <p className="font-medium text-slate-900 dark:text-white">{strength.title}</p>
                                <p className="text-sm text-slate-600 dark:text-slate-300">{strength.description}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-slate-500 text-center py-4">Continuez à travailler pour identifier vos points forts !</p>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="w-5 h-5 text-orange-500" />
                          À Améliorer
                        </CardTitle>
                        <CardDescription>Matières nécessitant plus d'attention</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {analysis.weaknesses && analysis.weaknesses.length > 0 ? (
                          analysis.weaknesses.map((weakness, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                              <div className="text-2xl">{weakness.icon || '⚠️'}</div>
                              <div className="flex-1">
                                <p className="font-medium text-slate-900 dark:text-white">{weakness.title}</p>
                                <p className="text-sm text-slate-600 dark:text-slate-300">{weakness.description}</p>
                                {weakness.recommendations && weakness.recommendations.length > 0 && (
                                  <ul className="text-xs text-slate-500 mt-2 space-y-1">
                                    {weakness.recommendations.slice(0, 2).map((rec, idx) => (
                                      <li key={idx}>• {rec}</li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-slate-500 text-center py-4">Excellent ! Aucune faiblesse majeure détectée.</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Plan d'étude recommandé */}
                  {studyPlan && studyPlan.recommendations && studyPlan.recommendations.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-primary" />
                          Plan d'Étude Recommandé
                        </CardTitle>
                        <CardDescription>Actions prioritaires pour progresser</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {studyPlan.recommendations.map((rec, i) => (
                          <div key={i} className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-primary transition-colors">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-bold text-primary">#{i + 1}</span>
                                  <h4 className="font-semibold text-slate-900 dark:text-white">{rec.matiere}</h4>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">{rec.reason}</p>
                                <div className="flex items-center gap-4 text-xs text-slate-500">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {rec.estimatedTime}
                                  </span>
                                  {rec.priority && (
                                    <span className={`px-2 py-0.5 rounded font-medium ${
                                      rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                                      rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-blue-100 text-blue-700'
                                    }`}>
                                      {rec.priority === 'high' ? 'Urgent' : rec.priority === 'medium' ? 'Important' : 'Normal'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              className="w-full"
                              onClick={() => {
                                if (rec.matiereId) {
                                  window.location.href = `/course/${rec.matiereId}`;
                                }
                              }}
                            >
                              <ChevronRight className="w-4 h-4 mr-1" />
                              Commencer cette matière
                            </Button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                <Card>
                  <CardContent className="py-16 text-center">
                    <Brain className="w-20 h-20 text-slate-300 mx-auto mb-6" />
                    <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-3">Aucune analyse disponible</h3>
                    <p className="text-slate-600 dark:text-slate-300 mb-6 max-w-md mx-auto">
                      Générez votre première analyse pour découvrir vos statistiques détaillées, vos points forts et recevoir des recommandations personnalisées.
                    </p>
                    <Button 
                      onClick={initializeCoach}
                      size="lg"
                      className="bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Générer mon analyse
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* ONGLET 4: HISTORIQUE QUIZ */}
            <TabsContent value="history" className="space-y-4">
              <Card className="border-purple-200 dark:border-purple-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-purple-500" />
                    Historique des Quiz Interactifs
                  </CardTitle>
                  <CardDescription>
                    Consulte tous tes quiz passés et recommence ceux que tu veux réviser
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <QuizHistory
                    userId={user?.id}
                    onRetryQuiz={(session) => {
                      // Relancer le quiz en mode révision
                      setActiveTab('conversation');
                      setQuizConfig({
                        subject: session.subject || 'Général',
                        difficulty: session.difficulty_level || 'medium',
                        reviewMode: true,
                        sessionId: session.id
                      });
                      setShowInteractiveQuiz(true);
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* ONGLET 5: SUGGESTIONS DE RÉVISION */}
            <TabsContent value="suggestions" className="space-y-4">
              <Card className="border-orange-200 dark:border-orange-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-6 h-6 text-orange-500" />
                    Suggestions de Révision
                  </CardTitle>
                  <CardDescription>
                    Recommandations personnalisées basées sur ton dernier quiz
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {lastQuizSession ? (
                    <QuizRevisionSuggestions
                      userId={user?.id}
                      sessionId={lastQuizSession.sessionId}
                      questions={lastQuizSession.questions}
                      userAnswers={lastQuizSession.userAnswers}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Lightbulb className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
                      <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2">
                        Aucune suggestion disponible
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6">
                        Complète un quiz interactif pour recevoir des suggestions personnalisées basées sur tes réponses !
                      </p>
                      <Button
                        onClick={() => {
                          setActiveTab('conversation');
                          setShowInteractiveQuiz(true);
                        }}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      >
                        <Target className="w-4 h-4 mr-2" />
                        Lancer un Quiz
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ONGLET 6: CLASSEMENT QUIZ */}
            <TabsContent value="leaderboard" className="space-y-4">
              <Card className="border-purple-200 dark:border-purple-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-purple-500" />
                    Classement des Quiz Interactifs
                  </CardTitle>
                  <CardDescription>
                    Compare ta progression avec les autres élèves
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <QuizLeaderboard userId={user?.id} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default CoachIA;
