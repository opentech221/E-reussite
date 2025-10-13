import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Medal, Crown, Star, TrendingUp, Users, 
  Filter, Calendar, Target, Zap, Award, ChevronUp, 
  ChevronDown, MapPin, School, BookOpen, Brain
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { dbHelpers } from '@/lib/supabaseHelpers';
import { supabase } from '@/lib/customSupabaseClient';

const LeaderboardCard = ({ user, position, category, showTrend = false }) => {
  const { user: currentUser } = useAuth();
  const isCurrentUser = currentUser?.id === user.id;
  
  const getRankIcon = (pos) => {
    if (pos === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (pos === 2) return <Medal className="w-6 h-6 text-slate-400" />;
    if (pos === 3) return <Medal className="w-6 h-6 text-amber-600" />;
    return <span className="text-lg font-bold text-slate-600 dark:text-slate-300">{pos}</span>;
  };

  const getCategoryValue = (user, category) => {
    switch (category) {
      case 'points':
        return user.total_points || 0;
      case 'streak':
        return user.current_streak || 0;
      case 'quizzes':
        return user.quizzes_completed || 0;
      case 'lessons':
        return user.lessons_completed || 0;
      case 'badges':
        return user.badges_count || 0;
      default:
        return 0;
    }
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'points':
        return 'points';
      case 'streak':
        return 'jours';
      case 'quizzes':
        return 'quiz';
      case 'lessons':
        return 'leçons';
      case 'badges':
        return 'badges';
      default:
        return '';
    }
  };

  const value = getCategoryValue(user, category);
  const trend = user.trend || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: position * 0.1 }}
      className={`p-3 sm:p-4 rounded-lg border-2 transition-all duration-300 shadow-[0_0_16px_0_rgba(34,197,94,0.18)] dark:shadow-[0_0_24px_0_rgba(34,197,94,0.25)] ${
        isCurrentUser 
          ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-white/40' 
          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-white/20 hover:shadow-lg dark:hover:shadow-[0_0_30px_rgba(34,197,94,0.25)]'
      }`}
    >
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Rank Icon */}
        <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
          {getRankIcon(position)}
        </div>
        
        {/* Avatar */}
        <Avatar className={`w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 ${position <= 3 ? 'ring-2' : ''} ${
          position === 1 ? 'ring-yellow-400' : 
          position === 2 ? 'ring-slate-400' : 
          position === 3 ? 'ring-amber-600' : ''
        }`}>
          <AvatarImage src={user.avatar_url} />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-sm">
            {user.display_name?.charAt(0) || user.email?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        
        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className={`font-semibold truncate text-sm sm:text-base ${isCurrentUser ? 'text-blue-900' : 'text-slate-900 dark:text-white'}`}>
              {user.display_name || 'Utilisateur anonyme'}
            </h3>
            {isCurrentUser && (
              <span className="px-2 py-0.5 bg-gradient-to-r from-green-400 to-green-600 text-white text-xs rounded-full flex-shrink-0 shadow-md border border-green-500">
                Vous
              </span>
            )}
            {user.level && (
              <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/60 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700 shadow-sm">
                Niveau {user.level}
              </span>
            )}
            {category === 'quizzes' && (
              <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700 shadow-sm">
                {user.quizzes_completed} quiz
              </span>
            )}
            {category === 'badges' && (
              <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 dark:bg-yellow-900/60 text-yellow-700 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700 shadow-sm">
                {user.badges_count} badges
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 flex-wrap">
            {user.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{user.location}</span>
              </div>
            )}
            {user.school && (
              <div className="flex items-center gap-1">
                <School className="w-3 h-3 flex-shrink-0" />
                <span className="truncate hidden sm:inline">{user.school}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Score */}
        <div className="text-right flex-shrink-0">
          <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {value.toLocaleString()}
          </div>
          <div className="text-xs sm:text-sm text-slate-500">
            {getCategoryLabel(category)}
          </div>
          
          {showTrend && trend !== 0 && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`flex items-center gap-1 text-xs mt-1 justify-end ${
                trend > 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {trend > 0 ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              <span>{Math.abs(trend)}</span>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const RegionalLeaderboard = ({ region }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegionalLeaderboard();
  }, [region]);

  const fetchRegionalLeaderboard = async () => {
    setLoading(true);
    try {
      // Fetch all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url');

      if (profilesError) throw profilesError;

      // Fetch all user_points
      const { data: pointsData } = await supabase
        .from('user_points')
        .select('user_id, total_points, level, current_streak');

      // Fetch related data
      const { data: allQuizResults } = await supabase
        .from('quiz_results')
        .select('user_id, score, completed_at');

      const { data: allBadges } = await supabase
        .from('user_badges')
        .select('user_id');

      const { data: allProgress } = await supabase
        .from('user_progress')
        .select('user_id, completed')
        .eq('completed', true);

      // Merge and calculate stats
      const enrichedUsers = profilesData.map(profile => {
        const userPoints = pointsData?.find(p => p.user_id === profile.id);
        const userQuizzes = allQuizResults?.filter(q => q.user_id === profile.id) || [];
        const userBadges = allBadges?.filter(b => b.user_id === profile.id) || [];
        const userLessons = allProgress?.filter(p => p.user_id === profile.id) || [];

        return {
          id: profile.id,
          display_name: profile.full_name || 'Utilisateur',
          avatar_url: profile.avatar_url,
          total_points: userPoints?.total_points || 0,
          current_streak: userPoints?.current_streak || 0,
          quizzes_completed: userQuizzes.length,
          lessons_completed: userLessons.length,
          badges_count: userBadges.length,
          trend: 0
        };
      }).sort((a, b) => b.total_points - a.total_points);

      setUsers(enrichedUsers.slice(0, 20)); // Top 20 for regional
    } catch (error) {
      console.error('Error fetching regional leaderboard:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {users.map((user, index) => (
        <LeaderboardCard
          key={user.id}
          user={user}
          position={index + 1}
          category="points"
          showTrend={true}
        />
      ))}
    </div>
  );
};

const StatsOverview = ({ category, users }) => {
  const topUser = users[0];
  const { user: currentUser } = useAuth();
  const userPosition = users.findIndex(u => u.id === currentUser?.id) + 1;
  
  const getCategoryStats = (category) => {
    switch (category) {
      case 'points':
        return {
          icon: Star,
          title: 'Points Totaux',
          color: 'text-yellow-500',
          suffix: 'pts'
        };
      case 'streak':
        return {
          icon: Zap,
          title: 'Série Quotidienne',
          color: 'text-orange-500',
          suffix: 'jours'
        };
      case 'quizzes':
        return {
          icon: Brain,
          title: 'Quiz Complétés',
          color: 'text-purple-500',
          suffix: 'quiz'
        };
      case 'lessons':
        return {
          icon: BookOpen,
          title: 'Leçons Terminées',
          color: 'text-blue-500',
          suffix: 'leçons'
        };
      default:
        return {
          icon: Award,
          title: 'Performance',
          color: 'text-green-500',
          suffix: ''
        };
    }
  };

  const stats = getCategoryStats(category);
  const IconComponent = stats.icon;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
      <Card className="dark:bg-slate-800 dark:border-white/20 border-2 shadow-lg dark:shadow-[0_0_30px_rgba(255,255,255,0.4)]">
        <CardContent className="p-4 sm:p-6 text-center">
          <IconComponent className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 ${stats.color}`} />
          <div className="text-xl sm:text-2xl font-bold dark:text-slate-100">
            {topUser ? topUser[category === 'points' ? 'total_points' : 
                       category === 'streak' ? 'current_streak' :
                       category === 'quizzes' ? 'quizzes_completed' :
                       'lessons_completed'] || 0 : 0}
          </div>
          <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">Record actuel</div>
        </CardContent>
      </Card>
      
      <Card className="dark:bg-slate-800 dark:border-white/20 border-2 shadow-lg dark:shadow-[0_0_30px_rgba(255,255,255,0.4)]">
        <CardContent className="p-4 sm:p-6 text-center">
          <Trophy className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-yellow-500" />
          <div className="text-xl sm:text-2xl font-bold dark:text-slate-100">{users.length}</div>
          <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">Participants</div>
        </CardContent>
      </Card>
      
      <Card className="dark:bg-slate-800 dark:border-white/20 border-2 shadow-lg dark:shadow-[0_0_30px_rgba(255,255,255,0.4)]">
        <CardContent className="p-4 sm:p-6 text-center">
          <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-green-500" />
          <div className="text-xl sm:text-2xl font-bold dark:text-slate-100">#{userPosition || '--'}</div>
          <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">Votre position</div>
        </CardContent>
      </Card>
    </div>
  );
};

const Leaderboard = () => {
  const [globalUsers, setGlobalUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('points');
  const [timeFilter, setTimeFilter] = useState('all');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchLeaderboard();
    }
  }, [user, selectedCategory, timeFilter]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      // Fetch all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url');

      if (profilesError) throw profilesError;

      // Fetch all user_points
      const { data: pointsData } = await supabase
        .from('user_points')
        .select('user_id, total_points, level, current_streak');

      // Fetch quiz results for each user
      const { data: allQuizResults } = await supabase
        .from('quiz_results')
        .select('user_id, score, completed_at');

      // Fetch user badges
      const { data: allBadges } = await supabase
        .from('user_badges')
        .select('user_id');

      // Fetch progress for lessons completed
      const { data: allProgress } = await supabase
        .from('user_progress')
        .select('user_id, completed')
        .eq('completed', true);

      // Merge data for each user
      const enrichedUsers = profilesData.map(profile => {
        const userPoints = pointsData?.find(p => p.user_id === profile.id);
        const userQuizzes = allQuizResults?.filter(q => q.user_id === profile.id) || [];
        const userBadges = allBadges?.filter(b => b.user_id === profile.id) || [];
        const userLessons = allProgress?.filter(p => p.user_id === profile.id) || [];

        return {
          id: profile.id,
          display_name: profile.full_name || 'Utilisateur',
          avatar_url: profile.avatar_url,
          total_points: userPoints?.total_points || 0,
          current_streak: userPoints?.current_streak || 0,
          quizzes_completed: userQuizzes.length,
          lessons_completed: userLessons.length,
          badges_count: userBadges.length,
          level: userPoints?.level || 1,
          trend: 0
        };
      });

      // Sort based on selected category
      const sortedUsers = enrichedUsers.sort((a, b) => {
        switch (selectedCategory) {
          case 'points':
            return b.total_points - a.total_points;
          case 'streak':
            return b.current_streak - a.current_streak;
          case 'quizzes':
            return b.quizzes_completed - a.quizzes_completed;
          case 'lessons':
            return b.lessons_completed - a.lessons_completed;
          case 'badges':
            return b.badges_count - a.badges_count;
          default:
            return b.total_points - a.total_points;
        }
      });

      console.log('🔍 LEADERBOARD DEBUG:', {
        totalProfiles: profilesData?.length,
        totalWithPoints: sortedUsers.length,
        topUsers: sortedUsers.slice(0, 5).map(u => ({ name: u.display_name, points: u.total_points }))
      });
      
      setGlobalUsers(sortedUsers.slice(0, 100)); // Top 100
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setGlobalUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'points', label: 'Points', icon: Star },
    { id: 'streak', label: 'Séries', icon: Zap },
    { id: 'quizzes', label: 'Quiz', icon: Brain },
    { id: 'lessons', label: 'Leçons', icon: BookOpen }
  ];

  const timeFilters = [
    { id: 'all', label: 'Tout temps' },
    { id: 'week', label: 'Cette semaine' },
    { id: 'month', label: 'Ce mois' }
  ];

  const regions = [
    { id: 'west', label: 'Afrique de l\'Ouest' },
    { id: 'north', label: 'Afrique du Nord' },
    { id: 'central', label: 'Afrique Centrale' },
    { id: 'east', label: 'Afrique de l\'Est' },
    { id: 'south', label: 'Afrique Australe' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Navbar />
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">Chargement du classement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Helmet>
        <title>Classement - E-Réussite</title>
        <meta name="description" content="Classement des meilleurs étudiants d'Afrique francophone" />
      </Helmet>
      
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center mb-6 bg-gradient-to-r from-blue-50 via-green-50 to-pink-50 dark:from-slate-800 dark:via-green-900/30 dark:to-slate-900 rounded-2xl p-8 shadow-[0_0_32px_0_rgba(34,197,94,0.18)] dark:shadow-[0_0_40px_0_rgba(34,197,94,0.25)]">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-green-300 mb-2 drop-shadow-[0_2px_8px_rgba(34,197,94,0.18)]">🏆 Classement</h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-200">Compétition amicale entre apprenants africains</p>
          </div>

          {/* Stats Overview */}
          <StatsOverview category={selectedCategory} users={globalUsers} />

          {/* Filters - Mobile First Design */}
          <Card className="bg-white dark:bg-slate-800 dark:border-white/20 border-2 shadow-lg dark:shadow-[0_0_25px_rgba(255,255,255,0.3)]">
            <CardContent className="p-4">
              <div className="space-y-4">
                {/* Category Filters */}
                <div className="space-y-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Catégorie</span>
                  <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                    {categories.map(cat => {
                      const IconComponent = cat.icon;
                      return (
                        <Button
                          key={cat.id}
                          variant={selectedCategory === cat.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedCategory(cat.id)}
                          className="flex items-center justify-center gap-2"
                        >
                          <IconComponent className="w-4 h-4" />
                          <span className="text-xs sm:text-sm">{cat.label}</span>
                        </Button>
                      );
                    })}
                  </div>
                </div>
                
                {/* Time Filters */}
                <div className="space-y-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Période</span>
                  <div className="grid grid-cols-3 gap-2">
                    {timeFilters.map(filter => (
                      <Button
                        key={filter.id}
                        variant={timeFilter === filter.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTimeFilter(filter.id)}
                        className="text-xs sm:text-sm"
                      >
                        {filter.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Leaderboard Tabs */}
          <Tabs defaultValue="global" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="global" className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Classement Global
              </TabsTrigger>
              <TabsTrigger value="regional" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Par Région
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="global" className="mt-6">
              <Card className="dark:bg-slate-800 dark:border-white/20 border-2 shadow-lg dark:shadow-[0_0_30px_rgba(255,255,255,0.4)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:text-slate-200">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    Top des Apprenants
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {globalUsers.map((user, index) => (
                      <LeaderboardCard
                        key={user.id}
                        user={user}
                        position={index + 1}
                        category={selectedCategory}
                        showTrend={true}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="regional" className="mt-6">
              <Tabs defaultValue="west" className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1">
                  {regions.map(region => (
                    <TabsTrigger 
                      key={region.id} 
                      value={region.id} 
                      className="text-[10px] sm:text-xs px-1 sm:px-3"
                    >
                      <span className="hidden sm:inline">{region.label}</span>
                      <span className="sm:hidden">{region.label.replace('Afrique ', '')}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {regions.map(region => (
                  <TabsContent key={region.id} value={region.id} className="mt-6">
                    <Card className="dark:bg-slate-800 dark:border-white/20 border-2 shadow-lg dark:shadow-[0_0_30px_rgba(255,255,255,0.4)]">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 dark:text-slate-200">
                          <MapPin className="w-5 h-5 text-blue-500" />
                          {region.label}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <RegionalLeaderboard region={region.id} />
                      </CardContent>
                    </Card>
                  </TabsContent>
                ))}
              </Tabs>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Leaderboard;