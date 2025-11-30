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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Gestion des Utilisateurs</h1>
        <p className="text-slate-600 mt-2">
          Gérez les comptes utilisateurs de la plateforme
        </p>
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

      {/* Filters & Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher par nom, email..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Role Filter */}
            <Select value={filters.role} onValueChange={(value) => setFilters({ ...filters, role: value })}>
              <SelectTrigger>
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
              <SelectTrigger>
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
            <Button onClick={handleExportCSV} variant="outline" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Exporter CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Liste des Utilisateurs ({users.length})</span>
            <Button size="sm">
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

      {/* Edit Modal */}
      <Dialog open={editModal.open} onOpenChange={(open) => setEditModal({ open, user: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
            <DialogDescription>
              Mettez à jour les informations de l'utilisateur
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Nom complet</label>
              <Input
                value={editForm.full_name || ''}
                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Email</label>
              <Input
                type="email"
                value={editForm.email || ''}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Téléphone</label>
              <Input
                type="tel"
                value={editForm.phone || ''}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                placeholder="+221 XX XXX XX XX"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Rôle</label>
              <Select value={editForm.role} onValueChange={(value) => setEditForm({ ...editForm, role: value })}>
                <SelectTrigger>
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
              <label className="text-sm font-medium text-slate-700">Niveau</label>
              <Select value={editForm.level || ''} onValueChange={(value) => setEditForm({ ...editForm, level: value })}>
                <SelectTrigger>
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
              <label className="text-sm font-medium text-slate-700">Région</label>
              <Input
                value={editForm.region || ''}
                onChange={(e) => setEditForm({ ...editForm, region: e.target.value })}
                placeholder="Dakar, Thiès, Kaolack..."
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">École</label>
              <Input
                value={editForm.school || ''}
                onChange={(e) => setEditForm({ ...editForm, school: e.target.value })}
                placeholder="Nom de l'établissement"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Statut</label>
              <Select value={editForm.status || 'active'} onValueChange={(value) => setEditForm({ ...editForm, status: value })}>
                <SelectTrigger>
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

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModal({ open: false, user: null })}>
              Annuler
            </Button>
            <Button onClick={handleSaveEdit}>
              <Save className="w-4 h-4 mr-2" />
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModal.open} onOpenChange={(open) => setDeleteModal({ open, user: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer l'utilisateur{' '}
              <span className="font-semibold">{deleteModal.user?.full_name}</span> ?
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModal({ open: false, user: null })}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsersPage;
