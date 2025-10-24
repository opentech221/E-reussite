/**
 * COMPOSANT : SECTION "MON ORIENTATION" DANS PROFIL
 * 
 * Affiche les résultats du test d'orientation dans le profil utilisateur :
 * - Top 3 carrières recommandées avec scores
 * - Date du dernier test
 * - Bouton pour refaire le test
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Calendar, 
  RotateCcw, 
  ChevronRight,
  Target,
  Award,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getOrientationFromProfile, getPreferredCareersDetails } from '@/services/profileOrientationService';
import CareerDetailModal from '../orientation/CareerDetailModal';

const ProfileOrientationSection = ({ userId }) => {
  const [loading, setLoading] = useState(true);
  const [orientationData, setOrientationData] = useState(null);
  const [careers, setCareers] = useState([]);
  const [selectedCareer, setSelectedCareer] = useState(null);

  useEffect(() => {
    loadOrientationData();
  }, [userId]);

  const loadOrientationData = async () => {
    try {
      setLoading(true);
      
      // Charger données orientation
      const data = await getOrientationFromProfile(userId);
      setOrientationData(data);

      // Si test complété, charger détails carrières
      if (data && data.careers.length > 0) {
        const careersDetails = await getPreferredCareersDetails(userId);
        setCareers(careersDetails.slice(0, 3)); // Top 3 seulement
      }
    } catch (error) {
      console.error('Erreur chargement orientation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCareer = (career) => {
    setSelectedCareer(career);
  };

  const handleCloseCareer = () => {
    setSelectedCareer(null);
  };

  // Si pas encore de test
  if (!loading && !orientationData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-6 border-2 border-dashed border-purple-200 dark:border-purple-700"
      >
        <div className="flex items-start gap-4">
          <div className="bg-purple-100 dark:bg-purple-800/50 p-3 rounded-xl">
            <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Découvrez votre orientation professionnelle
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Vous n'avez pas encore passé le test d'orientation. Découvrez les métiers 
              qui correspondent le mieux à votre profil, vos intérêts et votre contexte.
            </p>
            <Link
              to="/orientation"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 transition-all"
            >
              <Sparkles className="h-4 w-4" />
              Commencer le test
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Formater la date
  const completedDate = new Date(orientationData.completedAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
    >
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-2.5 rounded-xl">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Mon Orientation Professionnelle
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Calendar className="h-4 w-4" />
              <span>Test complété le {completedDate}</span>
            </div>
          </div>
        </div>
        <Link
          to="/orientation"
          className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium text-sm transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          Refaire le test
        </Link>
      </div>

      {/* Score principal */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 rounded-xl p-4 mb-6 border border-purple-100 dark:border-purple-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Meilleur Match
            </p>
            <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
              {orientationData.topScore}% de compatibilité
            </p>
          </div>
          <Award className="h-10 w-10 text-purple-500 dark:text-purple-400" />
        </div>
      </div>

      {/* Top 3 Carrières */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Vos 3 meilleures options :
        </h4>
        {careers.map((career, index) => (
          <motion.div
            key={career.slug}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-700 transition-all"
          >
            <div className="flex items-center gap-4 mb-3">
              {/* Rang */}
              <div className={`
                flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' : ''}
                ${index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-700' : ''}
                ${index === 2 ? 'bg-gradient-to-br from-orange-300 to-orange-400 text-white' : ''}
              `}>
                {index + 1}
              </div>

              {/* Infos carrière */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {career.title}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                  {career.category}
                </p>
              </div>

              {/* Score */}
              <div className="text-right">
                <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                  {career.match_score}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  match
                </p>
              </div>
            </div>

            {/* Bouton Découvrir */}
            <button
              onClick={() => handleOpenCareer(career)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-lg transition-all group"
            >
              <span>Découvrir ce métier</span>
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        ))}
      </div>

      {/* CTA voir tous les résultats */}
      <Link
        to="/orientation"
        className="mt-4 block text-center py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-gray-700 dark:text-gray-300 hover:text-purple-700 dark:hover:text-purple-400 font-medium text-sm transition-all"
      >
        Voir tous mes résultats →
      </Link>

      {/* Career Detail Modal */}
      <AnimatePresence>
        {selectedCareer && (
          <CareerDetailModal
            career={selectedCareer}
            onClose={handleCloseCareer}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProfileOrientationSection;
