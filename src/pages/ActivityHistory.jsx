import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Target, Award, Clock, Filter, Search, Calendar,
  TrendingUp, CheckCircle, X, ChevronRight, Trophy, Zap, Activity,
  Lightbulb, RotateCcw, Brain, TrendingDown, AlertCircle
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '../lib/customSupabaseClient';
import { generateAdviceForActivity } from '@/lib/contextualAIService';

// ============================================
// HELPER FUNCTIONS
// ============================================

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

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getActivityIcon = (type) => {
  const icons = {
    'chapter_completed': BookOpen,
    'quiz_completed': Target,
    'exam_completed': Trophy,
    'badge_earned': Award,
    'level_up': Zap
  };
  return icons[type] || BookOpen;
};

const getActivityColor = (type) => {
  const colors = {
    'chapter_completed': 'blue',
    'quiz_completed': 'green',
    'exam_completed': 'purple',
    'badge_earned': 'yellow',
    'level_up': 'orange'
  };
  return colors[type] || 'gray';
};

const getActivityLabel = (type) => {
  const labels = {
    'chapter_completed': 'Chapitre complété',
    'quiz_completed': 'Quiz réalisé',
    'exam_completed': 'Examen réalisé',
    'badge_earned': 'Badge obtenu',
    'level_up': 'Niveau supérieur'
  };
  return labels[type] || 'Activité';
};

// ============================================
// MAIN COMPONENT
// ============================================

