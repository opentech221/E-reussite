import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

/**
 * StatCard - Carte KPI réutilisable pour le Dashboard
 * 
 * @param {string} title - Titre de la statistique
 * @param {string|number} value - Valeur à afficher
 * @param {LucideIcon} icon - Icône Lucide React
 * @param {string} color - Couleur (blue, green, purple, orange)
 * @param {string} trend - Tendance optionnelle (ex: "+12%")
 * @param {string} subtitle - Sous-titre optionnel
 * @param {number} delay - Délai animation (ms)
 */
const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = 'blue', 
  trend, 
  subtitle,
  delay = 0 
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
        duration: 0.4, 
        delay: delay / 1000,
        ease: [0.4, 0, 0.2, 1]
      }}
    >
      <Card className={`relative overflow-hidden border-2 ${colors.border} hover:shadow-lg transition-shadow duration-300`}>
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-current to-transparent" />
        </div>

        <CardContent className="p-6 relative">
          <div className="flex items-start justify-between">
            {/* Icône */}
            <div className={`p-3 rounded-xl ${colors.bg} ${colors.icon}`}>
              <Icon className="h-6 w-6" />
            </div>

            {/* Trend badge (optionnel) */}
            {trend && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: (delay / 1000) + 0.2, type: 'spring' }}
                className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  trend.startsWith('+') 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}
              >
                {trend}
              </motion.div>
            )}
          </div>

          {/* Titre */}
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-4 mb-1">
            {title}
          </h3>

          {/* Valeur principale */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: (delay / 1000) + 0.1 }}
            className={`text-3xl font-bold ${colors.text} mb-1`}
          >
            {value}
          </motion.div>

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
