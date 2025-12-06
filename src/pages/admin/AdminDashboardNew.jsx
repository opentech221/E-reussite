/**
 * 📊 Composant Dashboard Admin Principal - Vue d'ensemble complète
 * 
 * Affiche :
 * - KPIs principaux avec tendances
 * - Graphiques d'activité et de performance
 * - Alertes et notifications
 * - Actions rapides
 */

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import {
  Users,
  BookOpen,
  Target,
  TrendingUp,
  TrendingDown,
  Clock,
  Award,
  Activity,
  AlertCircle,
  Download,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { adminService } from '@/services/adminService';

const AdminDashboardNew = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);
  const [activityData, setActivityData] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  // Couleurs du thème
  const COLORS = {
    primary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    purple: '#8b5cf6',
    cyan: '#06b6d4'
  };

  const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  // Charger les données au montage
  useEffect(() => {
    fetchDashboardData();
  }, []);

  /**
   * Récupère toutes les données du dashboard
   */
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, activityRes, leaderboardRes] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getActivityData('week'),
        adminService.getLeaderboard({ limit: 5 })
      ]);

      if (statsRes.success) {
        setStats(statsRes.data);
      }

      if (activityRes.success) {
        setActivityData(activityRes.data);
      }

      if (leaderboardRes.success) {
        setLeaderboard(leaderboardRes.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données du dashboard',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Rafraîchir les données
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
    toast({
      title: 'Données actualisées',
      description: 'Le dashboard a été mis à jour avec succès'
    });
  };

  /**
   * Exporter les rapports
   */
  const handleExport = async () => {
    toast({
      title: 'Export en cours...',
      description: 'Génération du rapport en cours'
    });

    const result = await adminService.exportUsersToCSV();
    
    if (result.success) {
      toast({
        title: 'Export réussi',
        description: 'Le fichier CSV a été téléchargé'
      });
    } else {
      toast({
        title: 'Erreur d\'export',
        description: result.error,
        variant: 'destructive'
      });
    }
  };

  // KPIs principaux
  const mainKPIs = [
    {
      title: 'Utilisateurs Actifs',
      value: stats?.usersCount || 0,
      change: `+${stats?.newUsersThisWeek || 0} cette semaine`,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100',
      trend: 'up'
    },
    {
      title: 'Cours Disponibles',
      value: stats?.coursesCount || 0,
      change: 'Tous niveaux',
      icon: BookOpen,
      color: 'text-green-500',
      bgColor: 'bg-green-100',
      trend: 'stable'
    },
    {
      title: 'Tests d\'Orientation',
      value: stats?.orientationTestsCount || 0,
      change: 'Réalisés',
      icon: Target,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100',
      trend: 'up'
    },
    {
      title: 'Taux de Réussite',
      value: `${stats?.averageSuccessRate || 0}%`,
      change: 'Moyenne globale',
      icon: Award,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100',
      trend: 'up'
    }
  ];

  // KPIs secondaires
  const secondaryKPIs = [
    {
      title: 'Actifs Aujourd\'hui',
      value: stats?.activeUsersToday || 0,
      icon: Activity,
      color: 'text-cyan-500'
    },
    {
      title: 'Quiz Complétés',
      value: stats?.quizzesCount || 0,
      icon: Clock,
      color: 'text-orange-500'
    }
  ];

  // Alertes
  const alerts = [
    {
      type: 'info',
      title: 'Nouveaux inscrits',
      message: `${stats?.newUsersThisWeek || 0} nouveaux élèves cette semaine`,
      icon: TrendingUp,
      color: 'text-blue-500'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Dashboard Admin - E-Réussite</title>
      </Helmet>

      <div className="space-y-6 lg:space-y-8">
        {/* Header - Mobile First */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-heading text-slate-900">
              Tableau de Bord Admin
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mt-1 sm:mt-2">
              Vue d'ensemble de votre plateforme éducative
            </p>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <Button
              onClick={handleRefresh}
              variant="outline"
              disabled={refreshing}
              className="flex-1 sm:flex-none min-h-11"
            >
              <RefreshCw className={`w-4 h-4 sm:mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Actualiser</span>
            </Button>
            <Button onClick={handleExport} className="flex-1 sm:flex-none min-h-11">
              <Download className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Exporter CSV</span>
            </Button>
          </div>
        </div>

        {/* KPIs Principaux - Mobile First Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {mainKPIs.map((kpi, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium text-slate-600">
                    {kpi.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                    <kpi.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${kpi.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl sm:text-3xl font-bold text-slate-900">{kpi.value}</div>
                  <div className="flex items-center mt-2 text-xs sm:text-sm">
                    {kpi.trend === 'up' ? (
                      <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-1" />
                    ) : kpi.trend === 'down' ? (
                      <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 mr-1" />
                    ) : null}
                    <span className="text-slate-500">{kpi.change}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* KPIs Secondaires - Mobile First Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
          {secondaryKPIs.map((kpi, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">{kpi.title}</CardTitle>
                  <kpi.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${kpi.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl sm:text-3xl font-bold">{kpi.value}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Graphiques - Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Graphique d'activité - Mobile Responsive */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Activité des 7 derniers jours</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250} className="sm:hidden">
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { day: '2-digit' })}
                  />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke={COLORS.primary}
                    fillOpacity={1}
                    fill="url(#colorActivity)"
                  />
                </AreaChart>
              </ResponsiveContainer>
              <ResponsiveContainer width="100%" height={300} className="hidden sm:block">
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="colorActivity2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                  />
                  <YAxis stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke={COLORS.primary}
                    fillOpacity={1}
                    fill="url(#colorActivity2)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top 5 Élèves - Mobile Cards */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Top 5 Élèves - Classement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {leaderboard.slice(0, 5).map((user, index) => (
                  <div
                    key={user.user_id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-sm sm:text-base flex-shrink-0 ${
                        index === 0 ? 'bg-yellow-500 text-white' :
                        index === 1 ? 'bg-slate-400 text-white' :
                        index === 2 ? 'bg-orange-500 text-white' :
                        'bg-slate-200 text-slate-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-900 text-sm sm:text-base truncate">
                          {user.profiles?.full_name || 'Utilisateur'}
                        </p>
                        <p className="text-xs sm:text-sm text-slate-500 truncate">
                          Niv. {user.level} • {user.profiles?.region || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="font-bold text-primary text-sm sm:text-base">{user.total_points} pts</p>
                      <p className="text-xs text-slate-500">{user.quizzes_completed} quiz</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alertes - Mobile Responsive */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
              Alertes et Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg bg-blue-50 border border-blue-200"
                >
                  <alert.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${alert.color} mt-0.5 flex-shrink-0`} />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900 text-sm sm:text-base">{alert.title}</p>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1">{alert.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions Rapides - Mobile Touch-Friendly */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Actions Rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 min-h-20 sm:min-h-24">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                <span className="text-sm sm:text-base">Gérer les Utilisateurs</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 min-h-20 sm:min-h-24">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                <span className="text-sm sm:text-base">Ajouter un Cours</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 min-h-20 sm:min-h-24">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
                <span className="text-sm sm:text-base">Voir les Statistiques</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AdminDashboardNew;
