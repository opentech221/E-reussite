import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Trophy, 
  Target, 
  User, 
  Star, 
  CheckCircle, 
  Clock, 
  Gift,
  TrendingUp,
  Award,
  Flame,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { trackPageView, trackFeatureUsage } from '@/lib/analytics';

const Challenges = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [challenges, setChallenges] = useState([]);
  const [userChallenges, setUserChallenges] = useState([]);
  const [dailyChallenges, setDailyChallenges] = useState([]);
  const [activeTab, setActiveTab] = useState('weekly');

  useEffect(() => {
    if (user) {
      fetchChallenges();
      trackPageView('challenges', user.id);
    }
  }, [user]);

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      // 1. Récupérer les défis hebdomadaires actifs
      const { data: weeklyData, error: weeklyError } = await supabase
        .from('learning_challenges')
        .select('*')
        .gte('end_date', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (weeklyError) throw weeklyError;
      setChallenges(weeklyData || []);

      // 2. Récupérer la progression utilisateur
      const { data: userProgressData, error: progressError } = await supabase
        .from('user_learning_challenges')
        .select(`
          *,
          challenge:challenge_id (
            id,
            name,
            description,
            icon,
            challenge_type,
            target_value,
            reward_points,
            start_date,
            end_date
          )
        `)
        .eq('user_id', user.id);

      if (progressError) throw progressError;
      setUserChallenges(userProgressData || []);

      // 3. Créer défis quotidiens dynamiques
      const today = new Date().toISOString().split('T')[0];
      const dailyData = [
        {
          id: 'daily-lessons',
          name: 'Apprentissage quotidien',
          description: 'Complétez 3 leçons aujourd\'hui',
          icon: '📚',
          target: 3,
          reward: 50,
          type: 'daily'
        },
        {
          id: 'daily-quiz',
          name: 'Quiz du jour',
          description: 'Réussissez 2 quiz avec plus de 80%',
          icon: '🎯',
          target: 2,
          reward: 30,
          type: 'daily'
        },
        {
          id: 'daily-streak',
          name: 'Streak quotidien',
          description: 'Maintenez votre streak en vous connectant',
          icon: '🔥',
          target: 1,
          reward: 20,
          type: 'daily'
        }
      ];

      setDailyChallenges(dailyData);

    } catch (error) {
      console.error('Error fetching challenges:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les défis',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const ensureUserChallenge = async (challengeId) => {
    try {
      // Vérifier si l'utilisateur a déjà ce défi
      const existing = userChallenges.find(uc => uc.challenge_id === challengeId);
      if (existing) return existing;

      // Créer la progression utilisateur
      const challenge = challenges.find(c => c.id === challengeId);
      if (!challenge) return null;

      const { data, error } = await supabase
        .from('user_learning_challenges')
        .insert({
          user_id: user.id,
          challenge_id: challengeId,
          current_progress: 0,
          target_value: challenge.target_value,
          is_completed: false
        })
        .select()
        .single();

      if (error) throw error;

      // Mettre à jour l'état local
      const newUserChallenge = {
        ...data,
        challenge: challenge
      };
      setUserChallenges([...userChallenges, newUserChallenge]);
      
      return newUserChallenge;
    } catch (error) {
      console.error('Error ensuring user challenge:', error);
      return null;
    }
  };

  const claimReward = async (challengeId) => {
    try {
      trackFeatureUsage('challenge_reward_claim', user.id, { challenge_id: challengeId });

      const { data, error } = await supabase
        .rpc('complete_learning_challenge', {
          p_user_id: user.id,
          p_challenge_id: challengeId
        });

      if (error) throw error;

      const result = data[0];
      if (result.success) {
        toast({
          title: `🎉 ${result.challenge_icon} ${result.challenge_name}`,
          description: `+${result.reward_points} points gagnés !`,
        });

        // Rafraîchir les données
        fetchChallenges();
      } else {
        toast({
          title: 'Erreur',
          description: result.message,
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de réclamer la récompense',
        variant: 'destructive'
      });
    }
  };

  const getChallengeProgress = (challengeId) => {
    const userChallenge = userChallenges.find(uc => uc.challenge_id === challengeId);
    return userChallenge || null;
  };

  const getProgressPercentage = (current, target) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  const getDaysRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatEndDate = (endDate) => {
    return new Date(endDate).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderChallengeCard = (challenge, isWeekly = true) => {
    const progress = isWeekly ? getChallengeProgress(challenge.id) : null;
    const current = progress?.current_progress || 0;
    const target = challenge.target_value || challenge.target;
    const isCompleted = progress?.is_completed || false;
    const rewardClaimed = progress?.reward_claimed || false;
    const progressPercent = getProgressPercentage(current, target);
    const daysLeft = isWeekly ? getDaysRemaining(challenge.end_date) : 0;

    return (
      <motion.div
        key={challenge.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="group"
      >
        <Card className={`h-full transition-all duration-300 ${
          isCompleted 
            ? 'border-green-500 bg-green-50 dark:bg-green-900/10' 
            : 'hover:shadow-lg hover:border-primary'
        }`}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="text-4xl">{challenge.icon}</div>
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {challenge.name}
                    {isCompleted && (
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Complété
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {challenge.description}
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="flex items-center gap-1">
                <Gift className="h-3 w-3" />
                {challenge.reward_points || challenge.reward} pts
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Progression</span>
                <span className="font-semibold">
                  {current}/{target}
                </span>
              </div>
              <Progress value={progressPercent} className="h-2" />
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {progressPercent}% complété
              </div>
            </div>

            {/* Time Remaining */}
            {isWeekly && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="h-4 w-4" />
                <span>
                  {daysLeft > 0 
                    ? `${daysLeft} jour${daysLeft > 1 ? 's' : ''} restant${daysLeft > 1 ? 's' : ''}`
                    : 'Expire bientôt'
                  }
                </span>
              </div>
            )}

            {/* Action Button */}
            <div className="pt-2">
              {isCompleted && !rewardClaimed ? (
                <Button 
                  onClick={() => claimReward(challenge.id)}
                  className="w-full bg-green-500 hover:bg-green-600"
                >
                  <Gift className="h-4 w-4 mr-2" />
                  Réclamer la récompense
                </Button>
              ) : isCompleted && rewardClaimed ? (
                <Button variant="outline" className="w-full" disabled>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Récompense réclamée
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    if (!progress) ensureUserChallenge(challenge.id);
                    navigate('/my-courses');
                  }}
                >
                  <Target className="h-4 w-4 mr-2" />
                  Commencer le défi
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement des défis...</p>
        </div>
      </div>
    );
  }

  const completedCount = userChallenges.filter(uc => uc.is_completed).length;
  const totalRewards = userChallenges
    .filter(uc => uc.reward_claimed)
    .reduce((sum, uc) => sum + (uc.challenge?.reward_points || 0), 0);

  return (
    <>
      <Helmet>
        <title>Défis & Challenges - E-Réussite</title>
        <meta name="description" content="Relevez des défis quotidiens et hebdomadaires pour gagner des points et progresser." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 mb-4">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Défis & Challenges
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Relevez des défis pour gagner des points et améliorer vos compétences
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Défis Actifs</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{challenges.length + dailyChallenges.length}</div>
              <p className="text-xs text-muted-foreground">Disponibles maintenant</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Défis Complétés</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedCount}</div>
              <p className="text-xs text-muted-foreground">Cette semaine</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Points Gagnés</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{totalRewards}</div>
              <p className="text-xs text-muted-foreground">Points de récompense</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="weekly">
              <Calendar className="h-4 w-4 mr-2" />
              Hebdomadaires
            </TabsTrigger>
            <TabsTrigger value="daily">
              <Flame className="h-4 w-4 mr-2" />
              Quotidiens
            </TabsTrigger>
          </TabsList>

          {/* Weekly Challenges */}
          <TabsContent value="weekly" className="space-y-6">
            {challenges.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Trophy className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Aucun défi hebdomadaire disponible pour le moment
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence>
                  {challenges.map(challenge => renderChallengeCard(challenge, true))}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>

          {/* Daily Challenges */}
          <TabsContent value="daily" className="space-y-6">
            <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border-orange-200 dark:border-orange-800">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-1">
                      Défis Quotidiens
                    </h3>
                    <p className="text-sm text-orange-800 dark:text-orange-200">
                      Complétez ces défis chaque jour pour maximiser vos gains de points. Les défis se réinitialisent à minuit.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <AnimatePresence>
                {dailyChallenges.map(challenge => renderChallengeCard(challenge, false))}
              </AnimatePresence>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Challenges;