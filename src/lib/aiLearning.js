// AI-powered learning analytics and recommendation engine
import { dbHelpers } from './supabaseHelpers';

export class LearningAnalytics {
  constructor(userId) {
    this.userId = userId;
    this.patterns = {};
    this.recommendations = [];
  }

  // Analyze user performance and generate insights
  async analyzePerformance() {
    try {
      // Get user's quiz attempts
      const quizAttempts = await this.getUserQuizAttempts();
      const studySessions = await dbHelpers.getUserStudyStats(this.userId, 'month');
      const progress = await dbHelpers.getUserProgress(this.userId);

      // Analyze patterns
      const performanceAnalysis = this.analyzeQuizPerformance(quizAttempts);
      const timePatterns = this.analyzeStudyTimePatterns(studySessions);
      const subjectStrengths = this.analyzeSubjectStrengths(quizAttempts, progress);
      const learningVelocity = this.calculateLearningVelocity(progress);

      // Generate recommendations
      const recommendations = await this.generateRecommendations({
        performance: performanceAnalysis,
        timePatterns,
        subjectStrengths,
        learningVelocity
      });

      // Save analytics to database
      for (const subjectId in performanceAnalysis.bySubject) {
        await dbHelpers.updateLearningAnalytics(this.userId, subjectId, {
          weak_areas: performanceAnalysis.bySubject[subjectId].weakAreas,
          strong_areas: performanceAnalysis.bySubject[subjectId].strongAreas,
          learning_patterns: timePatterns,
          recommended_content: recommendations.filter(r => r.subjectId === subjectId),
          performance_trends: performanceAnalysis.bySubject[subjectId].trends
        });
      }

      return {
        performance: performanceAnalysis,
        timePatterns,
        subjectStrengths,
        recommendations,
        learningVelocity
      };
    } catch (error) {
      console.error('Error analyzing performance:', error);
      throw error;
    }
  }

  // Analyze quiz performance patterns
  analyzeQuizPerformance(quizAttempts) {
    const analysis = {
      overall: {
        averageScore: 0,
        totalAttempts: quizAttempts.length,
        improvement: 0,
        consistency: 0
      },
      bySubject: {},
      byDifficulty: {},
      commonMistakes: []
    };

    if (quizAttempts.length === 0) return analysis;

    // Calculate overall metrics
    const scores = quizAttempts.map(attempt => attempt.score);
    analysis.overall.averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    // Calculate improvement trend
    if (scores.length > 1) {
      const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
      const secondHalf = scores.slice(Math.floor(scores.length / 2));
      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      analysis.overall.improvement = secondAvg - firstAvg;
    }

    // Analyze by subject
    const bySubject = quizAttempts.reduce((acc, attempt) => {
      const subjectId = attempt.quiz?.course?.subject_id;
      if (!subjectId) return acc;

      if (!acc[subjectId]) {
        acc[subjectId] = {
          scores: [],
          weakAreas: [],
          strongAreas: [],
          trends: []
        };
      }
      acc[subjectId].scores.push(attempt.score);
      
      // Analyze answers for weak/strong areas
      if (attempt.answers) {
        this.analyzeAnswersForAreas(attempt.answers, acc[subjectId]);
      }

      return acc;
    }, {});

    analysis.bySubject = bySubject;
    return analysis;
  }

  // Analyze study time patterns
  analyzeStudyTimePatterns(studySessions) {
    const patterns = {
      preferredTimes: {},
      dailyDistribution: {},
      subjectPreferences: {},
      focusPatterns: {},
      sessionLengths: []
    };

    studySessions.forEach(session => {
      const hour = new Date(session.created_at).getHours();
      const day = new Date(session.created_at).getDay();
      
      // Track preferred study times
      patterns.preferredTimes[hour] = (patterns.preferredTimes[hour] || 0) + 1;
      patterns.dailyDistribution[day] = (patterns.dailyDistribution[day] || 0) + session.duration;
      
      // Track subject study time
      const subjectName = session.subjects?.name;
      if (subjectName) {
        patterns.subjectPreferences[subjectName] = (patterns.subjectPreferences[subjectName] || 0) + session.duration;
      }

      // Track focus scores
      if (session.focus_score) {
        patterns.focusPatterns[hour] = patterns.focusPatterns[hour] || [];
        patterns.focusPatterns[hour].push(session.focus_score);
      }

      patterns.sessionLengths.push(session.duration);
    });

    return patterns;
  }

