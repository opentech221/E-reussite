import React, { useEffect, useState, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, Award, TrendingUp, Target, Sigma, Atom, Feather, Footprints, 
  Timer, AlertTriangle, Trophy, Sparkles, MessageSquare, Clock, Calendar,
  BarChart3, Activity, Star, Flame, Brain, Zap, BookMarked, Users, User, ChevronRight, LayoutDashboard
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PointsChart from '@/components/PointsChart';
import Challenges from '@/components/Challenges';
import NotificationManager from '@/components/NotificationManager';
import NotificationPermissionModal from '@/components/NotificationPermissionModal';
import { supabase } from '../lib/customSupabaseClient';
import { useSubscription } from '@/hooks/useSubscription';
import TrialCountdownBadge from '@/components/TrialCountdownBadge';
import StreakBadge from '@/components/StreakBadge';
import StatCard from '@/components/charts/StatCard';
import DonutChart from '@/components/charts/DonutChart';
import StudyTimeBarChart from '@/components/charts/StudyTimeBarChart';
import StreakAreaChart from '@/components/charts/StreakAreaChart';
import PeriodFilter from '@/components/charts/PeriodFilter';
import ChartSkeleton from '@/components/charts/ChartSkeleton';
import ExportDashboardPDF from '@/components/ExportDashboardPDF';
import { 
  trackDashboardVisit, 
  trackPeriodChange, 
  trackChartView, 
  trackExportPDF,
  trackButtonClick,
  trackSessionStart,
  trackSessionEnd
} from '@/lib/analytics';

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Format timestamp to relative time (ex: "Il y a 2h30", "Il y a 3 jours")
 */
const getRelativeTime = (timestamp) => {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now - past;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) {
    return "À l'instant";
  } else if (diffMin < 60) {
    return `Il y a ${diffMin} min`;
  } else if (diffHour < 24) {
    const mins = diffMin % 60;
    if (mins > 0) {
      return `Il y a ${diffHour}h${mins.toString().padStart(2, '0')}`;
    }
    return `Il y a ${diffHour}h`;
  } else if (diffDay < 7) {
    return `Il y a ${diffDay} jour${diffDay > 1 ? 's' : ''}`;
  } else if (diffDay < 30) {
    const weeks = Math.floor(diffDay / 7);
    return `Il y a ${weeks} semaine${weeks > 1 ? 's' : ''}`;
  } else if (diffDay < 365) {
    const months = Math.floor(diffDay / 30);
    return `Il y a ${months} mois`;
  } else {
    const years = Math.floor(diffDay / 365);
    return `Il y a ${years} an${years > 1 ? 's' : ''}`;
  }
};

const badgeIcons = { Sigma, Atom, Feather, Footprints, Timer, Award, Trophy, Star, Brain };

// Helper function to map matiere names to icons
const getMatiereIcon = (matiereName) => {
  const iconMap = {
    'Mathématiques': 'Sigma',
    'Français': 'Feather',
    'Physique-Chimie': 'Atom',
    'SVT': 'Footprints',
    'Histoire-Géographie': 'BookMarked',
    'Anglais': 'MessageSquare',
    'Philosophie': 'Brain'
  };
  
  for (const [key, value] of Object.entries(iconMap)) {
    if (matiereName.includes(key)) {
      return value;
    }
  }
  return 'BookOpen';
};

// Helper function to map matiere names to colors
const getMatiereColor = (matiereName) => {
  const colorMap = {
    'Mathématiques': 'blue',
    'Français': 'green',
    'Physique-Chimie': 'purple',
    'SVT': 'emerald',
    'Histoire-Géographie': 'orange',
    'Anglais': 'pink',
    'Philosophie': 'violet'
  };
  
  for (const [key, value] of Object.entries(colorMap)) {
    if (matiereName.includes(key)) {
      return value;
    }
  }
  return 'gray';
};

