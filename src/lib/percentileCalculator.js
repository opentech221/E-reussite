import { supabase } from './customSupabaseClient';

/**
 * Système de rangs basé sur le percentile ou le score moyen
 */
const RANK_THRESHOLDS_PERCENTILE = {
  diamant: 95,  // Top 5%
  platine: 85,  // Top 15%
  or: 70,       // Top 30%
  argent: 50,   // Top 50%
  bronze: 0,    // Autres
};

const RANK_THRESHOLDS_SCORE = {
  diamant: 90,  // Score ≥ 90%
  platine: 80,  // Score ≥ 80%
  or: 70,       // Score ≥ 70%
  argent: 60,   // Score ≥ 60%
  bronze: 0,    // Score < 60%
};

const RANK_INFO = {
  diamant: {
    rank: 'diamant',
    name: 'Diamant',
    color: '#a78bfa',
    icon: 'Trophy',
    minPercentile: 95,
    minScore: 90,
  },
  platine: {
    rank: 'platine',
    name: 'Platine',
    color: '#e5e7eb',
    icon: 'Star',
    minPercentile: 85,
    minScore: 80,
  },
  or: {
    rank: 'or',
    name: 'Or',
    color: '#fbbf24',
    icon: 'Crown',
    minPercentile: 70,
    minScore: 70,
  },
  argent: {
    rank: 'argent',
    name: 'Argent',
    color: '#c0c0c0',
    icon: 'Award',
    minPercentile: 50,
    minScore: 60,
  },
  bronze: {
    rank: 'bronze',
    name: 'Bronze',
    color: '#cd7f32',
    icon: 'Medal',
    minPercentile: 0,
    minScore: 0,
  },
};

/**
 * Calcule le percentile d'un utilisateur basé sur ses quiz interactifs
 */
export async function calculateUserPercentile(userId) {
  try {
    // 1. Récupérer tous les quiz complétés de tous les utilisateurs
    const { data: allSessions, error: sessionsError } = await supabase
      .from('interactive_quiz_sessions')
      .select('user_id, score_percentage')
      .eq('status', 'completed');

    if (sessionsError) throw sessionsError;

    if (!allSessions || allSessions.length === 0) {
      // Aucun quiz complété sur la plateforme
      return {
        percentile: 0,
        rank: 'bronze',
        averageScore: 0,
        totalUsers: 0,
        quizCount: 0,
        rankInfo: RANK_INFO.bronze,
      };
    }

    // 2. Calculer le score moyen de chaque utilisateur
    const userScores = {};
    
    allSessions.forEach(session => {
      if (!userScores[session.user_id]) {
        userScores[session.user_id] = [];
      }
      userScores[session.user_id].push(session.score_percentage);
    });

    const userAverages = Object.entries(userScores).map(([uid, scores]) => ({
      userId: uid,
      averageScore: scores.reduce((sum, score) => sum + score, 0) / scores.length,
      quizCount: scores.length,
    }));

    // 3. Trouver le score moyen de l'utilisateur courant
    const currentUser = userAverages.find(u => u.userId === userId);
    
    if (!currentUser) {
      // L'utilisateur n'a pas encore complété de quiz
      return {
        percentile: 0,
        rank: 'bronze',
        averageScore: 0,
        totalUsers: userAverages.length,
        quizCount: 0,
        rankInfo: RANK_INFO.bronze,
      };
    }

    // 4. Calculer le percentile
    const usersBelow = userAverages.filter(
      u => u.averageScore < currentUser.averageScore
    ).length;

    const percentile = userAverages.length > 1
      ? (usersBelow / (userAverages.length - 1)) * 100
      : 100; // Si seul utilisateur, il est à 100%

    // 5. Déterminer le rang basé sur le percentile
    const rank = getRankByPercentile(percentile);

    // 6. Calculer le rang suivant et points manquants
    const nextRank = getNextRank(rank.rank);
    const pointsToNextRank = nextRank
      ? nextRank.minScore - currentUser.averageScore
      : 0;

    return {
      percentile: Math.round(percentile * 10) / 10, // 1 décimale
      rank: rank.rank,
      averageScore: Math.round(currentUser.averageScore * 10) / 10,
      totalUsers: userAverages.length,
      quizCount: currentUser.quizCount,
      rankInfo: rank,
      nextRank: nextRank,
      pointsToNextRank: Math.max(0, pointsToNextRank),
    };
  } catch (error) {
    console.error('Error calculating percentile:', error);
    
    // Valeurs par défaut en cas d'erreur
    return {
      percentile: 0,
      rank: 'bronze',
      averageScore: 0,
      totalUsers: 0,
      quizCount: 0,
      rankInfo: RANK_INFO.bronze,
    };
  }
}

