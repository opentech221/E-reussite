/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * IMAGE UPLOADER - COACH IA
 * Description: Composant upload d'images avec preview et validation
 * Date: 9 octobre 2025
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import React, { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, X, Upload, AlertCircle } from 'lucide-react';

const ImageUploader = ({ onImagesSelected, maxImages = 5, disabled = false }) => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Formats acceptés
  const ACCEPTED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const MAX_SIZE_MB = 5;
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

  /**
   * Valider fichier
   */
  const validateFile = (file) => {
    // Vérifier type
    if (!ACCEPTED_FORMATS.includes(file.type)) {
      return {
        valid: false,
        error: `Format non supporté. Utilisez: JPEG, PNG, GIF ou WebP`
      };
    }

    // Vérifier taille
    if (file.size > MAX_SIZE_BYTES) {
      return {
        valid: false,
        error: `Fichier trop volumineux. Maximum: ${MAX_SIZE_MB} MB`
      };
    }

    return { valid: true };
  };

  /**
   * Gérer sélection fichiers
   */
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    setError(null);

    // Vérifier limite
    if (selectedImages.length + files.length > maxImages) {
      setError(`Maximum ${maxImages} images`);
      return;
    }

    // Valider et créer previews
    const validFiles = [];
    
    for (const file of files) {
      const validation = validateFile(file);
      
      if (!validation.valid) {
        setError(validation.error);
        continue;
      }

      // Créer preview URL
      const previewUrl = URL.createObjectURL(file);
      
      validFiles.push({
        file,
        previewUrl,
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      });
    }

    if (validFiles.length > 0) {
      const newImages = [...selectedImages, ...validFiles];
      setSelectedImages(newImages);
      onImagesSelected(newImages.map(img => img.file));
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Supprimer image
   */
  const removeImage = (id) => {
    const imageToRemove = selectedImages.find(img => img.id === id);
    
    if (imageToRemove) {
      // Libérer URL blob
      URL.revokeObjectURL(imageToRemove.previewUrl);
    }

    const newImages = selectedImages.filter(img => img.id !== id);
    setSelectedImages(newImages);
    onImagesSelected(newImages.map(img => img.file));
    setError(null);
  };

  /**
   * Ouvrir sélecteur fichiers
   */
  const openFilePicker = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  /**
   * Formater taille fichier
   */
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  /**
   * Nettoyer au démontage
   */
  React.useEffect(() => {
    return () => {
      selectedImages.forEach(img => {
        URL.revokeObjectURL(img.previewUrl);
      });
    };
  }, [selectedImages]);

  return (
    <div className="w-full">
      {/* Input caché */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_FORMATS.join(',')}
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {/* Boutons upload */}
      {selectedImages.length === 0 && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={openFilePicker}
            disabled={disabled}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ImageIcon className="w-4 h-4" />
            <span>Choisir images</span>
          </button>

          {/* Capture caméra (mobile) */}
          <button
            type="button"
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.setAttribute('capture', 'environment');
                fileInputRef.current.click();
              }
            }}
            disabled={disabled}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors md:hidden"
          >
            <Camera className="w-4 h-4" />
            <span>Prendre photo</span>
          </button>
        </div>
      )}

      {/* Erreur */}
      {error && (
        <div className="mt-2 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Preview images */}
      {selectedImages.length > 0 && (
        <div className="mt-3 space-y-3">
          {/* Liste images */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {selectedImages.map((image) => (
              <div
                key={image.id}
                className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden"
              >
                {/* Image */}
                <img
                  src={image.previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />

                {/* Overlay hover */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                  {/* Bouton supprimer */}
                  <button
                    type="button"
                    onClick={() => removeImage(image.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                    title="Supprimer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Info taille */}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs px-2 py-1">
                  {formatFileSize(image.file.size)}
                </div>
              </div>
            ))}

            {/* Ajouter plus (si limite non atteinte) */}
            {selectedImages.length < maxImages && (
              <button
                type="button"
                onClick={openFilePicker}
                disabled={disabled}
                className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-6 h-6 text-gray-400" />
                <span className="text-xs text-gray-500">Ajouter</span>
              </button>
            )}
          </div>

          {/* Info compteur */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              {selectedImages.length} / {maxImages} images
            </span>
            <button
              type="button"
              onClick={() => {
                selectedImages.forEach(img => URL.revokeObjectURL(img.previewUrl));
                setSelectedImages([]);
                onImagesSelected([]);
                setError(null);
              }}
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Tout supprimer
            </button>
          </div>
        </div>
      )}

      {/* Info formats */}
      <div className="mt-2 text-xs text-gray-500">
        Formats: JPEG, PNG, GIF, WebP • Max: {MAX_SIZE_MB} MB par image
      </div>
    </div>
  );
};

export default ImageUploader;
