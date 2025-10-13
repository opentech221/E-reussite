// ============================================================================
// SERVICE LINK TRACKING - Liens courts avec tracking maison
// Date: 11 octobre 2025
// Description: Génération de liens courts via Edge Function redirect-and-track
// ============================================================================

import { supabase } from '../lib/customSupabaseClient';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const REDIRECT_FUNCTION = `${SUPABASE_URL}/functions/v1/redirect-and-track`;

// Base URL de l'application (compatible SSR)
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return import.meta.env.VITE_APP_URL || 'https://e-reussite.com';
};

/**
 * Générer une clé unique pour un lien court
 * @param {string} prefix - Préfixe optionnel (ex: 'course', 'invite')
 * @returns {string} - Clé unique (ex: 'course-abc123')
 */
function generateShortKey(prefix = '') {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let key = '';
  for (let i = 0; i < 6; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return prefix ? `${prefix}-${key}` : key;
}

/**
 * Vérifier si une chaîne est un UUID valide
 * @param {string} str - Chaîne à vérifier
 * @returns {boolean} - True si UUID valide
 */
function isValidUUID(str) {
  if (!str) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * Détecter automatiquement le type de lien depuis l'URL
 * @param {string} url - URL à analyser
 * @param {string} title - Titre du lien (optionnel)
 * @returns {string} - Type détecté (course, quiz, exam, certificate, perplexity, referral)
 */
function detectLinkType(url, title = '') {
  const urlLower = url.toLowerCase();
  const titleLower = title.toLowerCase();
  
  if (urlLower.includes('/quiz/') || titleLower.includes('quiz')) {
    return 'quiz';
  }
  if (urlLower.includes('/exam/') || titleLower.includes('examen') || titleLower.includes('exam')) {
    return 'exam';
  }
  if (urlLower.includes('/certificate/') || titleLower.includes('certificat')) {
    return 'certificate';
  }
  if (urlLower.includes('perplexity') || titleLower.includes('recherche')) {
    return 'perplexity';
  }
  if (urlLower.includes('/referral/') || urlLower.includes('/invite/') || titleLower.includes('parrainage')) {
    return 'referral';
  }
  
  // Par défaut, c'est un cours
  return 'course';
}

/**
 * Créer un lien court pour un cours
 * @param {string} courseUrl - URL complète du cours
 * @param {object} options - Options personnalisées
 * @returns {Promise<object>} - Lien court créé
 */
export async function createCourseLink(courseUrl, options = {}) {
  try {
    console.log('📤 [LinkTracking] Création lien cours:', courseUrl);

    // Détecter automatiquement le type si non fourni
    const linkType = options.linkType || detectLinkType(courseUrl, options.title);
    
    // Générer une clé unique
    const key = options.slug || generateShortKey(linkType);
    const shortLink = `${REDIRECT_FUNCTION}?key=${key}`;
    
    // Valider resourceId (doit être UUID ou null)
    const resourceId = options.resourceId && isValidUUID(options.resourceId) 
      ? options.resourceId 
      : null;
    
    if (options.resourceId && !resourceId) {
      console.warn('⚠️ [LinkTracking] resourceId invalide (pas un UUID):', options.resourceId);
    }

    console.log('🔍 [LinkTracking] Type détecté:', linkType);

    // Enregistrer dans la BDD
    const { data, error } = await supabase
      .from('shared_links')
      .insert({
        user_id: options.userId,
        short_link: shortLink,
        original_url: courseUrl,
        key: key,
        domain: 'edge-function',
        link_type: linkType,
        resource_id: resourceId,
        title: options.title || 'Cours E-reussite',
        description: options.description || '',
        tags: options.tags || ['course'],
      })
      .select()
      .single();

    if (error) throw error;

    console.log('✅ [LinkTracking] Lien créé:', shortLink);
    return {
      shortLink,
      key,
      id: data.id,
      originalUrl: courseUrl,
    };
  } catch (error) {
    console.error('❌ [LinkTracking] Erreur création lien:', error);
    throw error;
  }
}

/**
 * Créer un lien de parrainage personnalisé
 * @param {object} user - Utilisateur qui parraine
 * @param {object} options - Options personnalisées
 * @returns {Promise<object>} - Lien de parrainage
 */
export async function createReferralLink(user, options = {}) {
  try {
    console.log('📤 [LinkTracking] Création lien parrainage:', user.id);

    const key = options.slug || `invite-${user.username || user.id.slice(0, 8)}`;
    const referralUrl = `${getBaseUrl()}/signup?ref=${user.id}`;
    const shortLink = `${REDIRECT_FUNCTION}?key=${key}`;

    // Enregistrer dans la BDD
    const { data, error } = await supabase
      .from('shared_links')
      .insert({
        user_id: user.id,
        short_link: shortLink,
        original_url: referralUrl,
        key: key,
        domain: 'edge-function',
        link_type: 'referral',
        resource_id: user.id,
        title: `${user.full_name || user.username || 'Utilisateur'} vous invite sur E-reussite`,
        description: 'Rejoignez la meilleure plateforme éducative du Sénégal !',
        tags: ['referral', user.level || 'student'],
      })
      .select()
      .single();

    if (error) throw error;

    console.log('✅ [LinkTracking] Lien parrainage créé:', shortLink);
    return {
      shortLink,
      key,
      id: data.id,
      originalUrl: referralUrl,
    };
  } catch (error) {
    console.error('❌ [LinkTracking] Erreur création parrainage:', error);
    throw error;
  }
}

/**
 * Récupérer analytics depuis tracking maison (BDD)
 * @param {string} linkId - ID interne du lien (UUID shared_links)
 * @param {string} interval - Intervalle ('24h', '7d', '30d')
 * @returns {Promise<object>} - Analytics détaillées
 */
export async function getCustomLinkAnalytics(linkId, interval = '30d') {
  try {
    console.log('📊 [Tracking Maison] Analytics:', linkId, interval);
    
    // 1. Calculer date début
    const days = interval === '24h' ? 1 : (interval === '7d' ? 7 : 30);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    // 2. Récupérer clics depuis BDD
    const { data: clicks, error } = await supabase
      .from('link_clicks')
      .select('*')
      .eq('link_id', linkId)
      .gte('clicked_at', startDate.toISOString());
    
    if (error) throw error;
    
    // 3. Calculer métriques
    const totalClicks = clicks?.length || 0;
    const uniqueClicks = clicks?.filter(c => c.is_unique).length || 0;
    
    // 4. Agréger par dimension
    const countriesMap = clicks?.reduce((acc, c) => {
      const country = c.country || 'Inconnu';
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {}) || {};
    
    const countries = Object.entries(countriesMap)
      .map(([country, clicks]) => ({ country, clicks }))
      .sort((a, b) => b.clicks - a.clicks);
    
    const devicesMap = clicks?.reduce((acc, c) => {
      const device = c.device_type || 'unknown';
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {}) || {};
    
    const devices = Object.entries(devicesMap)
      .map(([device_type, clicks]) => ({ device_type, clicks }))
      .sort((a, b) => b.clicks - a.clicks);
    
    const browsersMap = clicks?.reduce((acc, c) => {
      const browser = c.browser || 'Inconnu';
      acc[browser] = (acc[browser] || 0) + 1;
      return acc;
    }, {}) || {};
    
    const browsers = Object.entries(browsersMap)
      .map(([browser, clicks]) => ({ browser, clicks }))
      .sort((a, b) => b.clicks - a.clicks);
    
    const referrersMap = clicks?.reduce((acc, c) => {
      const ref = c.referrer || 'direct';
      acc[ref] = (acc[ref] || 0) + 1;
      return acc;
    }, {}) || {};
    
    const referrers = Object.entries(referrersMap)
      .map(([referrer, clicks]) => ({ referrer, clicks }))
      .sort((a, b) => b.clicks - a.clicks);
    
    // 5. Grouper par jour
    const clicksByDay = groupClicksByDay(clicks);
    
    return {
      clicks: totalClicks,
      uniqueClicks: uniqueClicks,
      countries: countries,
      devices: devices,
      browsers: browsers,
      referrers: referrers,
      clicksByDay: clicksByDay
    };
  } catch (error) {
    console.error('❌ [Tracking Maison] Erreur:', error);
    throw error;
  }
}

/**
 * Grouper les clics par jour pour graphiques
 * @param {array} clicks - Liste des clics
 * @returns {array} - Clics groupés par jour
 */
function groupClicksByDay(clicks) {
  const grouped = {};
  clicks?.forEach(click => {
    const day = new Date(click.clicked_at).toISOString().split('T')[0];
    grouped[day] = (grouped[day] || 0) + 1;
  });
  
  return Object.entries(grouped)
    .map(([date, count]) => ({ date, clicks: count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Créer un lien de certificat partageable
 * @param {object} examResult - Résultat d'examen
 * @param {object} options - Options personnalisées
 * @returns {Promise<object>} - Lien certificat
 */
export async function createCertificateLink(examResult, options = {}) {
  try {
    console.log('📤 [LinkTracking] Création lien certificat:', examResult.id);

    const username = examResult.user?.username || examResult.user_id?.slice(0, 8) || 'user';
    const examSlug = examResult.exam?.slug || examResult.exam_id?.slice(0, 8) || 'exam';
    const key = options.slug || `cert-${username}-${examSlug}`;
    const certificateUrl = `${getBaseUrl()}/certificates/${examResult.id}`;
    const shortLink = `${REDIRECT_FUNCTION}?key=${key}`;
    
    // Valider resourceId (doit être UUID ou null)
    const resourceId = examResult.id && isValidUUID(examResult.id) 
      ? examResult.id 
      : null;
    
    if (examResult.id && !resourceId) {
      console.warn('⚠️ [LinkTracking] examResult.id invalide (pas un UUID):', examResult.id);
    }

    // Enregistrer dans la BDD
    const { data, error } = await supabase
      .from('shared_links')
      .insert({
        user_id: examResult.user_id,
        short_link: shortLink,
        original_url: certificateUrl,
        key: key,
        domain: 'edge-function',
        link_type: 'certificate',
        resource_id: resourceId,
        title: `Certificat ${examResult.exam?.name || 'Examen'} - ${examResult.user?.full_name || 'Utilisateur'}`,
        description: `Score: ${examResult.score}% - ${new Date(examResult.completed_at).toLocaleDateString('fr-FR')}`,
        tags: ['certificate', examResult.exam?.subject || 'general'],
      })
      .select()
      .single();

    if (error) throw error;

    console.log('✅ [LinkTracking] Certificat partageable créé:', shortLink);
    return {
      shortLink,
      key,
      id: data.id,
      originalUrl: certificateUrl,
    };
  } catch (error) {
    console.error('❌ [LinkTracking] Erreur création certificat:', error);
    throw error;
  }
}

export default {
  createCourseLink,
  createReferralLink,
  getCustomLinkAnalytics,
  createCertificateLink,
};
