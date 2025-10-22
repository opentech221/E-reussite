import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, X, Wifi, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInstallPWA } from '@/hooks/useTouchGestures';
import { toast } from 'sonner';

const PWAManager = () => {
  const { isInstallable, isInstalled, promptInstall } = useInstallPWA();
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineNotice, setShowOfflineNotice] = useState(false);
  const [swRegistration, setSwRegistration] = useState(null);
  const [hasUpdate, setHasUpdate] = useState(false);

  // Enregistrer le Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/'
      });
      
      console.log('[PWA] Service Worker enregistré:', registration.scope);
      setSwRegistration(registration);

      // Vérifier les mises à jour
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('[PWA] Nouvelle version disponible');
            setHasUpdate(true);
            toast.info('Nouvelle version disponible', {
              description: 'Actualisez pour obtenir les dernières fonctionnalités',
              action: {
                label: 'Actualiser',
                onClick: () => handleUpdate()
              }
            });
          }
        });
      });

      // Vérifier les mises à jour toutes les heures
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000);

    } catch (error) {
      console.error('[PWA] Erreur lors de l\'enregistrement du Service Worker:', error);
    }
  };

  const handleUpdate = () => {
    if (swRegistration?.waiting) {
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  // Gérer l'état de connexion
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineNotice(false);
      toast.success('Connexion rétablie', {
        description: 'Vous êtes de nouveau en ligne'
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineNotice(true);
      toast.warning('Connexion perdue', {
        description: 'Mode hors ligne activé'
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Afficher le prompt d'installation après 30 secondes
  useEffect(() => {
    if (isInstallable && !isInstalled) {
      const timer = setTimeout(() => {
        setShowInstallPrompt(true);
      }, 30000); // 30 secondes

      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled]);

  const handleInstall = async () => {
    const installed = await promptInstall();
    if (installed) {
      setShowInstallPrompt(false);
      toast.success('Application installée !', {
        description: 'E-Réussite est maintenant disponible sur votre écran d\'accueil'
      });
    }
  };

  return (
    <>
      {/* Indicateur de connexion */}
      <AnimatePresence>
        {showOfflineNotice && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50"
          >
            <Card className="bg-yellow-50 border-yellow-300">
              <CardContent className="py-3 px-4 flex items-center gap-3">
                <WifiOff className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-semibold text-yellow-900">Mode hors ligne</p>
                  <p className="text-xs text-yellow-700">
                    Fonctionnalités limitées disponibles
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prompt d'installation PWA */}
      <AnimatePresence>
        {showInstallPrompt && isInstallable && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
          >
            <Card className="bg-gradient-to-br from-primary to-purple-600 text-white shadow-2xl">
              <CardContent className="p-4">
                <button
                  onClick={() => setShowInstallPrompt(false)}
                  className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-start gap-4 mb-4">
                  <div className="bg-white/20 p-3 rounded-xl">
                    <Download className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">
                      Installer E-Réussite
                    </h3>
                    <p className="text-sm text-white/90">
                      Accédez plus rapidement à vos cours et étudiez même hors ligne !
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={handleInstall}
                    className="w-full bg-white text-primary hover:bg-white/90"
                    size="lg"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Installer l'application
                  </Button>
                  <Button
                    onClick={() => setShowInstallPrompt(false)}
                    variant="ghost"
                    className="w-full text-white hover:bg-white/10"
                  >
                    Plus tard
                  </Button>
                </div>

                <div className="mt-4 pt-4 border-t border-white/20">
                  <ul className="text-xs space-y-2 text-white/80">
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-white rounded-full"></span>
                      <span>Accès rapide depuis l'écran d'accueil</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-white rounded-full"></span>
                      <span>Fonctionne sans connexion Internet</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-white rounded-full"></span>
                      <span>Notifications de nouveaux contenus</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bouton d'installation flottant (si déjà fermé le prompt) */}
      {isInstallable && !showInstallPrompt && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleInstall}
          className="fixed bottom-20 right-4 bg-primary text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-shadow z-40"
          title="Installer l'application"
        >
          <Download className="w-6 h-6" />
        </motion.button>
      )}
    </>
  );
};

export default PWAManager;
