/**
 * Service de paiement Mobile Money
 * Gère les intégrations avec Orange Money, Wave, Free Money, MTN Money
 * 
 * NOTE: Ce fichier contient des placeholders pour les intégrations.
 * Vous devrez obtenir les clés API et implémenter les webhooks selon votre pays.
 */

import { supabase } from '@/lib/customSupabaseClient';

// Configuration des providers (À REMPLACER PAR VOS VRAIES CLÉS)
const PAYMENT_CONFIG = {
  orange_money: {
    name: 'Orange Money',
    apiUrl: import.meta.env.VITE_ORANGE_MONEY_API_URL || 'https://api.orange.com/orange-money-webpay/dev/v1',
    merchantKey: import.meta.env.VITE_ORANGE_MONEY_MERCHANT_KEY,
    enabled: false // Activer après configuration
  },
  wave: {
    name: 'Wave',
    apiUrl: import.meta.env.VITE_WAVE_API_URL || 'https://api.wave.com/v1',
    apiKey: import.meta.env.VITE_WAVE_API_KEY,
    enabled: false // Activer après configuration
  },
  free_money: {
    name: 'Free Money',
    apiUrl: import.meta.env.VITE_FREE_MONEY_API_URL,
    apiKey: import.meta.env.VITE_FREE_MONEY_API_KEY,
    enabled: false // Activer après configuration
  },
  mtn_money: {
    name: 'MTN Money',
    apiUrl: import.meta.env.VITE_MTN_MONEY_API_URL || 'https://sandbox.momodeveloper.mtn.com',
    apiKey: import.meta.env.VITE_MTN_MONEY_API_KEY,
    enabled: false // Activer après configuration
  }
};

/**
 * Classe principale de gestion des paiements
 */
