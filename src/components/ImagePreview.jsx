/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * IMAGE PREVIEW - COACH IA
 * Description: Modal d'aperçu image avec zoom et navigation
 * Date: 9 octobre 2025
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Loader
} from 'lucide-react';

const ImagePreview = ({
  images = [],
  initialIndex = 0,
  onClose,
  showDownload = true,
  showNavigation = true
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const currentImage = images[currentIndex];
  const hasMultiple = images.length > 1;

  /**
   * Navigation clavier
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && hasMultiple) {
        goToPrevious();
      } else if (e.key === 'ArrowRight' && hasMultiple) {
        goToNext();
      } else if (e.key === '+' || e.key === '=') {
        zoomIn();
      } else if (e.key === '-') {
        zoomOut();
      } else if (e.key === 'r' || e.key === 'R') {
        rotate();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, zoom, rotation, hasMultiple]);

  /**
   * Reset zoom/rotation lors du changement d'image
   */
  useEffect(() => {
    setZoom(1);
    setRotation(0);
    setLoading(true);
    setError(false);
  }, [currentIndex]);

  /**
   * Navigation
   */
  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  /**
   * Zoom
   */
  const zoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const zoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const resetZoom = () => {
    setZoom(1);
  };

  /**
   * Rotation
   */
  const rotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  /**
   * Téléchargement
   */
  const downloadImage = async () => {
    try {
      const imageUrl = currentImage.url || currentImage.file_path;
      const fileName = currentImage.file_name || `image-${Date.now()}.jpg`;

      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur téléchargement:', error);
      alert('Impossible de télécharger l\'image');
    }
  };

  /**
   * Gestion chargement image
   */
  const handleImageLoad = () => {
    setLoading(false);
  };

  const handleImageError = () => {
    setLoading(false);
    setError(true);
  };

  if (!currentImage) {
    return null;
  }

  const imageUrl = currentImage.url || currentImage.file_path;
  const imageName = currentImage.file_name || 'Image';

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-95 z-50 flex flex-col"
      onClick={onClose}
    >
      {/* Header avec contrôles */}
      <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-sm">
        {/* Info image */}
        <div className="text-white">
          <div className="font-medium">{imageName}</div>
          {hasMultiple && (
            <div className="text-sm text-gray-400">
              {currentIndex + 1} / {images.length}
            </div>
          )}
          {currentImage.width && currentImage.height && (
            <div className="text-xs text-gray-500">
              {currentImage.width} × {currentImage.height}
            </div>
          )}
        </div>

        {/* Boutons contrôle */}
        <div className="flex items-center gap-2">
          {/* Zoom out */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              zoomOut();
            }}
            disabled={zoom <= 0.5}
            className="p-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded text-white transition-colors"
            title="Zoom arrière (-)"
          >
            <ZoomOut className="w-5 h-5" />
          </button>

          {/* Reset zoom */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              resetZoom();
            }}
            className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded text-white text-sm transition-colors"
            title="Réinitialiser zoom"
          >
            {Math.round(zoom * 100)}%
          </button>

          {/* Zoom in */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              zoomIn();
            }}
            disabled={zoom >= 3}
            className="p-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded text-white transition-colors"
            title="Zoom avant (+)"
          >
            <ZoomIn className="w-5 h-5" />
          </button>

          {/* Rotation */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              rotate();
            }}
            className="p-2 bg-white/10 hover:bg-white/20 rounded text-white transition-colors"
            title="Rotation (R)"
          >
            <RotateCw className="w-5 h-5" />
          </button>

          {/* Télécharger */}
          {showDownload && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                downloadImage();
              }}
              className="p-2 bg-white/10 hover:bg-white/20 rounded text-white transition-colors"
              title="Télécharger"
            >
              <Download className="w-5 h-5" />
            </button>
          )}

          {/* Fermer */}
          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 rounded text-white transition-colors"
            title="Fermer (Échap)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Zone image */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        {/* Navigation gauche */}
        {hasMultiple && showNavigation && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
            className="absolute left-4 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors z-10"
            title="Image précédente (←)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Image */}
        <div
          className="relative"
          onClick={(e) => e.stopPropagation()}
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            transition: 'transform 0.3s ease'
          }}
        >
          {loading && !error && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader className="w-12 h-12 text-white animate-spin" />
            </div>
          )}

          {error ? (
            <div className="text-white text-center p-8">
              <X className="w-16 h-16 mx-auto mb-4 text-red-500" />
              <p className="text-lg">Impossible de charger l'image</p>
            </div>
          ) : (
            <img
              src={imageUrl}
              alt={imageName}
              className="max-w-full max-h-[80vh] object-contain"
              onLoad={handleImageLoad}
              onError={handleImageError}
              style={{
                visibility: loading ? 'hidden' : 'visible'
              }}
            />
          )}
        </div>

        {/* Navigation droite */}
        {hasMultiple && showNavigation && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            className="absolute right-4 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors z-10"
            title="Image suivante (→)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Footer avec vignettes (si multiple) */}
      {hasMultiple && showNavigation && (
        <div className="p-4 bg-black/50 backdrop-blur-sm">
          <div className="flex gap-2 justify-center overflow-x-auto max-w-full">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-all ${
                  idx === currentIndex
                    ? 'border-blue-500 scale-110'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={img.url || img.file_path}
                  alt={`Vignette ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Aide clavier */}
      <div className="absolute bottom-4 left-4 text-white/50 text-xs space-y-1 bg-black/30 p-3 rounded">
        <div>Échap: Fermer</div>
        {hasMultiple && (
          <>
            <div>← →: Navigation</div>
          </>
        )}
        <div>+ -: Zoom</div>
        <div>R: Rotation</div>
      </div>
    </div>
  );
};

export default ImagePreview;
