/**
 * ============================================
 * SERVICE IA COACH - E-Réussite
 * ============================================
 * 
 * Super Coach IA qui analyse toutes les données de l'élève
 * et fournit des conseils personnalisés pour réussir brillamment.
 * 
 * Fonctionnalités :
 * - Analyse complète des performances
 * - Prédiction de réussite aux examens
 * - Identification des forces et faiblesses
 * - Plans d'étude personnalisés
 * - Recommandations de révision
 * - Motivation et encouragements
 */

import { supabase } from './customSupabaseClient';

export class AICoachService {
  constructor(userId) {
    this.userId = userId;
    this.userData = null;
  }

  /**
   * ============================================
   * AGRÉGATION DES DONNÉES
   * ============================================
   */

  async aggregateUserData() {
    try {
      console.log('🤖 [AI Coach] Agrégation des données pour:', this.userId);

      // Profil utilisateur
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', this.userId)
        .single();

      // Points et niveau
      const { data: points } = await supabase
        .from('user_points')
        .select('*')
        .eq('user_id', this.userId)
        .single();

      // Progression par chapitre
      const { data: progress } = await supabase
        .from('user_progress')
        .select(`
          *,
          chapitres (
            id, title,
            matieres (id, name)
          )
        `)
        .eq('user_id', this.userId);

      // Résultats d'examens
      const { data: examResults } = await supabase
        .from('exam_results')
        .select(`
          *,
          examens (id, title, type, difficulty, duration_minutes)
        `)
        .eq('user_id', this.userId)
        .order('completed_at', { ascending: false });

      // Badges gagnés - JOIN avec table badges
      const { data: badges } = await supabase
        .from('user_badges')
        .select('id, badge_name, badge_icon, badge_description, badge_type, earned_at')
        .eq('user_id', this.userId)
        .order('earned_at', { ascending: false });

      // Défis (table optionnelle - peut ne pas exister)
      let challenges = [];
      try {
        const { data: challengesData } = await supabase
          .from('user_learning_challenges')
          .select('*')
          .eq('user_id', this.userId)
          .order('created_at', { ascending: false })
          .limit(10);
        challenges = challengesData || [];
      } catch (error) {
        console.warn('⚠️ [AI Coach] Table user_learning_challenges non disponible');
      }

      // Historique des points
      const { data: pointsHistory } = await supabase
        .from('user_points_history')
        .select('*')
        .eq('user_id', this.userId)
        .order('created_at', { ascending: false })
        .limit(50);

      // Matières disponibles
      const levelMap = { 1: 'bfem', 2: 'bac' };
      const userLevel = levelMap[profile?.level] || 'bfem';
      
      const { data: matieres } = await supabase
        .from('matieres')
        .select('id, name')
        .eq('level', userLevel);

      this.userData = {
        profile,
        points,
        progress,
        examResults: examResults || [],
        badges: badges || [],
        challenges: challenges || [],
        pointsHistory: pointsHistory || [],
        matieres: matieres || []
      };

      console.log('✅ [AI Coach] Données agrégées:', {
        progress: progress?.length || 0,
        exams: examResults?.length || 0,
        badges: badges?.length || 0,
        challenges: challenges?.length || 0
      });

      return this.userData;

    } catch (error) {
      console.error('❌ [AI Coach] Erreur agrégation:', error);
      return null;
    }
  }

  /**
   * ============================================
   * ANALYSE DES PERFORMANCES
   * ============================================
   */

  async analyzePerformance() {
    if (!this.userData) {
      await this.aggregateUserData();
    }

    const analysis = {
      overall: this.analyzeOverallPerformance(),
      bySubject: this.analyzeBySubject(),
      exams: this.analyzeExamPerformance(),
      studyHabits: this.analyzeStudyHabits(),
      strengths: [],
      weaknesses: [],
      predictions: {}
    };

    // Identifier forces et faiblesses
    analysis.strengths = this.identifyStrengths(analysis);
    analysis.weaknesses = this.identifyWeaknesses(analysis);

    // Prédictions
    analysis.predictions = this.generatePredictions(analysis);

    console.log('📊 [AI Coach] Analyse complète:', analysis);

    return analysis;
  }

