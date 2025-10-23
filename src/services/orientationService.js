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

  // SECTION 5 : ASPIRATIONS (3 questions)
  {
    id: 'Q13',
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
    id: 'Q14',
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
    id: 'Q15',
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
    }

    // Q7-Q9, Q13 : Single choice
    if (question.type === 'single_choice') {
      const option = question.options.find(opt => opt.value === answer);
      if (option && option.domains) {
        Object.entries(option.domains).forEach(([domain, points]) => {
          scores[domain] += points;
        });
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
    const careerScores = careers.map(career => {
      let compatibilityScore = 0;

      // Score basé sur les intérêts (60% du total)
      compatibilityScore += (scores.scientific * career.interest_scientific) / 100 * 0.10;
      compatibilityScore += (scores.literary * career.interest_literary) / 100 * 0.10;
      compatibilityScore += (scores.technical * career.interest_technical) / 100 * 0.10;
      compatibilityScore += (scores.artistic * career.interest_artistic) / 100 * 0.10;
      compatibilityScore += (scores.social * career.interest_social) / 100 * 0.10;
      compatibilityScore += (scores.commercial * career.interest_commercial) / 100 * 0.10;

      // Bonus environnement de travail (20% du total)
      if (preferences.preferred_work_environment === career.work_environment) {
        compatibilityScore += 20;
      }

      // Bonus matières préférées (20% du total)
      if (career.important_subjects && preferences.preferred_subjects) {
        const commonSubjects = career.important_subjects.filter(subject =>
          preferences.preferred_subjects.some(pref => pref.includes(subject) || subject.includes(pref))
        );
        compatibilityScore += (commonSubjects.length / career.important_subjects.length) * 20;
      }

      return {
        ...career,
        compatibility_score: Math.round(compatibilityScore),
      };
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
