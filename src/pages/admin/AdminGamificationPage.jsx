import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Award,
  Users,
  TrendingUp,
  Medal,
  Star,
  Gift,
  Settings,
  Plus,
  Eye,
  MapPin
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const AdminGamificationPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [badgesStats, setBadgesStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    region: 'all',
    limit: 10
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Charger le leaderboard
      const leaderboardResult = await adminService.getLeaderboard({
        region: filters.region !== 'all' ? filters.region : undefined,
        limit: filters.limit
      });

      if (leaderboardResult.success) {
        setLeaderboard(leaderboardResult.data || []);
      }

      // Charger les stats de badges
      const badgesResult = await adminService.getBadgesStats();
      if (badgesResult.success) {
        setBadgesStats(badgesResult.data || {});
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  // Données pour le graphique de badges
  const badgesChartData = Object.entries(badgesStats).map(([type, count]) => ({
    name: type,
    value: count,
    color: type === 'performance' ? '#3B82F6' : type === 'progress' ? '#10B981' : type === 'engagement' ? '#F59E0B' : '#8B5CF6'
  }));

  const getMedalIcon = (rank) => {
    if (rank === 1) return <Medal className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-slate-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="text-sm font-semibold text-slate-600">#{rank}</span>;
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">Gamification</h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1 sm:mt-2">
            Badges, classements et récompenses
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button variant="outline" className="w-full sm:w-auto min-h-11 dark:border-slate-600 dark:hover:bg-slate-700">
            <Settings className="w-4 h-4 mr-2" />
            Configuration
          </Button>
          <Button className="w-full sm:w-auto min-h-11">
            <Plus className="w-4 h-4 mr-2" />
            Créer Badge
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-1">Total Badges</p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {Object.values(badgesStats).reduce((a, b) => a + b, 0)}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <Award className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
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
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-1">Top Joueur</p>
                  <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
                    {leaderboard[0]?.total_points || 0} pts
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                  <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 dark:text-yellow-400" />
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
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-1">Joueurs Actifs</p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">{leaderboard.length}</p>
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
          transition={{ delay: 0.4 }}
        >
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-1">Série Max</p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {Math.max(...leaderboard.map(l => l.longest_streak || 0), 0)}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                  <Star className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Badges Distribution Chart */}
      {badgesChartData.length > 0 && (
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl dark:text-slate-100">Distribution des Badges</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <ResponsiveContainer width="100%" height={200} className="sm:hidden">
              <PieChart>
                <Pie
                  data={badgesChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {badgesChartData.map((entry, index) => (
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
                  data={badgesChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {badgesChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
            <Select value={filters.region} onValueChange={(value) => setFilters({ ...filters, region: value })}>
              <SelectTrigger className="w-full sm:w-[200px] min-h-11 dark:bg-slate-900 dark:border-slate-700">
                <SelectValue placeholder="Région" />
              </SelectTrigger>
              <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                <SelectItem value="all">Toutes les régions</SelectItem>
                <SelectItem value="Dakar">Dakar</SelectItem>
                <SelectItem value="Thiès">Thiès</SelectItem>
                <SelectItem value="Saint-Louis">Saint-Louis</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.limit.toString()} onValueChange={(value) => setFilters({ ...filters, limit: parseInt(value) })}>
              <SelectTrigger className="w-full sm:w-[150px] min-h-11 dark:bg-slate-900 dark:border-slate-700">
                <SelectValue placeholder="Limite" />
              </SelectTrigger>
              <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                <SelectItem value="10">Top 10</SelectItem>
                <SelectItem value="20">Top 20</SelectItem>
                <SelectItem value="50">Top 50</SelectItem>
                <SelectItem value="100">Top 100</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="w-full sm:w-auto min-h-11 dark:border-slate-600 dark:hover:bg-slate-700">
              <Gift className="w-4 h-4 mr-2" />
              Récompenser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard Table */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl dark:text-slate-100">Classement</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-4">Chargement...</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">Aucun joueur trouvé</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block lg:hidden space-y-3 p-4">
                {leaderboard.map((player, index) => (
                  <Card key={player.user_id} className={`${index < 3 ? 'border-2 border-yellow-400 dark:border-yellow-600' : ''} dark:bg-slate-900 dark:border-slate-700`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800">
                            {getMedalIcon(index + 1)}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm text-slate-900 dark:text-slate-100 mb-1">
                              {player.full_name || 'Utilisateur'}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <Badge variant="outline" className="text-xs dark:border-slate-600">
                                <MapPin className="w-3 h-3 mr-1" />
                                {player.region || 'N/A'}
                              </Badge>
                              <Badge className="text-xs">Niv. {player.level || 1}</Badge>
                            </div>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 dark:hover:bg-slate-800">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t dark:border-slate-700">
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Points</p>
                          <p className="font-bold text-sm text-primary">{player.total_points}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Série</p>
                          <p className="text-orange-600 font-semibold text-sm">🔥 {player.current_streak || 0}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Quiz</p>
                          <p className="font-semibold text-sm dark:text-slate-200">{player.quizzes_completed || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Rang</TableHead>
                  <TableHead>Joueur</TableHead>
                  <TableHead>Région</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Niveau</TableHead>
                  <TableHead>Série</TableHead>
                  <TableHead>Quiz</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map((player, index) => (
                  <TableRow key={player.user_id} className={index < 3 ? 'bg-slate-50' : ''}>
                    <TableCell>
                      <div className="flex items-center justify-center">
                        {getMedalIcon(index + 1)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {player.full_name || 'Utilisateur'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        <MapPin className="w-3 h-3 mr-1" />
                        {player.region || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-primary">{player.total_points}</span>
                    </TableCell>
                    <TableCell>
                      <Badge>{player.level || 1}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-orange-600 font-semibold">🔥 {player.current_streak || 0}</span>
                    </TableCell>
                    <TableCell>{player.quizzes_completed || 0}</TableCell>
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

export default AdminGamificationPage;
