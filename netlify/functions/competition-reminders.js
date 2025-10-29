// =============================================
// NETLIFY FUNCTION - Rappels automatiques
// =============================================

import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Fonction Netlify pour envoyer les rappels de compétitions
 * Déclenchée automatiquement toutes les 15 minutes
 */
export const handler = async (event, context) => {
  // 🔒 Vérification du secret (sécurité)
  const authHeader = event.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error('❌ CRON_SECRET non configuré');
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'CRON_SECRET non configuré dans les variables d\'environnement' 
      })
    };
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    console.error('❌ Authentification échouée');
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' })
    };
  }

  // ✅ Authentification réussie
  console.log('✅ Authentification réussie');

  try {
    // Créer le client Supabase avec la clé service
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Appeler la fonction PostgreSQL de rappels
    const { data, error } = await supabase.rpc('schedule_competition_reminders');

    if (error) {
      console.error('❌ Erreur lors de l\'envoi des rappels:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'Erreur lors de l\'envoi des rappels',
          details: error.message 
        })
      };
    }

    console.log('✅ Rappels envoyés avec succès:', data);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Rappels de compétitions envoyés avec succès',
        data: data,
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Erreur inattendue',
        details: error.message 
      })
    };
  }
};

// Configuration pour le déclenchement automatique
export const config = {
  schedule: "*/15 * * * *" // Toutes les 15 minutes
};
