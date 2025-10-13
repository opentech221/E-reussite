// Helper pour agréger les analytics depuis la table link_clicks
// Utilisé côté Edge Function et potentiellement côté service frontend

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/**
 * Agrège les analytics pour un lien donné
 * @param {string} linkId - ID du lien (slug ou id unique)
 * @param {string} interval - Intervalle ('24h', '7d', '30d', '90d', 'all')
 * @returns {Promise<object>} - Statistiques agrégées
 */
export async function getLinkAnalytics(linkId, interval = '30d') {
  // Calcul de la date de début selon l'intervalle
  let since = null;
  if (interval !== 'all') {
    const now = new Date();
    if (interval.endsWith('d')) {
      const days = parseInt(interval);
      now.setDate(now.getDate() - days);
      since = now.toISOString();
    } else if (interval.endsWith('h')) {
      const hours = parseInt(interval);
      now.setHours(now.getHours() - hours);
      since = now.toISOString();
    }
  }

  let query = supabase
    .from('link_clicks')
    .select('*', { count: 'exact' })
    .eq('link_id', linkId);
  if (since) query = query.gte('created_at', since);

  const { data, count, error } = await query;
  if (error) throw error;

  // Agrégation
  const uniqueVisitors = new Set();
  const countries = {};
  const devices = {};
  const referrers = {};

  for (const row of data) {
    if (row.fingerprint) uniqueVisitors.add(row.fingerprint);
    if (row.country) countries[row.country] = (countries[row.country] || 0) + 1;
    if (row.device_type) devices[row.device_type] = (devices[row.device_type] || 0) + 1;
    if (row.referrer) referrers[row.referrer] = (referrers[row.referrer] || 0) + 1;
  }

  return {
    clicks: count,
    uniqueClicks: uniqueVisitors.size,
    countries,
    devices,
    referrers,
    interval,
  };
}
