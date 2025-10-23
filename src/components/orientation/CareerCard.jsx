/**
 * 💼 CAREER CARD - Carte métier avec score de compatibilité
 * Date: 23 octobre 2025
 */

import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Award,
  ChevronRight,
  Star,
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';

const CareerCard = ({ career, rank, onSelect }) => {
  // Récupérer l'icône dynamiquement
  const IconComponent = career.icon ? LucideIcons[career.icon] : null;

  // Couleur du badge rang
  const rankColors = {
    1: 'from-yellow-400 to-orange-500',
    2: 'from-gray-300 to-gray-400',
    3: 'from-orange-400 to-orange-600',
  };

  const rankColor = rankColors[rank] || 'from-indigo-400 to-purple-500';

  // Couleur market outlook
  const outlookColors = {
    'Excellent': 'text-green-600 dark:text-green-400',
    'Bon': 'text-blue-600 dark:text-blue-400',
    'Moyen': 'text-yellow-600 dark:text-yellow-400',
  };

  const formatSalary = (min, max) => {
    if (!min || !max) return 'Non spécifié';
    const formatNumber = (num) => {
      if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
      if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
      return num;
    };
    return `${formatNumber(min)} - ${formatNumber(max)} FCFA`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.1 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      onClick={onSelect}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all cursor-pointer overflow-hidden group"
    >
      {/* Rank Badge */}
      <div className="relative">
        <div className={`absolute top-4 left-4 w-12 h-12 bg-gradient-to-br ${rankColor} rounded-full flex items-center justify-center shadow-lg z-10`}>
          <span className="text-white font-bold text-lg">#{rank}</span>
        </div>

        {/* Compatibility Score */}
        {career.compatibility_score && (
          <div className="absolute top-4 right-4 bg-white dark:bg-gray-900 rounded-full px-4 py-2 shadow-lg z-10">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <span className="font-bold text-gray-900 dark:text-white">
                {career.compatibility_score}%
              </span>
            </div>
          </div>
        )}

        {/* Header with gradient */}
        <div className="h-32 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
          {IconComponent && (
            <IconComponent className="w-16 h-16 text-white opacity-90" />
          )}
        </div>
      </div>

      <div className="p-6">
        {/* Title & Category */}
        <div className="mb-4">
          <div className="inline-block px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-semibold rounded-full mb-3">
            {career.category}
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {career.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {career.short_description}
          </p>
        </div>

        {/* Stats */}
        <div className="space-y-3 mb-4">
          {/* Salary */}
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Salaire moyen</div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {formatSalary(career.average_salary_min, career.average_salary_max)}
              </div>
            </div>
          </div>

          {/* Market Outlook */}
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Marché de l'emploi</div>
              <div className={`font-semibold ${outlookColors[career.job_market_outlook] || 'text-gray-900 dark:text-white'}`}>
                {career.job_market_outlook || 'Non spécifié'}
              </div>
            </div>
          </div>

          {/* Studies Duration */}
          {career.required_studies && career.required_studies.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Formation requise</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {career.required_studies[0]}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Compatibility Tags */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {career.suitable_for_bfem && (
            <div className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-medium rounded">
              BFEM
            </div>
          )}
          {career.suitable_for_bac && (
            <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium rounded">
              BAC
            </div>
          )}
          {career.work_environment && (
            <div className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium rounded">
              {career.work_environment}
            </div>
          )}
        </div>

        {/* CTA Button */}
        <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all group-hover:shadow-lg">
          <span>Découvrir ce métier</span>
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
};

export default CareerCard;
