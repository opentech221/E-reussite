# 🎯 PLAN DE FINALISATION - INTÉGRATION DUB.CO

**Date**: 11 octobre 2025  
**Statut Actuel**: ✅ **Partiellement fonctionnel** (70% complété)  
**Objectif**: Finaliser toutes les fonctionnalités Dub.co prévues

---

## 📊 État des Lieux

### ✅ Ce qui est DÉJÀ fait

1. **Configuration de base**
   - ✅ Clé API `VITE_DUB_API_KEY` configurée dans `.env`
   - ✅ Secret `DUB_API_KEY` configuré dans Supabase Dashboard
   - ✅ Edge Function `dub-create-link` déployée
   - ✅ Service `dubService.js` créé avec 4 fonctions

2. **Fonctionnalités implémentées**
   - ✅ `createCourseLink()` - Liens courts pour cours
   - ✅ `createReferralLink()` - Liens de parrainage
   - ✅ `createCertificateLink()` - Liens de certificats
   - ✅ Intégration dans PerplexitySearchMode (partage)

3. **Documentation**
   - ✅ Guide configuration (`CONFIGURATION_DUB_CO.md`)
   - ✅ Guide tests (`GUIDE_TEST_COMPLET_PERPLEXITY_DUB.md`)
   - ✅ Correction CORS (`CORRECTION_CORS_DUB.md`)

### 🔴 Ce qui RESTE à faire

1. **Fonctionnalités manquantes**
   - ❌ `getLinkAnalytics()` - Edge Function pour récupérer les stats
   - ❌ Dashboard admin pour visualiser analytics
   - ❌ Système de parrainage UI (page dédiée)
   - ❌ Génération certificats partageables
   - ❌ QR codes pour supports physiques
   - ❌ Domaine personnalisé (e-reuss.it)

2. **Intégrations à compléter**
   - ❌ Bouton "Partager" sur pages Cours
   - ❌ Bouton "Partager" sur pages Quiz
   - ❌ Bouton "Partager" sur pages Examens
   - ❌ Page "Mon lien de parrainage" dans Profile
   - ❌ Page "Mes certificats" avec partage

3. **Tests & validation**
   - ⏳ Test end-to-end partage cours
   - ⏳ Test système parrainage complet
   - ⏳ Vérification analytics Dashboard Dub.co

---

## 🚀 PLAN D'ACTION - Phase 1 (Priorité Haute)

### **Tâche 1: Créer Edge Function pour Analytics** (30 min)

**Objectif**: Récupérer les statistiques d'un lien Dub.co

**Fichier**: `supabase/functions/dub-get-analytics/index.ts`

```typescript
// Edge Function: Récupérer analytics d'un lien Dub.co
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  try {
    const DUB_API_KEY = Deno.env.get('DUB_API_KEY')
    if (!DUB_API_KEY) {
      throw new Error('DUB_API_KEY non configurée')
    }

    const { linkId, interval } = await req.json()

    // Récupérer les stats du lien
    const response = await fetch(`https://api.dub.co/links/${linkId}/analytics`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${DUB_API_KEY}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Dub API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('✅ [Dub] Analytics récupérées:', data)

    return new Response(JSON.stringify(data), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('❌ [Dub] Erreur:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }
})
```

**Commandes**:
```bash
# Créer le fichier
New-Item -Path "supabase\functions\dub-get-analytics\index.ts" -ItemType File -Force

# Déployer
supabase functions deploy dub-get-analytics --no-verify-jwt
```

---

### **Tâche 2: Mettre à jour dubService.js** (15 min)

**Objectif**: Implémenter la fonction `getLinkAnalytics()`

**Fichier**: `src/services/dubService.js`

```javascript
/**
 * Récupérer les analytics d'un lien
 * @param {string} linkId - ID du lien Dub.co
 * @param {string} interval - Intervalle de temps ('24h', '7d', '30d', 'all')
 * @returns {Promise<object>} - Statistiques du lien
 */
