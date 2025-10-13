/**
 * Hook personnalisé pour gérer les abonnements utilisateur
 * Gère l'essai gratuit, les paiements et le statut d'abonnement
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Récupérer le statut d'abonnement de l'utilisateur
   */
  const fetchSubscriptionStatus = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: rpcError } = await supabase
        .rpc('get_subscription_status', { p_user_id: user.id });

      if (rpcError) throw rpcError;

      setSubscription(data);
    } catch (err) {
      console.error('Erreur lors de la récupération du statut:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Démarrer l'essai gratuit de 7 jours
   */
  const startFreeTrial = async () => {
    if (!user) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: rpcError } = await supabase
        .rpc('start_free_trial', { p_user_id: user.id });

      if (rpcError) throw rpcError;

      // Rafraîchir le statut
      await fetchSubscriptionStatus();

      return data;
    } catch (err) {
      console.error('Erreur lors du démarrage de l\'essai gratuit:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Vérifier si l'utilisateur a accès au contenu
   */
  const checkAccess = async () => {
    if (!user) return false;

    try {
      const { data, error: rpcError } = await supabase
        .rpc('check_user_access', { p_user_id: user.id });

      if (rpcError) throw rpcError;

      return data;
    } catch (err) {
      console.error('Erreur lors de la vérification de l\'accès:', err);
      return false;
    }
  };

  /**
   * Enregistrer un paiement complété
   */
  const completePayment = async (transactionId, paymentMethod, phoneNumber = null) => {
    if (!user) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: rpcError } = await supabase.rpc('complete_payment', {
        p_user_id: user.id,
        p_transaction_id: transactionId,
        p_payment_method: paymentMethod,
        p_phone_number: phoneNumber
      });

      if (rpcError) throw rpcError;

      // Rafraîchir le statut
      await fetchSubscriptionStatus();

      return data;
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement du paiement:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtenir l'historique des transactions
   */
  const getTransactionHistory = async () => {
    if (!user) return [];

    try {
      const { data, error: queryError } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (queryError) throw queryError;

      return data || [];
    } catch (err) {
      console.error('Erreur lors de la récupération de l\'historique:', err);
      return [];
    }
  };

  // Charger le statut au montage du composant
  useEffect(() => {
    if (user) {
      fetchSubscriptionStatus();
    }
  }, [user]);

  return {
    subscription,
    loading,
    error,
    hasSubscription: subscription?.has_subscription || false,
    isActive: subscription?.is_active || false,
    status: subscription?.status || 'none',
    daysRemaining: subscription?.days_remaining || 0,
    trialEndDate: subscription?.trial_end_date,
    paymentStatus: subscription?.payment_status,
    startFreeTrial,
    checkAccess,
    completePayment,
    getTransactionHistory,
    refreshStatus: fetchSubscriptionStatus
  };
};

export default useSubscription;
