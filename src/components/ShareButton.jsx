import React, { useState } from 'react';
import { Share2, Copy, Check, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/components/ui/use-toast';
import dubService from '@/services/dubService';
import { dbHelpers } from '@/lib/supabaseHelpers';
import { useAuth } from '@/contexts/SupabaseAuthContext';

/**
 * Composant réutilisable pour partager du contenu via Dub.co
 * 
 * @param {string} url - URL complète à partager
 * @param {string} title - Titre du contenu
 * @param {string} description - Description du contenu
 * @param {string} type - Type de contenu ('course', 'quiz', 'exam', 'certificate', 'perplexity')
 * @param {string} resourceId - ID de la ressource (UUID)
 * @param {object} options - Options supplémentaires (domain, slug, tags)
 * @param {string} variant - Variant du bouton ('default', 'outline', 'ghost')
 * @param {string} size - Taille du bouton ('sm', 'default', 'lg')
 * @param {boolean} showIcon - Afficher l'icône
 * @param {string} buttonText - Texte du bouton
 */
export default function ShareButton({ 
  url, 
  title, 
  description = '', 
  type = 'course',
  resourceId = null,
  options = {},
  variant = 'outline',
  size = 'sm',
  showIcon = true,
  buttonText = 'Partager'
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [shortLink, setShortLink] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleShare = async () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour partager du contenu",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      console.log('📤 [ShareButton] Création lien:', { url, type, title });

      // Créer le lien court via tracking maison
      const result = await dubService.createCourseLink(url, {
        userId: user.id, // ✅ AJOUTÉ
        resourceId: resourceId,
        linkType: type, // ✅ AJOUTÉ: Transmettre le type (course, quiz, exam, etc.)
        title,
        description,
        tags: options.tags || [type],
        slug: options.slug
      });

      console.log('✅ [ShareButton] Lien créé:', result.shortLink);
      setShortLink(result.shortLink);

      // Note: Plus besoin de saveSharedLink car createCourseLink fait déjà l'INSERT dans shared_links

      toast({
        title: "Lien créé ! 🔗",
        description: "Votre lien de partage est prêt",
      });
    } catch (error) {
      console.error('❌ [ShareButton] Erreur création lien:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le lien de partage",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortLink);
      setCopied(true);
      toast({
        title: "Copié ! ✅",
        description: "Le lien a été copié dans le presse-papier"
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('❌ [ShareButton] Erreur copie:', error);
      toast({
        title: "Erreur",
        description: "Impossible de copier le lien",
        variant: "destructive"
      });
    }
  };

  const handleOpenLink = () => {
    if (shortLink) {
      window.open(shortLink, '_blank', 'noopener,noreferrer');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share && shortLink) {
      try {
        await navigator.share({
          title: title,
          text: description,
          url: shortLink,
        });
        console.log('✅ [ShareButton] Partage natif réussi');
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('❌ [ShareButton] Erreur partage natif:', error);
        }
      }
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant={variant} size={size} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Création...
            </>
          ) : (
            <>
              {showIcon && <Share2 className="w-4 h-4 mr-2" />}
              {buttonText}
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 dark:bg-slate-800 dark:border-white/20">
        <div className="space-y-4">
          {/* Header */}
          <div>
            <h4 className="font-semibold text-sm mb-2 dark:text-white flex items-center gap-2">
              <Share2 className="w-4 h-4 text-primary" />
              Partager ce contenu
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
              {title}
            </p>
          </div>

          {/* Lien court ou bouton création */}
          {!shortLink ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Créez un lien court facile à partager avec vos camarades
              </p>
              <Button 
                onClick={handleShare} 
                disabled={loading}
                className="w-full"
                size="default"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 mr-2" />
                    Créer un lien court
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Lien court affiché */}
              <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-700">
                <code className="text-sm text-blue-600 dark:text-blue-400 flex-1 truncate font-mono">
                  {shortLink}
                </code>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={handleCopy}
                  className="shrink-0"
                  title="Copier le lien"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={handleOpenLink}
                  className="shrink-0"
                  title="Ouvrir le lien"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>

              {/* Actions de partage */}
              <div className="space-y-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  💡 Partagez ce lien sur :
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {navigator.share && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleNativeShare}
                      className="text-xs"
                    >
                      📱 Partager
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleCopy}
                    className="text-xs"
                  >
                    📋 Copier
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(title + ' - ' + shortLink)}`, '_blank')}
                    className="text-xs"
                  >
                    💬 WhatsApp
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shortLink)}`, '_blank')}
                    className="text-xs"
                  >
                    📘 Facebook
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shortLink)}&text=${encodeURIComponent(title)}`, '_blank')}
                    className="text-xs"
                  >
                    🐦 Twitter
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => window.open(`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(shortLink)}`, '_blank')}
                    className="text-xs"
                  >
                    📧 Email
                  </Button>
                </div>
              </div>

              {/* Info */}
              <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t dark:border-gray-700">
                📊 Vous pouvez suivre les statistiques de ce lien dans{' '}
                <span className="text-primary font-medium">Mes Liens de Partage</span>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
