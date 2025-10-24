/**
 * 🎓 SERVICE D'ORIENTATION - MVP PHASE 1
 * Gestion des tests d'orientation et recommandations métiers
 * Date: 23 octobre 2025
 */

import { supabase } from '../lib/customSupabaseClient';

/**
 * 📊 QUESTIONNAIRE D'ORIENTATION (15 questions)
 */
export const ORIENTATION_QUESTIONS = [
  // SECTION 1 : MATIÈRES PRÉFÉRÉES (5 questions)
  {
    id: 'Q1',
    section: 'preferences',
    type: 'multiple_choice',
    question: 'Quelles sont tes 3 matières préférées ?',
    subtitle: 'Choisis celles où tu excelles et que tu aimes vraiment',
    options: [
      { value: 'maths', label: 'Mathématiques', icon: '🔢', domains: { scientific: 25, technical: 20 } },
      { value: 'physique', label: 'Physique', icon: '⚡', domains: { scientific: 25, technical: 15 } },
      { value: 'chimie', label: 'Chimie', icon: '🧪', domains: { scientific: 20, technical: 10 } },
      { value: 'svt', label: 'SVT/Biologie', icon: '🌱', domains: { scientific: 20, social: 10 } },
      { value: 'francais', label: 'Français', icon: '📝', domains: { literary: 25, artistic: 10 } },
      { value: 'anglais', label: 'Anglais', icon: '🌍', domains: { literary: 20, commercial: 15 } },
      { value: 'histoire', label: 'Histoire-Géo', icon: '🗺️', domains: { literary: 20, social: 15 } },
      { value: 'eco', label: 'Économie', icon: '💰', domains: { commercial: 25, scientific: 10 } },
      { value: 'arts', label: 'Arts plastiques', icon: '🎨', domains: { artistic: 30 } },
      { value: 'sport', label: 'Éducation physique', icon: '⚽', domains: { technical: 10, social: 15 } },
    ],
    maxSelections: 3,
  },

  {
    id: 'Q2',
    section: 'preferences',
    type: 'multiple_choice',
    question: 'Quelles matières détestes-tu le plus ?',
    subtitle: 'Sois honnête, cela nous aidera à mieux te conseiller',
    options: [
      { value: 'maths', label: 'Mathématiques', icon: '🔢' },
      { value: 'physique', label: 'Physique-Chimie', icon: '⚡' },
      { value: 'svt', label: 'SVT/Biologie', icon: '🌱' },
      { value: 'francais', label: 'Français', icon: '📝' },
      { value: 'langues', label: 'Langues vivantes', icon: '🌍' },
      { value: 'histoire', label: 'Histoire-Géographie', icon: '🗺️' },
      { value: 'arts', label: 'Matières artistiques', icon: '🎨' },
      { value: 'sport', label: 'Sport', icon: '⚽' },
      { value: 'none', label: 'Aucune en particulier', icon: '✅' },
    ],
    maxSelections: 2,
  },

  // SECTION 2 : CENTRES D'INTÉRÊT (4 questions)
  {
    id: 'Q3',
    section: 'interests',
    type: 'rating',
    question: 'À quel point aimes-tu travailler avec les technologies et ordinateurs ?',
    subtitle: 'Programmation, réseaux, intelligence artificielle, etc.',
    icon: '💻',
    domain: 'technical',
    scoreMultiplier: 8,
  },

  {
    id: 'Q4',
    section: 'interests',
    type: 'rating',
    question: 'À quel point aimes-tu aider et conseiller les autres ?',
    subtitle: 'Écoute, accompagnement, soutien social',
    icon: '🤝',
    domain: 'social',
    scoreMultiplier: 8,
  },

  {
    id: 'Q5',
    section: 'interests',
    type: 'rating',
    question: 'À quel point aimes-tu créer, dessiner, inventer ?',
    subtitle: 'Design, art, créativité visuelle',
    icon: '🎨',
    domain: 'artistic',
    scoreMultiplier: 8,
  },

  {
    id: 'Q6',
    section: 'interests',
    type: 'rating',
    question: 'À quel point aimes-tu les expériences scientifiques et la recherche ?',
    subtitle: 'Laboratoire, découvertes, innovation',
    icon: '🔬',
    domain: 'scientific',
    scoreMultiplier: 8,
  },

  // SECTION 3 : TYPE DE TRAVAIL (3 questions)
  {
    id: 'Q7',
    section: 'work_style',
    type: 'single_choice',
    question: 'Quel type d\'environnement de travail préfères-tu ?',
    subtitle: 'Imagine ton quotidien professionnel idéal',
    options: [
      { value: 'bureau', label: 'Bureau/Ordinateur', icon: '🖥️', domains: { commercial: 15, scientific: 10 }, environment: 'Bureau' },
      { value: 'terrain', label: 'Terrain/Extérieur', icon: '🌳', domains: { technical: 20, social: 15 }, environment: 'Terrain' },
      { value: 'atelier', label: 'Atelier/Laboratoire', icon: '🔧', domains: { technical: 25, scientific: 15 }, environment: 'Atelier' },
      { value: 'mixte', label: 'Mixte (bureau + terrain)', icon: '🔄', domains: { social: 10 }, environment: 'Mixte' },
    ],
  },

  {
    id: 'Q8',
    section: 'work_style',
    type: 'single_choice',
    question: 'Préfères-tu travailler...',
    subtitle: 'Ton mode de collaboration idéal',
    options: [
      { value: 'team', label: 'En équipe', icon: '👥', domains: { social: 20, commercial: 15 } },
      { value: 'solo', label: 'Seul(e)', icon: '👤', domains: { artistic: 15, scientific: 10, technical: 10 } },
      { value: 'both', label: 'Les deux', icon: '🔀', domains: {} },
    ],
  },

  {
    id: 'Q9',
    section: 'work_style',
    type: 'single_choice',
    question: 'Qu\'est-ce qui te motive le plus dans un métier ?',
    subtitle: 'Choisis ta priorité principale',
    options: [
      { value: 'salary', label: 'Salaire élevé', icon: '💰', domains: { commercial: 20 } },
      { value: 'passion', label: 'Passion et plaisir', icon: '❤️', domains: { artistic: 20 } },
      { value: 'impact', label: 'Aider la société', icon: '🌍', domains: { social: 25 } },
      { value: 'innovation', label: 'Innover et créer', icon: '💡', domains: { scientific: 20, technical: 15 } },
      { value: 'security', label: 'Stabilité et sécurité', icon: '🛡️', domains: { commercial: 10 } },
    ],
  },

  // SECTION 4 : COMPÉTENCES (3 questions)
  {
    id: 'Q10',
    section: 'skills',
    type: 'rating',
    question: 'À quel point es-tu à l\'aise avec les chiffres et calculs ?',
    subtitle: 'Mathématiques, statistiques, finances',
    icon: '🔢',
    domain: 'scientific',
    scoreMultiplier: 7,
  },

  {
    id: 'Q11',
    section: 'skills',
    type: 'rating',
    question: 'À quel point es-tu à l\'aise pour parler en public ?',
    subtitle: 'Présentation, argumentation, communication orale',
    icon: '🎤',
    domain: 'commercial',
    scoreMultiplier: 7,
  },

  {
    id: 'Q12',
    section: 'skills',
    type: 'rating',
    question: 'À quel point es-tu à l\'aise avec le travail manuel/technique ?',
    subtitle: 'Bricolage, manipulation d\'outils, assemblage',
    icon: '🔨',
    domain: 'technical',
    scoreMultiplier: 7,
  },

  // SECTION 5 : CONTEXTE SOCIO-ÉCONOMIQUE (5 questions)
  {
    id: 'Q13',
    section: 'context',
    type: 'single_choice',
    question: 'Quelle est la situation financière de ta famille pour tes études ?',
    subtitle: 'Sois honnête, cela nous aidera à proposer des métiers réalistes',
    icon: '💰',
    options: [
      { value: 'limited', label: 'Ressources limitées (besoin de travailler vite)', icon: '⚡', context: { financial_constraint: 'high', study_duration_max: 2 } },
      { value: 'moderate', label: 'Ressources modérées (formation courte ou bourse)', icon: '📚', context: { financial_constraint: 'medium', study_duration_max: 4 } },
      { value: 'comfortable', label: 'Ressources confortables (études longues possibles)', icon: '🎓', context: { financial_constraint: 'low', study_duration_max: 10 } },
      { value: 'independent', label: 'Je prévois me débrouiller seul(e)', icon: '💼', context: { financial_constraint: 'high', entrepreneurial: true } },
    ],
  },

  {
    id: 'Q14',
    section: 'context',
    type: 'single_choice',
    question: 'Quel est le niveau d\'éducation de tes parents ?',
    subtitle: 'Cela influence le réseau professionnel et les opportunités',
    icon: '👨‍👩‍👧',
    options: [
      { value: 'primary', label: 'École primaire ou moins', icon: '📖', context: { family_network: 'low' } },
      { value: 'secondary', label: 'Collège/Lycée', icon: '🎒', context: { family_network: 'medium' } },
      { value: 'higher', label: 'Université/Formation supérieure', icon: '🎓', context: { family_network: 'high' } },
      { value: 'mixed', label: 'Mixte ou je ne sais pas', icon: '🤷', context: { family_network: 'medium' } },
    ],
  },

  {
    id: 'Q15',
    section: 'context',
    type: 'single_choice',
    question: 'Où habites-tu actuellement ?',
    subtitle: 'Cela influence l\'accès aux formations et opportunités',
    icon: '🏘️',
    options: [
      { value: 'dakar', label: 'Dakar ou grande ville', icon: '🏙️', context: { location: 'urban', opportunities: 'high' } },
      { value: 'regional', label: 'Ville régionale (Thiès, Saint-Louis...)', icon: '🏘️', context: { location: 'semi-urban', opportunities: 'medium' } },
      { value: 'rural', label: 'Zone rurale ou village', icon: '🌾', context: { location: 'rural', opportunities: 'low' } },
    ],
  },

  {
    id: 'Q16',
    section: 'context',
    type: 'rating',
    question: 'À quel point est-il important que ton métier soit compatible avec ta pratique religieuse ?',
    subtitle: 'Horaires de prière, jeûne du ramadan, environnement de travail...',
    icon: '🕌',
    domain: 'religious_compatibility',
    scoreMultiplier: 10,
  },

  {
    id: 'Q17',
    section: 'context',
    type: 'single_choice',
    question: 'As-tu accès à des relations professionnelles dans ta famille/entourage ?',
    subtitle: 'Oncles, cousins, voisins qui peuvent t\'aider à trouver un stage/emploi',
    icon: '🤝',
    options: [
      { value: 'none', label: 'Non, je dois me débrouiller seul(e)', icon: '💪', context: { network_access: 'none' } },
      { value: 'some', label: 'Quelques contacts dans certains domaines', icon: '👥', context: { network_access: 'limited' } },
      { value: 'strong', label: 'Oui, réseau familial/professionnel fort', icon: '🌐', context: { network_access: 'strong' } },
    ],
  },

  // SECTION 6 : ASPIRATIONS (3 questions)
  {
    id: 'Q18',
    section: 'aspirations',
    type: 'single_choice',
    question: 'Combien d\'années d\'études es-tu prêt(e) à faire ?',
    subtitle: 'Après le BFEM ou le BAC',
    options: [
      { value: 'short', label: '1-2 ans (Formation rapide)', icon: '⚡', domains: { technical: 15 } },
      { value: 'medium', label: '3-5 ans (Licence/Master)', icon: '📚', domains: { commercial: 10, scientific: 10 } },
      { value: 'long', label: '6+ ans (Doctorat, Médecine)', icon: '🎓', domains: { scientific: 20 } },
      { value: 'flexible', label: 'Flexible selon le métier', icon: '🔄', domains: {} },
    ],
  },

  {
    id: 'Q18',
    section: 'aspirations',
    type: 'single_choice',
    question: 'Combien d\'années d\'études es-tu prêt(e) à faire ?',
    subtitle: 'Après le BFEM ou le BAC',
    options: [
      { value: 'short', label: '1-2 ans (Formation rapide)', icon: '⚡', domains: { technical: 15 } },
      { value: 'medium', label: '3-5 ans (Licence/Master)', icon: '📚', domains: { commercial: 10, scientific: 10 } },
      { value: 'long', label: '6+ ans (Doctorat, Médecine)', icon: '🎓', domains: { scientific: 20 } },
      { value: 'flexible', label: 'Flexible selon le métier', icon: '🔄', domains: {} },
    ],
  },

  {
    id: 'Q19',
    section: 'aspirations',
    type: 'multiple_choice',
    question: 'Quels sont tes objectifs professionnels ?',
    subtitle: 'Choisis jusqu\'à 3 réponses',
    options: [
      { value: 'entrepreneur', label: 'Créer mon entreprise', icon: '🚀', domains: { commercial: 25 } },
      { value: 'expert', label: 'Devenir expert reconnu', icon: '🏆', domains: { scientific: 20, technical: 15 } },
      { value: 'manager', label: 'Manager une équipe', icon: '👔', domains: { commercial: 20, social: 15 } },
      { value: 'freelance', label: 'Travailler en indépendant', icon: '💼', domains: { artistic: 20, technical: 10 } },
      { value: 'stability', label: 'Avoir un emploi stable', icon: '🔒', domains: { commercial: 10 } },
      { value: 'travel', label: 'Voyager pour mon travail', icon: '✈️', domains: { commercial: 15, social: 10 } },
    ],
    maxSelections: 3,
  },

  {
    id: 'Q20',
    section: 'aspirations',
    type: 'text',
    question: 'Si tu devais décrire ton métier idéal en une phrase...',
    subtitle: 'Sois libre et spontané(e)',
    placeholder: 'Ex: Je veux créer des solutions numériques qui aident les gens au quotidien...',
  },
];

