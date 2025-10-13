import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, CreditCard, Shield, Sparkles } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/components/ui/use-toast';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const { toast } = useToast();

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    toast({
      title: '🚀 Paiement bientôt disponible !',
      description: 'Le paiement en ligne sera bientôt intégré avec Stripe, PayPal et Mobile Money.',
    });
  };

  return (
    <>
      <Helmet>
        <title>Votre Panier - E-Réussite</title>
        <meta name="description" content="Consultez et gérez les articles de votre panier sur E-Réussite." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
        <Navbar />

        <section className="pt-32 pb-20 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <Link to="/shop" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-6 font-semibold transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Retour à la boutique
              </Link>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-5xl md:text-6xl font-bold font-heading text-slate-900 dark:text-white mb-4">
                    Votre <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Panier</span>
                  </h1>
                  <p className="text-lg text-slate-600 dark:text-slate-300">
                    {cart.length > 0 ? `${cart.length} article${cart.length > 1 ? 's' : ''} dans votre panier` : 'Votre panier est vide'}
                  </p>
                </div>
                {cart.length > 0 && (
                  <Button 
                    variant="outline" 
                    onClick={clearCart}
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Vider le panier
                  </Button>
                )}
              </div>
            </motion.div>

            {cart.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20"
              >
                <div className="relative inline-block mb-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl"></div>
                  <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 p-12 rounded-full">
                    <ShoppingCart className="w-24 h-24 text-slate-400" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Votre panier est vide</h2>
                <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">Découvrez nos produits et commencez vos achats !</p>
                <Link to="/shop">
                  <Button size="lg" className="bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:scale-105 transition-all duration-300">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Découvrir la boutique
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Liste des articles */}
                <div className="lg:col-span-2 space-y-4">
                  {cart.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Card className="hover:shadow-xl transition-all duration-300 border-slate-200 overflow-hidden group">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-6">
                            {/* Image produit */}
                            <div className="w-28 h-28 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                              {item.icon && <item.icon className="w-14 h-14 text-primary" />}
                            </div>
                            
                            {/* Détails produit */}
                            <div className="flex-grow">
                              <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-2">{item.name}</h3>
                              <p className="text-primary font-semibold text-lg">{item.price.toLocaleString('fr-FR')} FCFA</p>
                            </div>
                            
                            {/* Contrôles quantité */}
                            <div className="flex items-center gap-3 bg-slate-100 rounded-xl p-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="hover:bg-white h-9 w-9 rounded-lg"
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-12 text-center font-bold text-lg">{item.quantity}</span>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="hover:bg-white h-9 w-9 rounded-lg"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            {/* Prix total */}
                            <div className="text-right min-w-[120px]">
                              <p className="font-bold text-2xl text-slate-900 dark:text-white">{(item.price * item.quantity).toLocaleString('fr-FR')}</p>
                              <p className="text-sm text-slate-500">FCFA</p>
                            </div>
                            
                            {/* Bouton supprimer */}
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => removeFromCart(item.id)}
                              className="hover:bg-red-50 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Résumé de la commande */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="lg:col-span-1"
                >
                  <Card className="sticky top-28 border-2 border-primary/20 shadow-2xl overflow-hidden">
                    <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-transparent p-6 border-b border-slate-200">
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <CreditCard className="w-6 h-6 text-primary" />
                        Résumé
                      </h2>
                    </div>
                    
                    <CardContent className="p-6 space-y-6">
                      {/* Détails prix */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <p className="text-slate-600 dark:text-slate-300 font-medium">Sous-total</p>
                          <p className="font-bold text-slate-900 dark:text-white">{subtotal.toLocaleString('fr-FR')} FCFA</p>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-slate-600 dark:text-slate-300 font-medium">Livraison</p>
                          <p className="font-semibold text-green-600">Gratuite</p>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-slate-600 dark:text-slate-300 font-medium">Réduction</p>
                          <p className="font-semibold text-primary">0 FCFA</p>
                        </div>
                        
                        <div className="border-t-2 border-dashed border-slate-300 my-4"></div>
                        
                        <div className="flex justify-between items-center bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-xl">
                          <p className="text-lg font-bold text-slate-900 dark:text-white">Total</p>
                          <div className="text-right">
                            <p className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                              {subtotal.toLocaleString('fr-FR')}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-300">FCFA</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Bouton paiement */}
                      <Button 
                        size="lg" 
                        className="w-full bg-gradient-to-r from-primary to-accent text-white font-bold text-lg py-7 shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 hover:scale-[1.02] transition-all duration-300" 
                        onClick={handleCheckout}
                      >
                        <CreditCard className="w-5 h-5 mr-2" />
                        Passer au paiement
                      </Button>
                      
                      {/* Badge sécurité */}
                      <div className="flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-300 bg-green-50 p-3 rounded-lg">
                        <Shield className="w-5 h-5 text-green-600" />
                        <span className="font-medium">Paiement 100% sécurisé</span>
                      </div>
                      
                      {/* Méthodes de paiement */}
                      <div className="text-center pt-4 border-t border-slate-200">
                        <p className="text-slate-600 dark:text-slate-300 font-semibold mb-4 text-sm">Moyens de paiement acceptés :</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-slate-50 p-3 rounded-lg hover:bg-slate-100 transition-colors">
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Wave</p>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-lg hover:bg-slate-100 transition-colors">
                            <p className="text-xs font-bold text-orange-600">Orange Money</p>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-lg hover:bg-slate-100 transition-colors">
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Free Money</p>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-lg hover:bg-slate-100 transition-colors">
                            <p className="text-xs font-bold text-yellow-600">MTN Money</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            )}
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Cart;