// AI-powered educational chatbot for E-Réussite
import { dbHelpers } from './supabaseHelpers';
import { LearningAnalytics } from './aiLearning';

export class EducationalChatbot {
  constructor(userId, apiKey = null) {
    this.userId = userId;
    this.apiKey = apiKey || import.meta.env.VITE_OPENAI_API_KEY;
    this.conversationHistory = [];
    this.userContext = null;
    this.analytics = new LearningAnalytics(userId);
  }

  async initializeContext() {
    try {
      // Get user profile and learning data
      this.userContext = {
        profile: await dbHelpers.getUserProfile(this.userId),
        progress: await dbHelpers.getUserProgress(this.userId),
        analytics: await this.analytics.analyzePerformance(),
        recentSessions: await dbHelpers.getUserStudyStats(this.userId, 'week')
      };
    } catch (error) {
      console.error('Error initializing chatbot context:', error);
    }
  }

  async sendMessage(message, context = {}) {
    try {
      // Save user message
      const conversation = await dbHelpers.saveConversation(this.userId, message, {
        ...context,
        timestamp: new Date().toISOString()
      });

      // Process message and generate response
      const response = await this.generateResponse(message, context);

      // Save AI response
      await dbHelpers.updateConversationAnswer(conversation.id, response);

      // Update conversation history
      this.conversationHistory.push(
        { role: 'user', content: message },
        { role: 'assistant', content: response }
      );

      return {
        response,
        conversationId: conversation.id,
        suggestions: this.generateSuggestions(message, context)
      };

    } catch (error) {
      console.error('Error processing message:', error);
      return {
        response: "Désolé, je rencontre une difficulté technique. Pouvez-vous reformuler votre question ?",
        error: true
      };
    }
  }

  async generateResponse(message, context) {
    // First, try to handle with rule-based responses for common questions
    const ruleBasedResponse = this.getRuleBasedResponse(message, context);
    if (ruleBasedResponse) {
      return ruleBasedResponse;
    }

    // If OpenAI API is available, use it for complex queries
    if (this.apiKey) {
      return await this.getOpenAIResponse(message, context);
    }

    // Fallback to smart template responses
    return this.getTemplateResponse(message, context);
  }

  getRuleBasedResponse(message, context) {
    const lowerMessage = message.toLowerCase();

    // Greeting responses
    if (lowerMessage.match(/^(bonjour|salut|hello|bonsoir)/)) {
      const userName = this.userContext?.profile?.full_name || '';
      const timeGreeting = new Date().getHours() < 18 ? 'Bonjour' : 'Bonsoir';
      return `${timeGreeting} ${userName} ! 👋 Comment puis-je vous aider dans vos révisions aujourd'hui ?`;
    }

    // Subject-specific help
    if (lowerMessage.includes('mathématiques') || lowerMessage.includes('maths')) {
      return this.getMathHelp(message, context);
    }

    if (lowerMessage.includes('français')) {
      return this.getFrenchHelp(message, context);
    }

    if (lowerMessage.includes('physique') || lowerMessage.includes('chimie')) {
      return this.getPhysicsHelp(message, context);
    }

    // Progress and motivation
    if (lowerMessage.match(/(progression|progrès|niveau)/)) {
      return this.getProgressResponse();
    }

    if (lowerMessage.match(/(motivation|découragement|difficile)/)) {
      return this.getMotivationResponse();
    }

    // Study tips
    if (lowerMessage.match(/(réviser|étudier|apprendre)/)) {
      return this.getStudyTipsResponse();
    }

    // Exam preparation
    if (lowerMessage.match(/(bfem|bac|examen)/)) {
      return this.getExamPrepResponse(lowerMessage);
    }

    return null; // No rule-based response found
  }

  async getOpenAIResponse(message, context) {
    try {
      const systemPrompt = this.buildSystemPrompt();
      const userPrompt = this.buildUserPrompt(message, context);

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            ...this.conversationHistory.slice(-6), // Keep last 3 exchanges
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      });

