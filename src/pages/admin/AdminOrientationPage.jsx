import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Target,
  Search,
  Eye,
  MapPin,
  Users,
  TrendingUp,
  Briefcase,
  Download,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import adminService from '@/services/adminService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminOrientationPage = () => {
  const [tests, setTests] = useState([]);
  const [regionalStats, setRegionalStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTests: 0,
    uniqueUsers: 0,
    avgRecommendations: 0
  });
  const [filters, setFilters] = useState({
    region: 'all',
    search: ''
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Charger les tests
      const filterObj = {
        region: filters.region !== 'all' ? filters.region : undefined
      };

      const testsResult = await adminService.getOrientationTests(filterObj);
      if (testsResult.success) {
        setTests(testsResult.data || []);
        setStats({
          totalTests: testsResult.data.length,
          uniqueUsers: new Set(testsResult.data.map(t => t.user_id)).size,
          avgRecommendations: testsResult.data.length > 0 
            ? Math.round(testsResult.data.reduce((sum, t) => sum + (t.recommended_careers?.length || 0), 0) / testsResult.data.length)
            : 0
        });
      }

      // Charger les stats régionales
      const regionalResult = await adminService.getOrientationStatsByRegion();
      if (regionalResult.success) {
        setRegionalStats(regionalResult.data || []);
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">Module Orientation</h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1 sm:mt-2">
            Tests d'orientation et recommandations de carrières
          </p>
        </div>
        <Button className="w-full sm:w-auto min-h-11">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter Métier
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
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-1">Tests Réalisés</p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.totalTests}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <Target className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
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
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-1">Utilisateurs Uniques</p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.uniqueUsers}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
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
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-1">Moy. Recommandations</p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.avgRecommendations}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Regional Stats Chart */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl dark:text-slate-100">Tests par Région</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <ResponsiveContainer width="100%" height={200} className="sm:hidden">
            <BarChart data={regionalStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="region" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <ResponsiveContainer width="100%" height={300} className="hidden sm:block">
            <BarChart data={regionalStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="region" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
            <div className="flex-1 min-w-full sm:min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher un utilisateur..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10 min-h-11 dark:bg-slate-900 dark:border-slate-700"
                />
              </div>
            </div>

            <Select value={filters.region} onValueChange={(value) => setFilters({ ...filters, region: value })}>
              <SelectTrigger className="w-full sm:w-[200px] min-h-11 dark:bg-slate-900 dark:border-slate-700">
                <SelectValue placeholder="Région" />
              </SelectTrigger>
              <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                <SelectItem value="all">Toutes les régions</SelectItem>
                {Object.keys(regionalStats).map(region => (
                  <SelectItem key={region} value={region}>
                    {region || 'Non renseigné'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" className="w-full sm:w-auto min-h-11 dark:border-slate-600 dark:hover:bg-slate-700">
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tests Table */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl dark:text-slate-100">Tests d'Orientation ({tests.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-4">Chargement...</p>
            </div>
          ) : tests.length === 0 ? (
            <div className="text-center py-12">
              <Target className="w-12 h-12 sm:w-16 sm:h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">Aucun test trouvé</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block lg:hidden space-y-3 p-4">
                {tests.slice(0, 20).map((test) => (
                  <Card key={test.id} className="dark:bg-slate-900 dark:border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="font-medium text-sm text-slate-900 dark:text-slate-100 mb-1">
                            {test.user_email || test.user_id}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge variant="outline" className="text-xs dark:border-slate-600">
                              <MapPin className="w-3 h-3 mr-1" />
                              {test.region || 'N/A'}
                            </Badge>
                            <Badge className="text-xs">{test.recommended_careers?.length || 0} métiers</Badge>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 dark:hover:bg-slate-800">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {test.completed_at ? new Date(test.completed_at).toLocaleDateString('fr-FR') : 'N/A'}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Région</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Recommandations</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tests.slice(0, 20).map((test) => (
                  <TableRow key={test.id}>
                    <TableCell className="font-medium">
                      {test.user_email || test.user_id}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        <MapPin className="w-3 h-3 mr-1" />
                        {test.region || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {test.completed_at ? new Date(test.completed_at).toLocaleDateString('fr-FR') : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge>{test.recommended_careers?.length || 0} métiers</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOrientationPage;
