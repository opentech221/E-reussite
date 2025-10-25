import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';

/**
 * Service IA Contextuel avec multi-provider (Claude, Perplexity, Gemini)
 * Disponible partout dans l'application pour assistance en temps réel
 */
class ContextualAIService {
  constructor(apiKey) {
    // Initialiser Claude AI (prioritaire pour conseils pédagogiques)
    const claudeKey = import.meta.env.VITE_CLAUDE_API_KEY;
    if (claudeKey) {
      try {
        this.claude = new Anthropic({
          apiKey: claudeKey,
          dangerouslyAllowBrowser: true
        });
        console.log('✅ [Contextual AI] Claude AI initialisé (provider principal)');
      } catch (error) {
        console.error('❌ [Contextual AI] Erreur initialisation Claude:', error);
        this.claude = null;
      }
    } else {
      console.warn('⚠️ [Contextual AI] Clé API Claude manquante');
      this.claude = null;
    }

    // Initialiser Perplexity (optionnel pour recherche avec citations)
    const perplexityKey = import.meta.env.VITE_PERPLEXITY_API_KEY;
    if (perplexityKey) {
      this.perplexityKey = perplexityKey;
      this.perplexityBaseURL = '/api/perplexity-search'; // Edge Function
      console.log('✅ [Contextual AI] Perplexity initialisé (provider optionnel)');
    } else {
      console.warn('⚠️ [Contextual AI] Clé API Perplexity manquante');
      this.perplexityKey = null;
    }

    // Initialiser Gemini (fallback)
    if (!apiKey) {
      console.warn('⚠️ [Contextual AI] Clé API Gemini manquante');
      this.genAI = null;
    } else {
      try {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ 
          model: 'gemini-2.0-flash-exp',
          generationConfig: {
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        });
        console.log('✅ [Contextual AI] Gemini initialisé (provider fallback)');
      } catch (error) {
        console.error('❌ [Contextual AI] Erreur initialisation Gemini:', error);
        this.genAI = null;
      }
    }

    this.chatSessions = new Map();
    this.conversationHistory = new Map();
    