  analyzeOverallPerformance() {
    const { points, progress, examResults, quizResults } = this.userData;

    const totalChapters = progress?.length || 0;
    const completedChapters = progress?.filter(p => p.completed).length || 0;
    const completionRate = totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0;

    const totalExams = examResults?.length || 0;
    const avgExamScore = totalExams > 0
      ? examResults.reduce((sum, e) => sum + e.score, 0) / totalExams
      : 0;

    // Calculer score moyen des quiz
    let averageScore = 0;
    if (this.userData.quizResults && this.userData.quizResults.length > 0) {
      const validQuiz = this.userData.quizResults.filter(q => q.total_questions > 0);
      if (validQuiz.length > 0) {
        averageScore = Math.round(
          validQuiz.reduce((sum, q) => sum + (q.score / q.total_questions) * 100, 0) / validQuiz.length
        );
      }
    }

    const currentLevel = points?.level || 1;
    const totalPoints = points?.total_points || 0;
    const currentStreak = points?.current_streak || 0;

    return {
      level: currentLevel,
      totalPoints,
      currentStreak,
      completionRate: Math.round(completionRate),
      totalChapters,
      completedChapters,
      totalExams,
      avgExamScore: Math.round(avgExamScore),
      averageScore, // Score moyen des quiz
      grade: this.calculateGrade(avgExamScore, completionRate, currentStreak)
    };
  }

  analyzeBySubject() {
    const { progress, matieres } = this.userData;

    return matieres.map(matiere => {
      const chaptersForSubject = progress?.filter(p => 
        p.chapitres?.matieres?.id === matiere.id
      ) || [];

      const completed = chaptersForSubject.filter(c => c.completed).length;
      const total = chaptersForSubject.length;
      const completionRate = total > 0 ? (completed / total) * 100 : 0;

      const timeSpent = chaptersForSubject.reduce((sum, c) => sum + (c.time_spent || 0), 0);

      return {
        name: matiere.name,
        id: matiere.id,
        completed,
        total,
        completionRate: Math.round(completionRate),
        timeSpent: Math.round(timeSpent / 60), // minutes
        status: this.getSubjectStatus(completionRate, timeSpent)
      };
    });
  }

  analyzeExamPerformance() {
    const { examResults } = this.userData;

    if (!examResults || examResults.length === 0) {
      return {
        totalExams: 0,
        avgScore: 0,
        bestScore: 0,
        recentTrend: 'none',
        readiness: 0
      };
    }

    const totalExams = examResults.length;
    const avgScore = examResults.reduce((sum, e) => sum + e.score, 0) / totalExams;
    const bestScore = Math.max(...examResults.map(e => e.score));

    // Analyser la tendance (5 derniers examens)
    const recentExams = examResults.slice(0, 5);
    const recentAvg = recentExams.reduce((sum, e) => sum + e.score, 0) / recentExams.length;
    const recentTrend = recentAvg > avgScore ? 'improving' : 
                       recentAvg < avgScore ? 'declining' : 'stable';

    // Calculer la "préparation" (readiness) pour les examens
    const readiness = this.calculateExamReadiness(avgScore, totalExams, recentTrend);

    return {
      totalExams,
      avgScore: Math.round(avgScore),
      bestScore,
      recentTrend,
      readiness,
      byDifficulty: this.groupExamsByDifficulty(examResults)
    };
  }

  analyzeStudyHabits() {
    const { pointsHistory, points } = this.userData;

    // Analyser la régularité (streak)
    const currentStreak = points?.current_streak || 0;
    const consistency = this.calculateConsistency(currentStreak);

    // Analyser l'activité par jour de la semaine
    const activityByDay = this.analyzeActivityByDay(pointsHistory);

    // Temps d'étude moyen
    const avgStudyTime = this.calculateAvgStudyTime();

    return {
      currentStreak,
      consistency,
      activityByDay,
      avgStudyTime,
      mostProductiveDay: this.getMostProductiveDay(activityByDay)
    };
  }

