import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Crown, 
  Medal, 
  TrendingUp, 
  Users, 
  Award,
  Filter,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import RankBadge, { RankCard } from './RankBadge';

/**
 * QuizLeaderboard - Classement des quiz avec percentiles et badges de rang
 */
const QuizLeaderboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [filterTier, setFilterTier] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchLeaderboardData();
    }
  }, [user, filterTier]);

  const fetchLeaderboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Récupérer toutes les sessions de quiz complétées
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('interactive_quiz_sessions')
        .select('user_id, score_percentage, created_at')
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (sessionsError) throw sessionsError;

      // 2. Récupérer les infos des utilisateurs
      const userIds = [...new Set(sessionsData?.map(s => s.user_id) || [])];
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      if (usersError) throw usersError;

      // Créer un map des utilisateurs pour accès rapide
      const usersMap = {};
      usersData?.forEach(u => {
        usersMap[u.id] = u;
      });

      // 3. Agréger les données par utilisateur
      const userStats = {};
      
      sessionsData?.forEach(session => {
        const userId = session.user_id;
        const userInfo = usersMap[userId];
        
        if (!userStats[userId]) {
          userStats[userId] = {
            user_id: userId,
            full_name: userInfo?.full_name || 'Utilisateur',
            avatar_url: null, // Pas d'avatar pour l'instant
            total_quizzes: 0,
            scores: [],
            best_score: 0,
          };
        }
        
        userStats[userId].total_quizzes += 1;
        userStats[userId].scores.push(session.score_percentage);
        userStats[userId].best_score = Math.max(
          userStats[userId].best_score, 
          session.score_percentage
        );
      });

      // 4. Calculer moyenne et créer tableau de classement
      const leaderboardArray = Object.values(userStats).map(user => {
        const average_score = user.scores.reduce((a, b) => a + b, 0) / user.scores.length;
        
        // Déterminer le rank_tier basé sur le score moyen
        let rank_tier = 'bronze';
        if (average_score >= 90) rank_tier = 'diamond';
        else if (average_score >= 80) rank_tier = 'platinum';
        else if (average_score >= 70) rank_tier = 'gold';
        else if (average_score >= 60) rank_tier = 'silver';
        
        return {
          user_id: user.user_id,
          full_name: user.full_name,
          avatar_url: user.avatar_url,
          total_quizzes: user.total_quizzes,
          average_score: Math.round(average_score * 100) / 100,
          best_score: user.best_score,
          rank_tier,
        };
      });

      // 5. Trier par score moyen décroissant et assigner les rangs
      leaderboardArray.sort((a, b) => b.average_score - a.average_score);
      
      const rankedLeaderboard = leaderboardArray.map((user, index) => {
        const total_users = leaderboardArray.length;
        const percentile = total_users > 0 
          ? Math.round(((total_users - index) / total_users) * 100 * 100) / 100 
          : 0;
        
        return {
          ...user,
          global_rank: index + 1,
          percentile,
        };
      });

      // 6. Récupérer les stats de l'utilisateur actuel
      const currentUserStats = rankedLeaderboard.find(u => u.user_id === user.id);
      setUserStats(currentUserStats || null);

      // 7. Filtrer par tier si nécessaire
      let filteredData = rankedLeaderboard;
      if (filterTier) {
        filteredData = filteredData.filter(u => u.rank_tier === filterTier);
      }

      // 8. Limiter à 50 utilisateurs
      setLeaderboard(filteredData.slice(0, 50));

    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (position) => {
    if (position === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (position === 2) return <Medal className="w-6 h-6 text-slate-400" />;
    if (position === 3) return <Medal className="w-6 h-6 text-amber-600" />;
    return <span className="text-lg font-bold text-slate-600 dark:text-slate-300">#{position}</span>;
  };

  const tierFilters = [
    { id: null, label: 'Tous', color: 'bg-slate-500' },
    { id: 'bronze', label: 'Bronze', color: 'bg-amber-600' },
    { id: 'silver', label: 'Argent', color: 'bg-slate-500' },
    { id: 'gold', label: 'Or', color: 'bg-yellow-500' },
    { id: 'platinum', label: 'Platine', color: 'bg-cyan-400' },
    { id: 'diamond', label: 'Diamant', color: 'bg-purple-500' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="w-8 h-8 text-blue-500" />
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 dark:border-red-800">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
            <AlertCircle className="w-5 h-5" />
            <div>
              <p className="font-semibold">Erreur de chargement</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats utilisateur */}
      {userStats && userStats.total_quizzes > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <RankCard stats={userStats} compact={false} />
        </motion.div>
      )}

      {/* Message si pas de quiz */}
      {(!userStats || userStats.total_quizzes === 0) && (
        <Card className="border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <Trophy className="w-12 h-12 text-blue-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Complétez des quiz pour apparaître dans le classement !
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Votre rang et votre percentile seront calculés automatiquement après votre premier quiz.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtres par tier */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtrer par rang
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {tierFilters.map((filter) => (
              <Button
                key={filter.id || 'all'}
                variant={filterTier === filter.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterTier(filter.id)}
                className="gap-2"
              >
                <div className={`w-3 h-3 rounded-full ${filter.color}`} />
                {filter.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-2 shadow-lg">
          <CardContent className="pt-6 text-center">
            <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {leaderboard[0]?.average_score.toFixed(0) || 0}%
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Meilleur score moyen
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-lg">
          <CardContent className="pt-6 text-center">
            <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {leaderboard.length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Participants actifs
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-lg">
          <CardContent className="pt-6 text-center">
            <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              #{userStats?.global_rank || '--'}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Votre classement
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Classement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Classement des Quiz Interactifs
            <span className="ml-auto text-sm font-normal text-slate-600 dark:text-slate-400">
              Top {leaderboard.length}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {leaderboard.length === 0 ? (
            <div className="text-center py-12 text-slate-600 dark:text-slate-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Aucun participant dans cette catégorie</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {leaderboard.map((participant, index) => {
                  const isCurrentUser = participant.user_id === user?.id;
                  
                  return (
                    <motion.div
                      key={participant.user_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className={`
                        p-4 rounded-lg border-2 transition-all duration-300
                        ${isCurrentUser
                          ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 shadow-lg'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-md'
                        }
                      `}
                    >
                      <div className="flex items-center gap-4">
                        {/* Rang */}
                        <div className="flex items-center justify-center w-12 h-12 flex-shrink-0">
                          {getRankIcon(participant.global_rank)}
                        </div>

                        {/* Avatar */}
                        <Avatar className={`w-12 h-12 flex-shrink-0 ${
                          participant.global_rank <= 3 ? 'ring-2' : ''
                        } ${
                          participant.global_rank === 1 ? 'ring-yellow-400' :
                          participant.global_rank === 2 ? 'ring-slate-400' :
                          participant.global_rank === 3 ? 'ring-amber-600' : ''
                        }`}>
                          <AvatarImage src={participant.avatar_url} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                            {participant.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>

                        {/* Nom et badge */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-semibold truncate ${
                              isCurrentUser ? 'text-blue-900 dark:text-blue-300' : 'text-slate-900 dark:text-white'
                            }`}>
                              {participant.full_name || 'Utilisateur anonyme'}
                            </h3>
                            {isCurrentUser && (
                              <span className="px-2 py-0.5 bg-gradient-to-r from-green-400 to-green-600 text-white text-xs rounded-full">
                                Vous
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                            <span>{participant.total_quizzes} quiz</span>
                            <span>•</span>
                            <span className="font-semibold">{participant.average_score.toFixed(0)}% moyenne</span>
                          </div>
                        </div>

                        {/* Badge de rang */}
                        <div className="flex-shrink-0">
                          <RankBadge
                            tier={participant.rank_tier}
                            percentile={participant.percentile}
                            size="sm"
                            showPercentile={true}
                            showLabel={false}
                            animated={false}
                          />
                        </div>

                        {/* Score */}
                        <div className="text-right flex-shrink-0">
                          <div className="text-2xl font-bold text-slate-900 dark:text-white">
                            {participant.average_score.toFixed(0)}%
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-500">
                            Top {(100 - participant.percentile).toFixed(0)}%
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Note sur l'anonymisation */}
      <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Award className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-slate-700 dark:text-slate-300">
              <p className="font-semibold mb-1">Classement anonymisé</p>
              <p>
                Votre position et vos statistiques sont visibles uniquement par vous. 
                Les autres participants voient un classement anonymisé pour protéger votre vie privée.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizLeaderboard;
