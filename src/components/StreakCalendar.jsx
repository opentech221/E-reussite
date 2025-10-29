import React, { useState, useEffect } from 'react';
import { format, startOfYear, endOfYear, eachDayOfInterval, isSameDay, addMonths, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flame, ChevronLeft, ChevronRight, TrendingUp, Calendar as CalendarIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import * as Tooltip from '@radix-ui/react-tooltip';

/**
 * StreakCalendar - Calendrier heatmap GitHub-style pour visualiser les streaks quotidiens
 * 
 * @param {Array} data - Données format [{date: "2025-01-24", streak_value: 5, study_hours: 2.5}, ...]
 * @param {number} currentStreak - Streak actuel de l'utilisateur
 * @param {number} longestStreak - Record personnel
 * @param {string} className - Classes CSS additionnelles
 */
const StreakCalendar = ({ 
  data = [], 
  currentStreak = 0, 
  longestStreak = 0,
  className = "" 
}) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [hoveredDay, setHoveredDay] = useState(null);

  // Calculer les statistiques
  const totalDays = data.filter(d => d.streak_value > 0).length;
  const averageStreak = totalDays > 0 
    ? Math.round(data.reduce((sum, d) => sum + d.streak_value, 0) / data.length) 
    : 0;

  // Générer les jours du mois sélectionné
  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Trouver le premier jour de la semaine (Lundi = 1, Dimanche = 0)
  const firstDayOfWeek = monthStart.getDay();
  const paddingDays = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Décalage pour commencer lundi

  /**
   * Obtenir la couleur selon l'intensité du streak
   */
  const getStreakColor = (streakValue) => {
    if (streakValue === 0) return 'bg-gray-200 dark:bg-gray-700';
    if (streakValue <= 3) return 'bg-green-200 dark:bg-green-900';
    if (streakValue <= 7) return 'bg-green-400 dark:bg-green-700';
    if (streakValue <= 14) return 'bg-green-500 dark:bg-green-600';
    return 'bg-green-600 dark:bg-green-500'; // 15+ jours
  };

  /**
   * Obtenir les données d'une date spécifique
   */
  const getDateData = (date) => {
    return data.find(d => isSameDay(new Date(d.date), date));
  };

  /**
   * Navigation mois
   */
  const goToPreviousMonth = () => setSelectedMonth(subMonths(selectedMonth, 1));
  const goToNextMonth = () => setSelectedMonth(addMonths(selectedMonth, 1));
  const goToToday = () => setSelectedMonth(new Date());

  return (
    <Tooltip.Provider>
      <Card className={`${className}`}>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              Calendrier de Streak
            </CardTitle>

            {/* Navigation mois */}
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={goToPreviousMonth}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
                className="h-8 px-3"
              >
                <CalendarIcon className="h-3 w-3 mr-1" />
                {format(selectedMonth, 'MMMM yyyy', { locale: fr })}
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={goToNextMonth}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Stats résumé */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-2 mb-1">
                <Flame className="h-4 w-4 text-orange-500" />
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Streak actuel</p>
              </div>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{currentStreak}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">jours</p>
            </div>

            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Record</p>
              </div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{longestStreak}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">jours</p>
            </div>

            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-1">
                <CalendarIcon className="h-4 w-4 text-blue-500" />
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Jours actifs</p>
              </div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalDays}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">total</p>
            </div>

            <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Moyenne</p>
              </div>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{averageStreak}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">jours</p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Légende */}
          <div className="flex items-center justify-end gap-2 mb-4 text-xs text-gray-600 dark:text-gray-400">
            <span>Moins</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-gray-200 dark:bg-gray-700" />
              <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-900" />
              <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-700" />
              <div className="w-3 h-3 rounded-sm bg-green-500 dark:bg-green-600" />
              <div className="w-3 h-3 rounded-sm bg-green-600 dark:bg-green-500" />
            </div>
            <span>Plus</span>
          </div>

          {/* Labels jours de la semaine */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, index) => (
              <div key={index} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                {day}
              </div>
            ))}
          </div>

          {/* Calendrier Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Padding pour aligner le premier jour */}
            {Array.from({ length: paddingDays }).map((_, index) => (
              <div key={`padding-${index}`} className="aspect-square" />
            ))}

            {/* Jours du mois */}
            {daysInMonth.map((date, index) => {
              const dateData = getDateData(date);
              const streakValue = dateData?.streak_value || 0;
              const isToday = isSameDay(date, new Date());
              const colorClass = getStreakColor(streakValue);

              return (
                <Tooltip.Root key={index} delayDuration={0}>
                  <Tooltip.Trigger asChild>
                    <motion.div
                      className={`
                        aspect-square rounded-sm cursor-pointer relative
                        ${colorClass}
                        ${isToday ? 'ring-2 ring-primary ring-offset-2' : ''}
                        hover:ring-2 hover:ring-gray-400 dark:hover:ring-gray-500
                        transition-all duration-200
                      `}
                      whileHover={{ scale: 1.1 }}
                      onMouseEnter={() => setHoveredDay(date)}
                      onMouseLeave={() => setHoveredDay(null)}
                    >
                      {/* Numéro du jour (petit) */}
                      <span className="absolute top-0.5 left-0.5 text-[8px] font-semibold text-gray-700 dark:text-gray-200">
                        {format(date, 'd')}
                      </span>
                    </motion.div>
                  </Tooltip.Trigger>

                  <Tooltip.Portal>
                    <Tooltip.Content
                      className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-2 rounded-lg shadow-xl text-sm z-50"
                      sideOffset={5}
                    >
                      <div className="space-y-1">
                        <p className="font-bold">{format(date, 'EEEE d MMMM yyyy', { locale: fr })}</p>
                        {dateData ? (
                          <>
                            <p className="flex items-center gap-1">
                              <Flame className="h-3 w-3 text-orange-400" />
                              <span className="font-semibold">{streakValue} jours de streak</span>
                            </p>
                            {dateData.study_hours && (
                              <p className="text-xs opacity-90">
                                📚 {dateData.study_hours}h d'étude
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="text-xs opacity-75">Aucune activité</p>
                        )}
                      </div>
                      <Tooltip.Arrow className="fill-gray-900 dark:fill-gray-100" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              );
            })}
          </div>

          {/* Message si pas de données */}
          {data.length === 0 && (
            <div className="mt-6 text-center text-gray-500 dark:text-gray-400">
              <Flame className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">Aucun historique de streak</p>
              <p className="text-sm">Commence à étudier pour construire ton streak !</p>
            </div>
          )}
        </CardContent>
      </Card>
    </Tooltip.Provider>
  );
};

export default StreakCalendar;
