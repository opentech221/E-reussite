import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { ShoppingBag, Book, PenTool, FileText, Search, Tag } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCart } from '@/hooks/useCart';

const allProducts = [
  { id: 1, name: 'Pack Annales Corrigées - BFEM', description: 'Toutes les annales du BFEM de 2010 à 2024 avec corrections détaillées.', price: 10000, icon: Book, category: 'numerique' },
  { id: 2, name: 'Pack Annales Corrigées - Bac', description: 'Toutes les annales du Bac (S & L) de 2010 à 2024 avec corrections.', price: 15000, icon: Book, category: 'numerique' },
  { id: 3, name: 'Kit de Papeterie E-Réussite', description: 'Stylos, cahiers et fiches de révision aux couleurs de E-Réussite.', price: 5000, icon: PenTool, category: 'physique' },
  { id: 4, name: 'E-book : Méthodologie de la dissertation', description: 'Un guide complet pour maîtriser l\'art de la dissertation.', price: 7500, icon: FileText, category: 'numerique' },
  { id: 5, name: 'Fiches de révision - SVT Terminale S', description: 'Toutes les notions clés du programme en fiches synthétiques.', price: 8000, icon: FileText, category: 'numerique' },
  { id: 6, name: 'T-shirt "Génie en Herbe"', description: 'Affichez votre ambition avec ce t-shirt stylé.', price: 12000, icon: Tag, category: 'physique' },
];

const Shop = () => {
  const { addToCart } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filteredProducts = useMemo(() => {
    return allProducts.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeTab === 'all' || product.category === activeTab;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeTab]);

  return (
    <>
      <Helmet>
        <title>Boutique - E-Réussite</title>
        <meta name="description" content="Achetez des annales corrigées, e-books, et fournitures scolaires sur la boutique E-Réussite." />
      </Helmet>

      <div className="min-h-screen bg-white">
        <Navbar />

        <section className="pt-32 pb-20 px-4 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h1 className="text-5xl md:text-6xl font-bold font-heading text-slate-900 dark:text-white mb-6">
                Notre <span className="text-primary">Boutique</span>
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                Ressources et matériel pour compléter votre apprentissage et viser l'excellence.
              </p>
            </motion.div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
                <TabsList>
                  <TabsTrigger value="all">Tous les produits</TabsTrigger>
                  <TabsTrigger value="numerique">Numérique</TabsTrigger>
                  <TabsTrigger value="physique">Support physique</TabsTrigger>
                </TabsList>
                <div className="relative w-full sm:w-auto sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Rechercher un produit..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <TabsContent value={activeTab}>
                {filteredProducts.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredProducts.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                        className="flex"
                      >
                        <Card className="hover-lift h-full flex flex-col w-full">
                          <CardHeader>
                            <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                              <product.icon className="w-8 h-8 text-primary" />
                            </div>
                            <CardTitle className="text-xl">{product.name}</CardTitle>
                            <CardDescription className="h-12">{product.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="flex-grow flex flex-col justify-end">
                            <div className="text-2xl font-bold text-primary mb-4">{product.price.toLocaleString('fr-FR')} FCFA</div>
                            <Button
                              onClick={() => addToCart(product)}
                              className="w-full bg-accent text-white hover:bg-accent/90"
                            >
                              <ShoppingBag className="w-4 h-4 mr-2" />
                              Ajouter au panier
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-slate-500 col-span-full mt-8">Aucun produit ne correspond à votre recherche.</p>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </div>
    </>
  );
};

export default Shop;