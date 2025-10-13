import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, FileText, Video, Search, BookCopy, Atom, Globe, PenSquare, History, BrainCircuit, Unlock, Download, CheckCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import dbHelpers from '@/lib/supabaseDB';

// Icon mapping pour les matières
const iconMap = {
  'Mathématiques': BookCopy,
  'Physique-Chimie': Atom,
  'SVT': Globe,
  'Français': PenSquare,
  'Histoire-Géographie': History,
  'Anglais': BookOpen,
  'Philosophie': BrainCircuit,
  default: BookOpen
};

const CoursesPrivate = () => {
  const navigate = useNavigate();
  const { user, toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeLevel, setActiveLevel] = useState('bfem');
  const [matieres, setMatieres] = useState([]);
  const [annales, setAnnales] = useState({});
  const [examens, setExamens] = useState({});
  const [fiches, setFiches] = useState({});
  const [quizByChapter, setQuizByChapter] = useState({}); // ✅ AJOUTÉ
  const [loading, setLoading] = useState(true);
  const [userProgress, setUserProgress] = useState([]);

  // Charger les matières depuis Supabase
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch matieres with related data
        const { data: matieresData, error } = await dbHelpers.course.getMatieresByLevel(activeLevel);
        
        if (error) throw error;
        
        setMatieres(matieresData || []);

        // Fetch annales for each matiere
        const annalesPromises = matieresData?.map(async (matiere) => {
          const result = await dbHelpers.course.getAnnales(matiere.id);
          return { matiereId: matiere.id, annales: result.data || [] };
        });
        
        const annalesResults = await Promise.all(annalesPromises || []);
        const annalesMap = {};
        annalesResults.forEach(({ matiereId, annales }) => {
          annalesMap[matiereId] = annales;
        });
        setAnnales(annalesMap);

        // Fetch examens for each matiere
        const examensPromises = matieresData?.map(async (matiere) => {
          const result = await dbHelpers.course.getExamens(matiere.id);
          return { matiereId: matiere.id, examens: result.data || [] };
        });
        
        const examensResults = await Promise.all(examensPromises || []);
        const examensMap = {};
        examensResults.forEach(({ matiereId, examens }) => {
          examensMap[matiereId] = examens;
        });
        setExamens(examensMap);

        // Fetch fiches and quiz for each chapitre
        const fichesMap = {};
        const quizMap = {}; // ✅ AJOUTÉ
        for (const matiere of matieresData || []) {
          for (const chapitre of matiere.chapitres || []) {
            // Fiches
            const fichesResult = await dbHelpers.course.getFichesRevision(chapitre.id);
            fichesMap[chapitre.id] = fichesResult.data || [];
            
            // ✅ AJOUTÉ: Récupérer les quiz pour ce chapitre
            const quizResult = await dbHelpers.quiz.getQuizzesByChapitre(chapitre.id);
            if (quizResult.data && quizResult.data.length > 0) {
              quizMap[chapitre.id] = quizResult.data[0]; // Prendre le premier quiz
            }
          }
        }
        setFiches(fichesMap);
        setQuizByChapter(quizMap); // ✅ AJOUTÉ

        // Fetch user progress if logged in
        if (user) {
          const { data: progressData } = await dbHelpers.progress.getUserProgress(user.id);
          setUserProgress(progressData || []);
        }

      } catch (error) {
        console.error('Error fetching courses:', error);
        toast({
          title: "Erreur de chargement",
          description: "Impossible de charger les cours. Veuillez réessayer.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeLevel, user]);

  const handleViewAnnale = (annale) => {
    if (annale.pdf_url) {
      window.open(annale.pdf_url, '_blank');
    } else {
      toast({
        title: "Document non disponible",
        description: "Ce document sera bientôt disponible.",
      });
    }
  };

  const handleViewVideo = (annale) => {
    if (annale.correction_video_url) {
      window.open(annale.correction_video_url, '_blank');
    } else {
      toast({
        title: "Vidéo non disponible",
        description: "Cette vidéo sera bientôt disponible.",
      });
    }
  };

  const handleViewFiche = (fiche) => {
    if (fiche.pdf_url) {
      window.open(fiche.pdf_url, '_blank');
    } else {
      toast({
        title: "Fiche non disponible",
        description: "Cette fiche sera bientôt disponible.",
      });
    }
  };

  const handleEnrollCourse = async (matiere) => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour vous inscrire à un cours.",
      });
      return;
    }

    // Log activity
    await dbHelpers.activity.logActivity(user.id, 'course_enrollment', {
      matiere_id: matiere.id,
      matiere_name: matiere.name
    });

    toast({
      title: `Inscription à ${matiere.name}`,
      description: "Vous êtes maintenant inscrit à ce cours ! 🎉",
    });
  };

  const handleDownload = (matiere) => {
    toast({
      title: `Téléchargement de "${matiere.name}"`,
      description: "La fonctionnalité de téléchargement hors-ligne sera bientôt disponible. 🚀",
    });
  };

  const filteredMatieres = matieres.filter(matiere =>
    matiere.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getIcon = (matiereNam) => {
    return iconMap[matiereNam] || iconMap.default;
  };

  const isLeconCompleted = (leconId) => {
    return userProgress.some(progress => progress.lecon_id === leconId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">Chargement des cours...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Nos Cours - BFEM et BAC Sénégal, Côte d'Ivoire</title>
        <meta name="description" content="Découvrez nos cours en ligne pour le BFEM et le Baccalauréat. Programmes complets avec professeurs experts pour le Sénégal, la Côte d'Ivoire et l'Afrique francophone." />
        <meta name="keywords" content="cours en ligne, révisions BFEM Sénégal, préparation BAC Côte d'Ivoire, e-learning Afrique" />
      </Helmet>

      <div className="min-h-screen bg-white dark:bg-slate-900">
        <Navbar />

        <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-900">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h1 className="text-5xl md:text-6xl font-bold font-heading text-slate-900 dark:text-white mb-6">
                Nos <span className="text-primary dark:text-blue-400">Parcours</span>
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                Un catalogue de cours rigoureux pour une préparation d'excellence, du collège au lycée.
              </p>
            </motion.div>

            <Tabs value={activeLevel} onValueChange={setActiveLevel} className="w-full">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
                <TabsList>
                  <TabsTrigger value="bfem">Collège (BFEM)</TabsTrigger>
                  <TabsTrigger value="bac">Lycée (Baccalauréat)</TabsTrigger>
                </TabsList>
                <div className="relative w-full sm:w-auto sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Rechercher une matière..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <TabsContent value={activeLevel}>
                {filteredMatieres.length === 0 ? (
                  <p className="text-center text-slate-500 py-12">
                    {matieres.length === 0 
                      ? "Aucun cours disponible pour ce niveau. Revenez bientôt !" 
                      : "Aucun cours ne correspond à votre recherche."}
                  </p>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredMatieres.map((matiere, index) => {
                      const Icon = getIcon(matiere.name);
                      const totalLecons = matiere.chapitres?.reduce((sum, ch) => sum + (ch.lecons?.length || 0), 0) || 0;
                      const freePreviewCount = matiere.chapitres?.reduce((sum, ch) => 
                        sum + (ch.lecons?.filter(l => l.is_free_preview).length || 0), 0) || 0;

                      return (
                        <motion.div
                          key={matiere.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.05 }}
                          className="flex"
                        >
                          <Card className="hover-lift h-full flex flex-col w-full dark:bg-slate-800 dark:border-white/20 border-2 shadow-lg dark:shadow-[0_0_30px_rgba(255,255,255,0.4)] dark:hover:shadow-[0_0_35px_rgba(255,255,255,0.5)] transition-all duration-300">
                            <CardHeader>
                              <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                  <Icon className="w-6 h-6 text-primary" />
                                </div>
                                <div className="flex items-center gap-3">
                                  {freePreviewCount > 0 && (
                                    <div className="flex items-center gap-1 text-green-600">
                                      <Unlock size={14} />
                                      <span className="text-sm font-semibold">{freePreviewCount} gratuit{freePreviewCount > 1 ? 's' : ''}</span>
                                    </div>
                                  )}
                                  <Button variant="ghost" size="icon" onClick={() => handleDownload(matiere)}>
                                    <Download className="w-5 h-5 text-slate-500" />
                                  </Button>
                                </div>
                              </div>
                              <CardTitle className="text-xl">{matiere.name}</CardTitle>
                              <CardDescription>
                                {matiere.chapitres?.length || 0} chapitres • {totalLecons} leçons
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow flex flex-col justify-end">
                              <Accordion type="single" collapsible className="w-full">
                                {/* Annales */}
                                <AccordionItem value="annales">
                                  <AccordionTrigger>
                                    Annales Corrigées ({annales[matiere.id]?.length || 0})
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    <ul className="space-y-2">
                                      {annales[matiere.id]?.length > 0 ? (
                                        annales[matiere.id].map((annale) => (
                                          <li key={annale.id} className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-slate-100">
                                            <span>{annale.title}</span>
                                            <div className="flex gap-2">
                                              <FileText 
                                                className="w-4 h-4 text-primary cursor-pointer" 
                                                onClick={() => handleViewAnnale(annale)} 
                                                title="Voir le PDF"
                                              />
                                              {annale.correction_video_url && (
                                                <Video 
                                                  className="w-4 h-4 text-accent cursor-pointer" 
                                                  onClick={() => handleViewVideo(annale)}
                                                  title="Voir la vidéo"
                                                />
                                              )}
                                            </div>
                                          </li>
                                        ))
                                      ) : (
                                        <p className="text-xs text-slate-400">Aucune annale disponible pour le moment.</p>
                                      )}
                                    </ul>
                                  </AccordionContent>
                                </AccordionItem>

                                {/* Examens Corrigés */}
                                <AccordionItem value="examens">
                                  <AccordionTrigger>
                                    Examens Corrigés ({examens[matiere.id]?.length || 0})
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    <ul className="space-y-2">
                                      {examens[matiere.id]?.length > 0 ? (
                                        examens[matiere.id].map((examen) => (
                                          <li key={examen.id} className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-slate-100 border border-slate-200">
                                            <div className="flex-1">
                                              <div className="font-medium text-slate-800 dark:text-slate-100">{examen.title}</div>
                                              <div className="flex gap-2 items-center mt-1">
                                                <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">
                                                  {examen.type === 'blanc' ? 'Examen blanc' : examen.type === 'entrainement' ? 'Entraînement' : 'Officiel'}
                                                </span>
                                                <span className="text-xs text-slate-500">
                                                  {examen.duration_minutes} min
                                                </span>
                                                {examen.difficulty && (
                                                  <span className={`text-xs px-2 py-0.5 rounded ${
                                                    examen.difficulty === 'facile' ? 'bg-green-100 text-green-700' :
                                                    examen.difficulty === 'moyen' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                                  }`}>
                                                    {examen.difficulty}
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                            <div className="flex gap-2">
                                              <FileText 
                                                className="w-4 h-4 text-primary cursor-pointer" 
                                                onClick={() => handleViewAnnale(examen)} 
                                                title="Voir le PDF"
                                              />
                                              {examen.correction_video_url && (
                                                <Video 
                                                  className="w-4 h-4 text-accent cursor-pointer" 
                                                  onClick={() => handleViewVideo(examen)}
                                                  title="Voir la vidéo de correction"
                                                />
                                              )}
                                            </div>
                                          </li>
                                        ))
                                      ) : (
                                        <p className="text-xs text-slate-400">Aucun examen disponible pour le moment.</p>
                                      )}
                                    </ul>
                                  </AccordionContent>
                                </AccordionItem>

                                {/* Chapitres */}
                                <AccordionItem value="chapitres">
                                  <AccordionTrigger>
                                    Chapitres ({matiere.chapitres?.length || 0})
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    <ul className="space-y-2">
                                      {matiere.chapitres?.length > 0 ? (
                                        matiere.chapitres.map((chapitre) => (
                                          <li key={chapitre.id} className="text-sm p-3 rounded-md hover:bg-slate-100 border border-slate-200">
                                            <div className="font-medium text-slate-800 dark:text-slate-100">{chapitre.title}</div>
                                            <div className="text-xs text-slate-500 mt-1">
                                              {chapitre.lecons?.length || 0} leçon{chapitre.lecons?.length > 1 ? 's' : ''}
                                              {fiches[chapitre.id]?.length > 0 && ` • ${fiches[chapitre.id].length} fiche${fiches[chapitre.id].length > 1 ? 's' : ''}`}
                                            </div>
                                            {/* Progress indicator */}
                                            {user && chapitre.lecons?.length > 0 && (
                                              <div className="mt-2">
                                                <div className="flex items-center gap-2 text-xs">
                                                  <div className="flex-1 bg-slate-200 rounded-full h-1.5">
                                                    <div 
                                                      className="bg-green-500 h-1.5 rounded-full"
                                                      style={{
                                                        width: `${(chapitre.lecons.filter(l => isLeconCompleted(l.id)).length / chapitre.lecons.length) * 100}%`
                                                      }}
                                                    />
                                                  </div>
                                                  <span className="text-slate-500">
                                                    {chapitre.lecons.filter(l => isLeconCompleted(l.id)).length}/{chapitre.lecons.length}
                                                  </span>
                                                </div>
                                              </div>
                                            )}
                                            {/* Quiz Button */}
                                            {quizByChapter[chapitre.id] && (
                                              <Button 
                                                size="sm"
                                                onClick={() => window.location.href = `/quiz/${quizByChapter[chapitre.id].id}`}
                                                className="mt-3 w-full bg-primary hover:bg-primary/90"
                                              >
                                                🎯 Faire le quiz
                                              </Button>
                                            )}
                                          </li>
                                        ))
                                      ) : (
                                        <p className="text-xs text-slate-400">Aucun chapitre disponible.</p>
                                      )}
                                    </ul>
                                  </AccordionContent>
                                </AccordionItem>
                              </Accordion>

                              <Button 
                                onClick={() => navigate(`/course/${matiere.id}`)}
                                className="w-full bg-accent text-white hover:bg-accent/90 mt-4"
                              >
                                <BookOpen className="w-4 h-4 mr-2" />
                                Commencer le cours
                              </Button>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </div>
    </>
  );
};

export default CoursesPrivate;
