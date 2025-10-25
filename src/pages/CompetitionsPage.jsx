/**
 * PAGE COMPETITIONS
 * Liste des compétitions avec filtres et statistiques
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompetitions } from '../hooks/useCompetitions';
import CompetitionCard from '../components/CompetitionCard';
import LiveLeaderboard from '../components/LiveLeaderboard';
import { 
  Trophy, 
  TrendingUp, 
  Users, 
  Target,
  Filter,
  Calendar
} from 'lucide-react';

const CompetitionsPage = () => {
  const navigate = useNavigate();
  const { 
    competitions, 
    stats,
    loading, 
    error,
    loadCompetitions,
    loadStats
  } = useCompetitions();

  const [filters, setFilters] = useState({
    status: 'all',
    subject: 'all',
    grade_level: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('active'); // 'active', 'upcoming', 'completed'

  useEffect(() => {
    loadCompetitions();
    loadStats();
  }, [loadCompetitions, loadStats]);

  // Filtrer les compétitions
  const filteredCompetitions = competitions.filter(comp => {
    if (activeTab === 'active' && comp.status !== 'active') return false;
    if (activeTab === 'upcoming' && comp.status !== 'upcoming') return false;
    if (activeTab === 'completed' && comp.status !== 'completed') return false;
    
    if (filters.subject !== 'all' && comp.subject !== filters.subject) return false;
    if (filters.grade_level !== 'all' && comp.grade_level !== filters.grade_level) return false;
    
    return true;
  });

  if (loading && competitions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement des compétitions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Trophy className="w-8 h-8 text-yellow-500" />
                Compétitions Live
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Défiez vos pairs et montez dans le classement francophone
              </p>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filtres
            </button>
          </div>

          {/* Statistiques utilisateur */}
          {stats && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
                <div className="flex items-center gap-3">
                  <Target className="w-8 h-8 opacity-80" />
                  <div>
                    <p className="text-sm opacity-90">Participations</p>
                    <p className="text-2xl font-bold">{stats.totalCompetitions}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 opacity-80" />
                  <div>
                    <p className="text-sm opacity-90">Score Total</p>
                    <p className="text-2xl font-bold">{stats.totalScore}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
                <div className="flex items-center gap-3">
                  <Trophy className="w-8 h-8 opacity-80" />
                  <div>
                    <p className="text-sm opacity-90">Top 3</p>
                    <p className="text-2xl font-bold">{stats.topRanks}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 opacity-80" />
                  <div>
                    <p className="text-sm opacity-90">Rang Moyen</p>
                    <p className="text-2xl font-bold">#{stats.avgRank}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filtres (collapsible) */}
      {showFilters && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Matière
                </label>
                <select
                  value={filters.subject}
                  onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">Toutes les matières</option>
                  <option value="mathematiques">Mathématiques</option>
                  <option value="sciences">Sciences</option>
                  <option value="francais">Français</option>
                  <option value="anglais">Anglais</option>
                  <option value="histoire">Histoire</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Niveau
                </label>
                <select
                  value={filters.grade_level}
                  onChange={(e) => setFilters({ ...filters, grade_level: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">Tous les niveaux</option>
                  <option value="troisieme">Troisième (BFEM)</option>
                  <option value="terminale">Terminale (BAC)</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => setFilters({ status: 'all', subject: 'all', grade_level: 'all' })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Onglets */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'active'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            En cours ({competitions.filter(c => c.status === 'active').length})
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'upcoming'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            À venir ({competitions.filter(c => c.status === 'upcoming').length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'completed'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Terminées ({competitions.filter(c => c.status === 'completed').length})
          </button>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Liste des compétitions */}
          <div className="lg:col-span-2 space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {filteredCompetitions.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Aucune compétition
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Aucune compétition ne correspond à vos filtres.
                </p>
              </div>
            ) : (
              filteredCompetitions.map((competition) => (
                <CompetitionCard
                  key={competition.id}
                  competition={competition}
                  onClick={() => navigate(`/competitions/${competition.id}`)}
                />
              ))
            )}
          </div>

          {/* Leaderboard global */}
          <div className="lg:col-span-1">
            <LiveLeaderboard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitionsPage;
