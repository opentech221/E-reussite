export class SimpleEducationalChatbot {
  constructor(userId = null) {
    this.userId = userId;
    this.conversationHistory = [];
    this.userContext = {
      profile: { name: "Étudiant", level: "débutant" },
      progress: { completedCourses: 0, totalPoints: 0 },
      analytics: { strongSubjects: [], weakSubjects: [] },
      recentSessions: []
    };
    this.isInitialized = false;
  }

  async initialize() {
    try {
      // Simple initialization without complex analytics
      this.userContext = {
        profile: { name: "Étudiant", level: "débutant" },
        progress: { completedCourses: 0, totalPoints: 0 },
        analytics: { strongSubjects: [], weakSubjects: [] },
        recentSessions: []
      };
      this.isInitialized = true;
    } catch (error) {
      console.warn('Chatbot initialization with minimal data:', error.message);
      this.isInitialized = true; // Continue with defaults
    }
  }

  async processMessage(message) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const context = {
        userProfile: this.userContext.profile,
        conversationHistory: this.conversationHistory.slice(-5)
      };

      const response = await this.generateResponse(message, context);
      
      // Store conversation
      this.conversationHistory.push({
        user: message,
        bot: response.response,
        timestamp: new Date()
      });

      return response;
    } catch (error) {
      console.error('Error processing message:', error);
      return {
        response: "Désolé, je rencontre une difficulté technique. Pouvez-vous reformuler votre question ?",
        error: true
      };
    }
  }

  async generateResponse(message, context) {
    // Rule-based responses for common educational questions
    const ruleBasedResponse = this.getRuleBasedResponse(message, context);
    if (ruleBasedResponse) {
      return { response: ruleBasedResponse, suggestions: this.getContextualSuggestions(message) };
    }

    // Default helpful response
    return {
      response: this.getDefaultResponse(message),
      suggestions: [
        "Parlez-moi de vos objectifs d'apprentissage",
        "Quels sont vos défis en étude ?",
        "Comment puis-je vous aider aujourd'hui ?"
      ]
    };
  }

  getRuleBasedResponse(message, context) {
    const lowerMessage = message.toLowerCase();
    
    // Greetings
    if (lowerMessage.match(/^(bonjour|salut|hello|bonsoir|coucou)/)) {
      return `Bonjour ${context.userProfile?.name || 'cher étudiant'} ! Comment puis-je vous aider dans votre apprentissage aujourd'hui ?`;
    }

    // Course recommendations
    if (lowerMessage.includes('cours') && (lowerMessage.includes('recommand') || lowerMessage.includes('conseil'))) {
      return "Je vous recommande de commencer par les cours de base si vous débutez, ou de consulter notre section de cours avancés selon votre niveau. Quel domaine vous intéresse le plus ?";
    }

    // Study tips
    if (lowerMessage.includes('étudier') || lowerMessage.includes('réviser')) {
      return "Voici quelques conseils d'étude efficaces : \n• Planifiez des sessions d'étude régulières\n• Utilisez la technique Pomodoro (25 min d'étude, 5 min de pause)\n• Prenez des notes actives\n• Testez vos connaissances régulièrement";
    }

    // Motivation
    if (lowerMessage.includes('motiv') || lowerMessage.includes('décourag')) {
      return "L'apprentissage est un voyage, pas une destination ! Chaque petite étape compte. Fixez-vous des objectifs réalisables et célébrez vos progrès. Vous avez déjà fait le premier pas en étant ici !";
    }

    // Help with difficulties
    if (lowerMessage.includes('difficile') || lowerMessage.includes('problème') || lowerMessage.includes('aide')) {
      return "Je comprends que certains concepts puissent être difficiles. N'hésitez pas à revoir les leçons, utiliser nos exercices pratiques, ou demander de l'aide à la communauté. Quel sujet vous pose des difficultés ?";
    }

    // Progress tracking
    if (lowerMessage.includes('progrès') || lowerMessage.includes('niveau')) {
      return "Suivre ses progrès est essentiel ! Consultez votre tableau de bord pour voir vos accomplissements. Chaque quiz terminé et chaque cours complété vous rapproche de vos objectifs.";
    }

    return null;
  }

  getDefaultResponse(message) {
    const responses = [
      "C'est une excellente question ! Pouvez-vous me donner plus de détails pour que je puisse mieux vous aider ?",
      "Je suis là pour vous accompagner dans votre apprentissage. Pouvez-vous me préciser ce que vous cherchez ?",
      "Intéressant ! Comment puis-je vous guider dans cette direction ?",
      "Je vais faire de mon mieux pour vous aider. Pouvez-vous être plus spécifique sur ce dont vous avez besoin ?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  getContextualSuggestions(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('cours')) {
      return [
        "Voir les cours disponibles",
        "Recommandations personnalisées", 
        "Cours populaires"
      ];
    }
    
    if (lowerMessage.includes('quiz') || lowerMessage.includes('test')) {
      return [
        "Commencer un quiz",
        "Voir mes résultats",
        "Quiz de révision"
      ];
    }
    
    return [
      "Mes cours",
      "Tableau de bord", 
      "Aide et support"
    ];
  }

  // Utility methods for component integration
  async getSuggestedTopics() {
    return [
      { topic: "Mathématiques de base", confidence: 0.8 },
      { topic: "Sciences naturelles", confidence: 0.7 },
      { topic: "Français", confidence: 0.9 }
    ];
  }

  async getPersonalizedTips() {
    return [
      "Pratiquez 15 minutes par jour pour de meilleurs résultats",
      "Variez vos méthodes d'apprentissage",
      "N'hésitez pas à poser des questions"
    ];
  }

  getConversationHistory() {
    return this.conversationHistory;
  }

  clearHistory() {
    this.conversationHistory = [];
  }
}

export default SimpleEducationalChatbot;