import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookMarked, FileArchive, Cpu, Star, BookCopy, Atom, BrainCircuit, Globe, PenSquare, History } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Home = () => {
  const advantages = [
    {
      icon: BookMarked,
      title: 'Programme Officiel',
      description: 'Contenu 100% conforme au programme scolaire sénégalais.'
    },
    {
      icon: FileArchive,
      title: 'Annales Corrigées',
      description: 'Accédez à des années de sujets d\'examens avec corrections détaillées.'
    },
    {
      icon: Cpu,
      title: 'Assistance IA (Bientôt)',
      description: 'Un tuteur intelligent pour répondre à vos questions 24h/24.'
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
      name: 'Aminata Diallo',
      role: 'Élève, Mention Très Bien au BFEM',
      comment: 'Grâce à E-Réussite, j\'ai obtenu mon BFEM avec mention Très Bien ! Les cours sont clairs et les professeurs très disponibles.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1521294909285-a2b8c2c3a4ff'
    },
    {
      name: 'Moussa Sow',
      role: 'Élève, Admis au Bac S',
      comment: 'La plateforme est géniale ! J\'ai pu réviser à mon rythme et les exercices m\'ont vraiment aidé à progresser en maths.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1609502851863-018b8b5b0d6b'
    },
    {
      name: 'Fatou Ndiaye',
      role: 'Élève en Terminale L',
      comment: 'Je recommande vivement E-Réussite. Le suivi personnalisé fait toute la différence dans ma préparation au Bac.',
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
                Ta <span className="text-primary">réussite scolaire</span> commence ici.
              </h1>
              
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Cours, exercices corrigés et sujets d’examens à portée de clic.
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
                Les <span className="text-primary">avantages</span> E-Réussite
              </h2>
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
                  <Card className="hover-lift h-full text-center">
                    <CardContent className="p-8 space-y-4">
                      <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                        <advantage.icon className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold font-heading text-slate-900">{advantage.title}</h3>
                      <p className="text-slate-500">{advantage.description}</p>
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

        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="bg-primary text-white border-0">
                <CardContent className="p-12 text-center space-y-6">
                  <h2 className="text-4xl font-bold font-heading">
                    Prêt à transformer votre avenir ?
                  </h2>
                  <p className="text-lg text-white/90">
                    Rejoignez E-Réussite aujourd'hui et mettez toutes les chances de votre côté.
                  </p>
                  <Link to="/signup">
                    <Button size="lg" className="bg-accent text-white hover:bg-accent/90 text-lg px-8 py-6">
                      S'inscrire maintenant
                    </Button>
                  </Link>
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

export default Home;