    // ✅ Cache des conseils pour économiser le quota
    this.adviceCache = new Map();
    this.CACHE_DURATION = 60 * 60 * 1000; // 1 heure
  }

  /**
   * Vérifie si le service est disponible
   */
  isAvailable() {
    return this.claude !== null || this.perplexityKey !== null || this.genAI !== null;
  }

  /**
   * Retourne le provider disponible en priorité
   * @param {string} preferredProvider - Provider préféré ('claude', 'perplexity', 'gemini')
   */
  getAvailableProvider(preferredProvider = null) {
    // Si un provider préféré est spécifié et disponible
    if (preferredProvider === 'perplexity' && this.perplexityKey) return 'perplexity';
    if (preferredProvider === 'claude' && this.claude) return 'claude';
    if (preferredProvider === 'gemini' && this.genAI) return 'gemini';
    
    // Sinon, priorité par défaut
    if (this.claude) return 'claude';
    if (this.perplexityKey) return 'perplexity';
    if (this.genAI) return 'gemini';
    return null;
  }

  /**
   * Obtient ou crée une session de chat pour un contexte donné
   */
  async getChatSession(contextId = 'default') {
    if (!this.isAvailable()) {
      throw new Error('Service IA non disponible');
    }

    if (!this.chatSessions.has(contextId)) {
      const chat = this.model.startChat({
        generationConfig: {
          temperature: 0.9,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
        history: this.conversationHistory.get(contextId) || [],
      });
      this.chatSessions.set(contextId, chat);
    }

    return this.chatSessions.get(contextId);
  }

  /**
   * Envoie un message avec contexte complet
   */
  async sendMessage(message, context = {}) {
    if (!this.isAvailable()) {
      return {
        success: false,
        error: 'Service IA non disponible',
        fallbackResponse: 'Le service d\'assistance IA n\'est pas disponible pour le moment.'
      };
    }

    try {
      const {
        page = 'unknown',
        section = 'general',
        userContext = {},
        additionalContext = '',
        conversationId = 'default'
      } = context;

      // Construire le prompt contextuel
      const contextualPrompt = this.buildContextualPrompt(
        message,
        page,
        section,
        userContext,
        additionalContext
      );

      console.log('🤖 [Contextual AI] Message:', { page, section, message: message.substring(0, 50) });

      // Obtenir la session de chat
      const chat = await this.getChatSession(conversationId);

      // Envoyer le message
      const result = await chat.sendMessage(contextualPrompt);
      const response = await result.response;
      const text = response.text();

      // Sauvegarder dans l'historique
      this.saveToHistory(conversationId, message, text);

      console.log('✅ [Contextual AI] Réponse reçue:', text.substring(0, 100));

      return {
        success: true,
        response: text,
        context: { page, section }
      };
    } catch (error) {
      console.error('❌ [Contextual AI] Erreur:', error);
      return {
        success: false,
        error: error.message,
        fallbackResponse: 'Désolé, je rencontre une difficulté. Pourriez-vous reformuler votre question ?'
      };
    }
  }

  /**
   * Construit un prompt enrichi avec le contexte
   */
  buildContextualPrompt(message, page, section, userContext, additionalContext) {
    // Construction du contexte utilisateur enrichi
    const userStatsContext = this.buildUserStatsContext(userContext);
    const platformFeaturesContext = this.buildPlatformFeaturesContext(page);
    
    const systemContext = `Tu es un assistant IA intelligent intégré dans la plateforme éducative E-Réussite.

📍 CONTEXTE ACTUEL:
- Page: ${page}
- Section: ${section}
${userStatsContext}
${additionalContext ? `\n📝 CONTEXTE ADDITIONNEL:\n${additionalContext}` : ''}

🎯 TON RÔLE:
Tu es un assistant CONTEXTUEL et BASÉ SUR LES DONNÉES RÉELLES de la plateforme E-Réussite.

⚠️ RÈGLES STRICTES POUR TES RÉPONSES:

1. **TOUJOURS utiliser les données réelles de l'utilisateur** (statistiques, progression, badges, etc.)
2. **TOUJOURS suggérer des fonctionnalités EXISTANTES** de la plateforme
3. **SI l'utilisateur demande "liste les modules" ou "fonctionnalités disponibles"**, tu DOIS utiliser la liste complète fournie dans ${platformFeaturesContext}
4. **SI une fonctionnalité n'existe PAS**, le dire clairement avec cette phrase EXACTE:
   "📢 Cette fonctionnalité n'existe pas encore sur E-Réussite, mais c'est une excellente suggestion ! Nous prenons note pour améliorer la plateforme. 💡"

5. **NE JAMAIS inventer** des fonctionnalités inexistantes
6. **NE JAMAIS donner des conseils génériques** sans référence à la plateforme
7. **QUAND l'utilisateur demande la liste des modules**: Utilise OBLIGATOIREMENT le contexte ${platformFeaturesContext} fourni ci-dessous, n'invente RIEN

${platformFeaturesContext}

📚 EXEMPLES DE BONNES RÉPONSES:

❌ MAUVAIS (générique):
"Regarde ton Dashboard pour voir tes statistiques"

✅ BON (avec données réelles):
"D'après ton Dashboard, tu as ${userContext.totalPoints || 0} points et un streak de ${userContext.currentStreak || 0} jours. Je vois que ton taux de complétion est de ${userContext.completionRate || 0}%. Concentre-toi sur les ${userContext.weakSubjects?.join(', ') || 'matières où tu as le moins de points'}."

❌ MAUVAIS (fonctionnalité inexistante):
"Utilise la fonctionnalité de révision automatique"

✅ BON (honnête):
"📢 Cette fonctionnalité n'existe pas encore sur E-Réussite, mais c'est une excellente suggestion ! Nous prenons note pour améliorer la plateforme. 💡"

📚 CAPACITÉS ET MODULES DISPONIBLES:

**📊 Tableau de bord (Dashboard):**
- Statistiques en temps réel, graphiques de progression, actions prioritaires, badges

**📚 Contenu pédagogique:**
- Cours (Maths, Français, SVT, Physique, Anglais, Histoire-Géo)
- Quiz par chapitre, Examens blancs BFEM/BAC

**🏆 Gamification:**
- Système de points et niveaux, 14 badges, série quotidienne, défis, leaderboard

**📈 Suivi et statistiques:**
- Page Progression, Analytiques avancées (/analytics), Historique activités (/historique)

**🎓 Orientation Professionnelle (/orientation):**
- Test d'orientation (17 questions)
- 30 métiers détaillés avec scores de compatibilité
- Résultats intégrés dans le profil
- Bouton "Découvrir ce métier" avec modal détaillée

**📅 Plan d'Étude (/study-plan):**
- Planification personnalisée avec tâches et échéances
- Suivi des objectifs quotidiens/hebdomadaires
- Notifications pour tâches

**👤 Profil (/profile):**
- Stats complètes, badges, orientation professionnelle, abonnement
- Section contexte socio-économique

**🌐 Social & Partage:**
- Réseau social (/social): amis, suiveurs, publications
- Mes liens partagés (/my-shared-links): stats clics avec Dub.co

**💬 Coach IA (moi!):**
- 3 onglets: Conversations, Analyses & Conseils, Recherche Perplexity
- Multi-provider: Gemini, Claude, Perplexity
- Analyse d'images, contexte complet en temps réel

**⚙️ Autres:**
- Paramètres (/settings): notifications, dark mode
- Boutique (/shop) et Panier (/cart)
- FAQ (/faq) et Support (/help)
- Abonnement (/payment): 7 jours gratuit + 1000 FCFA à vie (Mobile Money)

⚠️ **IMPORTANT:** Quand l'utilisateur demande "liste les modules", tu DOIS mentionner TOUTES ces fonctionnalités, pas seulement les anciennes !

🗣️ TON STYLE:
- Amical et encourageant
- Précis et éducatif
- Adapté au niveau de l'étudiant
- Emojis appropriés (mais modérés)
- Réponses structurées et claires

⚠️ RÈGLES:
- Réponds TOUJOURS en français
- Sois concis (max 250 mots par défaut)
- Si question complexe, propose d'approfondir
- Si hors contexte, redirige poliment
- Reste dans le cadre éducatif

👤 QUESTION DE L'ÉTUDIANT:
${message}

💬 TA RÉPONSE (contextuelle et personnalisée):`;

    return systemContext;
  }

  /**
   * Construit le contexte des statistiques utilisateur
   * 🔥 MISE À JOUR: Utilise les données complètes depuis realtimeDataService
   */
  buildUserStatsContext(userContext) {
    if (!userContext || Object.keys(userContext).length === 0) {
      return '- Aucune donnée utilisateur disponible';
    }

    // 🔥 NOUVEAU: Si contextSummary existe, l'utiliser directement
    if (userContext.contextSummary) {
      return `\n👤 DONNÉES RÉELLES DE L'UTILISATEUR (EN TEMPS RÉEL):\n\n${userContext.contextSummary}`;
    }

    // Sinon, utiliser l'ancien format (pour compatibilité)
    let context = '\n👤 DONNÉES RÉELLES DE L\'UTILISATEUR:\n';
    
    if (userContext.userName) context += `- Nom: ${userContext.userName}\n`;
    if (userContext.level) context += `- Niveau: ${userContext.level}\n`;
    if (userContext.totalPoints !== undefined) context += `- Points totaux: ${userContext.totalPoints}\n`;
    if (userContext.currentStreak !== undefined) context += `- Streak actuel: ${userContext.currentStreak} jours\n`;
    if (userContext.maxStreak !== undefined) context += `- Meilleur streak: ${userContext.maxStreak} jours\n`;
    if (userContext.completionRate !== undefined) context += `- Taux de complétion: ${userContext.completionRate}%\n`;
    if (userContext.totalBadges !== undefined) context += `- Badges débloqués: ${userContext.totalBadges}\n`;
    if (userContext.rank !== undefined) context += `- Classement: ${userContext.rank}\n`;
    
    // ✅ Matières avec NOMS RÉELS (pas des IDs)
    if (userContext.matieres && userContext.matieres.length > 0) {
      context += `- Matières étudiées: ${userContext.matieres.join(', ')}\n`;
    }
    if (userContext.weakSubjects && userContext.weakSubjects.length > 0) {
      context += `- Matières à améliorer: ${userContext.weakSubjects.join(', ')}\n`;
    }
    if (userContext.strongSubjects && userContext.strongSubjects.length > 0) {
      context += `- Points forts: ${userContext.strongSubjects.join(', ')}\n`;
    }
    
    // ✅ Badges avec NOMS RÉELS et descriptions
    if (userContext.badgesDetails && userContext.badgesDetails.length > 0) {
      context += `\n🏆 BADGES DÉBLOQUÉS (avec détails):\n`;
      userContext.badgesDetails.slice(0, 5).forEach(badge => {
        const badgeName = badge.badge_name || badge.name;
        const badgeDesc = badge.badge_description || badge.description || 'Badge de réussite';
        context += `  - ${badgeName}: ${badgeDesc}\n`;
      });
      if (userContext.badgesDetails.length > 5) {
        context += `  ... et ${userContext.badgesDetails.length - 5} autres badges\n`;
      }
    } else if (userContext.recentBadges && userContext.recentBadges.length > 0) {
      context += `- Badges récents: ${userContext.recentBadges.join(', ')}\n`;
    }
    
    // ✅ Chapitres complétés avec TITRES RÉELS
    if (userContext.completedChaptersDetails && userContext.completedChaptersDetails.length > 0) {
      context += `\n📚 CHAPITRES COMPLÉTÉS (avec titres):\n`;
      const chaptersToShow = userContext.completedChaptersDetails.slice(0, 8);
      chaptersToShow.forEach(chapter => {
        context += `  - ${chapter.title} (${chapter.matiere}) - ${chapter.progress}% complété\n`;
      });
      if (userContext.completedChaptersDetails.length > 8) {
        context += `  ... et ${userContext.completedChaptersDetails.length - 8} autres chapitres\n`;
      }
    } else if (userContext.completedChapters !== undefined) {
      context += `- Chapitres complétés: ${userContext.completedChapters}\n`;
    }
    
    // ✅ NOUVEAU: Orientation professionnelle
    if (userContext.completeData?.orientation?.hasCompletedTest) {
      const orientation = userContext.completeData.orientation;
      context += `\n🎓 ORIENTATION PROFESSIONNELLE:\n`;
      context += `- Test complété: Oui (${new Date(orientation.testDate).toLocaleDateString('fr-FR')})\n`;
      if (orientation.topCareer) {
        context += `- Métier principal: ${orientation.topCareer.title} (${orientation.topCareer.compatibility_score}% de compatibilité)\n`;
      }
      if (orientation.topCareers.length > 1) {
        const otherCareers = orientation.topCareers.slice(1, 3).map(c => c.title).join(', ');
        context += `- Autres métiers compatibles: ${otherCareers}\n`;
      }
    }
    
    // ✅ NOUVEAU: Plan d'étude
    if (userContext.completeData?.studyPlan?.hasActivePlan) {
      const studyPlan = userContext.completeData.studyPlan;
      context += `\n📅 PLAN D'ÉTUDE:\n`;
      context += `- Tâches totales: ${studyPlan.totalTasks}\n`;
      context += `- Tâches complétées: ${studyPlan.completedTasks}\n`;
      context += `- Tâches pour aujourd'hui: ${studyPlan.todayTasks}\n`;
      if (studyPlan.overdueTasks > 0) {
        context += `- ⚠️ Tâches en retard: ${studyPlan.overdueTasks}\n`;
      }
    }
    
    // ✅ NOUVEAU: Abonnement
    if (userContext.completeData?.subscription) {
      const sub = userContext.completeData.subscription;
      context += `\n💳 ABONNEMENT:\n`;
      context += `- Statut: ${sub.status === 'active' ? 'Actif' : sub.status === 'trial' ? 'Essai gratuit' : 'Aucun'}\n`;
      if (sub.isActive || sub.isTrial) {
        context += `- Jours restants: ${sub.daysRemaining}\n`;
      }
    }

    return context;
  }

  /**
   * 🔥 Construit le contexte des fonctionnalités disponibles sur la plateforme
   * MISE À JOUR COMPLÈTE: Inclut TOUTES les fonctionnalités avec accès aux données réelles
   */
  buildPlatformFeaturesContext(page) {
    const allFeatures = {
      // 📊 Dashboard - Tableau de bord principal
      dashboard: [
        'Statistiques en temps réel (points, streak, badges, niveau)',
        'Graphiques de progression (7 derniers jours)',
        'Section "Prochaines actions prioritaires"',
        'Badges récents et à débloquer',
        'Accès rapide aux matières (Mathématiques, Physique, Français, SVT, Anglais, etc.)',
        'Liens vers Quiz, Examens, Challenges, Plan d\'étude',
        'Taux de complétion global des chapitres'
      ],
      
      // 📚 Cours et chapitres
      courses: [
        'Chapitres par matière (Mathématiques, Physique, Français, SVT, Anglais, Histoire-Géo, etc.)',
        'Contenu de cours détaillé avec vidéos et exercices',
        'Quiz de validation après chaque chapitre',
        'Progression par chapitre (pourcentage)',
        'Difficulté et durée estimée pour chaque chapitre',
        'Badges à débloquer en complétant',
        'Temps passé sur chaque chapitre (statistiques)',
        'Navigation par matière et niveau (BFEM/BAC)'
      ],
      
      // ❓ Quiz et révisions
      quiz: [
        'Quiz par chapitre et matière',
        'Questions à choix multiples avec correction',
        'Résultats instantanés avec score',
        'Correction détaillée avec explications',
        'Points gagnés/perdus selon performance',
        'Historique des tentatives avec possibilité de recommencer',
        'Page de révision (/quiz-review) pour revoir les erreurs'
      ],
      
      // 📝 Examens blancs
      exams: [
        'Examens blancs BFEM et BAC disponibles',
        'Simulation conditions réelles d\'examen',
        'Correction complète avec justifications',
        'Statistiques de réussite par matière',
        'Classement des résultats',
        'Page résultats (/exam-results) avec historique complet'
      ],
      
      // 📈 Progression et statistiques
      progression: [
        'Graphiques d\'évolution sur 30 jours',
        'Statistiques détaillées par matière',
        'Tableau de bord analytique avec forces/faiblesses',
        'Historique complet d\'activités',
        'Identification automatique des matières à renforcer',
        'Temps total d\'étude par matière'
      ],
      
      // 🏆 Badges et récompenses
      badges: [
        'Collection de 14 badges disponibles : Premier Pas, Apprenant Assidu, Maître des Quiz, Champion, Série 7/30/100 jours, Premier A, Perfectionniste, Expert, etc.',
        'Critères de déblocage clairs pour chaque badge',
        'Progression vers chaque badge (visible)',
        'Badges rares et exclusifs',
        'Points bonus pour badges débloqués',
        'Affichage dans le profil et sur le leaderboard'
      ],
      
      // 🎯 Défis et challenges
      challenges: [
        'Défis quotidiens/hebdomadaires',
        'Challenges par matière',
        'Récompenses en points',
        'Classement des challengers',
        'Badges spéciaux pour défis complétés'
      ],
      
      // 🥇 Classement (Leaderboard)
      leaderboard: [
        'Classement général (Top 100)',
        'Classement par niveau scolaire',
        'Classement par matière',
        'Classement hebdomadaire',
        'Votre position actuelle en temps réel',
        'Points des concurrents',
        'Badges visibles des top performers'
      ],
      
      // 👤 Profil utilisateur
      profile: [
        'Statistiques personnelles complètes (points, niveau, streak, badges)',
        'Section Orientation Professionnelle (résultats du test avec top 3 métiers)',
        'Bouton "Découvrir ce métier" pour voir détails dans une modale',
        'Graphique de progression sur 30 jours',
        'Badges obtenus avec collection complète',
        'Section Abonnement avec statut (actif/trial/expiré)',
        'Bouton "Gérer mon abonnement" pour accéder au paiement',
        'Contexte socio-économique (situation financière, réseau de soutien, valeurs religieuses, niveau académique)',
        'Bouton "Modifier le profil" pour éditer les informations',
        'Timeline d\'activités récentes'
      ],
      
      // 📜 Historique d'activités
      historique: [
        'Vue complète de TOUTES les activités (chapitres, quiz, examens, badges)',
        'Statistiques par type d\'activité (Total, Chapitres, Quiz, Examens)',
        'Barre de recherche pour filtrer les activités',
        'Filtres par type : Tout, Chapitres, Quiz, Examens, Badges',
        'Cartes détaillées avec score, temps passé, date',
        'Bouton "Conseils IA" sur chaque activité pour analyse personnalisée',
        'Modal avec points forts, points faibles et suggestions',
        'Bouton "Recommencer" pour refaire n\'importe quelle activité',
        'Ordre chronologique (plus récentes en premier)',
        'Code couleur des scores (vert ≥70%, jaune 50-69%, rouge <50%)'
      ],
      activity_history: [ // Alias
        'Vue complète de TOUTES les activités (chapitres, quiz, examens, badges)',
        'Statistiques par type d\'activité',
        'Filtres et recherche avancée',
        'Analyse IA pour chaque activité',
        'Boutons d\'action (Recommencer, Conseils)'
      ],
      
      // 🎓 Orientation Professionnelle
      orientation: [
        'Test d\'orientation professionnelle complet (17 questions)',
        '30 métiers détaillés avec descriptions complètes',
        'Score de compatibilité personnalisé pour chaque métier',
        'Pré-remplissage automatique des questions depuis le profil (Q13-Q17)',
        'Intégration avec le profil (résultats sauvegardés automatiquement)',
        'Affichage des top 3 métiers dans le profil',
        'Modal détaillée pour chaque métier avec formation requise, salaire, débouchés',
        'Bouton "Découvrir ce métier" dans le profil'
      ],
      
      // 📅 Plan d'étude
      'study-plan': [
        'Planification personnalisée des révisions',
        'Création de tâches d\'étude avec échéances',
        'Suivi des objectifs quotidiens/hebdomadaires',
        'Notifications pour tâches à venir',
        'Statistiques de complétion',
        'Suggestions de tâches basées sur les matières faibles',
        'Calendrier visuel des révisions'
      ],
      studyplan: [ // Alias
        'Planification des révisions',
        'Tâches avec échéances',
        'Suivi des objectifs',
        'Statistiques de complétion'
      ],
      
      // 📊 Analytiques avancées
      analytics: [
        'Tableaux de bord détaillés par matière',
        'Graphiques de progression avancés',
        'Analyse des forces et faiblesses (données réelles)',
        'Tendance d\'évolution (croissance/stable/déclin)',
        'Temps d\'étude par matière (statistiques complètes)',
        'Activité des 7 derniers jours',
        'Recommandations basées sur les données'
      ],
      
      // 🌐 Réseau Social
      social: [
        'Partage d\'activités avec d\'autres étudiants',
        'Système d\'amis et de suiveurs',
        'Publications et interactions sociales',
        'Likes et commentaires',
        'Fil d\'actualité des amis',
        'Profils publics des étudiants'
      ],
      
      // 🔗 Mes Liens Partagés
      'my-shared-links': [
        'Gestion de vos liens de partage',
        'Génération de liens personnalisés (avec Dub.co)',
        'Statistiques de clics sur vos liens',
        'Conversions et tracking',
        'Liens actifs/inactifs',
        'QR codes pour vos liens'
      ],
      mysharedlinks: [ // Alias
        'Gestion des liens partagés',
        'Statistiques de clics',
        'Conversions tracking'
      ],
      
      // ⚙️ Paramètres
      settings: [
        'Configuration du compte',
        'Préférences de notification',
        'Choix du mode sombre/clair',
        'Gestion de la confidentialité',
        'Paramètres de langue',
        'Notifications push (activation/désactivation)'
      ],
      
      // 💬 Coach IA (cette page actuelle!)
      'coach-ia': [
        'Conversation intelligente avec accès à TOUTES vos données en temps réel',
        '3 onglets : Conversations, Analyses & Conseils, Recherche Perplexity',
        '4 fournisseurs IA : Gemini 1.5 Flash (gratuit), Gemini Pro, Claude 3.5 Sonnet, Perplexity',
        'Analyse d\'images avec Vision API (pour aider avec photos d\'exercices)',
        'Historique des conversations sauvegardé',
        'Conseils personnalisés basés sur vos forces/faiblesses',
        'Plan d\'étude généré automatiquement',
        'Recherche web éducative en temps réel (Perplexity)',
        'Contexte complet : profil, progression, orientation, badges, plan d\'étude, etc.'
      ],
      coachia: [ // Alias
        'Assistant IA avec accès complet aux données',
        'Multi-provider (Gemini, Claude, Perplexity)',
        'Analyse d\'images',
        'Recherche web éducative'
      ],
      
      // 🤖 Chatbot (page séparée)
      chatbot: [
        'Assistant conversationnel simple',
        'Réponses rapides aux questions courantes',
        'Aide à la navigation',
        'Suggestions de contenu'
      ],
      
      // 💳 Paiement et abonnement
      payment: [
        'Essai gratuit de 7 jours pour nouveaux inscrits',
        'Abonnement unique : 1000 FCFA pour accès ILLIMITÉ à vie',
        'Paiement Mobile Money : Orange Money, Wave, Free Money, MTN Money',
        'Historique des transactions',
        'Gestion de l\'abonnement (annulation, renouvellement)',
        'Statut visible : Trial (essai), Active (actif), Expired (expiré)'
      ],
      
      // 🛒 Boutique (Shop)
      shop: [
        'Produits éducatifs disponibles',
        'Livres et ressources pédagogiques',
        'Accessoires d\'étude',
        'Ajout au panier',
        'Paiement sécurisé'
      ],
      
      // 🛒 Panier (Cart)
      cart: [
        'Gestion du panier d\'achat',
        'Modification des quantités',
        'Calcul du total',
        'Passage à la commande',
        'Sauvegarde du panier'
      ],
      
      // ❓ FAQ et Support
      faq: [
        'Questions fréquemment posées',
        'Réponses détaillées par catégorie',
        'Guide d\'utilisation',
        'Résolution de problèmes courants'
      ],
      help: [
        'Centre d\'aide complet',
        'Tutoriels vidéo',
        'Guides pas à pas',
        'Contact support',
        'Formulaire de feedback'
      ]
    };

    const pageKey = page.toLowerCase().replace(/[-\s]/g, ''); // Normaliser les clés
    let features = allFeatures[pageKey] || allFeatures[page.toLowerCase()] || [];
    
    if (features.length === 0) {
      // Retourner un aperçu général de toutes les fonctionnalités
      return `\n🔧 MODULES DISPONIBLES SUR E-RÉUSSITE:

📊 **Contenu pédagogique**: Cours, Chapitres, Quiz, Examens blancs
🏆 **Gamification**: Points, Niveaux, Badges (14 badges), Défis, Série quotidienne
📈 **Suivi**: Dashboard, Progression, Analytiques avancées, Historique d'activités
🎓 **Orientation**: Test professionnel (30 métiers), Résultats dans le profil
📅 **Organisation**: Plan d'étude personnalisé avec tâches et échéances
👤 **Profil**: Stats complètes, Badges, Orientation, Abonnement
🥇 **Compétition**: Leaderboard (global, par niveau, par matière, hebdomadaire)
💬 **IA**: Coach IA (moi!), Chatbot, Analyse d'images, Recherche Perplexity
🌐 **Social**: Amis, Suiveurs, Publications, Interactions
🔗 **Partage**: Liens personnalisés avec statistiques (Dub.co)
⚙️ **Paramètres**: Notifications, Dark mode, Confidentialité
💳 **Abonnement**: Essai gratuit 7 jours, puis 1000 FCFA à vie (Mobile Money)
🛒 **Boutique**: Produits éducatifs, Panier, Paiement sécurisé
❓ **Support**: FAQ, Centre d'aide, Tutoriels, Contact

⚠️ IMPORTANT: Suggère UNIQUEMENT ces fonctionnalités existantes. Si l'étudiant demande autre chose, signale honnêtement que ça n'existe pas encore.`;
    }

    let context = `\n🔧 FONCTIONNALITÉS DISPONIBLES SUR "${page}":\n`;
    features.forEach(feature => {
      context += `  ✅ ${feature}\n`;
    });

    context += '\n⚠️ IMPORTANT: Suggère UNIQUEMENT ces fonctionnalités existantes. Si l\'étudiant demande autre chose, signale honnêtement que ça n\'existe pas encore.\n';

    return context;
  }

  /**
   * Sauvegarde dans l'historique de conversation
   */
  saveToHistory(conversationId, userMessage, aiResponse) {
    if (!this.conversationHistory.has(conversationId)) {
      this.conversationHistory.set(conversationId, []);
    }

    const history = this.conversationHistory.get(conversationId);
    history.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });
    history.push({
      role: 'model',
      parts: [{ text: aiResponse }]
    });

    // Limiter l'historique (garder 20 derniers messages)
    if (history.length > 40) {
      history.splice(0, 20);
    }
  }

  /**
   * Obtient l'historique d'une conversation
   */
  getHistory(conversationId = 'default') {
    return this.conversationHistory.get(conversationId) || [];
  }

  /**
   * Efface l'historique d'une conversation
   */
  clearHistory(conversationId = 'default') {
    this.conversationHistory.delete(conversationId);
    this.chatSessions.delete(conversationId);
    console.log(`🗑️ [Contextual AI] Historique "${conversationId}" effacé`);
  }

  /**
   * Efface tous les historiques
   */
  clearAllHistories() {
    this.conversationHistory.clear();
    this.chatSessions.clear();
    console.log('🗑️ [Contextual AI] Tous les historiques effacés');
  }

  /**
   * Explique un élément spécifique (concept, statistique, etc.)
   */
  async explainElement(elementType, elementData, context = {}) {
    const explanationPrompts = {
      statistic: `Explique cette statistique à l'étudiant : ${JSON.stringify(elementData)}`,
      concept: `Explique ce concept de manière simple : ${elementData}`,
      error: `L'étudiant a fait cette erreur : ${elementData}. Explique pourquoi et comment l'éviter.`,
      badge: `Explique comment obtenir ce badge : ${JSON.stringify(elementData)}`,
      prediction: `Explique cette prédiction : ${JSON.stringify(elementData)}`,
      recommendation: `Explique cette recommandation : ${elementData}`
    };

    const prompt = explanationPrompts[elementType] || `Explique ceci : ${elementData}`;
    return await this.sendMessage(prompt, context);
  }

  /**
   * Suggère une action basée sur le contexte
   */
  async suggestAction(currentContext, userGoal = '') {
    const prompt = `
Contexte actuel : ${JSON.stringify(currentContext)}
${userGoal ? `Objectif de l'étudiant : ${userGoal}` : ''}

Suggère la meilleure action à prendre maintenant (1 seule action concrète et précise).
`;
    return await this.sendMessage(prompt, { 
      page: currentContext.page,
      section: 'action-suggestion'
    });
  }

  /**
   * Analyse rapide d'une situation
   */
  async quickAnalysis(data, analysisType = 'performance') {
    const analysisPrompts = {
      performance: `Analyse rapide de cette performance en 3 points clés : ${JSON.stringify(data)}`,
      progress: `Analyse cette progression en 3 points : ${JSON.stringify(data)}`,
      exam: `Analyse ce résultat d'examen en 3 points : ${JSON.stringify(data)}`,
      habit: `Analyse ces habitudes d'étude en 3 points : ${JSON.stringify(data)}`
    };

    const prompt = analysisPrompts[analysisType] || `Analyse ceci : ${JSON.stringify(data)}`;
    return await this.sendMessage(prompt, { section: 'quick-analysis' });
  }

  /**
   * Génère un résumé contextuel
   */
  async generateSummary(content, maxLength = 100) {
    const prompt = `Résume ceci en ${maxLength} mots maximum, de manière claire et utile pour un étudiant : ${content}`;
    return await this.sendMessage(prompt, { section: 'summary' });
  }

  /**
   * Répond à une question FAQ contextuelle
   */
  async answerFAQ(question, context = {}) {
    const prompt = `Question FAQ : ${question}\n\nRéponds de manière claire et complète.`;
    return await this.sendMessage(prompt, { ...context, section: 'faq' });
  }

  /**
   * Donne un conseil motivationnel personnalisé
   */
  async getMotivation(userContext = {}) {
    const prompt = `Donne un message motivant et personnalisé à cet étudiant (2-3 phrases max).`;
    return await this.sendMessage(prompt, { 
      userContext,
      section: 'motivation'
    });
  }

  /**
   * Génère des exercices de pratique
   */
  async generatePracticeExercises(topic, difficulty = 'moyen', count = 3) {
    const prompt = `
Génère ${count} exercices de pratique sur : ${topic}
Difficulté : ${difficulty}
Format : Question + Indice + Réponse courte

Présente-les de manière claire et numérotée.
`;
    return await this.sendMessage(prompt, { section: 'practice' });
  }

  /**
   * Explique une erreur d'examen/quiz
   */
  async explainMistake(question, userAnswer, correctAnswer, explanation = '') {
    const prompt = `
Question : ${question}
Réponse de l'étudiant : ${userAnswer}
Bonne réponse : ${correctAnswer}
${explanation ? `Explication fournie : ${explanation}` : ''}

Explique l'erreur de manière pédagogique et donne un conseil pour ne plus la refaire.
`;
    return await this.sendMessage(prompt, { section: 'mistake-explanation' });
  }

  /**
   * Crée un plan de révision express
   */
  async createQuickRevisionPlan(topic, timeAvailable, currentLevel = 'moyen') {
    const prompt = `
Sujet à réviser : ${topic}
Temps disponible : ${timeAvailable}
Niveau actuel : ${currentLevel}

Crée un plan de révision express, étape par étape, optimisé pour ce temps.
`;
    return await this.sendMessage(prompt, { section: 'revision-plan' });
  }

  /**
   * Traduit du jargon technique en langage simple
   */
  async simplifyJargon(technicalText) {
    const prompt = `Explique ce texte technique en langage simple pour un étudiant : ${technicalText}`;
    return await this.sendMessage(prompt, { section: 'simplification' });
  }

  /**
   * Génère des conseils personnalisés pour une activité complétée
   * Supporte multi-provider: Claude (priorité), Perplexity (optionnel), Gemini (fallback)
   * 
   * @param {Object} activity - Activité complétée
   * @param {Object} userProfile - Profil utilisateur
   * @param {Array} relatedChapters - Chapitres liés
   * @param {string} preferredProvider - Provider préféré ('claude', 'perplexity', 'gemini')
   * @returns {Promise<Object>}
   */
  async generateAdviceForActivity(activity, userProfile, relatedChapters = [], preferredProvider = null) {
    if (!this.isAvailable()) {
      return {
        error: true,
        message: 'Service IA non disponible'
      };
    }

    try {
      // ✅ CACHE: Vérifier si les conseils existent déjà
      const cacheKey = `${activity.type}_${activity.id}_${activity.score || 0}`;
      const cachedAdvice = this.adviceCache.get(cacheKey);
      
      if (cachedAdvice && (Date.now() - cachedAdvice.timestamp < this.CACHE_DURATION)) {
        console.log('📦 [Cache] Conseils récupérés du cache:', cacheKey);
        return cachedAdvice.advice;
      }
      
      const activityType = activity.type;
      const score = activity.score || 0;
      const timeSpent = activity.timeSpent || 0;
      const correctAnswers = activity.correctAnswers || 0;
      const totalQuestions = activity.totalQuestions || 0;

      let prompt = `Tu es un coach pédagogique expert pour des étudiants sénégalais préparant le BFEM et le BAC.

Analyse cette activité complétée et fournis des conseils personnalisés :

**Type d'activité** : ${this.getActivityTypeLabel(activityType)}
**Titre** : ${activity.title}
**Matière** : ${activity.subject}
`;

      // Ajouter les détails selon le type
      if (activityType === 'quiz_completed' || activityType === 'exam_completed') {
        prompt += `**Score obtenu** : ${score}%
**Questions réussies** : ${correctAnswers}/${totalQuestions}
**Temps passé** : ${Math.round(timeSpent / 60)} minutes

`;
      } else if (activityType === 'chapter_completed') {
        prompt += `**Temps passé** : ${Math.round(timeSpent / 60)} minutes

`;
      }

      // Profil utilisateur
      if (userProfile) {
        prompt += `**Profil de l'étudiant** :
- Niveau : ${userProfile.level || 'Non défini'}
- Points totaux : ${userProfile.total_points || 0}
- Classe : ${userProfile.classe || 'Non définie'}

`;
      }

      // ✅ NOUVEAU: Analyser les réponses détaillées si disponibles
      const answers = activity.data?.answers || [];
      if (answers.length > 0) {
        // Analyser par thématique
        const analysisByTopic = {};
        
        answers.forEach(answer => {
          const topic = answer.topic || 'Général';
          if (!analysisByTopic[topic]) {
            analysisByTopic[topic] = {
              correct: [],
              incorrect: []
            };
          }
          
          if (answer.is_correct) {
            analysisByTopic[topic].correct.push(answer);
          } else {
            analysisByTopic[topic].incorrect.push(answer);
          }
        });

        // Identifier les thématiques fortes (≥80% de réussite)
        const strongTopics = [];
        const weakTopics = [];
        
        Object.entries(analysisByTopic).forEach(([topic, data]) => {
          const total = data.correct.length + data.incorrect.length;
          const successRate = data.correct.length / total;
          
          if (successRate >= 0.8 && total >= 2) {
            strongTopics.push({
              topic,
              correct: data.correct.length,
              total
            });
          } else if (successRate < 0.6 && total >= 2) {
            weakTopics.push({
              topic,
              incorrect: data.incorrect.length,
              total,
              errors: data.incorrect
            });
          }
        });

        // Ajouter l'analyse détaillée au prompt
        if (strongTopics.length > 0 || weakTopics.length > 0) {
          prompt += `**ANALYSE DÉTAILLÉE DES RÉPONSES** :

`;

          // Points forts
          if (strongTopics.length > 0) {
            prompt += `✅ **Thématiques maîtrisées** (≥80% de réussite) :\n`;
            strongTopics.forEach(({ topic, correct, total }) => {
              prompt += `- ${topic} : ${correct}/${total} correctes (${Math.round(correct/total*100)}%)\n`;
            });
            prompt += '\n';
          }

          // Points faibles avec détails des erreurs
          if (weakTopics.length > 0) {
            prompt += `⚠️ **Thématiques à renforcer** (<60% de réussite) :\n`;
            weakTopics.forEach(({ topic, incorrect, total, errors }) => {
              prompt += `- ${topic} : ${incorrect}/${total} erreurs (${Math.round(incorrect/total*100)}%)\n`;
              
              // Lister les questions ratées (max 3 par thématique)
              if (errors.length > 0) {
                prompt += `  Questions ratées :\n`;
                errors.slice(0, 3).forEach((err, idx) => {
                  prompt += `  ${idx + 1}. "${err.question_text}" (répondu ${err.user_answer} au lieu de ${err.correct_answer})\n`;
                });
                if (errors.length > 3) {
                  prompt += `  ... et ${errors.length - 3} autre(s) erreur(s)\n`;
                }
              }
            });
            prompt += '\n';
          }

          // Analyse par difficulté
          const easyErrors = answers.filter(a => !a.is_correct && a.difficulty === 'facile').length;
          const mediumErrors = answers.filter(a => !a.is_correct && a.difficulty === 'moyen').length;
          const hardErrors = answers.filter(a => !a.is_correct && a.difficulty === 'difficile').length;
          
          if (easyErrors > 0 || mediumErrors > 0 || hardErrors > 0) {
            prompt += `**Répartition des erreurs par niveau** :\n`;
            if (easyErrors > 0) prompt += `- Facile : ${easyErrors} erreur(s)\n`;
            if (mediumErrors > 0) prompt += `- Moyen : ${mediumErrors} erreur(s)\n`;
            if (hardErrors > 0) prompt += `- Difficile : ${hardErrors} erreur(s)\n`;
            prompt += '\n';
          }
        }
      }

      prompt += `Fournis une analyse structurée en format JSON avec exactement cette structure :
{
  "strengths": ["point fort 1", "point fort 2", ...],
  "weaknesses": ["point à améliorer 1", "point à améliorer 2", ...],
  "suggestions": [
    {
      "text": "conseil pratique 1",
      "chapterId": 123,
      "chapterTitle": "Titre du chapitre",
      "matiereId": 1
    },
    {
      "text": "conseil pratique 2",
      "chapterId": null,
      "chapterTitle": null,
      "matiereId": null
    },
    ...
  ],
  "message": "un message d'encouragement personnalisé (2-3 phrases)"
}

**Chapitres disponibles pour liens** :
${relatedChapters.length > 0 ? relatedChapters.map(ch => `- ID ${ch.id}: ${ch.title} (Matière ID: ${ch.matiere_id || 'N/A'})`).join('\n') : 'Aucun chapitre spécifique disponible'}

**Critères d'analyse** :
1. **Points forts** : Ce qui a bien fonctionné (précision, rapidité, compréhension...)
2. **Points à améliorer** : Domaines nécessitant plus de travail
3. **Suggestions** : Conseils concrets et actionnables pour progresser
   - Si tu recommandes de réviser un concept présent dans les chapitres disponibles, ajoute le chapterId, chapterTitle ET matiereId
   - Sinon, laisse chapterId, chapterTitle et matiereId à null
   - Priorise les suggestions avec liens vers les chapitres pertinents
4. **Message** : Encouragement adapté au niveau de performance

**Important** :
- Adapte ton langage au contexte sénégalais (BFEM/BAC)
- Sois constructif et encourageant même si le score est faible
- Fournis des conseils pratiques et réalisables
- Utilise un ton amical et motivant
- Pour les suggestions, si un chapitre est pertinent, AJOUTE TOUJOURS son ID, titre ET matiere_id
- Réponds UNIQUEMENT avec le JSON, sans texte avant ou après`;

      let adviceData;
      const provider = this.getAvailableProvider(preferredProvider);

      // ✅ NOUVEAU: Support Perplexity (avec citations)
      if (provider === 'perplexity') {
        console.log('🟢 [Contextual AI] Utilisation de Perplexity Sonar Pro pour les conseils...');
        try {
          const response = await fetch(this.perplexityBaseURL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'sonar-pro',
              messages: [{
                role: 'system',
                content: 'Tu es un coach pédagogique expert spécialisé pour les étudiants sénégalais. Tu fournis des analyses détaillées, constructives et encourageantes avec des ressources éducatives pertinentes.'
              }, {
                role: 'user',
                content: prompt
              }],
              max_tokens: 4096,
              temperature: 0.7,
              return_citations: true, // ✅ Activer les citations pour liens externes
              stream: false
            })
          });

          if (!response.ok) {
            throw new Error(`Perplexity API error: ${response.status}`);
          }

          const data = await response.json();
          let text = data.choices?.[0]?.message?.content || '';
          text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          adviceData = JSON.parse(text);

          // ✅ Ajouter les citations Perplexity si disponibles
          if (data.citations && data.citations.length > 0) {
            adviceData.externalResources = data.citations.slice(0, 5); // Max 5 liens
            console.log(`🔗 [Perplexity] ${data.citations.length} citations ajoutées`);
          }

          console.log('✅ [Perplexity] Conseils générés avec succès');

        } catch (perplexityError) {
          console.warn('⚠️ [Perplexity] Échec, basculement vers Claude/Gemini:', perplexityError.message);
          
          // Fallback vers Claude
          if (this.claude) {
            const response = await this.claude.messages.create({
              model: 'claude-3-5-sonnet-20241022',
              max_tokens: 4096,
              system: 'Tu es un coach pédagogique expert spécialisé pour les étudiants sénégalais.',
              messages: [{ role: 'user', content: prompt }]
            });
            let text = response.content[0].text.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            adviceData = JSON.parse(text);
            console.log('✅ [Claude AI] Conseils générés (fallback)');
          } else if (this.genAI) {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            let text = response.text().trim().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            adviceData = JSON.parse(text);
            console.log('✅ [Gemini] Conseils générés (fallback)');
          } else {
            throw new Error('Aucun provider IA disponible');
          }
        }
      }
      // ✅ Claude AI en priorité
      else if (provider === 'claude') {
        console.log('🟣 [Contextual AI] Utilisation de Claude AI pour les conseils...');
        try {
          const response = await this.claude.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 4096,
            system: 'Tu es un coach pédagogique expert spécialisé pour les étudiants sénégalais. Tu fournis des analyses détaillées, constructives et encourageantes.',
            messages: [{
              role: 'user',
              content: prompt
            }]
          });

          let text = response.content[0].text.trim();
          // Nettoyer le texte
          text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          
          adviceData = JSON.parse(text);
          console.log('✅ [Claude AI] Conseils générés avec succès');
          
        } catch (claudeError) {
          console.warn('⚠️ [Claude AI] Échec, basculement vers Gemini:', claudeError.message);
          
          // Fallback vers Gemini
          if (this.genAI) {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            let text = response.text().trim();
            text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            adviceData = JSON.parse(text);
            console.log('✅ [Gemini] Conseils générés (fallback)');
          } else {
            throw new Error('Aucun provider IA disponible');
          }
        }
      } else if (provider === 'gemini') {
        // Utiliser Gemini directement
        console.log('🔵 [Contextual AI] Utilisation de Gemini pour les conseils...');
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        let text = response.text().trim();
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        adviceData = JSON.parse(text);
        console.log('✅ [Gemini] Conseils générés avec succès');
      }

      // ✅ CACHE: Sauvegarder les conseils générés
      this.adviceCache.set(cacheKey, {
        advice: adviceData,
        timestamp: Date.now()
      });
      console.log('💾 [Cache] Conseils sauvegardés:', cacheKey);

      console.log('✅ [Contextual AI] Conseils générés:', adviceData);
      return adviceData;

    } catch (error) {
      console.error('❌ [Contextual AI] Erreur génération conseils:', error);
      
      // Retourner des conseils par défaut en cas d'erreur
      return this.getDefaultAdvice(activity);
    }
  }

  /**
   * Retourne des conseils par défaut en cas d'erreur IA
   */
  getDefaultAdvice(activity) {
    const score = activity.score || 0;
    
    const defaultAdvice = {
      strengths: [],
      weaknesses: [],
      suggestions: [],
      message: ''
    };

    if (score >= 70) {
      defaultAdvice.strengths = [
        'Excellente maîtrise du sujet',
        'Bonne gestion du temps',
        'Compréhension solide des concepts'
      ];
      defaultAdvice.suggestions = [
        { text: 'Continue sur cette lancée !', chapterId: null, chapterTitle: null },
        { text: 'Essaie des exercices plus avancés', chapterId: null, chapterTitle: null },
        { text: 'Aide tes camarades à progresser', chapterId: null, chapterTitle: null }
      ];
      defaultAdvice.message = 'Bravo ! Tes résultats sont excellents. Continue ainsi !';
    } else if (score >= 50) {
      defaultAdvice.strengths = [
        'Bonne base de compréhension',
        'Effort notable'
      ];
      defaultAdvice.weaknesses = [
        'Quelques notions à revoir',
        'Gestion du temps à améliorer'
      ];
      defaultAdvice.suggestions = [
        { text: 'Révise les concepts mal compris', chapterId: null, chapterTitle: null },
        { text: 'Fais plus d\'exercices pratiques', chapterId: null, chapterTitle: null },
        { text: 'Demande de l\'aide sur les points difficiles', chapterId: null, chapterTitle: null }
      ];
      defaultAdvice.message = 'Bon travail ! Avec un peu plus de pratique, tu vas progresser rapidement.';
    } else {
      defaultAdvice.weaknesses = [
        'Difficultés sur plusieurs concepts',
        'Besoin de plus de pratique'
      ];
      defaultAdvice.suggestions = [
        { text: 'Reprends les bases du chapitre', chapterId: null, chapterTitle: null },
        { text: 'Pratique avec des exercices simples d\'abord', chapterId: null, chapterTitle: null },
        { text: 'N\'hésite pas à demander de l\'aide', chapterId: null, chapterTitle: null },
        { text: 'Prends ton temps pour bien comprendre', chapterId: null, chapterTitle: null }
      ];
      defaultAdvice.message = 'Ne te décourage pas ! Chaque erreur est une opportunité d\'apprendre. Continue tes efforts !';
    }

    return defaultAdvice;
  }

  /**
   * Helper pour obtenir le label d'un type d'activité
   */
  getActivityTypeLabel(type) {
    const labels = {
      'quiz_completed': 'Quiz',
      'exam_completed': 'Examen',
      'chapter_completed': 'Chapitre',
      'badge_earned': 'Badge'
    };
    return labels[type] || 'Activité';
  }
}