/**
 * Détermine le rang basé sur le percentile
 */
export function getRankByPercentile(percentile) {
  if (percentile >= RANK_THRESHOLDS_PERCENTILE.diamant) {
    return RANK_INFO.diamant;
  }
  if (percentile >= RANK_THRESHOLDS_PERCENTILE.platine) {
    return RANK_INFO.platine;
  }
  if (percentile >= RANK_THRESHOLDS_PERCENTILE.or) {
    return RANK_INFO.or;
  }
  if (percentile >= RANK_THRESHOLDS_PERCENTILE.argent) {
    return RANK_INFO.argent;
  }
  return RANK_INFO.bronze;
}

/**
 * Détermine le rang basé sur le score moyen
 */
export function getRankByScore(averageScore) {
  if (averageScore >= RANK_THRESHOLDS_SCORE.diamant) {
    return RANK_INFO.diamant;
  }
  if (averageScore >= RANK_THRESHOLDS_SCORE.platine) {
    return RANK_INFO.platine;
  }
  if (averageScore >= RANK_THRESHOLDS_SCORE.or) {
    return RANK_INFO.or;
  }
  if (averageScore >= RANK_THRESHOLDS_SCORE.argent) {
    return RANK_INFO.argent;
  }
  return RANK_INFO.bronze;
}

/**
 * Obtient le rang suivant
 */
function getNextRank(currentRank) {
  const rankOrder = ['bronze', 'argent', 'or', 'platine', 'diamant'];
  const currentIndex = rankOrder.indexOf(currentRank);
  
  if (currentIndex === -1 || currentIndex === rankOrder.length - 1) {
    return null; // Déjà au rang maximum
  }
  
  return RANK_INFO[rankOrder[currentIndex + 1]];
}

/**
 * Récupère les statistiques globales de la plateforme
 */
export async function getGlobalStats() {
  try {
    const { data: sessions, error } = await supabase
      .from('interactive_quiz_sessions')
      .select('user_id, score_percentage')
      .eq('status', 'completed');

    if (error) throw error;

    if (!sessions || sessions.length === 0) {
      return {
        totalUsers: 0,
        averageScore: 0,
        bestScore: 0,
        totalQuizzes: 0,
      };
    }

    // Calculer par utilisateur
    const userScores = {};
    sessions.forEach(session => {
      if (!userScores[session.user_id]) {
        userScores[session.user_id] = [];
      }
      userScores[session.user_id].push(session.score_percentage);
    });

    const userAverages = Object.values(userScores).map(scores =>
      scores.reduce((sum, score) => sum + score, 0) / scores.length
    );

    const totalUsers = Object.keys(userScores).length;
    const averageScore = userAverages.reduce((sum, avg) => sum + avg, 0) / totalUsers;
    const bestScore = Math.max(...userAverages);

    return {
      totalUsers,
      averageScore: Math.round(averageScore * 10) / 10,
      bestScore: Math.round(bestScore * 10) / 10,
      totalQuizzes: sessions.length,
    };
  } catch (error) {
    console.error('Error fetching global stats:', error);
    return {
      totalUsers: 0,
      averageScore: 0,
      bestScore: 0,
      totalQuizzes: 0,
    };
  }
}

/**
 * Obtient les informations d'un rang
 */
export function getRankInfo(rankName) {
  return RANK_INFO[rankName] || RANK_INFO.bronze;
}

/**
 * Exporte toutes les informations de rangs
 */
export { RANK_INFO };
