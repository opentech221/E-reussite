import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Moon, 
  Sun, 
  Globe, 
  Lock, 
  Mail,
  Smartphone,
  Shield,
  Eye,
  EyeOff,
  Check,
  Save,
  LogOut,
  Trash2
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  
  // États pour les différentes sections
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    quiz: true,
    achievements: true,
    newsletter: false,
  });

  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [preferences, setPreferences] = useState({
    language: 'fr',
    timezone: 'Africa/Dakar',
    emailVisibility: 'public',
  });

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      setProfile(data);
      
      // Charger les préférences sauvegardées
      if (data.preferences) {
        const prefs = typeof data.preferences === 'string' 
          ? JSON.parse(data.preferences) 
          : data.preferences;
        
        if (prefs.notifications) setNotifications(prefs.notifications);
        if (prefs.language) setPreferences(prev => ({ ...prev, language: prefs.language }));
        if (prefs.timezone) setPreferences(prev => ({ ...prev, timezone: prefs.timezone }));
      }
    } catch (error) {
      console.error('Erreur chargement profil:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger vos paramètres.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      const updatedPreferences = {
        ...profile.preferences,
        notifications,
      };

      const { error } = await supabase
        .from('profiles')
        .update({ 
          preferences: updatedPreferences,
          updated_at: new Date(),
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: '✅ Préférences sauvegardées',
        description: 'Vos préférences de notifications ont été mises à jour.',
      });
    } catch (error) {
      console.error('Erreur sauvegarde notifications:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder vos préférences.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordForm.new !== passwordForm.confirm) {
      toast({
        title: 'Erreur',
        description: 'Les mots de passe ne correspondent pas.',
        variant: 'destructive',
      });
      return;
    }

    if (passwordForm.new.length < 6) {
      toast({
        title: 'Erreur',
        description: 'Le mot de passe doit contenir au moins 6 caractères.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.new,
      });

      if (error) throw error;

      toast({
        title: '✅ Mot de passe modifié',
        description: 'Votre mot de passe a été changé avec succès.',
      });

      // Réinitialiser le formulaire
      setPasswordForm({ current: '', new: '', confirm: '' });
    } catch (error) {
      console.error('Erreur changement mot de passe:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de changer le mot de passe.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      '⚠️ ATTENTION : Cette action est irréversible.\n\n' +
      'Êtes-vous sûr de vouloir supprimer définitivement votre compte ?\n\n' +
      'Toutes vos données (progression, badges, historique) seront perdues.'
    );

    if (!confirmed) return;

    const doubleConfirmed = window.confirm(
      '🔴 DERNIÈRE CONFIRMATION\n\n' +
      'Tapez OK pour confirmer la suppression définitive de votre compte.'
    );

    if (!doubleConfirmed) return;

    setSaving(true);
    try {
      // Supprimer le profil de la base de données
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (deleteError) throw deleteError;

      // Déconnecter l'utilisateur
      await signOut();
      
      toast({
        title: 'Compte supprimé',
        description: 'Votre compte a été supprimé avec succès.',
      });

      navigate('/');
    } catch (error) {
      console.error('Erreur suppression compte:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le compte. Contactez le support.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50 dark:from-slate-900 dark:via-purple-950/30 dark:to-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400 font-semibold">Chargement des paramètres...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Paramètres - E-Réussite</title>
        <meta name="description" content="Gérez vos paramètres de compte, notifications et préférences." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50 dark:from-slate-900 dark:via-purple-950/30 dark:to-slate-900 transition-colors duration-300">
        <Navbar />

        <section className="pt-32 pb-20 px-4">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-gradient-to-br from-primary to-accent rounded-2xl shadow-lg">
                  <SettingsIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold font-heading text-slate-900 dark:text-white">
                    Paramètres
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 text-lg">
                    Personnalisez votre expérience sur E-Réussite
                  </p>
                </div>
              </div>
            </motion.div>

            <div className="space-y-6">
              {/* Apparence */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Card className="border-2 border-slate-200 dark:border-slate-700 shadow-xl dark:bg-slate-800/50 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 border-b border-slate-200 dark:border-slate-700">
                    <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                      {isDark ? <Moon className="w-6 h-6 text-primary" /> : <Sun className="w-6 h-6 text-accent" />}
                      Apparence
                    </CardTitle>
                    <CardDescription className="dark:text-slate-400">
                      Choisissez le thème de l'interface
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-white'} border-2 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                          {isDark ? <Moon className="w-6 h-6 text-purple-400" /> : <Sun className="w-6 h-6 text-yellow-500" />}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {isDark ? 'Mode sombre' : 'Mode clair'}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {isDark ? 'Confortable pour les yeux la nuit' : 'Idéal pour la journée'}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={toggleTheme}
                        className="bg-gradient-to-r from-primary to-accent text-white hover:scale-105 transition-all duration-300"
                      >
                        Basculer vers {isDark ? 'clair' : 'sombre'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Notifications */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="border-2 border-slate-200 dark:border-slate-700 shadow-xl dark:bg-slate-800/50 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-b border-slate-200 dark:border-slate-700">
                    <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                      <Bell className="w-6 h-6 text-blue-500" />
                      Notifications
                    </CardTitle>
                    <CardDescription className="dark:text-slate-400">
                      Gérez vos préférences de notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    {[
                      { key: 'email', label: 'Notifications par email', icon: Mail },
                      { key: 'push', label: 'Notifications push', icon: Smartphone },
                      { key: 'quiz', label: 'Rappels de quiz', icon: Bell },
                      { key: 'achievements', label: 'Badges et réalisations', icon: Shield },
                      { key: 'newsletter', label: 'Newsletter hebdomadaire', icon: Mail },
                    ].map((item, index) => (
                      <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900/70 transition-colors">
                        <div className="flex items-center gap-3">
                          <item.icon className="w-5 h-5 text-primary" />
                          <span className="font-medium text-slate-900 dark:text-white">{item.label}</span>
                        </div>
                        <button
                          onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                          className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
                            notifications[item.key] 
                              ? 'bg-gradient-to-r from-green-400 to-green-600' 
                              : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                        >
                          <span
                            className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${
                              notifications[item.key] ? 'translate-x-7' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                    <Button
                      onClick={handleSaveNotifications}
                      disabled={saving}
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-xl transition-all"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? 'Enregistrement...' : 'Enregistrer les préférences'}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Sécurité et mot de passe */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Card className="border-2 border-slate-200 dark:border-slate-700 shadow-xl dark:bg-slate-800/50 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-b border-slate-200 dark:border-slate-700">
                    <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                      <Lock className="w-6 h-6 text-red-500" />
                      Sécurité
                    </CardTitle>
                    <CardDescription className="dark:text-slate-400">
                      Modifiez votre mot de passe
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="current-password" className="dark:text-slate-300">Mot de passe actuel</Label>
                        <div className="relative">
                          <Input
                            id="current-password"
                            type={showPasswords.current ? 'text' : 'password'}
                            value={passwordForm.current}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, current: e.target.value }))}
                            className="pr-10 dark:bg-slate-900/50 dark:border-slate-700 dark:text-white"
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                          >
                            {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="new-password" className="dark:text-slate-300">Nouveau mot de passe</Label>
                        <div className="relative">
                          <Input
                            id="new-password"
                            type={showPasswords.new ? 'text' : 'password'}
                            value={passwordForm.new}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, new: e.target.value }))}
                            className="pr-10 dark:bg-slate-900/50 dark:border-slate-700 dark:text-white"
                            placeholder="••••••••"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                          >
                            {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirm-password" className="dark:text-slate-300">Confirmer le nouveau mot de passe</Label>
                        <div className="relative">
                          <Input
                            id="confirm-password"
                            type={showPasswords.confirm ? 'text' : 'password'}
                            value={passwordForm.confirm}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm: e.target.value }))}
                            className="pr-10 dark:bg-slate-900/50 dark:border-slate-700 dark:text-white"
                            placeholder="••••••••"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                          >
                            {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white hover:shadow-xl transition-all"
                      >
                        <Lock className="w-4 h-4 mr-2" />
                        {saving ? 'Modification...' : 'Changer le mot de passe'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Zone de danger */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Card className="border-2 border-red-200 dark:border-red-900/50 shadow-xl dark:bg-slate-800/50 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/30 border-b border-red-200 dark:border-red-900/50">
                    <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                      <Trash2 className="w-6 h-6" />
                      Zone de danger
                    </CardTitle>
                    <CardDescription className="text-red-600 dark:text-red-400">
                      Actions irréversibles
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="p-4 bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-900/50 rounded-xl">
                      <h4 className="font-bold text-red-700 dark:text-red-400 mb-2">Supprimer mon compte</h4>
                      <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                        Cette action supprimera définitivement votre compte et toutes vos données. 
                        Cette action est <strong>irréversible</strong>.
                      </p>
                      <Button
                        onClick={handleDeleteAccount}
                        variant="destructive"
                        className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Supprimer définitivement mon compte
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Settings;
