/**
 * Analytics Event Tracking pour E-Réussite
 * 
 * Module pour tracker les événements utilisateur dans l'application
 * Prêt pour l'intégration avec Google Analytics 4, Mixpanel, ou Amplitude
 * 
 * Usage:
 * import { trackEvent } from '@/lib/analytics';
 * trackEvent('dashboard_visit', { user_id: '123', page: 'overview' });
 */

// Configuration
const ANALYTICS_ENABLED = import.meta.env.VITE_ANALYTICS_ENABLED === 'true' || false;
const DEBUG_MODE = import.meta.env.DEV;

/**
 * Logger central pour les événements analytics
 * @param {string} eventName - Nom de l'événement
 * @param {object} eventData - Données associées à l'événement
 */
const logEvent = (eventName, eventData = {}) => {
  if (!ANALYTICS_ENABLED && !DEBUG_MODE) return;

  const timestamp = new Date().toISOString();
  const enrichedData = {
    timestamp,
    url: window.location.href,
    userAgent: navigator.userAgent,
    ...eventData
  };

  // Mode debug: console.log
  if (DEBUG_MODE) {
    console.log(
      `%c📊 Analytics Event: ${eventName}`,
      'background: #10B981; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;',
      enrichedData
    );
  }

  // TODO: Intégrer ici les appels à votre plateforme analytics
  // Exemples:
  
  // Google Analytics 4
  // if (window.gtag) {
  //   window.gtag('event', eventName, enrichedData);
  // }
  
  // Mixpanel
  // if (window.mixpanel) {
  //   window.mixpanel.track(eventName, enrichedData);
  // }
  
  // Amplitude
  // if (window.amplitude) {
  //   window.amplitude.getInstance().logEvent(eventName, enrichedData);
  // }
};

/**
 * Event générique
 * @param {string} eventName - Nom de l'événement
 * @param {object} properties - Propriétés de l'événement
 */
export const trackEvent = (eventName, properties = {}) => {
  logEvent(eventName, properties);
};

// ============================================
// DASHBOARD EVENTS
// ============================================

/**
 * Tracker une visite sur le dashboard
 * @param {string} userId - ID de l'utilisateur
 * @param {string} tab - Onglet actif (overview, progress, analytics, achievements)
 */
export const trackDashboardVisit = (userId, tab = 'overview') => {
  logEvent('dashboard_visit', {
    user_id: userId,
    active_tab: tab,
    page: 'dashboard'
  });
};

/**
 * Tracker un changement de période de filtre (7j/30j/90j)
 * @param {number} period - Période sélectionnée (7, 30, 90)
 * @param {string} userId - ID de l'utilisateur
 */
export const trackPeriodChange = (period, userId) => {
  logEvent('period_filter_changed', {
    user_id: userId,
    period_days: period,
    previous_period: null // Peut être enrichi plus tard
  });
};

/**
 * Tracker la visualisation d'un chart
 * @param {string} chartType - Type de chart (donut, bar, area)
 * @param {string} userId - ID de l'utilisateur
 */
export const trackChartView = (chartType, userId) => {
  logEvent('chart_viewed', {
    user_id: userId,
    chart_type: chartType,
    location: 'dashboard'
  });
};

/**
 * Tracker l'export PDF du dashboard
 * @param {string} userId - ID de l'utilisateur
 * @param {boolean} success - Si l'export a réussi
 */
export const trackExportPDF = (userId, success = true) => {
  logEvent('dashboard_export_pdf', {
    user_id: userId,
    success,
    export_type: 'pdf',
    page: 'dashboard'
  });
};

// ============================================
// QUIZ EVENTS
// ============================================

/**
 * Tracker le démarrage d'un quiz
 * @param {string} userId - ID de l'utilisateur
 * @param {string} quizId - ID du quiz
 * @param {string} matiere - Matière du quiz
 */
export const trackQuizStart = (userId, quizId, matiere) => {
  logEvent('quiz_started', {
    user_id: userId,
    quiz_id: quizId,
    matiere,
    page: 'quiz'
  });
};

/**
 * Tracker la complétion d'un quiz
 * @param {string} userId - ID de l'utilisateur
 * @param {string} quizId - ID du quiz
 * @param {number} score - Score obtenu (0-100)
 * @param {number} timeTaken - Temps pris en secondes
 */
export const trackQuizComplete = (userId, quizId, score, timeTaken) => {
  logEvent('quiz_completed', {
    user_id: userId,
    quiz_id: quizId,
    score,
    time_taken_seconds: timeTaken,
    performance: score >= 80 ? 'excellent' : score >= 60 ? 'good' : 'needs_improvement',
    page: 'quiz'
  });
};

