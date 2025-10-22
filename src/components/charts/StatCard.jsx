import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * StatCard - Carte KPI réutilisable pour le Dashboard
 * 
 * @param {string} title - Titre de la statistique
 * @param {string|number} value - Valeur à afficher
 * @param {React.Component} icon - Icône Lucide React
 * @param {string} color - Couleur (blue, green, purple, orange)
 * @param {string} change - Texte de changement (ex: "+12%", "+5 cette semaine")
 * @param {string} changeType - Type de changement: "increase" ou "decrease"
 * @param {string} subtitle - Sous-titre optionnel
 * @param {string} className - Classes CSS additionnelles
 */
const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = 'blue', 
  change,
  changeType = 'increase',
  subtitle,
  className = ''
}) => {
  // Mapping des couleurs
  const colorClasses = {
    blue: {
      bg: 'bg-blue-500/10 dark:bg-blue-500/20',
      text: 'text-blue-600 dark:text-blue-400',
      icon: 'text-blue-500',
      border: 'border-blue-200 dark:border-blue-800',
    },
    green: {
      bg: 'bg-green-500/10 dark:bg-green-500/20',
      text: 'text-green-600 dark:text-green-400',
      icon: 'text-green-500',
      border: 'border-green-200 dark:border-green-800',
    },
    purple: {
      bg: 'bg-purple-500/10 dark:bg-purple-500/20',
      text: 'text-purple-600 dark:text-purple-400',
      icon: 'text-purple-500',
      border: 'border-purple-200 dark:border-purple-800',
    },
    orange: {
      bg: 'bg-orange-500/10 dark:bg-orange-500/20',
      text: 'text-orange-600 dark:text-orange-400',
      icon: 'text-orange-500',
      border: 'border-orange-200 dark:border-orange-800',
    },
    red: {
      bg: 'bg-red-500/10 dark:bg-red-500/20',
      text: 'text-red-600 dark:text-red-400',
      icon: 'text-red-500',
      border: 'border-red-200 dark:border-red-800',
    },
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }}
      className={className}
    >
      <Card className={`relative overflow-hidden border-2 ${colors.border} hover:shadow-lg hover:scale-105 transition-all duration-300`}>
        {/* Background gradient */}
        <div className={`absolute inset-0 ${colors.bg} opacity-50`} />

        <CardContent className="p-6 relative">
          <div className="flex items-center justify-between mb-4">
            {/* Icône */}
            <div className={`p-3 rounded-xl ${colors.bg} border ${colors.border}`}>
              <Icon className={`h-6 w-6 ${colors.icon}`} />
            </div>

            {/* Change indicator (optionnel) */}
            {change && (
              <div className={`flex items-center gap-1 text-sm font-medium ${
                changeType === 'increase' 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {changeType === 'increase' ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span className="text-xs">{change}</span>
              </div>
            )}
          </div>

          {/* Valeur principale */}
          <div className={`text-3xl font-bold ${colors.text} mb-2`}>
            {value}
          </div>

          {/* Titre */}
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>

          {/* Sous-titre (optionnel) */}
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {subtitle}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default StatCard;
