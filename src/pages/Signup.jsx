import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Book, User, Mail, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';

const Signup = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const { error } = await signUp(formData.email, formData.password, {
      data: {
        full_name: formData.name
      }
    });
    
    if (!error) {
      toast({
        title: "Inscription réussie ! 🎉",
        description: "Veuillez vérifier votre email pour confirmer votre compte.",
      });
      navigate('/login');
    }
    // Error toast is handled by the useAuth hook
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <>
      <Helmet>
        <title>Inscription - E-Réussite</title>
        <meta name="description" content="Créez votre compte E-Réussite et commencez votre parcours vers la réussite." />
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
              <CardTitle className="text-3xl">Créer un compte</CardTitle>
              <CardDescription>
                Rejoignez des milliers d'élèves et commencez à apprendre.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 mb-2 font-medium">Nom complet</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Votre nom"
                      className="pl-12"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-200 mb-2 font-medium">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="votre@email.com"
                      className="pl-12"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-200 mb-2 font-medium">Mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="pl-12"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-200 mb-2 font-medium">Confirmer le mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="pl-12"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="text-sm text-slate-500">
                  <label className="flex items-start">
                    <input type="checkbox" className="mr-2 mt-1 rounded border-slate-300 text-primary focus:ring-primary" required />
                    <span>
                      J'accepte les{' '}
                      <a href="#" className="text-primary hover:underline">
                        conditions d'utilisation
                      </a>.
                    </span>
                  </label>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-accent text-white hover:bg-accent/90"
                  disabled={loading}
                >
                  {loading ? 'Création du compte...' : 'S\'inscrire'}
                </Button>

                <p className="text-center text-slate-500">
                  Déjà un compte ?{' '}
                  <Link to="/login" className="text-primary hover:underline font-semibold">
                    Connectez-vous
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default Signup;