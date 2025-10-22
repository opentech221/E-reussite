import React, { useState, useEffect } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import * as Select from '@radix-ui/react-select';
import * as Popover from '@radix-ui/react-popover';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * FilterPanel - Panneau de filtres avancés multi-critères
 * 
 * @param {Array} matieresOptions - Liste des matières [{id, name, color}, ...]
 * @param {Function} onFilterChange - Callback(filters) quand les filtres changent
 * @param {Object} initialFilters - Filtres initiaux {matieres: [], difficulte: [], type: []}
 * @param {boolean} persistToLocalStorage - Sauvegarder dans localStorage (default: true)
 * @param {string} storageKey - Clé localStorage (default: 'dashboard_filters')
 */
const FilterPanel = ({ 
  matieresOptions = [],
  onFilterChange,
  initialFilters = { matieres: [], difficulte: [], type: [] },
  persistToLocalStorage = true,
  storageKey = 'dashboard_filters',
  className = ""
}) => {
  // Charger filtres depuis localStorage si disponible
  const loadFiltersFromStorage = () => {
    if (!persistToLocalStorage) return initialFilters;
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : initialFilters;
    } catch (error) {
      console.error('Erreur chargement filtres:', error);
      return initialFilters;
    }
  };

  const [filters, setFilters] = useState(loadFiltersFromStorage);
  const [isOpen, setIsOpen] = useState(false);

  // Options difficulté
  const difficulteOptions = [
    { value: 'facile', label: 'Facile', color: 'green' },
    { value: 'moyen', label: 'Moyen', color: 'orange' },
    { value: 'difficile', label: 'Difficile', color: 'red' }
  ];

  // Options type
  const typeOptions = [
    { value: 'quiz', label: 'Quiz', icon: '📝' },
    { value: 'exam', label: 'Examen', icon: '🎓' },
    { value: 'lecon', label: 'Leçon', icon: '📚' }
  ];

  /**
   * Met à jour les filtres et notifie le parent
   */
  const updateFilters = (newFilters) => {
    setFilters(newFilters);
    
    // Sauvegarder dans localStorage
    if (persistToLocalStorage) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(newFilters));
      } catch (error) {
        console.error('Erreur sauvegarde filtres:', error);
      }
    }
    
    // Notifier le parent
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  /**
   * Toggle matière dans les filtres
   */
  const toggleMatiere = (matiereId) => {
    const newMatieres = filters.matieres.includes(matiereId)
      ? filters.matieres.filter(id => id !== matiereId)
      : [...filters.matieres, matiereId];
    
    updateFilters({ ...filters, matieres: newMatieres });
  };

  /**
   * Toggle difficulté
   */
  const toggleDifficulte = (difficulte) => {
    const newDifficulte = filters.difficulte.includes(difficulte)
      ? filters.difficulte.filter(d => d !== difficulte)
      : [...filters.difficulte, difficulte];
    
    updateFilters({ ...filters, difficulte: newDifficulte });
  };

  /**
   * Toggle type
   */
  const toggleType = (type) => {
    const newType = filters.type.includes(type)
      ? filters.type.filter(t => t !== type)
      : [...filters.type, type];
    
    updateFilters({ ...filters, type: newType });
  };

  /**
   * Reset tous les filtres
   */
  const clearAllFilters = () => {
    updateFilters({ matieres: [], difficulte: [], type: [] });
  };

  /**
   * Compter le nombre total de filtres actifs
   */
  const activeFiltersCount = 
    filters.matieres.length + 
    filters.difficulte.length + 
    filters.type.length;

  return (
    <div className={`${className}`}>
      <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
        <Popover.Trigger asChild>
          <Button 
            variant="outline" 
            className="relative"
          >
            <Filter className="h-4 w-4 mr-2" />
            <span>Filtres</span>
            {activeFiltersCount > 0 && (
              <Badge 
                variant="destructive" 
                className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            className="w-80 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-4 z-50"
            sideOffset={5}
            align="end"
          >
            <div className="space-y-4">
              {/* Header */}
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filtres avancés
                </h3>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="h-7 text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Effacer tout
                  </Button>
                )}
              </div>

              {/* Filtres Matières */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Matières ({filters.matieres.length} sélectionné{filters.matieres.length > 1 ? 's' : ''})
                </label>
                <div className="flex flex-wrap gap-2">
                  {matieresOptions.map((matiere) => {
                    const isSelected = filters.matieres.includes(matiere.id);
                    return (
                      <motion.button
                        key={matiere.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleMatiere(matiere.id)}
                        className={`
                          px-3 py-1.5 rounded-full text-sm font-medium transition-all
                          ${isSelected 
                            ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-gray-800' 
                            : 'hover:ring-2 hover:ring-gray-300 dark:hover:ring-gray-600'
                          }
                        `}
                        style={{
                          backgroundColor: isSelected ? matiere.color : 'transparent',
                          color: isSelected ? 'white' : matiere.color,
                          border: `2px solid ${matiere.color}`
                        }}
                      >
                        {matiere.name}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Filtres Difficulté */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Difficulté ({filters.difficulte.length})
                </label>
                <div className="flex flex-wrap gap-2">
                  {difficulteOptions.map((option) => {
                    const isSelected = filters.difficulte.includes(option.value);
                    const colorClasses = {
                      green: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
                      orange: 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700',
                      red: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700'
                    };
                    
                    return (
                      <motion.button
                        key={option.value}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleDifficulte(option.value)}
                        className={`
                          px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-all
                          ${isSelected 
                            ? `${colorClasses[option.color]} ring-2 ring-offset-2` 
                            : 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                          }
                        `}
                      >
                        {option.label}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Filtres Type */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Type ({filters.type.length})
                </label>
                <div className="flex flex-wrap gap-2">
                  {typeOptions.map((option) => {
                    const isSelected = filters.type.includes(option.value);
                    return (
                      <motion.button
                        key={option.value}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleType(option.value)}
                        className={`
                          px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-all flex items-center gap-2
                          ${isSelected 
                            ? 'bg-primary text-white border-primary ring-2 ring-offset-2' 
                            : 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                          }
                        `}
                      >
                        <span>{option.icon}</span>
                        {option.label}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Résumé filtres actifs */}
              {activeFiltersCount > 0 && (
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''} actif{activeFiltersCount > 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </div>
            
            <Popover.Arrow className="fill-white dark:fill-gray-800" />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      {/* Badges filtres actifs (en-dessous du bouton) */}
      <AnimatePresence>
        {activeFiltersCount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 flex flex-wrap gap-2"
          >
            {/* Badges matières */}
            {filters.matieres.map(matiereId => {
              const matiere = matieresOptions.find(m => m.id === matiereId);
              if (!matiere) return null;
              return (
                <Badge
                  key={matiereId}
                  className="flex items-center gap-1 pr-1"
                  style={{ backgroundColor: matiere.color }}
                >
                  {matiere.name}
                  <button
                    onClick={() => toggleMatiere(matiereId)}
                    className="hover:bg-black/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}

            {/* Badges difficulté */}
            {filters.difficulte.map(diff => {
              const option = difficulteOptions.find(d => d.value === diff);
              if (!option) return null;
              return (
                <Badge
                  key={diff}
                  variant="secondary"
                  className="flex items-center gap-1 pr-1"
                >
                  {option.label}
                  <button
                    onClick={() => toggleDifficulte(diff)}
                    className="hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}

            {/* Badges type */}
            {filters.type.map(type => {
              const option = typeOptions.find(t => t.value === type);
              if (!option) return null;
              return (
                <Badge
                  key={type}
                  className="flex items-center gap-1 pr-1"
                >
                  {option.icon} {option.label}
                  <button
                    onClick={() => toggleType(type)}
                    className="hover:bg-black/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}

            {/* Button clear all */}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-6 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Tout effacer
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FilterPanel;
