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
      question: "Comment s'inscrire aux cours ?",
      answer: "Cliquez sur le bouton 'Inscription' en haut à droite, remplissez le formulaire et choisissez votre abonnement. Vous aurez un accès immédiat !"
    },
    {
      question: "Quels sont les moyens de paiement acceptés ?",
      answer: "Nous acceptons les paiements par carte bancaire (Stripe), PayPal et bientôt par Mobile Money (Wave, Orange Money)."
    },
    {
      question: "Puis-je tester la plateforme avant de m'abonner ?",
      answer: "Oui ! Nous offrons un accès gratuit limité ainsi qu'un essai gratuit de 7 jours pour notre offre Premium."
    }
  ];

  return (
    <>
      <Helmet>
        <title>Contact - E-Réussite</title>
        <meta name="description" content="Contactez l'équipe E-Réussite pour toute question sur nos cours BFEM et Baccalauréat." />
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
                Contactez-<span className="text-primary">nous</span>
              </h1>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Une question ? Une suggestion ? Notre équipe est à votre écoute.
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-5 gap-12 items-start">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="lg:col-span-3"
              >
                <Card className="shadow-lg">
                  <CardContent className="p-8">
                    <h2 className="text-3xl font-bold font-heading mb-6">Envoyez-nous un message</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <label className="block text-slate-700 mb-2 font-medium">Nom complet</label>
                        <Input name="name" value={formData.name} onChange={handleChange} placeholder="Votre nom" required />
                      </div>

                      <div>
                        <label className="block text-slate-700 mb-2 font-medium">Email</label>
                        <Input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="votre@email.com" required />
                      </div>

                      <div>
                        <label className="block text-slate-700 mb-2 font-medium">Message</label>
                        <textarea name="message" value={formData.message} onChange={handleChange} placeholder="Votre message..." required rows="5" className="flex w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
                      </div>

                      <Button type="submit" className="w-full bg-accent text-white hover:bg-accent/90">
                        <Send className="w-4 h-4 mr-2" />
                        Envoyer le message
                      </Button>
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
                <Card className="hover-lift">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Mail className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold font-heading text-slate-900">Email Officiel</h3>
                        <a href="mailto:contact@e-reussite.sn" className="text-primary hover:underline">contact@e-reussite.sn</a>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <a href="#" className="text-slate-500 hover:text-primary"><Facebook /></a>
                      <a href="#" className="text-slate-500 hover:text-primary"><Linkedin /></a>
                    </div>
                  </CardContent>
                </Card>

                <Button size="lg" className="w-full bg-green-500 hover:bg-green-600 text-white" onClick={handleChatClick}>
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Discuter sur WhatsApp
                </Button>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HelpCircle className="text-primary" />
                      Mini-FAQ
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {faqItems.map((item, index) => (
                        <AccordionItem value={`item-${index}`} key={index}>
                          <AccordionTrigger>{item.question}</AccordionTrigger>
                          <AccordionContent>{item.answer}</AccordionContent>
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