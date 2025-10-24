import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { User, Edit, BookOpen, Save, Crown, Calendar, Mail, GraduationCap, Award, Settings, CheckCircle2, CreditCard, Clock, CheckCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSubscription } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';
import ProfileOrientationSection from '@/components/profile/ProfileOrientationSection';

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ 
    full_name: '', 
    level: '', 
    parcours: '',
    financial_situation: '',
    network_support: '',
    religious_values: '',
    academic_level: ''
  });
  
  // Hook pour gérer l'abonnement
  const { subscription, loading: subscriptionLoading } = useSubscription();

  const fetchProfileData = async () => {
    if (user) {
      setLoading(true);
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        toast({ title: 'Erreur de profil', description: profileError.message, variant: 'destructive' });
      } else {
        setProfile(profileData);
        setFormData({
          full_name: profileData.full_name || '',
          level: profileData.level || '',
          parcours: profileData.parcours || '',
          financial_situation: profileData.financial_situation || '',
          network_support: profileData.network_support || '',
          religious_values: profileData.religious_values || '',
          academic_level: profileData.academic_level || ''
        });
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [user, toast]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: formData.full_name,
        level: formData.level,
        parcours: formData.parcours,
        financial_situation: formData.financial_situation,
        network_support: formData.network_support,
        religious_values: formData.religious_values,
        academic_level: formData.academic_level,
        updated_at: new Date(),
      })
      .eq('id', user.id);

    if (error) {
      toast({ title: 'Erreur de mise à jour', description: error.message, variant: 'destructive' });
    } else {
      toast({ 
        title: '✅ Profil mis à jour !', 
        description: 'Vos informations ont été enregistrées avec succès.',
      });
      await fetchProfileData();
      setIsEditing(false);
    }
  };

  const getSubscriptionBadge = (subscription) => {
    const badges = {
      premium: { color: 'from-yellow-400 to-orange-500', icon: Crown, label: 'Premium' },
      standard: { color: 'from-blue-400 to-cyan-500', icon: Award, label: 'Standard' },
      free: { color: 'from-slate-400 to-slate-500', icon: User, label: 'Gratuit' },
    };
    return badges[subscription] || badges.free;
  };

  /**
   * Obtenir le badge d'abonnement basé sur le statut réel
   */
  const getSubscriptionStatus = () => {
    if (!subscription || !subscription.has_subscription) {
      return {
        color: 'from-slate-400 to-slate-500',
        icon: User,
        label: 'Aucun abonnement',
        status: 'none'
      };
    }

    if (subscription.status === 'trial') {
      return {
        color: 'from-blue-400 to-cyan-500',
        icon: Clock,
        label: `Essai (${subscription.days_remaining} jours)`,
        status: 'trial',
        daysRemaining: subscription.days_remaining
      };
    }

    if (subscription.status === 'active') {
      return {
        color: 'from-green-400 to-emerald-500',
        icon: CheckCircle,
        label: 'Accès illimité',
        status: 'active',
        paymentMethod: subscription.payment_method
      };
    }

    if (subscription.status === 'expired') {
      return {
        color: 'from-red-400 to-orange-500',
        icon: Clock,
        label: 'Expiré',
        status: 'expired'
      };
    }

    return {
      color: 'from-slate-400 to-slate-500',
      icon: User,
      label: 'Inactif',
      status: 'inactive'
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300 font-semibold">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50">
        <div className="text-center">
          <User className="w-24 h-24 text-slate-300 mx-auto mb-4" />
          <p className="text-xl text-slate-600 dark:text-slate-300">Profil non trouvé.</p>
        </div>
      </div>
    );
  }

  // Utiliser le statut réel de l'abonnement
  const subscriptionStatus = getSubscriptionStatus();
  const subscriptionBadge = getSubscriptionBadge(profile?.subscription);

  return (
    <>
      <Helmet>
        <title>Mon Profil - E-Réussite</title>
        <meta name="description" content="Gérez votre profil, abonnement et historique de commandes sur E-Réussite." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50">
        <Navbar />

        <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-900">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4"
            >
              <div>
                <h1 className="text-4xl md:text-5xl font-bold font-heading text-slate-900 dark:text-white mb-2 flex items-center gap-3">
                  <Settings className="w-10 h-10 text-primary dark:text-blue-400" />
                  Mon Profil
                </h1>
                <p className="text-slate-600 dark:text-slate-300 text-lg">
                  Gérez vos informations personnelles et votre activité.
                </p>
              </div>
              <Button 
                onClick={() => setIsEditing(!isEditing)}
                className={isEditing ? 'border-red-200 text-red-600 hover:bg-red-50' : 'bg-gradient-to-r from-primary to-accent text-white shadow-lg'}
                variant={isEditing ? 'outline' : 'default'}
              >
                {isEditing ? (
                  <>Annuler</>
                ) : (
                  <>
                    <Edit className="w-4 h-4 mr-2" /> Modifier le profil
                  </>
                )}
              </Button>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Carte profil */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="lg:col-span-1"
              >
                <Card className="border-2 border-primary/20 shadow-xl dark:bg-slate-800 dark:border-white/30 dark:shadow-[0_0_40px_rgba(255,255,255,0.5)] overflow-hidden">
                  <div className="relative bg-gradient-to-br from-primary via-accent to-primary p-8 text-center">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="relative">
                      <div className="w-32 h-32 mx-auto mb-4 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-2xl ring-4 ring-white/50 dark:ring-white/20">
                        <User className="w-16 h-16 text-primary" />
                      </div>
                      <h2 className="text-2xl font-bold text-white mb-1">{profile.full_name || 'Utilisateur'}</h2>
                      <div className="flex items-center justify-center gap-2 text-white/90 text-sm mb-4">
                        <Mail className="w-4 h-4" />
                        <span>{user.email}</span>
                      </div>
                      
                      {/* Badge abonnement réel basé sur subscription */}
                      {!subscriptionLoading && (
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${subscriptionStatus.color} text-white font-bold shadow-lg`}>
                          <subscriptionStatus.icon className="w-5 h-5" />
                          {subscriptionStatus.label}
                        </div>
                      )}
                      {subscriptionLoading && (
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-400 text-white font-bold shadow-lg">
                          <Clock className="w-5 h-5 animate-spin" />
                          Chargement...
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
                      <Calendar className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-xs text-slate-500">Membre depuis</p>
                        <p className="font-semibold">{new Date(user.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
                      <GraduationCap className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-xs text-slate-500">Niveau</p>
                        <p className="font-semibold">{profile.level || 'Non défini'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
                      <BookOpen className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-xs text-slate-500">Parcours</p>
                        <p className="font-semibold">{profile.parcours || 'Non défini'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Informations et commandes */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="lg:col-span-2 space-y-8"
              >
                {/* Informations personnelles */}
                <Card className="border-2 border-slate-200 shadow-lg dark:bg-slate-800 dark:border-white/20 dark:shadow-[0_0_30px_rgba(255,255,255,0.4)] overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 border-b border-slate-200 dark:border-slate-700">
                    <CardTitle className="flex items-center gap-2 text-xl dark:text-white">
                      <BookOpen className="w-6 h-6 text-primary" /> 
                      Informations personnelles
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {isEditing ? (
                      <form onSubmit={handleUpdateProfile} className="space-y-5">
                        <div className="space-y-2">
                          <Label htmlFor="full_name" className="text-slate-700 dark:text-slate-200 font-semibold">Nom complet</Label>
                          <Input 
                            id="full_name" 
                            name="full_name" 
                            value={formData.full_name} 
                            onChange={handleInputChange}
                            className="border-slate-300 focus:border-primary focus:ring-primary"
                            placeholder="Votre nom complet"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="level" className="text-slate-700 dark:text-slate-200 font-semibold">Niveau</Label>
                          <Input 
                            id="level" 
                            name="level" 
                            value={formData.level} 
                            onChange={handleInputChange}
                            className="border-slate-300 focus:border-primary focus:ring-primary"
                            placeholder="Ex: Terminale, 3ème, Licence 2..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="parcours" className="text-slate-700 dark:text-slate-200 font-semibold">Parcours</Label>
                          <Input 
                            id="parcours" 
                            name="parcours" 
                            value={formData.parcours} 
                            onChange={handleInputChange}
                            className="border-slate-300 focus:border-primary focus:ring-primary"
                            placeholder="Ex: BAC S, BFEM, Licence Informatique..."
                          />
                        </div>

                        {/* Nouveaux champs socio-économiques */}
                        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">
                            📊 Contexte socio-économique (pour orientation)
                          </h3>
                          
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="academic_level" className="text-slate-700 dark:text-slate-200">Niveau académique</Label>
                              <select
                                id="academic_level"
                                name="academic_level"
                                value={formData.academic_level}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-primary focus:ring-primary dark:bg-slate-800 dark:border-slate-600"
                              >
                                <option value="">Sélectionner...</option>
                                <option value="bfem">BFEM</option>
                                <option value="bac">BAC</option>
                                <option value="bac+2">BAC+2</option>
                                <option value="bac+3">BAC+3 (Licence)</option>
                                <option value="bac+5">BAC+5 (Master)</option>
                                <option value="doctorat">Doctorat</option>
                              </select>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="financial_situation" className="text-slate-700 dark:text-slate-200">Situation financière</Label>
                              <select
                                id="financial_situation"
                                name="financial_situation"
                                value={formData.financial_situation}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-primary focus:ring-primary dark:bg-slate-800 dark:border-slate-600"
                              >
                                <option value="">Sélectionner...</option>
                                <option value="low">Contraintes élevées</option>
                                <option value="medium">Situation modérée</option>
                                <option value="high">À l'aise financièrement</option>
                              </select>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="network_support" className="text-slate-700 dark:text-slate-200">Réseau professionnel</Label>
                              <select
                                id="network_support"
                                name="network_support"
                                value={formData.network_support}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-primary focus:ring-primary dark:bg-slate-800 dark:border-slate-600"
                              >
                                <option value="">Sélectionner...</option>
                                <option value="strong">Réseau fort</option>
                                <option value="moderate">Réseau limité</option>
                                <option value="weak">Peu/pas de réseau</option>
                              </select>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="religious_values" className="text-slate-700 dark:text-slate-200">Importance valeurs religieuses</Label>
                              <select
                                id="religious_values"
                                name="religious_values"
                                value={formData.religious_values}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-primary focus:ring-primary dark:bg-slate-800 dark:border-slate-600"
                              >
                                <option value="">Sélectionner...</option>
                                <option value="very_important">Très important</option>
                                <option value="important">Important</option>
                                <option value="neutral">Neutre</option>
                                <option value="not_important">Pas important</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <Button 
                          type="submit"
                          className="w-full bg-gradient-to-r from-primary to-accent text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                        >
                          <Save className="w-4 h-4 mr-2" /> Enregistrer les modifications
                        </Button>
                      </form>
                    ) : (
                      <div className="space-y-5">
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                          <span className="text-slate-600 dark:text-slate-300 font-medium">Nom complet</span>
                          <span className="font-bold text-slate-900 dark:text-white">{profile.full_name || 'Non défini'}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                          <span className="text-slate-600 dark:text-slate-300 font-medium">Niveau</span>
                          <span className="font-bold text-slate-900 dark:text-white">{profile.level || 'Non défini'}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                          <span className="text-slate-600 dark:text-slate-300 font-medium">Parcours</span>
                          <span className="font-bold text-slate-900 dark:text-white">{profile.parcours || 'Non défini'}</span>
                        </div>

                        {/* Affichage contexte socio-économique si renseigné */}
                        {(profile.academic_level || profile.financial_situation || profile.network_support || profile.religious_values) && (
                          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">
                              📊 Contexte socio-économique
                            </h4>
                            <div className="space-y-3">
                              {profile.academic_level && (
                                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                  <span className="text-sm text-slate-600 dark:text-slate-300">Niveau académique</span>
                                  <span className="text-sm font-semibold text-slate-900 dark:text-white capitalize">
                                    {profile.academic_level.replace('+', ' +')}
                                  </span>
                                </div>
                              )}
                              {profile.financial_situation && (
                                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                  <span className="text-sm text-slate-600 dark:text-slate-300">Situation financière</span>
                                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                    {profile.financial_situation === 'low' ? 'Contraintes élevées' :
                                     profile.financial_situation === 'medium' ? 'Situation modérée' :
                                     'À l\'aise'}
                                  </span>
                                </div>
                              )}
                              {profile.network_support && (
                                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                  <span className="text-sm text-slate-600 dark:text-slate-300">Réseau professionnel</span>
                                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                    {profile.network_support === 'strong' ? 'Fort' :
                                     profile.network_support === 'moderate' ? 'Limité' :
                                     'Faible'}
                                  </span>
                                </div>
                              )}
                              {profile.religious_values && (
                                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                  <span className="text-sm text-slate-600 dark:text-slate-300">Valeurs religieuses</span>
                                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                    {profile.religious_values === 'very_important' ? 'Très important' :
                                     profile.religious_values === 'important' ? 'Important' :
                                     profile.religious_values === 'neutral' ? 'Neutre' :
                                     'Pas important'}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Carte Abonnement */}
                <Card className="border-2 border-slate-200 shadow-lg dark:bg-slate-800 dark:border-white/20 dark:shadow-[0_0_30px_rgba(255,255,255,0.4)] overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 border-b border-slate-200 dark:border-slate-700">
                    <CardTitle className="flex items-center gap-2 text-xl dark:text-white">
                      <CreditCard className="w-6 h-6 text-primary" />
                      Mon Abonnement
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {subscriptionLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Clock className="w-8 h-8 animate-spin text-primary" />
                      </div>
                    ) : !subscription || !subscription.has_subscription ? (
                      <div className="text-center py-6">
                        <Crown className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-600 dark:text-slate-300 mb-4">
                          Vous n'avez pas encore d'abonnement
                        </p>
                        <Button 
                          onClick={() => navigate('/payment')}
                          className="bg-gradient-to-r from-primary to-accent text-white font-semibold shadow-lg hover:shadow-xl"
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
                          Souscrire maintenant
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Statut */}
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                          <span className="text-slate-600 dark:text-slate-300 font-medium">Statut</span>
                          <div className={`flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${subscriptionStatus.color} text-white font-bold text-sm`}>
                            <subscriptionStatus.icon className="w-4 h-4" />
                            {subscription.status === 'trial' ? 'Essai gratuit' : 
                             subscription.status === 'active' ? 'Actif' : 
                             subscription.status === 'expired' ? 'Expiré' : 'Inactif'}
                          </div>
                        </div>

                        {/* Jours restants pour l'essai */}
                        {subscription.status === 'trial' && subscription.days_remaining !== null && (
                          <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                            <span className="text-slate-700 dark:text-slate-200 font-medium flex items-center gap-2">
                              <Clock className="w-5 h-5 text-blue-600" />
                              Jours restants
                            </span>
                            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                              {subscription.days_remaining}
                            </span>
                          </div>
                        )}

                        {/* Date de début */}
                        {subscription.trial_start_date && subscription.status === 'trial' && (
                          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                            <span className="text-slate-600 dark:text-slate-300 font-medium">Début de l'essai</span>
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {new Date(subscription.trial_start_date).toLocaleDateString('fr-FR', { 
                                day: 'numeric', month: 'long', year: 'numeric' 
                              })}
                            </span>
                          </div>
                        )}

                        {/* Date de fin d'essai */}
                        {subscription.trial_end_date && subscription.status === 'trial' && (
                          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                            <span className="text-slate-600 dark:text-slate-300 font-medium">Fin de l'essai</span>
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {new Date(subscription.trial_end_date).toLocaleDateString('fr-FR', { 
                                day: 'numeric', month: 'long', year: 'numeric' 
                              })}
                            </span>
                          </div>
                        )}

                        {/* Date d'activation (pour abonnement actif) */}
                        {subscription.subscription_start_date && subscription.status === 'active' && (
                          <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border-2 border-green-200 dark:border-green-800">
                            <span className="text-slate-700 dark:text-slate-200 font-medium flex items-center gap-2">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              Activé le
                            </span>
                            <span className="font-bold text-green-600 dark:text-green-400">
                              {new Date(subscription.subscription_start_date).toLocaleDateString('fr-FR', { 
                                day: 'numeric', month: 'long', year: 'numeric' 
                              })}
                            </span>
                          </div>
                        )}

                        {/* Méthode de paiement */}
                        {subscription.payment_method && subscription.status === 'active' && (
                          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                            <span className="text-slate-600 dark:text-slate-300 font-medium">Paiement</span>
                            <span className="font-semibold text-slate-900 dark:text-white capitalize">
                              {subscription.payment_method.replace('_', ' ')}
                            </span>
                          </div>
                        )}

                        {/* Accès */}
                        {subscription.status === 'active' && (
                          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-2 border-green-200 dark:border-green-800">
                            <div className="flex items-center gap-3">
                              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                              <div>
                                <p className="font-bold text-green-700 dark:text-green-400">Accès illimité activé !</p>
                                <p className="text-sm text-green-600 dark:text-green-500">Profitez de tous les contenus sans limite</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Bouton Gérer l'abonnement pour utilisateurs actifs */}
                        {subscription.status === 'active' && (
                          <Button 
                            onClick={() => navigate('/payment')}
                            variant="outline"
                            className="w-full border-2 border-primary/30 dark:border-primary/50 text-primary dark:text-primary-light hover:bg-primary/5 dark:hover:bg-primary/10 font-semibold mt-4"
                          >
                            <CreditCard className="w-4 h-4 mr-2" />
                            Gérer mon abonnement
                          </Button>
                        )}

                        {/* CTA pour payer si en essai */}
                        {subscription.status === 'trial' && (
                          <Button 
                            onClick={() => navigate('/payment')}
                            className="w-full bg-gradient-to-r from-primary to-accent text-white font-semibold shadow-lg hover:shadow-xl mt-4"
                          >
                            <CreditCard className="w-4 h-4 mr-2" />
                            Payer 1000 FCFA - Accès illimité
                          </Button>
                        )}

                        {/* CTA pour réactiver si expiré */}
                        {subscription.status === 'expired' && (
                          <Button 
                            onClick={() => navigate('/payment')}
                            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold shadow-lg hover:shadow-xl mt-4"
                          >
                            <CreditCard className="w-4 h-4 mr-2" />
                            Réactiver mon accès - 1000 FCFA
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Section Orientation Professionnelle */}
                <ProfileOrientationSection userId={user.id} />
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Profile;