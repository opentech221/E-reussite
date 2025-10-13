import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2, Target, Clock, TrendingUp, Award as AwardIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress as ProgressBar } from '@/components/ui/progress';
import OverviewCards from '@/components/progress/OverviewCards';
import BadgeShowcase from '@/components/progress/BadgeShowcase';
import ChallengeList from '@/components/progress/ChallengeList';
import ProgressCharts from '@/components/progress/ProgressCharts';

export default function Progress() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // État des données
  const [userStats, setUserStats] = useState(null);
  const [badges, setBadges] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [pointsHistory, setPointsHistory] = useState([]);
  const [examStats, setExamStats] = useState(null);
  const [recentExams, setRecentExams] = useState([]);

  useEffect(() => {
    if (user) {
      fetchProgressData();
    }
  }, [user]);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Récupérer les statistiques globales
      const { data: stats, error: statsError } = await supabase
        .from('user_points')
        .select('total_points, level, current_streak, lessons_completed, chapters_completed, courses_completed')
        .eq('user_id', user.id)
        .single();

      if (statsError) throw statsError;

      // 2. Récupérer les badges gagnés
      const { data: earnedBadges, error: badgesError } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      if (badgesError) throw badgesError;

      // 3. Récupérer les défis actifs
      const weekNumber = getWeekNumber(new Date());
      const year = new Date().getFullYear();

      const { data: activeChallenges, error: challengesError } = await supabase
        .from('learning_challenges')
        .select(`
          id,
          name,
          description,
          icon,
          challenge_type,
          target_value,
          reward_points,
          user_learning_challenges!inner (
            current_progress,
            target_value,
            is_completed,
            reward_claimed,
            completed_at
          )
        `)
        .eq('week_number', weekNumber)
        .eq('year', year)
        .eq('user_learning_challenges.user_id', user.id);

      if (challengesError) throw challengesError;

      // 4. Récupérer l'historique des points (50 derniers)
      const { data: history, error: historyError } = await supabase
        .from('user_points_history')
        .select('action_type, points_earned, created_at, action_details')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (historyError) throw historyError;

      // ✅ AJOUT: Récupérer les statistiques d'examens
      const { data: examResults, error: examError } = await supabase
        .from('exam_results')
        .select(`
          id,
          score,
          time_taken,
          completed_at,
          examens (
            id,
            title,
            type,
            difficulty,
            duration_minutes
          )
        `)
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (examError) throw examError;

      // Calculer les statistiques d'examens
      const totalExams = examResults?.length || 0;
      const avgExamScore = totalExams > 0
        ? Math.round(examResults.reduce((sum, r) => sum + r.score, 0) / totalExams)
        : 0;
      const bestExamScore = totalExams > 0
        ? Math.max(...examResults.map(r => r.score))
        : 0;
      const totalExamTime = examResults?.reduce((sum, r) => sum + (r.time_taken || 0), 0) || 0;

      setExamStats({
        totalExams,
        avgExamScore,
        bestExamScore,
        totalExamTime
      });

      setRecentExams(examResults?.slice(0, 10) || []);

      // Mettre à jour l'état
      setUserStats(stats || {
        total_points: 0,
        level: 1,
        current_streak: 0,
        lessons_completed: 0,
        chapters_completed: 0,
        courses_completed: 0
      });
      
      setBadges(earnedBadges || []);
      setChallenges(activeChallenges || []);
      setPointsHistory(history || []);

    } catch (err) {
      console.error('Erreur lors du chargement des données de progression:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fonction utilitaire pour calculer le numéro de semaine
  const getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  };

  // Fonction de rafraîchissement après claim
  const handleChallengeComplete = async () => {
    await fetchProgressData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Erreur : {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          📊 Tableau de progression
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Suivez vos performances, badges et défis en temps réel
        </p>
      </div>

      {/* Cartes de statistiques */}
      <OverviewCards stats={userStats} />

      {/* Grille principale */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Colonne gauche : Badges */}
        <div className="lg:col-span-1">
          <BadgeShowcase badges={badges} />
        </div>

        {/* Colonne droite : Défis */}
        <div className="lg:col-span-2">
          <ChallengeList 
            challenges={challenges} 
            userId={user.id}
            onChallengeComplete={handleChallengeComplete}
          />
        </div>
      </div>

      {/* Graphiques */}
      <div className="mt-8">
        <ProgressCharts 
          pointsHistory={pointsHistory}
          stats={userStats}
        />
      </div>

      {/* ✅ AJOUT: Section Examens */}
      {examStats && examStats.totalExams > 0 && (
        <div className="mt-8">
          <Card className="border-2 border-primary/20 dark:bg-slate-800 dark:border-white/30 shadow-xl dark:shadow-[0_0_35px_rgba(255,255,255,0.5)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-white">
                <Target className="w-5 h-5 text-primary" />
                📝 Performance aux Examens
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Statistiques globales */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                  <p className="text-3xl font-bold text-blue-600">{examStats.totalExams}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Examens passés</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                  <p className="text-3xl font-bold text-green-600">{examStats.avgExamScore}%</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Score moyen</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg">
                  <p className="text-3xl font-bold text-yellow-600">{examStats.bestExamScore}%</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Meilleur score</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                  <p className="text-3xl font-bold text-purple-600">{Math.floor(examStats.totalExamTime / 60)}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Minutes totales</p>
                </div>
              </div>

              {/* Liste des examens récents */}
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">Examens récents</h4>
                {recentExams.map((exam, index) => {
                  const difficultyColor = {
                    'facile': 'bg-green-100 text-green-700',
                    'moyen': 'bg-yellow-100 text-yellow-700',
                    'difficile': 'bg-red-100 text-red-700'
                  }[exam.examens?.difficulty] || 'bg-gray-100 text-gray-700';

                  const scoreColor = exam.score >= 75 ? 'text-green-600' : 
                                    exam.score >= 50 ? 'text-yellow-600' : 
                                    'text-red-600';

                  return (
                    <div 
                      key={exam.id} 
                      className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 dark:text-white">
                          {exam.examens?.title || 'Examen'}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full ${difficultyColor}`}>
                            {exam.examens?.difficulty || 'N/A'}
                          </span>
                          <span className="text-xs text-slate-500">
                            {exam.examens?.type === 'blanc' ? '🎯 Examen blanc' : '📚 Examen de matière'}
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {exam.time_taken ? `${Math.floor(exam.time_taken / 60)} min` : 'N/A'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className={`text-2xl font-bold ${scoreColor}`}>
                          {exam.score}%
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(exam.completed_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short'
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bouton vers examens */}
              <div className="mt-6 text-center">
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
        </div>
      )}
    </div>
  );
}
