import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Circle,
  Lock,
  Play,
  FileText,
  Download,
  Clock,
  Target,
  Award,
  Menu,
  X
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import ShareButton from '@/components/ShareButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import dbHelpers from '@/lib/supabaseDB';

/**
 * Page de détail d'un cours avec navigation séquentielle des leçons
 */
const CourseDetail = () => {
  const { matiereId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [matiere, setMatiere] = useState(null);
  const [currentLeconId, setCurrentLeconId] = useState(null);
  const [currentLecon, setCurrentLecon] = useState(null);
  const [userProgress, setUserProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [completing, setCompleting] = useState(false);

  // Charger les données du cours
  useEffect(() => {
    const fetchCourseData = async () => {
      setLoading(true);
      try {
        // Récupérer la matière avec tous ses chapitres et leçons
        const { data: matiereData, error: matiereError } = await dbHelpers.course.getMatiereById(matiereId);
        
        if (matiereError) throw matiereError;
        
        setMatiere(matiereData);

        // Récupérer la progression de l'utilisateur
        if (user) {
          const { data: progressData } = await dbHelpers.progress.getUserProgress(user.id);
          setUserProgress(progressData || []);
        }

        // Sélectionner la première leçon par défaut
        if (matiereData?.chapitres?.length > 0) {
          const firstChapitre = matiereData.chapitres[0];
          if (firstChapitre.lecons?.length > 0) {
            setCurrentLeconId(firstChapitre.lecons[0].id);
          }
        }

      } catch (error) {
        console.error('Error fetching course:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger le cours.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (matiereId) {
      fetchCourseData();
    }
  }, [matiereId, user]);

  // Charger les détails de la leçon courante
  useEffect(() => {
    const fetchLeconDetails = async () => {
      if (!currentLeconId) return;

      try {
        const { data: leconData, error } = await dbHelpers.course.getLecon(currentLeconId);
        
        if (error) throw error;
        
        setCurrentLecon(leconData);
      } catch (error) {
        console.error('Error fetching lecon:', error);
      }
    };

    fetchLeconDetails();
  }, [currentLeconId]);

  // Obtenir toutes les leçons dans l'ordre
  const getAllLecons = () => {
    if (!matiere?.chapitres) return [];
    
    return matiere.chapitres
      .sort((a, b) => a.order - b.order)
      .flatMap(chapitre => 
        (chapitre.lecons || [])
          .sort((a, b) => a.order - b.order)
          .map(lecon => ({
            ...lecon,
            chapitre_title: chapitre.title,
            chapitre_id: chapitre.id
          }))
      );
  };

  const allLecons = getAllLecons();
  const currentIndex = allLecons.findIndex(l => l.id === currentLeconId);
  const hasNext = currentIndex < allLecons.length - 1;
  const hasPrevious = currentIndex > 0;

  // Navigation
  const goToNextLecon = () => {
    if (hasNext) {
      setCurrentLeconId(allLecons[currentIndex + 1].id);
      window.scrollTo(0, 0);
    }
  };

  const goToPreviousLecon = () => {
    if (hasPrevious) {
      setCurrentLeconId(allLecons[currentIndex - 1].id);
      window.scrollTo(0, 0);
    }
  };

  // Vérifier si une leçon est complétée
  const isLeconCompleted = (leconId) => {
    return userProgress.some(p => p.lecon_id === leconId);
  };

  // Calculer le pourcentage de progression
  const getProgressPercentage = () => {
    if (allLecons.length === 0) return 0;
    const completedCount = allLecons.filter(l => isLeconCompleted(l.id)).length;
    return Math.round((completedCount / allLecons.length) * 100);
  };

  // Marquer une leçon comme complétée
  const handleCompleteLecon = async () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour sauvegarder votre progression.",
      });
      return;
    }

    if (isLeconCompleted(currentLeconId)) {
      toast({
        title: "Déjà complété",
        description: "Vous avez déjà terminé cette leçon.",
      });
      return;
    }

    setCompleting(true);
    try {
      const { data, error } = await dbHelpers.progress.completeLecon(user.id, currentLeconId);
      
      if (error) throw error;

      // Mettre à jour la progression locale
      setUserProgress(prev => [...prev, { lecon_id: currentLeconId, user_id: user.id }]);

      // Afficher les points gagnés
      const pointsInfo = data?.points;
      if (pointsInfo) {
        const { points_earned, chapter_bonus, course_bonus, total_points, chapter_completed, course_completed, badges_unlocked, challenges_updated } = pointsInfo;
        
        let description = `+${points_earned} points pour la leçon`;
        if (chapter_bonus > 0) {
          description += ` | 🎯 +${chapter_bonus} pts (chapitre complet !)`;
        }
        if (course_bonus > 0) {
          description += ` | 🏆 +${course_bonus} pts (COURS COMPLET !)`;
        }

        toast({
          title: `✅ +${total_points} points !`,
          description,
          duration: chapter_completed || course_completed ? 5000 : 3000,
        });

        // Afficher les badges débloqués
        if (badges_unlocked && badges_unlocked.length > 0) {
          badges_unlocked.forEach((badge, index) => {
            setTimeout(() => {
              toast({
                title: `🏅 Badge débloqué !`,
                description: `${badge.icon} ${badge.name}`,
                duration: 5000,
              });
            }, (index + 1) * 1500); // Échelonner les toasts de 1.5 secondes
          });
        }

        // Afficher les défis complétés
        if (challenges_updated && challenges_updated.length > 0) {
          const completedChallenges = challenges_updated.filter(c => c.completed);
          const badgeDelay = badges_unlocked ? badges_unlocked.length * 1500 : 0;
          
          completedChallenges.forEach((challenge, index) => {
            setTimeout(() => {
              toast({
                title: `🎯 Défi complété !`,
                description: `${challenge.icon} ${challenge.name} - Réclamez votre récompense dans la page Défis !`,
                duration: 6000,
              });
            }, badgeDelay + (index + 1) * 1500);
          });
        }
      } else {
        toast({
          title: "✅ Leçon terminée !",
          description: "Continuez comme ça !",
        });
      }

      // Passer automatiquement à la leçon suivante
      setTimeout(() => {
        if (hasNext) {
          goToNextLecon();
        }
      }, 1500);

    } catch (error) {
      console.error('Error marking lecon complete:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder votre progression.",
        variant: "destructive"
      });
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">Chargement du cours...</p>
        </div>
      </div>
    );
  }

  if (!matiere) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Cours introuvable</h1>
          <Button onClick={() => navigate('/my-courses')}>Retour aux cours</Button>
        </div>
      </div>
    );
  }

  const progressPercentage = getProgressPercentage();

  return (
    <>
      <Helmet>
        <title>{matiere.name} - Cours détaillé | E-Réussite</title>
        <meta name="description" content={`Cours complet de ${matiere.name} avec leçons, exercices et quiz`} />
      </Helmet>

      <div className="min-h-screen bg-slate-50">
        <Navbar />

        {/* Header du cours */}
        <div className="bg-gradient-to-r from-primary to-accent text-white py-8 mt-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/my-courses')}
                  className="text-white hover:bg-white/20"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Retour aux cours
                </Button>
                
                <ShareButton
                  url={window.location.href}
                  title={`Cours de ${matiere.name}`}
                  description={`Cours complet de ${matiere.name} niveau ${matiere.level === 'bfem' ? 'BFEM' : 'Baccalauréat'} - ${allLecons.length} leçons`}
                  type="course"
                  resourceId={matiereId}
                  options={{
                    tags: [matiere.level, 'cours', matiere.slug]
                  }}
                  variant="ghost"
                  buttonText="Partager"
                  className="text-white hover:bg-white/20"
                />
              </div>
              
              <Button
                variant="ghost"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-white hover:bg-white/20 lg:hidden"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-2">{matiere.name}</h1>
            <p className="text-white/90 mb-4">Niveau : {matiere.level === 'bfem' ? 'BFEM' : 'Baccalauréat'}</p>
            
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>{allLecons.length} leçons</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{allLecons.length * 15} min</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span>{progressPercentage}% complété</span>
              </div>
            </div>

            <div className="mt-4">
              <Progress value={progressPercentage} className="h-2 bg-white/20" />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar - Liste des leçons */}
            <AnimatePresence>
              {(sidebarOpen || window.innerWidth >= 1024) && (
                <motion.aside
                  initial={{ x: -300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  className="lg:col-span-1 fixed lg:relative inset-0 lg:inset-auto z-40 lg:z-0 bg-white lg:bg-transparent"
                >
                  <Card className="sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto dark:bg-slate-800 dark:border-white/20 border-2 shadow-lg dark:shadow-[0_0_30px_rgba(255,255,255,0.4)]">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center justify-between">
                        Programme
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSidebarOpen(false)}
                          className="lg:hidden"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                      {matiere.chapitres?.map((chapitre) => (
                        <div key={chapitre.id} className="mb-4">
                          <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-200 mb-2 px-2">
                            {chapitre.title}
                          </h3>
                          {chapitre.lecons?.map((lecon, idx) => {
                            const isActive = lecon.id === currentLeconId;
                            const isCompleted = isLeconCompleted(lecon.id);
                            const isLocked = !lecon.is_free_preview && !user;

                            return (
                              <button
                                key={lecon.id}
                                onClick={() => !isLocked && setCurrentLeconId(lecon.id)}
                                disabled={isLocked}
                                className={`
                                  w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2
                                  ${isActive ? 'bg-primary text-white' : 'hover:bg-slate-100'}
                                  ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                `}
                              >
                                {isCompleted ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                ) : isLocked ? (
                                  <Lock className="w-4 h-4 flex-shrink-0" />
                                ) : (
                                  <Circle className="w-4 h-4 flex-shrink-0" />
                                )}
                                <span className="flex-1 truncate">
                                  {idx + 1}. {lecon.title}
                                </span>
                                {lecon.is_free_preview && (
                                  <Badge variant="outline" className="text-xs">Gratuit</Badge>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.aside>
              )}
            </AnimatePresence>

            {/* Contenu principal */}
            <div className="lg:col-span-3">
              <Card className="dark:bg-slate-800 dark:border-white/20 border-2 shadow-lg dark:shadow-[0_0_30px_rgba(255,255,255,0.4)]">
                <CardContent className="p-8">
                  {currentLecon ? (
                    <motion.div
                      key={currentLeconId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* En-tête de la leçon */}
                      <div className="mb-6">
                        <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                          <span>{currentLecon.chapitre?.title}</span>
                          <ChevronRight className="w-4 h-4" />
                          <span>Leçon {currentIndex + 1} / {allLecons.length}</span>
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                          {currentLecon.title}
                        </h1>
                        
                        {isLeconCompleted(currentLeconId) && (
                          <Badge className="bg-green-500">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Complété
                          </Badge>
                        )}
                      </div>

                      {/* Vidéo si disponible */}
                      {currentLecon.video_url && (
                        <div className="mb-6 rounded-lg overflow-hidden bg-slate-900 aspect-video">
                          <video
                            controls
                            className="w-full h-full"
                            src={currentLecon.video_url}
                          >
                            Votre navigateur ne supporte pas la lecture de vidéos.
                          </video>
                        </div>
                      )}

                      {/* Contenu de la leçon */}
                      <div className="prose max-w-none mb-8">
                        {currentLecon.content ? (
                          <div dangerouslySetInnerHTML={{ __html: currentLecon.content }} />
                        ) : (
                          <p className="text-slate-600 dark:text-slate-300">
                            Le contenu de cette leçon sera bientôt disponible.
                          </p>
                        )}
                      </div>

                      {/* PDF si disponible */}
                      {currentLecon.pdf_url && (
                        <div className="mb-6 p-4 bg-slate-50 rounded-lg flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-primary" />
                            <div>
                              <p className="font-medium">Document PDF</p>
                              <p className="text-sm text-slate-500">Support de cours</p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            onClick={() => window.open(currentLecon.pdf_url, '_blank')}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Télécharger
                          </Button>
                        </div>
                      )}

                      {/* Bouton marquer comme complété */}
                      {!isLeconCompleted(currentLeconId) && user && (
                        <div className="mb-6">
                          <Button
                            onClick={handleCompleteLecon}
                            disabled={completing}
                            className="w-full bg-green-600 hover:bg-green-700"
                          >
                            {completing ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                Enregistrement...
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Marquer comme complété
                              </>
                            )}
                          </Button>
                        </div>
                      )}

                      {/* Navigation */}
                      <div className="flex items-center justify-between pt-6 border-t">
                        <Button
                          variant="outline"
                          onClick={goToPreviousLecon}
                          disabled={!hasPrevious}
                        >
                          <ChevronLeft className="w-4 h-4 mr-2" />
                          Précédent
                        </Button>

                        <Button
                          onClick={goToNextLecon}
                          disabled={!hasNext}
                          className="bg-primary"
                        >
                          Suivant
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-slate-600 dark:text-slate-300">Sélectionnez une leçon pour commencer</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseDetail;