export async function getLinkAnalytics(linkId, interval = '30d') {
  try {
    console.log('📊 [Dub] Récupération analytics:', linkId);

    const response = await fetch(`${SUPABASE_URL}/functions/v1/dub-get-analytics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        linkId,
        interval
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur récupération analytics');
    }

    const data = await response.json();
    console.log('✅ [Dub] Analytics:', data);
    return data;
  } catch (error) {
    console.error('❌ [Dub] Erreur analytics:', error);
    throw error;
  }
}
```

---

### **Tâche 3: Créer table `shared_links` dans Supabase** (20 min)

**Objectif**: Stocker les liens créés pour tracking et historique

**Fichier**: `supabase/migrations/20251011_create_shared_links.sql`

```sql
-- Table pour stocker les liens courts créés
CREATE TABLE IF NOT EXISTS shared_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Informations du lien
  short_link TEXT NOT NULL, -- Ex: https://dub.sh/abc123
  original_url TEXT NOT NULL,
  link_id TEXT, -- ID retourné par Dub.co
  domain TEXT DEFAULT 'dub.sh',
  key TEXT, -- Slug personnalisé
  
  -- Métadonnées
  link_type TEXT NOT NULL, -- 'course', 'referral', 'certificate', 'quiz', 'exam'
  resource_id UUID, -- ID de la ressource partagée
  title TEXT,
  description TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  
  -- Analytics snapshot (mis à jour périodiquement)
  clicks INTEGER DEFAULT 0,
  last_clicked_at TIMESTAMPTZ,
  analytics JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ
);

-- Index pour performances
CREATE INDEX idx_shared_links_user_id ON shared_links(user_id);
CREATE INDEX idx_shared_links_type ON shared_links(link_type);
CREATE INDEX idx_shared_links_resource ON shared_links(resource_id);
CREATE INDEX idx_shared_links_created ON shared_links(created_at DESC);

-- RLS Policies
ALTER TABLE shared_links ENABLE ROW LEVEL SECURITY;

-- Policy: Les utilisateurs voient leurs propres liens
CREATE POLICY "Users can view own shared links"
  ON shared_links FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Les utilisateurs créent leurs propres liens
CREATE POLICY "Users can create own shared links"
  ON shared_links FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Les utilisateurs mettent à jour leurs liens
CREATE POLICY "Users can update own shared links"
  ON shared_links FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Les utilisateurs suppriment leurs liens
CREATE POLICY "Users can delete own shared links"
  ON shared_links FOR DELETE
  USING (auth.uid() = user_id);

-- Function pour auto-update updated_at
CREATE OR REPLACE FUNCTION update_shared_links_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_shared_links_updated_at
  BEFORE UPDATE ON shared_links
  FOR EACH ROW
  EXECUTE FUNCTION update_shared_links_updated_at();

-- Comments
COMMENT ON TABLE shared_links IS 'Liens courts créés via Dub.co pour partage de contenu';
COMMENT ON COLUMN shared_links.link_type IS 'Type de ressource partagée (course, referral, certificate, quiz, exam)';
COMMENT ON COLUMN shared_links.analytics IS 'Snapshot des analytics Dub.co (mis à jour périodiquement)';
```

**Commande**:
```bash
# Appliquer la migration
supabase db push
```

---

### **Tâche 4: Créer Helper Supabase pour liens** (15 min)

**Fichier**: `src/lib/supabaseHelpers.js` (ajouter)

```javascript
// ============================================================================
// SHARED LINKS HELPERS
// ============================================================================

export const sharedLinksHelpers = {
  /**
   * Sauvegarder un lien créé
   */
  async saveSharedLink(userId, linkData) {
    try {
      const { data, error } = await supabase
        .from('shared_links')
        .insert([{
          user_id: userId,
          short_link: linkData.shortLink,
          original_url: linkData.url,
          link_id: linkData.id,
          domain: linkData.domain,
          key: linkData.key,
          link_type: linkData.type, // 'course', 'referral', etc.
          resource_id: linkData.resourceId,
          title: linkData.title,
          description: linkData.description,
          tags: linkData.tags || []
        }])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('[SharedLinks] Error saving link:', error);
      return { data: null, error };
    }
  },

  /**
   * Récupérer les liens d'un utilisateur
   */
  async getUserLinks(userId, linkType = null) {
    try {
      let query = supabase
        .from('shared_links')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (linkType) {
        query = query.eq('link_type', linkType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('[SharedLinks] Error fetching links:', error);
      return { data: null, error };
    }
  },

  /**
   * Mettre à jour les analytics d'un lien
   */
  async updateLinkAnalytics(linkId, analytics) {
    try {
      const { data, error } = await supabase
        .from('shared_links')
        .update({
          clicks: analytics.clicks || 0,
          last_clicked_at: analytics.lastClickedAt,
          analytics: analytics
        })
        .eq('link_id', linkId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('[SharedLinks] Error updating analytics:', error);
      return { data: null, error };
    }
  },

  /**
   * Supprimer un lien
   */
  async deleteLink(userId, linkId) {
    try {
      const { error } = await supabase
        .from('shared_links')
        .delete()
        .eq('user_id', userId)
        .eq('id', linkId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('[SharedLinks] Error deleting link:', error);
      return { error };
    }
  }
};
```

---

## 🚀 PLAN D'ACTION - Phase 2 (Priorité Moyenne)

### **Tâche 5: Ajouter bouton "Partager" aux pages Cours** (45 min)

**Fichier**: `src/pages/CourseDetail.jsx`

**Composant à créer**: `src/components/ShareButton.jsx`

```jsx
import React, { useState } from 'react';
import { Share2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/components/ui/use-toast';
import dubService from '@/services/dubService';
import { sharedLinksHelpers } from '@/lib/supabaseHelpers';
import { useAuth } from '@/contexts/SupabaseAuthContext';

export default function ShareButton({ 
  url, 
  title, 
  description, 
  type = 'course',
  resourceId 
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [shortLink, setShortLink] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    setLoading(true);
    try {
      // Créer le lien court via Dub.co
      const result = await dubService.createCourseLink(url, {
        title,
        description,
        tags: [type]
      });

      setShortLink(result.shortLink);

      // Sauvegarder dans Supabase
      if (user) {
        await sharedLinksHelpers.saveSharedLink(user.id, {
          ...result,
          type,
          resourceId,
          title,
          description
        });
      }

      toast({
        title: "Lien créé ! 🔗",
        description: "Votre lien de partage est prêt",
      });
    } catch (error) {
      console.error('Error creating share link:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le lien de partage",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shortLink);
    setCopied(true);
    toast({
      title: "Copié ! ✅",
      description: "Le lien a été copié dans le presse-papier"
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="w-4 h-4 mr-2" />
          Partager
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-sm mb-2">Partager ce contenu</h4>
            <p className="text-xs text-gray-500">{title}</p>
          </div>

          {!shortLink ? (
            <Button 
              onClick={handleShare} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Création...' : 'Créer un lien court'}
            </Button>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-slate-800 rounded border">
                <code className="text-sm flex-1 truncate">{shortLink}</code>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={handleCopy}
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>

              <div className="text-xs text-gray-500">
                Partagez ce lien avec vos camarades de classe
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

**Intégration dans CourseDetail.jsx**:
```jsx
import ShareButton from '@/components/ShareButton';

// Dans le header du cours
<div className="flex items-center gap-4">
  <Button onClick={() => navigate('/my-courses')}>
    <ChevronLeft className="w-5 h-5 mr-2" />
    Retour
  </Button>
  
  <ShareButton 
    url={window.location.href}
    title={matiere.name}
    description={`Cours complet de ${matiere.name}`}
    type="course"
    resourceId={matiereId}
  />
</div>
```

---

### **Tâche 6: Créer page "Mes Liens de Partage"** (60 min)

**Fichier**: `src/pages/MySharedLinks.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, ExternalLink, Copy, Trash2, BarChart3 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { sharedLinksHelpers } from '@/lib/supabaseHelpers';
import dubService from '@/services/dubService';
import { useToast } from '@/components/ui/use-toast';

export default function MySharedLinks() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    if (user) {
      loadLinks();
    }
  }, [user, selectedType]);

  const loadLinks = async () => {
    setLoading(true);
    try {
      const typeFilter = selectedType === 'all' ? null : selectedType;
      const { data, error } = await sharedLinksHelpers.getUserLinks(user.id, typeFilter);
      
      if (error) throw error;
      setLinks(data || []);
    } catch (error) {
      console.error('Error loading links:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les liens",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (shortLink) => {
    await navigator.clipboard.writeText(shortLink);
    toast({
      title: "Copié ! ✅",
      description: "Le lien a été copié"
    });
  };

  const handleDelete = async (linkId) => {
    if (!confirm('Supprimer ce lien ?')) return;
    
    try {
      await sharedLinksHelpers.deleteLink(user.id, linkId);
      toast({
        title: "Supprimé",
        description: "Le lien a été supprimé"
      });
      loadLinks();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le lien",
        variant: "destructive"
      });
    }
  };

  const handleRefreshAnalytics = async (link) => {
    try {
      const analytics = await dubService.getLinkAnalytics(link.link_id);
      await sharedLinksHelpers.updateLinkAnalytics(link.link_id, analytics);
      toast({
        title: "Mis à jour",
        description: "Les statistiques ont été actualisées"
      });
      loadLinks();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les stats",
        variant: "destructive"
      });
    }
  };

  const getLinkTypeLabel = (type) => {
    const labels = {
      course: 'Cours',
      quiz: 'Quiz',
      exam: 'Examen',
      certificate: 'Certificat',
      referral: 'Parrainage'
    };
    return labels[type] || type;
  };

  const getLinkTypeColor = (type) => {
    const colors = {
      course: 'bg-blue-500',
      quiz: 'bg-green-500',
      exam: 'bg-purple-500',
      certificate: 'bg-yellow-500',
      referral: 'bg-pink-500'
    };
    return colors[type] || 'bg-gray-500';
  };

  return (
    <>
      <Helmet>
        <title>Mes Liens de Partage - E-Réussite</title>
      </Helmet>

      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 py-8 mt-16">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Mes Liens de Partage
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              Gérez tous vos liens courts créés avec Dub.co
            </p>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-6">
            {['all', 'course', 'quiz', 'exam', 'certificate', 'referral'].map(type => (
              <Button
                key={type}
                variant={selectedType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType(type)}
              >
                {type === 'all' ? 'Tous' : getLinkTypeLabel(type)}
              </Button>
            ))}
          </div>

          {/* Links Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : links.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Link className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Aucun lien créé pour le moment</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {links.map(link => (
                <Card key={link.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      {/* Link Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getLinkTypeColor(link.link_type)}>
                            {getLinkTypeLabel(link.link_type)}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            Créé le {new Date(link.created_at).toLocaleDateString('fr-FR')}
                          </span>
                        </div>

                        <h3 className="font-semibold text-lg mb-1 truncate">
                          {link.title}
                        </h3>
                        {link.description && (
                          <p className="text-sm text-gray-500 mb-3">
                            {link.description}
                          </p>
                        )}

                        {/* Short Link */}
                        <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-slate-800 rounded border mb-3">
                          <code className="text-sm text-blue-600 dark:text-blue-400 flex-1 truncate">
                            {link.short_link}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCopy(link.short_link)}
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

                        {/* Analytics */}
                        {link.clicks > 0 && (
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            📊 {link.clicks} clic{link.clicks > 1 ? 's' : ''}
                            {link.last_clicked_at && (
                              <span className="ml-2">
                                • Dernier: {new Date(link.last_clicked_at).toLocaleDateString('fr-FR')}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRefreshAnalytics(link)}
                          title="Actualiser les stats"
                        >
                          <BarChart3 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(link.id)}
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
```

---

### **Tâche 7: Créer page "Parrainage"** (60 min)

**Fichier**: `src/pages/Referral.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { UserPlus, Copy, Check, Gift, TrendingUp } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { sharedLinksHelpers } from '@/lib/supabaseHelpers';
import dubService from '@/services/dubService';
import { useToast } from '@/components/ui/use-toast';

export default function Referral() {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [referralLink, setReferralLink] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({
    totalReferrals: 0,
    successfulSignups: 0,
    pointsEarned: 0
  });

  useEffect(() => {
    if (user) {
      loadReferralLink();
      loadStats();
    }
  }, [user]);

  const loadReferralLink = async () => {
    try {
      // Chercher si un lien existe déjà
      const { data } = await sharedLinksHelpers.getUserLinks(user.id, 'referral');
      
      if (data && data.length > 0) {
        setReferralLink(data[0].short_link);
      }
    } catch (error) {
      console.error('Error loading referral link:', error);
    }
  };

  const loadStats = async () => {
    // TODO: Créer une fonction pour récupérer les stats de parrainage
    // depuis la table users (referrals_count, referral_points, etc.)
  };

  const handleCreateLink = async () => {
    setLoading(true);
    try {
      const result = await dubService.createReferralLink({
        id: user.id,
        username: userProfile?.username || user.id.substring(0, 8),
        full_name: userProfile?.full_name || 'Ami',
        level: userProfile?.level || 'Élève'
      });

      setReferralLink(result.shortLink);

      // Sauvegarder dans Supabase
      await sharedLinksHelpers.saveSharedLink(user.id, {
        ...result,
        type: 'referral',
        resourceId: user.id,
        title: `Lien de parrainage de ${userProfile?.full_name || 'vous'}`,
        description: 'Rejoignez E-Réussite via ce lien'
      });

      toast({
        title: "Lien créé ! 🎉",
        description: "Votre lien de parrainage est prêt"
      });
    } catch (error) {
      console.error('Error creating referral link:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le lien",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast({
      title: "Copié ! ✅",
      description: "Le lien a été copié"
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Helmet>
        <title>Programme de Parrainage - E-Réussite</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Navbar />

        <div className="max-w-4xl mx-auto px-4 py-8 mt-16">
          {/* Hero */}
          <div className="text-center mb-12">
            <div className="inline-block p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
              <UserPlus className="w-12 h-12 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Invite tes amis, gagne des récompenses !
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Partage E-Réussite avec tes camarades et débloquez des avantages exclusifs
            </p>
          </div>

          {/* Referral Link Card */}
          <Card className="mb-8 border-2 border-primary/20 dark:bg-slate-800 dark:border-white/20 shadow-xl dark:shadow-[0_0_40px_rgba(255,255,255,0.5)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-white">
                <Gift className="w-5 h-5 text-primary" />
                Ton lien de parrainage
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!referralLink ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">
                    Génère ton lien unique de parrainage
                  </p>
                  <Button onClick={handleCreateLink} disabled={loading}>
                    {loading ? 'Création...' : 'Créer mon lien'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border-2 border-blue-200 dark:border-blue-700">
                    <code className="text-lg text-blue-600 dark:text-blue-400 flex-1 truncate font-semibold">
                      {referralLink}
                    </code>
                    <Button onClick={handleCopy} size="lg">
                      {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                      {copied ? 'Copié !' : 'Copier'}
                    </Button>
                  </div>

                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    💡 Partage ce lien avec tes amis sur WhatsApp, Facebook, ou par email
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card className="dark:bg-slate-800 dark:border-white/20 shadow-lg dark:shadow-[0_0_30px_rgba(255,255,255,0.4)]">
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                  {stats.totalReferrals}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Clics sur ton lien</p>
              </CardContent>
            </Card>

            <Card className="dark:bg-slate-800 dark:border-white/20 shadow-lg dark:shadow-[0_0_30px_rgba(255,255,255,0.4)]">
              <CardContent className="p-6 text-center">
                <UserPlus className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                  {stats.successfulSignups}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Amis inscrits</p>
              </CardContent>
            </Card>

            <Card className="dark:bg-slate-800 dark:border-white/20 shadow-lg dark:shadow-[0_0_30px_rgba(255,255,255,0.4)]">
              <CardContent className="p-6 text-center">
                <Gift className="w-8 h-8 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                  +{stats.pointsEarned}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Points gagnés</p>
              </CardContent>
            </Card>
          </div>

          {/* Rewards */}
          <Card className="dark:bg-slate-800 dark:border-white/20 shadow-lg dark:shadow-[0_0_30px_rgba(255,255,255,0.4)]">
            <CardHeader>
              <CardTitle className="dark:text-white">Récompenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <div>
                    <p className="font-semibold dark:text-white">1 ami inscrit</p>
                    <p className="text-sm text-gray-500">+50 points</p>
                  </div>
                  <span className="text-2xl">🎯</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <div>
                    <p className="font-semibold dark:text-white">5 amis inscrits</p>
                    <p className="text-sm text-gray-500">Badge "Ambassadeur" + 500 points</p>
                  </div>
                  <span className="text-2xl">🏆</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <div>
                    <p className="font-semibold dark:text-white">10 amis inscrits</p>
                    <p className="text-sm text-gray-500">1 mois Premium gratuit</p>
                  </div>
                  <span className="text-2xl">👑</span>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex justify-between text-sm text-gray-500 mb-2">
                  <span>Progression vers le prochain palier</span>
                  <span>{stats.successfulSignups}/5</span>
                </div>
                <Progress value={(stats.successfulSignups / 5) * 100} className="h-3" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
```

---

## 📋 Checklist de Finalisation

### Phase 1 (Immédiat)
- [ ] Créer Edge Function `dub-get-analytics`
- [ ] Mettre à jour `dubService.js` avec `getLinkAnalytics()`
- [ ] Créer migration `shared_links` table
- [ ] Ajouter helpers Supabase pour liens
- [ ] Déployer et tester

### Phase 2 (Court terme)
- [ ] Créer composant `ShareButton`
- [ ] Intégrer sur pages Cours, Quiz, Examens
- [ ] Créer page "Mes Liens de Partage"
- [ ] Créer page "Parrainage"
- [ ] Ajouter routes dans `App.jsx`

### Phase 3 (Moyen terme)
- [ ] Dashboard admin analytics Dub.co
- [ ] Système de récompenses parrainage
- [ ] QR codes pour supports physiques
- [ ] Domaine personnalisé (e-reuss.it)
- [ ] Export PDF certificats avec lien court

---

## 🚀 Commandes Rapides

```bash
# 1. Créer Edge Function analytics
New-Item -Path "supabase\functions\dub-get-analytics\index.ts" -ItemType File -Force

# 2. Déployer
supabase functions deploy dub-get-analytics --no-verify-jwt

# 3. Appliquer migration
supabase db push

# 4. Tester
npm run dev
```

---

## 📊 Métriques de Succès

**Phase 1 terminée quand**:
- ✅ Edge Function analytics déployée
- ✅ Table `shared_links` créée
- ✅ Analytics fonctionnels dans dubService

**Phase 2 terminée quand**:
- ✅ Bouton "Partager" sur 3+ pages
- ✅ Page "Mes Liens" fonctionnelle
- ✅ Page "Parrainage" complète

**Intégration 100% quand**:
- ✅ Toutes les fonctionnalités implémentées
- ✅ Tests end-to-end validés
- ✅ Documentation utilisateur créée

---

**Prochaine action**: Démarrer Phase 1 - Task 1 ? 🚀
