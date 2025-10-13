import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Book, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const ForgotPassword = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [messageSent, setMessageSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Email envoyé !",
        description: "Veuillez consulter votre boîte de réception pour réinitialiser votre mot de passe.",
      });
      setMessageSent(true);
    }
    setLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>Mot de passe oublié - E-Réussite</title>
        <meta name="description" content="Réinitialisez votre mot de passe E-Réussite." />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-slate-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="flex items-center justify-center space-x-2 mb-8">
            <Book className="w-10 h-10 text-primary" />
            <span className="text-3xl font-bold font-heading text-primary">E-Réussite</span>
          </Link>

          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">Mot de passe oublié</CardTitle>
              <CardDescription>
                Entrez votre email pour recevoir un lien de réinitialisation.
              </CardDescription>
            </CardHeader>

            <CardContent>
              {messageSent ? (
                <div className="text-center text-green-600">
                  <p>Un email a été envoyé à <strong>{email}</strong>. Veuillez suivre les instructions pour réinitialiser votre mot de passe.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-slate-700 mb-2 font-medium">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="votre@email.com"
                        className="pl-12"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary text-white hover:bg-primary/90"
                    disabled={loading}
                  >
                    {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
                  </Button>

                  <p className="text-center text-slate-500">
                    Vous vous souvenez de votre mot de passe ?{' '}
                    <Link to="/login" className="text-accent hover:underline font-semibold">
                      Se connecter
                    </Link>
                  </p>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default ForgotPassword;