  /**
   * ============================================
   * IDENTIFICATION FORCES & FAIBLESSES
   * ============================================
   */

  identifyStrengths(analysis) {
    const strengths = [];

    // Force 1: Streak élevé
    if (analysis.studyHabits.currentStreak >= 7) {
      strengths.push({
        type: 'consistency',
        icon: '🔥',
        title: 'Régularité exceptionnelle',
        description: `Vous avez ${analysis.studyHabits.currentStreak} jours consécutifs ! Continuez ainsi !`
      });
    }

    // Force 2: Bon score moyen
    if (analysis.exams.avgScore >= 75) {
      strengths.push({
        type: 'exams',
        icon: '🎯',
        title: 'Excellentes performances aux examens',
        description: `Score moyen de ${analysis.exams.avgScore}% - Vous maîtrisez bien !`
      });
    }

    // Force 3: Taux de complétion élevé
    if (analysis.overall.completionRate >= 70) {
      strengths.push({
        type: 'completion',
        icon: '📚',
        title: 'Progression solide',
        description: `${analysis.overall.completionRate}% des chapitres complétés`
      });
    }

    // Force 4: Matière forte
    const bestSubject = analysis.bySubject.sort((a, b) => b.completionRate - a.completionRate)[0];
    if (bestSubject && bestSubject.completionRate >= 60) {
      strengths.push({
        type: 'subject',
        icon: '⭐',
        title: `Excellent en ${bestSubject.name}`,
        description: `${bestSubject.completionRate}% complété`
      });
    }

    return strengths;
  }

  identifyWeaknesses(analysis) {
    const weaknesses = [];

    // Faiblesse 1: Streak faible
    if (analysis.studyHabits.currentStreak < 3) {
      weaknesses.push({
        type: 'consistency',
        icon: '⚠️',
        title: 'Manque de régularité',
        description: 'Essayez d\'étudier un peu chaque jour',
        priority: 'high',
        recommendations: [
          'Fixez-vous un horaire d\'étude quotidien',
          'Commencez par 20 minutes par jour',
          'Activez les notifications de rappel'
        ]
      });
    }

    // Faiblesse 2: Score examen bas
    if (analysis.exams.avgScore < 60 && analysis.exams.totalExams > 0) {
      weaknesses.push({
        type: 'exams',
        icon: '📉',
        title: 'Scores aux examens à améliorer',
        description: `Score moyen: ${analysis.exams.avgScore}%`,
        priority: 'high',
        recommendations: [
          'Refaites les examens échoués',
          'Révisez les chapitres liés',
          'Pratiquez plus de questions'
        ]
      });
    }

    // Faiblesse 3: Matière faible
    const weakSubject = analysis.bySubject.sort((a, b) => a.completionRate - b.completionRate)[0];
    if (weakSubject && weakSubject.completionRate < 30) {
      weaknesses.push({
        type: 'subject',
        icon: '🔍',
        title: `${weakSubject.name} nécessite plus d'attention`,
        description: `Seulement ${weakSubject.completionRate}% complété`,
        priority: 'medium',
        recommendations: [
          `Consacrez 30 minutes par jour à ${weakSubject.name}`,
          'Commencez par les chapitres les plus faciles',
          'Demandez de l\'aide sur les points difficiles'
        ]
      });
    }

    // Faiblesse 4: Tendance déclinante
    if (analysis.exams.recentTrend === 'declining') {
      weaknesses.push({
        type: 'trend',
        icon: '📊',
        title: 'Baisse récente de performance',
        description: 'Vos derniers scores sont en dessous de votre moyenne',
        priority: 'high',
        recommendations: [
          'Prenez une pause pour éviter la fatigue',
          'Revisitez les bases',
          'Variez vos méthodes d\'apprentissage'
        ]
      });
    }

    return weaknesses;
  }

  /**
   * ============================================
   * PRÉDICTIONS & RECOMMANDATIONS
   * ============================================
   */

