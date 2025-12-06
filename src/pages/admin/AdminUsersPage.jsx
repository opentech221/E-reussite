import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  TrendingUp,
  X,
  Save,
  Activity
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeToday: 0,
    newThisWeek: 0
  });

  // Filtres
  const [filters, setFilters] = useState({
    role: 'all',
    level: 'all',
    region: '',
    search: ''
  });

  // Modals
  const [detailModal, setDetailModal] = useState({ open: false, user: null, details: null });
  const [editModal, setEditModal] = useState({ open: false, user: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, user: null });
  const [editForm, setEditForm] = useState({});

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 20;

  useEffect(() => {
    loadData();
  }, [filters, currentPage]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Charger les statistiques
      const statsResult = await adminService.getDashboardStats();
      if (statsResult.success) {
        setStats({
          totalUsers: statsResult.data.usersCount || 0,
          activeToday: statsResult.data.activeUsersToday || 0,
          newThisWeek: statsResult.data.newUsersThisWeek || 0
        });
      }

      // Charger les utilisateurs avec filtres
      const filterObj = {
        role: filters.role !== 'all' ? filters.role : undefined,
        level: filters.level !== 'all' ? filters.level : undefined,
        region: filters.region || undefined,
        search: filters.search || undefined
      };

      const result = await adminService.getUsers(filterObj);
      if (result.success) {
        setUsers(result.data || []);
      } else {
        toast.error('Erreur lors du chargement des utilisateurs');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (user) => {
    setDetailModal({ open: true, user, details: null });
    try {
      const result = await adminService.getUserDetails(user.id);
      if (result.success) {
        setDetailModal(prev => ({ ...prev, details: result.data }));
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des détails');
    }
  };

  const handleEdit = (user) => {
    setEditForm({
      full_name: user.full_name || '',
      email: user.email || '',
      role: user.role || 'student',
      level: user.level || '',
      region: user.region || '',
      phone: user.phone || '',
      school: user.school || '',
      city: user.city || '',
      address: user.address || '',
      gender: user.gender || '',
      bio: user.bio || '',
      status: user.status || 'active'
    });
    setEditModal({ open: true, user });
  };

  const handleSaveEdit = async () => {
    try {
      const result = await adminService.updateUser(editModal.user.id, editForm);
      if (result.success) {
        toast.success('Utilisateur mis à jour avec succès');
        setEditModal({ open: false, user: null });
        loadData();
      } else {
        toast.error(result.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async () => {
    try {
      const result = await adminService.deleteUser(deleteModal.user.id);
      if (result.success) {
        toast.success('Utilisateur supprimé avec succès');
        setDeleteModal({ open: false, user: null });
        loadData();
      } else {
        toast.error(result.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleExportCSV = async () => {
    try {
      const result = await adminService.exportUsersToCSV(filters);
      if (result.success) {
        toast.success('Export CSV téléchargé avec succès');
      } else {
        toast.error('Erreur lors de l\'export');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'export');
    }
  };

  const getRoleBadge = (role) => {
    const variants = {
      admin: 'destructive',
      teacher: 'default',
      coach: 'secondary',
      student: 'outline',
      parent: 'outline'
    };
    return variants[role] || 'outline';
  };

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header - Mobile First */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Gestion des Utilisateurs</h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1 sm:mt-2">
            Gérez les comptes utilisateurs de la plateforme
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => loadData()} className="flex-1 sm:flex-none min-h-11">
            <Activity className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Actualiser</span>
          </Button>
          <Button className="flex-1 sm:flex-none min-h-11">
            <UserPlus className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Nouvel utilisateur</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards - Mobile First */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Utilisateurs</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.totalUsers}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
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
                  <p className="text-sm text-slate-600 mb-1">Actifs Aujourd'hui</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.activeToday}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-green-600" />
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
                  <p className="text-sm text-slate-600 mb-1">Nouveaux (7 jours)</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.newThisWeek}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters & Actions - Mobile First */}
      <Card>
        <CardContent className="p-4 lg:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
            {/* Search - Full width on mobile */}
            <div className="sm:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10 h-11"
                />
              </div>
            </div>

            {/* Role Filter */}
            <Select value={filters.role} onValueChange={(value) => setFilters({ ...filters, role: value })}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="student">Étudiant</SelectItem>
                <SelectItem value="teacher">Enseignant</SelectItem>
                <SelectItem value="coach">Coach</SelectItem>
                <SelectItem value="parent">Parent</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>

            {/* Level Filter */}
            <Select value={filters.level} onValueChange={(value) => setFilters({ ...filters, level: value })}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Niveau" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les niveaux</SelectItem>
                <SelectItem value="3e">3e</SelectItem>
                <SelectItem value="Seconde">Seconde</SelectItem>
                <SelectItem value="Première">Première</SelectItem>
                <SelectItem value="Terminale">Terminale</SelectItem>
              </SelectContent>
            </Select>

            {/* Export */}
            <Button onClick={handleExportCSV} variant="outline" className="w-full h-11">
              <Download className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Exporter CSV</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users List - Mobile First: Cards on mobile, Table on desktop */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base sm:text-lg">
            <span>Liste des Utilisateurs ({users.length})</span>
            <Button size="sm" className="min-h-10 hidden sm:flex">
              <UserPlus className="w-4 h-4 mr-2" />
              Ajouter
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="text-slate-600 mt-4">Chargement...</p>
            </div>
          ) : currentUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">Aucun utilisateur trouvé</p>
            </div>
          ) : (
            <>
              {/* Mobile View: Cards */}
              <div className="block lg:hidden space-y-3">
                {currentUsers.map((user) => (
                  <Card key={user.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 truncate">{user.full_name || 'N/A'}</h3>
                          <p className="text-sm text-slate-500 truncate">{user.email || 'N/A'}</p>
                        </div>
                        <Badge variant={getRoleBadge(user.role)} className="ml-2 flex-shrink-0">
                          {user.role || 'N/A'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div>
                          <span className="text-slate-500">Niveau:</span>
                          <span className="ml-1 font-medium">{user.level || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Région:</span>
                          <span className="ml-1 font-medium">{user.region || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Points:</span>
                          <span className="ml-1 font-semibold text-primary">{user.total_points || 0}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(user)}
                          className="flex-1 min-h-10"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Détails
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(user)}
                          className="flex-1 min-h-10"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Modifier
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDeleteModal({ open: true, user })}
                          className="text-red-600 hover:text-red-700 min-h-10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Desktop View: Table */}
              <div className="hidden lg:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead>Niveau</TableHead>
                      <TableHead>Région</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.full_name || 'N/A'}</TableCell>
                        <TableCell>{user.email || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadge(user.role)}>
                            {user.role || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.level || 'N/A'}</TableCell>
                        <TableCell>{user.region || 'N/A'}</TableCell>
                        <TableCell>
                          <span className="font-semibold text-primary">
                            {user.total_points || 0}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewDetails(user)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(user)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setDeleteModal({ open: true, user })}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-slate-600">
                    Page {currentPage} sur {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Précédent
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Suivant
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={detailModal.open} onOpenChange={(open) => setDetailModal({ open, user: null, details: null })}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de l'utilisateur</DialogTitle>
            <DialogDescription>
              Informations complètes sur {detailModal.user?.full_name}
            </DialogDescription>
          </DialogHeader>

          {detailModal.details ? (
            <div className="space-y-6">
              {/* Profile Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600">Nom complet</p>
                  <p className="font-semibold">{detailModal.details.profile.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Email</p>
                  <p className="font-semibold">{detailModal.details.profile.email}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Rôle</p>
                  <Badge variant={getRoleBadge(detailModal.details.profile.role)}>
                    {detailModal.details.profile.role}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Niveau</p>
                  <p className="font-semibold">{detailModal.details.profile.level || 'N/A'}</p>
                </div>
              </div>

              {/* Points & Stats */}
              {detailModal.details.points && (
                <div>
                  <h3 className="font-semibold mb-3">Points & Gamification</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-primary">{detailModal.details.points.total_points}</p>
                        <p className="text-xs text-slate-600 mt-1">Points totaux</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-green-600">{detailModal.details.points.current_streak}</p>
                        <p className="text-xs text-slate-600 mt-1">Série actuelle</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-blue-600">{detailModal.details.points.quizzes_completed}</p>
                        <p className="text-xs text-slate-600 mt-1">Quiz terminés</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-purple-600">{detailModal.details.points.lessons_completed}</p>
                        <p className="text-xs text-slate-600 mt-1">Leçons terminées</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Badges */}
              {detailModal.details.badges && detailModal.details.badges.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Badges obtenus ({detailModal.details.badges.length})</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {detailModal.details.badges.map((badge, idx) => (
                      <Card key={idx}>
                        <CardContent className="p-3 text-center">
                          <div className="text-3xl mb-2">{badge.badge_icon}</div>
                          <p className="text-sm font-semibold">{badge.badge_name}</p>
                          <p className="text-xs text-slate-600">{badge.badge_type}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="text-slate-600 mt-4">Chargement des détails...</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Modal - Mobile First */}
      <Dialog open={editModal.open} onOpenChange={(open) => setEditModal({ open, user: null })}>
        <DialogContent className="max-w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Modifier l'utilisateur</DialogTitle>
            <DialogDescription className="text-sm">
              Mettez à jour les informations de l'utilisateur
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Informations personnelles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">Nom complet</label>
                <Input
                  className="min-h-11"
                  value={editForm.full_name || ''}
                  onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                  placeholder="Prénom Nom"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">Email</label>
                <Input
                  className="min-h-11"
                  type="email"
                  value={editForm.email || ''}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">Téléphone</label>
                <Input
                  className="min-h-11"
                  type="tel"
                  value={editForm.phone || ''}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="+221 XX XXX XX XX"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">Genre</label>
                <Select value={editForm.gender || ''} onValueChange={(value) => setEditForm({ ...editForm, gender: value })}>
                  <SelectTrigger className="min-h-11">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Masculin</SelectItem>
                    <SelectItem value="female">Féminin</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Rôle et statut */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">Rôle</label>
                <Select value={editForm.role} onValueChange={(value) => setEditForm({ ...editForm, role: value })}>
                  <SelectTrigger className="min-h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Étudiant</SelectItem>
                    <SelectItem value="teacher">Enseignant</SelectItem>
                    <SelectItem value="coach">Coach</SelectItem>
                    <SelectItem value="parent">Parent</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">Statut</label>
                <Select value={editForm.status || 'active'} onValueChange={(value) => setEditForm({ ...editForm, status: value })}>
                  <SelectTrigger className="min-h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="suspended">Suspendu</SelectItem>
                    <SelectItem value="inactive">Inactif</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Informations académiques */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">Niveau</label>
                <Select value={editForm.level || ''} onValueChange={(value) => setEditForm({ ...editForm, level: value })}>
                  <SelectTrigger className="min-h-11">
                    <SelectValue placeholder="Sélectionner un niveau" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3e">3e</SelectItem>
                    <SelectItem value="Seconde">Seconde</SelectItem>
                    <SelectItem value="Première">Première</SelectItem>
                    <SelectItem value="Terminale">Terminale</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">École</label>
                <Input
                  className="min-h-11"
                  value={editForm.school || ''}
                  onChange={(e) => setEditForm({ ...editForm, school: e.target.value })}
                  placeholder="Nom de l'établissement"
                />
              </div>
            </div>

            {/* Localisation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">Région</label>
                <Input
                  className="min-h-11"
                  value={editForm.region || ''}
                  onChange={(e) => setEditForm({ ...editForm, region: e.target.value })}
                  placeholder="Dakar, Thiès, Kaolack..."
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">Ville</label>
                <Input
                  className="min-h-11"
                  value={editForm.city || ''}
                  onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                  placeholder="Ville"
                />
              </div>
            </div>

            {/* Adresse */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">Adresse</label>
              <Input
                className="min-h-11"
                value={editForm.address || ''}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                placeholder="Adresse complète"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">Bio</label>
              <textarea
                className="w-full min-h-20 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                value={editForm.bio || ''}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                placeholder="Description ou notes supplémentaires..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setEditModal({ open: false, user: null })}
              className="min-h-11 w-full sm:w-auto"
            >
              Annuler
            </Button>
            <Button 
              onClick={handleSaveEdit}
              className="min-h-11 w-full sm:w-auto"
            >
              <Save className="w-4 h-4 mr-2" />
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal - Mobile First */}
      <Dialog open={deleteModal.open} onOpenChange={(open) => setDeleteModal({ open, user: null })}>
        <DialogContent className="max-w-full sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl text-red-600 dark:text-red-400">
              Confirmer la suppression
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600 dark:text-slate-400">
              Êtes-vous sûr de vouloir supprimer l'utilisateur{' '}
              <span className="font-semibold text-slate-900 dark:text-slate-100">{deleteModal.user?.full_name}</span> ?
              <br />
              <span className="text-red-600 dark:text-red-400 font-medium">Cette action est irréversible.</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setDeleteModal({ open: false, user: null })}
              className="min-h-11 w-full sm:w-auto"
            >
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              className="min-h-11 w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsersPage;