// Calculate subject progress from database
const calculateSubjectProgress = async (userId, userLevel) => {
  try {
    console.log('🔍 [calculateSubjectProgress] DÉBUT - userId:', userId, 'userLevel:', userLevel);
    
  // Mapping niveau entier -> texte pour matieres
  const levelMap = { 1: 'bfem', 2: 'bac' };
  const levelToUse = levelMap[userLevel] || 'bfem';
  console.log('📚 calculateSubjectProgress - User Level:', userLevel, '→ Utilisé pour matieres:', levelToUse);
    
    // ✅ Requête Supabase directe pour récupérer les matières
    const { data: matieres, error: matieresError } = await supabase
      .from('matieres')
      .select('id, name')
      .eq('level', levelToUse);

    console.log('🔍 [calculateSubjectProgress] Matières récupérées:', matieres);
    console.log('🔍 [calculateSubjectProgress] Erreur matières:', matieresError);

    if (matieresError) {
      console.error('❌ Error fetching matieres:', matieresError);
      return [];
    }

    if (!matieres || matieres.length === 0) {
      console.warn(`⚠️ No matieres found for level: "${levelToUse}"`);
      return [];
    }

    console.log(`✅ Found ${matieres.length} matieres for level "${levelToUse}"`);

    // Calculate progress for each matiere
    const progressPromises = matieres.map(async (matiere) => {
      try {
        console.log(`📚 [${matiere.name}] Début calcul progression...`);
        
        // ✅ Récupérer tous les chapitres pour cette matière
        const { data: allChapitres, error: chapitresError } = await supabase
          .from('chapitres')
          .select('id, title')
          .eq('matiere_id', matiere.id);
        
        console.log(`📚 [${matiere.name}] Chapitres trouvés:`, allChapitres?.length || 0);
        
        const matiereData = {
          name: matiere.name.replace(' BFEM', '').replace(' BAC', ''),
          progress: 0,
          score: 0,
          icon: getMatiereIcon(matiere.name),
          color: getMatiereColor(matiere.name)
        };

        if (!allChapitres || allChapitres.length === 0) {
          return matiereData;
        }

        const totalChapitres = allChapitres.length;

        // ✅ Une seule requête pour récupérer les chapitres complétés (au lieu d'une boucle)
        const { data: completedChapitres, error: progressError } = await supabase
          .from('user_progress')
          .select('chapitre_id')
          .eq('user_id', userId)
          .eq('completed', true)
          .in('chapitre_id', allChapitres.map(c => c.id));
        
        const completedCount = completedChapitres?.length || 0;
        const progressPercentage = totalChapitres > 0 ? Math.round((completedCount / totalChapitres) * 100) : 0;
        
        console.log(`📚 [${matiere.name}] RÉSULTAT: ${completedCount}/${totalChapitres} = ${progressPercentage}%`);

        // ✅ Calculer la moyenne des scores (quiz + examens pour cette matière)
        let averageScore = 0;
        try {
          // Récupérer les IDs des chapitres de cette matière
          const chapitreIds = allChapitres.map(c => c.id);
          
          // Récupérer les quiz de ces chapitres
          const { data: matiereQuizzes } = await supabase
            .from('quiz')
            .select('id')
            .in('chapitre_id', chapitreIds);
          
          const matiereQuizIds = matiereQuizzes?.map(q => q.id) || [];
          
          // Récupérer les scores des quiz de l'utilisateur pour cette matière
          let matiereQuizScores = [];
          if (matiereQuizIds.length > 0) {
            const { data: quizScores } = await supabase
              .from('quiz_results')
              .select('score')
              .eq('user_id', userId)
              .in('quiz_id', matiereQuizIds);
            
            matiereQuizScores = quizScores || [];
          }
          
          // Récupérer les scores des examens pour cette matière
          const { data: matiereExams } = await supabase
            .from('examens')
            .select('id')
            .eq('matiere_id', matiere.id);
          
          const matiereExamIds = matiereExams?.map(e => e.id) || [];
          
          let matiereExamScores = [];
          if (matiereExamIds.length > 0) {
            const { data: examScores } = await supabase
              .from('exam_results')
              .select('score')
              .eq('user_id', userId)
              .in('exam_id', matiereExamIds);
            
            matiereExamScores = examScores || [];
          }
          
          // Calculer la moyenne
          const allScores = [
            ...(matiereQuizScores?.map(q => q.score) || []),
            ...(matiereExamScores?.map(e => e.score) || [])
          ];
          
          if (allScores.length > 0) {
            averageScore = Math.round(allScores.reduce((sum, score) => sum + score, 0) / allScores.length);
          }
          
          console.log(`📊 [${matiere.name}] Score moyen: ${averageScore}% (${allScores.length} évaluation(s))`);
        } catch (error) {
          console.error(`❌ Erreur calcul score pour ${matiere.name}:`, error);
        }

        return {
          ...matiereData,
          progress: progressPercentage,
          score: averageScore
        };
      } catch (error) {
        console.error(`❌ Error calculating progress for matiere ${matiere.name}:`, error);
        return {
          name: matiere.name.replace(' BFEM', '').replace(' BAC', ''),
          progress: 0,
          score: 0,
          icon: getMatiereIcon(matiere.name),
          color: getMatiereColor(matiere.name)
        };
      }
    });

    const subjectProgress = await Promise.all(progressPromises);
    console.log('🔍 [calculateSubjectProgress] RÉSULTAT FINAL:', subjectProgress);
    console.log('🔍 [calculateSubjectProgress] Nombre de matières dans le résultat:', subjectProgress.length);
    
    return subjectProgress.sort((a, b) => b.progress - a.progress);
  } catch (error) {
    console.error('❌ [calculateSubjectProgress] ERREUR:', error);
    return [];
  }
};

// Get upcoming events from database
const getUpcomingEvents = async () => {
  try {
    const { default: dbHelpers } = await import('@/lib/supabaseDB');
    
    const events = [];
    
    // Get active challenges
    const { data: challenges } = await dbHelpers.gamification.getActiveChallenges();
    if (challenges && challenges.length > 0) {
      challenges.forEach(challenge => {
        events.push({
          title: challenge.name,
          date: challenge.end_date,
          type: 'challenge',
          description: challenge.description
        });
      });
    }

    // Get upcoming exams (simulations)
    const { data: exams } = await dbHelpers.exam.getExams();
    if (exams && exams.length > 0) {
      // Add first 2 exams as upcoming
      exams.slice(0, 2).forEach(exam => {
        events.push({
          title: exam.title,
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
          type: 'exam',
          description: `Durée: ${exam.duration_minutes} minutes`
        });
      });
    }

    // Sort by date
    events.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return events.slice(0, 3);
  } catch (error) {
    console.error('Error getting upcoming events:', error);
    return [];
  }
};

// Get user exam statistics
const getUserExamStats = async (userId) => {
  try {
    console.log('📊 [getUserExamStats] Récupération stats examens pour:', userId);
    
    // Récupérer tous les résultats d'examens de l'utilisateur
    const { data: examResults, error } = await supabase
      .from('exam_results')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });

    if (error) {
      console.error('❌ [getUserExamStats] Erreur:', error);
      return {
        totalExams: 0,
        averageScore: 0,
        bestScore: 0,
        totalTime: 0,
        recentExams: []
      };
    }

    console.log('✅ [getUserExamStats] Résultats récupérés:', examResults?.length || 0);

    const totalExams = examResults?.length || 0;
    const averageScore = totalExams > 0 
      ? Math.round(examResults.reduce((sum, r) => sum + r.score, 0) / totalExams)
      : 0;
    const bestScore = totalExams > 0
      ? Math.max(...examResults.map(r => r.score))
      : 0;
    const totalTime = examResults?.reduce((sum, r) => sum + (r.time_taken || 0), 0) || 0;

    // Récupérer les 5 examens les plus récents avec les détails
    const recentExams = [];
    if (examResults && examResults.length > 0) {
      for (const result of examResults.slice(0, 5)) {
        const { data: exam } = await supabase
          .from('examens')
          .select('title, type, difficulty')
          .eq('id', result.exam_id)
          .single();

        if (exam) {
          recentExams.push({
            id: result.id,
            title: exam.title,
            score: result.score,
            type: exam.type,
            difficulty: exam.difficulty,
            time_taken: result.time_taken,
            completed_at: result.completed_at
          });
        }
      }
    }

    console.log('✅ [getUserExamStats] Stats:', { totalExams, averageScore, bestScore, totalTime });

    return {
      totalExams,
      averageScore,
      bestScore,
      totalTime,
      recentExams
    };
  } catch (error) {
    console.error('❌ [getUserExamStats] Exception:', error);
    return {
      totalExams: 0,
      averageScore: 0,
      bestScore: 0,
      totalTime: 0,
      recentExams: []
    };
  }
};

