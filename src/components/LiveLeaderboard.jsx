/**
 * COMPOSANT LiveLeaderboard
 * Classement en temps réel avec animations et badges
 */

import React, { useState, useEffect } from 'react';
import { useCompetitions } from '../hooks/useCompetitions';
import { 
  Trophy, 
  TrendingUp, 
  Medal,
  Crown,
  Flame,
  MapPin
} from 'lucide-react';

const LiveLeaderboard = ({ competitionId = null, maxEntries = 10 }) => {
  const { leaderboard, loadLeaderboard } = useCompetitions(competitionId);
  const [scope, setScope] = useState('global'); // 'global', 'regional', 'national'
  const [animatingRanks, setAnimatingRanks] = useState(new Set());

  // Charger le leaderboard
  useEffect(() => {
    if (competitionId) {
      loadLeaderboard(competitionId, scope, maxEntries);
    }
  }, [competitionId, scope, maxEntries, loadLeaderboard]);

  // Animer les changements de rang
  useEffect(() => {
    const newAnimating = new Set();
    leaderboard.forEach(entry => {
      if (entry.rank <= 3) {
        newAnimating.add(entry.user_id);
      }
    });
    setAnimatingRanks(newAnimating);

    // Retirer les animations après 2 secondes
    const timer = setTimeout(() => {
      setAnimatingRanks(new Set());
    }, 2000);

    return () => clearTimeout(timer);
  }, [leaderboard]);

  // Obtenir l'icône de rang
  const getRankIcon = (rank) => {
    if (rank === 1) {
      return <Crown className="w-6 h-6 text-yellow-500" />;
    } else if (rank === 2) {
      return <Medal className="w-6 h-6 text-gray-400" />;
    } else if (rank === 3) {
      return <Medal className="w-6 h-6 text-orange-600" />;
    }
    return null;
  };

  // Obtenir la couleur de fond selon le rang
  const getRankBgColor = (rank, isCurrentUser) => {
    if (isCurrentUser) {
      return 'bg-purple-50 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700';
    }
    if (rank === 1) {
      return 'bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-300 dark:border-yellow-700';
    }
    if (rank === 2) {
      return 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/20 dark:to-gray-700/20 border-gray-300 dark:border-gray-600';
    }
    if (rank === 3) {
      return 'bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-300 dark:border-orange-700';
    }
    return 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700';
  };

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Classement Live
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-center py-8">
          Aucun participant pour le moment
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Trophy className="w-6 h-6 text-yellow-500" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Classement Live
        </h2>
        <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
      </div>

      {/* Sélecteur de portée */}
      {competitionId && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setScope('global')}
            className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
              scope === 'global'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            🌍 Global
          </button>
          <button
            onClick={() => setScope('regional')}
            className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
              scope === 'regional'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            📍 Région
          </button>
          <button
            onClick={() => setScope('national')}
            className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
              scope === 'national'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            🇸🇳 National
          </button>
        </div>
      )}

      {/* Liste des participants */}
      <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar">
        {leaderboard.map((entry, index) => {
          const isCurrentUser = entry.is_current_user;
          const isAnimating = animatingRanks.has(entry.user_id);

          return (
            <div
              key={entry.user_id}
              className={`
                p-3 rounded-lg border-2 transition-all duration-300
                ${getRankBgColor(entry.rank, isCurrentUser)}
                ${isAnimating ? 'scale-105 shadow-lg' : ''}
                ${isCurrentUser ? 'ring-2 ring-purple-500 ring-offset-2 dark:ring-offset-gray-800' : ''}
              `}
            >
              <div className="flex items-center gap-3">
                {/* Rang */}
                <div className="flex-shrink-0 w-8 text-center">
                  {entry.rank <= 3 ? (
                    getRankIcon(entry.rank)
                  ) : (
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
                      #{entry.rank}
                    </span>
                  )}
                </div>

                {/* Avatar */}
                <div className="flex-shrink-0">
                  {entry.avatar_url ? (
                    <img
                      src={entry.avatar_url}
                      alt={entry.username}
                      className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-700"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold border-2 border-white dark:border-gray-700">
                      {entry.username?.charAt(0).toUpperCase() || '?'}
                    </div>
                  )}
                </div>

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`font-semibold truncate ${
                      isCurrentUser 
                        ? 'text-purple-700 dark:text-purple-400' 
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {entry.username}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">
                          Vous
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Localisation */}
                  {entry.location && (
                    <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{entry.location}</span>
                    </div>
                  )}

                  {/* Statistiques */}
                  <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 mt-1">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {entry.correct_answers} bonnes
                    </span>
                    <span>⏱️ {Math.floor(entry.time_taken_seconds / 60)}m</span>
                  </div>
                </div>

                {/* Score */}
                <div className="flex-shrink-0 text-right">
                  <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    {entry.score}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    points
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      {leaderboard.length >= maxEntries && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Top {maxEntries} participants affichés
          </p>
        </div>
      )}
    </div>
  );
};

export default LiveLeaderboard;
