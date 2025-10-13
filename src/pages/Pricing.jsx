import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Check, Heart, Sparkles, Shield, TrendingUp, Users, Lightbulb, Target, Wallet } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const Pricing = () => {
  const { toast } = useToast();

  const benefits = [
    'Accès illimité à vie à toutes les matières',
    'Coach IA personnalisé disponible 24h/24',
    'Suivi de progression en temps réel',
    'Toutes les annales et corrigés (BFEM & BAC)',
    'Quiz interactifs et exercices pratiques',
    'Examens blancs illimités',
    'Badges et système de gamification',
    'Support communautaire et entraide',
    'Certificats de réussite',
    'Mises à jour gratuites à vie',
  ];

  const reasons = [
    {
      icon: Shield,
      title: 'Un engagement mutuel',
      description: 'En investissant 1000 FCFA, vous montrez votre sérieux. Nous nous engageons en retour à vous accompagner jusqu\'à la réussite.',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Heart,
      title: 'Valoriser l\'opportunité',
      description: 'Ce qui est gratuit est souvent négligé. Un petit investissement symbolique vous rappelle la valeur de votre éducation.',
      gradient: 'from-pink-500 to-rose-500',
    },
    {
      icon: Target,
      title: 'Financer la mission',
      description: 'Ces frais permettent de maintenir les serveurs, améliorer la plateforme et créer plus de contenu de qualité pour vous.',
      gradient: 'from-purple-500 to-indigo-500',
    },
  ];

  const handleRegister = () => {
    toast({
      title: "🚀 Inscription bientôt disponible !",
      description: "L'inscription à 1000 FCFA sera disponible très prochainement avec les paiements mobiles.",
    });
  };

  return (
    <>
      <Helmet>
        <title>Inscription à 1000 FCFA - Accès à Vie | E-Réussite</title>
        <meta name="description" content="Inscription symbolique unique de 1000 FCFA pour un accès illimité à vie. Coach IA, cours BFEM/BAC, annales. Investissez dans votre avenir." />
        <meta name="keywords" content="inscription BFEM, frais BAC, 1000 FCFA, Orange Money, Wave, plateforme éducative Sénégal" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-slate-50 dark:from-slate-900 dark:via-green-900/10 dark:to-slate-900">
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
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-full mb-6 border border-green-500/20">
                <Sparkles className="w-5 h-5 text-green-600" />
                <span className="text-green-600 dark:text-green-400 font-semibold">Essai gratuit 7 jours • Puis 1000 FCFA unique</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold font-heading text-slate-900 dark:text-white mb-6">
                Testez gratuitement 7 jours<br />
                <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 bg-clip-text text-transparent">
                  puis 1000 FCFA pour un accès à vie
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
                <span className="font-semibold text-green-600 dark:text-green-400">Découvrez toutes les fonctionnalités sans engagement pendant 7 jours.</span><br />
                Si vous êtes convaincu, une inscription unique de 1000 FCFA vous donne un accès illimité à vie.
              </p>
            </motion.div>

            {/* Section Essai Gratuit 7 jours */}
            <div className="max-w-5xl mx-auto mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="border-4 border-blue-300 dark:border-blue-700 shadow-2xl shadow-blue-500/20 bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-slate-800 dark:via-blue-900/10 dark:to-slate-800 overflow-hidden">
                  <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl -z-10" />
                  
                  <CardContent className="p-8 md:p-12">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                      <div>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                          <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          <span className="text-blue-700 dark:text-blue-300 font-semibold text-sm">Sans engagement</span>
                        </div>
                        
                        <h2 className="text-3xl md:text-4xl font-bold font-heading text-slate-900 dark:text-white mb-4">
                          Testez gratuitement pendant 7 jours
                        </h2>
                        
                        <p className="text-lg text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                          Explorez toutes les fonctionnalités de la plateforme : cours complets, Coach IA, quiz interactifs, examens blancs. 
                          <span className="font-semibold text-blue-600 dark:text-blue-400"> Aucune carte bancaire requise.</span>
                        </p>
                        
                        <ul className="space-y-3 mb-6">
                          <li className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                            <span className="text-slate-700 dark:text-slate-300">Accès complet à tous les cours BFEM et BAC</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                            <span className="text-slate-700 dark:text-slate-300">Coach IA disponible 24h/24 pour vous guider</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                            <span className="text-slate-700 dark:text-slate-300">Quiz et examens blancs illimités</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                            <span className="text-slate-700 dark:text-slate-300">Aucune obligation après les 7 jours</span>
                          </li>
                        </ul>
                        
                        <Button 
                          onClick={handleRegister}
                          className="w-full md:w-auto px-10 py-6 text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105"
                        >
                          Commencer l'essai gratuit
                        </Button>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-blue-200 dark:border-blue-800 shadow-lg">
                          <div className="text-5xl font-black text-blue-600 dark:text-blue-400 mb-2">7 jours</div>
                          <div className="text-slate-600 dark:text-slate-300 font-semibold">d'essai gratuit</div>
                          <div className="text-sm text-slate-500 dark:text-slate-400 mt-2">Sans carte bancaire</div>
                        </div>
                        
                        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-2xl border-2 border-green-300 dark:border-green-700">
                          <div className="text-slate-700 dark:text-slate-300 font-semibold mb-1">Après l'essai :</div>
                          <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">1000 FCFA</div>
                          <div className="text-sm text-slate-600 dark:text-slate-300">Paiement unique • Accès à vie</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Carte principale d'inscription */}
            <div className="max-w-4xl mx-auto mb-20">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="border-4 border-green-300 dark:border-green-700 shadow-2xl shadow-green-500/20 bg-gradient-to-br from-white via-green-50/30 to-white dark:from-slate-800 dark:via-green-900/10 dark:to-slate-800 overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full blur-3xl -z-10" />
                  
                  <CardHeader className="text-center pb-8 pt-12">
                    <div className="mx-auto mb-6">
                      <div className="inline-flex p-6 rounded-3xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-2xl shadow-green-500/50">
                        <Wallet className="w-16 h-16 text-white" />
                      </div>
                    </div>
                    
                    <CardTitle className="text-4xl md:text-5xl font-bold mb-4">
                      Inscription Complète
                    </CardTitle>
                    <CardDescription className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                      Après l'essai gratuit : un seul paiement pour un accompagnement illimité jusqu'à votre réussite
                    </CardDescription>
                    
                    <div className="mt-8">
                      <div className="flex items-baseline justify-center gap-3">
                        <span className="text-7xl md:text-8xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                          1000
                        </span>
                        <span className="text-3xl font-semibold text-slate-600 dark:text-slate-300">FCFA</span>
                      </div>
                      <div className="text-green-600 dark:text-green-400 font-bold text-xl mt-3">
                        Accès illimité à vie ✨
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="px-8 pb-12">
                    {/* Avantages inclus */}
                    <div className="mb-10">
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">
                        Ce que vous obtenez :
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {benefits.map((benefit, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 0.4 + index * 0.05 }}
                            className="flex items-start gap-3 p-3 rounded-lg bg-green-50/50 dark:bg-green-900/10 border border-green-200 dark:border-green-800"
                          >
                            <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                            <span className="text-slate-700 dark:text-slate-300 text-sm leading-tight">{benefit}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* CTA Button */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.8 }}
                      className="text-center"
                    >
                      <Button 
                        onClick={handleRegister}
                        className="w-full md:w-auto px-12 py-7 text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-xl shadow-green-500/30 hover:shadow-2xl hover:shadow-green-500/40 transition-all duration-300 hover:scale-105"
                      >
                        <Wallet className="w-6 h-6 mr-2" />
                        M'inscrire maintenant
                      </Button>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
                        Paiement sécurisé via Orange Money, Wave, Free Money
                      </p>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Section "Pourquoi 1000 FCFA ?" */}
            <div className="mb-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1 }}
                className="text-center mb-12"
              >
                <h2 className="text-4xl md:text-5xl font-bold font-heading text-slate-900 dark:text-white mb-4">
                  Pourquoi demander 1000 FCFA ?
                </h2>
                <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                  Une contribution symbolique qui change tout
                </p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {reasons.map((reason, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.2 + index * 0.15 }}
                  >
                    <Card className="h-full border-2 border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                      <CardHeader className="text-center pb-6">
                        <div className="mx-auto mb-4">
                          <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${reason.gradient} shadow-lg`}>
                            <reason.icon className="w-8 h-8 text-white" />
                          </div>
                        </div>
                        <CardTitle className="text-xl font-bold">{reason.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-center">
                          {reason.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Section de comparaison avec KHP */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.6 }}
              className="mb-16"
            >
              <Card className="border-2 border-slate-200 dark:border-slate-700 shadow-xl bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
                <CardContent className="p-8 md:p-12">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full mb-4">
                        <Lightbulb className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        <span className="text-yellow-700 dark:text-yellow-300 font-semibold text-sm">Perspective</span>
                      </div>
                      <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                        Un investissement qui vaut plus que son prix
                      </h3>
                      <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                        Se rendre dans un centre KHP coûte souvent plus de 1000 FCFA en transport, 
                        pour une seule visite annuelle avec un conseiller débordé.
                      </p>
                      <p className="text-lg font-semibold text-green-600 dark:text-green-400 leading-relaxed">
                        Ici, 1000 FCFA vous donnent accès à un coach IA disponible 24h/24, 7j/7, 
                        pendant toute votre scolarité. C'est l'investissement le plus rentable 
                        que vous puissiez faire pour votre avenir.
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border-2 border-red-200 dark:border-red-800">
                        <h4 className="font-bold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          Centre KHP traditionnel
                        </h4>
                        <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                          <li>• Transport: 1000-3000 FCFA</li>
                          <li>• 1 visite/an seulement</li>
                          <li>• Conseiller surchargé (1 pour 500+ élèves)</li>
                          <li>• Temps d'attente: plusieurs heures</li>
                        </ul>
                      </div>
                      
                      <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border-2 border-green-300 dark:border-green-700">
                        <h4 className="font-bold text-green-700 dark:text-green-400 mb-2 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5" />
                          E-Réussite
                        </h4>
                        <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                          <li>• 1000 FCFA une seule fois</li>
                          <li>• Accès illimité à vie</li>
                          <li>• Coach IA personnalisé 24h/24</li>
                          <li>• Réponse instantanée, toujours disponible</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* FAQ / Transparence */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.8 }}
              className="text-center"
            >
              <Card className="border-2 border-slate-200 dark:border-slate-700 shadow-lg">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                    Notre promesse
                  </h3>
                  <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
                    Ces 1000 FCFA ne sont pas un abonnement mensuel ou des frais cachés. 
                    <span className="font-bold text-green-600 dark:text-green-400"> C'est un paiement unique</span> qui vous donne 
                    accès à toutes les fonctionnalités, pour toujours. Nous croyons que l'éducation 
                    doit être accessible, mais aussi valorisée. En investissant symboliquement dans 
                    votre avenir, vous montrez votre engagement envers votre réussite.
                  </p>
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