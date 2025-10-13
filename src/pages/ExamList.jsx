import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, Clock, Award, Filter, Search, Calendar,
  TrendingUp, Target, BarChart3, CheckCircle2, AlertCircle
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import ShareButton from '@/components/ShareButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const ExamList = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [examens, setExamens] = useState([]);
  const [filteredExamens, setFilteredExamens] = useState([]);
  const [examResults, setExamResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    averageScore: 0,
    bestScore: 0
  });

  // Mapping niveau utilisateur
  const levelMap = { 1: 'bfem', 2: 'bac' };
  const userLevel = levelMap[userProfile?.level] || 'bfem';

  useEffect(() => {
    if (user) {
      fetchExamens();
      fetchExamResults();
    }
  }, [user, userProfile]);

  useEffect(() => {
    filterExamens();
  }, [examens, searchTerm, selectedLevel, selectedType, selectedDifficulty]);

  const fetchExamens = async () => {
    try {
      setLoading(true);
      
      // Récupérer tous les examens avec les infos des matières
      const { data, error } = await supabase
        .from('examens')
        .select(`
          *,
          matiere:matieres(id, name, level)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('📚 Examens récupérés:', data);
      setExamens(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des examens:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de charger les examens'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchExamResults = async () => {
    try {
      const { data, error } = await supabase
        .from('exam_results')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      setExamResults(data || []);
      
      // Calculer les statistiques
      if (data && data.length > 0) {
        const completed = data.length;
        const totalScore = data.reduce((sum, result) => sum + (result.score || 0), 0);
        const averageScore = Math.round(totalScore / completed);
        const bestScore = Math.max(...data.map(r => r.score || 0));

        setStats({
          total: examens.length,
          completed,
          averageScore,
          bestScore
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des résultats:', error);
    }
  };

  const filterExamens = () => {
    let filtered = [...examens];

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(exam => 
        exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par niveau
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(exam => exam.matiere?.level === selectedLevel);
    }

    // Filtre par type
    if (selectedType !== 'all') {
      filtered = filtered.filter(exam => exam.type === selectedType);
    }

    // Filtre par difficulté
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(exam => exam.difficulty === selectedDifficulty);
    }

    setFilteredExamens(filtered);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'facile': return 'bg-green-500';
      case 'moyen': return 'bg-yellow-500';
      case 'difficile': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'blanc': return 'Examen Blanc';
      case 'entrainement': return 'Entraînement';
      case 'officiel': return 'Officiel';
      default: return type;
    }
  };

  const isExamCompleted = (examId) => {
    return examResults.some(result => result.exam_id === examId);
  };

  const getExamScore = (examId) => {
    const result = examResults.find(r => r.exam_id === examId);
    return result ? result.score : null;
  };

  const handleStartExam = (examId) => {
    navigate(`/exam/${examId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-white text-xl">Chargement des examens...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Simulations d'Examens - E-Réussite</title>
        <meta name="description" content="Préparez-vous avec nos examens blancs et simulations" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <Navbar />
        
        <div className="container mx-auto px-4 py-8 pt-24">
          {/* En-tête */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Simulations d'Examens
            </h1>
            <p className="text-xl text-blue-200">
              Préparez-vous efficacement avec nos examens blancs et entraînements
            </p>
          </motion.div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 dark:border-white/30 shadow-lg dark:shadow-[0_0_30px_rgba(255,255,255,0.4)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-200 text-sm">Total Examens</p>
                    <p className="text-3xl font-bold text-white">{examens.length}</p>
                  </div>
                  <BookOpen className="w-12 h-12 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 dark:border-white/30 shadow-lg dark:shadow-[0_0_30px_rgba(255,255,255,0.4)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-200 text-sm">Complétés</p>
                    <p className="text-3xl font-bold text-white">{stats.completed}</p>
                  </div>
                  <CheckCircle2 className="w-12 h-12 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 dark:border-white/30 shadow-lg dark:shadow-[0_0_30px_rgba(255,255,255,0.4)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-200 text-sm">Moyenne</p>
                    <p className="text-3xl font-bold text-white">{stats.averageScore}%</p>
                  </div>
                  <BarChart3 className="w-12 h-12 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 dark:border-white/30 shadow-lg dark:shadow-[0_0_30px_rgba(255,255,255,0.4)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-200 text-sm">Meilleur Score</p>
                    <p className="text-3xl font-bold text-white">{stats.bestScore}%</p>
                  </div>
                  <Award className="w-12 h-12 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtres et Recherche */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 dark:border-white/30 mb-8 shadow-lg dark:shadow-[0_0_30px_rgba(255,255,255,0.4)]">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* Recherche */}
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      type="text"
                      placeholder="Rechercher un examen..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-gray-300"
                    />
                  </div>
                </div>

                {/* Filtre Niveau */}
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="px-4 py-2 bg-white/20 border border-white/30 rounded-md text-white"
                >
                  <option value="all">Tous les niveaux</option>
                  <option value="bfem">BFEM</option>
                  <option value="bac">BAC</option>
                </select>

                {/* Filtre Type */}
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-4 py-2 bg-white/20 border border-white/30 rounded-md text-white"
                >
                  <option value="all">Tous les types</option>
                  <option value="blanc">Examen Blanc</option>
                  <option value="entrainement">Entraînement</option>
                  <option value="officiel">Officiel</option>
                </select>

                {/* Filtre Difficulté */}
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="px-4 py-2 bg-white/20 border border-white/30 rounded-md text-white"
                >
                  <option value="all">Toutes difficultés</option>
                  <option value="facile">Facile</option>
                  <option value="moyen">Moyen</option>
                  <option value="difficile">Difficile</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Liste des examens */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExamens.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-300 text-lg">Aucun examen trouvé</p>
              </div>
            ) : (
              filteredExamens.map((exam, index) => {
                const completed = isExamCompleted(exam.id);
                const score = getExamScore(exam.id);

                return (
                  <motion.div
                    key={exam.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-white/10 backdrop-blur-sm border-white/20 dark:border-white/30 hover:bg-white/20 dark:hover:shadow-[0_0_35px_rgba(255,255,255,0.5)] transition-all h-full flex flex-col shadow-lg dark:shadow-[0_0_25px_rgba(255,255,255,0.3)]">
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <Badge className={`${getDifficultyColor(exam.difficulty)} text-white`}>
                            {exam.difficulty}
                          </Badge>
                          {completed && (
                            <Badge className="bg-green-500 text-white">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Complété
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-white text-lg">
                          {exam.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-blue-200">
                          <BookOpen className="w-4 h-4" />
                          {exam.matiere?.name}
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col">
                        <p className="text-gray-300 text-sm mb-4 flex-1">
                          {exam.description || 'Aucune description disponible'}
                        </p>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-300">
                            <Clock className="w-4 h-4 mr-2" />
                            Durée: {exam.duration_minutes} minutes
                          </div>
                          <div className="flex items-center text-sm text-gray-300">
                            <Target className="w-4 h-4 mr-2" />
                            Type: {getTypeLabel(exam.type)}
                          </div>
                          {exam.year && (
                            <div className="flex items-center text-sm text-gray-300">
                              <Calendar className="w-4 h-4 mr-2" />
                              Année: {exam.year}
                            </div>
                          )}
                          {completed && score !== null && (
                            <div className="flex items-center text-sm text-green-300 font-semibold">
                              <Award className="w-4 h-4 mr-2" />
                              Score: {score}%
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleStartExam(exam.id)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                          >
                            {completed ? 'Refaire l\'examen' : 'Commencer l\'examen'}
                          </Button>
                          
                          <ShareButton
                            url={`${window.location.origin}/exam/${exam.id}`}
                            title={exam.title}
                            description={`Examen de ${exam.matiere?.name} - ${exam.duration_minutes} min - ${exam.difficulty}`}
                            type="exam"
                            resourceId={exam.id}
                            options={{
                              tags: [exam.matiere?.name, exam.type, exam.difficulty]
                            }}
                            variant="outline"
                            showIcon={true}
                            buttonText=""
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ExamList;