const ActivityHistory = () => {
  const { user, userProfile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [showAdviceModal, setShowAdviceModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [adviceData, setAdviceData] = useState(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [stats, setStats] = useState({
    totalActivities: 0,
    chaptersCompleted: 0,
    quizzesCompleted: 0,
    examsCompleted: 0
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }

    if (user && userProfile) {
      fetchAllActivities();
    }
  }, [user, userProfile, authLoading, navigate]);

  useEffect(() => {
    filterActivities();
  }, [activities, searchQuery, selectedType]);

  const fetchAllActivities = async () => {
    setLoading(true);
    try {
      const allActivities = [];

      // 1. Récupérer les chapitres complétés
      const { data: completedChapters } = await supabase
        .from('user_progress')
        .select(`
          id,
          chapitre_id,
          completed_at,
          time_spent,
          chapitres:chapitre_id (
            id,
            title,
            matieres:matiere_id (name)
          )
        `)
        .eq('user_id', user.id)
        .eq('completed', true)
        .order('completed_at', { ascending: false });

      if (completedChapters) {
        completedChapters.forEach(chapter => {
          if (chapter.chapitres) {
            allActivities.push({
              id: `chapter-${chapter.id}`,
              type: 'chapter_completed',
              title: chapter.chapitres.title,
              subject: chapter.chapitres.matieres?.name || 'Matière',
              timestamp: chapter.completed_at,
              timeSpent: chapter.time_spent,
              detailsUrl: `/courses`,
              data: chapter
            });
          }
        });
      }

      // 2. Récupérer les quiz complétés
      const { data: completedQuizzes } = await supabase
        .from('quiz_results')
        .select(`
          id,
          quiz_id,
          score,
          correct_answers,
          total_questions,
          time_taken,
          completed_at,
          answers,
          quiz:quiz_id (
            id,
            title,
            chapitres:chapitre_id (
              matieres:matiere_id (name)
            )
          )
        `)
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (completedQuizzes) {
        completedQuizzes.forEach(quiz => {
          if (quiz.quiz) {
            allActivities.push({
              id: `quiz-${quiz.id}`,
              type: 'quiz_completed',
              title: quiz.quiz.title,
              subject: quiz.quiz.chapitres?.matieres?.name || 'Matière',
              score: quiz.score,
              correctAnswers: quiz.correct_answers,
              totalQuestions: quiz.total_questions,
              timestamp: quiz.completed_at,
              timeSpent: quiz.time_taken,
              detailsUrl: `/activity/quiz/${quiz.id}`,
              data: quiz
            });
          }
        });
      }

      // 3. Récupérer les examens complétés
      const { data: completedExams } = await supabase
        .from('exam_results')
        .select(`
          id,
          exam_id,
          score,
          time_taken,
          completed_at,
          answers,
          examens:exam_id (
            id,
            title,
            difficulty,
            type,
            matieres:matiere_id (name)
          )
        `)
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (completedExams) {
        completedExams.forEach(exam => {
          if (exam.examens) {
            allActivities.push({
              id: `exam-${exam.id}`,
              type: 'exam_completed',
              title: exam.examens.title,
              subject: exam.examens.matieres?.name || exam.examens.type === 'blanc' ? 'Examen blanc' : 'Examen',
              score: exam.score,
              difficulty: exam.examens.difficulty,
              timestamp: exam.completed_at,
              timeSpent: exam.time_taken,
              detailsUrl: `/activity/exam/${exam.id}`,
              data: exam
            });
          }
        });
      }

      // 4. Récupérer les badges obtenus (données directes)
      const { data: badgesData } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      if (earnedBadges && earnedBadges.length > 0) {
        earnedBadges.forEach(badge => {
          allActivities.push({
            id: `badge-${badge.id}`,
            type: 'badge_earned',
            title: badge.badge_name,
            description: badge.badge_description,
            icon: badge.badge_icon,
            timestamp: badge.earned_at,
            detailsUrl: `/profile`,
            data: badge
          });
        });
      }

      // Trier par date (plus récent d'abord)
      allActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setActivities(allActivities);

      // Calculer les statistiques
      setStats({
        totalActivities: allActivities.length,
        chaptersCompleted: allActivities.filter(a => a.type === 'chapter_completed').length,
        quizzesCompleted: allActivities.filter(a => a.type === 'quiz_completed').length,
        examsCompleted: allActivities.filter(a => a.type === 'exam_completed').length
      });

    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterActivities = () => {
    let filtered = [...activities];

    // Filtre par type
    if (selectedType !== 'all') {
      filtered = filtered.filter(a => a.type === selectedType);
    }

    // Filtre par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(query) ||
        a.subject.toLowerCase().includes(query)
      );
    }

    setFilteredActivities(filtered);
  };

  const handleAdviceClick = async (activity, e) => {
    e.stopPropagation(); // Empêcher la propagation au clic sur la carte
    setSelectedActivity(activity);
    setShowAdviceModal(true);
    setLoadingAdvice(true);
    setAdviceData(null);

    try {
      // Récupérer les chapitres associés pour suggestions avec liens
      let relatedChapters = [];
      
      if (activity.type === 'quiz_completed' && activity.data?.quiz?.chapitre_id) {
        // Pour un quiz, récupérer les infos du chapitre
        const { data: chapitreData } = await supabase
          .from('chapitres')
          .select('id, title, matiere_id, matieres:matiere_id(name)')
          .eq('id', activity.data.quiz.chapitre_id)
          .single();
        
        if (chapitreData) {
          relatedChapters.push({
            id: chapitreData.id,
            title: chapitreData.title,
            matiere_id: chapitreData.matiere_id,
            matiere: chapitreData.matieres?.name
          });
        }
      } else if (activity.type === 'exam_completed' && activity.data?.examens?.matiere_id) {
        // Pour un examen, récupérer tous les chapitres de la matière
        const { data: chapitresData } = await supabase
          .from('chapitres')
          .select('id, title, matiere_id')
          .eq('matiere_id', activity.data.examens.matiere_id)
          .order('ordre');
        
        if (chapitresData) {
          relatedChapters = chapitresData.map(ch => ({
            id: ch.id,
            title: ch.title,
            matiere_id: ch.matiere_id
          }));
        }
      } else if (activity.type === 'chapter_completed' && activity.data?.chapitre_id) {
        // Pour un chapitre, récupérer ce chapitre
        const { data: chapitreData } = await supabase
          .from('chapitres')
          .select('id, title, matiere_id')
          .eq('id', activity.data.chapitre_id)
          .single();
        
        if (chapitreData) {
          relatedChapters.push({
            id: chapitreData.id,
            title: chapitreData.title,
            matiere_id: chapitreData.matiere_id
          });
        }
      }
      
      // Générer les conseils avec l'IA en passant les chapitres disponibles
      const advice = await generateAdviceForActivity(activity, userProfile, relatedChapters);
      setAdviceData(advice);
    } catch (error) {
      console.error('Erreur génération conseils:', error);
      setAdviceData({
        error: true,
        message: 'Impossible de générer les conseils pour le moment.'
      });
    } finally {
      setLoadingAdvice(false);
    }
  };

  const handleRestartActivity = () => {
    setShowAdviceModal(false);
    
    // Navigation selon le type d'activité
    if (selectedActivity.type === 'quiz_completed') {
      navigate(`/quiz/${selectedActivity.data.quiz_id}`);
    } else if (selectedActivity.type === 'exam_completed') {
      navigate(`/exam/${selectedActivity.data.exam_id}`);
    } else if (selectedActivity.type === 'chapter_completed') {
      navigate(`/courses`);
    }
  };

  const handleResumeCourse = () => {
    setShowAdviceModal(false);
    
    // Navigation vers les cours privés (my-courses) selon le type d'activité
    if (selectedActivity.type === 'quiz_completed') {
      // Pour les quiz, retourner au chapitre du quiz
      const chapitreId = selectedActivity.data.chapitre_id;
      if (chapitreId) {
        navigate(`/chapitre/${chapitreId}`);
      } else {
        navigate('/my-courses');
      }
    } else if (selectedActivity.type === 'exam_completed') {
      // Pour les examens, retourner à la page des cours privés avec filtre matière
      const matiereId = selectedActivity.data.matiere_id;
      if (matiereId) {
        navigate(`/my-courses?matiere=${matiereId}`);
      } else {
        navigate('/my-courses');
      }
    } else if (selectedActivity.type === 'chapter_completed') {
      // Pour les chapitres complétés, retourner au détail du chapitre
      const chapitreId = selectedActivity.data.chapitre_id;
      if (chapitreId) {
        navigate(`/chapitre/${chapitreId}`);
      } else {
        navigate('/my-courses');
      }
    } else {
      // Par défaut, retourner à la page des cours privés
      navigate('/my-courses');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Historique des Activités - E-Réussite</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* En-tête */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Historique des Activités
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Consultez toutes vos activités d'apprentissage
            </p>
          </motion.div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="dark:bg-slate-800 dark:border-white/20 border-2 shadow-lg dark:shadow-[0_0_30px_rgba(255,255,255,0.4)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Total</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalActivities}</p>
                  </div>
                  <Activity className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-slate-800 dark:border-white/20 border-2 shadow-lg dark:shadow-[0_0_30px_rgba(255,255,255,0.4)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Chapitres</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.chaptersCompleted}</p>
                  </div>
                  <BookOpen className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-slate-800 dark:border-white/20 border-2 shadow-lg dark:shadow-[0_0_30px_rgba(255,255,255,0.4)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Quiz</p>
                    <p className="text-2xl font-bold text-green-600">{stats.quizzesCompleted}</p>
                  </div>
                  <Target className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-slate-800 dark:border-white/20 border-2 shadow-lg dark:shadow-[0_0_30px_rgba(255,255,255,0.4)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Examens</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.examsCompleted}</p>
                  </div>
                  <Trophy className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtres et Recherche */}
          <Card className="mb-6 dark:bg-slate-800 dark:border-white/20 border-2 shadow-lg dark:shadow-[0_0_30px_rgba(255,255,255,0.4)]">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Recherche */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Rechercher une activité..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Filtres par type */}
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={selectedType === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedType('all')}
                  >
                    Tout
                  </Button>
                  <Button
                    variant={selectedType === 'chapter_completed' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedType('chapter_completed')}
                  >
                    <BookOpen className="w-4 h-4 mr-1" />
                    Chapitres
                  </Button>
                  <Button
                    variant={selectedType === 'quiz_completed' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedType('quiz_completed')}
                  >
                    <Target className="w-4 h-4 mr-1" />
                    Quiz
                  </Button>
                  <Button
                    variant={selectedType === 'exam_completed' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedType('exam_completed')}
                  >
                    <Trophy className="w-4 h-4 mr-1" />
                    Examens
                  </Button>
                  <Button
                    variant={selectedType === 'badge_earned' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedType('badge_earned')}
                  >
                    <Award className="w-4 h-4 mr-1" />
                    Badges
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liste des activités */}
          <Card className="dark:bg-slate-800 dark:border-white/20 border-2 shadow-lg dark:shadow-[0_0_30px_rgba(255,255,255,0.4)]">
            <CardContent className="p-6">
              {filteredActivities.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {searchQuery || selectedType !== 'all'
                      ? 'Aucune activité trouvée avec ces filtres'
                      : 'Aucune activité pour le moment'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {filteredActivities.map((activity, index) => {
                      const Icon = getActivityIcon(activity.type);
                      const color = getActivityColor(activity.type);
                      
                      return (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ delay: index * 0.05 }}
                          className="relative p-5 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 hover:shadow-lg transition-all"
                        >
                          {/* Badge de type en haut à droite */}
                          <div className="absolute top-4 right-4">
                            <Badge variant="secondary" className="text-xs">
                              {getActivityLabel(activity.type)}
                            </Badge>
                          </div>

                          <div className="flex items-start gap-4">
                            {/* Icône */}
                            <div className={`p-3 rounded-xl bg-${color}-100 shrink-0`}>
                              <Icon className={`w-7 h-7 text-${color}-600`} />
                            </div>

                            {/* Contenu principal */}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 truncate">
                                {activity.title}
                              </h3>

                              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-300 mb-3">
                                <span className="font-medium">{activity.subject}</span>
                                
                                <span>•</span>
                                
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {getRelativeTime(activity.timestamp)}
                                </span>

                                {activity.timeSpent && (
                                  <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                      <Zap className="w-4 h-4" />
                                      {Math.round(activity.timeSpent / 60)} min
                                    </span>
                                  </>
                                )}
                              </div>

                              {/* Score et détails */}
                              {activity.score !== undefined && (
                                <div className="flex items-center gap-4 mb-3">
                                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                                    activity.score >= 70 ? 'bg-green-100' : 
                                    activity.score >= 50 ? 'bg-yellow-100' : 
                                    'bg-red-100'
                                  }`}>
                                    <span className={`text-sm font-bold ${
                                      activity.score >= 70 ? 'text-green-700' : 
                                      activity.score >= 50 ? 'text-yellow-700' : 
                                      'text-red-700'
                                    }`}>
                                      Score: {activity.score}%
                                    </span>
                                  </div>

                                  {activity.correctAnswers !== undefined && activity.totalQuestions && (
                                    <span className="text-sm text-gray-600 dark:text-gray-300">
                                      {activity.correctAnswers}/{activity.totalQuestions} correctes
                                    </span>
                                  )}
                                </div>
                              )}

                              <p className="text-xs text-gray-500">
                                {formatDate(activity.timestamp)}
                              </p>
                            </div>
                          </div>

                          {/* Bouton Conseils en bas à droite */}
                          <div className="absolute bottom-4 right-4">
                            <Button
                              onClick={(e) => handleAdviceClick(activity, e)}
                              size="sm"
                              className="gap-2 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 hover:from-yellow-500 hover:via-orange-500 hover:to-yellow-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 border-0 group"
                            >
                              <Lightbulb className="w-4 h-4 animate-pulse group-hover:animate-bounce" />
                              Conseils
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal Conseils IA */}
      <AnimatePresence>
        {showAdviceModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAdviceModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col"
            >
              {/* En-tête */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 p-6 text-white flex-shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Brain className="w-8 h-8" />
                    <h2 className="text-2xl font-bold">Conseils Personnalisés</h2>
                  </div>
                  <button
                    onClick={() => setShowAdviceModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                {selectedActivity && (
                  <p className="text-blue-100 text-sm">
                    {selectedActivity.title} • {selectedActivity.subject}
                  </p>
                )}
              </div>

              {/* Contenu scrollable */}
              <div className="flex-1 overflow-y-auto p-6">
                {loadingAdvice ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-300">Analyse en cours par l'IA...</p>
                  </div>
                ) : adviceData?.error ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
                    <p className="text-red-600 text-center">{adviceData.message}</p>
                  </div>
                ) : adviceData ? (
                  <div className="space-y-6">
                    {/* Points forts */}
                    {adviceData.strengths && adviceData.strengths.length > 0 && (
                      <div className="bg-green-50 rounded-xl p-5 border-2 border-green-200">
                        <div className="flex items-center gap-2 mb-3">
                          <TrendingUp className="w-6 h-6 text-green-600" />
                          <h3 className="text-lg font-bold text-green-900">Points Forts</h3>
                        </div>
                        <ul className="space-y-2">
                          {adviceData.strengths.map((strength, index) => (
                            <li key={index} className="flex items-start gap-2 text-green-800">
                              <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" />
                              <span>{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Points faibles */}
                    {adviceData.weaknesses && adviceData.weaknesses.length > 0 && (
                      <div className="bg-orange-50 rounded-xl p-5 border-2 border-orange-200">
                        <div className="flex items-center gap-2 mb-3">
                          <TrendingDown className="w-6 h-6 text-orange-600" />
                          <h3 className="text-lg font-bold text-orange-900">Points à Améliorer</h3>
                        </div>
                        <ul className="space-y-2">
                          {adviceData.weaknesses.map((weakness, index) => (
                            <li key={index} className="flex items-start gap-2 text-orange-800">
                              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                              <span>{weakness}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Suggestions et conseils */}
                    {adviceData.suggestions && adviceData.suggestions.length > 0 && (
                      <div className="bg-blue-50 rounded-xl p-5 border-2 border-blue-200">
                        <div className="flex items-center gap-2 mb-3">
                          <Lightbulb className="w-6 h-6 text-blue-600" />
                          <h3 className="text-lg font-bold text-blue-900">Conseils pour Réussir</h3>
                        </div>
                        <ul className="space-y-3">
                          {adviceData.suggestions.map((suggestion, index) => {
                            // Support pour ancien format (string) et nouveau format (objet)
                            const suggestionText = typeof suggestion === 'string' ? suggestion : suggestion.text;
                            const chapterId = typeof suggestion === 'object' ? suggestion.chapterId : null;
                            const chapterTitle = typeof suggestion === 'object' ? suggestion.chapterTitle : null;
                            const matiereId = typeof suggestion === 'object' ? suggestion.matiereId : null;
                            const hasLink = chapterId !== null && chapterId !== undefined && matiereId !== null && matiereId !== undefined;
                            
                            return (
                              <li key={index} className="flex items-start gap-2">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-200 text-blue-900 font-bold text-sm mt-0.5 shrink-0">
                                  {index + 1}
                                </span>
                                <div className="flex-1">
                                  <span className="text-blue-800">{suggestionText}</span>
                                  {hasLink && (
                                    <button
                                      onClick={() => {
                                        setShowAdviceModal(false);
                                        navigate(`/course/${matiereId}?chapter=${chapterId}`);
                                      }}
                                      className="ml-2 inline-flex items-center gap-1 px-3 py-1 mt-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                                    >
                                      <BookOpen className="w-3.5 h-3.5" />
                                      <span>{chapterTitle || 'Voir le chapitre'}</span>
                                      <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}

                    {/* Message général si disponible */}
                    {adviceData.message && (
                      <div className="bg-purple-50 rounded-xl p-5 border-2 border-purple-200">
                        <p className="text-purple-900 leading-relaxed">{adviceData.message}</p>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              {/* Footer fixe avec les deux boutons d'action */}
              {!loadingAdvice && !adviceData?.error && adviceData && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-slate-700 flex-shrink-0">
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Bouton Reprendre le cours */}
                    <Button
                      onClick={handleResumeCourse}
                      variant="outline"
                      className="flex-1 gap-2 text-base py-5 border-2 border-blue-600 dark:border-blue-500 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 shadow-md font-semibold"
                    >
                      <BookOpen className="w-5 h-5" />
                      Reprendre le cours
                    </Button>

                    {/* Bouton Recommencer l'activité */}
                    <Button
                      onClick={handleRestartActivity}
                      className="flex-1 gap-2 text-base py-5 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 hover:from-blue-700 hover:to-purple-700 dark:hover:from-blue-800 dark:hover:to-purple-800 shadow-lg"
                    >
                      <RotateCcw className="w-5 h-5" />
                      Recommencer l'activité
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ActivityHistory;