// Calculate study analytics from progress data
const calculateStudyAnalytics = async (userId, progressData) => {
  try {
    const { default: dbHelpers } = await import('@/lib/supabaseDB');
    
    // Get last 7 days of activity
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { data: recentProgress } = await dbHelpers.progress.getUserProgress(userId, {
      from_date: sevenDaysAgo.toISOString()
    });

    // Calculate daily study time (last 7 days)
    const dailyStudyTime = Array(7).fill(0);
    if (recentProgress && recentProgress.length > 0) {
      recentProgress.forEach(progress => {
        const dayIndex = 6 - Math.floor((Date.now() - new Date(progress.last_accessed_at)) / (1000 * 60 * 60 * 24));
        if (dayIndex >= 0 && dayIndex < 7) {
          dailyStudyTime[dayIndex] += (progress.time_spent || 30) / 60; // Convert to hours
        }
      });
    }

    // Get last 7 quiz attempts for performance trend
    const { data: recentQuizzes } = await dbHelpers.quiz.getUserQuizResults(userId);
    const performanceTrend = recentQuizzes && recentQuizzes.length > 0
      ? recentQuizzes.slice(0, 7).reverse().map(q => q.score)
      : [0];

    // Calculate favorite study time (placeholder - would need activity_logs table)
    const favoriteStudyTime = '18:00-20:00';
    
    // Calculate most productive day (placeholder)
    const daysOfWeek = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const maxStudyDay = dailyStudyTime.indexOf(Math.max(...dailyStudyTime));
    const mostProductiveDay = daysOfWeek[maxStudyDay] || 'Mardi';

    return {
      dailyStudyTime,
      performanceTrend,
      favoriteStudyTime,
      mostProductiveDay
    };
  } catch (error) {
    console.error('Error calculating study analytics:', error);
    return {
      dailyStudyTime: [0, 0, 0, 0, 0, 0, 0],
      performanceTrend: [0],
      favoriteStudyTime: '18:00-20:00',
      mostProductiveDay: 'Mardi'
    };
  }
};

