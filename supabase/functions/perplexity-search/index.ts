// ============================================================================
// SUPABASE EDGE FUNCTION - PERPLEXITY PROXY
// ============================================================================
// Résout le problème CORS en proxyfiant les requêtes Perplexity
// Deploy: supabase functions deploy perplexity-search
// ============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse request body
    const { query, context } = await req.json()

    console.log('🔍 [Perplexity Proxy] Requête:', { query, context })

    // Appel à Perplexity API
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content: `Tu es un professeur sénégalais expert.
                      Matière: ${context?.subject || 'général'}
                      Niveau: ${context?.level || 'BFEM'}
                      Fournis des réponses claires avec sources fiables.
                      Utilise des exemples locaux sénégalais quand pertinent.`
          },
          {
            role: 'user',
            content: query
          }
        ],
        max_tokens: 1000,
        temperature: 0.2
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [Perplexity API] Erreur:', errorText)
      throw new Error(`Perplexity API error: ${response.status} ${errorText}`)
    }

    const data = await response.json()
    
    console.log('✅ [Perplexity Proxy] Réponse reçue')

    // Format response
    const result = {
      answer: data.choices[0]?.message?.content || 'Pas de réponse',
      citations: data.citations || [],
      model: data.model || 'sonar-pro',
      timestamp: new Date().toISOString()
    }

    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('❌ [Perplexity Proxy] Erreur:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Erreur lors de la recherche Perplexity'
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
