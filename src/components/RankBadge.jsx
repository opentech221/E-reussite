import React from 'react';
import { motion } from 'framer-motion';
import { 
  Award, 
  Trophy, 
  Crown, 
  Gem, 
  Star,
  TrendingUp
} from 'lucide-react';

/**
 * RankBadge - Composant pour afficher le badge de rang d'un utilisateur
 * 
 * @param {string} tier - Le tier de l'utilisateur (bronze, silver, gold, platinum, diamond)
 * @param {number} percentile - Le percentile (0-100, ex: 85 = Top 15%)
 * @param {string} size - Taille du badge (sm, md, lg)
 * @param {boolean} showPercentile - Afficher ou non le percentile
 * @param {boolean} showLabel - Afficher ou non le label du tier
 * @param {boolean} animated - Activer ou non les animations
 */
const RankBadge = ({ 
  tier = 'bronze', 
  percentile = 0,
  size = 'md',
  showPercentile = true,
  showLabel = true,
  animated = true
}) => {
  
  // Configuration des tiers (CORRIGÉ: argent/or au lieu de silver/gold)
  const tierConfig = {
    bronze: {
      name: 'Bronze',
      icon: Award,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      borderColor: 'border-amber-300 dark:border-amber-700',
      gradient: 'from-amber-400 to-amber-600',
      glow: 'shadow-[0_0_20px_rgba(217,119,6,0.3)]',
      description: 'En progression'
    },
    argent: {
      name: 'Argent',
      icon: Trophy,
      color: 'text-slate-500',
      bgColor: 'bg-slate-50 dark:bg-slate-800/50',
      borderColor: 'border-slate-400 dark:border-slate-600',
      gradient: 'from-slate-300 to-slate-500',
      glow: 'shadow-[0_0_20px_rgba(148,163,184,0.4)]',
      description: 'Bon niveau'
    },
    or: {
      name: 'Or',
      icon: Star,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-400 dark:border-yellow-600',
      gradient: 'from-yellow-400 to-yellow-600',
      glow: 'shadow-[0_0_25px_rgba(234,179,8,0.5)]',
      description: 'Excellent'
    },
    platine: {
      name: 'Platine',
      icon: Gem,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
      borderColor: 'border-cyan-400 dark:border-cyan-600',
      gradient: 'from-cyan-300 to-cyan-500',
      glow: 'shadow-[0_0_30px_rgba(34,211,238,0.6)]',
      description: 'Élite'
    },
    diamant: {
      name: 'Diamant',
      icon: Crown,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-400 dark:border-purple-600',
      gradient: 'from-purple-400 to-pink-500',
      glow: 'shadow-[0_0_35px_rgba(168,85,247,0.7)]',
      description: 'Légendaire'
    }
  };

  // Configuration des tailles
  const sizeConfig = {
    sm: {
      icon: 'w-4 h-4',
      badge: 'px-2 py-1 text-xs',
      percentile: 'text-xs',
      label: 'text-xs'
    },
    md: {
      icon: 'w-5 h-5',
      badge: 'px-3 py-1.5 text-sm',
      percentile: 'text-sm',
      label: 'text-sm'
    },
    lg: {
      icon: 'w-6 h-6',
      badge: 'px-4 py-2 text-base',
      percentile: 'text-base',
      label: 'text-base'
    }
  };

  const config = tierConfig[tier] || tierConfig.bronze;
  const sizes = sizeConfig[size] || sizeConfig.md;
  const IconComponent = config.icon;

  // Calculer le "Top X%"
  const topPercentage = Math.max(0, 100 - percentile).toFixed(0);

  // Variantes d'animation
  const badgeVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 15
      }
    },
    hover: {
      scale: 1.05,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 10
      }
    }
  };

  const glowVariants = {
    initial: { opacity: 0.5 },
    animate: {
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

  return (
    <motion.div
      variants={animated ? badgeVariants : {}}
      initial={animated ? 'initial' : undefined}
      animate={animated ? 'animate' : undefined}
      whileHover={animated ? 'hover' : undefined}
      className="inline-flex items-center gap-2"
    >
      {/* Badge principal */}
      <div className={`
        relative inline-flex items-center gap-2 rounded-full border-2
        ${config.bgColor} ${config.borderColor} ${sizes.badge}
        ${animated ? config.glow : ''}
        transition-all duration-300
      `}>
        {/* Icône avec gradient */}
        <div className={`
          relative flex items-center justify-center
          ${sizes.icon}
        `}>
          {animated && (
            <motion.div
              variants={glowVariants}
              initial="initial"
              animate="animate"
              className={`absolute inset-0 rounded-full bg-gradient-to-r ${config.gradient} blur-md opacity-50`}
            />
          )}
          <IconComponent className={`${config.color} ${sizes.icon} relative z-10`} />
        </div>

        {/* Label du tier */}
        {showLabel && (
          <span className={`
            font-semibold ${config.color} ${sizes.label}
          `}>
            {config.name}
          </span>
        )}

        {/* Percentile badge */}
        {showPercentile && percentile > 0 && (
          <span className={`
            ml-1 px-2 py-0.5 rounded-full 
            bg-white/80 dark:bg-slate-800/80 
            font-bold ${config.color} ${sizes.percentile}
            backdrop-blur-sm border border-current/20
          `}>
            Top {topPercentage}%
          </span>
        )}
      </div>
    </motion.div>
  );
};

/**
 * RankCard - Carte complète avec statistiques de rang
 * 
 * @param {string} rank - Le rang de l'utilisateur (bronze, argent, or, platine, diamant)
 * @param {number} percentile - Le percentile (0-100)
 * @param {number} averageScore - Score moyen de l'utilisateur
 * @param {number} totalUsers - Nombre total d'utilisateurs
 * @param {boolean} compact - Mode compact (moins d'infos)
 */
export const RankCard = ({ 
  rank = 'bronze',
  percentile = 0,
  averageScore = 0,
  totalUsers = 0,
  compact = false 
}) => {

  const tierConfig = {
    bronze: { gradient: 'from-amber-400 to-amber-600', description: 'En progression' },
    argent: { gradient: 'from-slate-300 to-slate-500', description: 'Bon niveau' },
    or: { gradient: 'from-yellow-400 to-yellow-600', description: 'Excellent' },
    platine: { gradient: 'from-cyan-300 to-cyan-500', description: 'Élite' },
    diamant: { gradient: 'from-purple-400 to-pink-500', description: 'Légendaire' }
  };

  const config = tierConfig[rank] || tierConfig.bronze;
  const topPercentage = Math.max(0, 100 - percentile).toFixed(0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        relative overflow-hidden rounded-xl border-2 
        bg-white dark:bg-slate-800 
        border-slate-200 dark:border-slate-700
        shadow-lg
        ${compact ? 'p-4' : 'p-6'}
      `}
    >
      {/* Gradient background */}
      <div className={`
        absolute inset-0 bg-gradient-to-br ${config.gradient} 
        opacity-5 dark:opacity-10
      `} />

      {/* Contenu */}
      <div className="relative z-10">
        {/* Header avec badge */}
        <div className="flex items-center justify-between mb-4">
          <RankBadge 
            tier={rank} 
            percentile={percentile}
            size={compact ? 'sm' : 'md'}
            showPercentile={true}
            showLabel={true}
            animated={true}
          />
          
          {!compact && totalUsers > 0 && (
            <div className="text-right">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Participants actifs
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {totalUsers}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-500">
                utilisateurs
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        {!compact && (
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            {config.description} • Vous surpassez <span className="font-semibold text-slate-900 dark:text-white">{percentile.toFixed(0)}%</span> des participants
          </p>
        )}

        {/* Stats grid */}
        {!compact && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  Score moyen
                </span>
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">
                {averageScore.toFixed(1)}%
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-4 h-4 text-blue-500" />
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  Percentile
                </span>
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">
                Top {topPercentage}%
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

/**
 * TierProgressBar - Barre de progression vers le tier suivant
 * 
 * @param {string} currentTier - Tier actuel
 * @param {number} percentile - Percentile actuel (0-100)
 */
export const TierProgressBar = ({ currentTier = 'bronze', percentile = 0 }) => {
  const tiers = [
    { name: 'Bronze', threshold: 0, color: 'bg-amber-500' },
    { name: 'Argent', threshold: 50, color: 'bg-slate-400' },
    { name: 'Or', threshold: 70, color: 'bg-yellow-500' },
    { name: 'Platine', threshold: 85, color: 'bg-cyan-400' },
    { name: 'Diamant', threshold: 95, color: 'bg-purple-500' }
  ];

  const currentTierIndex = tiers.findIndex(t => t.name.toLowerCase() === currentTier.toLowerCase());
  const nextTier = tiers[currentTierIndex + 1];
  
  if (!nextTier) {
    // Max tier atteint
    return (
      <div className="text-center text-sm text-green-600 dark:text-green-400 font-semibold">
        🏆 Tier maximum atteint !
      </div>
    );
  }

  const progress = Math.min(100, ((percentile - tiers[currentTierIndex].threshold) / (nextTier.threshold - tiers[currentTierIndex].threshold)) * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
        <span>Progression vers {nextTier.name}</span>
        <span className="font-semibold">{Math.round(progress)}%</span>
      </div>
      
      <div className="relative w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`h-full ${nextTier.color} rounded-full`}
        />
      </div>
      
      <div className="text-xs text-slate-500 dark:text-slate-500">
        Encore {(nextTier.threshold - percentile).toFixed(0)} points de percentile
      </div>
    </div>
  );
};

export default RankBadge;
