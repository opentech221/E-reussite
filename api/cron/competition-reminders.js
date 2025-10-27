/**
 * =============================================
 * VERCEL CRON - Rappels de Compétitions
 * =============================================
 * 
 * API Route pour envoyer des rappels automatiques
 * S'exécute toutes les 15 minutes via Vercel Cron
 * 
 * Setup:
 * 1. Créer ce fichier: /api/cron/competition-reminders.js
 * 2. Configurer vercel.json (voir ci-dessous)
 * 3. Déployer sur Vercel
 */

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // 🔒 Vérifier l'autorisation (secret partagé)
  const authHeader = req.headers.authorization;
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
  
  if (authHeader !== expectedAuth) {
    console.error('❌ [Cron] Unauthorized request');
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Invalid CRON_SECRET' 
    });
  }

  try {
    console.log('⏰ [Cron] Executing competition reminders...');

    // 🔧 Créer client Supabase avec Service Role Key
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY, // ⚠️ Utiliser Service Role, pas anon key
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    );

    // 📞 Appeler la fonction PostgreSQL
    const { data, error } = await supabase.rpc('schedule_competition_reminders');

    if (error) {
      console.error('❌ [Cron] Error calling schedule_competition_reminders:', error);
      return res.status(500).json({ 
        success: false,
        error: error.message,
        details: error.details,
        hint: error.hint
      });
    }

    console.log('✅ [Cron] Reminders sent successfully:', data);

    // 📊 Statistiques
    const notificationsCreated = data || 0;

    return res.status(200).json({ 
      success: true,
      timestamp: new Date().toISOString(),
      notifications_created: notificationsCreated,
      message: `${notificationsCreated} reminder(s) scheduled`
    });

  } catch (error) {
    console.error('💥 [Cron] Unexpected error:', error);
    return res.status(500).json({ 
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

/**
 * =============================================
 * CONFIGURATION VERCEL
 * =============================================
 * 
 * Créer/modifier vercel.json à la racine du projet:
 * 
 * {
 *   "crons": [{
 *     "path": "/api/cron/competition-reminders",
 *     "schedule": "0,15,30,45 * * * *"
 *   }]
 * }
 * 
 * Format du schedule (cron syntax):
 * - "* * * * *" = Toutes les minutes
 * - "0,15,30,45 * * * *" = Toutes les 15 minutes
 * - "0 * * * *" = Toutes les heures (à :00)
 * - "0 0 * * *" = Une fois par jour (minuit)
 * 
 * =============================================
 * VARIABLES D'ENVIRONNEMENT REQUISES
 * =============================================
 * 
 * Ajouter dans Vercel Dashboard > Settings > Environment Variables:
 * 
 * VITE_SUPABASE_URL=https://xxx.supabase.co
 * SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 * CRON_SECRET=votre_secret_aleatoire_tres_long_123456789
 * 
 * Générer CRON_SECRET:
 * node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 * 
 * ⚠️ IMPORTANT: Utiliser Service Role Key, PAS anon key !
 * Trouver dans: Supabase Dashboard > Settings > API > service_role (secret)
 */
