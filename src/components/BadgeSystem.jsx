import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Star, Target, Zap, BookOpen, Brain, Clock, 
  Award, Medal, Crown, Flame, Heart, Users, TrendingUp,
  Calendar, CheckCircle, Lock, Gift, Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/hooks/use-toast';

// Mapping entre les noms de badges en DB et les IDs de définition
const DB_BADGE_MAPPING = {
  'Apprenant Assidu': 'knowledge_seeker',
  'Finisseur': 'chapter_master',
  'Maître de cours': 'course_champion',
  'Série d\'apprentissage': 'daily_learner',
  'Expert': 'wisdom_keeper',
  'Premier Pas': 'first_lesson',
  'Excellence': 'perfect_score',
  'Maître des Quiz': 'quiz_master',
  'Génie des Maths': 'math_genius',
  'Apprenant Quotidien': 'daily_learner',
  'Dévouement': 'dedication',
  'Main Tendue': 'helping_hand',
  'Leader Communautaire': 'community_leader',
  'Sagesse du Baobab': 'baobab_wisdom',
  'Esprit Ubuntu': 'ubuntu_spirit'
};

// Badge definitions with African cultural elements
const BADGE_DEFINITIONS = {
  // Learning Badges
  'first_lesson': {
    id: 'first_lesson',
    name: 'Premier Pas',
    description: 'Compléter votre première leçon',
    icon: BookOpen,
    color: 'bg-blue-500',
    category: 'learning',
    points: 10,
    rarity: 'common'
  },
  'knowledge_seeker': {
    id: 'knowledge_seeker',
    name: 'Apprenant Assidu',
    description: 'Compléter 10 leçons',
    icon: Brain,
    color: 'bg-purple-500',
    category: 'learning',
    points: 50,
    rarity: 'uncommon',
    requirement: { type: 'lessons_completed', value: 10 }
  },
  'chapter_master': {
    id: 'chapter_master',
    name: 'Finisseur',
    description: 'Compléter 5 chapitres',
    icon: BookOpen,
    color: 'bg-green-500',
    category: 'learning',
    points: 100,
    rarity: 'rare',
    requirement: { type: 'chapters_completed', value: 5 }
  },
  'course_champion': {
    id: 'course_champion',
    name: 'Maître de cours',
    description: 'Compléter 1 cours complet',
    icon: Trophy,
    color: 'bg-yellow-500',
    category: 'learning',
    points: 150,
    rarity: 'epic',
    requirement: { type: 'courses_completed', value: 1 }
  },
  'wisdom_keeper': {
    id: 'wisdom_keeper',
    name: 'Expert',
    description: 'Compléter 3 cours complets',
    icon: Crown,
    color: 'bg-yellow-500',
    category: 'learning',
    points: 200,
    rarity: 'rare',
    requirement: { type: 'lessons_completed', value: 50 }
  },
  
  // Performance Badges
  'perfect_score': {
    id: 'perfect_score',
    name: 'Excellence',
    description: 'Obtenir 100% à un quiz',
    icon: Star,
    color: 'bg-yellow-400',
    category: 'performance',
    points: 25,
    rarity: 'uncommon'
  },
  'quiz_master': {
    id: 'quiz_master',
    name: 'Maître des Quiz',
    description: 'Réussir 20 quiz consécutifs',
    icon: Trophy,
    color: 'bg-orange-500',
    category: 'performance',
    points: 100,
    rarity: 'rare',
    requirement: { type: 'consecutive_quiz_success', value: 20 }
  },
  'math_genius': {
    id: 'math_genius',
    name: 'Génie des Maths',
    description: 'Excellence en mathématiques',
    icon: Target,
    color: 'bg-green-500',
    category: 'subject',
    points: 75,
    rarity: 'rare'
  },
  
  // Consistency Badges
  'daily_learner': {
    id: 'daily_learner',
    name: 'Série d\'apprentissage',
    description: 'Se connecter 7 jours consécutifs',
    icon: Flame,
    color: 'bg-orange-600',
    category: 'consistency',
    points: 30,
    rarity: 'uncommon',
    requirement: { type: 'daily_streak', value: 7 }
  },
  'dedication': {
    id: 'dedication',
    name: 'Dévouement',
    description: 'Se connecter 30 jours consécutifs',
    icon: Flame,
    color: 'bg-red-500',
    category: 'consistency',
    points: 150,
    rarity: 'epic',
    requirement: { type: 'daily_streak', value: 30 }
  },
  
  // Social Badges
  'helping_hand': {
    id: 'helping_hand',
    name: 'Main Tendue',
    description: 'Aider 5 autres étudiants',
    icon: Heart,
    color: 'bg-pink-500',
    category: 'social',
    points: 40,
    rarity: 'uncommon',
    requirement: { type: 'help_others', value: 5 }
  },
  'community_leader': {
    id: 'community_leader',
    name: 'Leader Communautaire',
    description: 'Être dans le top 10 du classement',
    icon: Users,
    color: 'bg-indigo-500',
    category: 'social',
    points: 100,
    rarity: 'epic'
  },
  
  // Special African-themed badges
  'baobab_wisdom': {
    id: 'baobab_wisdom',
    name: 'Sagesse du Baobab',
    description: 'Accumuler 1000 points de connaissance',
    icon: Crown,
    color: 'bg-amber-600',
    category: 'special',
    points: 250,
    rarity: 'legendary',
    requirement: { type: 'total_points', value: 1000 }
  },
  'ubuntu_spirit': {
    id: 'ubuntu_spirit',
    name: 'Esprit Ubuntu',
    description: 'Incarner l\'entraide et la solidarité',
    icon: Users,
    color: 'bg-emerald-600',
    category: 'special',
    points: 200,
    rarity: 'legendary'
  }
};

