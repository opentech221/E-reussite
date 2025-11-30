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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Quiz & Examens</h1>
          <p className="text-slate-600 mt-2">
            Gérez les quiz, questions et suivez les performances
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Créer un Quiz
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Tentatives</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.totalAttempts}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <FileQuestion className="w-6 h-6 text-blue-600" />
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
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Quiz Complétés</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.completed}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
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
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Progression Moyenne</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.averageProgress}%</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Distribution des Quiz</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
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
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <FileQuestion className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Gestion des Quiz</h3>
              <p className="text-sm text-blue-700 mb-4">
                Les statistiques actuelles proviennent de la table <code className="bg-blue-100 px-2 py-1 rounded">user_progress</code>.
                Pour une gestion complète des quiz avec création de questions, gestion des réponses et statistiques détaillées,
                vous devrez créer une table <code className="bg-blue-100 px-2 py-1 rounded">quiz_results</code> dans votre base de données.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="sm" variant="outline" className="bg-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Créer Table Quiz
                </Button>
                <Button size="sm" variant="outline" className="bg-white">
                  <Eye className="w-4 h-4 mr-2" />
                  Voir Documentation
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions Rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <Plus className="w-6 h-6 mb-2" />
              <span>Créer un Quiz</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <BarChart3 className="w-6 h-6 mb-2" />
              <span>Voir Statistiques</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Download className="w-6 h-6 mb-2" />
              <span>Exporter Résultats</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminQuizPage;
