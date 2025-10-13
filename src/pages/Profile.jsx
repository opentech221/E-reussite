import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { User, Edit, BookOpen, ShoppingBag, Save, Crown, Calendar, Mail, GraduationCap, Award, Settings, CheckCircle2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', level: '', parcours: '' });

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
        });
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      if (user) {
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*, order_items(*, products(name))')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (ordersError) {
          toast({ title: 'Erreur de commandes', description: ordersError.message, variant: 'destructive' });
        } else {
          setOrders(ordersData);
        }
      }
    };

    fetchProfileData();
    fetchOrders();
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

  const subscriptionBadge = getSubscriptionBadge(profile.subscription);

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
                      
                      {/* Badge abonnement */}
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${subscriptionBadge.color} text-white font-bold shadow-lg`}>
                        <subscriptionBadge.icon className="w-5 h-5" />
                        {subscriptionBadge.label}
                      </div>
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
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border-2 border-primary/20">
                          <span className="text-slate-700 dark:text-slate-200 font-medium flex items-center gap-2">
                            <Crown className="w-5 h-5 text-primary" />
                            Abonnement
                          </span>
                          <span className="font-bold text-primary capitalize text-lg">{profile.subscription}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Historique des commandes */}
                <Card className="border-2 border-slate-200 shadow-lg dark:bg-slate-800 dark:border-white/20 dark:shadow-[0_0_30px_rgba(255,255,255,0.4)] overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-accent/10 to-primary/10 dark:from-accent/20 dark:to-primary/20 border-b border-slate-200 dark:border-slate-700">
                    <CardTitle className="flex items-center gap-2 text-xl dark:text-white">
                      <ShoppingBag className="w-6 h-6 text-accent" /> 
                      Historique des commandes
                      {orders.length > 0 && (
                        <span className="ml-auto bg-accent text-white text-sm px-3 py-1 rounded-full font-bold">
                          {orders.length}
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {orders.length > 0 ? (
                      <ul className="space-y-4">
                        {orders.map((order, index) => (
                          <motion.li 
                            key={order.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-5 border-2 border-slate-200 rounded-xl hover:border-primary/50 hover:shadow-lg transition-all bg-white"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <p className="font-bold text-lg text-slate-900 dark:text-white">
                                  Commande #{order.id.substring(0, 8)}
                                </p>
                                <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(order.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-2xl text-primary">{order.total_amount.toLocaleString('fr-FR')}</p>
                                <p className="text-sm text-slate-500">FCFA</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 mb-3">
                              <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 ${
                                order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-slate-100 text-slate-700 dark:text-slate-200'
                              }`}>
                                {order.status === 'completed' && <CheckCircle2 className="w-4 h-4" />}
                                <span className="capitalize">{order.status === 'completed' ? 'Complétée' : order.status === 'pending' ? 'En attente' : order.status}</span>
                              </span>
                            </div>
                            
                            <ul className="space-y-2 pl-4 border-l-2 border-slate-200">
                              {order.order_items.map(item => (
                                <li key={item.id} className="text-sm text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                                  <span className="font-medium">{item.products.name}</span>
                                  <span className="text-slate-500">(x{item.quantity})</span>
                                </li>
                              ))}
                            </ul>
                          </motion.li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-center py-12">
                        <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 text-lg font-medium">Aucune commande pour le moment</p>
                        <p className="text-slate-400 text-sm mt-2">Vos achats apparaîtront ici</p>
                      </div>
                    )}
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

export default Profile;