import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Trophy, Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

/**
 * StreakBadge Component
 * 
 * Displays user's current streak with animated flame icon,
 * progress bar to next milestone, and tooltip showing record.
 * 
 * @param {Object} props
 * @param {number} props.currentStreak - Current consecutive days
 * @param {number} props.longestStreak - Personal record
 * @param {boolean} props.compact - Show compact version (default: false)
 */
export default function StreakBadge({ 
  currentStreak = 0, 
  longestStreak = 0,
  compact = false 
}) {
  // Determine next milestone (3, 7, 30, 90, 365 days)
  const milestones = [3, 7, 30, 90, 365];
  const nextMilestone = milestones.find(m => m > currentStreak) || 365;
  const previousMilestone = milestones.filter(m => m <= currentStreak).pop() || 0;
  
  // Calculate progress to next milestone
  const progressValue = previousMilestone === 0 
    ? (currentStreak / nextMilestone) * 100
    : ((currentStreak - previousMilestone) / (nextMilestone - previousMilestone)) * 100;

  // Determine flame intensity based on streak
  const getFlameColor = () => {
    if (currentStreak >= 30) return 'text-red-600';
    if (currentStreak >= 7) return 'text-orange-600';
    if (currentStreak >= 3) return 'text-orange-500';
    return 'text-orange-400';
  };

  // Get milestone icon
  const getMilestoneIcon = () => {
    if (currentStreak >= 30) return Trophy;
    if (currentStreak >= 7) return Zap;
    return Flame;
  };

  const FlameIcon = getMilestoneIcon();

  // Compact version (for navbar, small cards)
  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 dark:bg-orange-900/20 rounded-full cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1
                }}
              >
                <FlameIcon className={`w-4 h-4 ${getFlameColor()}`} />
              </motion.div>
              <span className={`text-sm font-bold ${getFlameColor()}`}>
                {currentStreak}
              </span>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-center">
              <p className="font-semibold">{currentStreak} jours consécutifs</p>
              <p className="text-xs text-slate-500">Record: {longestStreak} jours</p>
              <p className="text-xs text-slate-500">Prochain: {nextMilestone} jours</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Full version (for dashboard, progress page)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all border border-orange-200 dark:border-orange-800"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
            Série actuelle
          </p>
          <div className="flex items-center gap-2">
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                rotate: [0, 8, -8, 0]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                repeatDelay: 1.5
              }}
            >
              <FlameIcon className={`w-8 h-8 ${getFlameColor()}`} />
            </motion.div>
            <span className={`text-4xl font-bold ${getFlameColor()}`}>
              {currentStreak}
            </span>
            <span className="text-lg text-slate-500 dark:text-slate-400">jours</span>
          </div>
        </div>

        {/* Record badge */}
        {longestStreak > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="bg-white dark:bg-slate-800 rounded-full p-3 shadow-md cursor-pointer"
                >
                  <Trophy className="w-6 h-6 text-yellow-600" />
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-semibold">Record personnel</p>
                <p className="text-sm">{longestStreak} jours</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Progress bar to next milestone */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
          <span>Prochain objectif: {nextMilestone} jours</span>
          <span className="font-semibold">
            {Math.round(progressValue)}%
          </span>
        </div>
        
        <Progress 
          value={progressValue} 
          className="h-2 bg-orange-100 dark:bg-orange-900/30"
          indicatorClassName="bg-gradient-to-r from-orange-500 to-red-500"
        />

        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-500">
            {previousMilestone > 0 ? `${previousMilestone} jours` : 'Début'}
          </span>
          <motion.span
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-orange-600 dark:text-orange-400 font-medium"
          >
            {nextMilestone - currentStreak} jours restants
          </motion.span>
        </div>
      </div>

      {/* Milestone celebrations */}
      {[3, 7, 30, 90, 365].includes(currentStreak) && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 200,
            damping: 15,
            delay: 0.3
          }}
          className="mt-4 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg p-3 text-center"
        >
          <p className="text-sm font-bold text-yellow-800 dark:text-yellow-300">
            🎉 Objectif atteint : {currentStreak} jours !
          </p>
          <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
            Continue comme ça, tu es incroyable ! 🔥
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