const BadgeCard = ({ badge, earned = false, progress = 0, onClick }) => {
  const IconComponent = badge.icon;
  const rarityColors = {
    common: 'border-slate-300 dark:border-white/20',
    uncommon: 'border-blue-400 dark:border-white/30',
    rare: 'border-purple-400 dark:border-white/40',
    epic: 'border-orange-400 dark:border-white/50',
    legendary: 'border-yellow-400 dark:border-white/60'
  };

  const rarityGlow = {
    common: 'shadow-lg dark:shadow-[0_0_30px_rgba(255,255,255,0.4)]',
    uncommon: 'shadow-lg dark:shadow-[0_0_35px_rgba(255,255,255,0.5)]',
    rare: 'shadow-lg dark:shadow-[0_0_40px_rgba(255,255,255,0.6)]',
    epic: 'shadow-lg dark:shadow-[0_0_45px_rgba(255,255,255,0.7)]',
    legendary: 'shadow-xl dark:shadow-[0_0_50px_rgba(255,255,255,0.9)]'
  };

  const rarityGlowLocked = {
    common: 'shadow-sm dark:shadow-[0_0_15px_rgba(255,255,255,0.15)]',
    uncommon: 'shadow-sm dark:shadow-[0_0_18px_rgba(255,255,255,0.2)]',
    rare: 'shadow-sm dark:shadow-[0_0_20px_rgba(255,255,255,0.25)]',
    epic: 'shadow-md dark:shadow-[0_0_25px_rgba(255,255,255,0.3)]',
    legendary: 'shadow-md dark:shadow-[0_0_28px_rgba(255,255,255,0.35)]'
  };

  return (
    <motion.div
      whileHover={{ scale: earned ? 1.05 : 1.02 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`relative cursor-pointer ${earned ? 'opacity-100' : 'opacity-60'}`}
    >
      <Card className={`${rarityColors[badge.rarity]} ${
        earned ? rarityGlow[badge.rarity] : rarityGlowLocked[badge.rarity]
      } dark:bg-slate-800 transition-all duration-300 border-2 ${
        earned 
          ? 'dark:border-white/30 dark:shadow-[0_0_50px_rgba(255,255,255,0.3),inset_0_0_20px_rgba(255,255,255,0.05)]' 
          : 'dark:border-slate-700 dark:shadow-[0_0_20px_rgba(255,255,255,0.1)]'
      }`}>
        <CardContent className="p-4 text-center">
          <div className={`w-16 h-16 mx-auto mb-3 rounded-full ${badge.color} flex items-center justify-center relative`}>
            {earned ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <IconComponent className="w-8 h-8 text-white" />
              </motion.div>
            ) : (
              <Lock className="w-8 h-8 text-white opacity-70" />
            )}
            
            {badge.rarity === 'legendary' && earned && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-2 border-yellow-300"
              />
            )}
          </div>
          
          <h3 className={`font-semibold text-sm mb-2 ${earned ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'}`}>
            {badge.name}
          </h3>
          
          <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
            {badge.description}
          </p>
          
          {!earned && progress > 0 && (
            <div className="mb-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{Math.round(progress)}% complété</p>
            </div>
          )}
          
          <div className="flex items-center justify-center gap-2 text-xs">
            <Star className="w-3 h-3 text-yellow-500" />
            <span className="font-medium">{badge.points} pts</span>
          </div>
          
          <div className={`mt-2 px-2 py-1 rounded-full text-xs font-medium ${
            badge.rarity === 'common' ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300' :
            badge.rarity === 'uncommon' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' :
            badge.rarity === 'rare' ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300' :
            badge.rarity === 'epic' ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300' :
            'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300'
          }`}>
            {badge.rarity === 'common' ? 'Commun' :
             badge.rarity === 'uncommon' ? 'Peu commun' :
             badge.rarity === 'rare' ? 'Rare' :
             badge.rarity === 'epic' ? 'Épique' :
             'Légendaire'}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const BadgeDetails = ({ badge, earned, onClose }) => {
  if (!badge) return null;

  const IconComponent = badge.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full shadow-2xl dark:shadow-[0_0_40px_rgba(96,165,250,0.4)]"
      >
        <div className="text-center">
          <div className={`w-24 h-24 mx-auto mb-4 rounded-full ${badge.color} flex items-center justify-center relative`}>
            <IconComponent className="w-12 h-12 text-white" />
            {earned && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1"
              >
                <CheckCircle className="w-6 h-6 text-white" />
              </motion.div>
            )}
          </div>
          
          <h2 className="text-2xl font-bold mb-2 dark:text-slate-100">{badge.name}</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-4">{badge.description}</p>
          
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="font-semibold dark:text-slate-200">{badge.points} points</span>
            </div>
            <div className="flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span className="capitalize dark:text-slate-200">{badge.rarity}</span>
            </div>
          </div>
          
          {badge.requirement && (
            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3 mb-4">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                <strong>Condition :</strong> {badge.requirement.type.replace('_', ' ')} - {badge.requirement.value}
              </p>
            </div>
          )}
          
          <Button onClick={onClose} className="w-full">
            Fermer
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const BadgeSystem = () => {
  const [userBadges, setUserBadges] = useState([]);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({});
  const { user, userStats } = useAuth();
  const { toast } = useToast();

  const fetchUserBadges = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      // Récupérer les badges gagnés (données directes)
      const { data: badgesData, error } = await supabase
        .from("user_badges")
        .select('id, badge_name, badge_icon, badge_description, badge_type, earned_at')
        .eq("user_id", user.id);
      
      if (error) {
        console.error('Error fetching badges:', error);
        throw error;
      }
      
      console.log('📛 Badges from DB:', badgesData);
      
      // Extraire les noms de badges déjà gagnés
      const earnedBadgeNames = badgesData?.map(b => b.badge_name).filter(Boolean) || [];
      
      setEarnedBadges(earnedBadgeNames);
      setUserBadges(badgeIds);
      
    } catch (error) {
      console.error('Error fetching badges:', error);
      setUserBadges([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const calculateProgress = useCallback(() => {
    const progressData = {};
    
    Object.values(BADGE_DEFINITIONS).forEach(badge => {
      if (badge.requirement && userStats) {
        const { type, value } = badge.requirement;
        let currentValue = 0;
        
        switch (type) {
          case 'lessons_completed':
            currentValue = userStats.lessons_completed || 0;
            break;
          case 'quiz_success':
            currentValue = userStats.quiz_success || 0;
            break;
          case 'daily_streak':
            currentValue = userStats.current_streak || 0;
            break;
          case 'total_points':
            currentValue = userStats.total_points || 0;
            break;
          case 'help_others':
            currentValue = userStats.help_count || 0;
            break;
        }
        
        progressData[badge.id] = Math.min((currentValue / value) * 100, 100);
      }
    });
    
    setProgress(progressData);
  }, [userStats]);

  useEffect(() => {
    if (user) {
      fetchUserBadges();
      calculateProgress();
    } else {
      setLoading(false);
    }
  }, [user, fetchUserBadges, calculateProgress]);

  const categories = {
    learning: 'Apprentissage',
    performance: 'Performance',
    consistency: 'Régularité',
    social: 'Social',
    special: 'Spéciaux'
  };

  const getEarnedBadges = () => Object.values(BADGE_DEFINITIONS).filter(badge => userBadges.includes(badge.id));
  const getTotalPoints = () => getEarnedBadges().reduce((sum, badge) => sum + badge.points, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="dark:bg-slate-800 dark:border-white/20 shadow-lg dark:shadow-[0_0_30px_rgba(255,255,255,0.4)]">
          <CardContent className="p-6 text-center">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
            <div className="text-2xl font-bold dark:text-slate-100">{getEarnedBadges().length}</div>
            <div className="text-sm text-slate-600 dark:text-slate-300">Badges obtenus</div>
          </CardContent>
        </Card>
        
        <Card className="dark:bg-slate-800 dark:border-white/20 shadow-lg dark:shadow-[0_0_30px_rgba(255,255,255,0.4)]">
          <CardContent className="p-6 text-center">
            <Star className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold dark:text-slate-100">{getTotalPoints()}</div>
            <div className="text-sm text-slate-600 dark:text-slate-300">Points de badges</div>
          </CardContent>
        </Card>
        
        <Card className="dark:bg-slate-800 dark:border-white/20 shadow-lg dark:shadow-[0_0_30px_rgba(255,255,255,0.4)]">
          <CardContent className="p-6 text-center">
            <Target className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold dark:text-slate-100">{Object.keys(BADGE_DEFINITIONS).length - getEarnedBadges().length}</div>
            <div className="text-sm text-slate-600 dark:text-slate-300">À débloquer</div>
          </CardContent>
        </Card>
      </div>

      {/* Badges by Category */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">Tous</TabsTrigger>
          {Object.entries(categories).map(([key, label]) => (
            <TabsTrigger key={key} value={key}>{label}</TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Object.values(BADGE_DEFINITIONS).map(badge => (
              <BadgeCard
                key={badge.id}
                badge={badge}
                earned={userBadges.includes(badge.id)}
                progress={progress[badge.id] || 0}
                onClick={() => setSelectedBadge(badge)}
              />
            ))}
          </div>
        </TabsContent>
        
        {Object.entries(categories).map(([category, label]) => (
          <TabsContent key={category} value={category} className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Object.values(BADGE_DEFINITIONS)
                .filter(badge => badge.category === category)
                .map(badge => (
                  <BadgeCard
                    key={badge.id}
                    badge={badge}
                    earned={userBadges.includes(badge.id)}
                    progress={progress[badge.id] || 0}
                    onClick={() => setSelectedBadge(badge)}
                  />
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Badge Details Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <BadgeDetails
            badge={selectedBadge}
            earned={userBadges.includes(selectedBadge.id)}
            onClose={() => setSelectedBadge(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default BadgeSystem;