  generatePredictions(analysis) {
    const predictions = {
      examSuccess: this.predictExamSuccess(analysis),
      nextLevel: this.predictNextLevel(analysis),
      timeToMastery: this.predictTimeToMastery(analysis),
      riskAreas: this.identifyRiskAreas(analysis)
    };

    return predictions;
  }

  predictExamSuccess(analysis) {
    const { avgScore, totalExams, recentTrend, readiness } = analysis.exams;
    const { completionRate } = analysis.overall;

    // Facteurs de succès
    const factors = {
      pastPerformance: avgScore / 100, // 0-1
      experience: Math.min(totalExams / 10, 1), // 0-1
      preparation: completionRate / 100, // 0-1
      momentum: recentTrend === 'improving' ? 1.2 : recentTrend === 'declining' ? 0.8 : 1
    };

    // Calcul probabilité de succès (moyenne pondérée)
    const successProbability = (
      factors.pastPerformance * 0.4 +
      factors.experience * 0.2 +
      factors.preparation * 0.3 +
      (readiness / 100) * 0.1
    ) * factors.momentum;

    const percentage = Math.min(Math.round(successProbability * 100), 100);

    return {
      percentage,
      level: percentage >= 80 ? 'high' : percentage >= 60 ? 'medium' : 'low',
      confidence: totalExams >= 5 ? 'high' : totalExams >= 2 ? 'medium' : 'low',
      message: this.getSuccessMessage(percentage)
    };
  }

  predictNextLevel(analysis) {
    const { totalPoints, level } = analysis.overall;
    const pointsForNextLevel = level * 100;
    const pointsNeeded = pointsForNextLevel - (totalPoints % 100);
    
    // Estimer le temps basé sur l'activité récente
    const { pointsHistory } = this.userData;
    const recentPoints = pointsHistory.slice(0, 7); // 7 derniers jours
    const avgPointsPerDay = recentPoints.length > 0
      ? recentPoints.reduce((sum, p) => sum + p.points_earned, 0) / 7
      : 10; // Default

    const daysToNextLevel = avgPointsPerDay > 0 ? Math.ceil(pointsNeeded / avgPointsPerDay) : 30;

    return {
      currentLevel: level,
      nextLevel: level + 1,
      pointsNeeded,
      daysEstimated: daysToNextLevel,
      message: `Encore ${pointsNeeded} points pour le niveau ${level + 1} (environ ${daysToNextLevel} jours)`
    };
  }

  predictTimeToMastery(analysis) {
    const { completionRate } = analysis.overall;
    const remainingChapters = analysis.overall.totalChapters - analysis.overall.completedChapters;
    
    // Estimer temps moyen par chapitre (30 minutes)
    const avgTimePerChapter = 30;
    const totalMinutesNeeded = remainingChapters * avgTimePerChapter;
    const hoursNeeded = Math.ceil(totalMinutesNeeded / 60);
    
    // Estimer nombre de jours (si 1h par jour)
    const daysNeeded = Math.ceil(hoursNeeded);

    return {
      hoursNeeded,
      daysNeeded,
      remainingChapters,
      message: `Environ ${hoursNeeded}h de révision pour maîtriser toutes les matières`
    };
  }

  identifyRiskAreas(analysis) {
    const risks = [];

    // Risque 1: Aucun examen passé
    if (analysis.exams.totalExams === 0) {
      risks.push({
        type: 'no_practice',
        severity: 'high',
        title: 'Aucun examen de pratique',
        message: 'Passez des examens blancs pour évaluer votre niveau',
        action: 'Commencer un examen'
      });
    }

    // Risque 2: Matière non commencée
    const unstarted = analysis.bySubject.filter(s => s.completionRate === 0);
    if (unstarted.length > 0) {
      risks.push({
        type: 'unstarted_subjects',
        severity: 'medium',
        title: `${unstarted.length} matière(s) non commencée(s)`,
        message: `${unstarted.map(s => s.name).join(', ')}`,
        action: 'Commencer ces matières'
      });
    }

    // Risque 3: Inactivité
    if (analysis.studyHabits.currentStreak === 0) {
      risks.push({
        type: 'inactivity',
        severity: 'high',
        title: 'Inactivité détectée',
        message: 'Vous n\'avez pas étudié récemment',
        action: 'Reprendre maintenant'
      });
    }

    return risks;
  }

