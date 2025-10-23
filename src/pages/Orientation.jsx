/**
 * 🎯 PAGE ORIENTATION - Test d'Orientation Professionnelle
 * MVP Phase 1 - 15 questions + recommandations
 * Date: 23 octobre 2025
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Sparkles, 
  TrendingUp, 
  Users, 
  ArrowRight, 
  CheckCircle,
  BarChart3,
  Briefcase,
  GraduationCap,
  Award,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  ORIENTATION_QUESTIONS,
  calculateOrientationScores,
  matchCareers,
  saveOrientationTest,
  getLatestOrientationTest,
  getCareersByIds,
} from '../services/orientationService';
import OrientationTest from '../components/orientation/OrientationTest';
import ResultsRadarChart from '../components/orientation/ResultsRadarChart';
import CareerCard from '../components/orientation/CareerCard';
import CareerDetailModal from '../components/orientation/CareerDetailModal';

const Orientation = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState('intro'); // intro | test | results
  const [testAnswers, setTestAnswers] = useState({});
  const [testResults, setTestResults] = useState(null); // { scores, preferences, careers }
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userLevel, setUserLevel] = useState(null); // BFEM | BAC

  // Charger dernier test au montage
  useEffect(() => {
    if (user) {
      loadLatestTest();
    }
  }, [user]);

  const loadLatestTest = async () => {
    try {
      const latestTest = await getLatestOrientationTest(user.id);
      if (latestTest && latestTest.recommended_careers) {
        // Récupérer les métiers recommandés
        const careers = await getCareersByIds(latestTest.recommended_careers);
        setTestResults({
          scores: {
            scientific: latestTest.score_scientific,
            literary: latestTest.score_literary,
            technical: latestTest.score_technical,
            artistic: latestTest.score_artistic,
            social: latestTest.score_social,
            commercial: latestTest.score_commercial,
          },
          preferences: {
            preferred_subjects: latestTest.preferred_subjects,
            disliked_subjects: latestTest.disliked_subjects,
            preferred_work_environment: latestTest.preferred_work_environment,
            career_goals: latestTest.career_goals,
          },
          careers,
        });
        setCurrentStep('results');
      }
    } catch (error) {
      console.error('Erreur chargement test:', error);
    }
  };

  const handleStartTest = (level) => {
    setUserLevel(level);
    setCurrentStep('test');
    setTestAnswers({});
    setTestResults(null);
  };

  const handleTestComplete = async (answers) => {
    setLoading(true);
    try {
      console.log('🎓 [Orientation] Test terminé, analyse en cours...', { totalAnswers: Object.keys(answers).length });
      setTestAnswers(answers);

      // Calculer les scores
      const { scores, preferences } = calculateOrientationScores(answers);

      // Trouver les métiers correspondants
      const matchedCareers = await matchCareers(scores, preferences, userLevel);
      const topCareers = matchedCareers.slice(0, 5);

      // Sauvegarder le test
      await saveOrientationTest(
        user.id,
        scores,
        preferences,
        topCareers.map(c => c.id)
      );

      setTestResults({
        scores,
        preferences,
        careers: topCareers,
      });
      setCurrentStep('results');
    } catch (error) {
      console.error('Erreur traitement test:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetakeTest = () => {
    setCurrentStep('intro');
    setTestAnswers({});
    setTestResults(null);
    setUserLevel(null);
  };

  const handleOpenCareer = (career) => {
    setSelectedCareer(career);
  };

  const handleCloseCareer = () => {
    setSelectedCareer(null);
  };

  // PAGE INTRO
  if (currentStep === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
        <div className="container mx-auto px-4 py-12">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-full mb-6">
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">Nouveau ! Test d'Orientation</span>
            </div>

            <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent mb-4">
              Trouve ton Métier Idéal
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Un test intelligent de 15 questions pour découvrir les carrières qui correspondent vraiment à ta personnalité, tes talents et tes ambitions.
            </p>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
            >
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">15 Questions</h3>
              <p className="text-gray-600 dark:text-gray-400">Test rapide et précis en moins de 5 minutes</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
            >
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-4">
                <Briefcase className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">20 Métiers</h3>
              <p className="text-gray-600 dark:text-gray-400">Adaptés au marché sénégalais et africain</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
            >
              <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-xl flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">6 Profils</h3>
              <p className="text-gray-600 dark:text-gray-400">Analyse scientifique, artistique, technique...</p>
            </motion.div>
          </div>

          {/* CTA Buttons */}
          <div className="max-w-md mx-auto space-y-4">
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              onClick={() => handleStartTest('BAC')}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-4 px-8 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3 group"
            >
              <GraduationCap className="w-6 h-6" />
              <span>Je suis au Lycée (BAC)</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>

            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              onClick={() => handleStartTest('BFEM')}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 px-8 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3 group"
            >
              <Award className="w-6 h-6" />
              <span>Je suis au Collège (BFEM)</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-16 max-w-3xl mx-auto"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Comment ça marche ?
            </h2>
            <div className="space-y-4">
              <div className="flex gap-4 items-start bg-white/50 dark:bg-gray-800/50 p-4 rounded-xl">
                <div className="w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Réponds aux questions</h3>
                  <p className="text-gray-600 dark:text-gray-400">Tes matières préférées, tes centres d'intérêt, ton style de travail...</p>
                </div>
              </div>

              <div className="flex gap-4 items-start bg-white/50 dark:bg-gray-800/50 p-4 rounded-xl">
                <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Analyse intelligente</h3>
                  <p className="text-gray-600 dark:text-gray-400">Nos algorithmes calculent ton profil selon 6 dimensions</p>
                </div>
              </div>

              <div className="flex gap-4 items-start bg-white/50 dark:bg-gray-800/50 p-4 rounded-xl">
                <div className="w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Découvre tes recommandations</h3>
                  <p className="text-gray-600 dark:text-gray-400">Top 5 métiers compatibles avec salaires, débouchés et formations</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // PAGE TEST
  if (currentStep === 'test') {
    return (
      <OrientationTest
        questions={ORIENTATION_QUESTIONS}
        onComplete={handleTestComplete}
        loading={loading}
      />
    );
  }

  // PAGE RESULTS
  if (currentStep === 'results' && testResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-full mb-6">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">Test complété avec succès !</span>
            </div>

            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent mb-4">
              Voici Ton Profil d'Orientation
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Nous avons analysé tes réponses et identifié les métiers qui correspondent le mieux à ton profil.
            </p>

            <button
              onClick={handleRetakeTest}
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refaire le test</span>
            </button>
          </motion.div>

          {/* Radar Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <ResultsRadarChart scores={testResults.scores} />
          </motion.div>

          {/* Recommended Careers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              🎯 Métiers Recommandés pour Toi
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {testResults.careers.map((career, index) => (
                <CareerCard
                  key={career.id}
                  career={career}
                  rank={index + 1}
                  onSelect={() => handleOpenCareer(career)}
                />
              ))}
            </div>
          </motion.div>

          {/* Preferences Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-12 max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl"
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              📋 Résumé de Ton Profil
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-indigo-600 dark:text-indigo-400 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Matières Préférées
                </h4>
                <ul className="space-y-2">
                  {testResults.preferences.preferred_subjects.map((subject, i) => (
                    <li key={i} className="text-gray-700 dark:text-gray-300">• {subject}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-purple-600 dark:text-purple-400 mb-3 flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Environnement Préféré
                </h4>
                <p className="text-gray-700 dark:text-gray-300">
                  {testResults.preferences.preferred_work_environment || 'Non spécifié'}
                </p>
              </div>

              {testResults.preferences.career_goals && (
                <div className="md:col-span-2">
                  <h4 className="font-semibold text-pink-600 dark:text-pink-400 mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Ton Métier Idéal
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 italic">
                    "{testResults.preferences.career_goals}"
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Career Detail Modal */}
        <AnimatePresence>
          {selectedCareer && (
            <CareerDetailModal
              career={selectedCareer}
              onClose={handleCloseCareer}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  return null;
};

export default Orientation;
