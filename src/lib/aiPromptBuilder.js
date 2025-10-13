/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * AI PROMPT BUILDER - COACH IA
 * Description: Construction de prompts système contextuels enrichis
 * Date: 9 octobre 2025
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

/**
 * Construire le prompt système avec contexte utilisateur et plateforme
 * 
 * @param {Object} userContext - Données de l'utilisateur (depuis fetchUserRealData)
 * @param {Object} pageContext - Contexte de la page actuelle
 * @returns {string} Prompt système complet
 */
export function buildSystemPrompt(userContext = {}, pageContext = {}) {
  const {
    userName = 'Étudiant',
    level = 1,
    totalPoints = 0,
    currentStreak = 0,
    completionRate = 0,
    totalBadges = 0,
    matieres = [],
    completedChapters = 0,
    completedChaptersDetails = [],
    strongSubjects = [],
    weakSubjects = [],
    recentBadges = [],
    averageScore = 0,
    totalQuizzes = 0,
    lastActivity = 'Aujourd\'hui'
  } = userContext;

  const {
    page = 'dashboard',
    section = null,
    chapterTitle = null,
    matiereName = null
  } = pageContext;

  // Base du prompt
  let prompt = `Tu es le Coach IA de la plateforme E-réussite, un assistant pédagogique intelligent et bienveillant.

# 🎯 TON RÔLE

Tu accompagnes **${userName}** dans son parcours d'apprentissage. Tu es :
- **Pédagogue** : Tu expliques de manière claire et adaptée
- **Motivant** : Tu encourages les progrès et la persévérance
- **Personnalisé** : Tu tiens compte du profil et des statistiques de l'utilisateur
- **Contextuel** : Tu connais la page actuelle et l'historique

# 📊 PROFIL DE L'UTILISATEUR

**Identité** : ${userName}
**Niveau** : ${level}
**Points totaux** : ${totalPoints} points
**Série actuelle** : ${currentStreak} jours
**Taux de complétion** : ${completionRate}%
**Badges débloqués** : ${totalBadges}
`;

  // Ajouter matières
  if (matieres.length > 0) {
    prompt += `**Matières étudiées** : ${matieres.join(', ')}\n`;
  }

  // Ajouter chapitres complétés
  if (completedChapters > 0) {
    prompt += `**Chapitres complétés** : ${completedChapters}\n`;
    
    if (completedChaptersDetails.length > 0) {
      const recentChapters = completedChaptersDetails.slice(0, 5);
      prompt += `**Chapitres récents** :\n`;
      recentChapters.forEach(ch => {
        prompt += `  - ${ch.title} (${ch.matiere}) - ${ch.progress}%\n`;
      });
    }
  }

  // Ajouter badges récents
  if (recentBadges.length > 0) {
    prompt += `**Badges récents** : ${recentBadges.join(', ')}\n`;
  }

  // Ajouter points forts/faibles
  if (strongSubjects.length > 0) {
    prompt += `**Points forts** : ${strongSubjects.join(', ')}\n`;
  }
  if (weakSubjects.length > 0) {
    prompt += `**Points à améliorer** : ${weakSubjects.join(', ')}\n`;
  }

  // Ajouter stats quiz si disponibles
  if (totalQuizzes > 0) {
    prompt += `**Quiz complétés** : ${totalQuizzes}\n`;
    prompt += `**Score moyen** : ${averageScore}%\n`;
  }

  prompt += `**Dernière activité** : ${lastActivity}\n`;

  // Contexte de la page
  prompt += `\n# 📍 CONTEXTE ACTUEL\n\n`;
  prompt += `**Page** : ${page}\n`;
  
  if (section) {
    prompt += `**Section** : ${section}\n`;
  }
  
  if (chapterTitle) {
    prompt += `**Chapitre actif** : ${chapterTitle}\n`;
  }
  
  if (matiereName) {
    prompt += `**Matière** : ${matiereName}\n`;
  }

  // Instructions comportementales
  prompt += `\n# 💬 INSTRUCTIONS DE RÉPONSE

1. **Personnalise tes réponses** en utilisant le prénom de l'utilisateur et ses statistiques
2. **Sois contextuel** : Si l'utilisateur demande "mes statistiques", tu connais déjà ses ${totalPoints} points, son niveau ${level}, etc.
3. **Encourage les progrès** : Mentionne les badges récents, la série en cours, les chapitres complétés
4. **Adapte ton niveau** : Explique de manière adaptée au niveau ${level} de l'utilisateur
5. **Sois concis mais complet** : Évite les répétitions inutiles
6. **Utilise des émojis** pour rendre tes réponses plus engageantes (📚 🎯 💪 🏆 ✨)
7. **Propose des actions** : Suggère des chapitres, quiz, ou défis adaptés au profil

# 🚀 CAPACITÉS DE LA PLATEFORME

E-réussite propose :
- **Chapitres de cours** interactifs avec vidéos et exercices
- **Quiz et examens** pour valider les connaissances
- **Système de progression** avec points, niveaux et badges
- **Série quotidienne** pour encourager la régularité
- **Défis et compétitions** entre étudiants
- **Tableau de bord** avec statistiques détaillées
- **Notifications** de rappel et de motivation

Quand l'utilisateur te pose une question, réponds en tenant compte de TOUT son contexte.
`;

  return prompt;
}

/**
 * Construire un prompt pour l'analyse d'image
 * 
 * @param {Object} userContext - Données utilisateur
 * @returns {string} Prompt pour Vision API
 */
export function buildImageAnalysisPrompt(userContext = {}) {
  const { userName = 'Étudiant', level = 1 } = userContext;

  return `Tu es le Coach IA de E-réussite assistant ${userName} (niveau ${level}).

Analyse cette image en détail et :
1. **Identifie le contenu** : De quoi s'agit-il ? (exercice, cours, schéma, graphique...)
2. **Explique les concepts** : Si c'est du contenu pédagogique, explique-le clairement
3. **Corrige si besoin** : Si c'est un exercice, indique les erreurs et propose des corrections
4. **Donne des conseils** : Suggère des ressources ou chapitres E-réussite liés à ce sujet

Adapte ton explication au niveau ${level} de l'utilisateur.
Sois pédagogue, précis et encourageant ! 📸✨`;
}

/**
 * Construire un prompt contextuel pour une conversation existante
 * 
 * @param {Object} conversationMetadata - Métadonnées de la conversation (context_data)
 * @param {Object} userContext - Données utilisateur actuelles
 * @returns {string} Prompt système
 */
export function buildConversationPrompt(conversationMetadata = {}, userContext = {}) {
  const { page, section, userContext: savedUserContext } = conversationMetadata;
  
  // Fusionner contexte sauvegardé et actuel (prioriser l'actuel)
  const mergedContext = {
    ...savedUserContext,
    ...userContext
  };

  const pageContext = {
    page: page || 'dashboard',
    section: section || null
  };

  return buildSystemPrompt(mergedContext, pageContext);
}
