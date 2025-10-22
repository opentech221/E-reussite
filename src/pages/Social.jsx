import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Share2,
  MessageCircle,
  UserPlus,
  Trophy,
  Target,
  BookOpen,
  Heart,
  MessageSquare,
  Send,
  Copy,
  Check,
  ExternalLink,
  TrendingUp,
  Award,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { trackEvent } from '@/lib/analytics';

const Social = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('feed');
  const [userStats, setUserStats] = useState(null);
  const [recentAchievements, setRecentAchievements] = useState([]);
  const [studyFeed, setStudyFeed] = useState([]);
  const [shareText, setShareText] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSocialData();
      trackEvent('page_view', { page: 'social', user_id: user.id });
    }
  }, [user]);

  const fetchSocialData = async () => {
    setLoading(true);
    try {
      // 1. Récupérer les stats utilisateur
      const { data: pointsData } = await supabase
        .from('user_points')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setUserStats(pointsData);

      // 2. Récupérer badges récents
      const { data: badgesData } = await supabase
        .from('user_badges')
        .select(`
          *,
          badges:badge_id (
            name,
            description,
            icon
          )
        `)
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false })
        .limit(5);

      setRecentAchievements(badgesData || []);

      // 3. Feed d'activité (simulation)
      const mockFeed = [
        {
          id: 1,
          type: 'achievement',
          user_name: 'Amina Diallo',
          action: 'a obtenu le badge',
          badge: '🏆 Expert Maths',
          time: '5 min',
          likes: 12
        },
        {
          id: 2,
          type: 'quiz',
          user_name: 'Moussa Traoré',
          action: 'a réussi un quiz avec',
          score: '95%',
          subject: 'Physique',
          time: '15 min',
          likes: 8
        },
        {
          id: 3,
          type: 'streak',
          user_name: 'Fatou Ndiaye',
          action: 'a atteint un streak de',
          streak: '30 jours',
          time: '1h',
          likes: 15
        },
        {
          id: 4,
          type: 'challenge',
          user_name: 'Koffi Amoussou',
          action: 'a complété le défi',
          challenge: '📚 Semaine studieuse',
          time: '2h',
          likes: 10
        }
      ];

      setStudyFeed(mockFeed);

    } catch (error) {
      console.error('Error fetching social data:', error);
    } finally {
      setLoading(false);
    }
  };

  const shareAchievement = (achievement) => {
    const text = `🎉 J'ai obtenu le badge "${achievement.badges.name}" sur E-Réussite ! ${achievement.badges.description}`;
    const url = `${window.location.origin}/profile/${user.id}`;
    
    trackEvent('share_achievement', { user_id: user.id, badge_id: achievement.badge_id });

    // Partage natif si disponible
    if (navigator.share) {
      navigator.share({
        title: 'Mon succès sur E-Réussite',
        text: text,
        url: url
      }).catch(err => console.log('Error sharing:', err));
    } else {
      // Fallback: copier dans le presse-papiers
      navigator.clipboard.writeText(`${text}\n${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: 'Lien copié !',
        description: 'Partagez votre réussite avec vos amis',
      });
    }
  };

  const shareQuizResult = () => {
    if (!userStats) return;

    const text = `📊 Mes stats sur E-Réussite:\n✅ ${userStats.quizzes_completed} quiz complétés\n🏆 ${userStats.total_points} points\n⭐ ${userStats.badges_count || 0} badges\nRejoignez-moi !`;
    const url = window.location.origin;

    trackEvent('share_stats', { user_id: user.id });

    if (navigator.share) {
      navigator.share({
        title: 'Mes progrès sur E-Réussite',
        text: text,
        url: url
      });
    } else {
      navigator.clipboard.writeText(`${text}\n${url}`);
      toast({
        title: 'Stats copiées !',
        description: 'Partagez vos progrès sur les réseaux sociaux',
      });
    }
  };

  const generateShareableLink = () => {
    const baseUrl = window.location.origin;
    const referralCode = user.id.substring(0, 8);
    const shareUrl = `${baseUrl}?ref=${referralCode}`;

    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    toast({
      title: 'Lien de parrainage copié !',
      description: 'Partagez ce lien pour inviter vos amis',
    });

    trackEvent('generate_referral_link', { user_id: user.id });
  };

  const likePost = (postId) => {
    trackEvent('like_post', { user_id: user.id, post_id: postId });
    
    // Mettre à jour localement
    setStudyFeed(feed => feed.map(post => 
      post.id === postId 
        ? { ...post, likes: post.likes + 1, liked: true }
        : post
    ));

    toast({
      title: '❤️ Vous aimez ça !',
      description: 'Votre like a été enregistré',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Social & Partage - E-Réussite</title>
        <meta name="description" content="Partagez vos réussites et connectez-vous avec d'autres étudiants" />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 mb-4">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Social & Partage
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Partagez vos réussites et connectez-vous avec la communauté
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - User Profile Summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Vos Réussites
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {userStats && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Points totaux</span>
                      <Badge variant="default" className="text-lg">
                        🏆 {userStats.total_points}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Quiz complétés</span>
                      <span className="font-semibold">✅ {userStats.quizzes_completed}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Badges gagnés</span>
                      <span className="font-semibold">⭐ {recentAchievements.length}</span>
                    </div>
                  </>
                )}

                <Button 
                  onClick={shareQuizResult}
                  className="w-full mt-4"
                  variant="outline"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Partager mes stats
                </Button>
              </CardContent>
            </Card>

            {/* Referral Card */}
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                  <UserPlus className="h-5 w-5" />
                  Inviter des amis
                </CardTitle>
                <CardDescription className="text-blue-800 dark:text-blue-200">
                  Gagnez 50 points par ami invité
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={generateShareableLink}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Lien copié !
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copier le lien
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Derniers Badges
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentAchievements.length === 0 ? (
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-4">
                    Pas encore de badges
                  </p>
                ) : (
                  recentAchievements.map(achievement => (
                    <div 
                      key={achievement.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{achievement.badges.icon}</div>
                        <div>
                          <p className="font-semibold text-sm">{achievement.badges.name}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {new Date(achievement.earned_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => shareAchievement(achievement)}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column - Social Feed */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="feed">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Fil d'actualité
                </TabsTrigger>
                <TabsTrigger value="share">
                  <Share2 className="h-4 w-4 mr-2" />
                  Partager
                </TabsTrigger>
              </TabsList>

              {/* Feed Tab */}
              <TabsContent value="feed" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Activités récentes</CardTitle>
                    <CardDescription>
                      Découvrez ce que font les autres étudiants
                    </CardDescription>
                  </CardHeader>
                </Card>

                <AnimatePresence>
                  {studyFeed.map(post => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            <Avatar>
                              <AvatarFallback>
                                {post.user_name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold">{post.user_name}</span>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  • {post.time}
                                </span>
                              </div>
                              
                              <p className="text-gray-700 dark:text-gray-300 mb-3">
                                {post.action}{' '}
                                <span className="font-semibold text-primary">
                                  {post.badge || post.score || post.streak || post.challenge}
                                </span>
                                {post.subject && ` en ${post.subject}`}
                              </p>

                              <div className="flex items-center gap-4">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => likePost(post.id)}
                                  className={post.liked ? 'text-red-500' : ''}
                                >
                                  <Heart className={`h-4 w-4 mr-1 ${post.liked ? 'fill-current' : ''}`} />
                                  {post.likes}
                                </Button>
                                <Button size="sm" variant="ghost">
                                  <MessageSquare className="h-4 w-4 mr-1" />
                                  Commenter
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </TabsContent>

              {/* Share Tab */}
              <TabsContent value="share" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Partager une réussite</CardTitle>
                    <CardDescription>
                      Célébrez vos accomplissements avec la communauté
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="Parlez de votre dernière réussite..."
                      value={shareText}
                      onChange={(e) => setShareText(e.target.value)}
                      rows={4}
                    />
                    <Button className="w-full" disabled={!shareText.trim()}>
                      <Send className="h-4 w-4 mr-2" />
                      Publier
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Partages rapides</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button 
                      variant="outline" 
                      className="h-auto py-4 flex-col gap-2"
                      onClick={shareQuizResult}
                    >
                      <Trophy className="h-8 w-8 text-yellow-500" />
                      <span>Partager mes stats</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="h-auto py-4 flex-col gap-2"
                      onClick={generateShareableLink}
                    >
                      <UserPlus className="h-8 w-8 text-blue-500" />
                      <span>Inviter des amis</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="h-auto py-4 flex-col gap-2"
                      onClick={() => navigate('/badges')}
                    >
                      <Award className="h-8 w-8 text-purple-500" />
                      <span>Voir mes badges</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="h-auto py-4 flex-col gap-2"
                      onClick={() => navigate('/leaderboard')}
                    >
                      <TrendingUp className="h-8 w-8 text-green-500" />
                      <span>Classement</span>
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Social;
