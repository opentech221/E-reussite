// Test rapide de l'Edge Function perplexity-search
const SUPABASE_URL = 'https://qbvdrkhdjjpuowthwinf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFidmRya2hkampwdW93dGh3aW5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMTc4NjUsImV4cCI6MjA3NDg5Mzg2NX0.eGtl8fEwG8UWX-zSB8TntUAtgEVyLqaKauMMcj0QX8E';

async function testPerplexity() {
  try {
    console.log('🔍 Test de l\'Edge Function perplexity-search...\n');
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/perplexity-search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify({
        query: "Qu'est-ce que le BFEM au Sénégal?",
        context: {
          subject: "Éducation",
          level: "BFEM"
        }
      })
    });

    console.log('Status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur:', errorText);
      return;
    }

    const data = await response.json();
    console.log('✅ Succès!');
    console.log('Réponse:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('❌ Exception:', error.message);
  }
}

testPerplexity();
