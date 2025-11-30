import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Plus,
  Upload,
  FileText,
  Users,
  CheckCircle,
  TrendingUp,
  Layers,
  Save,
  X
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
import { supabase } from '@/lib/customSupabaseClient';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const AdminCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    averageCompletion: 0
  });

  // Filtres
  const [filters, setFilters] = useState({
    matiere_id: 'all',
    search: ''
  });

  // View mode
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Modals
  const [detailModal, setDetailModal] = useState({ open: false, course: null });
  const [createModal, setCreateModal] = useState({ open: false });
  const [editModal, setEditModal] = useState({ open: false, course: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, course: null });
  
  // Forms
  const [courseForm, setCourseForm] = useState({
    title: '',
    matiere_id: '',
    content: '',
    description: ''
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Charger les matières
      const { data: matieresData, error: matieresError } = await supabase
        .from('matieres')
        .select('*')
        .order('name');

      if (!matieresError && matieresData) {
        setMatieres(matieresData);
      }

      // Charger les cours avec filtres
      const filterObj = {
        matiere_id: filters.matiere_id !== 'all' ? parseInt(filters.matiere_id) : undefined,
        search: filters.search || undefined
      };

      const result = await adminService.getCourses(filterObj);
      if (result.success) {
        setCourses(result.data || []);
        
        // Calculer les stats
        const totalStudents = result.data.reduce((sum, c) => sum + (c.totalUsers || 0), 0);
        const avgCompletion = result.data.length > 0
          ? result.data.reduce((sum, c) => sum + (c.completionRate || 0), 0) / result.data.length
          : 0;

        setStats({
          totalCourses: result.data.length,
          totalStudents,
          averageCompletion: Math.round(avgCompletion)
        });
      } else {
        toast.error('Erreur lors du chargement des cours');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!courseForm.title || !courseForm.matiere_id) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const result = await adminService.createCourse({
        title: courseForm.title,
        matiere_id: parseInt(courseForm.matiere_id),
        content: courseForm.content || '',
        description: courseForm.description || ''
      });

      if (result.success) {
        toast.success('Cours créé avec succès');
        setCreateModal({ open: false });
        setCourseForm({ title: '', matiere_id: '', content: '', description: '' });
        loadData();
      } else {
        toast.error(result.error || 'Erreur lors de la création');
      }
    } catch (error) {
      toast.error('Erreur lors de la création');
    }
  };

  const handleEdit = async () => {
    try {
      const result = await adminService.updateCourse(editModal.course.id, {
        title: courseForm.title,
        matiere_id: parseInt(courseForm.matiere_id),
        content: courseForm.content,
        description: courseForm.description
      });

      if (result.success) {
        toast.success('Cours mis à jour avec succès');
        setEditModal({ open: false, course: null });
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
      const result = await adminService.deleteCourse(deleteModal.course.id);
      if (result.success) {
        toast.success('Cours supprimé avec succès');
        setDeleteModal({ open: false, course: null });
        loadData();
      } else {
        toast.error(result.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const openEditModal = (course) => {
    setCourseForm({
      title: course.title || '',
      matiere_id: course.matiere_id?.toString() || '',
      content: course.content || '',
      description: course.description || ''
    });
    setEditModal({ open: true, course });
  };

  const getMatiereColor = (matiereId) => {
    const matiere = matieres.find(m => m.id === matiereId);
    return matiere?.color || '#3B82F6';
  };

  const getMatiereName = (matiereId) => {
    const matiere = matieres.find(m => m.id === matiereId);
    return matiere?.name || 'N/A';
  };

  // Données pour le graphique
  const chartData = matieres.map(matiere => {
    const coursesCount = courses.filter(c => c.matiere_id === matiere.id).length;
    return {
      name: matiere.name,
      count: coursesCount,
      color: matiere.color
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Gestion des Cours</h1>
        <p className="text-slate-600 mt-2">
          Gérez les cours, chapitres et contenus pédagogiques
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
                  <p className="text-sm text-slate-600 mb-1">Total Cours</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.totalCourses}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-600" />
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
                  <p className="text-sm text-slate-600 mb-1">Étudiants Inscrits</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.totalStudents}</p>
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
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Taux de Complétion Moyen</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.averageCompletion}%</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Graphique Distribution des Cours */}
      <Card>
        <CardHeader>
          <CardTitle>Distribution des Cours par Matière</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Filters & Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher un cours..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Matiere Filter */}
            <Select value={filters.matiere_id} onValueChange={(value) => setFilters({ ...filters, matiere_id: value })}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Matière" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les matières</SelectItem>
                {matieres.map(matiere => (
                  <SelectItem key={matiere.id} value={matiere.id.toString()}>
                    {matiere.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* View Mode Toggle */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Layers className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <FileText className="w-4 h-4" />
              </Button>
            </div>

            {/* Create Button */}
            <Button onClick={() => setCreateModal({ open: true })}>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Cours
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Courses Display */}
      {loading ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="text-slate-600 mt-4">Chargement...</p>
            </div>
          </CardContent>
        </Card>
      ) : courses.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">Aucun cours trouvé</p>
            </div>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <div
                  className="h-2 rounded-t-lg"
                  style={{ backgroundColor: getMatiereColor(course.matiere_id) }}
                />
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-slate-900 mb-2 line-clamp-2">
                        {course.title}
                      </h3>
                      <Badge variant="outline" style={{ borderColor: getMatiereColor(course.matiere_id) }}>
                        {getMatiereName(course.matiere_id)}
                      </Badge>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Étudiants inscrits</span>
                      <span className="font-semibold">{course.totalUsers || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Ont terminé</span>
                      <span className="font-semibold">{course.completedUsers || 0}</span>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-slate-600">Taux de complétion</span>
                        <span className="font-semibold">{course.completionRate || 0}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-primary rounded-full h-2 transition-all"
                          style={{ width: `${course.completionRate || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setDetailModal({ open: true, course })}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Voir
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditModal(course)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeleteModal({ open: true, course })}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Matière</TableHead>
                  <TableHead>Étudiants</TableHead>
                  <TableHead>Complétion</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline" style={{ borderColor: getMatiereColor(course.matiere_id) }}>
                        {getMatiereName(course.matiere_id)}
                      </Badge>
                    </TableCell>
                    <TableCell>{course.totalUsers || 0}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-primary rounded-full h-2"
                            style={{ width: `${course.completionRate || 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold">{course.completionRate || 0}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDetailModal({ open: true, course })}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditModal(course)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteModal({ open: true, course })}
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
          </CardContent>
        </Card>
      )}

      {/* Detail Modal */}
      <Dialog open={detailModal.open} onOpenChange={(open) => setDetailModal({ open, course: null })}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{detailModal.course?.title}</DialogTitle>
            <DialogDescription asChild>
              <div>
                <Badge variant="outline" style={{ borderColor: getMatiereColor(detailModal.course?.matiere_id) }}>
                  {getMatiereName(detailModal.course?.matiere_id)}
                </Badge>
              </div>
            </DialogDescription>
          </DialogHeader>

          {detailModal.course && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-primary">{detailModal.course.totalUsers || 0}</p>
                    <p className="text-xs text-slate-600 mt-1">Inscrits</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">{detailModal.course.completedUsers || 0}</p>
                    <p className="text-xs text-slate-600 mt-1">Terminé</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-purple-600">{detailModal.course.completionRate || 0}%</p>
                    <p className="text-xs text-slate-600 mt-1">Complétion</p>
                  </CardContent>
                </Card>
              </div>

              {detailModal.course.description && (
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-slate-600 text-sm">{detailModal.course.description}</p>
                </div>
              )}

              {detailModal.course.content && (
                <div>
                  <h4 className="font-semibold mb-2">Contenu</h4>
                  <div className="bg-slate-50 p-4 rounded-lg max-h-60 overflow-y-auto">
                    <p className="text-slate-600 text-sm whitespace-pre-wrap">{detailModal.course.content}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Modal */}
      <Dialog open={createModal.open} onOpenChange={(open) => {
        setCreateModal({ open });
        if (!open) setCourseForm({ title: '', matiere_id: '', content: '', description: '' });
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Créer un nouveau cours</DialogTitle>
            <DialogDescription>
              Remplissez les informations du cours
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Titre *</label>
              <Input
                value={courseForm.title}
                onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                placeholder="Ex: Introduction aux Mathématiques"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Matière *</label>
              <Select value={courseForm.matiere_id} onValueChange={(value) => setCourseForm({ ...courseForm, matiere_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une matière" />
                </SelectTrigger>
                <SelectContent>
                  {matieres.map(matiere => (
                    <SelectItem key={matiere.id} value={matiere.id.toString()}>
                      {matiere.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Description</label>
              <Input
                value={courseForm.description}
                onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                placeholder="Brève description du cours"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Contenu</label>
              <textarea
                value={courseForm.content}
                onChange={(e) => setCourseForm({ ...courseForm, content: e.target.value })}
                className="w-full min-h-[200px] p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Contenu du cours (supports Markdown)..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateModal({ open: false })}>
              Annuler
            </Button>
            <Button onClick={handleCreate}>
              <Save className="w-4 h-4 mr-2" />
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={editModal.open} onOpenChange={(open) => setEditModal({ open, course: null })}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier le cours</DialogTitle>
            <DialogDescription>
              Mettez à jour les informations du cours
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Titre *</label>
              <Input
                value={courseForm.title}
                onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Matière *</label>
              <Select value={courseForm.matiere_id} onValueChange={(value) => setCourseForm({ ...courseForm, matiere_id: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {matieres.map(matiere => (
                    <SelectItem key={matiere.id} value={matiere.id.toString()}>
                      {matiere.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Description</label>
              <Input
                value={courseForm.description}
                onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Contenu</label>
              <textarea
                value={courseForm.content}
                onChange={(e) => setCourseForm({ ...courseForm, content: e.target.value })}
                className="w-full min-h-[200px] p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModal({ open: false, course: null })}>
              Annuler
            </Button>
            <Button onClick={handleEdit}>
              <Save className="w-4 h-4 mr-2" />
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModal.open} onOpenChange={(open) => setDeleteModal({ open, course: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le cours{' '}
              <span className="font-semibold">{deleteModal.course?.title}</span> ?
              Cette action supprimera également toute la progression des utilisateurs associée.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModal({ open: false, course: null })}>
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

export default AdminCoursesPage;