/**
 * 🧮 ALGORITHME DE SCORING
 * Calcule les scores par domaine en fonction des réponses
 */
export const calculateOrientationScores = (answers) => {
  console.log('🧮 [Orientation] Calcul des scores...', { totalAnswers: Object.keys(answers).length });

  const scores = {
    scientific: 0,
    literary: 0,
    technical: 0,
    artistic: 0,
    social: 0,
    commercial: 0,
  };

  const preferences = {
    preferred_subjects: [],
    disliked_subjects: [],
    preferred_work_environment: null,
    career_goals: '',
    // Nouveau : contexte socio-économique
    financial_constraint: null, // low | medium | high
    family_network: null, // low | medium | high
    location: null, // urban | semi-urban | rural
    network_access: null, // none | limited | strong
    religious_importance: 0, // 0-100
  };

  // Parcourir les réponses
  Object.entries(answers).forEach(([questionId, answer]) => {
    const question = ORIENTATION_QUESTIONS.find(q => q.id === questionId);
    if (!question) return;

    console.log(`📝 [Q${questionId}] Type: ${question.type}, Answer:`, answer);

    // Q1 : Matières préférées (multiple)
    if (questionId === 'Q1' && Array.isArray(answer)) {
      answer.forEach(subjectValue => {
        const option = question.options.find(opt => opt.value === subjectValue);
        if (option && option.domains) {
          Object.entries(option.domains).forEach(([domain, points]) => {
            scores[domain] += points;
          });
          preferences.preferred_subjects.push(option.label);
        }
      });
    }

    // Q2 : Matières détestées (multiple)
    if (questionId === 'Q2' && Array.isArray(answer)) {
      answer.forEach(subjectValue => {
        const option = question.options.find(opt => opt.value === subjectValue);
        if (option) {
          preferences.disliked_subjects.push(option.label);
        }
      });
    }

    // Q3-Q6, Q10-Q12 : Questions rating (1-5)
    if (question.type === 'rating' && typeof answer === 'number') {
      const domain = question.domain;
      const multiplier = question.scoreMultiplier || 5;
      scores[domain] += answer * multiplier;
      // Si la question concerne la compatibilité religieuse, stocker une valeur 0-100
      if (domain === 'religious_compatibility') {
        // Normaliser sur 0-100
        preferences.religious_importance = Math.round((answer / 5) * 100);
      }
    }

    // Q7-Q9, Q13-Q15, Q17-Q18 : Single choice avec contexte
    if (question.type === 'single_choice') {
      const option = question.options.find(opt => opt.value === answer);
      if (option && option.domains) {
        Object.entries(option.domains).forEach(([domain, points]) => {
          scores[domain] += points;
        });
      }
      
      // Capturer le contexte socio-économique
      if (option && option.context) {
        if (questionId === 'Q13') {
          preferences.financial_constraint = option.context.financial_constraint;
        }
        if (questionId === 'Q14') {
          preferences.family_network = option.context.family_network;
        }
        if (questionId === 'Q15') {
          preferences.location = option.context.location;
        }
        if (questionId === 'Q17') {
          preferences.network_access = option.context.network_access;
        }
      }
      
      if (questionId === 'Q7' && option) {
        preferences.preferred_work_environment = option.environment;
      }
    }

    // Q14 : Objectifs (multiple)
    if (questionId === 'Q14' && Array.isArray(answer)) {
      answer.forEach(goalValue => {
        const option = question.options.find(opt => opt.value === goalValue);
        if (option && option.domains) {
          Object.entries(option.domains).forEach(([domain, points]) => {
            scores[domain] += points;
          });
        }
      });
    }

    // Q15 : Texte libre
    if (questionId === 'Q15' && typeof answer === 'string') {
      preferences.career_goals = answer;
    }
  });

  // Normaliser les scores (0-100)
  const maxScore = Math.max(...Object.values(scores));
  if (maxScore > 0) {
    Object.keys(scores).forEach(domain => {
      scores[domain] = Math.round((scores[domain] / maxScore) * 100);
    });
  }

  console.log('✅ [Orientation] Scores calculés:', scores);
  console.log('📋 [Orientation] Préférences:', preferences);

  // Normaliser la dimension religieuse si présente (scoreMultiplier déjà appliqué)
  preferences.religious_importance = Math.min(100, Math.max(0, preferences.religious_importance || 0));

  return { scores, preferences };
};