const Dashboard = () => {
  const { user, userProfile, loading: authLoading, getGamificationStatus, getLearningRecommendations } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const dashboardRef = useRef(null); // Ref pour export PDF
  const [dashboardData, setDashboardData] = useState(null);
  const [gamificationData, setGamificationData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userPoints, setUserPoints] = useState(null);
  const [userBadges, setUserBadges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [pointsHistory, setPointsHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [challenges, setChallenges] = useState([]);
  const [challengesLoading, setChallengesLoading] = useState(false);
  const [examStats, setExamStats] = useState(null);
  
  // États pour les graphiques
  const [period, setPeriod] = useState(7); // Période par défaut: 7 jours
  const [matiereDistribution, setMatiereDistribution] = useState([]);
  const [dailyStudyTime, setDailyStudyTime] = useState([]);
  const [streakHistory, setStreakHistory] = useState([]);
  const [chartsLoading, setChartsLoading] = useState(false);

  // Handler pour le changement de période avec analytics
  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    const userId = user?.id || user?.email || 'anonymous';
    trackPeriodChange(newPeriod, userId);
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }

    if (user && userProfile) {
      fetchDashboardData();
      
      // 📊 Analytics: Dashboard visit tracking
      const userId = user?.id || user?.email || 'anonymous';
      trackDashboardVisit(userId, 'overview');
      
      // Session tracking
      const sessionStart = Date.now();
      trackSessionStart(userId);
      
      // Track session end on unmount
      return () => {
        const sessionDuration = Math.floor((Date.now() - sessionStart) / 1000);
        trackSessionEnd(userId, sessionDuration);
      };
    }
  }, [user, userProfile, authLoading, navigate]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Get gamification status
      const gamification = await getGamificationStatus();
      setGamificationData(gamification);

      // Get learning recommendations
      const recs = await getLearningRecommendations();
      setRecommendations(recs);

      // Import database helpers
      const { default: dbHelpers } = await import('@/lib/supabaseDB');
      const { dbHelpers: dbHelpersNew } = await import('@/lib/supabaseHelpers');

      // Fetch gamification data
      const [pointsData, badgesData, leaderboardData] = await Promise.all([
        dbHelpersNew.getUserPoints(user.id),
        dbHelpersNew.getUserBadges(user.id),
        dbHelpersNew.getLeaderboard(10)
      ]);

      setUserPoints(pointsData);
      setUserBadges(badgesData || []);
      setLeaderboard(leaderboardData || []);
      
      // Fetch points history for graph (7 days by default)
      setHistoryLoading(true);
      const history = await dbHelpersNew.getUserPointsHistory(user.id, 7);
      setPointsHistory(history || []);
      setHistoryLoading(false);

      // Fetch and ensure user has challenges
      setChallengesLoading(true);
      const userChallenges = await dbHelpersNew.ensureUserHasChallenges(user.id);
      setChallenges(userChallenges || []);
      setChallengesLoading(false);

      // ✅ AJOUT: Récupérer les statistiques d'examens
      const userExamStats = await getUserExamStats(user.id);
      setExamStats(userExamStats);
      console.log('📊 [Dashboard] Stats examens:', userExamStats);

      // ✅ CORRECTION : Requêtes Supabase directes (tables quiz n'existent pas)
      const [progressData, userBadgesOld] = await Promise.all([
        supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id),
        supabase
          .from('user_badges')
          .select('*')
          .eq('user_id', user.id)
      ]);

      // Pas de quizResults car les tables n'existent pas
      // ✅ CORRIGÉ : Récupérer les vrais quiz_results
      const { data: quizResultsData } = await supabase
        .from('quiz_results')
        .select(`
          id,
          quiz_id,
          score,
          correct_answers,
          total_questions,
          time_taken,
          completed_at,
          quiz:quiz_id (
            id,
            title,
            chapitres:chapitre_id (
              matieres:matiere_id (name)
            )
          )
        `)
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(5);

      const quizResults = { data: quizResultsData || [] };

      // Calculate stats from real data
      const totalQuizzes = quizResultsData?.length || 0;
      
      // ✅ CORRIGÉ: Calculer la moyenne globale depuis quiz_results + exam_results
      let averageScore = 0;
      try {
        // Récupérer tous les scores de quiz
        const { data: allQuizScores } = await supabase
          .from('quiz_results')
          .select('score')
          .eq('user_id', user.id);
        
        // Récupérer tous les scores d'examens
        const { data: allExamScores } = await supabase
          .from('exam_results')
          .select('score')
          .eq('user_id', user.id);
        
        // Combiner tous les scores
        const allScores = [
          ...(allQuizScores?.map(q => q.score) || []),
          ...(allExamScores?.map(e => e.score) || [])
        ];
        
        // Calculer la moyenne
        if (allScores.length > 0) {
          averageScore = Math.round(allScores.reduce((sum, score) => sum + score, 0) / allScores.length);
        }
        
        console.log(`📊 [Dashboard] Moyenne globale: ${averageScore}% (${allScores.length} évaluation(s))`);
      } catch (error) {
        console.error('❌ Erreur calcul moyenne globale:', error);
      }

      const totalStudyTime = progressData.data?.reduce((sum, p) => {
        const timeSpent = p.time_spent || 0;
        // Si time_spent est 0 mais le chapitre est complété, estimer 30 minutes
        if (timeSpent === 0 && p.completed) {
          return sum + (30 * 60); // 30 minutes en secondes
        }
        return sum + timeSpent;
      }, 0) || 0;

      console.log('📊 [Dashboard] Total study time (secondes):', totalStudyTime);
      console.log('📊 [Dashboard] Total study time (heures):', (totalStudyTime / 3600).toFixed(1));

      const completedLessons = progressData.data?.filter(p => p.completed).length || 0;
      const uniqueChapitres = new Set(progressData.data?.map(p => p.lecon?.chapitre_id) || []);
      const coursesStarted = uniqueChapitres.size;

      // Recent activity from quiz results and progress
      const recentActivity = [];
      
      console.log('📊 [Activités récentes] progressData.data:', progressData.data?.length || 0, 'entrées');
      
      // ✅ AJOUT: Examens récemment complétés
      if (examStats && examStats.recentExams && examStats.recentExams.length > 0) {
        examStats.recentExams.slice(0, 3).forEach(exam => {
          const difficultyEmoji = {
            'facile': '🟢',
            'moyen': '🟡',
            'difficile': '🔴'
          }[exam.difficulty] || '⚪';

          recentActivity.push({
            id: `exam-${exam.id}`,
            type: 'exam_completed',
            title: `${difficultyEmoji} Examen: ${exam.title}`,
            score: exam.score,
            subject: exam.type === 'blanc' ? 'Examen blanc' : 'Examen de matière',
            timestamp: getRelativeTime(exam.completed_at),
            timestampDate: new Date(exam.completed_at),
            icon: 'Target'
          });
        });
      }
      
      // ✅ AJOUT: Chapitres récemment complétés
      if (progressData.data && progressData.data.length > 0) {
        const completedChapitres = progressData.data
          .filter(p => p.completed && p.completed_at)
          .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))
          .slice(0, 3); // Les 3 plus récents
        
        console.log('📊 [Activités récentes] Chapitres complétés filtrés:', completedChapitres.length);
        
        for (const progress of completedChapitres) {
          // Récupérer les infos du chapitre
          const { data: chapitre, error: chapitreError } = await supabase
            .from('chapitres')
            .select('title, matiere:matieres(name)')
            .eq('id', progress.chapitre_id)
            .single();
          
          console.log('📊 [Activités récentes] Chapitre récupéré:', chapitre?.title || 'Erreur', chapitreError);
          
          if (chapitre) {
            recentActivity.push({
              id: `chapitre-${progress.id}`,
              type: 'chapter_completed',
              title: `Chapitre complété: ${chapitre.title}`,
              subject: chapitre.matiere?.name || 'Matière',
              timestamp: getRelativeTime(progress.completed_at),
              timestampDate: new Date(progress.completed_at), // ✅ Pour le tri
              icon: 'BookOpen'
            });
          }
        }
      }
      
      // Add recent quizzes
      if (quizResults.data && quizResults.data.length > 0) {
        quizResults.data.slice(0, 3).forEach(quiz => {
          // ✅ Le score est déjà un pourcentage (DECIMAL dans quiz_results)
          const percentage = Math.round(quiz.score || 0);
          
          recentActivity.push({
            id: `quiz-${quiz.id}`,
            type: 'quiz_completed',
            title: `Quiz: ${quiz.quiz?.title || 'Quiz'}`,
            score: percentage,
            subject: quiz.quiz?.chapitres?.matieres?.name || 'Matière',
            timestamp: getRelativeTime(quiz.completed_at),
            timestampDate: new Date(quiz.completed_at),
            icon: 'Target'
          });
        });
      }

      // Add recent badges
      if (userBadges.data && userBadges.data.length > 0) {
        userBadges.data.slice(0, 2).forEach(badge => {
          recentActivity.push({
            id: badge.id,
            type: 'badge_earned',
            title: `Badge: ${badge.badge?.name || 'Badge'}`,
            description: badge.badge?.description || '',
            timestamp: getRelativeTime(badge.earned_at), // ✅ Format relatif avec heure
            timestampDate: new Date(badge.earned_at), // Pour le tri
            icon: 'Award'
          });
        });
      }

      // ✅ TRI: Mélanger toutes les activités par date (plus récentes en premier)
      recentActivity.sort((a, b) => {
        const dateA = a.timestampDate || new Date(0);
        const dateB = b.timestampDate || new Date(0);
        return dateB - dateA;
      });

      // Garder seulement les 5 plus récentes
      const sortedRecentActivity = recentActivity.slice(0, 5);
      
      console.log('📊 [Activités récentes] TOTAL après tri:', sortedRecentActivity.length, 'activités');
      console.log('📊 [Activités récentes] Types:', sortedRecentActivity.map(a => a.type));

      const mockData = {
        stats: {
          totalStudyTime: Math.round(totalStudyTime / 60), // Convertir secondes → minutes
          averageScore: parseFloat(averageScore) || 0,
          coursesStarted: coursesStarted,
          coursesCompleted: Math.floor(coursesStarted * 0.4), // Estimate 40% completion
          quizCompleted: totalQuizzes, // ✅ Changed from quizzesCompleted
          currentStreak: pointsData?.current_streak || 0, // ✅ CORRIGÉ: utilise pointsData depuis user_points
          weeklyGoal: 8, // hours
          weeklyProgress: parseFloat((totalStudyTime / 3600).toFixed(1)), // Convertir secondes → heures (total, pas par semaine)
          // ✅ AJOUT: Stats examens
          examsCompleted: examStats?.totalExams || 0,
          examAverageScore: examStats?.averageScore || 0,
          examBestScore: examStats?.bestScore || 0,
          examTotalTime: examStats?.totalTime || 0
        },
        recentActivity: sortedRecentActivity.length > 0 ? sortedRecentActivity : [
          { 
            id: 1, 
            type: 'lesson_started', 
            title: 'Commencez votre premier cours', 
            subject: 'E-Réussite',
            timestamp: 'Aujourd\'hui',
            icon: 'BookOpen'
          }
        ],
        subjectProgress: await calculateSubjectProgress(user.id, userProfile?.level),
        upcomingEvents: await getUpcomingEvents(),
        studyAnalytics: await calculateStudyAnalytics(user.id, progressData.data || [])
      };

      console.log('🎯 [Dashboard] mockData.subjectProgress:', mockData.subjectProgress);
      console.log('🎯 [Dashboard] Nombre de matières:', mockData.subjectProgress?.length);

      setDashboardData(mockData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        variant: "destructive",
        title: "Erreur de chargement",
        description: "Impossible de charger les données du tableau de bord"
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch data for chart components based on period
   */
  const fetchChartData = async () => {
    if (!user) return;

    setChartsLoading(true);
    try {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - period);

      // 1. Répartition par matière (Donut Chart)
      const { data: progressData } = await supabase
        .from('user_progress')
        .select(`
          time_spent,
          lecons:lecon_id (
            chapitres:chapitre_id (
              matieres:matiere_id (
                name,
                color
              )
            )
          )
        `)
        .eq('user_id', user.id)
        .gte('updated_at', daysAgo.toISOString());

      // Aggréger par matière
      const matiereMap = {};
      progressData?.forEach(p => {
        const matiereName = p.lecons?.chapitres?.matieres?.name || 'Autre';
        const matiereColor = p.lecons?.chapitres?.matieres?.color || '#6B7280';
        if (!matiereMap[matiereName]) {
          matiereMap[matiereName] = { name: matiereName, value: 0, color: matiereColor };
        }
        matiereMap[matiereName].value += Math.round((p.time_spent || 0) / 3600); // Convertir en heures
      });

      const matiereChartData = Object.values(matiereMap).filter(m => m.value > 0);
      setMatiereDistribution(matiereChartData);

      // 2. Temps quotidien (Bar Chart)
      const dailyMap = {};
      const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
      
      progressData?.forEach(p => {
        const date = new Date(p.updated_at);
        const dayKey = date.toLocaleDateString('fr-FR');
        if (!dailyMap[dayKey]) {
          dailyMap[dayKey] = {
            day: dayNames[date.getDay()],
            date: date,
            minutes: 0
          };
        }
        dailyMap[dayKey].minutes += Math.round((p.time_spent || 0) / 60);
      });

      const dailyChartData = Object.values(dailyMap)
        .sort((a, b) => a.date - b.date)
        .map(d => ({ day: d.day, minutes: d.minutes }));

      setDailyStudyTime(dailyChartData);

      // 3. Streak history (Area Chart) - Données réelles depuis streak_history
      const { data: streakHistoryData } = await supabase
        .from('streak_history')
        .select('date, streak_value')
        .eq('user_id', user.id)
        .gte('date', daysAgo.toISOString().split('T')[0])
        .order('date', { ascending: true });

      const streakData = (streakHistoryData || []).map(s => ({
        date: new Date(s.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
        streak: s.streak_value
      }));

      setStreakHistory(streakData);

    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setChartsLoading(false);
    }
  };

  // Refetch chart data when period changes
  useEffect(() => {
    if (user && userPoints) {
      fetchChartData();
      
      // 📊 Analytics: Track chart views when data is loaded
      const userId = user?.id || user?.email || 'anonymous';
      if (matiereDistribution?.length > 0) trackChartView('donut', userId);
      if (dailyStudyTime?.length > 0) trackChartView('bar', userId);
      if (streakHistory?.length > 0) trackChartView('area', userId);
    }
  }, [period, user, userPoints]);

  const handleAction = (description) => {
    toast({
      title: "🚧 Bientôt disponible",
      description: `${description} 🚀`,
    });
  };

  /**
   * Réclamer les récompenses d'un défi complété
   */
  const handleClaimChallengeReward = async (challengeId) => {
    try {
      const { dbHelpers: dbHelpersNew } = await import('@/lib/supabaseHelpers');
      const result = await dbHelpersNew.claimChallengeRewards(user.id, challengeId);

      if (result.success) {
        toast({
          title: "🎉 Récompenses réclamées !",
          description: `Vous avez gagné ${result.reward_points} points !`,
        });

        // Mettre à jour l'état local immédiatement
        setChallenges(prevChallenges => 
          prevChallenges.map(challenge => 
            challenge.id === challengeId 
              ? { ...challenge, status: 'claimed', rewards_claimed: true }
              : challenge
          )
        );

        // Rafraîchir les données en arrière-plan
        fetchDashboardData();
      } else {
        throw new Error(result.error || 'Erreur lors de la réclamation');
      }
    } catch (error) {
      console.error('Error claiming challenge reward:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de réclamer les récompenses"
      });
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = userProfile?.full_name || user?.email?.split('@')[0] || 'Étudiant';
    
    if (hour < 12) return `Bonjour ${name} !`;
    if (hour < 18) return `Bon après-midi ${name} !`;
    return `Bonsoir ${name} !`;
  };

  if (authLoading || loading || !user || !dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Chargement de votre tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Tableau de bord - E-Réussite</title>
        <meta name="description" content="Votre tableau de bord E-Réussite - Suivez votre progression et accédez à vos cours." />
      </Helmet>

      {/* Notification Permission Modal - Appears after 2nd login */}
      <NotificationPermissionModal 
        userId={user?.id}
        loginCount={userProfile?.login_count || 0}
        userProfile={userProfile}
      />

      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Navbar />
        
        {/* Trial Countdown Badge - Visible pour les utilisateurs en essai ou expiré */}
        <TrialCountdownBadge />
        
        <main ref={dashboardRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-primary to-blue-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold mb-2">{getGreeting()}</h1>
                  <p className="text-blue-100 mb-4">
                    Continuez sur votre lancée ! Vous progressez excellemment.
                  </p>
                  
                  {/* Quick Stats */}
                  <div className="flex items-center gap-6 text-sm">
                    {/* Streak Badge - Animated with milestones */}
                    {userPoints && (
                      <StreakBadge 
                        currentStreak={userPoints.current_streak || 0}
                        longestStreak={userPoints.longest_streak || 0}
                        lastActivityDate={userPoints.last_activity_date}
                        variant="minimal"
                        showProgress={false}
                        className="scale-110"
                      />
                    )}
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-green-300" />
                      <span>{dashboardData.stats.averageScore}% de moyenne</span>
                    </div>
                  </div>
                </div>
                
                {/* Level Badge */}
                {userPoints && (
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-2">
                      <span className="text-2xl font-bold">{userPoints.level || 1}</span>
                    </div>
                    <p className="text-xs text-blue-100">Niveau {userPoints.level || 1}</p>
                    <p className="text-xs text-blue-200 font-semibold">{userPoints.total_points || 0} points</p>
                    
                    {/* Progress to next level */}
                    <div className="mt-2 w-24">
                      <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-yellow-300 transition-all duration-300"
                          style={{ 
                            width: `${Math.min(100, ((userPoints.total_points || 0) % 100))}%` 
                          }}
                        />
                      </div>
                      <p className="text-xs text-blue-100 mt-1">
                        {(userPoints.points_to_next_level || 100)} pts restants
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 overflow-x-auto scrollbar-hide gap-1">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Vue d'ensemble</span>
              </TabsTrigger>
              <TabsTrigger value="progress" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Progression</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Analytiques</span>
              </TabsTrigger>
              <TabsTrigger value="achievements" className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                <span className="hidden sm:inline">Succès</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* ✨ Statistics Grid - 4 KPI Cards avec StatCard component */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* KPI Card 1: Quiz Complétés */}
                <StatCard
                  title="Quiz complétés"
                  value={(userPoints?.quizzes_completed || dashboardData.stats.quizCompleted || 0).toString()}
                  change="+5 cette semaine"
                  changeType="increase"
                  icon={BookOpen}
                  color="blue"
                />
                
                {/* KPI Card 2: Temps d'Étude */}
                <StatCard
                  title="Temps d'étude"
                  value={`${Math.floor((dashboardData.stats.totalStudyTime || 0) / 60)}h${Math.floor(((dashboardData.stats.totalStudyTime || 0) % 60)).toString().padStart(2, '0')}`}
                  change="+2h30 vs semaine dernière"
                  changeType="increase"
                  icon={Clock}
                  color="green"
                />
                
                {/* KPI Card 3: Streak Actuel */}
                <StatCard
                  title="Streak actuel"
                  value={`${userPoints?.current_streak || dashboardData.stats.currentStreak || 0}j`}
                  change={(userPoints?.current_streak || dashboardData.stats.currentStreak || 0) > 0 ? "En feu ! 🔥" : "Commencer aujourd'hui"}
                  changeType={(userPoints?.current_streak || dashboardData.stats.currentStreak || 0) > 0 ? "increase" : "decrease"}
                  icon={Flame}
                  color="orange"
                />
                
                {/* KPI Card 4: Score Moyen */}
                <StatCard
                  title="Score moyen"
                  value={`${Math.round(dashboardData.stats.averageScore || 0)}%`}
                  change="+3.5% vs mois dernier"
                  changeType="increase"
                  icon={TrendingUp}
                  color="purple"
                />
              </div>

              {/* 📊 Filtre de période + Export PDF */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Statistiques détaillées
                </h2>
                <div className="flex items-center gap-3">
                  <ExportDashboardPDF 
                    dashboardRef={dashboardRef}
                    userName={userProfile?.full_name || user?.email?.split('@')[0] || 'Utilisateur'}
                    userId={user?.id || user?.email}
                  />
                  <PeriodFilter period={period} onPeriodChange={handlePeriodChange} />
                </div>
              </div>

              {/* 📊 Graphiques - Grid 2 colonnes */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Donut Chart - Répartition matières */}
                {chartsLoading ? (
                  <ChartSkeleton type="donut" />
                ) : (
                  <DonutChart
                    data={matiereDistribution}
                    title="Répartition par matière"
                    subtitle={`${period} derniers jours`}
                  />
                )}

                {/* Bar Chart - Temps quotidien */}
                {chartsLoading ? (
                  <ChartSkeleton type="bar" />
                ) : (
                  <StudyTimeBarChart
                    data={dailyStudyTime}
                    title="Temps d'étude quotidien"
                    subtitle={`${period} derniers jours`}
                  />
                )}
              </div>

              {/* 📉 Area Chart - Évolution streak (pleine largeur) */}
              {chartsLoading ? (
                <ChartSkeleton type="area" />
              ) : (
                <StreakAreaChart
                  data={streakHistory}
                  title="Évolution de votre streak"
                  subtitle={`${period} derniers jours`}
                />
              )}

              {/* ✅ AJOUT: Carte statistiques examens */}
              {examStats && examStats.totalExams > 0 && (
                <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-blue-50 dark:from-primary/10 dark:to-blue-950/20 dark:bg-slate-800 dark:border-white/30 shadow-[0_0_16px_0_rgba(34,197,94,0.18)] dark:shadow-[0_0_35px_rgba(34,197,94,0.25)]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-slate-100">
                      <Target className="w-5 h-5 text-primary" />
                      📝 Statistiques des Examens
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                        <p className="text-3xl font-bold text-primary">{examStats.totalExams}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Examens passés</p>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                        <p className="text-3xl font-bold text-green-600">{examStats.averageScore}%</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Score moyen</p>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                        <p className="text-3xl font-bold text-yellow-600">{examStats.bestScore}%</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Meilleur score</p>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                        <p className="text-3xl font-bold text-blue-600">{Math.floor(examStats.totalTime / 60)}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Minutes totales</p>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-center">
                      <Button 
                        onClick={() => navigate('/exam')}
                        className="gap-2"
                      >
                        <Target className="w-4 h-4" />
                        Passer un nouvel examen
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Progress and Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Subject Progress */}
                <div className="lg:col-span-2">
                  <Card className="dark:bg-slate-800 dark:border-white/20 border-2 shadow-[0_0_16px_0_rgba(34,197,94,0.18)] dark:shadow-[0_0_24px_0_rgba(34,197,94,0.25)]">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 dark:text-slate-100">
                        <BarChart3 className="w-5 h-5" />
                        Progression par matière
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {dashboardData.subjectProgress && dashboardData.subjectProgress.length > 0 ? (
                        dashboardData.subjectProgress.map((subject, index) => {
                          const IconComponent = badgeIcons[subject.icon] || BookOpen;
                          return (
                            <div key={index} className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-lg bg-${subject.color}-500/10 flex items-center justify-center`}>
                                <IconComponent className={`w-5 h-5 text-${subject.color}-600`} />
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="font-medium">{subject.name}</span>
                                  <span className="text-sm text-slate-600 dark:text-slate-300">{subject.progress}%</span>
                                </div>
                                <Progress value={subject.progress} className="h-2" />
                                <p className="text-xs text-slate-500 mt-1">
                                  {subject.score > 0 ? `Dernière note: ${subject.score}%` : 'Aucun quiz réalisé'}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-8 text-slate-500">
                          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p className="font-medium">Aucune matière disponible</p>
                          <p className="text-sm">Les matières apparaîtront ici une fois que vous commencerez vos cours</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <Card className="dark:bg-slate-800 dark:border-white/20 border-2 shadow-[0_0_16px_0_rgba(34,197,94,0.18)] dark:shadow-[0_0_24px_0_rgba(34,197,94,0.25)]">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2 dark:text-slate-100">
                      <Activity className="w-5 h-5" />
                      Activité récente
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/historique')}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Voir tout
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {dashboardData.recentActivity.map((activity, index) => {
                      const IconComponent = activity.icon === 'Target' ? Target : 
                                          activity.icon === 'BookOpen' ? BookOpen : Award;
                      
                      // Déterminer l'URL de navigation
                      const getActivityUrl = (activity) => {
                        if (activity.type === 'exam_completed') return '/exam';
                        if (activity.type === 'quiz_completed') return '/quiz';
                        if (activity.type === 'chapter_completed') return '/my-courses';
                        if (activity.type === 'badge_earned') return '/badges';
                        return '/historique';
                      };
                      
                      return (
                        <div 
                          key={index} 
                          className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
                          onClick={() => navigate(getActivityUrl(activity))}
                        >
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                            <IconComponent className="w-4 h-4 text-slate-600 dark:text-slate-300 group-hover:text-blue-600 transition-colors" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm group-hover:text-blue-600 transition-colors">{activity.title}</p>
                            {activity.score !== undefined && (
                              <p className={`text-xs font-semibold ${
                                activity.score >= 70 ? 'text-green-600' : 
                                activity.score >= 50 ? 'text-yellow-600' : 
                                'text-red-600'
                              }`}>
                                Score: {activity.score}%
                              </p>
                            )}
                            {activity.subject && (
                              <p className="text-xs text-slate-500">{activity.subject}</p>
                            )}
                            <p className="text-xs text-slate-400">{activity.timestamp}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>

              {/* Points Evolution Chart */}
              <PointsChart data={pointsHistory} loading={historyLoading} />

              {/* Push Notifications Manager */}
              {user && <NotificationManager userId={user.id} />}

              {/* Challenges Section */}
              <Challenges 
                challenges={challenges} 
                onClaimReward={handleClaimChallengeReward}
                loading={challengesLoading}
              />

              {/* Leaderboard */}
              {leaderboard.length > 0 && (
                <Card className="border-2 shadow-[0_0_16px_0_rgba(34,197,94,0.18)] dark:shadow-[0_0_24px_0_rgba(34,197,94,0.25)]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      <span className="text-slate-900 dark:text-green-300">Classement</span>
                      <span className="text-sm font-normal ml-auto px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/60 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700 shadow-sm">Top 10</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {leaderboard.map((player, index) => {
                        const isCurrentUser = player.user_id === user?.id;
                        const medals = ['🥇', '🥈', '🥉'];
                        return (
                          <div 
                            key={player.user_id} 
                            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                              isCurrentUser 
                                ? 'bg-primary/10 border-2 border-primary' 
                                : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-green-100 dark:border-green-900/40'
                            } shadow-[0_0_8px_0_rgba(34,197,94,0.10)] dark:shadow-[0_0_12px_0_rgba(34,197,94,0.18)]`}
                          >
                            <div className="w-8 text-center font-bold text-lg">
                              {index < 3 ? medals[index] : `#${index + 1}`}
                            </div>
                            <div className="flex-1 flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold">
                                {player.profiles?.full_name?.charAt(0)?.toUpperCase() || '?'}
                              </div>
                              <div className="flex-1">
                                <p className={`font-semibold ${isCurrentUser ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>
                                  {player.profiles?.full_name || 'Utilisateur'}
                                  {isCurrentUser && <span className="text-xs ml-2 text-primary">(Vous)</span>}
                                </p>
                                <p className="text-xs text-green-700 dark:text-green-300">
                                  <span className="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/60 border border-green-300 dark:border-green-700 mr-1">Niveau {player.level}</span>
                                  <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 border border-blue-300 dark:border-blue-700 mr-1">{player.quizzes_completed || 0} quiz</span>
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-lg text-yellow-600">
                                  {player.total_points}
                                </p>
                                <p className="text-xs text-slate-500">points</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-4 text-center">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate('/badges')}
                        className="gap-2"
                      >
                        <Trophy className="w-4 h-4" />
                        Voir tous les badges
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recommendations */}
              {recommendations.length > 0 && (
                <Card className="dark:bg-slate-800 dark:border-white/20 border-2 shadow-lg dark:shadow-[0_0_30px_rgba(255,255,255,0.4)]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-slate-100">
                      <Brain className="w-5 h-5" />
                      Recommandations personnalisées
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {recommendations.slice(0, 4).map((rec, index) => (
                        <div key={index} className="p-4 bg-slate-50 dark:bg-slate-800 dark:border-white/10 border-2 dark:shadow-[0_0_20px_rgba(255,255,255,0.2)] rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-4 h-4 text-yellow-500" />
                            <h4 className="font-semibold text-sm dark:text-white">{rec.title}</h4>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">{rec.description}</p>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleAction(rec.title)}
                          >
                            Voir les détails
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Progress Tab */}
            <TabsContent value="progress" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weekly Goal */}
                <Card className="dark:bg-slate-800 dark:border-white/20 border-2 shadow-lg dark:shadow-[0_0_30px_rgba(255,255,255,0.4)]">
                  <CardHeader>
                    <CardTitle className="dark:text-slate-100">Objectif hebdomadaire</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Progression</span>
                        <span className="font-semibold">
                          {dashboardData.stats.weeklyProgress}h / {dashboardData.stats.weeklyGoal}h
                        </span>
                      </div>
                      <Progress 
                        value={(dashboardData.stats.weeklyProgress / dashboardData.stats.weeklyGoal) * 100} 
                        className="h-3"
                      />
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        Il vous reste {dashboardData.stats.weeklyGoal - dashboardData.stats.weeklyProgress}h pour atteindre votre objectif !
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Level Progress */}
                {gamificationData && (
                  <Card className="dark:bg-slate-800 dark:border-white/20 border-2 shadow-lg dark:shadow-[0_0_30px_rgba(255,255,255,0.4)]">
                    <CardHeader>
                      <CardTitle className="dark:text-slate-100">Progression de niveau</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span>Niveau {gamificationData.level}</span>
                          <span className="font-semibold">
                            {gamificationData.points} / {gamificationData.nextLevelPoints} pts
                          </span>
                        </div>
                        <Progress 
                          value={gamificationData.progressToNextLevel} 
                          className="h-3"
                        />
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          {gamificationData.pointsToNextLevel} points pour le niveau suivant
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="dark:bg-slate-800 dark:border-white/20 border-2 shadow-lg dark:shadow-[0_0_30px_rgba(255,255,255,0.4)]">
                  <CardHeader>
                    <CardTitle className="dark:text-slate-100">Habitudes d'étude</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-300">Heure favorite</span>
                      <span className="font-semibold">{dashboardData.studyAnalytics.favoriteStudyTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-300">Jour le plus productif</span>
                      <span className="font-semibold">{dashboardData.studyAnalytics.mostProductiveDay}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-300">Temps moyen par session</span>
                      <span className="font-semibold">45 minutes</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="dark:bg-slate-800 dark:border-white/20 border-2 shadow-lg dark:shadow-[0_0_30px_rgba(255,255,255,0.4)]">
                  <CardHeader>
                    <CardTitle className="dark:text-slate-100">Événements à venir</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {dashboardData.upcomingEvents.map((event, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <Calendar className="w-5 h-5 text-slate-500" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{event.title}</p>
                          <p className="text-xs text-slate-500">{event.date}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          event.type === 'exam' ? 'bg-red-100 text-red-700' :
                          event.type === 'quiz' ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {event.type}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gamificationData?.recentBadges?.map((badge, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="text-center p-6 dark:bg-slate-800 dark:border-white/30 border-2 shadow-lg dark:shadow-[0_0_35px_rgba(255,255,255,0.5)]">
                      <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trophy className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <h3 className="font-bold mb-2">{badge.badge_name}</h3>
                      <p className="text-sm text-slate-600 mb-4">{badge.badge_description}</p>
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                        {badge.badge_rarity}
                      </span>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Quick Actions */}
          <Card className="mt-8 dark:bg-slate-800 dark:border-white/20 border-2 shadow-lg dark:shadow-[0_0_30px_rgba(255,255,255,0.4)]">
            <CardHeader>
              <CardTitle className="dark:text-slate-100">Actions rapides</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <Link to="/my-courses">
                  <Button variant="outline" className="w-full h-20 flex-col gap-2">
                    <BookOpen className="w-6 h-6" />
                    <span>Mes cours</span>
                  </Button>
                </Link>
                <Link to="/quiz">
                  <Button variant="outline" className="w-full h-20 flex-col gap-2">
                    <Target className="w-6 h-6" />
                    <span>Quiz</span>
                  </Button>
                </Link>
                <Link to="/quiz-review">
                  <Button variant="outline" className="w-full h-20 flex-col gap-2 border-orange-300 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20">
                    <span className="text-2xl">📝</span>
                    <span className="text-orange-600 dark:text-orange-400 font-semibold text-sm">Réviser Quiz</span>
                  </Button>
                </Link>
                <Link to="/study-plan">
                  <Button variant="outline" className="w-full h-20 flex-col gap-2 border-primary/30 hover:border-primary hover:bg-primary/5">
                    <span className="text-2xl">📚</span>
                    <span className="text-primary font-semibold">Plan d'Étude</span>
                  </Button>
                </Link>
                <Link to="/leaderboard">
                  <Button variant="outline" className="w-full h-20 flex-col gap-2">
                    <Users className="w-6 h-6" />
                    <span>Classement</span>
                  </Button>
                </Link>
                <Link to="/profile">
                  <Button variant="outline" className="w-full h-20 flex-col gap-2">
                    <User className="w-6 h-6" />
                    <span>Profil</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
};

export default Dashboard;