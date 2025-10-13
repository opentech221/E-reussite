import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  try {
    console.log('📊 [Dub Analytics] Début requête');

    // Récupérer la clé API depuis les secrets Supabase
    const DUB_API_KEY = Deno.env.get('DUB_API_KEY')
    if (!DUB_API_KEY) {
      console.error('❌ [Dub Analytics] DUB_API_KEY non configurée');
      throw new Error('DUB_API_KEY non configurée dans les secrets Supabase')
    }

    // Parser le body de la requête
    const { linkId, interval = '30d' } = await req.json()
    console.log('📊 [Dub Analytics] Link ID:', linkId, 'Interval:', interval);

    if (!linkId) {
      throw new Error('linkId est requis')
    }

    // Récupérer les analytics depuis Dub.co API v1
    // Documentation: https://dub.co/docs/api-reference/endpoint/retrieve-analytics
    // L'API Dub.co v1 accepte plusieurs formats:
    // - GET /analytics?linkId={linkId} (avec linkId = ID interne Dub)
    // - GET /analytics?domain={domain}&key={key} (avec domain et key du short link)
    // On utilise la méthode linkId qui est plus simple
    const dubApiUrl = `https://api.dub.co/analytics?linkId=${linkId}&interval=${interval}`
    console.log('📊 [Dub Analytics] Calling Dub API:', dubApiUrl);

    const response = await fetch(dubApiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${DUB_API_KEY}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [Dub Analytics] Dub API error:', response.status, errorText);
      throw new Error(`Dub API error: ${response.status} - ${errorText}`)
    }

    const analyticsData = await response.json()
    console.log('✅ [Dub Analytics] Analytics récupérées:', {
      clicks: analyticsData.clicks || 0,
      uniqueClicks: analyticsData.uniqueClicks || 0,
    });

    // Retourner les analytics
    return new Response(
      JSON.stringify({
        success: true,
        data: analyticsData,
        linkId,
        interval,
        retrievedAt: new Date().toISOString(),
      }),
      {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('❌ [Dub Analytics] Erreur:', error.message);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      }
    )
  }
})
