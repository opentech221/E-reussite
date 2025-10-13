/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * MODALE DE PARTAGE AVANCÉE
 * Description: Options de partage multiples (lien, QR, réseaux sociaux, embed)
 * Date: 10 octobre 2025
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Copy,
  Check,
  QrCode,
  Mail,
  Code,
  Share2,
  MessageCircle,
  Send,
  Linkedin,
  Facebook,
  Twitter
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import QRCodeStyling from 'qr-code-styling';

const ShareModal = ({ isOpen, onClose, shareUrl, title, description }) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);

  // Générer le QR Code
  useEffect(() => {
    if (shareUrl && showQR) {
      const qr = new QRCodeStyling({
        width: 300,
        height: 300,
        data: shareUrl,
        image: '/logo.jpg', // Logo au centre du QR Code (format JPEG)
        dotsOptions: {
          color: '#8b5cf6',
          type: 'rounded'
        },
        backgroundOptions: {
          color: '#ffffff'
        },
        cornersSquareOptions: {
          color: '#6d28d9',
          type: 'extra-rounded'
        },
        cornersDotOptions: {
          color: '#6d28d9',
          type: 'dot'
        },
        imageOptions: {
          crossOrigin: 'anonymous',
          margin: 10,
          imageSize: 0.4 // 40% de la taille du QR Code
        }
      });

      const container = document.getElementById('qr-code-container');
      if (container) {
        container.innerHTML = '';
        qr.append(container);
      }
      setQrCode(qr);
    }
  }, [shareUrl, showQR]);

  // Copier le lien
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: '✅ Lien copié !',
        description: 'Le lien a été copié dans le presse-papiers',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '❌ Erreur',
        description: 'Impossible de copier le lien',
      });
    }
  };

  // Télécharger le QR Code
  const handleDownloadQR = () => {
    if (qrCode) {
      qrCode.download({
        name: 'qr-code-recherche',
        extension: 'png'
      });
      toast({
        title: '✅ QR Code téléchargé',
        description: 'Le QR Code a été enregistré',
      });
    }
  };

  // Partage réseaux sociaux
  const shareToSocial = (platform) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(title || 'Recherche E-réussite');
    const encodedDesc = encodeURIComponent(description || '');
    const hashtags = encodeURIComponent('ereussite,education,senegal');

    const urls = {
      whatsapp: `https://wa.me/?text=${encodedTitle}%0A${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}&hashtags=${hashtags}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      email: `mailto:?subject=${encodedTitle}&body=${encodedDesc}%0A%0A${encodedUrl}`
    };

    window.open(urls[platform], '_blank', 'width=600,height=400');

    toast({
      title: '📤 Partage en cours',
      description: `Ouverture de ${platform}...`,
    });
  };

  // Code d'intégration
  const embedCode = `<iframe src="${shareUrl}" width="100%" height="600" frameborder="0"></iframe>`;

  const handleCopyEmbed = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      toast({
        title: '✅ Code copié !',
        description: 'Le code d\'intégration a été copié',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '❌ Erreur',
        description: 'Impossible de copier le code',
      });
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-[95vw] sm:max-w-lg md:max-w-xl lg:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-4 sm:p-6 rounded-t-xl sm:rounded-t-2xl">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg flex-shrink-0">
                  <Share2 className="w-4 h-4 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-2xl font-bold truncate">Partager</h2>
                  <p className="text-purple-100 text-xs sm:text-sm mt-0.5 sm:mt-1 hidden sm:block">Choisissez votre méthode</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
            {/* Lien court */}
            <div className="space-y-2 sm:space-y-3">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                📎 Lien court
              </h3>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-xs sm:text-sm truncate"
                />
                <button
                  onClick={handleCopy}
                  className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
                    copied
                      ? 'bg-green-500 text-white'
                      : 'bg-purple-500 hover:bg-purple-600 text-white'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1 sm:mr-2" />
                      <span className="text-sm sm:text-base">Copié</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1 sm:mr-2" />
                      <span className="text-sm sm:text-base">Copier</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* QR Code */}
            <div className="space-y-2 sm:space-y-3">
              <button
                onClick={() => setShowQR(!showQR)}
                className="flex items-center gap-2 text-base sm:text-lg font-semibold text-gray-900 dark:text-white hover:text-purple-600 transition-colors"
              >
                <QrCode className="w-4 h-4 sm:w-5 sm:h-5" />
                QR Code
                <span className="text-xs sm:text-sm text-gray-500">(cliquez pour {showQR ? 'masquer' : 'afficher'})</span>
              </button>
              {showQR && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="bg-gray-50 dark:bg-gray-800 p-4 sm:p-6 rounded-lg text-center space-y-3 sm:space-y-4"
                >
                  <div id="qr-code-container" className="flex justify-center [&_canvas]:!max-w-full [&_canvas]:!h-auto"></div>
                  <button
                    onClick={handleDownloadQR}
                    className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Télécharger le QR Code
                  </button>
                </motion.div>
              )}
            </div>

            {/* Réseaux sociaux */}
            <div className="space-y-2 sm:space-y-3">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                🌐 Réseaux sociaux
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                {/* WhatsApp */}
                <button
                  onClick={() => shareToSocial('whatsapp')}
                  className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all hover:scale-105 text-sm sm:text-base"
                >
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="font-medium truncate">WhatsApp</span>
                </button>

                {/* Facebook */}
                <button
                  onClick={() => shareToSocial('facebook')}
                  className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all hover:scale-105 text-sm sm:text-base"
                >
                  <Facebook className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="font-medium truncate">Facebook</span>
                </button>

                {/* Twitter */}
                <button
                  onClick={() => shareToSocial('twitter')}
                  className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-all hover:scale-105 text-sm sm:text-base"
                >
                  <Twitter className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="font-medium truncate">Twitter</span>
                </button>

                {/* LinkedIn */}
                <button
                  onClick={() => shareToSocial('linkedin')}
                  className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-all hover:scale-105 text-sm sm:text-base"
                >
                  <Linkedin className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="font-medium truncate">LinkedIn</span>
                </button>

                {/* Telegram */}
                <button
                  onClick={() => shareToSocial('telegram')}
                  className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-sky-400 hover:bg-sky-500 text-white rounded-lg transition-all hover:scale-105 text-sm sm:text-base"
                >
                  <Send className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="font-medium truncate">Telegram</span>
                </button>

                {/* Email */}
                <button
                  onClick={() => shareToSocial('email')}
                  className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all hover:scale-105 text-sm sm:text-base"
                >
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="font-medium truncate">Email</span>
                </button>
              </div>
            </div>

            {/* Code d'intégration */}
            <div className="space-y-2 sm:space-y-3">
              <button
                onClick={() => setShowEmbed(!showEmbed)}
                className="flex items-center gap-2 text-base sm:text-lg font-semibold text-gray-900 dark:text-white hover:text-purple-600 transition-colors"
              >
                <Code className="w-4 h-4 sm:w-5 sm:h-5" />
                Code d'intégration
                <span className="text-xs sm:text-sm text-gray-500">(pour développeurs)</span>
              </button>
              {showEmbed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="space-y-2"
                >
                  <div className="relative">
                    <pre className="bg-gray-900 text-green-400 p-3 sm:p-4 rounded-lg overflow-x-auto text-xs sm:text-sm">
                      <code>{embedCode}</code>
                    </pre>
                    <button
                      onClick={handleCopyEmbed}
                      className="absolute top-2 right-2 p-1.5 sm:p-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                    >
                      <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 sm:p-6 rounded-b-xl sm:rounded-b-2xl">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center">
              💡 Astuce : Le lien court expire après 30 jours d'inactivité
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ShareModal;
