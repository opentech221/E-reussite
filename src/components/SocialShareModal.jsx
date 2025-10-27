// =============================================
// MODAL DE PARTAGE SOCIAL
// Partage des résultats sur les réseaux sociaux
// =============================================

import React, { useState } from 'react';
import { 
  Share2, 
  MessageCircle, 
  Twitter, 
  Facebook, 
  Linkedin, 
  Link, 
  Download,
  X,
  Check
} from 'lucide-react';
import { shareResults } from '@/services/socialShareService';

export default function SocialShareModal({ 
  result, 
  isOpen, 
  onClose,
  // Nouvelles props pour Phase 2
  competitionTitle,
  score,
  rank,
  totalParticipants,
  badges = []
}) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  // Support de l'ancienne et nouvelle API
  const resultData = result || {
    competitionTitle,
    score,
    rank,
    totalParticipants,
    badges
  };

  const handleShare = async (platform) => {
    try {
      const shareText = shareResults.generateShareText(resultData);
      const shareUrl = window.location.origin + '/competitions';

      switch (platform) {
        case 'whatsapp':
          shareResults.shareOnWhatsApp(shareText, shareUrl);
          break;
        case 'twitter':
          shareResults.shareOnTwitter(shareText, shareUrl);
          break;
        case 'facebook':
          shareResults.shareOnFacebook(shareUrl, shareText);
          break;
        case 'linkedin':
          shareResults.shareOnLinkedIn(shareUrl, shareText);
          break;
        case 'copy':
          await navigator.clipboard.writeText(shareText + '\n\n' + shareUrl);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
          break;
        case 'native':
          if (navigator.share) {
            await navigator.share({
              title: resultData.competitionTitle,
              text: shareText,
              url: shareUrl
            });
          }
          break;
        case 'download':
          setDownloading(true);
          const imageData = await shareResults.generateShareImage(resultData);
          const link = document.createElement('a');
          link.href = imageData;
          link.download = `E-Reussite-${resultData.competitionTitle?.replace(/\s/g, '-')}.png`;
          link.click();
          setDownloading(false);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('❌ Erreur partage:', error);
      setDownloading(false);
    }
  };

  const shareOptions = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-500 hover:bg-green-600',
      textColor: 'text-green-600'
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: Twitter,
      color: 'bg-sky-500 hover:bg-sky-600',
      textColor: 'text-sky-600'
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      textColor: 'text-blue-600'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-blue-700 hover:bg-blue-800',
      textColor: 'text-blue-700'
    }
  ];

  const rankEmoji = resultData.rank === 1 ? '🥇' : resultData.rank === 2 ? '🥈' : resultData.rank === 3 ? '🥉' : '🏆';

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center">
              <div className="text-6xl mb-3">{rankEmoji}</div>
              <h2 className="text-2xl font-bold mb-1">Félicitations !</h2>
              <p className="text-white/90">
                Rang #{resultData.rank} • {resultData.score} points
              </p>
              
              {/* Badges obtenus */}
              {resultData.badges && resultData.badges.length > 0 && (
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  {resultData.badges.map((badge, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium"
                    >
                      🏆 {badge.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Partage ton résultat ! 🎉
            </h3>

            {/* Options de partage */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {shareOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleShare(option.id)}
                  className={`${option.color} text-white rounded-xl p-4 flex flex-col items-center gap-2 transition transform hover:scale-105`}
                >
                  <option.icon className="w-6 h-6" />
                  <span className="text-sm font-medium">{option.name}</span>
                </button>
              ))}
            </div>

            {/* Actions supplémentaires */}
            <div className="space-y-2">
              {/* Partage natif (mobile) */}
              {navigator.share && (
                <button
                  onClick={() => handleShare('native')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                >
                  <Share2 className="w-5 h-5" />
                  <span className="font-medium">Partager</span>
                </button>
              )}

              {/* Copier le lien */}
              <button
                onClick={() => handleShare('copy')}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="font-medium text-green-500">Lien copié !</span>
                  </>
                ) : (
                  <>
                    <Link className="w-5 h-5" />
                    <span className="font-medium">Copier le lien</span>
                  </>
                )}
              </button>

              {/* Télécharger l'image */}
              <button
                onClick={() => handleShare('download')}
                disabled={downloading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition disabled:opacity-50"
              >
                <Download className={`w-5 h-5 ${downloading ? 'animate-bounce' : ''}`} />
                <span className="font-medium">
                  {downloading ? 'Téléchargement...' : 'Télécharger l\'image'}
                </span>
              </button>
            </div>

            {/* Message d'encouragement */}
            <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl">
              <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
                💡 <strong>Invite tes amis</strong> à rejoindre E-Réussite et progressez ensemble !
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