  /**
   * ============================================
   * GÉNÉRATION DE PLANS D'ÉTUDE
   * ============================================
   */

  async generateStudyPlan(targetDate = null, hoursPerDay = 2) {
    const analysis = await this.analyzePerformance();
    
    const plan = {
      title: 'Plan d\'étude personnalisé',
      generatedAt: new Date().toISOString(),
      targetDate,
      hoursPerDay,
      schedule: [],
      priorities: [],
      tips: []
    };

    // Priorités basées sur les faiblesses
    plan.priorities = analysis.weaknesses.map(w => ({
      area: w.title,
      priority: w.priority,
      recommendations: w.recommendations
    }));

    // Génération du planning hebdomadaire
    plan.schedule = this.generateWeeklySchedule(analysis, hoursPerDay);

    // Conseils personnalisés
    plan.tips = this.generatePersonalizedTips(analysis);

    return plan;
  }

  generateWeeklySchedule(analysis, hoursPerDay) {
    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    const schedule = [];

    // Répartir les matières sur la semaine
    const subjects = analysis.bySubject.sort((a, b) => a.completionRate - b.completionRate); // Plus faibles en premier
    
    days.forEach((day, index) => {
      const subject = subjects[index % subjects.length];
      const minutesPerSubject = (hoursPerDay * 60) / 2; // 2 matières par jour

      schedule.push({
        day,
        sessions: [
          {
            time: '09:00-10:00',
            subject: subject.name,
            activity: 'Révision cours',
            duration: minutesPerSubject
          },
          {
            time: '16:00-17:00',
            subject: subjects[(index + 1) % subjects.length].name,
            activity: 'Exercices pratiques',
            duration: minutesPerSubject
          }
        ]
      });
    });

    return schedule;
  }

  generatePersonalizedTips(analysis) {
    const tips = [];

    // Conseil basé sur le niveau
    if (analysis.overall.level < 3) {
      tips.push('🌱 Commencez par les bases - la maîtrise vient avec la pratique régulière');
    } else {
      tips.push('🚀 Vous progressez bien ! Concentrez-vous maintenant sur la vitesse et la précision');
    }

    // Conseil basé sur la régularité
    if (analysis.studyHabits.currentStreak < 7) {
      tips.push('⏰ La régularité est la clé : 30 minutes par jour valent mieux que 3h une fois par semaine');
    }

    // Conseil basé sur les examens
    if (analysis.exams.totalExams < 5) {
      tips.push('📝 Passez plus d\'examens blancs pour vous habituer au format et gérer votre stress');
    }

    // Conseil général
    tips.push('💡 Révisez le soir ce que vous avez appris le matin - la répétition espacée améliore la rétention');

    return tips;
  }

  /**
   * ============================================
   * FONCTIONS UTILITAIRES
   * ============================================
   */

  calculateGrade(avgExamScore, completionRate, streak) {
    const score = (avgExamScore * 0.5) + (completionRate * 0.3) + (Math.min(streak * 2, 20) * 0.2);
    
    if (score >= 85) return 'A+';
    if (score >= 75) return 'A';
    if (score >= 65) return 'B';
    if (score >= 55) return 'C';
    return 'D';
  }

  getSubjectStatus(completionRate, timeSpent) {
    if (completionRate >= 80) return 'mastered';
    if (completionRate >= 50) return 'good';
    if (completionRate >= 20) return 'learning';
    if (timeSpent > 0) return 'started';
    return 'not_started';
  }

  calculateExamReadiness(avgScore, totalExams, trend) {
    let readiness = avgScore;
    
    if (totalExams < 3) readiness *= 0.7; // Manque d'expérience
    if (trend === 'improving') readiness *= 1.1;
    if (trend === 'declining') readiness *= 0.9;
    
    return Math.min(Math.round(readiness), 100);
  }

