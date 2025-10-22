import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/config/supabaseClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Star, 
  Filter, 
  Calendar,
  BookOpen,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  StickyNote
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function QuizReview() {
  const { user } = useAuth();
  const [quizResults, setQuizResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [favorites, setFavorites] = useState(new Set());
  const [notes, setNotes] = useState({});
  const [stats, setStats] = useState({
    total: 0,
    favorites: 0,
    notes: 0,
    averageScore: 0
  });

  useEffect(() => {
    if (user?.id) {
      loadQuizResults();
      loadFavorites();
      loadNotes();
    }
  }, [user?.id]);

  useEffect(() => {
    filterResults();
  }, [quizResults, searchQuery, selectedSubject, selectedDifficulty]);

  const loadQuizResults = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('quiz_results')
        .select(`
          id,
          quiz_id,
          score,
          correct_answers,
          total_questions,
          time_taken,
          completed_at,
          quiz:quiz_id (
            id,
            title,
            difficulty,
            chapitres:chapitre_id (
              id,
              title,
              matieres:matiere_id (
                id,
                name
              )
            )
          )
        `)
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (error) throw error;

      setQuizResults(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('❌ Erreur chargement quiz results:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const stored = localStorage.getItem(`quiz-favorites-${user.id}`);
      if (stored) {
        setFavorites(new Set(JSON.parse(stored)));
      }
    } catch (error) {
      console.error('❌ Erreur chargement favoris:', error);
    }
  };

  const loadNotes = async () => {
    try {
      const stored = localStorage.getItem(`quiz-notes-${user.id}`);
      if (stored) {
        setNotes(JSON.parse(stored));
      }
    } catch (error) {
      console.error('❌ Erreur chargement notes:', error);
    }
  };

  const toggleFavorite = (quizResultId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(quizResultId)) {
      newFavorites.delete(quizResultId);
    } else {
      newFavorites.add(quizResultId);
    }
    setFavorites(newFavorites);
    localStorage.setItem(`quiz-favorites-${user.id}`, JSON.stringify([...newFavorites]));
    calculateStats(quizResults, newFavorites, notes);
  };

  const saveNote = (quizResultId, note) => {
    const newNotes = { ...notes, [quizResultId]: note };
    setNotes(newNotes);
    localStorage.setItem(`quiz-notes-${user.id}`, JSON.stringify(newNotes));
    calculateStats(quizResults, favorites, newNotes);
  };

  const calculateStats = (results, favs = favorites, n = notes) => {
    const total = results.length;
    const favCount = favs.size;
    const notesCount = Object.keys(n).filter(key => n[key]?.trim()).length;
    const avgScore = total > 0 
      ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / total)
      : 0;

    setStats({
      total,
      favorites: favCount,
      notes: notesCount,
      averageScore: avgScore
    });
  };

  const filterResults = () => {
    let filtered = [...quizResults];

    // Recherche par titre
    if (searchQuery) {
      filtered = filtered.filter(result => 
        result.quiz?.title?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtre par matière
    if (selectedSubject !== 'all') {
      filtered = filtered.filter(result => 
        result.quiz?.chapitres?.matieres?.name === selectedSubject
      );
    }

    // Filtre par difficulté
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(result => 
        result.quiz?.difficulty === selectedDifficulty
      );
    }

    setFilteredResults(filtered);
  };

  const getUniqueSubjects = () => {
    const subjects = new Set();
    quizResults.forEach(result => {
      const subject = result.quiz?.chapitres?.matieres?.name;
      if (subject) subjects.add(subject);
    });
    return Array.from(subjects);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'facile': return 'bg-green-500';
      case 'moyen': return 'bg-yellow-500';
      case 'difficile': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement de vos quiz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">📚 Révision Quiz</h1>
        <p className="text-muted-foreground">
          Revoyez vos quiz passés, ajoutez des notes et suivez votre progression
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Quiz</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Score Moyen</p>
                <p className={`text-2xl font-bold ${getScoreColor(stats.averageScore)}`}>
                  {stats.averageScore}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Favoris</p>
                <p className="text-2xl font-bold">{stats.favorites}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avec Notes</p>
                <p className="text-2xl font-bold">{stats.notes}</p>
              </div>
              <StickyNote className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un quiz..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtre Matière */}
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">Toutes les matières</option>
              {getUniqueSubjects().map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>

            {/* Filtre Difficulté */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">Toutes les difficultés</option>
              <option value="facile">Facile</option>
              <option value="moyen">Moyen</option>
              <option value="difficile">Difficile</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Quiz Results List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredResults.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">
                  Aucun quiz trouvé avec ces filtres
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredResults.map((result, index) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">
                            {result.quiz?.title || 'Quiz sans titre'}
                          </CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleFavorite(result.id)}
                            className="p-1 h-auto"
                          >
                            <Star
                              className={`w-5 h-5 ${
                                favorites.has(result.id)
                                  ? 'fill-yellow-500 text-yellow-500'
                                  : 'text-gray-400'
                              }`}
                            />
                          </Button>
                        </div>
                        <CardDescription className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline">
                            {result.quiz?.chapitres?.matieres?.name || 'Matière'}
                          </Badge>
                          <Badge className={getDifficultyColor(result.quiz?.difficulty)}>
                            {result.quiz?.difficulty || 'Non défini'}
                          </Badge>
                          <span className="flex items-center gap-1 text-sm">
                            <Calendar className="w-4 h-4" />
                            {new Date(result.completed_at).toLocaleDateString('fr-FR')}
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Score</p>
                        <p className={`text-2xl font-bold ${getScoreColor(result.score)}`}>
                          {result.score}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Bonnes Réponses</p>
                        <p className="text-xl font-semibold flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                          {result.correct_answers}/{result.total_questions}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Temps</p>
                        <p className="text-xl font-semibold flex items-center justify-center gap-1">
                          <Clock className="w-5 h-5 text-blue-600" />
                          {Math.round(result.time_taken / 60)}min
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Questions Ratées</p>
                        <p className="text-xl font-semibold flex items-center justify-center gap-1">
                          <XCircle className="w-5 h-5 text-red-600" />
                          {result.total_questions - result.correct_answers}
                        </p>
                      </div>
                    </div>

                    {/* Notes Section */}
                    <div className="mt-4">
                      <label className="text-sm font-medium mb-2 block">
                        📝 Notes personnelles
                      </label>
                      <textarea
                        value={notes[result.id] || ''}
                        onChange={(e) => saveNote(result.id, e.target.value)}
                        placeholder="Ajoutez vos notes, points à revoir, etc..."
                        className="w-full px-3 py-2 border rounded-md min-h-[80px] resize-none"
                      />
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.href = `/quiz/${result.quiz_id}`}
                      >
                        Refaire ce quiz
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
