import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Mail, Send, HelpCircle, MessageSquare, Facebook, Linkedin } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast({
      title: "Message envoyé ! ✉️",
      description: "Notre équipe vous répondra dans les plus brefs délais.",
    });
    setFormData({ name: '', email: '', message: '' });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleChatClick = () => {
    toast({
      title: "🚧 Bientôt disponible !",
      description: "Le chat en direct via WhatsApp sera bientôt disponible. 🚀",
    });
  };

  const faqItems = [
    {
      question: "Comment s'inscrire sur E-Réussite ?",
      answer: "Créez votre compte gratuitement, puis payez l'inscription unique de 1000 FCFA. Vous aurez un accès immédiat et illimité à vie à tous les cours BFEM/BAC et au Coach IA personnalisé !"
    },
    {
      question: "Quels sont les moyens de paiement acceptés ?",
      answer: "Nous acceptons les paiements mobiles sénégalais : Orange Money, Wave, Free Money et MTN Money. Paiement sécurisé et instantané."
    },
    {
      question: "L'inscription de 1000 FCFA est-elle vraiment unique ?",
      answer: "Oui, absolument ! Vous payez une seule fois 1000 FCFA et vous accédez à tout le contenu à vie. Pas d'abonnement mensuel, pas de frais cachés. C'est notre engagement pour rendre l'éducation accessible à tous."
    },
    {
      question: "Que se passe-t-il si j'ai des difficultés techniques ?",
      answer: "Notre équipe est disponible par email à contact@e-reussite.sn et bientôt sur WhatsApp. Nous nous engageons à vous accompagner jusqu'à la réussite !"
    }
  ];

  return (
    <>
      <Helmet>
        <title>Contact - Nous sommes à votre écoute | E-Réussite</title>
        <meta name="description" content="Contactez l'équipe E-Réussite. Questions sur l'inscription, les cours BFEM/BAC, ou besoin d'aide ? Nous sommes là pour vous accompagner." />
        <meta name="keywords" content="contact E-Réussite, aide BFEM, support BAC, orientation Sénégal" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-green-50/20 to-white dark:from-slate-900 dark:via-green-900/10 dark:to-slate-900">
        <Navbar />

        <section className="pt-32 pb-20 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full mb-6">
                <MessageSquare className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-green-700 dark:text-green-300 font-semibold">Nous sommes là pour vous</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold font-heading text-slate-900 dark:text-white mb-6">
                Parlons de votre <br />
                <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  réussite ensemble
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
                Une question sur l'inscription ? Besoin d'aide avec les cours ?<br />
                <span className="font-semibold text-green-600 dark:text-green-400">Notre équipe est à votre écoute et vous accompagne jusqu'à la réussite.</span>
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-5 gap-12 items-start">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="lg:col-span-3"
              >
                <Card className="shadow-2xl border-2 border-slate-200 dark:border-slate-700">
                  <CardContent className="p-8 md:p-12">
                    <h2 className="text-3xl font-bold font-heading text-slate-900 dark:text-white mb-6">Envoyez-nous un message</h2>
                    <p className="text-slate-600 dark:text-slate-300 mb-8">
                      Que vous ayez une question, une suggestion ou que vous rencontriez une difficulté, nous sommes là pour vous aider.
                    </p>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 mb-2 font-semibold">Nom complet *</label>
                        <Input 
                          name="name" 
                          value={formData.name} 
                          onChange={handleChange} 
                          placeholder="Votre nom complet" 
                          required 
                          className="border-2 border-slate-200 dark:border-slate-700 focus:border-green-500"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 mb-2 font-semibold">Email *</label>
                        <Input 
                          type="email" 
                          name="email" 
                          value={formData.email} 
                          onChange={handleChange} 
                          placeholder="votre.email@exemple.com" 
                          required 
                          className="border-2 border-slate-200 dark:border-slate-700 focus:border-green-500"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 mb-2 font-semibold">Message *</label>
                        <textarea 
                          name="message" 
                          value={formData.message} 
                          onChange={handleChange} 
                          placeholder="Décrivez votre question ou votre problème en détail..." 
                          required 
                          rows="6" 
                          className="flex w-full rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 resize-none" 
                        />
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-6 text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                      >
                        <Send className="w-5 h-5 mr-2" />
                        Envoyer le message
                      </Button>
                      
                      <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                        Nous vous répondrons dans les 24h ouvrables
                      </p>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="lg:col-span-2 space-y-8"
              >
                <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-green-200 dark:border-green-700 bg-gradient-to-br from-white to-green-50/30 dark:from-slate-800 dark:to-green-900/10">
                  <CardContent className="p-8">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                        <Mail className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold font-heading text-slate-900 dark:text-white">Email Officiel</h3>
                        <a href="mailto:contact@e-reussite.sn" className="text-green-600 dark:text-green-400 hover:underline font-semibold">
                          contact@e-reussite.sn
                        </a>
                      </div>
                    </div>
                    
                    <p className="text-slate-600 dark:text-slate-300 mb-4 text-sm">
                      Pour toute question urgente ou réclamation
                    </p>
                    
                    <div className="flex items-center space-x-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-sm text-slate-500 dark:text-slate-400">Suivez-nous :</span>
                      <a href="#" className="text-slate-500 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                        <Facebook className="w-6 h-6" />
                      </a>
                      <a href="#" className="text-slate-500 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                        <Linkedin className="w-6 h-6" />
                      </a>
                    </div>
                  </CardContent>
                </Card>

                <Button 
                  size="lg" 
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-6 font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105" 
                  onClick={handleChatClick}
                >
                  <MessageSquare className="w-6 h-6 mr-2" />
                  Discuter sur WhatsApp (Bientôt)
                </Button>

                <Card className="border-2 border-slate-200 dark:border-slate-700 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                      <HelpCircle className="text-green-600 dark:text-green-400" />
                      Questions Fréquentes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {faqItems.map((item, index) => (
                        <AccordionItem value={`item-${index}`} key={index}>
                          <AccordionTrigger className="text-left hover:text-green-600 dark:hover:text-green-400">
                            {item.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-slate-600 dark:text-slate-300">
                            {item.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Contact;