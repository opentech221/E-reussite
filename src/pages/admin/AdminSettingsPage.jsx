import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Shield,
  Users,
  Database,
  Activity,
  Bell,
  Palette,
  Mail,
  Key,
  Download,
  Upload,
  Trash2,
  Save,
  RefreshCw,
  CheckCircle,
  AlertTriangle
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
import { toast } from 'sonner';

const AdminSettingsPage = () => {
  const [activeTab, setActiveTab] = useState('general'); // 'general', 'users', 'security', 'system'
  const [siteSettings, setSiteSettings] = useState({
    siteName: 'E-Réussite',
    contactEmail: 'contact@ereussite.com',
    supportEmail: 'support@ereussite.com',
    primaryColor: '#3B82F6'
  });

  const tabs = [
    { id: 'general', label: 'Général', icon: Settings },
    { id: 'users', label: 'Utilisateurs & Rôles', icon: Users },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'system', label: 'Système', icon: Database }
  ];

  const roles = [
    { name: 'Admin', permissions: ['all'], count: 2, color: 'red' },
    { name: 'Teacher', permissions: ['read', 'write_courses'], count: 15, color: 'blue' },
    { name: 'Coach', permissions: ['read', 'write_coaching'], count: 8, color: 'green' },
    { name: 'Student', permissions: ['read'], count: 1247, color: 'slate' },
    { name: 'Parent', permissions: ['read', 'view_child'], count: 450, color: 'purple' }
  ];

  const activityLogs = [
    { user: 'admin@ereussite.com', action: 'Création utilisateur', timestamp: '2025-11-29 10:30', ip: '192.168.1.1' },
    { user: 'admin@ereussite.com', action: 'Modification cours', timestamp: '2025-11-29 09:15', ip: '192.168.1.1' },
    { user: 'teacher@ereussite.com', action: 'Upload document', timestamp: '2025-11-29 08:45', ip: '192.168.1.50' },
    { user: 'admin@ereussite.com', action: 'Suppression badge', timestamp: '2025-11-28 16:20', ip: '192.168.1.1' },
    { user: 'coach@ereussite.com', action: 'Consultation stats', timestamp: '2025-11-28 14:10', ip: '192.168.1.75' }
  ];

  const handleSaveSettings = () => {
    toast.success('Paramètres sauvegardés avec succès');
  };

  const handleBackup = () => {
    toast.success('Sauvegarde lancée...');
  };

  const handleRestore = () => {
    toast.warning('Restauration en cours...');
  };

  const handleClearCache = () => {
    toast.success('Cache vidé avec succès');
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">Paramètres & Sécurité</h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1 sm:mt-2">
          Configuration générale et sécurité de la plateforme
        </p>
      </div>

      {/* Tabs */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardContent className="p-4 sm:p-6">
          <div className="flex overflow-x-auto gap-2 pb-2 sm:pb-0 scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? 'default' : 'outline'}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 min-h-11 whitespace-nowrap flex-shrink-0 ${
                    activeTab !== tab.id ? 'dark:border-slate-600 dark:hover:bg-slate-700' : ''
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm sm:text-base">{tab.label}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* General Tab */}
      {activeTab === 'general' && (
        <div className="space-y-4 sm:space-y-6">
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl dark:text-slate-100">Configuration du Site</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
              <div>
                <label className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">Nom du site</label>
                <Input
                  value={siteSettings.siteName}
                  onChange={(e) => setSiteSettings({ ...siteSettings, siteName: e.target.value })}
                  className="mt-1 min-h-11 dark:bg-slate-900 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">Email de contact</label>
                <Input
                  type="email"
                  value={siteSettings.contactEmail}
                  onChange={(e) => setSiteSettings({ ...siteSettings, contactEmail: e.target.value })}
                  className="mt-1 min-h-11 dark:bg-slate-900 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">Email de support</label>
                <Input
                  type="email"
                  value={siteSettings.supportEmail}
                  onChange={(e) => setSiteSettings({ ...siteSettings, supportEmail: e.target.value })}
                  className="mt-1 min-h-11 dark:bg-slate-900 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">Couleur principale</label>
                <div className="flex flex-col sm:flex-row gap-2 mt-1">
                  <Input
                    type="color"
                    value={siteSettings.primaryColor}
                    onChange={(e) => setSiteSettings({ ...siteSettings, primaryColor: e.target.value })}
                    className="w-full sm:w-20 h-11 dark:bg-slate-900 dark:border-slate-700"
                  />
                  <Input
                    type="text"
                    value={siteSettings.primaryColor}
                    onChange={(e) => setSiteSettings({ ...siteSettings, primaryColor: e.target.value })}
                    className="flex-1 min-h-11 dark:bg-slate-900 dark:border-slate-700"
                  />
                </div>
              </div>

              <Button onClick={handleSaveSettings} className="w-full min-h-11">
                <Save className="w-4 h-4 mr-2" />
                Enregistrer les modifications
              </Button>
            </CardContent>
          </Card>

          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl dark:text-slate-100">Logo & Médias</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 sm:p-8 text-center">
                <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-2">Glissez-déposez votre logo ici</p>
                <p className="text-xs text-slate-500 dark:text-slate-500">ou cliquez pour parcourir (PNG, JPG max 2MB)</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Users & Roles Tab */}
      {activeTab === 'users' && (
        <div className="space-y-4 sm:space-y-6">
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <span className="text-lg sm:text-xl dark:text-slate-100">Rôles & Permissions</span>
                <Button size="sm" className="w-full sm:w-auto min-h-11">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter Rôle
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Utilisateurs</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role.name}>
                      <TableCell className="font-medium">
                        <Badge variant={role.color === 'red' ? 'destructive' : 'outline'}>
                          {role.name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {role.permissions.map((perm) => (
                            <Badge key={perm} variant="secondary" className="text-xs">
                              {perm}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{role.count}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-4 sm:space-y-6">
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl dark:text-slate-100">Journal d'Activité</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Date & Heure</TableHead>
                    <TableHead>Adresse IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activityLogs.map((log, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{log.user}</TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>{log.timestamp}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-slate-100 px-2 py-1 rounded">{log.ip}</code>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Authentification à Deux Facteurs (2FA)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-900">2FA Activé</p>
                    <p className="text-sm text-green-700">Protection renforcée pour tous les admins</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Configurer
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl dark:text-slate-100">Sessions Actives</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Session actuelle</p>
                    <p className="text-sm text-slate-600">Windows • Chrome • 192.168.1.1</p>
                    <p className="text-xs text-slate-500 mt-1">Dernière activité: Il y a 2 minutes</p>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-600">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Session mobile</p>
                    <p className="text-sm text-slate-600">iPhone • Safari • 192.168.1.50</p>
                    <p className="text-xs text-slate-500 mt-1">Dernière activité: Il y a 2 heures</p>
                  </div>
                  <Button size="sm" variant="outline" className="text-red-600">
                    Déconnecter
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* System Tab */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sauvegarde & Restauration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-semibold text-blue-900">Dernière sauvegarde</p>
                  <p className="text-sm text-blue-700">29 novembre 2025 à 03:00</p>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Réussie
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button onClick={handleBackup} variant="outline" className="h-20 flex-col">
                  <Download className="w-6 h-6 mb-2" />
                  <span>Créer une sauvegarde</span>
                </Button>
                <Button onClick={handleRestore} variant="outline" className="h-20 flex-col">
                  <Upload className="w-6 h-6 mb-2" />
                  <span>Restaurer depuis fichier</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gestion du Cache</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button onClick={handleClearCache} variant="outline" className="h-20 flex-col">
                  <RefreshCw className="w-6 h-6 mb-2" />
                  <span>Vider le cache</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Trash2 className="w-6 h-6 mb-2" />
                  <span>Nettoyer fichiers temp</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Database className="w-6 h-6 mb-2" />
                  <span>Optimiser BDD</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl dark:text-slate-100">État du Système</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Database className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Base de données</p>
                      <p className="text-sm text-slate-600">Supabase PostgreSQL</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    OK
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium">API Services</p>
                      <p className="text-sm text-slate-600">Claude, Gemini, Perplexity</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    OK
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Key className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Clés API</p>
                      <p className="text-sm text-slate-600">4/4 configurées</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    OK
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Notifications Push</p>
                      <p className="text-sm text-slate-600">Service Worker actif</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    OK
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminSettingsPage;
