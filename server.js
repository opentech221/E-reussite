// ============================================================================
// BACKEND API PROXY - Perplexity & autres services
// Date: 10 octobre 2025
// Usage: npm run server (en parallèle de npm run dev)
// ============================================================================

import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// Configuration Perplexity
const perplexity = new OpenAI({
  apiKey: process.env.VITE_PERPLEXITY_API_KEY,
  baseURL: 'https://api.perplexity.ai'
});

// ============================================================================
// ROUTE: Recherche Perplexity avec sources
// ============================================================================
app.post('/api/perplexity/search', async (req, res) => {
  try {
    const { question, context = {} } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question requise' });
    }

    console.log('🔍 [Perplexity API] Recherche:', question);

    const response = await perplexity.chat.completions.create({
      model: 'sonar-medium-online',
      messages: [
        {
          role: 'system',
          content: `Tu es un professeur sénégalais expert.
                    Matière: ${context.subject || 'général'}
                    Niveau: ${context.level || 'BFEM'}
                    Fournis des réponses claires avec sources fiables.
                    Utilise des exemples locaux sénégalais quand pertinent.`
        },
        {
          role: 'user',
          content: question
        }
      ],
      max_tokens: 1000,
      temperature: 0.2,
      search_domain_filter: [
        'education.gouv.sn',
        '*.edu',
        'universites.sn',
        'wikipedia.org'
      ],
      search_recency_filter: 'month'
    });

    const answer = response.choices[0].message.content;
    const citations = response.citations || [];

    console.log('✅ [Perplexity API] Réponse avec', citations.length, 'sources');

    res.json({
      answer,
      citations,
      model: 'sonar-medium-online',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [Perplexity API] Erreur:', error);
    res.status(500).json({
      error: error.message || 'Erreur lors de la recherche'
    });
  }
});

// ============================================================================
// ROUTE: Génération de leçon
// ============================================================================
app.post('/api/perplexity/generate-lesson', async (req, res) => {
  try {
    const { topic, level } = req.body;

    if (!topic || !level) {
      return res.status(400).json({ error: 'Topic et level requis' });
    }

    console.log('📚 [Perplexity API] Génération leçon:', topic, level);

    const response = await perplexity.chat.completions.create({
      model: 'sonar-medium-online',
      messages: [
        {
          role: 'user',
          content: `Crée un plan de cours détaillé sur: "${topic}"
                    Niveau: ${level}
                    
                    Structure requise:
                    1. Objectifs pédagogiques (3-5 points)
                    2. Introduction (contexte et importance)
                    3. Développement en 3 parties
                    4. Exercices d'application (5 questions)
                    5. Ressources complémentaires
                    
                    Utilise des exemples concrets du Sénégal.
                    Cite toutes les sources utilisées.`
        }
      ],
      max_tokens: 2000,
      temperature: 0.3,
      search_domain_filter: ['*.edu', 'education.gouv.sn', 'wikipedia.org'],
      reasoning_effort: 'high'
    });

    const content = response.choices[0].message.content;
    const sources = response.citations || [];

    console.log('✅ [Perplexity API] Leçon générée avec', sources.length, 'sources');

    res.json({
      topic,
      level,
      content,
      sources,
      generatedAt: new Date().toISOString(),
      model: 'sonar-medium-online'
    });
  } catch (error) {
    console.error('❌ [Perplexity API] Erreur génération:', error);
    res.status(500).json({
      error: error.message || 'Erreur lors de la génération'
    });
  }
});

// ============================================================================
// ROUTE: Health check
// ============================================================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    services: {
      perplexity: !!process.env.VITE_PERPLEXITY_API_KEY
    }
  });
});

// ============================================================================
// Démarrage du serveur
// ============================================================================
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║  🚀 Backend API Proxy E-reussite                      ║
║  📡 Port: ${PORT}                                    ║
║  🔗 URL: http://localhost:${PORT}                   ║
║  ✅ CORS activé pour: http://localhost:3000          ║
╚═══════════════════════════════════════════════════════╝
  `);

  if (!process.env.VITE_PERPLEXITY_API_KEY) {
    console.warn('⚠️  VITE_PERPLEXITY_API_KEY non configurée !');
  } else {
    console.log('✅ Perplexity API configurée');
  }
});

export default app;
