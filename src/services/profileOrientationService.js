/**
 * SERVICE : SYNCHRONISATION PROFIL ↔ ORIENTATION
 * 
 * Gère la liaison bidirectionnelle entre le profil utilisateur
 * et les résultats du test d'orientation professionnelle.
 */

import { supabase } from '@/lib/customSupabaseClient';

/**
 * Sauvegarde les résultats d'orientation dans le profil utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @param {string} testId - ID du test d'orientation
 * @param {Array} topCareers - Top 3-5 carrières [{slug, title, score, category}]
 * @returns {Promise<Object>} Profil mis à jour
 */
export async function saveOrientationToProfile(userId, testId, topCareers) {
  try {
    // Préparer les données (top 5 carrières max)
    const preferredCareers = topCareers.slice(0, 5).map(career => ({
      slug: career.slug,
      title: career.title,
      score: career.score,
      category: career.category
    }));

    const topScore = topCareers.length > 0 ? topCareers[0].score : null;

    // Mettre à jour le profil
    const { data, error } = await supabase
      .from('profiles')
      .update({
        orientation_test_id: testId,
        preferred_careers: preferredCareers,
        orientation_completed_at: new Date().toISOString(),
        top_career_match_score: topScore
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Orientation sauvegardée dans profil:', data);
    return data;
  } catch (error) {
    console.error('❌ Erreur sauvegarde orientation dans profil:', error);
    throw error;
  }
}

/**
 * Récupère les données d'orientation depuis le profil
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Object|null>} Données orientation ou null
 */
export async function getOrientationFromProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('orientation_test_id, preferred_careers, orientation_completed_at, top_career_match_score')
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    // Vérifier si l'utilisateur a déjà fait le test
    if (!data.orientation_completed_at) {
      return null;
    }

    return {
      testId: data.orientation_test_id,
      careers: data.preferred_careers || [],
      completedAt: data.orientation_completed_at,
      topScore: data.top_career_match_score
    };
  } catch (error) {
    console.error('❌ Erreur récupération orientation depuis profil:', error);
    return null;
  }
}

/**
 * Pré-remplit les questions socio-économiques (Q13-Q17) depuis le profil
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Object>} Réponses pré-remplies {q13, q14, q15, q16, q17}
 */
export async function prefillSocioEconomicQuestions(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('financial_situation, network_support, location, religious_values, academic_level')
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    // Mapper les champs profil vers les réponses orientation
    const prefilled = {
      q13: null, // Moyenne générale (pas dans profil de base)
      q14: mapFinancialSituation(data.financial_situation),
      q15: mapLocation(data.location),
      q16: mapNetworkSupport(data.network_support),
      q17: mapReligiousValues(data.religious_values)
    };

    // Si academic_level existe, l'utiliser pour estimer Q13
    if (data.academic_level) {
      prefilled.q13 = estimateAcademicScore(data.academic_level);
    }

    console.log('✅ Questions pré-remplies depuis profil:', prefilled);
    return prefilled;
  } catch (error) {
    console.error('❌ Erreur pré-remplissage questions:', error);
    return { q13: null, q14: null, q15: null, q16: null, q17: null };
  }
}

/**
 * Récupère les détails complets des carrières préférées
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Array>} Liste des carrières avec tous les détails
 */
export async function getPreferredCareersDetails(userId) {
  try {
    // Récupérer les carrières depuis le profil
    const orientationData = await getOrientationFromProfile(userId);
    
    if (!orientationData || orientationData.careers.length === 0) {
      return [];
    }

    // Récupérer les slugs
    const careerSlugs = orientationData.careers.map(c => c.slug);

    // Requête Supabase pour récupérer les détails complets
    const { data, error } = await supabase
      .from('careers')
      .select('*')
      .in('slug', careerSlugs);

    if (error) throw error;

    // Fusionner scores avec détails carrières
    const careersWithScores = data.map(career => {
      const savedCareer = orientationData.careers.find(c => c.slug === career.slug);
      return {
        ...career,
        match_score: savedCareer?.score || 0
      };
    });

    // Trier par score décroissant
    careersWithScores.sort((a, b) => b.match_score - a.match_score);

    return careersWithScores;
  } catch (error) {
    console.error('❌ Erreur récupération détails carrières préférées:', error);
    return [];
  }
}

/**
 * Vérifie si l'utilisateur a complété son profil (pour Coach IA)
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Object>} {isComplete, missingFields, hasOrientation}
 */
export async function checkProfileCompleteness(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, phone, location, financial_situation, network_support, religious_values, orientation_completed_at')
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    const missingFields = [];
    if (!data.full_name) missingFields.push('full_name');
    if (!data.phone) missingFields.push('phone');
    if (!data.location) missingFields.push('location');
    if (!data.financial_situation) missingFields.push('financial_situation');
    if (!data.network_support) missingFields.push('network_support');
    if (!data.religious_values) missingFields.push('religious_values');

    return {
      isComplete: missingFields.length === 0,
      missingFields,
      hasOrientation: !!data.orientation_completed_at,
      profileData: data
    };
  } catch (error) {
    console.error('❌ Erreur vérification profil:', error);
    return { isComplete: false, missingFields: [], hasOrientation: false };
  }
}

// ============================================
// FONCTIONS DE MAPPING PROFIL → ORIENTATION
// ============================================

function mapFinancialSituation(value) {
  const mapping = {
    'low': 'constrained',
    'medium': 'moderate',
    'high': 'comfortable'
  };
  return mapping[value] || null;
}

function mapLocation(value) {
  // Mapper les valeurs possibles du profil vers les options orientation
  const urbainCities = ['dakar', 'thies', 'saint-louis', 'kaolack'];
  const ruralKeywords = ['rural', 'village', 'campagne'];
  
  if (!value) return null;
  
  const lowerValue = value.toLowerCase();
  
  if (urbainCities.some(city => lowerValue.includes(city))) {
    return 'urban';
  }
  if (ruralKeywords.some(keyword => lowerValue.includes(keyword))) {
    return 'rural';
  }
  return 'semi-urban'; // Par défaut
}

function mapNetworkSupport(value) {
  const mapping = {
    'strong': 'strong',
    'moderate': 'moderate',
    'weak': 'weak',
    'none': 'weak'
  };
  return mapping[value] || null;
}

function mapReligiousValues(value) {
  const mapping = {
    'very_important': 'very-important',
    'important': 'important',
    'neutral': 'neutral',
    'not_important': 'not-important'
  };
  return mapping[value] || null;
}

function estimateAcademicScore(level) {
  // Estimation basée sur le niveau académique
  const estimates = {
    'bac': '40', // Moyenne modeste
    'bac+2': '50',
    'bac+3': '55',
    'bac+5': '60',
    'doctorat': '65'
  };
  return estimates[level] || null;
}
