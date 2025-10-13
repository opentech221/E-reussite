// ============================================================================
// EDGE FUNCTION: Redirection avec Tracking Analytics
// Route: /functions/v1/redirect-and-track?key={shortKey}
// Description: Intercepte, track, puis redirige vers l'URL originale
// ============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Client Supabase avec service_role (bypass RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ============================================================================
// PARSER USER-AGENT
// ============================================================================

interface DeviceInfo {
  device_type: string;
  browser: string;
  os: string;
}

function parseUserAgent(userAgent: string | null): DeviceInfo {
  if (!userAgent) {
    return { device_type: 'unknown', browser: 'unknown', os: 'unknown' };
  }

  const ua = userAgent.toLowerCase();

  // Detect device type
  let device_type = 'desktop';
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
    device_type = 'mobile';
  } else if (/tablet|ipad|playbook|silk/i.test(ua)) {
    device_type = 'tablet';
  }

  // Detect browser
  let browser = 'unknown';
  if (ua.includes('edg/') || ua.includes('edge/')) {
    browser = 'Edge';
  } else if (ua.includes('chrome/') || ua.includes('crios/')) {
    browser = 'Chrome';
  } else if (ua.includes('firefox/') || ua.includes('fxios/')) {
    browser = 'Firefox';
  } else if (ua.includes('safari/') && !ua.includes('chrome')) {
    browser = 'Safari';
  } else if (ua.includes('opr/') || ua.includes('opera/')) {
    browser = 'Opera';
  }

  // Detect OS
  let os = 'unknown';
  if (ua.includes('windows')) {
    os = 'Windows';
  } else if (ua.includes('mac os') || ua.includes('macos')) {
    os = 'Mac';
  } else if (ua.includes('linux')) {
    os = 'Linux';
  } else if (ua.includes('android')) {
    os = 'Android';
  } else if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
    os = 'iOS';
  }

  return { device_type, browser, os };
}

// ============================================================================
// GEOLOCALISATION IP
// ============================================================================

interface GeoData {
  country: string;
  country_code: string;
  city: string;
  region: string;
}

async function getGeoLocation(ip: string): Promise<GeoData> {
  try {
    // API gratuite ipapi.co (1000 req/jour)
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: { 'User-Agent': 'E-Reussite/1.0' },
    });

    if (!response.ok) {
      throw new Error('Geo API failed');
    }

    const data = await response.json();
    
    return {
      country: data.country_name || 'Unknown',
      country_code: data.country_code || '',
      city: data.city || 'Unknown',
      region: data.region || '',
    };
  } catch (error) {
    console.error('Error fetching geo data:', error);
    return {
      country: 'Unknown',
      country_code: '',
      city: 'Unknown',
      region: '',
    };
  }
}

// ============================================================================
// FINGERPRINTING VISITEUR UNIQUE
// ============================================================================

async function generateFingerprint(ip: string, userAgent: string): Promise<string> {
  const data = `${ip}|${userAgent}`;
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// ============================================================================
// VERIFIER UNICITE (24h)
// ============================================================================

async function isUniqueVisitor(linkId: string, fingerprint: string): Promise<boolean> {
  const { data } = await supabase
    .from('link_clicks')
    .select('id')
    .eq('link_id', linkId)
    .eq('visitor_fingerprint', fingerprint)
    .gte('clicked_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // 24h
    .limit(1);

  return !data || data.length === 0; // Unique si aucun clic récent trouvé
}

// ============================================================================
// HANDLER PRINCIPAL
// ============================================================================


// Import du helper d'analytics
import { getLinkAnalytics } from '../helpers/get-link-analytics.ts';

serve(async (req: Request) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  // Mode analytics agrégé (POST)
  if (req.method === 'POST') {
    try {
      const body = await req.json();
      if (body.action === 'analytics') {
        const { linkId, interval } = body;
        if (!linkId) {
          return new Response(JSON.stringify({ error: 'Missing linkId' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          });
        }
        const data = await getLinkAnalytics(linkId, interval || '30d');
        return new Response(JSON.stringify({ data }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }
    } catch (error) {
      console.error('Error in analytics POST:', error);
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }
  }

  // Redirection + tracking (GET)
  try {
    const url = new URL(req.url);
    const shortKey = url.searchParams.get('key');

    if (!shortKey) {
      return new Response(JSON.stringify({ error: 'Missing key parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 1. Récupérer le lien depuis la BDD
    const { data: link, error: linkError } = await supabase
      .from('shared_links')
      .select('*')
      .eq('key', shortKey)
      .single();

    if (linkError || !link) {
      return new Response('Link not found', { status: 404 });
    }

    // 2. Extraire informations visiteur
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
               req.headers.get('x-real-ip') || 
               'unknown';
    const userAgent = req.headers.get('user-agent') || '';
    const referrer = req.headers.get('referer') || req.headers.get('referrer') || 'direct';

    // 3. Parser User-Agent
    const deviceInfo = parseUserAgent(userAgent);

    // 4. Géolocalisation (async, ne bloque pas la redirection)
    let geoData: GeoData = {
      country: 'Unknown',
      country_code: '',
      city: 'Unknown',
      region: '',
    };

    if (ip !== 'unknown') {
      geoData = await getGeoLocation(ip);
    }

    // 5. Générer fingerprint
    const fingerprint = await generateFingerprint(ip, userAgent);

    // 6. Vérifier si visiteur unique (24h)
    const isUnique = await isUniqueVisitor(link.id, fingerprint);

    // 7. Enregistrer le clic dans link_clicks
    const { error: clickError } = await supabase
      .from('link_clicks')
      .insert({
        link_id: link.id,
        ip_address: ip,
        user_agent: userAgent,
        device_type: deviceInfo.device_type,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        referrer: referrer,
        country: geoData.country,
        country_code: geoData.country_code,
        city: geoData.city,
        region: geoData.region,
        visitor_fingerprint: fingerprint,
        is_unique: isUnique,
      });

    if (clickError) {
      console.error('Error inserting click:', clickError);
    }

    // 8. Mettre à jour les compteurs dans shared_links
    const newClicks = (link.clicks || 0) + 1;
    const newUniqueClicks = isUnique ? (link.unique_clicks || 0) + 1 : link.unique_clicks;

    await supabase
      .from('shared_links')
      .update({
        clicks: newClicks,
        unique_clicks: newUniqueClicks,
        last_click_at: new Date().toISOString(),
      })
      .eq('id', link.id);

    // 9. Rediriger vers l'URL originale (302 temporaire)
    return Response.redirect(link.original_url, 302);

  } catch (error) {
    console.error('Error in redirect-and-track:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
