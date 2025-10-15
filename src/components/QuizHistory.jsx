import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Clock, 
  Target, 
  TrendingUp, 
  Calendar,
  Award,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/customSupabaseClient';
import QuizScoreChart from './QuizScoreChart';
import { RankCard } from './RankBadge';
import { calculateUserPercentile } from '@/lib/percentileCalculator';

/**
 * Composant d'historique des quiz interactifs
 * Affiche les sessions passées avec stats et possibilité de révision
 */
const QuizHistory = ({ userId, onRetryQuiz }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRankStats, setUserRankStats] = useState(null);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    averageScore: 0,
    bestScore: 0,
    totalTime: 0,
    badgesEarned: 0
  });

  useEffect(() => {
    if (userId) {
      loadQuizHistory();
      loadUserRankStats();
    }
  }, [userId]);

  const loadUserRankStats = async () => {
    try {
      const rankData = await calculateUserPercentile(userId);
      
      if (rankData) {
        setUserRankStats(rankData);
      }
    } catch (error) {
      console.error('Error loading rank stats:', error);
    }
  };

  const loadQuizHistory = async () => {
    try {
      setLoading(true);

      // Charger les sessions de quiz
      const { data: sessionsData, error } = await supabase
        .from('interactive_quiz_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      setSessions(sessionsData || []);

      // Calculer les statistiques globales
      if (sessionsData && sessionsData.length > 0) {
        const totalQuizzes = sessionsData.length;
        const completedQuizzes = sessionsData.filter(s => s.status === 'completed');
        
        const totalScore = completedQuizzes.reduce((sum, s) => sum + (s.score_percentage || 0), 0);
        const averageScore = completedQuizzes.length > 0 
          ? Math.round(totalScore / completedQuizzes.length) 
          : 0;
        
        const bestScore = Math.max(...completedQuizzes.map(s => s.score_percentage || 0), 0);
        
        const totalTime = completedQuizzes.reduce((sum, s) => sum + (s.time_elapsed || 0), 0);
        
        const badgesEarned = completedQuizzes.filter(s => s.badge_unlocked).length;

        setStats({
          totalQuizzes,
          averageScore,
          bestScore,
          totalTime,
          badgesEarned
        });
      }
    } catch (error) {
      console.error('Erreur chargement historique quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600 dark:text-green-400';
    if (percentage >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBgColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-100 dark:bg-green-900/30';
    if (percentage >= 60) return 'bg-yellow-100 dark:bg-yellow-900/30';
    return 'bg-red-100 dark:bg-red-900/30';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Aujourd\'hui';
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return date.toLocaleDateString('fr-FR');
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}min ${secs}s`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques Globales */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Total</span>
            </div>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {stats.totalQuizzes}
            </p>
            <p className="text-xs text-blue-600/70 dark:text-blue-400/70">quiz</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">Moyenne</span>
            </div>
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">
              {stats.averageScore}%
            </p>
            <p className="text-xs text-green-600/70 dark:text-green-400/70">score</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">Meilleur</span>
            </div>
            <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
              {stats.bestScore}%
            </p>
            <p className="text-xs text-yellow-600/70 dark:text-yellow-400/70">score</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">Temps</span>
            </div>
            <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              {Math.floor(stats.totalTime / 60)}
            </p>
            <p className="text-xs text-purple-600/70 dark:text-purple-400/70">minutes</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 border-pink-200 dark:border-pink-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-4 h-4 text-pink-600 dark:text-pink-400" />
              <span className="text-xs text-pink-600 dark:text-pink-400 font-medium">Badges</span>
            </div>
            <p className="text-2xl font-bold text-pink-700 dark:text-pink-300">
              {stats.badgesEarned}
            </p>
            <p className="text-xs text-pink-600/70 dark:text-pink-400/70">débloqués</p>
          </CardContent>
        </Card>
      </div>

      {/* Badge de Rang Utilisateur */}
      {userRankStats && (
        <RankCard
          rank={userRankStats.rank}
          percentile={userRankStats.percentile}
          averageScore={userRankStats.averageScore}
          totalUsers={userRankStats.totalUsers}
        />
      )}

      {/* NOUVEAU : Graphique d'évolution des scores */}
      <QuizScoreChart sessions={sessions} loading={loading} />

      {/* Liste des Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Historique des Quiz
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Aucun quiz complété pour le moment</p>
              <p className="text-sm mt-1">Lance ton premier quiz interactif !</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-lg border ${getScoreBgColor(session.score_percentage)} border-slate-200 dark:border-slate-700`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Date et Status */}
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        <span className="text-sm text-slate-600 dark:text-slate-300">
                          {formatDate(session.created_at)}
                        </span>
                        {session.status === 'completed' && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                            Terminé
                          </span>
                        )}
                        {session.status === 'abandoned' && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
                            Abandonné
                          </span>
                        )}
                      </div>

                      {/* Score et Stats */}
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                          <span className={`font-bold text-lg ${getScoreColor(session.score_percentage)}`}>
                            {session.score_percentage}%
                          </span>
                          <span className="text-sm text-slate-500 dark:text-slate-400">
                            ({session.score}/{session.total_questions})
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                          <span className="text-sm text-slate-600 dark:text-slate-300">
                            {formatTime(session.time_elapsed)}
                          </span>
                        </div>

                        {session.badge_unlocked && (
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                              Badge débloqué !
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Difficulté */}
                      {session.difficulty_level && (
                        <div className="mt-2">
                          <span className="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            Difficulté : {session.difficulty_level}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Bouton Révision */}
                    {session.status === 'completed' && session.score_percentage < 100 && onRetryQuiz && (
                      <Button
                        onClick={() => onRetryQuiz(session)}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Réviser
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizHistory;
