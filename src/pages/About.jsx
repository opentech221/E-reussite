import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Target, Eye, Heart, Users, Award } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const About = () => {
  const teamMembers = [
    { name: 'Dr. Cheikh Anta Diop', role: 'Fondateur & Directeur Pédagogique', image: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5' },
    { name: 'Mariama Ba', role: 'Responsable des Contenus', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330' },
    { name: 'Moussa Traoré', role: 'Développeur Principal', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d' },
  ];

  const partners = [
    { name: 'Ministère de l\'Éducation Nationale', logo: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7' },
    { name: 'Association des Professeurs de Maths', logo: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952' },
    { name: 'Lycée d\'Excellence', logo: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b' },
  ];

  return (
    <>
      <Helmet>
        <title>À Propos de E-Réussite - Notre Mission pour l'Éducation</title>
        <meta name="description" content="Découvrez la mission, la vision et l'équipe derrière E-Réussite, la plateforme dédiée à la réussite scolaire en Afrique francophone." />
        <meta name="keywords" content="mission E-Réussite, équipe E-Réussite, éducation Afrique, soutien scolaire" />
      </Helmet>

      <div className="min-h-screen bg-white">
        <Navbar />

        <section className="pt-32 pb-20 px-4 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h1 className="text-5xl md:text-6xl font-bold font-heading text-slate-900 mb-6">
                Notre <span className="text-primary">mission</span>
              </h1>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Rendre l'éducation de qualité accessible à chaque élève, partout en Afrique francophone, pour bâtir les leaders de demain.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 text-center">
              <Card className="hover-lift">
                <CardContent className="p-8">
                  <Target className="w-12 h-12 mx-auto text-primary mb-4" />
                  <h2 className="text-2xl font-bold font-heading mb-2">Mission</h2>
                  <p className="text-slate-600">Fournir des outils pédagogiques innovants et personnalisés pour la réussite au BFEM et au Baccalauréat.</p>
                </CardContent>
              </Card>
              <Card className="hover-lift">
                <CardContent className="p-8">
                  <Eye className="w-12 h-12 mx-auto text-primary mb-4" />
                  <h2 className="text-2xl font-bold font-heading mb-2">Vision</h2>
                  <p className="text-slate-600">Devenir la plateforme de référence pour le soutien scolaire en ligne, reconnue pour son excellence et son impact.</p>
                </CardContent>
              </Card>
              <Card className="hover-lift">
                <CardContent className="p-8">
                  <Heart className="w-12 h-12 mx-auto text-primary mb-4" />
                  <h2 className="text-2xl font-bold font-heading mb-2">Valeurs</h2>
                  <p className="text-slate-600">Excellence, Accessibilité, Innovation, Rigueur et Engagement envers la réussite de chaque élève.</p>
                </CardContent>
              </Card>
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
              <Users className="w-16 h-16 mx-auto text-primary mb-4" />
              <h2 className="text-4xl md:text-5xl font-bold font-heading text-slate-900">
                Notre <span className="text-primary">Équipe</span>
              </h2>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="text-center hover-lift">
                    <CardContent className="p-6">
                      <img alt={`Portrait de ${member.name}`} className="w-32 h-32 rounded-full mx-auto mb-4 object-cover shadow-lg" src="https://images.unsplash.com/photo-1589132012505-a2d7a7a39589" />
                      <h3 className="text-xl font-bold font-heading">{member.name}</h3>
                      <p className="text-primary font-semibold">{member.role}</p>
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
              <Award className="w-16 h-16 mx-auto text-primary mb-4" />
              <h2 className="text-4xl md:text-5xl font-bold font-heading text-slate-900">
                Nos <span className="text-primary">Partenaires</span>
              </h2>
              <p className="text-lg text-slate-600 mt-2">Nous collaborons avec des institutions de confiance pour garantir la qualité de notre enseignement.</p>
            </motion.div>
            <div className="flex flex-wrap justify-center items-center gap-x-16 gap-y-8">
              {partners.map((partner, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <img alt={`Logo de ${partner.name}`} className="h-16 object-contain grayscale hover:grayscale-0 transition-all duration-300" src="https://images.unsplash.com/photo-1566304660263-c15041ac11c0" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default About;