// ============================================================================
// PERPLEXITY SEARCH MODE - Mode recherche avancée avec sources
// Date: 10 octobre 2025
// ============================================================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, ExternalLink, Sparkles, Loader2, AlertCircle, Copy, Check, Download, Share2, History, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import perplexityService from '@/services/perplexityService';
import dubService from '@/services/dubService';
import { supabase } from '@/lib/customSupabaseClient';
import ShareModal from '@/components/ShareModal';
import ExportModal from '@/components/ExportModal';

const PerplexitySearchMode = ({ userContext = {} }) => {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [shortUrl, setShortUrl] = useState(null);
  
  // États des modales
  const [showShareModal, setShowShareModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Charger l'historique au montage
  useEffect(() => {
    loadSearchHistory();
  }, []);

  // Charger l'historique depuis localStorage ou Supabase
  const loadSearchHistory = async () => {
    try {
      // Essayer de charger depuis Supabase
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data, error } = await supabase
          .from('perplexity_searches')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (!error && data) {
          setSearchHistory(data);
          return;
        }
      }

      // Fallback: localStorage
      const localHistory = JSON.parse(localStorage.getItem('perplexity_history') || '[]');
      setSearchHistory(localHistory.slice(0, 10));
    } catch (err) {
      console.error('Erreur chargement historique:', err);
    }
  };

  // Sauvegarder une recherche dans l'historique
  const saveToHistory = async (searchQuery, searchResult) => {
    try {
      // Sauvegarder dans Supabase si connecté
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { error } = await supabase.from('perplexity_searches').insert({
          user_id: user.id,
          query: searchQuery,
          answer: searchResult.answer,
          citations: searchResult.citations || [],
          context: {
            subject: userContext.subject || 'général',
            level: userContext.level || 'BFEM'
          },
          model: searchResult.model || 'sonar-pro'
        });
        
        if (error) {
          console.error('Erreur sauvegarde Supabase:', error);
        }
      } else {
        // Fallback: localStorage
        const historyItem = {
          query: searchQuery,
          answer: searchResult.answer.substring(0, 200) + '...',
          citations: searchResult.citations || [],
          created_at: new Date().toISOString()
        };
        
        const localHistory = JSON.parse(localStorage.getItem('perplexity_history') || '[]');
        localHistory.unshift(historyItem);
        localStorage.setItem('perplexity_history', JSON.stringify(localHistory.slice(0, 10)));
      }

      loadSearchHistory();
    } catch (err) {
      console.error('Erreur sauvegarde historique:', err);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    setError(null);

    try {
      console.log('🔍 [Perplexity] Recherche:', query);
      
      const response = await perplexityService.askWithWebSearch(query, {
        subject: userContext.subject || 'général',
        level: userContext.level || 'BFEM'
      });

      setResult(response);
      console.log('✅ [Perplexity] Résultat avec', response.citations?.length || 0, 'sources');
      
      // Sauvegarder dans l'historique
      await saveToHistory(query, response);
    } catch (err) {
      console.error('❌ [Perplexity] Erreur:', err);
      setError(err.message || 'Erreur lors de la recherche');
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  // Copier la réponse
  const copyAnswer = async () => {
    if (!result) return;
    
    const textToCopy = `${result.answer}\n\nSources:\n${result.citations?.map((c, i) => `${i + 1}. ${c}`).join('\n')}`;
    
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erreur copie:', err);
    }
  };

  // Ouvrir la modale d'export (remplace generatePDF)
  const handleExportClick = async () => {
    if (!result) return;
    
    // Créer un lien court si pas déjà fait
    if (!shortUrl && user) {
      try {
        const shareUrl = window.location.href;
        const shortLink = await dubService.createCourseLink(shareUrl, {
          userId: user.id,
          resourceId: null,
          linkType: 'perplexity',
          title: `Recherche: ${query.substring(0, 50)}...`,
          description: result.answer.substring(0, 100) + '...',
          tags: ['perplexity', 'search']
        });
        setShortUrl(shortLink.shortLink);
      } catch (err) {
        console.error('Erreur création lien court:', err);
      }
    }
    
    setShowExportModal(true);
  };

  // Ouvrir la modale de partage (remplace shareResult)
  const handleShareClick = async () => {
    if (!result) return;
    
    // Créer un lien court si pas déjà fait
    if (!shortUrl && user) {
      try {
        const shareUrl = window.location.href;
        const shortLink = await dubService.createCourseLink(shareUrl, {
          userId: user.id,
          resourceId: null,
          linkType: 'perplexity',
          title: `Recherche: ${query.substring(0, 50)}...`,
          description: result.answer.substring(0, 100) + '...',
          tags: ['perplexity', 'search']
        });
        setShortUrl(shortLink.shortLink);
      } catch (err) {
        console.error('Erreur création lien court:', err);
        setError('Erreur lors de la création du lien de partage');
      }
    }
    
    setShowShareModal(true);
  };

  return (
    <div className="flex flex-col h-full min-h-[500px] max-h-[calc(100vh-12rem)]">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-gray-700 dark:border-gray-600 bg-gradient-to-r from-purple-600/20 to-blue-600/20 dark:from-purple-700/30 dark:to-blue-700/30">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 dark:text-purple-300 flex-shrink-0" />
            <h3 className="text-base sm:text-lg font-semibold text-white dark:text-gray-100 truncate">Recherche Avancée</h3>
            <span className="px-1.5 sm:px-2 py-0.5 bg-purple-600 dark:bg-purple-700 text-white text-[10px] sm:text-xs font-bold rounded flex-shrink-0">PRO</span>
          </div>
          <Button
            onClick={() => setShowHistory(!showHistory)}
            variant="ghost"
            size="sm"
            className="text-gray-400 dark:text-gray-300 hover:text-white dark:hover:text-white hover:bg-white/10 dark:hover:bg-white/10 flex-shrink-0 px-2 sm:px-3"
          >
            <History className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
            <span className="hidden sm:inline text-sm">Historique</span>
          </Button>
        </div>
        <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-300 hidden sm:block">
          Posez vos questions, je cherche sur le web avec Perplexity Pro et cite mes sources 📚
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-300 sm:hidden">
          Recherche web avec sources vérifiées 📚
        </p>
      </div>

      {/* Historique (si activé) */}
      {showHistory && searchHistory.length > 0 && (
        <div className="p-3 sm:p-4 border-b border-gray-700 dark:border-gray-600 bg-gray-800/50 dark:bg-gray-700/50 max-h-48 sm:max-h-60 overflow-y-auto">
          <h4 className="text-xs sm:text-sm font-semibold text-gray-300 dark:text-gray-200 mb-2 flex items-center gap-2">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
            Recherches récentes
          </h4>
          <div className="space-y-2">
            {searchHistory.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  setQuery(item.query);
                  setShowHistory(false);
                }}
                className="w-full p-2 text-left bg-gray-700/30 dark:bg-gray-600/30 hover:bg-gray-700/50 dark:hover:bg-gray-600/50 
                         border border-gray-600 dark:border-gray-500 hover:border-purple-500/50 dark:hover:border-purple-400/50 rounded
                         transition-all text-xs sm:text-sm"
              >
                <p className="text-gray-300 dark:text-gray-200 truncate">{item.query}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {item.citations?.length || 0} sources • {new Date(item.created_at).toLocaleString('fr-FR', { 
                    day: 'numeric', 
                    month: 'short', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Zone */}
      <div className="p-3 sm:p-4 border-b border-gray-700 dark:border-gray-600">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ex: Programme maths BFEM 2026"
            className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-gray-700/50 dark:bg-gray-600/50 border border-gray-600 dark:border-gray-500 rounded-lg
                     text-sm sm:text-base text-white dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-300 focus:outline-none focus:border-purple-500 dark:focus:border-purple-400
                     transition-colors"
            disabled={isSearching}
          />
          <Button
            onClick={handleSearch}
            disabled={isSearching || !query.trim()}
            className="bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-700 dark:to-blue-700 hover:from-purple-700 
                     hover:to-blue-700 dark:hover:from-purple-800 dark:hover:to-blue-800 text-white px-4 sm:px-6 py-2 sm:py-3 disabled:opacity-50 w-full sm:w-auto"
          >
            {isSearching ? (
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
            ) : (
              <>
                <Search className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-1" />
                <span className="hidden sm:inline">Rechercher</span>
              </>
            )}
          </Button>
        </div>

        {/* Context Info */}
        {userContext.subject && (
          <div className="mt-2 text-[10px] sm:text-xs text-gray-400 dark:text-gray-300">
            📚 Contexte: {userContext.subject} - Niveau {userContext.level}
          </div>
        )}
      </div>

      {/* Results Zone */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 space-y-3 sm:space-y-4">
        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg overflow-hidden"
          >
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="font-semibold">Erreur</span>
            </div>
            <p className="mt-2 text-sm text-red-300 break-words">{error}</p>
          </motion.div>
        )}

        {/* Loading State */}
        {isSearching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 space-y-4"
          >
            <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
            <p className="text-gray-400">Recherche en cours sur le web...</p>
          </motion.div>
        )}

        {/* Result Display */}
        {result && !isSearching && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3 sm:space-y-4"
          >
            {/* Actions Bar */}
            <div className="flex items-center gap-1.5 sm:gap-2 justify-end flex-wrap">
              <Button
                onClick={copyAnswer}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-green-400" />
                    <span className="hidden sm:inline">Copié !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                    <span className="hidden sm:inline">Copier</span>
                  </>
                )}
              </Button>
              
              <Button
                onClick={handleExportClick}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white hover:bg-indigo-500/20 transition-all text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
              >
                <Download className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                <span className="hidden sm:inline">Exporter</span>
              </Button>
              
              <Button
                onClick={handleShareClick}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white hover:bg-purple-500/20 transition-all text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
              >
                <Share2 className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                <span className="hidden sm:inline">Partager</span>
              </Button>
            </div>

            {/* Short URL si disponible */}
            {shortUrl && (
              <div className="p-2.5 sm:p-3 bg-green-500/10 border border-green-500/30 rounded-lg overflow-hidden">
                <div className="flex items-center gap-2 min-w-0">
                  <Share2 className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 text-green-400" />
                  <span className="hidden sm:inline text-xs sm:text-sm text-green-400 flex-shrink-0">Lien de partage:</span>
                  <a 
                    href={shortUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-xs sm:text-sm text-green-400 underline truncate min-w-0 block"
                  >
                    {shortUrl}
                  </a>
                </div>
              </div>
            )}

            {/* Answer */}
            <div className="p-3 sm:p-4 bg-gray-700/30 border border-gray-600 rounded-lg overflow-hidden">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-semibold text-purple-400">Réponse</span>
              </div>
              <div className="prose prose-invert max-w-none prose-sm sm:prose-base overflow-hidden">
                <p className="text-gray-200 whitespace-pre-wrap leading-relaxed text-sm sm:text-base break-words overflow-wrap-anywhere">
                  {result.answer}
                </p>
              </div>
            </div>

            {/* Citations */}
            {result.citations && result.citations.length > 0 && (
              <div className="p-3 sm:p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg overflow-hidden">
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold text-blue-400">
                    Sources ({result.citations.length})
                  </span>
                </div>
                <div className="space-y-2">
                  {result.citations.map((citation, index) => (
                    <a
                      key={index}
                      href={citation}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-2 sm:p-3 bg-gray-700/30 hover:bg-gray-700/50 
                               border border-gray-600 hover:border-blue-500/50
                               rounded-lg transition-all group overflow-hidden"
                    >
                      <div className="flex items-center justify-between gap-2 min-w-0">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm text-gray-300 truncate group-hover:text-blue-400 overflow-hidden">
                            {citation}
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                            Source {index + 1}
                          </p>
                        </div>
                        <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 group-hover:text-blue-400 
                                                flex-shrink-0" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="text-[10px] sm:text-xs text-gray-500 text-center">
              Recherché avec {result.model} • {new Date(result.timestamp).toLocaleTimeString('fr-FR')}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!result && !isSearching && !error && (
          <div className="flex flex-col items-center justify-center py-8 sm:py-12 space-y-3 sm:space-y-4 text-center px-3">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-600/20 to-blue-600/20 dark:from-purple-700/30 dark:to-blue-700/30
                          rounded-full flex items-center justify-center">
              <Search className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400 dark:text-purple-300" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-semibold text-white dark:text-gray-100 mb-1.5 sm:mb-2">
                Recherche intelligente
              </h4>
              <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-300 max-w-sm">
                Posez vos questions sur les programmes scolaires, les examens, 
                ou n'importe quel sujet éducatif. Je cherche les meilleures sources 
                pour vous répondre.
              </p>
            </div>
            <div className="space-y-1.5 sm:space-y-2 w-full max-w-md">
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-semibold mb-1.5 sm:mb-2">Exemples de questions:</p>
              {[
                'Programme officiel maths BFEM 2025',
                'Nouvelles épreuves BAC Sénégal',
                'Théorème de Pythagore applications'
              ].map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => setQuery(example)}
                  className="w-full p-2 sm:p-3 text-left bg-gray-700/30 dark:bg-gray-600/30 hover:bg-gray-700/50 dark:hover:bg-gray-600/50
                           border border-gray-600 dark:border-gray-500 hover:border-purple-500/50 dark:hover:border-purple-400/50 rounded-lg
                           text-xs sm:text-sm text-gray-300 dark:text-gray-200 transition-all"
                >
                  💡 {example}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modales */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        shareUrl={shortUrl || window.location.href}
        title={`Recherche: ${query}`}
        description={result?.answer.substring(0, 200) + '...'}
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        searchData={{
          query,
          answer: result?.answer || '',
          citations: result?.citations || [],
          model: 'Perplexity Pro (sonar-pro)'
        }}
      />
    </div>
  );
};

export default PerplexitySearchMode;