      const data = await response.json();
      return data.choices[0].message.content;

    } catch (error) {
      console.error('OpenAI API error:', error);
      return this.getTemplateResponse(message, context);
    }
  }

  buildSystemPrompt() {
    const userLevel = this.userContext?.profile?.class_level || 'general';
    const weakSubjects = this.userContext?.analytics?.subjectStrengths 
      ? Object.keys(this.userContext.analytics.subjectStrengths)
          .filter(id => this.userContext.analytics.subjectStrengths[id].strength === 'weak')
      : [];

    return `Tu es un assistant pédagogique expert pour la plateforme E-Réussite, spécialisé dans la préparation au BFEM et BAC au Sénégal.

CONTEXTE UTILISATEUR:
- Niveau: ${userLevel}
- Matières faibles: ${weakSubjects.join(', ') || 'Aucune identifiée'}
- Progression générale: ${this.userContext?.analytics?.overall?.averageScore || 'En cours d\'évaluation'}%

DIRECTIVES:
1. Réponds en français sénégalais, avec un ton encourageant et bienveillant
2. Adapte tes explications au niveau scolaire de l'utilisateur
3. Fournis des exemples concrets liés au programme sénégalais
4. Propose des actions pratiques et réalisables
5. Encourage la persévérance et la confiance en soi
6. Utilise des émojis pour rendre l'interaction plus agréable
7. Reste focalisé sur l'éducation et l'apprentissage

Si tu ne connais pas la réponse exacte, admets-le et propose des ressources alternatives.`;
  }

  buildUserPrompt(message, context) {
    let prompt = message;

    if (context.currentSubject) {
      prompt += `\n[Contexte: Étude de ${context.currentSubject}]`;
    }

    if (context.currentLesson) {
      prompt += `\n[Leçon actuelle: ${context.currentLesson}]`;
    }

    if (context.lastQuizScore) {
      prompt += `\n[Dernier quiz: ${context.lastQuizScore}%]`;
    }

    return prompt;
  }

  getTemplateResponse(message, context) {
    const templates = [
      "C'est une excellente question ! 🤔 Selon votre niveau et vos besoins, je vous recommande de...",
      "Je comprends votre préoccupation. 💪 Voici comment vous pouvez aborder ce défi...",
      "Excellente initiative ! 🎯 Pour vous aider efficacement, voici ma suggestion...",
      "C'est un point important dans vos révisions. 📚 Laissez-moi vous expliquer..."
    ];

    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
    
    return `${randomTemplate}

Cependant, je suis encore en phase d'apprentissage pour mieux comprendre vos besoins spécifiques. En attendant:

🔍 **Consultez** vos cours et fiches de révision
📝 **Pratiquez** avec les quiz adaptatifs  
📹 **Regardez** les vidéos explicatives
💬 **Posez** des questions précises pour une aide ciblée

Mon intelligence s'améliore chaque jour pour vous offrir un accompagnement personnalisé ! 🚀`;
  }

  // Subject-specific helpers
  getMathHelp(message, context) {
    if (message.toLowerCase().includes('théorème')) {
      return `🔢 **Aide en Mathématiques - Théorèmes**

Pour bien comprendre les théorèmes:
1. **Lisez** l'énoncé plusieurs fois
2. **Identifiez** les hypothèses et la conclusion
3. **Dessinez** un schéma si possible
4. **Appliquez** sur des exercices simples

💡 **Conseil**: Commencez par le théorème de Thalès et Pythagore, ils sont fondamentaux pour le BFEM !

Voulez-vous que je vous propose des exercices d'application ?`;
    }

    return `🔢 **Aide en Mathématiques**

Je vois que vous travaillez sur les maths ! Voici mes conseils:

✅ **Méthodologie**:
- Relisez la leçon avant de faire les exercices
- Apprenez les formules par cœur
- Entraînez-vous régulièrement

📊 **Pour le BFEM**: Focalisez-vous sur l'algèbre et la géométrie
📐 **Pour le BAC**: Maîtrisez l'analyse et les probabilités

Quelle notion précise vous pose problème ?`;
  }

  getFrenchHelp(message, context) {
    return `📝 **Aide en Français**

Le français nécessite une approche méthodique:

📖 **Lecture**: Lisez régulièrement pour enrichir votre vocabulaire
✍️ **Expression**: Entraînez-vous à la rédaction et à l'argumentation
📚 **Littérature**: Analysez les œuvres au programme

🎯 **Techniques efficaces**:
- Faites des fiches sur les figures de style
- Pratiquez la dissertation et le commentaire
- Mémorisez des citations d'auteurs sénégalais

Travaillez-vous sur une œuvre particulière en ce moment ?`;
  }

  getPhysicsHelp(message, context) {
    return `⚛️ **Aide en Physique-Chimie**

Les sciences physiques demandent logique et pratique:

🔬 **Méthode**:
1. Comprenez les concepts avant les formules
2. Schématisez les expériences
3. Appliquez les lois physiques

⚡ **Sujets clés**:
- Électricité et circuits
- Mécanique et forces
- Réactions chimiques

💡 **Astuce**: Reliez toujours la théorie aux phénomènes du quotidien !

Sur quel chapitre travaillez-vous actuellement ?`;
  }

  getProgressResponse() {
    const avgScore = this.userContext?.analytics?.overall?.averageScore || 0;
    
    if (avgScore >= 75) {
      return `🎉 **Excellente progression !**

Votre moyenne de ${avgScore}% montre un très bon niveau ! Continuez sur cette lancée:

✅ Approfondissez vos matières fortes
🎯 Perfectionnez vos matières faibles
🏆 Visez l'excellence pour les examens

Vous êtes sur la bonne voie pour réussir brillamment ! 💪`;
    } else if (avgScore >= 50) {
      return `📈 **Progression encourageante !**

Avec ${avgScore}%, vous progressez bien ! Quelques ajustements:

🔄 Révisez régulièrement
📚 Concentrez-vous sur vos difficultés
⏰ Organisez mieux votre temps d'étude

Chaque effort vous rapproche du succès ! 🚀`;
    } else {
      return `💪 **Il est temps de redoubler d'efforts !**

Ne vous découragez pas, chaque expert a été un débutant:

🎯 Fixez-vous des objectifs réalisables
📖 Reprenez les bases étape par étape
👥 N'hésitez pas à demander de l'aide
⏰ Étudiez un peu chaque jour

Votre réussite n'est qu'une question de persévérance ! 🌟`;
    }
  }

  getMotivationResponse() {
    const motivationalQuotes = [
      "« L'éducation est l'arme la plus puissante pour changer le monde » - Nelson Mandela",
      "« Celui qui déplace une montagne commence par déplacer de petites pierres » - Confucius",
      "« Le succès, c'est tomber sept fois et se relever huit » - Proverbe japonais"
    ];

    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

    return `🌟 **Message de motivation**

${randomQuote}

💪 **Rappelez-vous**:
- Chaque difficulté est une opportunité d'apprentissage
- Vos efforts d'aujourd'hui sont votre réussite de demain
- Vous avez tout en vous pour réussir !

🎯 **Actions concrètes**:
- Fixez-vous un petit objectif quotidien
- Célébrez chaque petite victoire
- Visualisez votre réussite aux examens

Vous n'êtes pas seul(e) dans cette aventure ! 🚀`;
  }

  getStudyTipsResponse() {
    return `📚 **Conseils d'étude efficaces**

🕒 **Planification**:
- Créez un planning de révision
- Alternez les matières
- Prévoyez des pauses régulières

🧠 **Techniques d'apprentissage**:
- Méthode Pomodoro (25min étude + 5min pause)
- Fiches de révision colorées
- Répétition espacée

📍 **Environnement**:
- Lieu calme et bien éclairé
- Téléphone en mode silencieux
- Tous les outils à portée de main

🎯 **Révision active**:
- Expliquez à haute voix
- Créez des schémas et cartes mentales
- Testez-vous régulièrement

Quelle technique aimeriez-vous essayer en premier ?`;
  }

  getExamPrepResponse(message) {
    const isBFEM = message.includes('bfem');
    const examType = isBFEM ? 'BFEM' : 'BAC';
    
    return `🎯 **Préparation ${examType}**

📅 **Planning de révision**:
- Commencez 3 mois avant l'examen
- Révisez toutes les matières chaque semaine
- Intensifiez le mois précédent

📝 **Stratégies d'examen**:
- Lisez tous les sujets avant de choisir
- Gérez votre temps par question
- Relisez vos réponses

💪 **État d'esprit**:
- Confiance en vos capacités
- Gestion du stress
- Sommeil suffisant

🎁 **Ressources E-Réussite**:
- Annales corrigées des années précédentes
- Quiz d'entraînement adaptatifs
- Conseils méthodologiques

Vous voulez un planning personnalisé pour votre préparation ?`;
  }

  generateSuggestions(message, context) {
    const suggestions = [
      "Comment réviser efficacement ?",
      "Aide-moi en mathématiques",
      "Conseils pour le BFEM",
      "Comment gérer le stress ?",
      "Techniques de mémorisation"
    ];

    // Add context-specific suggestions
    if (context.currentSubject) {
      suggestions.unshift(`Exercices de ${context.currentSubject}`);
      suggestions.unshift(`Méthodes pour ${context.currentSubject}`);
    }

    return suggestions.slice(0, 4);
  }

  // Utility methods
  async getRatingFeedback(conversationId, rating, feedback = '') {
    try {
      await supabase
        .from('ai_conversations')
        .update({ 
          satisfaction_rating: rating,
          is_helpful: rating >= 4
        })
        .eq('id', conversationId);

      if (feedback) {
        // Store detailed feedback for improvement
        console.log('User feedback:', feedback);
      }

      return true;
    } catch (error) {
      console.error('Error saving feedback:', error);
      return false;
    }
  }

  clearConversationHistory() {
    this.conversationHistory = [];
  }
}