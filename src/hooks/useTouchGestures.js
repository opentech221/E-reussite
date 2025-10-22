import { useEffect, useRef, useState } from 'react';

/**
 * Hook personnalisé pour gérer les gestures tactiles (swipe, pinch, long press)
 * @param {Object} options - Options de configuration
 * @param {Function} options.onSwipeLeft - Callback pour swipe vers la gauche
 * @param {Function} options.onSwipeRight - Callback pour swipe vers la droite
 * @param {Function} options.onSwipeUp - Callback pour swipe vers le haut
 * @param {Function} options.onSwipeDown - Callback pour swipe vers le bas
 * @param {Function} options.onPinchIn - Callback pour pinch-in (zoom out)
 * @param {Function} options.onPinchOut - Callback pour pinch-out (zoom in)
 * @param {Function} options.onLongPress - Callback pour appui long
 * @param {Number} options.minSwipeDistance - Distance minimale pour un swipe (défaut: 50px)
 * @param {Number} options.maxSwipeTime - Temps max pour un swipe (défaut: 300ms)
 * @param {Number} options.longPressDelay - Délai pour l'appui long (défaut: 500ms)
 * @returns {Object} - Ref à attacher à l'élément et état du gesture
 */
export const useTouchGestures = ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onPinchIn,
  onPinchOut,
  onLongPress,
  minSwipeDistance = 50,
  maxSwipeTime = 300,
  longPressDelay = 500
} = {}) => {
  const elementRef = useRef(null);
  const [gestureState, setGestureState] = useState({
    isSwiping: false,
    isPinching: false,
    isLongPressing: false
  });

  // État du touch
  const touchState = useRef({
    startX: 0,
    startY: 0,
    startTime: 0,
    currentX: 0,
    currentY: 0,
    initialDistance: 0,
    longPressTimer: null,
    touches: []
  });

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Calculer la distance entre deux touches (pour le pinch)
    const getDistance = (touch1, touch2) => {
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    // Gestion du début du touch
    const handleTouchStart = (e) => {
      const touches = Array.from(e.touches);
      touchState.current.touches = touches;

      if (touches.length === 1) {
        // Touch simple - potentiel swipe ou long press
        const touch = touches[0];
        touchState.current.startX = touch.clientX;
        touchState.current.startY = touch.clientY;
        touchState.current.currentX = touch.clientX;
        touchState.current.currentY = touch.clientY;
        touchState.current.startTime = Date.now();

        // Démarrer le timer pour l'appui long
        if (onLongPress) {
          touchState.current.longPressTimer = setTimeout(() => {
            setGestureState(prev => ({ ...prev, isLongPressing: true }));
            onLongPress(e);
          }, longPressDelay);
        }
      } else if (touches.length === 2) {
        // Deux touches - potentiel pinch
        touchState.current.initialDistance = getDistance(touches[0], touches[1]);
        setGestureState(prev => ({ ...prev, isPinching: true }));

        // Annuler le timer d'appui long si actif
        if (touchState.current.longPressTimer) {
          clearTimeout(touchState.current.longPressTimer);
          touchState.current.longPressTimer = null;
        }
      }
    };

    // Gestion du mouvement du touch
    const handleTouchMove = (e) => {
      const touches = Array.from(e.touches);

      if (touches.length === 1) {
        // Swipe
        const touch = touches[0];
        touchState.current.currentX = touch.clientX;
        touchState.current.currentY = touch.clientY;

        const deltaX = Math.abs(touch.clientX - touchState.current.startX);
        const deltaY = Math.abs(touch.clientY - touchState.current.startY);

        // Si mouvement détecté, annuler l'appui long
        if ((deltaX > 10 || deltaY > 10) && touchState.current.longPressTimer) {
          clearTimeout(touchState.current.longPressTimer);
          touchState.current.longPressTimer = null;
          setGestureState(prev => ({ ...prev, isLongPressing: false }));
        }

        if (deltaX > minSwipeDistance / 2 || deltaY > minSwipeDistance / 2) {
          setGestureState(prev => ({ ...prev, isSwiping: true }));
        }
      } else if (touches.length === 2 && touchState.current.initialDistance > 0) {
        // Pinch
        const currentDistance = getDistance(touches[0], touches[1]);
        const distanceDiff = currentDistance - touchState.current.initialDistance;

        if (Math.abs(distanceDiff) > 10) {
          if (distanceDiff > 0 && onPinchOut) {
            onPinchOut({ scale: currentDistance / touchState.current.initialDistance });
          } else if (distanceDiff < 0 && onPinchIn) {
            onPinchIn({ scale: currentDistance / touchState.current.initialDistance });
          }
        }
      }
    };

    // Gestion de la fin du touch
    const handleTouchEnd = (e) => {
      const deltaX = touchState.current.currentX - touchState.current.startX;
      const deltaY = touchState.current.currentY - touchState.current.startY;
      const deltaTime = Date.now() - touchState.current.startTime;

      // Annuler le timer d'appui long
      if (touchState.current.longPressTimer) {
        clearTimeout(touchState.current.longPressTimer);
        touchState.current.longPressTimer = null;
      }

      // Vérifier si c'est un swipe valide
      if (
        deltaTime < maxSwipeTime &&
        (Math.abs(deltaX) > minSwipeDistance || Math.abs(deltaY) > minSwipeDistance)
      ) {
        // Déterminer la direction principale
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // Swipe horizontal
          if (deltaX > 0 && onSwipeRight) {
            onSwipeRight({ distance: deltaX, duration: deltaTime });
          } else if (deltaX < 0 && onSwipeLeft) {
            onSwipeLeft({ distance: Math.abs(deltaX), duration: deltaTime });
          }
        } else {
          // Swipe vertical
          if (deltaY > 0 && onSwipeDown) {
            onSwipeDown({ distance: deltaY, duration: deltaTime });
          } else if (deltaY < 0 && onSwipeUp) {
            onSwipeUp({ distance: Math.abs(deltaY), duration: deltaTime });
          }
        }
      }

      // Réinitialiser l'état
      setGestureState({
        isSwiping: false,
        isPinching: false,
        isLongPressing: false
      });

      touchState.current = {
        startX: 0,
        startY: 0,
        startTime: 0,
        currentX: 0,
        currentY: 0,
        initialDistance: 0,
        longPressTimer: null,
        touches: []
      };
    };

    // Ajouter les écouteurs d'événements
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    element.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    // Nettoyage
    return () => {
      if (touchState.current.longPressTimer) {
        clearTimeout(touchState.current.longPressTimer);
      }
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onPinchIn,
    onPinchOut,
    onLongPress,
    minSwipeDistance,
    maxSwipeTime,
    longPressDelay
  ]);

  return { ref: elementRef, gestureState };
};

/**
 * Hook pour détecter si l'application est en mode standalone (PWA installée)
 */
export const useIsStandalone = () => {
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Vérifier si l'app est en mode standalone
    const isStandaloneBrowser = window.matchMedia('(display-mode: standalone)').matches;
    const isStandaloneNavigator = 'standalone' in window.navigator && window.navigator.standalone;
    
    setIsStandalone(isStandaloneBrowser || isStandaloneNavigator);
  }, []);

  return isStandalone;
};

/**
 * Hook pour gérer l'installation de la PWA
 */
export const useInstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Vérifier si déjà installée
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        setIsInstallable(false);
      }
    };

    checkInstalled();

    // Écouter l'événement beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    // Écouter l'événement appinstalled
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) {
      console.log('Installation prompt non disponible');
      return false;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWA installée avec succès');
      setIsInstalled(true);
    } else {
      console.log('Installation PWA refusée');
    }
    
    setDeferredPrompt(null);
    setIsInstallable(false);
    
    return outcome === 'accepted';
  };

  return {
    isInstallable,
    isInstalled,
    promptInstall
  };
};

export default useTouchGestures;
