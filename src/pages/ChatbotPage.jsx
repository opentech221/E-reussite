import React from 'react';
import { Helmet } from 'react-helmet';
import { Bot, User, Send, Sparkles } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const ChatbotPage = () => {
  const { toast } = useToast();

  const handleSendMessage = (e) => {
    e.preventDefault();
    toast({
      title: "🚧 Bientôt disponible",
      description: "Le chatbot est en cours de finalisation. Revenez bientôt ! 🚀",
    });
  };

  return (
    <>
      <Helmet>
        <title>Assistant IA - E-Réussite</title>
        <meta name="description" content="Discutez avec notre assistant IA pour obtenir de l'aide personnalisée." />
      </Helmet>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="pt-32 pb-20 px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="h-[70vh] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Sparkles className="w-8 h-8 text-primary" />
                  Assistant Pédagogique IA
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between overflow-y-auto">
                <div className="space-y-4 flex-1">
                  {/* Chat messages will go here */}
                  <div className="flex gap-3 justify-start">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0"><Bot size={22} /></div>
                    <div className="max-w-[80%] p-4 rounded-2xl bg-slate-100 text-slate-800 dark:text-slate-100 rounded-bl-none">
                      Bonjour ! Je suis votre assistant personnel. Posez-moi une question sur un cours, un exercice, ou demandez-moi de vous préparer un quiz sur un chapitre précis.
                    </div>
                  </div>
                </div>
                <form onSubmit={handleSendMessage} className="mt-4">
                  <div className="relative">
                    <Input
                      placeholder="Posez votre question ici..."
                      className="pr-12 h-12 text-base"
                    />
                    <Button type="submit" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9">
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </>
  );
};

export default ChatbotPage;