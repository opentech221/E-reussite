import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Users, DollarSign, BookOpen, ShoppingCart, BarChart, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

const AdminDashboard = () => {
  const { toast } = useToast();

  const stats = [
    { title: 'Utilisateurs Actifs', value: '1,250', icon: Users, color: 'text-blue-500', change: '+20.1%' },
    { title: 'Revenus (30j)', value: '1,5M FCFA', icon: DollarSign, color: 'text-green-500', change: '+15.2%' },
    { title: 'Nouveaux Inscrits (7j)', value: '180', icon: Users, color: 'text-indigo-500', change: '+30%' },
    { title: 'Ventes de Produits', value: '312', icon: ShoppingCart, color: 'text-purple-500', change: '+8.5%' },
  ];

  const kpis = [
    { title: 'Taux de Réussite Simulé', value: '88%', icon: CheckCircle, color: 'text-green-500' },
    { title: 'Temps Moyen de Révision', value: '4h 30m /sem', icon: Clock, color: 'text-orange-500' },
    { title: 'Taux d\'Engagement', value: '76%', icon: BarChart, color: 'text-yellow-500' },
  ];

  const handleExport = () => {
    toast({
      title: "🚧 Bientôt disponible !",
      description: "L'exportation des données en CSV/Excel sera bientôt implémentée. 🚀",
    });
  };

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - E-Réussite</title>
      </Helmet>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold font-heading">Tableau de Bord Admin</h1>
          <Button onClick={handleExport}>Exporter les Rapports (CSV)</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-slate-500">{stat.change} depuis le mois dernier</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {kpis.map((kpi, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{kpi.value}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Progression Moyenne des Élèves</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-slate-500 p-8">Graphique de progression à venir...</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Ventes Générées</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-slate-500 p-8">Graphique des ventes à venir...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;