/**
 * 🎯 ALGORITHME DE MATCHING MÉTIERS
 * Trouve les métiers les plus compatibles avec le profil
 */
export const matchCareers = async (scores, preferences, userLevel) => {
  console.log('🎯 [Matching] Recherche métiers compatibles...', { scores, userLevel });

  try {
    // Récupérer tous les métiers
    const { data: careers, error } = await supabase
      .from('careers')
      .select('*')
      .eq(userLevel === 'BFEM' ? 'suitable_for_bfem' : 'suitable_for_bac', true);

    if (error) throw error;

    console.log(`📚 [Matching] ${careers.length} métiers disponibles`);

    // Calculer score de compatibilité pour chaque métier
    // Formule normalisée et reproductible :
    // - interestSimilarity: 0-100 (moyenne des différences par domaine)
    // - ensuite on applique des bonus/penalités bornés et on combine
    const careerScores = careers.map(career => {
      // 1) intérêt similarity (0-100)
      const domains = ['scientific', 'literary', 'technical', 'artistic', 'social', 'commercial'];
      let totalSim = 0;
      domains.forEach(domain => {
        const userVal = scores[domain] || 0;
        const careerVal = career[`interest_${domain}`] || 0;
        const sim = 100 - Math.abs(careerVal - userVal); // 0..100
        totalSim += sim;
      });
      const interestSimilarity = totalSim / domains.length; // 0..100

      // Base score from interests (weight 0.65)
      let compatibilityScore = (interestSimilarity * 0.65);

      // 2) environment bonus (0..15)
      if (preferences.preferred_work_environment && career.work_environment && preferences.preferred_work_environment === career.work_environment) {
        compatibilityScore += 12; // small, meaningful bonus
      }

      // 3) subject overlap bonus (0..8)
      if (career.important_subjects && preferences.preferred_subjects) {
        const commonSubjects = career.important_subjects.filter(subject =>
          preferences.preferred_subjects.some(pref => pref.includes(subject) || subject.includes(pref))
        );
        const overlapRatio = commonSubjects.length / Math.max(1, career.important_subjects.length);
        compatibilityScore += overlapRatio * 8;
      }

      // 4) financial penalty (-20..0)
      const finReq = career.financial_requirement || 'medium';
      const userFin = (preferences.financial_constraint || '').toLowerCase();
      if (userFin.includes('élev') || userFin.includes('ele')) { // 'Élevée' or variants
        if (finReq === 'high') compatibilityScore -= 20;
        else if (finReq === 'medium') compatibilityScore -= 8;
      } else if (userFin.includes('moy')) {
        if (finReq === 'high') compatibilityScore -= 8;
      }

      // 5) network bonus (0..10)
      if (career.requires_network) {
        const net = (preferences.network_access || '').toLowerCase();
        if (net.includes('fort')) compatibilityScore += 8;
        else if (net.includes('lim')) compatibilityScore += 4;
      }

      // 6) location adjustment (-5..+5)
      const careerLoc = career.preferred_location || 'urban';
      if (preferences.location && preferences.location === careerLoc) compatibilityScore += 5;
      else if ((preferences.location === 'rural' && careerLoc === 'urban') || (preferences.location === 'urban' && careerLoc === 'rural')) compatibilityScore -= 5;

      // 7) religious adjustment (-10..+10)
      const relPref = preferences.religious_importance || 0;
      if (relPref >= 60) {
        if (career.religious_friendly === 'friendly') compatibilityScore += 8;
        if (career.religious_friendly === 'challenging') compatibilityScore -= 8;
      }

      // === NOUVEAUX CRITÈRES PHASE 1.5 ===

      // 8) Difficulté académique vs niveau élève (pénalité si trop difficile)
      // Détecte si l'élève a des difficultés (scores faibles) et pénalise métiers très difficiles
      const avgScore = (scores.scientific + scores.literary + scores.technical + scores.artistic + scores.social + scores.commercial) / 6;
      const academicDiff = career.academic_difficulty || 'medium';
      
      if (avgScore < 40) { // Élève en difficulté
        if (academicDiff === 'very_hard') compatibilityScore -= 15;
        else if (academicDiff === 'hard') compatibilityScore -= 8;
      } else if (avgScore < 60) { // Élève moyen
        if (academicDiff === 'very_hard') compatibilityScore -= 8;
      }

      // 9) ROI rapide (bonus si contraintes financières ET formation rapide/rentable)
      if (userFin.includes('élev') || userFin.includes('ele')) {
        const roi = career.roi_months || 24;
        if (roi <= 12) compatibilityScore += 10; // ROI excellent (1 an max)
        else if (roi <= 18) compatibilityScore += 6; // ROI bon (18 mois max)
        else if (roi <= 24) compatibilityScore += 3; // ROI correct (2 ans)
      }

      // 10) Taux d'insertion professionnelle (bonus si marché porteur)
      const employmentRate = career.employment_rate_percentage || 70;
      if (employmentRate >= 90) compatibilityScore += 5; // Très bon débouché
      else if (employmentRate >= 80) compatibilityScore += 3; // Bon débouché
      else if (employmentRate < 60) compatibilityScore -= 5; // Marché difficile

      // 11) Tendance du marché (bonus métiers émergents, pénalité métiers déclinants)
      const trend = career.growth_trend || 'stable';
      if (trend === 'growing' || trend === 'emerging') compatibilityScore += 4;
      else if (trend === 'declining') compatibilityScore -= 6;

      // Final clamp and rounding
      const finalScore = Math.round(Math.max(0, Math.min(100, compatibilityScore)));
      return { ...career, compatibility_score: finalScore };
    });

    // Trier par score décroissant
    careerScores.sort((a, b) => b.compatibility_score - a.compatibility_score);

    // Retourner top 10
    const topCareers = careerScores.slice(0, 10);
    console.log('🏆 [Matching] Top 10 métiers:', topCareers.map(c => ({
      title: c.title,
      score: c.compatibility_score,
    })));

    return topCareers;
  } catch (error) {
    console.error('❌ [Matching] Erreur:', error);
    throw error;
  }
};