// ============================================
// EXAM EVENTS
// ============================================

/**
 * Tracker le démarrage d'un examen
 * @param {string} userId - ID de l'utilisateur
 * @param {string} examId - ID de l'examen
 * @param {string} examType - Type d'examen (blanc, matiere)
 */
export const trackExamStart = (userId, examId, examType) => {
  logEvent('exam_started', {
    user_id: userId,
    exam_id: examId,
    exam_type: examType,
    page: 'exam'
  });
};

/**
 * Tracker la complétion d'un examen
 * @param {string} userId - ID de l'utilisateur
 * @param {string} examId - ID de l'examen
 * @param {number} score - Score obtenu
 * @param {number} timeTaken - Temps pris en minutes
 */
export const trackExamComplete = (userId, examId, score, timeTaken) => {
  logEvent('exam_completed', {
    user_id: userId,
    exam_id: examId,
    score,
    time_taken_minutes: timeTaken,
    passed: score >= 50,
    page: 'exam'
  });
};

// ============================================
// GAMIFICATION EVENTS
// ============================================

/**
 * Tracker le déblocage d'un badge
 * @param {string} userId - ID de l'utilisateur
 * @param {string} badgeId - ID du badge
 * @param {string} badgeName - Nom du badge
 */
export const trackBadgeUnlocked = (userId, badgeId, badgeName) => {
  logEvent('badge_unlocked', {
    user_id: userId,
    badge_id: badgeId,
    badge_name: badgeName,
    page: 'achievements'
  });
};

/**
 * Tracker l'augmentation de level
 * @param {string} userId - ID de l'utilisateur
 * @param {number} newLevel - Nouveau level atteint
 * @param {number} totalPoints - Points totaux
 */
export const trackLevelUp = (userId, newLevel, totalPoints) => {
  logEvent('level_up', {
    user_id: userId,
    new_level: newLevel,
    total_points: totalPoints,
    page: 'dashboard'
  });
};

/**
 * Tracker le milestone de streak
 * @param {string} userId - ID de l'utilisateur
 * @param {number} streakDays - Nombre de jours de streak
 */
export const trackStreakMilestone = (userId, streakDays) => {
  logEvent('streak_milestone', {
    user_id: userId,
    streak_days: streakDays,
    milestone_type: streakDays >= 30 ? 'legendary' : streakDays >= 14 ? 'epic' : 'rare',
    page: 'dashboard'
  });
};

// ============================================
// USER ACTIONS
// ============================================

/**
 * Tracker une recherche
 * @param {string} userId - ID de l'utilisateur
 * @param {string} query - Terme recherché
 * @param {number} resultsCount - Nombre de résultats
 */
export const trackSearch = (userId, query, resultsCount) => {
  logEvent('search_performed', {
    user_id: userId,
    search_query: query,
    results_count: resultsCount
  });
};

/**
 * Tracker un clic sur bouton d'action
 * @param {string} userId - ID de l'utilisateur
 * @param {string} buttonName - Nom du bouton
 * @param {string} location - Où le bouton a été cliqué
 */
export const trackButtonClick = (userId, buttonName, location) => {
  logEvent('button_clicked', {
    user_id: userId,
    button_name: buttonName,
    location
  });
};

/**
 * Tracker l'ouverture d'un lien externe
 * @param {string} userId - ID de l'utilisateur
 * @param {string} url - URL du lien externe
 * @param {string} location - Où le lien a été cliqué
 */
export const trackExternalLinkClick = (userId, url, location) => {
  logEvent('external_link_clicked', {
    user_id: userId,
    external_url: url,
    location
  });
};

// ============================================
// SESSION TRACKING
// ============================================

/**
 * Tracker le début de session
 * @param {string} userId - ID de l'utilisateur
 */
export const trackSessionStart = (userId) => {
  logEvent('session_start', {
    user_id: userId,
    session_start: new Date().toISOString()
  });
};

/**
 * Tracker la fin de session
 * @param {string} userId - ID de l'utilisateur
 * @param {number} duration - Durée de la session en secondes
 */
export const trackSessionEnd = (userId, duration) => {
  logEvent('session_end', {
    user_id: userId,
    session_duration_seconds: duration,
    session_end: new Date().toISOString()
  });
};

export default {
  trackEvent,
  trackDashboardVisit,
  trackPeriodChange,
  trackChartView,
  trackExportPDF,
  trackQuizStart,
  trackQuizComplete,
  trackExamStart,
  trackExamComplete,
  trackBadgeUnlocked,
  trackLevelUp,
  trackStreakMilestone,
  trackSearch,
  trackButtonClick,
  trackExternalLinkClick,
  trackSessionStart,
  trackSessionEnd
};
