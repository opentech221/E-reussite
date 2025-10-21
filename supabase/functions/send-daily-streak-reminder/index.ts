import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Edge Function: Send Daily Streak Reminder
 * 
 * Objectif: Envoyer une notification push à 21h aux utilisateurs qui :
 * - Ont un streak actif (> 0)
 * - N'ont pas eu d'activité aujourd'hui
 * - Ont activé les notifications push
 * 
 * Message: "⚠️ Ton streak de X jours expire dans 3h! Continue maintenant !"
 * 
 * Déclenchement: Cron job quotidien à 21h (voir configuration en bas)
 */

// Types
interface PushSubscription {
  user_id: string;
  subscription_data: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  };
}

interface UserWithStreak {
  user_id: string;
  current_streak: number;
  last_activity_date: string;
  full_name: string;
}

// Helper: Send Web Push Notification
async function sendWebPush(
  subscription: PushSubscription,
  payload: {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    tag?: string;
    data?: any;
  }
) {
  try {
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");

    if (!vapidPublicKey || !vapidPrivateKey) {
      throw new Error("VAPID keys not configured");
    }

    // Web Push Protocol (RFC 8030)
    // Note: En production, utiliser une lib comme web-push pour Node.js
    // ou une implémentation Deno équivalente
    
    // Pour l'instant, on log et on retourne success
    // TODO: Implémenter l'envoi réel avec web-push protocol
    console.log(`[Web Push] Sending to ${subscription.user_id}:`, payload);
    
    return { success: true, userId: subscription.user_id };
  } catch (error) {
    console.error(`[Web Push] Error for ${subscription.user_id}:`, error);
    return { success: false, userId: subscription.user_id, error: error.message };
  }
}

serve(async (req) => {
  try {
    // Vérifier que c'est un appel autorisé (cron job ou admin)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Initialiser Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("[Cron] Starting daily streak reminder job...");

    // Étape 1: Trouver les utilisateurs avec streak actif SANS activité aujourd'hui
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    const { data: usersAtRisk, error: usersError } = await supabase
      .from("user_points")
      .select(`
        user_id,
        current_streak,
        last_activity_date,
        profiles!inner(full_name)
      `)
      .gt("current_streak", 0) // Streak > 0
      .neq("last_activity_date", today); // Pas d'activité aujourd'hui

    if (usersError) {
      throw new Error(`Failed to fetch users: ${usersError.message}`);
    }

    if (!usersAtRisk || usersAtRisk.length === 0) {
      console.log("[Cron] No users at risk. All good! 🎉");
      return new Response(
        JSON.stringify({
          success: true,
          message: "No users need reminders",
          sent: 0,
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(`[Cron] Found ${usersAtRisk.length} users at risk`);

    // Étape 2: Récupérer les subscriptions push pour ces utilisateurs
    const userIds = usersAtRisk.map((u: any) => u.user_id);

    const { data: subscriptions, error: subsError } = await supabase
      .from("push_subscriptions")
      .select("user_id, subscription_data")
      .in("user_id", userIds)
      .eq("is_active", true);

    if (subsError) {
      throw new Error(`Failed to fetch subscriptions: ${subsError.message}`);
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log("[Cron] No active push subscriptions found");
      return new Response(
        JSON.stringify({
          success: true,
          message: "No active subscriptions",
          usersAtRisk: usersAtRisk.length,
          sent: 0,
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(`[Cron] Found ${subscriptions.length} active subscriptions`);

    // Étape 3: Envoyer les notifications
    const results = await Promise.all(
      subscriptions.map(async (sub: any) => {
        // Trouver les infos du user
        const user = usersAtRisk.find((u: any) => u.user_id === sub.user_id);
        if (!user) return null;

        const streak = user.current_streak;
        const name = user.profiles?.full_name || "l'étudiant";

        // Créer le message personnalisé
        const payload = {
          title: `⚠️ Ton streak de ${streak} jour${streak > 1 ? "s" : ""} expire bientôt !`,
          body: `Salut ${name}, il te reste 3h pour maintenir ta série. Continue maintenant ! 💪`,
          icon: "/icon-192x192.png",
          badge: "/icon-192x192.png",
          tag: "daily-streak-reminder",
          data: {
            url: "/dashboard",
            type: "streak_reminder",
            streak: streak,
            timestamp: new Date().toISOString(),
          },
        };

        // Envoyer la notification
        return await sendWebPush(sub, payload);
      })
    );

    // Filtrer les résultats non-null et compter les succès
    const validResults = results.filter((r) => r !== null);
    const successCount = validResults.filter((r) => r?.success).length;
    const failureCount = validResults.filter((r) => !r?.success).length;

    console.log(`[Cron] Job complete: ${successCount} sent, ${failureCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        usersAtRisk: usersAtRisk.length,
        subscriptions: subscriptions.length,
        sent: successCount,
        failed: failureCount,
        results: validResults,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Cron] Fatal error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});

/**
 * CONFIGURATION CRON JOB
 * 
 * Pour déployer cette fonction et configurer le cron job:
 * 
 * 1. Déployer la fonction:
 *    supabase functions deploy send-daily-streak-reminder
 * 
 * 2. Configurer les variables d'environnement:
 *    supabase secrets set VAPID_PUBLIC_KEY=your_public_key
 *    supabase secrets set VAPID_PRIVATE_KEY=your_private_key
 * 
 * 3. Créer le cron job dans Supabase SQL Editor:
 * 
 *    SELECT cron.schedule(
 *      'daily-streak-reminder',
 *      '0 21 * * *',  -- Tous les jours à 21h (UTC)
 *      $$
 *      SELECT net.http_post(
 *        url:='https://qbvdrkhdjjpuowthwinf.supabase.co/functions/v1/send-daily-streak-reminder',
 *        headers:='{"Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb
 *      );
 *      $$
 *    );
 * 
 * 4. Vérifier le cron job:
 *    SELECT * FROM cron.job WHERE jobname = 'daily-streak-reminder';
 * 
 * 5. Tester manuellement:
 *    curl -X POST \
 *      'https://qbvdrkhdjjpuowthwinf.supabase.co/functions/v1/send-daily-streak-reminder' \
 *      -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY'
 */
