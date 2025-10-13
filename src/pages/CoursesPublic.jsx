import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { BookOpen, BookCopy, Atom, Globe, PenSquare, History, BrainCircuit, Lock, ArrowRight, CheckCircle, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';

// Icon mapping pour les matières
const iconMap = {
  'Mathématiques': BookCopy,
  'Physique-Chimie': Atom,
  'SVT': Globe,
  'Français': PenSquare,
  'Histoire-Géographie': History,
  'Anglais': BookOpen,
  'Philosophie': BrainCircuit,
  default: BookOpen
};

// Données de démonstration pour la version publique
const coursesDemo = {
  bfem: [
    {
      id: 1,
      name: 'Mathématiques',
      description: 'Algèbre, Géométrie, Arithmétique',
      chaptersCount: 12,
      lessonsCount: 48,
      icon: 'Mathématiques',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 2,
      name: 'Physique-Chimie',
      description: 'Mécanique, Électricité, Chimie',
      chaptersCount: 10,
      lessonsCount: 40,
      icon: 'Physique-Chimie',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 3,
      name: 'SVT',
      description: 'Biologie, Géologie, Écologie',
      chaptersCount: 8,
      lessonsCount: 32,
      icon: 'SVT',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 4,
      name: 'Français',
      description: 'Grammaire, Conjugaison, Littérature',
      chaptersCount: 15,
      lessonsCount: 60,
      icon: 'Français',
      color: 'from-orange-500 to-red-500'
    }
  ],
  bac: [
    {
      id: 5,
      name: 'Mathématiques',
      description: 'Analyse, Algèbre, Probabilités',
      chaptersCount: 18,
      lessonsCount: 72,
      icon: 'Mathématiques',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 6,
      name: 'Philosophie',
      description: 'Métaphysique, Éthique, Logique',
      chaptersCount: 12,
      lessonsCount: 48,
      icon: 'Philosophie',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      id: 7,
      name: 'Histoire-Géographie',
      description: 'Histoire contemporaine, Géopolitique',
      chaptersCount: 14,
      lessonsCount: 56,
      icon: 'Histoire-Géographie',
      color: 'from-amber-500 to-orange-500'
    },
    {
      id: 8,
      name: 'Physique-Chimie',
      description: 'Physique moderne, Chimie organique',
      chaptersCount: 16,
      lessonsCount: 64,
      icon: 'Physique-Chimie',
      color: 'from-purple-500 to-pink-500'
    }
  ]
};

const features = [
  {
    icon: BookOpen,
    title: 'Cours complets',
    description: 'Programmes BFEM et BAC conformes au curriculum sénégalais'
  },
  {
    icon: Star,
    title: 'Quiz interactifs',
    description: 'Testez vos connaissances avec des exercices corrigés'
  },
  {
    icon: CheckCircle,
    title: 'Suivi personnalisé',
    description: 'Tableaux de bord avec statistiques de progression'
  }
];

const CoursesPublic = () => {
  const [activeLevel, setActiveLevel] = useState('bfem');

  const handleCourseClick = (e) => {
    e.preventDefault();
    // Scroll vers le CTA de connexion
    document.getElementById('cta-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <Helmet>
        <title>Nos Cours - BFEM & BAC | E-Réussite</title>
        <meta name="description" content="Découvrez tous nos cours BFEM et BAC. Mathématiques, Sciences, Lettres. Accès complet pour 1000 FCFA seulement." />
        <meta name="keywords" content="cours BFEM, cours BAC, Mathématiques Sénégal, Sciences, 1000 FCFA, orientation scolaire" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-green-50/20 to-white dark:from-slate-900 dark:via-green-900/10 dark:to-slate-900">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 dark:from-green-800 dark:via-emerald-800 dark:to-green-800 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading mb-6">
                Tous les cours dont vous avez besoin<br />
                <span className="text-green-200">pour réussir votre examen</span>
              </h1>
              <p className="text-xl md:text-2xl text-green-100 mb-8 max-w-3xl mx-auto leading-relaxed">
                Programmes BFEM et BAC conformes au curriculum officiel sénégalais.<br />
                <span className="font-semibold">Seulement 1000 FCFA pour un accès à vie !</span>
              </p>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-heading text-slate-900 dark:text-white mb-4">
                Tout ce qu'il faut pour réussir
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                Une plateforme complète pensée pour votre succès académique
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 hover:border-green-300 dark:hover:border-green-700 transition-all duration-300 hover:shadow-xl"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 mb-4 shadow-lg">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-600 dark:text-slate-300">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Courses Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Tabs value={activeLevel} onValueChange={setActiveLevel} className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
                <TabsTrigger value="bfem">BFEM</TabsTrigger>
                <TabsTrigger value="bac">BAC</TabsTrigger>
              </TabsList>

              <TabsContent value={activeLevel} className="space-y-4">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {coursesDemo[activeLevel].map((course, index) => {
                    const Icon = iconMap[course.icon] || iconMap.default;
                    
                    return (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card 
                          className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer group relative overflow-hidden"
                          onClick={handleCourseClick}
                        >
                          {/* Gradient Background */}
                          <div className={`absolute inset-0 bg-gradient-to-br ${course.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                          
                          {/* Lock Overlay */}
                          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-md">
                            <Lock className="w-5 h-5 text-slate-600" />
                          </div>

                          <CardHeader>
                            <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${course.color} mb-3`}>
                              <Icon className="w-8 h-8 text-white" />
                            </div>
                            <CardTitle className="text-xl">{course.name}</CardTitle>
                            <CardDescription>{course.description}</CardDescription>
                          </CardHeader>

                          <CardContent className="space-y-2">
                            <div className="flex items-center text-sm text-slate-600">
                              <BookOpen className="w-4 h-4 mr-2" />
                              <span>{course.chaptersCount} chapitres</span>
                            </div>
                            <div className="flex items-center text-sm text-slate-600">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              <span>{course.lessonsCount} leçons</span>
                            </div>

                            <Button 
                              variant="outline" 
                              className="w-full mt-4 group-hover:bg-primary group-hover:text-white transition-colors"
                            >
                              <Lock className="w-4 h-4 mr-2" />
                              Accéder au cours
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* CTA Section */}
        <section id="cta-section" className="py-20 bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 dark:from-green-800 dark:via-emerald-800 dark:to-green-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="inline-flex p-4 rounded-full bg-white/10 backdrop-blur-sm mb-4">
                <Lock className="w-12 h-12 text-white" />
              </div>
              
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-heading text-white">
                Testez gratuitement 7 jours<br />puis 1000 FCFA pour tout débloquer
              </h2>
              
              <p className="text-xl md:text-2xl text-green-100 max-w-2xl mx-auto leading-relaxed">
                <span className="font-bold">Essai gratuit sans engagement.</span> Puis inscription unique de 1000 FCFA.<br />
                Accès illimité à vie : tous les cours BFEM et BAC + Coach IA personnalisé 24h/24
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                <Link to="/pricing">
                  <Button size="lg" variant="secondary" className="text-lg px-10 py-7 font-bold shadow-2xl hover:scale-105 transition-transform">
                    Essayer gratuitement 7 jours
                    <ArrowRight className="ml-2 w-6 h-6" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="text-lg px-10 py-7 font-semibold bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm">
                    Déjà inscrit ? Se connecter
                  </Button>
                </Link>
              </div>

              <div className="grid sm:grid-cols-3 gap-4 pt-8 max-w-2xl mx-auto">
                <div className="text-white bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-200" />
                  <p className="text-sm font-semibold">Essai 7 jours gratuit</p>
                </div>
                <div className="text-white bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-200" />
                  <p className="text-sm font-semibold">Puis 1000 FCFA unique</p>
                </div>
                <div className="text-white bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-200" />
                  <p className="text-sm font-semibold">Accès à vie</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};

export default CoursesPublic;
