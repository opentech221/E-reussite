/**
 * Page de Paiement - Finalisation de l'inscription
 * Permet à l'utilisateur de choisir son mode de paiement et de finaliser l'inscription
 */

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Check, Wallet, Smartphone, AlertCircle, Loader2, ArrowRight, History, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useSubscription } from '@/hooks/useSubscription';
import PaymentService from '@/services/PaymentService';
import { supabase } from '@/lib/customSupabaseClient';

const PaymentPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { completePayment } = useSubscription();
  
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);

  // Providers de paiement disponibles
  const paymentProviders = [
    {
      id: 'orange_money',
      name: 'Orange Money',
      icon: '🟠',
      gradient: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      borderColor: 'border-orange-300 dark:border-orange-700'
    },
    {
      id: 'wave',
      name: 'Wave',
      icon: '💙',
      gradient: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-300 dark:border-blue-700'
    },
    {
      id: 'free_money',
      name: 'Free Money',
      icon: '💜',
      gradient: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-300 dark:border-purple-700'
    },
    {
      id: 'mtn_money',
      name: 'MTN Money',
      icon: '💛',
      gradient: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-300 dark:border-yellow-700'
    }
  ];

  /**
   * Récupérer l'historique des transactions
   */
  const fetchTransactions = async () => {
    try {
      setLoadingTransactions(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTransactions(data || []);
    } catch (err) {
      console.error('Erreur lors de la récupération des transactions:', err);
    } finally {
      setLoadingTransactions(false);
    }
  };

  // Charger les transactions au montage du composant
  useEffect(() => {
    fetchTransactions();
  }, []);

  /**
   * Gérer la soumission du paiement
   */
  const handlePayment = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!selectedProvider) {
      setError('Veuillez sélectionner un mode de paiement');
      return;
    }

    if (!phoneNumber || phoneNumber.length < 9) {
      setError('Veuillez entrer un numéro de téléphone valide');
      return;
    }

    try {
      setLoading(true);

      // Récupérer l'utilisateur actuel
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Utilisateur non connecté');
      }

      // Initier le paiement via le service
      const paymentResult = await PaymentService.initiatePayment(
        selectedProvider,
        phoneNumber,
        1000,
        user.id
      );

      if (paymentResult.demo) {
        // Mode démo: paiement instantané
        toast({
          title: "✅ Paiement simulé avec succès !",
          description: "Mode développement - Votre accès illimité est activé.",
          duration: 5000
        });

        // Recharger les transactions
        await fetchTransactions();

        // Rediriger vers le dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        // Mode production: attendre la confirmation
        toast({
          title: "🔄 Paiement en cours",
          description: "Veuillez compléter la transaction sur votre téléphone.",
          duration: 5000
        });

        // TODO: Implémenter le polling ou webhook pour vérifier le statut
        // Pour l'instant, on redirige vers une page d'attente
        navigate(`/payment/status/${paymentResult.transactionId}`);
      }

    } catch (err) {
      console.error('Erreur de paiement:', err);
      setError(err.message || 'Une erreur est survenue lors du paiement');
      
      toast({
        title: "❌ Erreur de paiement",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Paiement - Finaliser votre inscription | E-Réussite</title>
        <meta name="description" content="Finalisez votre inscription avec un paiement unique de 1000 FCFA pour un accès illimité à vie." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-slate-50 dark:from-slate-900 dark:via-green-900/10 dark:to-slate-900">
        <Navbar />

        <section className="pt-32 pb-20 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl md:text-5xl font-bold font-heading text-slate-900 dark:text-white mb-4">
                Finalisez votre inscription
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300">
                Un seul paiement de <span className="font-bold text-green-600">1000 FCFA</span> pour un accès illimité à vie
              </p>
            </motion.div>

            {/* Récapitulatif de l'offre */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <Card className="border-2 border-green-300 dark:border-green-700 shadow-xl bg-gradient-to-br from-white to-green-50/30 dark:from-slate-800 dark:to-green-900/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Accès Illimité à Vie</h3>
                      <p className="text-slate-600 dark:text-slate-300">Tout le contenu débloqué pour toujours</p>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-black text-green-600 dark:text-green-400">1000</div>
                      <div className="text-slate-600 dark:text-slate-300 font-semibold">FCFA</div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3">
                    {[
                      'Tous les cours BFEM et BAC',
                      'Coach IA personnalisé 24h/24',
                      'Quiz et examens illimités',
                      'Suivi de progression',
                      'Badges et récompenses',
                      'Accès mobile et desktop'
                    ].map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Formulaire de paiement */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="border-2 border-slate-200 dark:border-slate-700 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Wallet className="w-6 h-6 text-green-600" />
                    Choisissez votre mode de paiement
                  </CardTitle>
                  <CardDescription>
                    Sélectionnez votre opérateur mobile money préféré
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <form onSubmit={handlePayment} className="space-y-6">
                    {/* Sélection du provider */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                        Opérateur Mobile Money *
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        {paymentProviders.map((provider) => (
                          <motion.button
                            key={provider.id}
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedProvider(provider.id)}
                            className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                              selectedProvider === provider.id
                                ? `${provider.bgColor} ${provider.borderColor} shadow-lg`
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex flex-col items-center gap-2">
                              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${provider.gradient} flex items-center justify-center text-2xl shadow-lg`}>
                                {provider.icon}
                              </div>
                              <span className="font-semibold text-sm text-slate-900 dark:text-white">
                                {provider.name}
                              </span>
                              {selectedProvider === provider.id && (
                                <Check className="w-5 h-5 text-green-600" />
                              )}
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Numéro de téléphone */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Numéro de téléphone *
                      </label>
                      <div className="relative">
                        <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="77 123 45 67"
                          required
                          className="pl-10 border-2"
                          disabled={loading}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Entrez le numéro associé à votre compte {selectedProvider ? paymentProviders.find(p => p.id === selectedProvider)?.name : 'mobile money'}
                      </p>
                    </div>

                    {/* Message d'erreur */}
                    {error && (
                      <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
                        <AlertCircle className="h-4 w-4" />
                        <p className="text-sm">{error}</p>
                      </div>
                    )}

                    {/* Bouton de paiement */}
                    <Button
                      type="submit"
                      disabled={loading || !selectedProvider || !phoneNumber}
                      className="w-full py-6 text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Traitement en cours...
                        </>
                      ) : (
                        <>
                          <Wallet className="w-5 h-5 mr-2" />
                          Payer 1000 FCFA
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                      Paiement sécurisé • Aucun frais caché • Accès immédiat après confirmation
                    </p>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Note de sécurité */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400"
            >
              <p>
                🔒 Vos informations de paiement sont sécurisées et ne sont jamais stockées sur nos serveurs.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Historique des transactions */}
        <section className="py-16 px-4 bg-slate-50 dark:bg-slate-900">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="border-2 border-slate-200 shadow-lg dark:bg-slate-800 dark:border-white/20">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 border-b border-slate-200 dark:border-slate-700">
                  <CardTitle className="flex items-center gap-2 text-xl dark:text-white">
                    <History className="w-6 h-6 text-primary" />
                    Historique des transactions
                    {transactions.length > 0 && (
                      <span className="ml-auto bg-primary text-white text-sm px-3 py-1 rounded-full font-bold">
                        {transactions.length}
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription className="dark:text-slate-300">
                    Consultez toutes vos transactions de paiement
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {loadingTransactions ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : transactions.length > 0 ? (
                    <ul className="space-y-4">
                      {transactions.map((transaction, index) => (
                        <motion.li
                          key={transaction.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-5 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:border-primary/50 hover:shadow-lg transition-all bg-white dark:bg-slate-800"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <p className="font-bold text-lg text-slate-900 dark:text-white">
                                  Transaction #{transaction.provider_transaction_id.substring(0, 20)}...
                                </p>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                                  transaction.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                  transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                  transaction.status === 'failed' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                  'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                                }`}>
                                  {transaction.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                                  {transaction.status === 'failed' && <XCircle className="w-3 h-3" />}
                                  <span className="capitalize">
                                    {transaction.status === 'completed' ? 'Complétée' :
                                     transaction.status === 'pending' ? 'En attente' :
                                     transaction.status === 'failed' ? 'Échouée' : transaction.status}
                                  </span>
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(transaction.created_at).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                                
                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                  <Wallet className="w-4 h-4" />
                                  <span className="capitalize">
                                    {transaction.provider_name.replace('_', ' ')}
                                  </span>
                                </div>
                                
                                {transaction.phone_number && (
                                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                    <Smartphone className="w-4 h-4" />
                                    {transaction.phone_number}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-right ml-4">
                              <p className="font-bold text-2xl text-primary dark:text-primary-light">
                                {transaction.amount.toLocaleString('fr-FR')}
                              </p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                {transaction.currency || 'XOF'}
                              </p>
                            </div>
                          </div>
                          
                          {transaction.error_message && (
                            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                              <p className="text-xs text-red-700 dark:text-red-400 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                {transaction.error_message}
                              </p>
                            </div>
                          )}
                        </motion.li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center py-12">
                      <History className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">
                        Aucune transaction pour le moment
                      </p>
                      <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">
                        Vos paiements apparaîtront ici
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default PaymentPage;
