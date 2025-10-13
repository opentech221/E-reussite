import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookMarked, FileArchive, Cpu, Star, BookCopy, Atom, BrainCircuit, Globe, PenSquare, History, Heart, Users, Target, MapPin } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Home = () => {
  const advantages = [
    {
      icon: Heart,
      title: 'Coach IA Bienveillant',
      description: 'Un conseiller d\'orientation virtuel disponible 24h/24, qui comprend tes forces, tes faiblesses et les réalités éducatives africaines.'
    },
    {
      icon: Target,
      title: 'Orientation Personnalisée',
      description: 'Tests, plans de carrière sur mesure et exploration des opportunités : public, privé, auto-emploi et entrepreneuriat.'
    },
    {
      icon: MapPin,
      title: 'Accessible Partout',
      description: 'De Dakar à Tambacounda, de Kaffrine à Ziguinchor. Ton coach ne t\'abandonne jamais, même dans les zones les plus reculées.'
    },
  ];

  const impact = [
    {
      icon: Users,
      number: '1000+',
      label: 'Élèves accompagnés',
      description: 'Dans toutes les régions du Sénégal'
    },
    {
      icon: MapPin,
      number: '14',
      label: 'Régions couvertes',
      description: 'De Dakar à Kédougou'
    },
    {
      icon: Heart,
      number: '1000 FCFA',
      label: 'Inscription unique',
      description: 'Accès illimité à vie + 7 jours d\'essai gratuit'
    },
  ];

  const subjects = [
    { name: 'Mathématiques', icon: BookCopy },
    { name: 'Physique-Chimie', icon: Atom },
    { name: 'SVT', icon: Globe },
    { name: 'Français', icon: PenSquare },
    { name: 'Philosophie', icon: BrainCircuit },
    { name: 'Histoire-Géo', icon: History },
  ];

  const testimonials = [
    {
      name: 'Aminata D.',
      role: 'Élève, Kaffrine',
      comment: 'Avant E-réussite, je ne savais pas quelle filière choisir. Le coach IA m\'a aidée à découvrir mes forces en sciences et m\'a proposé un plan de carrière clair. Aujourd\'hui, je sais où je vais !',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1521294909285-a2b8c2c3a4ff'
    },
    {
      name: 'Moussa S.',
      role: 'Élève, Tambacounda',
      comment: 'Dans ma région, le conseiller d\'orientation ne passe qu\'une fois par an. Avec E-réussite, j\'ai un coach disponible tous les jours. C\'est comme avoir un mentor dans ma poche.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1609502851863-018b8b5b0d6b'
    },
    {
      name: 'Fatou N.',
      role: 'Élève, Ziguinchor',
      comment: 'Je me sentais perdue face à mon avenir. Grâce aux tests et aux conseils personnalisés, j\'ai compris mes talents et trouvé ma voie. Merci E-réussite !',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1596245499225-d2d8a4a5e3c3'
    }
  ];

  return (
    <>
      <Helmet>
        <title>E-Réussite - Soutien scolaire en ligne pour le BFEM et le BAC</title>
        <meta name="description" content="La meilleure plateforme de soutien scolaire en ligne pour la réussite au BFEM et au Baccalauréat au Sénégal et en Afrique francophone. Cours, exercices corrigés, annales et préparation aux examens." />
        <meta name="keywords" content="soutien scolaire, réussite scolaire Sénégal, préparation BFEM, préparation BAC, cours en ligne, e-learning Afrique, annales corrigées, E-Réussite" />
      </Helmet>

      <div className="min-h-screen bg-white">
        <Navbar />

        <section className="pt-32 pb-20 px-4 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center space-y-8"
            >
              <h1 className="text-5xl md:text-7xl font-bold font-heading text-slate-900">
                Réduire la distance entre <span className="text-primary">l'élève</span> et son <span className="text-primary">avenir</span>
              </h1>
              
              <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Parce qu'un élève de Tambacounda mérite les mêmes chances qu'un élève de Dakar. 
                Coach IA, orientation professionnelle, quiz interactifs : un accompagnement 24h/24, partout au Sénégal et en Afrique francophone.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link to="/signup">
                  <Button size="lg" className="bg-accent text-white hover:bg-accent/90 text-lg px-8 py-6">
                    Créer mon compte gratuit
                  </Button>
                </Link>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="mt-16"
              >
                <img alt="Un étudiant souriant utilisant un ordinateur portable pour ses études en ligne" className="rounded-2xl shadow-2xl mx-auto max-w-4xl w-full" src="https://images.unsplash.com/photo-1651796699702-7d5a8b04209f" />
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Section Pourquoi ce projet existe */}
        <section className="py-20 px-4 bg-gradient-to-b from-white to-slate-50">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-12"
            >
              <div className="text-center space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold font-heading text-slate-900">
                  🌍 Pourquoi <span className="text-primary">E-réussite</span> existe
                </h2>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                  Une réponse à une réalité éducative que beaucoup ignorent
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-12 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">Des centres KHP trop éloignés</h3>
                        <p className="text-slate-600 leading-relaxed">
                          Au Sénégal, chaque région dispose d'<strong>un seul centre d'orientation (KHP)</strong> pour accompagner des milliers d'élèves répartis sur plusieurs départements et communes.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                        <Users className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">Une visite par an seulement</h3>
                        <p className="text-slate-600 leading-relaxed">
                          Les conseillers ne passent qu'<strong>une fois par an</strong> dans les écoles, souvent en fin d'année. Ils rencontrent uniquement les élèves de <strong>troisième et terminale</strong>, au moment où ils doivent déjà faire des choix décisifs.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Heart className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">Aucun suivi continu</h3>
                        <p className="text-slate-600 leading-relaxed">
                          Après la visite : une fiche récapitulative des écoles et formations, puis plus rien. Les élèves se retrouvent <strong>seuls face à leurs doutes</strong>, leurs peurs et le manque d'informations fiables.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 space-y-6"
                >
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto rounded-full bg-primary flex items-center justify-center">
                      <Target className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">Notre Vision</h3>
                    <p className="text-lg text-slate-700 italic leading-relaxed">
                      "Et si chaque élève avait, à portée de main, son propre conseiller d'orientation — un conseiller qui le comprend, qui lui parle selon sa réalité, et qui reste disponible à tout moment ?"
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-6 space-y-4">
                    <h4 className="font-semibold text-slate-900 text-lg">💡 Notre Solution</h4>
                    <ul className="space-y-3 text-slate-600">
                      <li className="flex items-start gap-3">
                        <span className="text-primary font-bold">✓</span>
                        <span>Un <strong>coach numérique intelligent</strong> disponible 24h/24</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary font-bold">✓</span>
                        <span>Un accompagnement <strong>continu</strong> tout au long du parcours scolaire</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary font-bold">✓</span>
                        <span>Accessible <strong>partout</strong>, même dans les zones les plus reculées</span>
                      </li>
                    </ul>
                  </div>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                viewport={{ once: true }}
                className="bg-slate-900 text-white rounded-2xl p-8 md:p-12 text-center"
              >
                <blockquote className="text-2xl md:text-3xl font-bold font-heading italic mb-4">
                  "Réduire la distance entre l'élève et son avenir."
                </blockquote>
                <p className="text-slate-300 text-lg">
                  C'est cette conviction qui nous anime : mettre la technologie au service de l'équité, de l'orientation et de l'emploi.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Section Impact */}
        <section className="py-20 px-4 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold font-heading text-slate-900 mb-4">
                Notre <span className="text-primary">Impact</span> Social
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Chaque jour, nous rapprochons des jeunes de leurs rêves
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {impact.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="hover-lift h-full text-center border-2 border-primary/20">
                    <CardContent className="p-8 space-y-4">
                      <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                        <item.icon className="w-8 h-8 text-primary" />
                      </div>
                      <div className="text-4xl font-bold text-primary">{item.number}</div>
                      <h3 className="text-xl font-semibold font-heading text-slate-900">{item.label}</h3>
                      <p className="text-slate-500">{item.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold font-heading text-slate-900 mb-4">
                Ce que nous <span className="text-primary">offrons</span>
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Bien plus qu'une plateforme d'orientation : un compagnon de parcours
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {advantages.map((advantage, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="hover-lift h-full text-center border-l-4 border-l-primary">
                    <CardContent className="p-8 space-y-4">
                      <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                        <advantage.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold font-heading text-slate-900">{advantage.title}</h3>
                      <p className="text-slate-600 leading-relaxed">{advantage.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-4 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold font-heading text-slate-900 mb-4">
                Matières <span className="text-primary">principales</span>
              </h2>
              <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                Maîtrisez les matières essentielles pour réussir vos examens.
              </p>
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {subjects.map((subject, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  viewport={{ once: true }}
                >
                  <Card className="hover-lift">
                    <CardContent className="p-6 flex flex-col items-center justify-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <subject.icon className="w-6 h-6 text-primary" />
                      </div>
                      <p className="font-semibold font-heading text-slate-800">{subject.name}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold font-heading text-slate-900 mb-4">
                Ce que disent nos <span className="text-primary">élèves</span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="hover-lift h-full flex flex-col">
                    <CardContent className="p-6 space-y-4 flex-grow flex flex-col">
                      <div className="flex space-x-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-slate-600 italic flex-grow">"{testimonial.comment}"</p>
                      <div className="flex items-center gap-4 pt-4">
                        <img alt={`Portrait de ${testimonial.name}`} className="w-12 h-12 rounded-full object-cover" src="https://images.unsplash.com/photo-1635521071003-d9a00f967e0b" />
                        <div>
                          <p className="font-semibold font-heading text-slate-900">{testimonial.name}</p>
                          <p className="text-sm text-slate-500">{testimonial.role}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-4 bg-gradient-to-br from-primary to-accent">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center space-y-8 text-white"
            >
              <h2 className="text-4xl md:text-5xl font-bold font-heading">
                Prêt à découvrir ton potentiel ?
              </h2>
              <p className="text-xl md:text-2xl text-white/90 leading-relaxed max-w-2xl mx-auto">
                Rejoins des milliers d'élèves qui ont trouvé leur voie grâce à E-réussite. 
                <strong className="block mt-2">Que tu sois de Dakar, Tambacounda ou Ziguinchor, ton avenir commence ici.</strong>
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                <Link to="/signup">
                  <Button size="lg" className="bg-white text-primary hover:bg-slate-100 text-lg px-10 py-7 shadow-2xl">
                    Créer mon compte gratuit
                  </Button>
                </Link>
                <Link to="/about">
                  <Button size="lg" variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white/10 text-lg px-10 py-7">
                    En savoir plus
                  </Button>
                </Link>
              </div>
              <p className="text-white/80 text-sm">
                ✓ 100% gratuit · ✓ Sans engagement · ✓ Accessible partout
              </p>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Home;