import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const AdminUsers = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({ title: 'Erreur', description: 'Impossible de charger les utilisateurs.', variant: 'destructive' });
      } else {
        setUsers(data);
      }
      setLoading(false);
    };
    fetchUsers();
  }, [toast]);

  return (
    <>
      <Helmet>
        <title>Gestion des Utilisateurs - Admin</title>
      </Helmet>
      <div className="space-y-8">
        <h1 className="text-4xl font-bold font-heading">Gestion des Utilisateurs</h1>
        <Card>
          <CardHeader>
            <CardTitle>Liste des Utilisateurs ({users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Chargement...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Niveau</TableHead>
                    <TableHead>Abonnement</TableHead>
                    <TableHead>Inscrit le</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(user => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.full_name || 'N/A'}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>{user.level || 'N/A'}</TableCell>
                      <TableCell className="capitalize">{user.subscription}</TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleDateString('fr-FR')}</TableCell>
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

export default AdminUsers;