  // Analyze subject strengths and weaknesses
  analyzeSubjectStrengths(quizAttempts, progress) {
    const subjects = {};

    // From quiz performance
    quizAttempts.forEach(attempt => {
      const subjectId = attempt.quiz?.course?.subject_id;
      if (!subjectId) return;

      if (!subjects[subjectId]) {
        subjects[subjectId] = {
          quizScores: [],
          progressPercentage: 0,
          timeSpent: 0,
          strength: 'neutral'
        };
      }

      subjects[subjectId].quizScores.push(attempt.score);
    });

    // From course progress
    progress.forEach(prog => {
      const subjectId = prog.courses?.subjects?.id;
      if (!subjectId || !subjects[subjectId]) return;

      subjects[subjectId].progressPercentage = prog.progress_percentage;
      subjects[subjectId].timeSpent = prog.time_spent;
    });

    // Determine strength levels
    Object.keys(subjects).forEach(subjectId => {
      const subject = subjects[subjectId];
      const avgScore = subject.quizScores.reduce((a, b) => a + b, 0) / subject.quizScores.length;
      
      if (avgScore >= 80 && subject.progressPercentage >= 70) {
        subject.strength = 'strong';
      } else if (avgScore < 60 || subject.progressPercentage < 40) {
        subject.strength = 'weak';
      }
    });

    return subjects;
  }

  // Calculate learning velocity
  calculateLearningVelocity(progress) {
    const velocity = {
      overall: 0,
      bySubject: {},
      trend: 'stable'
    };

    progress.forEach(prog => {
      const daysSinceStart = Math.floor((new Date() - new Date(prog.created_at)) / (1000 * 60 * 60 * 24));
      if (daysSinceStart > 0) {
        const velocityRate = prog.progress_percentage / daysSinceStart;
        velocity.overall += velocityRate;
        
        const subjectName = prog.courses?.subjects?.name;
        if (subjectName) {
          velocity.bySubject[subjectName] = velocityRate;
        }
      }
    });

    velocity.overall = velocity.overall / progress.length || 0;

    // Determine trend
    if (velocity.overall > 5) velocity.trend = 'fast';
    else if (velocity.overall < 2) velocity.trend = 'slow';

    return velocity;
  }

  // Generate AI-powered recommendations
  async generateRecommendations(analysis) {
    const recommendations = [];

    // Performance-based recommendations
    Object.keys(analysis.subjectStrengths).forEach(subjectId => {
      const subject = analysis.subjectStrengths[subjectId];
      
      if (subject.strength === 'weak') {
        recommendations.push({
          type: 'improvement',
          subjectId,
          priority: 'high',
          title: 'Renforcement nécessaire',
          description: 'Concentrez-vous sur les concepts fondamentaux',
          actionItems: [
            'Revoir les leçons de base',
            'Faire des exercices supplémentaires',
            'Regarder les vidéos explicatives'
          ],
          estimatedTime: 120 // minutes
        });
      }
    });

    // Time pattern recommendations - avec vérification pour éviter reduce() sur array vide
    const timeKeys = Object.keys(analysis.timePatterns.preferredTimes);
    const bestStudyHour = timeKeys.length > 0 
      ? timeKeys.reduce((a, b) => analysis.timePatterns.preferredTimes[a] > analysis.timePatterns.preferredTimes[b] ? a : b)
      : null;

    if (bestStudyHour) {
      recommendations.push({
        type: 'optimization',
        priority: 'medium',
        title: 'Optimisez votre horaire d\'étude',
        description: `Vous êtes plus productif vers ${bestStudyHour}h`,
        actionItems: [`Planifier les sessions importantes à ${bestStudyHour}h`],
        estimatedTime: 0
      });
    }

    // Learning velocity recommendations
    if (analysis.learningVelocity.trend === 'slow') {
      recommendations.push({
        type: 'motivation',
        priority: 'medium',
        title: 'Accélérez votre progression',
        description: 'Augmentez la fréquence de vos sessions d\'étude',
        actionItems: [
          'Étudier 30 minutes de plus par jour',
          'Fixer des objectifs quotidiens',
          'Utiliser la technique Pomodoro'
        ],
        estimatedTime: 30
      });
    }

    return recommendations;
  }

  // Helper methods
  async getUserQuizAttempts() {
    // This would typically fetch from Supabase
    // For now, return mock data structure
    return [];
  }

  analyzeAnswersForAreas(answers, subjectData) {
    // Analyze individual question performance to identify weak areas
    Object.keys(answers).forEach(questionId => {
      const answer = answers[questionId];
      if (answer.isCorrect === false) {
        subjectData.weakAreas.push(answer.topic || 'unknown');
      } else {
        subjectData.strongAreas.push(answer.topic || 'unknown');
      }
    });
  }
}

