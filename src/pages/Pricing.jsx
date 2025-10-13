import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Check, Star, Zap, Crown, Sparkles, TrendingUp } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const Pricing = () => {
  const { toast } = useToast();

  const plans = [
    {
      name: 'Journalier',
      price: '500',
      period: 'jour',
      description: 'Parfait pour un boost rapide avant un test ou un examen.',
      features: [
        'Accès illimité pendant 24h',
        'Tous les cours disponibles',
        'Quiz et exercices',
        'Idéal pour révisions express',
      ],
      popular: false,
      icon: Zap,
      gradient: 'from-blue-500 to-cyan-500',
      buttonText: 'Choisir ce pass',
      action: () => handleSubscribe('Journalier')
    },
    {
      name: 'Hebdomadaire',
      price: '2 500',
      period: 'semaine',
      description: 'Une semaine intensive pour maîtriser vos chapitres clés.',
      features: [
        'Accès illimité pendant 7 jours',
        'Tous les cours et exercices',
        'Examens blancs illimités',
        'Support communautaire',
        'Suivi de progression',
      ],
      popular: true,
      icon: TrendingUp,
      gradient: 'from-purple-500 to-pink-500',
      buttonText: 'Choisir ce pass',
      action: () => handleSubscribe('Hebdomadaire')
    },
    {
      name: 'Mensuel',
      price: '15 000',
      period: 'mois',
      description: 'La formule complète pour une préparation optimale et réussir vos examens.',
      features: [
        'Accès illimité à toutes les matières',
        'Toutes les annales et corrigés',
        'Coach IA personnalisé 24/7',
        'Suivi de progression détaillé',
        'Support prioritaire 24/7',
        'Certificats de réussite',
        'Accès aux défis et classements',
      ],
      popular: false,
      icon: Crown,
      gradient: 'from-yellow-500 via-orange-500 to-red-500',
      buttonText: 'Commencer l\'essai gratuit',
      action: () => handleSubscribe('Mensuel')
    }
  ];

  const handleSubscribe = (planName) => {
    toast({
      title: "🚀 Bientôt disponible !",
      description: `L'abonnement ${planName} sera bientôt disponible avec les paiements mobiles locaux !`,
    });
  };

  return (
    <>
      <Helmet>
        <title>Tarifs et Abonnements Flexibles - E-Réussite</title>
        <meta name="description" content="Découvrez nos offres d'abonnement journalier, hebdomadaire et mensuel pour le BFEM et Bac. Payez par Orange Money, Wave, Free Money." />
        <meta name="keywords" content="abonnement BFEM, tarif révision BAC, Orange Money, Wave, Free Money, MTN Money, Sénégal, Côte d'Ivoire" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50">
        <Navbar />

        <section className="pt-32 pb-20 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full mb-6 border border-primary/20">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="text-primary font-semibold">Tarifs transparents et flexibles</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold font-heading text-slate-900 dark:text-white mb-6">
                Choisissez votre <br />
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  formule de réussite
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
                Des pass adaptés à vos besoins. Payez facilement avec votre mobile money préféré.
              </p>
            </motion.div>

            {/* Grille des offres */}
            <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">
              {plans.map((plan, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  className="relative flex"
                >
                  {plan.popular && (
                    <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-10">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-xl flex items-center gap-2 animate-pulse">
                        <Star className="w-4 h-4" fill="currentColor" />
                        Le plus populaire
                      </div>
                    </div>
                  )}
                  
                  <Card className={`w-full flex flex-col transition-all duration-300 hover:scale-105 ${
                    plan.popular 
                      ? 'border-4 border-purple-300 shadow-2xl shadow-purple-500/20 bg-gradient-to-br from-white to-purple-50/50' 
                      : 'border-2 border-slate-200 shadow-xl hover:shadow-2xl'
                  }`}>
                    {/* Header avec icône */}
                    <CardHeader className="text-center pb-8 pt-10">
                      <div className="mx-auto mb-4">
                        <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${plan.gradient} shadow-xl`}>
                          <plan.icon className="w-10 h-10 text-white" />
                        </div>
                      </div>
                      
                      <CardTitle className="text-3xl font-bold mb-3">{plan.name}</CardTitle>
                      <CardDescription className="text-base h-12 leading-tight">{plan.description}</CardDescription>
                      
                      <div className="mt-6">
                        <div className="flex items-baseline justify-center gap-2">
                          <span className={`text-6xl font-black bg-gradient-to-r ${plan.gradient} bg-clip-text text-transparent`}>
                            {plan.price}
                          </span>
                          <span className="text-2xl font-semibold text-slate-500">FCFA</span>
                        </div>
                        <div className="text-slate-500 font-medium mt-2">/ {plan.period}</div>
                      </div>
                    </CardHeader>

                    <CardContent className="flex-grow flex flex-col justify-between px-6 pb-8 space-y-8">
                      {/* Liste des features */}
                      <ul className="space-y-4">
                        {plan.features.map((feature, i) => (
                          <motion.li 
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + i * 0.1 }}
                            className="flex items-start gap-3"
                          >
                            <div className={`flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br ${plan.gradient} flex items-center justify-center mt-0.5`}>
                              <Check className="w-4 h-4 text-white font-bold" />
                            </div>
                            <span className="text-slate-700 dark:text-slate-200 font-medium leading-tight">{feature}</span>
                          </motion.li>
                        ))}
                      </ul>

                      {/* Bouton CTA */}
                      <Button
                        onClick={plan.action}
                        className={`w-full text-lg font-bold py-7 rounded-xl shadow-2xl transition-all duration-300 transform hover:scale-105 ${
                          plan.popular
                            ? `bg-gradient-to-r ${plan.gradient} text-white hover:shadow-purple-500/50`
                            : `bg-gradient-to-r ${plan.gradient} text-white hover:shadow-xl`
                        }`}
                      >
                        <Sparkles className="w-5 h-5 mr-2" />
                        {plan.buttonText}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Section paiements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-center"
            >
              <Card className="max-w-4xl mx-auto border-2 border-primary/20 shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 p-8 border-b border-slate-200">
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
                    Paiements 100% sécurisés
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 text-lg">
                    Payez facilement avec votre mobile money préféré
                  </p>
                </div>
                
                <CardContent className="p-8">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="flex flex-col items-center gap-3 p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border-2 border-blue-200 hover:shadow-xl transition-all"
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-2xl">W</span>
                      </div>
                      <p className="font-bold text-slate-800 dark:text-slate-100">Wave</p>
                    </motion.div>
                    
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="flex flex-col items-center gap-3 p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border-2 border-orange-200 hover:shadow-xl transition-all"
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-2xl">OM</span>
                      </div>
                      <p className="font-bold text-slate-800 dark:text-slate-100">Orange Money</p>
                    </motion.div>
                    
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="flex flex-col items-center gap-3 p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border-2 border-purple-200 hover:shadow-xl transition-all"
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-2xl">FM</span>
                      </div>
                      <p className="font-bold text-slate-800 dark:text-slate-100">Free Money</p>
                    </motion.div>
                    
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="flex flex-col items-center gap-3 p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl border-2 border-yellow-200 hover:shadow-xl transition-all"
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-2xl">MM</span>
                      </div>
                      <p className="font-bold text-slate-800 dark:text-slate-100">MTN Money</p>
                    </motion.div>
                  </div>
                  
                  <div className="mt-8 flex items-center justify-center gap-6 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-500" />
                      <span>Paiement instantané</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-500" />
                      <span>100% sécurisé</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-500" />
                      <span>Sans frais cachés</span>
                    </div>
                  </div>
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

export default Pricing;