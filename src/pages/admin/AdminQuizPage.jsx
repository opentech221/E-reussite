import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileQuestion,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  BarChart3,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  Award,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import adminService from '@/services/adminService';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const AdminQuizPage = () => {
  const [stats, setStats] = useState({
    totalAttempts: 0,
    completed: 0,
    averageProgress: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [detailModal, setDetailModal] = useState({ open: false, data: null });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await adminService.getQuizStats();
      if (result.success) {
        setStats(result.data);
      } else {
        toast.error('Erreur lors du chargement des statistiques');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  // Données pour le graphique de distribution
  const distributionData = [
    { name: 'Complétés', value: stats.completed, color: '#10B981' },
    { name: 'En cours', value: Math.max(0, stats.totalAttempts - stats.completed), color: '#F59E0B' }
  ];

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">Quiz & Examens</h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1 sm:mt-2">
            Gérez les quiz, questions et suivez les performances
          </p>
        </div>
        <Button className="w-full sm:w-auto min-h-11">
          <Plus className="w-4 h-4 mr-2" />
          Créer un Quiz
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-1">Total Tentatives</p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.totalAttempts}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <FileQuestion className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-1">Quiz Complétés</p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.completed}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-1">Progression Moyenne</p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.averageProgress}%</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Distribution Chart */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl dark:text-slate-100">Distribution des Quiz</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <ResponsiveContainer width="100%" height={200} className="sm:hidden">
            <PieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={70}
                fill="#8884d8"
                dataKey="value"
              >
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <ResponsiveContainer width="100%" height={300} className="hidden sm:block">
            <PieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Info Notice */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-100 dark:bg-blue-800 flex items-center justify-center flex-shrink-0">
              <FileQuestion className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-blue-900 dark:text-blue-200 mb-2">Gestion des Quiz</h3>
              <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 mb-4">
                Les statistiques actuelles proviennent de la table <code className="bg-blue-100 px-2 py-1 rounded">user_progress</code>.
                Pour une gestion complète des quiz avec création de questions, gestion des réponses et statistiques détaillées,
                vous devrez créer une table <code className="bg-blue-100 px-2 py-1 rounded">quiz_results</code> dans votre base de données.
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
                <Button size="sm" variant="outline" className="bg-white dark:bg-slate-800 min-h-11 w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Créer Table Quiz
                </Button>
                <Button size="sm" variant="outline" className="bg-white dark:bg-slate-800 min-h-11 w-full sm:w-auto">
                  <Eye className="w-4 h-4 mr-2" />
                  Voir Documentation
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl dark:text-slate-100">Actions Rapides</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <Button variant="outline" className="min-h-16 sm:h-20 flex-col dark:border-slate-600 dark:hover:bg-slate-700">
              <Plus className="w-5 h-5 sm:w-6 sm:h-6 mb-2" />
              <span className="text-sm sm:text-base">Créer un Quiz</span>
            </Button>
            <Button variant="outline" className="min-h-16 sm:h-20 flex-col dark:border-slate-600 dark:hover:bg-slate-700">
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 mb-2" />
              <span className="text-sm sm:text-base">Voir Statistiques</span>
            </Button>
            <Button variant="outline" className="min-h-16 sm:h-20 flex-col dark:border-slate-600 dark:hover:bg-slate-700">
              <Download className="w-5 h-5 sm:w-6 sm:h-6 mb-2" />
              <span className="text-sm sm:text-base">Exporter Résultats</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminQuizPage;
