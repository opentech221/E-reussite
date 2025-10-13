import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LifeBuoy, Book, MessageSquare } from 'lucide-react';

const Help = () => {
  const helpTopics = [
    {
      icon: LifeBuoy,
      title: "FAQ",
      description: "Trouvez des réponses rapides aux questions les plus fréquentes.",
      link: "/faq"
    },
    {
      icon: Book,
      title: "Guides d'utilisation",
      description: "Apprenez à utiliser toutes les fonctionnalités de la plateforme.",
      link: "/guides"
    },
    {
      icon: MessageSquare,
      title: "Nous Contacter",
      description: "Besoin d'une aide personnalisée ? Contactez notre support.",
      link: "/contact"
    }
  ];

  return (
    <>
      <Helmet>
        <title>Aide & Support - E-Réussite</title>
        <meta name="description" content="Centre d'aide de E-Réussite. Trouvez des guides, consultez la FAQ ou contactez notre support." />
      </Helmet>
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="pt-32 pb-20 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h1 className="text-5xl md:text-6xl font-bold font-heading text-slate-900 mb-6">
                Centre d'<span className="text-primary">Aide</span>
              </h1>
              <p className="text-xl text-slate-600">
                Comment pouvons-nous vous aider ?
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {helpTopics.map((topic, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                >
                  <Link to={topic.link}>
                    <Card className="text-center hover-lift h-full">
                      <CardHeader>
                        <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                          <topic.icon className="w-8 h-8 text-primary" />
                        </div>
                        <CardTitle>{topic.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-600">{topic.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Help;