import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const FAQ = () => {
  const faqs = [
    {
      question: "Qu'est-ce que E-Réussite ?",
      answer: "E-Réussite est une plateforme de soutien scolaire en ligne conçue pour aider les élèves d'Afrique francophone à préparer et réussir leurs examens, notamment le BFEM et le Baccalauréat."
    },
    {
      question: "Comment puis-je m'inscrire ?",
      answer: "Cliquez simplement sur le bouton 'Inscription' en haut à droite, remplissez le formulaire avec votre nom, email et mot de passe, et vous aurez accès à nos ressources gratuites. Pour un accès complet, vous pouvez souscrire à un de nos abonnements."
    },
    {
      question: "Quels sont les moyens de paiement acceptés ?",
      answer: "Nous acceptons les principaux moyens de paiement mobile en Afrique de l'Ouest, comme Orange Money, Wave, Free Money, ainsi que les cartes bancaires classiques."
    },
    {
      question: "Puis-je utiliser la plateforme hors ligne ?",
      answer: "Oui ! Notre plateforme est une Progressive Web App (PWA), ce qui signifie que vous pouvez l'installer sur votre téléphone et accéder à certains contenus même sans connexion internet, à condition de les avoir téléchargés au préalable."
    },
    {
      question: "Le contenu est-il adapté au programme de mon pays ?",
      answer: "Notre contenu est principalement basé sur le programme officiel du Sénégal, qui est très similaire à celui de nombreux pays d'Afrique francophone. Nous travaillons à adapter plus spécifiquement le contenu pour d'autres pays."
    }
  ];

  return (
    <>
      <Helmet>
        <title>FAQ - E-Réussite</title>
        <meta name="description" content="Trouvez les réponses à vos questions sur E-Réussite, la plateforme de soutien scolaire pour le BFEM et le BAC." />
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
                Foire Aux <span className="text-primary">Questions</span>
              </h1>
              <p className="text-xl text-slate-600">
                Vous avez des questions ? Nous avons les réponses.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-lg font-semibold text-left">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-slate-600 text-base">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default FAQ;