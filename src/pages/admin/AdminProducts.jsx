import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const AdminProducts = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({ title: 'Erreur', description: 'Impossible de charger les produits.', variant: 'destructive' });
      } else {
        setProducts(data);
      }
      setLoading(false);
    };
    fetchProducts();
  }, [toast]);

  return (
    <>
      <Helmet>
        <title>Gestion des Produits - Admin</title>
      </Helmet>
      <div className="space-y-8">
        <h1 className="text-4xl font-bold font-heading">Gestion des Produits</h1>
        <Card>
          <CardHeader>
            <CardTitle>Liste des Produits ({products.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Chargement...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Stock</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map(product => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.price.toLocaleString('fr-FR')} FCFA</TableCell>
                      <TableCell>{product.type}</TableCell>
                      <TableCell>{product.stock_quantity ?? 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AdminProducts;