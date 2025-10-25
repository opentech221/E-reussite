/**
 * COMPOSANT CompetitionCard
 * Carte affichant les détails d'une compétition
 */

import React from 'react';
import { 
  Trophy, 
  Users, 
  Clock, 
  Calendar,
  Target,
  Flame,
  CheckCircle
} from 'lucide-react';

const CompetitionCard = ({ competition, onClick }) => {
  // Calculer le temps restant
  const getTimeRemaining = () => {
    if (!competition.starts_at) return null;
    
    const now = new Date();
    const start = new Date(competition.starts_at);
    const end = new Date(competition.ends_at);
    
    if (competition.status === 'upcoming') {
      const diff = start - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);
      
      if (days > 0) return `Commence dans ${days}j`;
      if (hours > 0) return `Commence dans ${hours}h`;
      return 'Commence bientôt';
    }
    
    if (competition.status === 'active') {
      const diff = end - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours > 0) return `Se termine dans ${hours}h ${minutes}min`;
      if (minutes > 0) return `Se termine dans ${minutes}min`;
      return 'Se termine bientôt';
    }
    
    return 'Terminée';
  };

  // Badge de statut
  const getStatusBadge = () => {
    const badges = {
      upcoming: {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-700 dark:text-blue-400',
        icon: <Calendar className="w-3 h-3" />,
        label: 'À venir'
      },
      active: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-700 dark:text-green-400',
        icon: <Flame className="w-3 h-3" />,
        label: 'En cours'
      },
      completed: {
        bg: 'bg-gray-100 dark:bg-gray-700',
        text: 'text-gray-700 dark:text-gray-400',
        icon: <CheckCircle className="w-3 h-3" />,
        label: 'Terminée'
      }
    };

    const badge = badges[competition.status] || badges.upcoming;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.icon}
        {badge.label}
      </span>
    );
  };

  // Badge de difficulté
  const getDifficultyColor = () => {
    const colors = {
      facile: 'text-green-600 dark:text-green-400',
      moyen: 'text-orange-600 dark:text-orange-400',
      difficile: 'text-red-600 dark:text-red-400'
    };
    return colors[competition.difficulty] || colors.moyen;
  };

  // Taux de remplissage
  const fillPercentage = competition.max_participants 
    ? (competition.current_participants / competition.max_participants) * 100 
    : null;

  const isFull = fillPercentage >= 100;

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg border border-gray-200 dark:border-gray-700 p-6 cursor-pointer transition-all hover:-translate-y-1"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {getStatusBadge()}
            <span className={`text-xs font-semibold uppercase ${getDifficultyColor()}`}>
              {competition.difficulty}
            </span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
            {competition.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {competition.description}
          </p>
        </div>

        <div className="ml-4 flex-shrink-0">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
            <Trophy className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Métadonnées */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {competition.current_participants || 0}
            {competition.max_participants && ` / ${competition.max_participants}`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {competition.duration_minutes} min
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {competition.questions_count} questions
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
            +{competition.reward_points} pts
          </span>
        </div>
      </div>

      {/* Matière et niveau */}
      <div className="flex items-center gap-2 mb-4">
        {competition.subject && (
          <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-xs font-medium">
            {competition.subject.charAt(0).toUpperCase() + competition.subject.slice(1)}
          </span>
        )}
        {competition.grade_level && (
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium">
            {competition.grade_level === 'troisieme' ? 'BFEM' : 'BAC'}
          </span>
        )}
      </div>

      {/* Barre de progression (si max participants défini) */}
      {competition.max_participants && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Places restantes
            </span>
            <span className="text-xs font-semibold text-gray-900 dark:text-white">
              {competition.max_participants - competition.current_participants}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                isFull 
                  ? 'bg-red-500' 
                  : fillPercentage > 80 
                    ? 'bg-orange-500' 
                    : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(fillPercentage, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Clock className="w-4 h-4" />
          {getTimeRemaining()}
        </div>

        <button
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            competition.status === 'active' && !isFull
              ? 'bg-purple-600 text-white hover:bg-purple-700'
              : competition.status === 'upcoming' && !isFull
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed'
          }`}
          disabled={competition.status === 'completed' || isFull}
        >
          {competition.status === 'completed' 
            ? 'Voir les résultats'
            : isFull
              ? 'Complet'
              : competition.status === 'active'
                ? 'Participer'
                : 'S\'inscrire'
          }
        </button>
      </div>
    </div>
  );
};

export default CompetitionCard;
