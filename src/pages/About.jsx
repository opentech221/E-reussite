import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Target, Eye, Heart, Users, Award, MapPin, BookOpen, Sparkles, Lightbulb, Rocket, School, AlertCircle, CheckCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';

const About = () => {
  const problemPoints = [
    {
      icon: MapPin,
      title: 'Centres KHP trop éloignés',
      description: 'Un seul centre par région pour des milliers d\'élèves. Les conseillers ne passent qu\'une fois par an.'
    },
    {
      icon: School,
      title: 'Accompagnement insuffisant',
      description: 'Élèves de 3ème et Terminale uniquement. Aucun suivi continu après la visite.'
    },
    {
      icon: AlertCircle,
      title: 'Choix d\'orientation par défaut',
      description: 'Beaucoup d\'élèves choisissent leur orientation par hasard, sous influence ou faute d\'informations.'
    },
  ];

  const solutionPoints = [
    {
      icon: Heart,
      title: 'Coach IA disponible 24h/24',
      description: 'Un conseiller virtuel qui ne dort jamais et reste à tes côtés tout au long de ton parcours.'
    },
    {
      icon: Target,
      title: 'Accompagnement personnalisé',
      description: 'Tests, plans de carrière sur mesure, découverte de tes talents dès la 6ème.'
    },
    {
      icon: CheckCircle,
      title: 'Équité territoriale',
      description: 'Que tu sois à Dakar, Kaffrine ou Tambacounda, tu as accès au même niveau d\'accompagnement.'
    },
  ];

  const values = [
    {
      icon: Heart,
      title: 'Bienveillance',
      description: 'Nous croyons en chaque élève et en son potentiel unique.'
    },
    {
      icon: Users,
      title: 'Équité',
      description: 'Mêmes chances pour tous, peu importe la région ou l\'origine sociale.'
    },
    {
      icon: Lightbulb,
      title: 'Innovation',
      description: 'L\'IA au service de l\'humain pour démocratiser l\'orientation.'
    },
    {
      icon: Rocket,
      title: 'Impact Social',
      description: 'Réduire la distance entre l\'élève et son avenir, une région à la fois.'
    },
  ];

  return (
    <>
      <Helmet>
        <title>À Propos - Pourquoi E-Réussite Existe | Notre Mission</title>
        <meta name="description" content="Découvrez l'histoire derrière E-Réussite : comment nous réduisons la distance entre l'élève et son avenir en démocratisant l'orientation scolaire au Sénégal et en Afrique francophone." />
        <meta name="keywords" content="mission E-Réussite, orientation scolaire Sénégal, centres KHP, équité éducative, coach IA" />
      </Helmet>

      <div className="min-h-screen bg-white">
        <Navbar />

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-slate-50 to-white">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h1 className="text-5xl md:text-6xl font-bold font-heading text-slate-900 mb-6">
                Pourquoi <span className="text-primary">E-Réussite</span> existe
              </h1>
              <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
                L'idée de cette plateforme m'est venue d'un constat simple, mais profondément marquant. 
                Au Sénégal, les <strong>centres d'orientation scolaire (KHP)</strong> existent, 
                mais ils restent <strong>trop éloignés des élèves</strong>.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Le Problème Section */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
              <h2 className="text-4xl md:text-5xl font-bold font-heading text-slate-900 mb-6">
                Le <span className="text-red-500">constat</span>
              </h2>
              <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                Chaque région ne dispose que d'<strong>un seul centre KHP</strong>, pour plusieurs départements, 
                communes et établissements. Résultat : un nombre limité d'agents essaient d'accompagner des milliers d'élèves.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {problemPoints.map((point, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="hover-lift h-full border-red-100">
                    <CardContent className="p-8 space-y-4">
                      <div className="w-16 h-16 mx-auto rounded-full bg-red-50 flex items-center justify-center">
                        <point.icon className="w-8 h-8 text-red-500" />
                      </div>
                      <h3 className="text-xl font-semibold font-heading text-slate-900 text-center">{point.title}</h3>
                      <p className="text-slate-600 text-center">{point.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg max-w-4xl mx-auto"
            >
              <p className="text-lg text-slate-700 italic">
                "Les conseillers ne passent qu'<strong>une fois par an</strong> dans les écoles, 
                souvent à la fin de l'année. Ils rencontrent uniquement les élèves de <strong>troisième</strong> et 
                de <strong>terminale</strong>. Mais comment, en une seule visite, un élève peut-il vraiment découvrir 
                ses talents et faire un choix réfléchi ? C'est presque impossible."
              </p>
            </motion.div>
          </div>
        </section>

        {/* Ma Vision Section */}
        <section className="py-20 px-4 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <Lightbulb className="w-16 h-16 mx-auto text-primary mb-4" />
              <h2 className="text-4xl md:text-5xl font-bold font-heading text-slate-900 mb-6">
                Ma <span className="text-primary">vision</span>
              </h2>
              <div className="max-w-3xl mx-auto space-y-6 text-lg text-slate-600">
                <p>
                  Je me suis longtemps dit :
                </p>
                <blockquote className="text-2xl font-heading italic text-primary border-l-4 border-primary pl-6 my-8">
                  "Et si chaque élève avait, à portée de main, son propre conseiller d'orientation — 
                  un conseiller qui le comprend, qui lui parle selon sa réalité, et qui reste disponible à tout moment ?"
                </blockquote>
                <p>
                  L'État aurait pu créer un bureau d'orientation dans chaque établissement, c'est vrai. 
                  Mais aujourd'hui, <strong>le digital et l'intelligence artificielle</strong> nous permettent d'aller encore plus loin.
                </p>
                <p className="font-semibold text-slate-900">
                  C'est ainsi qu'est née l'idée d'un <span className="text-primary">coach numérique intelligent</span>, 
                  un conseiller virtuel capable d'accompagner chaque élève tout au long de son parcours scolaire.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* La Solution Section */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
              <h2 className="text-4xl md:text-5xl font-bold font-heading text-slate-900 mb-6">
                La <span className="text-green-500">solution</span>
              </h2>
              <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                Un coach qui ne remplace pas les humains, mais qui <strong>étend leur portée</strong>. 
                Disponible 24h/24, partout, même dans les zones les plus reculées.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {solutionPoints.map((point, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="hover-lift h-full border-green-100">
                    <CardContent className="p-8 space-y-4">
                      <div className="w-16 h-16 mx-auto rounded-full bg-green-50 flex items-center justify-center">
                        <point.icon className="w-8 h-8 text-green-500" />
                      </div>
                      <h3 className="text-xl font-semibold font-heading text-slate-900 text-center">{point.title}</h3>
                      <p className="text-slate-600 text-center">{point.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Nos Valeurs Section */}
        <section className="py-20 px-4 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <Heart className="w-16 h-16 mx-auto text-primary mb-4" />
              <h2 className="text-4xl md:text-5xl font-bold font-heading text-slate-900 mb-6">
                Nos <span className="text-primary">valeurs</span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="hover-lift h-full text-center">
                    <CardContent className="p-8 space-y-4">
                      <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                        <value.icon className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold font-heading text-slate-900">{value.title}</h3>
                      <p className="text-slate-600">{value.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* L'Impact Visé Section */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <Rocket className="w-16 h-16 mx-auto text-primary mb-4" />
              <h2 className="text-4xl md:text-5xl font-bold font-heading text-slate-900 mb-6">
                L'<span className="text-primary">impact</span> que nous visons
              </h2>
              <div className="max-w-4xl mx-auto space-y-6 text-lg text-slate-600">
                <p>
                  Mon rêve, c'est qu'un élève de <strong>Kaffrine</strong>, de <strong>Tambacounda</strong>, 
                  de <strong>Ziguinchor</strong> ou de <strong>Saint-Louis</strong> ait <strong>les mêmes chances d'accompagnement</strong> qu'un élève de Dakar.
                </p>
                <p>
                  Qu'un jeune de 17 ans puisse trouver sa voie, non pas par hasard, 
                  mais parce qu'il a été <strong>guidé, écouté et inspiré</strong>.
                </p>
                <blockquote className="text-2xl font-heading italic text-primary border-l-4 border-primary pl-6 my-8">
                  "Je sais qui je suis, je sais où je vais, et je sais comment y arriver."
                </blockquote>
                <p className="font-semibold text-slate-900">
                  C'est cette conviction qui m'anime : <span className="text-primary">réduire la distance entre l'élève et son avenir.</span>
                </p>
                <p>
                  Mettre la technologie au service de l'équité, de l'orientation et de l'emploi. 
                  Et bâtir, petit à petit, <strong>une génération de jeunes africains conscients de leur potentiel, et acteurs de leur réussite.</strong>
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="mt-12"
            >
              <Card className="bg-gradient-to-r from-primary to-accent text-white border-0">
                <CardContent className="p-12 text-center space-y-6">
                  <MapPin className="w-16 h-16 mx-auto" />
                  <h3 className="text-3xl font-bold font-heading">
                    Rejoignez le mouvement
                  </h3>
                  <p className="text-lg text-white/90 max-w-2xl mx-auto">
                    Ensemble, réduisons la distance entre chaque élève et son avenir. 
                    De Dakar à Kédougou, construisons l'équité éducative.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <a href="/signup">
                      <button className="bg-white text-primary hover:bg-slate-100 font-semibold px-8 py-3 rounded-lg transition-colors">
                        Commencer gratuitement
                      </button>
                    </a>
                    <a href="/contact">
                      <button className="border-2 border-white text-white hover:bg-white/10 font-semibold px-8 py-3 rounded-lg transition-colors">
                        Nous contacter
                      </button>
                    </a>
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

export default About;