class PaymentService {
  /**
   * Initier un paiement
   * @param {string} provider - Provider de paiement ('orange_money', 'wave', etc.)
   * @param {string} phoneNumber - Numéro de téléphone du client
   * @param {number} amount - Montant à payer (default: 1000)
   * @param {string} userId - ID de l'utilisateur
   * @returns {Promise<object>} Résultat de l'initialisation du paiement
   */
  static async initiatePayment(provider, phoneNumber, amount = 1000, userId) {
    try {
      // Vérifier que le provider est supporté
      if (!PAYMENT_CONFIG[provider]) {
        throw new Error(`Provider de paiement non supporté: ${provider}`);
      }

      // Vérifier que le provider est activé
      if (!PAYMENT_CONFIG[provider].enabled) {
        // Mode démo: simuler un paiement
        return await this.simulatePayment(provider, phoneNumber, amount, userId);
      }

      // Générer un ID de transaction unique
      const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Créer la transaction dans la base de données
      const { data: transaction, error: dbError } = await supabase
        .from('payment_transactions')
        .insert({
          user_id: userId,
          amount: amount,
          currency: 'XOF',
          payment_method: provider,
          status: 'pending',
          provider_name: provider,
          provider_transaction_id: transactionId,
          phone_number: phoneNumber
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Appeler l'API du provider selon le type
      let paymentResult;
      switch (provider) {
        case 'orange_money':
          paymentResult = await this.processOrangeMoneyPayment(phoneNumber, amount, transactionId);
          break;
        case 'wave':
          paymentResult = await this.processWavePayment(phoneNumber, amount, transactionId);
          break;
        case 'free_money':
          paymentResult = await this.processFreeMoneyPayment(phoneNumber, amount, transactionId);
          break;
        case 'mtn_money':
          paymentResult = await this.processMTNMoneyPayment(phoneNumber, amount, transactionId);
          break;
        default:
          throw new Error(`Provider non implémenté: ${provider}`);
      }

      return {
        success: true,
        transactionId: transaction.id,
        providerTransactionId: transactionId,
        status: 'pending',
        message: `Paiement initié avec ${PAYMENT_CONFIG[provider].name}. Veuillez compléter la transaction sur votre téléphone.`,
        ...paymentResult
      };

    } catch (error) {
      console.error('Erreur lors de l\'initiation du paiement:', error);
      throw error;
    }
  }

  /**
   * Simuler un paiement (mode démo)
   */
  static async simulatePayment(provider, phoneNumber, amount, userId) {
    console.log('🎭 MODE DÉMO: Simulation de paiement', { provider, phoneNumber, amount });

    // Générer un ID UNIQUE avec timestamp + double random + compteur de performance pour garantir unicité absolue
    const timestamp = Date.now();
    const random1 = Math.random().toString(36).substr(2, 9);
    const random2 = Math.random().toString(36).substr(2, 9);
    const perfNow = performance.now().toString().replace('.', '');
    const transactionId = `DEMO_TXN_${timestamp}_${random1}_${random2}_${perfNow}`;

    // Créer une transaction en mode demo
    const { data: transaction, error } = await supabase
      .from('payment_transactions')
      .insert({
        user_id: userId,
        amount: amount,
        currency: 'XOF',
        payment_method: provider,
        status: 'completed', // Automatiquement complété en mode démo
        provider_name: provider,
        provider_transaction_id: transactionId,
        phone_number: phoneNumber,
        completed_at: new Date().toISOString(),
        metadata: { demo: true, note: 'Paiement simulé en mode développement' }
      })
      .select()
      .single();

    if (error) throw error;

    // Activer l'abonnement immédiatement
    await supabase.rpc('complete_payment', {
      p_user_id: userId,
      p_transaction_id: transactionId,
      p_payment_method: provider,
      p_phone_number: phoneNumber
    });

    return {
      success: true,
      transactionId: transaction.id,
      providerTransactionId: transactionId,
      status: 'completed',
      demo: true,
      message: '✅ Paiement simulé avec succès ! (Mode développement)'
    };
  }

  /**
   * Traiter un paiement Orange Money
   * Documentation: https://developer.orange.com/apis/orange-money-webpay/
   */
  static async processOrangeMoneyPayment(phoneNumber, amount, transactionId) {
    // TODO: Implémenter l'intégration Orange Money
    console.log('Orange Money payment:', { phoneNumber, amount, transactionId });
    
    // Exemple de structure (à adapter selon la documentation Orange)
    /*
    const response = await fetch(`${PAYMENT_CONFIG.orange_money.apiUrl}/payment`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYMENT_CONFIG.orange_money.merchantKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        merchant_key: PAYMENT_CONFIG.orange_money.merchantKey,
        currency: 'XOF',
        order_id: transactionId,
        amount: amount,
        return_url: `${window.location.origin}/payment/callback`,
        cancel_url: `${window.location.origin}/payment/cancel`,
        notif_url: `${process.env.REACT_APP_API_URL}/webhooks/orange-money`,
        lang: 'fr',
        reference: transactionId
      })
    });
    
    const data = await response.json();
    return data;
    */
    
    throw new Error('Orange Money non configuré. Veuillez activer le mode démo ou configurer les clés API.');
  }

  /**
   * Traiter un paiement Wave
   * Documentation: https://developer.wave.com/
   */
  static async processWavePayment(phoneNumber, amount, transactionId) {
    // TODO: Implémenter l'intégration Wave
    console.log('Wave payment:', { phoneNumber, amount, transactionId });
    throw new Error('Wave non configuré. Veuillez activer le mode démo ou configurer les clés API.');
  }

  /**
   * Traiter un paiement Free Money
   */
  static async processFreeMoneyPayment(phoneNumber, amount, transactionId) {
    // TODO: Implémenter l'intégration Free Money
    console.log('Free Money payment:', { phoneNumber, amount, transactionId });
    throw new Error('Free Money non configuré. Veuillez activer le mode démo ou configurer les clés API.');
  }

  /**
   * Traiter un paiement MTN Money
   * Documentation: https://momodeveloper.mtn.com/
   */
  static async processMTNMoneyPayment(phoneNumber, amount, transactionId) {
    // TODO: Implémenter l'intégration MTN Money
    console.log('MTN Money payment:', { phoneNumber, amount, transactionId });
    throw new Error('MTN Money non configuré. Veuillez activer le mode démo ou configurer les clés API.');
  }

  /**
   * Vérifier le statut d'une transaction
   */
  static async checkTransactionStatus(transactionId) {
    try {
      const { data, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Erreur lors de la vérification du statut:', error);
      throw error;
    }
  }

  /**
   * Obtenir les providers disponibles
   */
  static getAvailableProviders() {
    return Object.entries(PAYMENT_CONFIG).map(([key, config]) => ({
      id: key,
      name: config.name,
      enabled: config.enabled,
      demo: !config.enabled
    }));
  }
}

export default PaymentService;

/**
 * INSTRUCTIONS DE CONFIGURATION
 * 
 * 1. CRÉER UN FICHIER .env.local À LA RACINE DU PROJET:
 * 
 * REACT_APP_ORANGE_MONEY_API_URL=https://api.orange.com/orange-money-webpay/dev/v1
 * REACT_APP_ORANGE_MONEY_MERCHANT_KEY=your_merchant_key_here
 * 
 * REACT_APP_WAVE_API_URL=https://api.wave.com/v1
 * REACT_APP_WAVE_API_KEY=your_wave_api_key_here
 * 
 * REACT_APP_FREE_MONEY_API_URL=https://api.freemoney.sn/v1
 * REACT_APP_FREE_MONEY_API_KEY=your_free_money_api_key_here
 * 
 * REACT_APP_MTN_MONEY_API_URL=https://sandbox.momodeveloper.mtn.com
 * REACT_APP_MTN_MONEY_API_KEY=your_mtn_api_key_here
 * 
 * 2. ACTIVER LES PROVIDERS:
 *    Dans PAYMENT_CONFIG, mettre enabled: true pour chaque provider configuré
 * 
 * 3. IMPLÉMENTER LES WEBHOOKS:
 *    Créer des endpoints backend pour recevoir les callbacks des providers
 * 
 * 4. TESTER EN MODE DÉMO:
 *    Laisser enabled: false pour utiliser la simulation de paiement
 */