/**
 * 💾 SAUVEGARDER RÉSULTAT TEST
 */
export const saveOrientationTest = async (userId, scores, preferences, recommendedCareerIds) => {
  console.log('💾 [Orientation] Sauvegarde résultat test...', { userId });

  try {
    const { data, error } = await supabase
      .from('orientation_tests')
      .insert({
        user_id: userId,
        score_scientific: scores.scientific,
        score_literary: scores.literary,
        score_technical: scores.technical,
        score_artistic: scores.artistic,
        score_social: scores.social,
        score_commercial: scores.commercial,
        preferred_subjects: preferences.preferred_subjects,
        disliked_subjects: preferences.disliked_subjects,
        preferred_work_environment: preferences.preferred_work_environment,
        career_goals: preferences.career_goals,
        recommended_careers: recommendedCareerIds,
      })
      .select()
      .single();

    if (error) throw error;

    console.log('✅ [Orientation] Test sauvegardé:', data.id);
    return data;
  } catch (error) {
    console.error('❌ [Orientation] Erreur sauvegarde:', error);
    throw error;
  }
};

/**
 * 📖 RÉCUPÉRER DERNIER TEST
 */
export const getLatestOrientationTest = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('orientation_tests')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows

    return data;
  } catch (error) {
    console.error('❌ [Orientation] Erreur récupération test:', error);
    return null;
  }
};

/**
 * 📚 RÉCUPÉRER MÉTIERS PAR IDS
 */
export const getCareersByIds = async (careerIds) => {
  if (!careerIds || careerIds.length === 0) return [];

  try {
    const { data, error } = await supabase
      .from('careers')
      .select('*')
      .in('id', careerIds);

    if (error) throw error;

    // Remettre dans l'ordre des IDs
    return careerIds.map(id => data.find(c => c.id === id)).filter(Boolean);
  } catch (error) {
    console.error('❌ [Orientation] Erreur récupération métiers:', error);
    return [];
  }
};

/**
 * 🔍 RÉCUPÉRER DÉTAILS MÉTIER
 */
export const getCareerDetails = async (careerId) => {
  try {
    const { data, error } = await supabase
      .from('careers')
      .select('*')
      .eq('id', careerId)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('❌ [Orientation] Erreur récupération métier:', error);
    return null;
  }
};
