import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { toast as sonnerToast } from 'sonner';
import { supabase } from '@/lib/customSupabaseClient';
import dbHelpersOld from '@/lib/supabaseDB';
import { dbHelpers } from '@/lib/supabaseHelpers';
import { SimpleGamificationEngine } from '@/lib/simpleGamification';
import { SimpleLearningAnalytics } from '@/lib/simpleLearningAnalytics';
import { SimpleEducationalChatbot } from '@/lib/simpleEducationalChatbot';
import { initializeContextualAI } from '@/lib/contextualAIService';
import { useToast } from '@/components/ui/use-toast';
import { BadgeToastContent, LevelUpToastContent } from '@/components/BadgeNotification';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const { toast } = useToast();

  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gamificationEngine, setGamificationEngine] = useState(null);
  const [learningAnalytics, setLearningAnalytics] = useState(null);
  const [chatbot, setChatbot] = useState(null);

  const initializeUserSession = useCallback(async (authUser) => {
    try {
      setUser(authUser);

      // Get or create user profile (using old helpers)
      let profileResult = await dbHelpersOld.profile.getProfile(authUser.id);
      
      if (!profileResult.data) {
        // Create profile if it doesn't exist
        profileResult = await dbHelpersOld.profile.createProfile(authUser);
      }
      
      setUserProfile(profileResult.data);

      // Prefetch admin routes for admins
      try {
        const role = profileResult?.data?.role;
        if (role === 'admin') {
          import('@/components/admin/AdminLayout');
          import('@/pages/admin/AdminDashboard');
          import('@/pages/admin/AdminUsers');
          import('@/pages/admin/AdminCourses');
          import('@/pages/admin/AdminProducts');
        }
      } catch {}

      // Initialize gamification (version simplifiée)
      const gamification = new SimpleGamificationEngine(authUser.id);
      setGamificationEngine(gamification);

      // Initialize learning analytics (version simplifiée)
      const analytics = new SimpleLearningAnalytics(authUser.id);
      setLearningAnalytics(analytics);

      // Initialize chatbot (version simplifiée)
      const bot = new SimpleEducationalChatbot(authUser.id);
      await bot.initialize();
      setChatbot(bot);

      // Update daily login streak and award points (version sécurisée)
      await gamification.updateStreak('daily_login');
      await gamification.awardPoints('daily_login');

    } catch (error) {
      console.error('Error initializing user session:', error);
    }
  }, []);

  const cleanupUserSession = useCallback(() => {
    setUser(null);
    setUserProfile(null);
    setGamificationEngine(null);
    setLearningAnalytics(null);
    setChatbot(null);
  }, []);

  const handleSession = useCallback(async (session) => {
    setSession(session);
    if (session?.user) {
      await initializeUserSession(session.user);
    } else {
      cleanupUserSession();
    }
    setLoading(false);
  }, [initializeUserSession, cleanupUserSession]);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      handleSession(session);
    };

    getSession();

    // Initialiser l'IA Contextuelle avec la clé Gemini
    const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (geminiApiKey) {
      initializeContextualAI(geminiApiKey);
      console.log('🤖 [App] Assistant IA Contextuel initialisé avec Gemini');
    } else {
      console.warn('⚠️ [App] VITE_GEMINI_API_KEY manquante - Assistant IA non disponible');
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        handleSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, [handleSession]);

  const signUp = useCallback(async (email, password, options) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Inscription échouée",
        description: error.message || "Une erreur s'est produite",
      });
    } else if (data.user) {
      // Le profil et les points sont créés automatiquement par le trigger handle_new_user()
      // On attend juste un peu pour s'assurer que le trigger a fini
      await new Promise(resolve => setTimeout(resolve, 1000));

      try {
        // Mettre à jour le profil avec les données supplémentaires si fournies
        if (options?.data) {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              full_name: options.data.full_name || '',
              level: options.data.class_level || '',
              parcours: options.data.parcours || ''
            })
            .eq('id', data.user.id);

          if (updateError) {
            console.warn('Erreur mise à jour profil (non bloquant):', updateError);
          }
        }

        // Attribuer les points de bienvenue
        const gamification = new SimpleGamificationEngine(data.user.id);
        await gamification.awardPoints('profile_completed');
        
        toast({
          title: "Bienvenue sur E-Réussite ! 🎉",
          description: "Votre compte a été créé avec succès. Vérifiez votre email pour confirmer votre inscription.",
        });
      } catch (profileError) {
        console.error('Error updating user profile:', profileError);
      }
    }

    return { data, error };
  }, [toast]);

  const signIn = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Connexion échouée",
        description: error.message || "Email ou mot de passe incorrect",
      });
    } else {
      toast({
        title: "Bon retour ! 👋",
        description: "Vous êtes maintenant connecté(e).",
      });
    }

    return { data, error };
  }, [toast]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast({
        variant: "destructive",
        title: "Déconnexion échouée",
        description: error.message || "Une erreur s'est produite",
      });
    } else {
      cleanupUserSession();
      toast({
        title: "À bientôt ! 👋",
        description: "Vous avez été déconnecté(e) avec succès.",
      });
    }

    return { error };
  }, [toast, cleanupUserSession]);

  const resetPassword = useCallback(async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible d'envoyer l'email de réinitialisation",
      });
    } else {
      toast({
        title: "Email envoyé ! 📧",
        description: "Vérifiez votre boîte mail pour réinitialiser votre mot de passe.",
      });
    }
    
    return { data, error };
  }, [toast]);

  const updatePassword = useCallback(async (password) => {
    const { data, error } = await supabase.auth.updateUser({
      password,
    });
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour le mot de passe",
      });
    } else {
      toast({
        title: "Mot de passe mis à jour ! ✅",
        description: "Votre nouveau mot de passe a été enregistré.",
      });
    }
    
    return { data, error };
  }, [toast]);

  const updateProfile = useCallback(async (updates) => {
    try {
      if (!user) throw new Error('Aucun utilisateur connecté');
      
      const result = await dbHelpersOld.profile.updateProfile(user.id, updates);
      
      if (result.error) throw result.error;
      
      setUserProfile(result.data);
      
      toast({
        title: "Profil mis à jour ! ✅",
        description: "Vos informations ont été sauvegardées.",
      });
      
      return { data: result.data, error: null };
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur de mise à jour",
        description: error.message || "Impossible de mettre à jour le profil",
      });
      return { data: null, error };
    }
  }, [user, toast]);

  // Enhanced features methods
  const awardPoints = useCallback(async (action, metadata = {}) => {
    if (gamificationEngine) {
      const result = await gamificationEngine.awardPoints(action, metadata);
      if (result && result.newBadges?.length > 0) {
        toast({
          title: "🏆 Nouveau badge débloqué !",
          description: `Félicitations ! Vous avez gagné : ${result.newBadges[0].badges.name}`,
        });
      }
      return result;
    }
    return null;
  }, [gamificationEngine, toast]);

  const getGamificationStatus = useCallback(async () => {
    if (gamificationEngine) {
      return await gamificationEngine.getGamificationStatus();
    }
    return null;
  }, [gamificationEngine]);

  const getLearningRecommendations = useCallback(async () => {
    if (learningAnalytics) {
      const analysis = await learningAnalytics.analyzePerformance();
      return analysis.recommendations;
    }
    return [];
  }, [learningAnalytics]);

  const sendChatMessage = useCallback(async (message, context = {}) => {
    if (chatbot) {
      return await chatbot.sendMessage(message, context);
    }
    return null;
  }, [chatbot]);

  const trackStudySession = useCallback(async (subjectId, duration, activities = []) => {
    if (gamificationEngine && user) {
      try {
        // Award points based on study duration
        if (duration >= 1800) { // 30 minutes
          await awardPoints('study_session_30min');
        }
        if (duration >= 3600) { // 60 minutes
          await awardPoints('study_session_60min');
        }
        if (duration >= 7200) { // 120 minutes
          await awardPoints('study_session_120min');
        }

        // Log activity
        await dbHelpersOld.activity.logActivity(user.id, 'study_session', {
          subject_id: subjectId,
          duration,
          activities
        });

        return true;
      } catch (error) {
        console.error('Error tracking study session:', error);
        return false;
      }
    }
    return false;
  }, [gamificationEngine, user, awardPoints]);

  const completeLesson = useCallback(async (leconId, lessonData = {}) => {
    if (gamificationEngine && user) {
      try {
        // Mark lesson as complete
        await dbHelpersOld.progress.completeLecon(user.id, leconId);

        // Award points
        await awardPoints('lesson_completed', lessonData);

        return true;
      } catch (error) {
        console.error('Error completing lesson:', error);
        return false;
      }
    }
    return false;
  }, [gamificationEngine, user, awardPoints]);

  const completeQuiz = useCallback(async (quizId, score, answers = [], timeSpent = 0) => {
    if (!user) return false;

    try {
      console.log('[completeQuiz] Starting - User:', user.id, 'Score:', score, 'Quiz:', quizId);
      
      // ✅ CORRECTION: Sauvegarder avec tous les détails (score = correctAnswers ici)
      const correctAnswers = score; // score est le nombre de bonnes réponses dans Quiz.jsx
      const totalQuestions = answers.length || 0;
      const scorePercentage = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
      
      // Save quiz result avec tous les paramètres
      await dbHelpersOld.quiz.saveQuizResult(
        user.id, 
        quizId, 
        scorePercentage, // Score en %
        correctAnswers,  // Nombre de bonnes réponses
        totalQuestions,  // Nombre total de questions
        timeSpent,       // Temps passé en secondes
        answers          // Tableau détaillé des réponses (avec question_text, correct_answer, etc.)
      );
      console.log('[completeQuiz] Quiz result saved with full details');

      // Calculate points based on performance
      let points = 0;
      if (scorePercentage === 100) {
        points = 100; // Perfect score
      } else if (scorePercentage >= 80) {
        points = 80; // Great score
      } else if (scorePercentage >= 60) {
        points = 50; // Good score
      } else if (scorePercentage >= 40) {
        points = 30; // Passing score
      } else {
        points = 10; // Participation points
      }
      console.log('[completeQuiz] Points to award:', points);

      // Award points (automatically updates level via DB trigger)
      const pointsResult = await dbHelpers.awardPoints(user.id, points, 'quiz_completion');
      console.log('[completeQuiz] Points awarded:', pointsResult);
      
      // Get previous level before checking new level
      const previousLevel = pointsResult.previous_level || Math.floor((pointsResult.previous_points || 0) / 100) + 1;

      // Update streak
      const streakResult = await dbHelpers.updateStreak(user.id);
      console.log('[completeQuiz] Streak updated:', streakResult);

      // Check for badge eligibility
      let badgesAwarded = [];
      
      if (score === 100) {
        // Perfect score badge
        console.log('[completeQuiz] Awarding perfect score badge');
        const badgeResult = await dbHelpers.awardBadge(user.id, {
          name: 'Quiz Parfait',
          type: 'perfect_score',
          description: 'Score de 100% sur un quiz',
          icon: '🏆',
          condition_value: 100
        });
        console.log('[completeQuiz] Badge result:', badgeResult);
        
        if (badgeResult && !badgeResult.error) {
          badgesAwarded.push({ type: 'perfect_score', metadata: { points } });
        }
      }

      // Check for streak badges
      if (streakResult) {
        const currentStreak = streakResult.current_streak || 0;
        
        if (currentStreak === 3) {
          const streakBadge = await dbHelpers.awardBadge(user.id, {
            name: 'Série de 3 jours',
            type: 'streak_3',
            description: '3 jours consécutifs d\'activité',
            icon: '🔥',
            condition_value: 3
          });
          if (streakBadge && !streakBadge.error) {
            badgesAwarded.push({ type: 'streak_3', metadata: { streak: 3 } });
          }
        } else if (currentStreak === 7) {
          const streakBadge = await dbHelpers.awardBadge(user.id, {
            name: 'Série de 7 jours',
            type: 'streak_7',
            description: '7 jours consécutifs d\'activité',
            icon: '🔥',
            condition_value: 7
          });
          if (streakBadge && !streakBadge.error) {
            badgesAwarded.push({ type: 'streak_7', metadata: { streak: 7 } });
          }
        } else if (currentStreak === 30) {
          const streakBadge = await dbHelpers.awardBadge(user.id, {
            name: 'Série de 30 jours',
            type: 'streak_30',
            description: '30 jours consécutifs d\'activité',
            icon: '🔥',
            condition_value: 30
          });
          if (streakBadge && !streakBadge.error) {
            badgesAwarded.push({ type: 'streak_30', metadata: { streak: 30 } });
          }
        }
      }

      // Check for quiz completion milestone badges
      const userPoints = await dbHelpers.getUserPoints(user.id);
      console.log('[completeQuiz] User points data:', userPoints);
      
      if (userPoints) {
        const quizzesCompleted = userPoints.quizzes_completed;
        const newLevel = userPoints.level;
        console.log('[completeQuiz] Quizzes completed:', quizzesCompleted);
        
        if (quizzesCompleted === 1) {
          const firstBadge = await dbHelpers.awardBadge(user.id, {
            name: 'Premier Quiz',
            type: 'first_quiz',
            description: 'Premier quiz complété',
            icon: '🎯',
            condition_value: 1
          });
          if (firstBadge && !firstBadge.error) {
            badgesAwarded.push({ type: 'first_quiz', metadata: {} });
          }
        } else if (quizzesCompleted === 10) {
          const badge10 = await dbHelpers.awardBadge(user.id, {
            name: 'Maître des Quiz',
            type: 'quiz_master_10',
            description: '10 quiz complétés',
            icon: '🏆',
            condition_value: 10
          });
          if (badge10 && !badge10.error) {
            badgesAwarded.push({ type: 'quiz_master_10', metadata: {} });
          }
        } else if (quizzesCompleted === 50) {
          const badge50 = await dbHelpers.awardBadge(user.id, {
            name: 'Expert Absolu',
            type: 'quiz_master_50',
            description: '50 quiz complétés',
            icon: '�',
            condition_value: 50
          });
          if (badge50 && !badge50.error) {
            badgesAwarded.push({ type: 'quiz_master_50', metadata: {} });
          }
        }
        
        // Check for level up
        if (newLevel > previousLevel) {
          badgesAwarded.push({ 
            type: 'level_up', 
            metadata: { level: newLevel, points: userPoints.total_points } 
          });
        }
      }

      // Show toast notifications for points
      sonnerToast.success(`🎉 +${points} points !`, {
        description: `Score: ${score}% | Total: ${pointsResult.new_points || 0} points`,
        duration: 3000,
      });

      // Show toast notifications for each badge with a small delay between each
      badgesAwarded.forEach((badge, index) => {
        setTimeout(() => {
          if (badge.type === 'level_up') {
            sonnerToast(
              <LevelUpToastContent 
                level={badge.metadata.level} 
                points={badge.metadata.points} 
              />,
              {
                duration: 6000,
                className: 'border-2 border-purple-500',
              }
            );
          } else {
            sonnerToast(
              <BadgeToastContent 
                badgeType={badge.type} 
                metadata={badge.metadata} 
              />,
              {
                duration: 5000,
                className: 'border-2 border-primary',
              }
            );
          }
        }, index * 800); // Delay each toast by 800ms
      });

      // ============================================
      // UPDATE CHALLENGE PROGRESS
      // ============================================
      try {
        // Update challenge progress for quiz completion
        await dbHelpers.updateChallengeProgress(
          user.id,
          'quiz_complete',
          1, // 1 quiz completed
          { quiz_id: quizId, score: score }
        );

        // Update challenge progress for points earned
        await dbHelpers.updateChallengeProgress(
          user.id,
          'points_earned',
          points,
          { quiz_id: quizId, score: score, points: points }
        );

        console.log('[completeQuiz] Challenge progress updated');
      } catch (challengeError) {
        console.error('[completeQuiz] Error updating challenges:', challengeError);
        // Don't fail the whole operation if challenges update fails
      }

      return true;
    } catch (error) {
      console.error('Error completing quiz:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le résultat du quiz",
        variant: "destructive",
      });
      return false;
    }
  }, [user, toast]);

  const refreshProfile = useCallback(async () => {
    if (user) {
      const result = await dbHelpersOld.profile.getProfile(user.id);
      if (result.data) {
        setUserProfile(result.data);
      }
    }
  }, [user]);

  const value = useMemo(() => ({
    // Basic auth
    user,
    userProfile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,

    // Enhanced features
    gamificationEngine,
    learningAnalytics,
    chatbot,
    awardPoints,
    getGamificationStatus,
    getLearningRecommendations,
    sendChatMessage,
    trackStudySession,
    completeLesson,
    completeQuiz,
    refreshProfile
  }), [
    user, userProfile, session, loading,
    signUp, signIn, signOut, resetPassword, updatePassword, updateProfile,
    gamificationEngine, learningAnalytics, chatbot,
    awardPoints, getGamificationStatus, getLearningRecommendations,
    sendChatMessage, trackStudySession, completeLesson, completeQuiz,
    refreshProfile
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
