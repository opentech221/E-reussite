import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Book, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const UpdatePassword = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // The user is in the password recovery flow
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      toast({
        title: "Erreur",
        description: updateError.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Mot de passe mis à jour !",
        description: "Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.",
      });
      navigate('/login');
    }
    setLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>Mettre à jour le mot de passe - E-Réussite</title>
        <meta name="description" content="Mettez à jour votre mot de passe E-Réussite." />
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
              <CardTitle className="text-3xl">Nouveau mot de passe</CardTitle>
              <CardDescription>
                Entrez votre nouveau mot de passe.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 mb-2 font-medium">Nouveau mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-12"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <Button
                  type="submit"
                  className="w-full bg-primary text-white hover:bg-primary/90"
                  disabled={loading}
                >
                  {loading ? 'Mise à jour...' : 'Mettre à jour'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default UpdatePassword;