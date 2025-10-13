import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const AdminCourses = () => {
  const { toast } = useToast();
  const [matieres, setMatieres] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      const { data, error } = await supabase
        .from('matieres')
        .select(`
          *,
          chapitres (
            id,
            title,
            lecons (id, title)
          )
        `)
        .order('name');

      if (error) {
        toast({ title: 'Erreur', description: 'Impossible de charger les cours.', variant: 'destructive' });
      } else {
        setMatieres(data);
      }
      setLoading(false);
    };
    fetchCourses();
  }, [toast]);

  return (
    <>
      <Helmet>
        <title>Gestion des Cours - Admin</title>
      </Helmet>
      <div className="space-y-8">
        <h1 className="text-4xl font-bold font-heading">Gestion des Cours</h1>
        <Card>
          <CardHeader>
            <CardTitle>Structure des Cours</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Chargement...</p>
            ) : (
              <div className="space-y-4">
                {matieres.map(matiere => (
                  <div key={matiere.id} className="p-4 border rounded-lg">
                    <h3 className="font-bold text-lg">{matiere.name} ({matiere.level})</h3>
                    <p className="text-sm text-slate-500">{matiere.chapitres.length} chapitres</p>
                    {matiere.chapitres.length > 0 && (
                      <ul className="pl-4 mt-2 space-y-1 text-sm">
                        {matiere.chapitres.map(chapitre => (
                          <li key={chapitre.id}>
                            {chapitre.title} ({chapitre.lecons.length} leçons)
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AdminCourses;