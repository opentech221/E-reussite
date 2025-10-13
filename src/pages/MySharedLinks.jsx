import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { dbHelpers } from '@/lib/supabaseHelpers';
import dubService from '@/services/dubService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { 
  ExternalLink, 
  Copy, 
  Trash2, 
  RefreshCw, 
  Link as LinkIcon,
  TrendingUp,
  Users,
  Calendar,
  Filter,
  Loader2,
  ChevronDown,
  ChevronUp,
  Globe,
  Monitor,
  Smartphone,
  Chrome
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import './MySharedLinks.css';

const LINK_TYPES = [
  { value: 'all', label: 'Tous les liens', icon: LinkIcon },
  { value: 'course', label: 'Cours', icon: '📚' },
  { value: 'quiz', label: 'Quiz', icon: '📝' },
  { value: 'exam', label: 'Examens', icon: '🎓' },
  { value: 'certificate', label: 'Certificats', icon: '🏆' },
  { value: 'referral', label: 'Parrainage', icon: '🎁' },
  { value: 'perplexity', label: 'Perplexity', icon: '🤖' }
];

export default function MySharedLinks() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [links, setLinks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshingLink, setRefreshingLink] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [expandedLinks, setExpandedLinks] = useState(new Set());
  const [linkAnalytics, setLinkAnalytics] = useState({});

  // Charger les liens et statistiques
  useEffect(() => {
    if (user) {
      loadLinks();
      loadStats();
    }
  }, [user, filterType]);

  // Charger automatiquement les analytics pour tous les liens
  useEffect(() => {
    if (links.length > 0 && user) {
      loadAllAnalytics();
    }
  }, [links.length]);

  const loadLinks = async () => {
    try {
      setLoading(true);
      const linkType = filterType === 'all' ? null : filterType;
      const { data, error } = await dbHelpers.getUserLinks(user.id, linkType);
      
      if (error) throw error;
      setLinks(data || []);
    } catch (error) {
      console.error('Erreur chargement liens:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les liens",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Charger les analytics pour tous les liens au chargement
  const loadAllAnalytics = async () => {
    try {
      const analyticsPromises = links.map(async (link) => {
        try {
          const analytics = await dubService.getCustomLinkAnalytics(link.id, '30d');
          return { linkId: link.id, analytics };
        } catch (error) {
          console.error(`Erreur analytics pour lien ${link.id}:`, error);
          return { linkId: link.id, analytics: null };
        }
      });

      const results = await Promise.all(analyticsPromises);
      
      const newAnalytics = {};
      results.forEach(({ linkId, analytics }) => {
        if (analytics) {
          newAnalytics[linkId] = analytics;
        }
      });
      
      setLinkAnalytics(newAnalytics);
    } catch (error) {
      console.error('Erreur chargement analytics globaux:', error);
    }
  };

  const loadStats = async () => {
    try {
      const { data, error } = await dbHelpers.getUserLinksStats(user.id);
      if (error) throw error;
      setStats(data);
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
  };

  const handleCopyLink = async (shortLink) => {
    try {
      await navigator.clipboard.writeText(shortLink);
      toast({
        title: "Copié ! 📋",
        description: "Le lien a été copié dans le presse-papiers"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le lien",
        variant: "destructive"
      });
    }
  };

  const handleRefreshAnalytics = async (link) => {
    try {
      setRefreshingLink(link.id);
      // Récupérer les analytics depuis le tracking maison
      const analytics = await dubService.getCustomLinkAnalytics(link.id, '30d');
      if (analytics) {
        // Stocker les analytics détaillées
        setLinkAnalytics(prev => ({
          ...prev,
          [link.id]: analytics
        }));
        
        // Mettre à jour la BDD (optionnel, selon logique existante)
        await dbHelpers.updateLinkAnalytics(link.id, analytics);
        // Recharger les liens
        await loadLinks();
        await loadStats();
        toast({
          title: "Analytics mis à jour ! 📊",
          description: `${analytics.clicks || 0} clics • ${analytics.uniqueClicks || 0} visiteurs uniques`
        });
      }
    } catch (error) {
      console.error('Erreur refresh analytics:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les analytics",
        variant: "destructive"
      });
    } finally {
      setRefreshingLink(null);
    }
  };

  const toggleAnalyticsDetails = (linkId) => {
    setExpandedLinks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(linkId)) {
        newSet.delete(linkId);
      } else {
        newSet.add(linkId);
      }
      return newSet;
    });
  };

  const handleDeleteLink = async (linkId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce lien ?')) return;
    
    try {
      await dbHelpers.deleteLink(user.id, linkId);
      
      // Recharger les liens
      await loadLinks();
      await loadStats();
      
      toast({
        title: "Lien supprimé ! 🗑️",
        description: "Le lien a été supprimé avec succès"
      });
    } catch (error) {
      console.error('Erreur suppression lien:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le lien",
        variant: "destructive"
      });
    }
  };

  const getTypeEmoji = (type) => {
    const typeObj = LINK_TYPES.find(t => t.value === type);
    return typeObj?.icon || '🔗';
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Connexion requise</CardTitle>
            <CardDescription>
              Vous devez être connecté pour voir vos liens partagés
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header avec titre et stats globales */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 dark:text-white">
          🔗 Mes Liens de Partage
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gérez tous vos liens courts Dub.co et consultez leurs statistiques
        </p>
      </div>

      {/* Stats globales */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <LinkIcon className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total liens</p>
                  <p className="text-2xl font-bold dark:text-white">{stats.totalLinks}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-300" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total clics</p>
                  <p className="text-2xl font-bold dark:text-white">{stats.totalClicks}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600 dark:text-purple-300" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Visiteurs uniques</p>
                  <p className="text-2xl font-bold dark:text-white">{stats.totalUniqueClicks}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtres par type - Design amélioré */}
      <div className="flex flex-wrap gap-3 mb-6">
        {LINK_TYPES.map(type => {
          const isActive = filterType === type.value;
          const count = stats?.byType?.[type.value]?.count || 0;
          
          return (
            <Button
              key={type.value}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType(type.value)}
              className={`
                gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 
                ${isActive 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30 scale-105 border-none' 
                  : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 hover:shadow-md hover:scale-102 border-2 border-gray-200 dark:border-gray-700'
                }
              `}
            >
              {typeof type.icon === 'string' ? (
                <span className="text-lg">{type.icon}</span>
              ) : (
                <type.icon className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
              )}
              <span>{type.label}</span>
              {count > 0 && (
                <Badge 
                  variant={isActive ? 'secondary' : 'outline'}
                  className={`
                    ml-1 px-2 py-0.5 rounded-full font-bold text-xs
                    ${isActive 
                      ? 'bg-white/20 text-white border-white/30' 
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700'
                    }
                  `}
                >
                  {count}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>

      {/* Liste des liens */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : links.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <LinkIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2 dark:text-white">
              Aucun lien partagé
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Commencez à partager des cours, quiz ou examens pour voir vos liens ici
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {links.map(link => (
            <Card key={link.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  {/* Info du lien */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getTypeEmoji(link.link_type)}</span>
                      <Badge variant="secondary">
                        {LINK_TYPES.find(t => t.value === link.link_type)?.label || link.link_type}
                      </Badge>
                    </div>
                    
                    <h3 className="text-lg font-semibold mb-1 dark:text-white truncate">
                      {link.title}
                    </h3>
                    
                    {link.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {link.description}
                      </p>
                    )}

                    {/* Lien court */}
                    <div className="flex items-center gap-2 mb-3">
                      <code className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm flex-1 truncate">
                        {link.short_link}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopyLink(link.short_link)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => window.open(link.short_link, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        <span>{link.clicks || 0} clics</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{link.unique_clicks || 0} uniques</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {link.created_at 
                            ? formatDistanceToNow(new Date(link.created_at), { 
                                addSuffix: true, 
                                locale: fr 
                              })
                            : 'Date inconnue'
                          }
                        </span>
                      </div>
                      {/* Bouton "Voir détails" avec design amélioré */}
                      {(link.clicks > 0 || linkAnalytics[link.id]) && (
                        <Button
                          size="sm"
                          onClick={() => toggleAnalyticsDetails(link.id)}
                          disabled={!linkAnalytics[link.id]}
                          className={`
                            ml-auto px-4 py-2 rounded-lg font-medium transition-all duration-300
                            ${!linkAnalytics[link.id]
                              ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-wait'
                              : expandedLinks.has(link.id)
                                ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:scale-105'
                                : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:scale-105'
                            }
                          `}
                        >
                          {!linkAnalytics[link.id] ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              <span className="text-xs font-semibold">Chargement...</span>
                            </>
                          ) : expandedLinks.has(link.id) ? (
                            <>
                              <ChevronUp className="w-4 h-4 mr-2" />
                              <span className="text-xs font-semibold">Masquer détails</span>
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4 mr-2 animate-bounce" />
                              <span className="text-xs font-semibold">📊 Voir détails</span>
                            </>
                          )}
                        </Button>
                      )}
                    </div>

                    {/* Détails Analytics (collapsible) - Design amélioré */}
                    {expandedLinks.has(link.id) && linkAnalytics[link.id] && (
                      <div className="mt-4 pt-4 border-t-2 border-blue-200 dark:border-blue-700 rounded-lg bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 p-4 space-y-4 animate-fadeIn">
                        {/* Pays */}
                        {linkAnalytics[link.id].countries && linkAnalytics[link.id].countries.length > 0 && (
                          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow duration-300">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md">
                                <Globe className="w-5 h-5 text-white" />
                              </div>
                              <span className="font-bold text-base dark:text-white">🌍 Pays des visiteurs</span>
                            </div>
                            <div className="space-y-2">
                              {linkAnalytics[link.id].countries.slice(0, 5).map((country, idx) => (
                                <div key={idx} className="flex items-center justify-between text-sm group hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded-lg transition-colors duration-200">
                                  <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                    {country.country || 'Inconnu'}
                                  </span>
                                  <div className="flex items-center gap-3">
                                    <div className="w-32 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                                      <div 
                                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 ease-out" 
                                        style={{ 
                                          width: `${(country.clicks / (linkAnalytics[link.id].clicks || 1)) * 100}%` 
                                        }}
                                      />
                                    </div>
                                    <span className="font-semibold text-gray-600 dark:text-gray-400 min-w-[4rem] text-right">
                                      {country.clicks} <span className="text-xs">clics</span>
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Devices */}
                        {linkAnalytics[link.id].devices && linkAnalytics[link.id].devices.length > 0 && (
                          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow duration-300">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-md">
                                <Monitor className="w-5 h-5 text-white" />
                              </div>
                              <span className="font-bold text-base dark:text-white">💻 Appareils utilisés</span>
                            </div>
                            <div className="flex flex-wrap gap-3">
                              {linkAnalytics[link.id].devices.map((device, idx) => (
                                <Badge 
                                  key={idx} 
                                  className={`
                                    gap-2 px-4 py-2 rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110
                                    ${device.device_type === 'mobile' 
                                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white border-none' 
                                      : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-none'
                                    }
                                  `}
                                >
                                  {device.device_type === 'mobile' ? (
                                    <Smartphone className="w-4 h-4" />
                                  ) : (
                                    <Monitor className="w-4 h-4" />
                                  )}
                                  <span>{device.device_type || 'Inconnu'}</span>
                                  <span className="bg-white/20 px-2 py-0.5 rounded-full">{device.clicks}</span>
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Browsers */}
                        {linkAnalytics[link.id].browsers && linkAnalytics[link.id].browsers.length > 0 && (
                          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow duration-300">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg shadow-md">
                                <Chrome className="w-5 h-5 text-white" />
                              </div>
                              <span className="font-bold text-base dark:text-white">🌐 Navigateurs</span>
                            </div>
                            <div className="flex flex-wrap gap-3">
                              {linkAnalytics[link.id].browsers.map((browser, idx) => (
                                <Badge 
                                  key={idx} 
                                  className="gap-2 px-4 py-2 rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 bg-gradient-to-r from-orange-500 to-amber-500 text-white border-none"
                                >
                                  <Chrome className="w-4 h-4" />
                                  <span>{browser.browser || 'Inconnu'}</span>
                                  <span className="bg-white/20 px-2 py-0.5 rounded-full">{browser.clicks}</span>
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tags */}
                    {link.tags && link.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {link.tags.map((tag, index) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRefreshAnalytics(link)}
                      disabled={refreshingLink === link.id}
                    >
                      {refreshingLink === link.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteLink(link.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
