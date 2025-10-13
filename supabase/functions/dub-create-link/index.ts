// Edge Function Supabase: Proxy pour Dub.co (éviter CORS)
// Deploy: supabase functions deploy dub-create-link --no-verify-jwt

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  try {
    const DUB_API_KEY = Deno.env.get('DUB_API_KEY')
    if (!DUB_API_KEY) {
      throw new Error('DUB_API_KEY non configurée')
    }

    const body = await req.json()
    const { url, key, domain, title, description, tags } = body

    console.log('📤 [Dub] Création lien:', { url, key, domain })

    // Appel API Dub.co
    const response = await fetch('https://api.dub.co/links', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DUB_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        key,
        domain: domain || 'dub.sh',
        title,
        description,
        tags,
        publicStats: true,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [Dub] Erreur API:', response.status, errorText)
      throw new Error(`Dub API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('✅ [Dub] Lien créé:', data.shortLink)

    return new Response(JSON.stringify(data), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('❌ [Dub] Erreur:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }
})
