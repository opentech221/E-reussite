import React from 'react';
import { Trophy, Award, Star, Zap, Target, BookOpen, Flame } from 'lucide-react';

// Mapping des types de badges vers leurs icônes et couleurs
const badgeConfig = {
  first_quiz: {
    icon: BookOpen,
    title: '🎯 Premier Quiz !',
    color: 'from-blue-500 to-blue-600',
    message: 'Vous avez complété votre premier quiz !',
  },
  perfect_score: {
    icon: Star,
    title: '⭐ Score Parfait !',
    color: 'from-yellow-500 to-yellow-600',
    message: '100% de bonnes réponses !',
  },
  streak_3: {
    icon: Flame,
    title: '🔥 Série de 3 jours !',
    color: 'from-orange-500 to-red-500',
    message: 'Continuez comme ça !',
  },
  streak_7: {
    icon: Flame,
    title: '🔥 Série de 7 jours !',
    color: 'from-orange-600 to-red-600',
    message: 'Impressionnant !',
  },
  streak_30: {
    icon: Flame,
    title: '🔥 Série de 30 jours !',
    color: 'from-red-600 to-purple-600',
    message: 'Vous êtes un champion !',
  },
  quiz_master_10: {
    icon: Trophy,
    title: '🏆 10 Quiz Complétés !',
    color: 'from-amber-500 to-amber-600',
    message: 'Maître des quiz !',
  },
  quiz_master_50: {
    icon: Trophy,
    title: '🏆 50 Quiz Complétés !',
    color: 'from-amber-600 to-yellow-600',
    message: 'Expert absolu !',
  },
  chapter_complete: {
    icon: Target,
    title: '✅ Chapitre Terminé !',
    color: 'from-green-500 to-green-600',
    message: 'Bravo pour cette réussite !',
  },
  level_up: {
    icon: Zap,
    title: '⚡ Niveau Supérieur !',
    color: 'from-purple-500 to-purple-600',
    message: 'Vous avez atteint un nouveau niveau !',
  },
};

// Composant de notification de badge (utilisé dans le toast)
export const BadgeToastContent = ({ badgeType, metadata = {} }) => {
  const config = badgeConfig[badgeType] || {
    icon: Award,
    title: '🏅 Nouveau Badge !',
    color: 'from-primary to-blue-600',
    message: 'Vous avez débloqué un badge !',
  };

  const Icon = config.icon;

  return (
    <div className="flex items-start gap-3 p-2">
      <div
        className={`w-12 h-12 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center flex-shrink-0 animate-bounce`}
      >
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-slate-900 mb-1">{config.title}</p>
        <p className="text-sm text-slate-600">{config.message}</p>
        {metadata.points && (
          <p className="text-xs text-primary font-semibold mt-1">
            +{metadata.points} points 🎁
          </p>
        )}
      </div>
    </div>
  );
};

// Composant pour afficher un niveau supérieur
export const LevelUpToastContent = ({ level, points }) => {
  return (
    <div className="flex items-start gap-3 p-2">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0 animate-bounce">
        <Zap className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-slate-900 mb-1">⚡ Niveau {level} Atteint !</p>
        <p className="text-sm text-slate-600">
          Vous progressez incroyablement bien !
        </p>
        <p className="text-xs text-purple-600 font-semibold mt-1">
          Total : {points} points 🎉
        </p>
      </div>
    </div>
  );
};

// Export de la configuration pour utilisation ailleurs
export { badgeConfig };
