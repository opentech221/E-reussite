/**
 * Supabase Edge Function - Notifications de fin d'essai
 * 
 * Cette fonction doit être déployée comme une Edge Function Supabase
 * et être appelée par un CRON job quotidien.
 * 
 * DÉPLOIEMENT:
 * 1. Installer Supabase CLI: npm install -g supabase
 * 2. Créer la fonction: supabase functions new trial-notifications
 * 3. Copier ce code dans supabase/functions/trial-notifications/index.ts
 * 4. Déployer: supabase functions deploy trial-notifications
 * 5. Configurer CRON: Aller dans Dashboard > Edge Functions > trial-notifications > Add trigger
 *    - Schedule: 0 9 * * * (tous les jours à 9h)
 */

// NOTE: Ce fichier est en TypeScript pour Supabase Edge Functions
// Si vous utilisez un backend Node.js, adaptez-le en JavaScript

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

/**
 * Configuration de l'environnement
 */
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY') ?? '' // Ou autre service d'email

/**
 * Fonction principale
 */
serve(async (req) => {
  try {
    // Créer le client Supabase avec la clé service role (bypass RLS)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    console.log('🚀 Démarrage de la vérification des notifications...')

    // Vérifier les notifications pour J-3, J-1, J0
    const notificationDays = [3, 1, 0]
    let totalSent = 0

    for (const days of notificationDays) {
      const users = await getUsersToNotify(supabase, days)
      
      console.log(`📧 ${users.length} utilisateur(s) à notifier pour J-${days}`)

      for (const user of users) {
        try {
          await sendNotificationEmail(user, days)
          await markNotificationAsSent(supabase, user.user_id, days)
          totalSent++
          console.log(`✅ Notification envoyée à ${user.email}`)
        } catch (error) {
          console.error(`❌ Erreur pour ${user.email}:`, error)
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `${totalSent} notification(s) envoyée(s) avec succès`,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('❌ Erreur globale:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

/**
 * Récupérer les utilisateurs à notifier
 */
async function getUsersToNotify(supabase: any, daysBeforeExpiry: number) {
  const { data, error } = await supabase.rpc('get_users_to_notify', {
    p_days_before: daysBeforeExpiry
  })

  if (error) {
    console.error('Erreur get_users_to_notify:', error)
    throw error
  }

  return data || []
}

/**
 * Marquer une notification comme envoyée
 */
async function markNotificationAsSent(supabase: any, userId: string, daysBeforeExpiry: number) {
  const { error } = await supabase.rpc('mark_notification_sent', {
    p_user_id: userId,
    p_days_before: daysBeforeExpiry
  })

  if (error) {
    console.error('Erreur mark_notification_sent:', error)
    throw error
  }
}

/**
 * Envoyer un email de notification
 */
async function sendNotificationEmail(user: any, daysRemaining: number) {
  const emailContent = getEmailContent(daysRemaining)
  
  // Exemple avec SendGrid (à adapter selon votre service)
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      personalizations: [{
        to: [{ email: user.email }],
        subject: emailContent.subject
      }],
      from: {
        email: 'noreply@e-reussite.sn',
        name: 'E-Réussite'
      },
      content: [{
        type: 'text/html',
        value: emailContent.html
      }]
    })
  })

  if (!response.ok) {
    throw new Error(`Erreur SendGrid: ${response.statusText}`)
  }

  return true
}

/**
 * Générer le contenu de l'email selon les jours restants
 */
function getEmailContent(daysRemaining: number) {
  const baseUrl = 'https://e-reussite.sn' // Remplacer par votre vraie URL

  if (daysRemaining === 3) {
    return {
      subject: '⏰ Votre essai gratuit expire dans 3 jours',
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #10b981;">E-Réussite</h1>
              <h2>⏰ Plus que 3 jours d'essai gratuit !</h2>
              <p>Bonjour,</p>
              <p>Votre essai gratuit de 7 jours arrive bientôt à expiration. Il vous reste <strong>3 jours</strong> pour profiter de tout le contenu gratuitement.</p>
              <p><strong>Continuez votre apprentissage sans interruption :</strong></p>
              <p>Pour seulement <strong>1000 FCFA</strong> (paiement unique), débloquez un accès illimité à vie à tous nos cours, au Coach IA et bien plus encore !</p>
              <a href="${baseUrl}/payment" style="display: inline-block; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0;">
                Activer mon accès illimité
              </a>
              <p>À bientôt,<br>L'équipe E-Réussite</p>
            </div>
          </body>
        </html>
      `
    }
  } else if (daysRemaining === 1) {
    return {
      subject: '🚨 Dernier jour d\'essai gratuit !',
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #f59e0b;">E-Réussite</h1>
              <h2>🚨 C'est votre dernier jour d'essai !</h2>
              <p>Bonjour,</p>
              <p>Votre essai gratuit se termine <strong>demain</strong>. Ne perdez pas l'accès à tous vos cours et à votre progression !</p>
              <p><strong>Pourquoi continuer avec E-Réussite ?</strong></p>
              <ul>
                <li>✅ Coach IA personnalisé 24h/24</li>
                <li>✅ Tous les cours BFEM et BAC</li>
                <li>✅ Quiz et examens illimités</li>
                <li>✅ Suivi de progression détaillé</li>
              </ul>
              <p><strong>1000 FCFA</strong> pour un accès à vie. C'est moins cher qu'un transport vers un centre KHP !</p>
              <a href="${baseUrl}/payment" style="display: inline-block; padding: 12px 24px; background-color: #f59e0b; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0;">
                Payer maintenant
              </a>
              <p>L'équipe E-Réussite</p>
            </div>
          </body>
        </html>
      `
    }
  } else { // daysRemaining === 0
    return {
      subject: '⏰ Votre essai gratuit expire aujourd\'hui',
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #ef4444;">E-Réussite</h1>
              <h2>⏰ Votre essai gratuit expire aujourd'hui !</h2>
              <p>Bonjour,</p>
              <p>Votre essai gratuit de 7 jours se termine <strong>aujourd'hui</strong>.</p>
              <p>Sans action de votre part, vous perdrez l'accès à :</p>
              <ul>
                <li>❌ Tous vos cours BFEM et BAC</li>
                <li>❌ Votre Coach IA personnalisé</li>
                <li>❌ Votre progression et vos badges</li>
              </ul>
              <p><strong>Ne perdez pas ce que vous avez appris !</strong></p>
              <p>Pour <strong>1000 FCFA seulement</strong>, gardez votre accès pour toujours.</p>
              <a href="${baseUrl}/payment" style="display: inline-block; padding: 14px 28px; background-color: #ef4444; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; font-size: 18px; font-weight: bold;">
                Activer maintenant
              </a>
              <p>Merci de votre confiance,<br>L'équipe E-Réussite</p>
            </div>
          </body>
        </html>
      `
    }
  }
}

/**
 * ALTERNATIVE: Utiliser un service backend Node.js
 * 
 * Si vous préférez un backend Node.js classique au lieu d'Edge Functions:
 * 
 * 1. Créer un fichier notificationService.js dans votre backend
 * 2. Utiliser node-cron pour planifier l'exécution quotidienne
 * 3. Installer: npm install node-cron nodemailer @supabase/supabase-js
 * 
 * Exemple:
 * 
 * const cron = require('node-cron');
 * const { createClient } = require('@supabase/supabase-js');
 * const nodemailer = require('nodemailer');
 * 
 * // Configurer le client Supabase
 * const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
 * 
 * // Planifier l'exécution tous les jours à 9h
 * cron.schedule('0 9 * * *', async () => {
 *   console.log('🚀 Vérification des notifications...');
 *   // Utiliser la même logique que ci-dessus
 * });
 */
