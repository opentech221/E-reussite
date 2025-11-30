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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gamification</h1>
          <p className="text-slate-600 mt-2">
            Badges, classements et récompenses
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Configuration
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Créer Badge
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Badges</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {Object.values(badgesStats).reduce((a, b) => a + b, 0)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Award className="w-6 h-6 text-blue-600" />
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
                  <p className="text-sm text-slate-600 mb-1">Top Joueur</p>
                  <p className="text-xl font-bold text-slate-900">
                    {leaderboard[0]?.total_points || 0} pts
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-yellow-600" />
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
                  <p className="text-sm text-slate-600 mb-1">Joueurs Actifs</p>
                  <p className="text-3xl font-bold text-slate-900">{leaderboard.length}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
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
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Série Max</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {Math.max(...leaderboard.map(l => l.longest_streak || 0), 0)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Star className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Badges Distribution Chart */}
      {badgesChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Distribution des Badges</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
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
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-4">
            <Select value={filters.region} onValueChange={(value) => setFilters({ ...filters, region: value })}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Région" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les régions</SelectItem>
                <SelectItem value="Dakar">Dakar</SelectItem>
                <SelectItem value="Thiès">Thiès</SelectItem>
                <SelectItem value="Saint-Louis">Saint-Louis</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.limit.toString()} onValueChange={(value) => setFilters({ ...filters, limit: parseInt(value) })}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Limite" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">Top 10</SelectItem>
                <SelectItem value="20">Top 20</SelectItem>
                <SelectItem value="50">Top 50</SelectItem>
                <SelectItem value="100">Top 100</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline">
              <Gift className="w-4 h-4 mr-2" />
              Récompenser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard Table */}
      <Card>
        <CardHeader>
          <CardTitle>Classement</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="text-slate-600 mt-4">Chargement...</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">Aucun joueur trouvé</p>
            </div>
          ) : (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminGamificationPage;