  calculateConsistency(streak) {
    // Retourner un pourcentage au lieu d'une chaîne
    if (streak >= 30) return 95; // excellent
    if (streak >= 14) return 80; // good
    if (streak >= 7) return 60;  // fair
    if (streak >= 3) return 40;  // needs improvement
    return 20; // very low
  }

  analyzeActivityByDay(pointsHistory) {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const activity = days.map(day => ({ day, points: 0, count: 0 }));

    pointsHistory?.forEach(entry => {
      const date = new Date(entry.created_at);
      const dayIndex = date.getDay();
      activity[dayIndex].points += entry.points_earned;
      activity[dayIndex].count += 1;
    });

    return activity;
  }

  calculateAvgStudyTime() {
    const { progress } = this.userData;
    const totalTime = progress?.reduce((sum, p) => sum + (p.time_spent || 0), 0) || 0;
    const sessions = progress?.length || 1;
    return Math.round(totalTime / sessions / 60); // minutes
  }

  getMostProductiveDay(activityByDay) {
    const sorted = [...activityByDay].sort((a, b) => b.points - a.points);
    return sorted[0]?.day || 'Lundi';
  }

  groupExamsByDifficulty(examResults) {
    const grouped = { facile: [], moyen: [], difficile: [] };
    
    examResults.forEach(exam => {
      const difficulty = exam.examens?.difficulty || 'moyen';
      if (grouped[difficulty]) {
        grouped[difficulty].push(exam.score);
      }
    });

    return {
      facile: grouped.facile.length > 0 ? Math.round(grouped.facile.reduce((a, b) => a + b, 0) / grouped.facile.length) : 0,
      moyen: grouped.moyen.length > 0 ? Math.round(grouped.moyen.reduce((a, b) => a + b, 0) / grouped.moyen.length) : 0,
      difficile: grouped.difficile.length > 0 ? Math.round(grouped.difficile.reduce((a, b) => a + b, 0) / grouped.difficile.length) : 0
    };
  }

  getSuccessMessage(percentage) {
    if (percentage >= 85) return '🌟 Excellentes chances de réussite ! Continuez comme ça !';
    if (percentage >= 70) return '✅ Bonnes chances de réussite ! Encore un petit effort !';
    if (percentage >= 50) return '⚠️ Chances moyennes - Intensifiez vos révisions';
    return '🚨 Risque élevé - Il faut vraiment réviser davantage';
  }

  /**
   * ============================================
   * GÉNÉRATION DE MESSAGES MOTIVANTS
   * ============================================
   */

  generateMotivationalMessage(analysis) {
    const messages = {
      morning: [
        `🌅 Bonjour ! Aujourd'hui est une nouvelle opportunité d'apprendre. Commençons par ${analysis.bySubject[0]?.name} !`,
        `☀️ Nouvelle journée, nouvelles connaissances ! Vous êtes au niveau ${analysis.overall.level} - impressionnant !`,
        `🎯 Objectif du jour : Compléter 1 chapitre. Vous en êtes capable !`
      ],
      afternoon: [
        `☀️ Belle progression ce matin ! Prenez une pause puis continuez avec ${analysis.bySubject[1]?.name}`,
        `💪 Vous avez ${analysis.overall.totalPoints} points ! Encore ${analysis.predictions.nextLevel.pointsNeeded} pour le prochain niveau !`,
        `📚 Temps de réviser ! Vos efforts d'aujourd'hui sont vos succès de demain`
      ],
      evening: [
        `🌙 Excellente journée de travail ! Votre streak est maintenant à ${analysis.studyHabits.currentStreak} jours !`,
        `⭐ Bravo pour votre assiduité ! Reposez-vous bien, vous l'avez mérité`,
        `🎉 ${analysis.overall.completedChapters} chapitres complétés ! Vous progressez incroyablement bien`
      ]
    };

    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
    const messageList = messages[timeOfDay];
    
    return messageList[Math.floor(Math.random() * messageList.length)];
  }
}

export default AICoachService;