// Instance singleton
let contextualAIInstance = null;

/**
 * Initialise le service IA contextuel
 */
export const initializeContextualAI = (apiKey) => {
  if (!contextualAIInstance) {
    contextualAIInstance = new ContextualAIService(apiKey);
    console.log('🤖 [Contextual AI] Service initialisé globalement');
  }
  return contextualAIInstance;
};

/**
 * Obtient l'instance du service IA contextuel
 */
export const getContextualAI = () => {
  if (!contextualAIInstance) {
    console.warn('⚠️ [Contextual AI] Service non initialisé. Appelez initializeContextualAI() d\'abord.');
  }
  return contextualAIInstance;
};

/**
 * Fonction helper pour générer des conseils pour une activité
 */
export const generateAdviceForActivity = async (activity, userProfile) => {
  const ai = getContextualAI();
  if (!ai || !ai.isAvailable()) {
    return {
      error: true,
      message: 'Service IA non disponible'
    };
  }
  return await ai.generateAdviceForActivity(activity, userProfile);
};

/**
 * Fonction helper pour construire un prompt contextuel enrichi
 * @param {string} page - Page actuelle
 * @param {object} userContext - Contexte utilisateur (stats, progression, etc.)
 * @param {object} additionalContext - Contexte additionnel optionnel
 * @returns {string} Prompt système enrichi
 */
export const buildContextualPrompt = (page = 'Dashboard', userContext = {}, additionalContext = {}) => {
  const ai = getContextualAI();
  if (!ai) {
    console.warn('⚠️ [buildContextualPrompt] Service IA non initialisé. Utilisation prompt par défaut.');
    return `Tu es un assistant IA intelligent pour la plateforme E-Réussite. Page actuelle: ${page}`;
  }
  
  // Construire section depuis additionalContext si présente
  const section = additionalContext.section || 'general';
  
  // Appeler la méthode de l'instance (sans le paramètre message car on génère juste le prompt système)
  return ai.buildContextualPrompt('', page, section, userContext, JSON.stringify(additionalContext));
};

export default ContextualAIService;
