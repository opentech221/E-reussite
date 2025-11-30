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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Paramètres & Sécurité</h1>
        <p className="text-slate-600 mt-2">
          Configuration générale et sécurité de la plateforme
        </p>
      </div>

      {/* Tabs */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? 'default' : 'outline'}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* General Tab */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuration du Site</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Nom du site</label>
                <Input
                  value={siteSettings.siteName}
                  onChange={(e) => setSiteSettings({ ...siteSettings, siteName: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Email de contact</label>
                <Input
                  type="email"
                  value={siteSettings.contactEmail}
                  onChange={(e) => setSiteSettings({ ...siteSettings, contactEmail: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Email de support</label>
                <Input
                  type="email"
                  value={siteSettings.supportEmail}
                  onChange={(e) => setSiteSettings({ ...siteSettings, supportEmail: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Couleur principale</label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={siteSettings.primaryColor}
                    onChange={(e) => setSiteSettings({ ...siteSettings, primaryColor: e.target.value })}
                    className="w-20"
                  />
                  <Input
                    type="text"
                    value={siteSettings.primaryColor}
                    onChange={(e) => setSiteSettings({ ...siteSettings, primaryColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>

              <Button onClick={handleSaveSettings} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Enregistrer les modifications
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Logo & Médias</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600 mb-2">Glissez-déposez votre logo ici</p>
                <p className="text-xs text-slate-500">ou cliquez pour parcourir (PNG, JPG max 2MB)</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Users & Roles Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Rôles & Permissions</span>
                <Button size="sm">
                  <Users className="w-4 h-4 mr-2" />
                  Nouveau Rôle
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
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Journal d'Activité</CardTitle>
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

          <Card>
            <CardHeader>
              <CardTitle>Sessions Actives</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
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

          <Card>
            <CardHeader>
              <CardTitle>État du Système</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