// Adaptive quiz generator
export class AdaptiveQuizGenerator {
  constructor(userId) {
    this.userId = userId;
    this.analytics = new LearningAnalytics(userId);
  }

  async generateAdaptiveQuiz(subjectId, targetDifficulty = 3) {
    try {
      const userAnalytics = await this.analytics.analyzePerformance();
      const subjectAnalysis = userAnalytics.performance.bySubject[subjectId];

      let adjustedDifficulty = targetDifficulty;

      // Adjust difficulty based on user performance
      if (subjectAnalysis) {
        const avgScore = subjectAnalysis.scores.reduce((a, b) => a + b, 0) / subjectAnalysis.scores.length;
        
        if (avgScore > 85) adjustedDifficulty = Math.min(5, targetDifficulty + 1);
        else if (avgScore < 60) adjustedDifficulty = Math.max(1, targetDifficulty - 1);
      }

      // Generate questions focusing on weak areas
      const questions = await this.selectAdaptiveQuestions(subjectId, adjustedDifficulty, subjectAnalysis?.weakAreas);

      return {
        questions,
        difficulty: adjustedDifficulty,
        adaptation_reason: this.getAdaptationReason(subjectAnalysis, adjustedDifficulty, targetDifficulty)
      };
    } catch (error) {
      console.error('Error generating adaptive quiz:', error);
      throw error;
    }
  }

  async selectAdaptiveQuestions(subjectId, difficulty, weakAreas = []) {
    // This would typically query Supabase for questions
    // focusing on weak areas and appropriate difficulty
    const questions = await dbHelpers.getQuizQuestions();
    
    // Filter and prioritize questions
    return questions
      .filter(q => q.difficulty_level === difficulty)
      .sort((a, b) => {
        // Prioritize questions covering weak areas
        const aInWeakArea = weakAreas.some(area => a.tags?.includes(area));
        const bInWeakArea = weakAreas.some(area => b.tags?.includes(area));
        
        if (aInWeakArea && !bInWeakArea) return -1;
        if (!aInWeakArea && bInWeakArea) return 1;
        return 0;
      })
      .slice(0, 10); // Limit to 10 questions
  }

  getAdaptationReason(subjectAnalysis, newDifficulty, originalDifficulty) {
    if (!subjectAnalysis) return 'Première évaluation dans cette matière';
    
    if (newDifficulty > originalDifficulty) {
      return 'Difficulté augmentée en raison de vos excellents résultats';
    } else if (newDifficulty < originalDifficulty) {
      return 'Difficulté ajustée pour consolider vos bases';
    }
    
    return 'Difficulté maintenue selon votre niveau actuel';
  }
}

// Performance tracker for real-time feedback
export class PerformanceTracker {
  constructor(userId) {
    this.userId = userId;
    this.currentSession = null;
  }

  startSession(subjectId, activityType = 'study') {
    this.currentSession = {
      subjectId,
      activityType,
      startTime: new Date(),
      activities: [],
      focusScore: 1.0,
      interactions: 0
    };
  }

  trackActivity(activity) {
    if (!this.currentSession) return;

    this.currentSession.activities.push({
      type: activity.type,
      timestamp: new Date(),
      data: activity.data
    });

    this.currentSession.interactions++;
    this.updateFocusScore(activity);
  }

  updateFocusScore(activity) {
    // Simple focus scoring algorithm
    const timeSinceLastActivity = this.currentSession.activities.length > 1 
      ? new Date() - new Date(this.currentSession.activities[this.currentSession.activities.length - 2].timestamp)
      : 0;

    // Decrease focus score if too much time between activities
    if (timeSinceLastActivity > 300000) { // 5 minutes
      this.currentSession.focusScore = Math.max(0.1, this.currentSession.focusScore - 0.1);
    }

    // Increase focus score for active engagement
    if (['question_answered', 'note_taken', 'video_watched'].includes(activity.type)) {
      this.currentSession.focusScore = Math.min(1.0, this.currentSession.focusScore + 0.05);
    }
  }

  async endSession() {
    if (!this.currentSession) return null;

    const duration = (new Date() - this.currentSession.startTime) / 1000; // seconds
    
    const sessionData = {
      duration,
      activities: this.currentSession.activities,
      focus_score: this.currentSession.focusScore,
      session_date: new Date().toISOString().split('T')[0]
    };

    const result = await dbHelpers.createStudySession(
      this.userId,
      this.currentSession.subjectId,
      sessionData
    );

    this.currentSession = null;
    return result;
  }

  getCurrentFocusScore() {
    return this.currentSession?.focusScore || 0;
  }
}