/**
 * AI STORAGE SERVICE
 * Service de gestion du storage (images)
 */

import { supabase } from './customSupabaseClient';
import imageCompression from 'browser-image-compression';
import { v4 as uuidv4 } from 'uuid';

const aiStorageService = {
  /**
   * Valider un fichier
   */
  validateFile(file, maxSizeMB = 5) {
    const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `Format non supporté. Utilisez: JPEG, PNG, GIF ou WebP`
      };
    }

    if (file.size > maxSizeBytes) {
      return {
        valid: false,
        error: `Fichier trop volumineux. Maximum: ${maxSizeMB} MB`
      };
    }

    return { valid: true };
  },

  /**
   * Compresser une image
   */
  async compressImage(file, maxWidth = 1920, quality = 0.8) {
    try {
      const options = {
        maxSizeMB: 5,
        maxWidthOrHeight: maxWidth,
        useWebWorker: true,
        initialQuality: quality
      };

      const compressedFile = await imageCompression(file, options);
      console.log(`[aiStorageService] Compression: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
      
      return compressedFile;
    } catch (error) {
      console.error('[aiStorageService] Erreur compression:', error);
      return file; // Retourner fichier original si erreur
    }
  },

  /**
   * Obtenir dimensions d'une image
   */
  async getImageDimensions(file) {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({ width: img.width, height: img.height });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({ width: 0, height: 0 });
      };

      img.src = url;
    });
  },

  /**
   * Convertir fichier en base64
   */
  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  /**
   * Upload une image
   */
  async uploadImage(file, userId, conversationId, messageId) {
    try {
      // Validation
      const validation = this.validateFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Compression
      const compressedFile = await this.compressImage(file);

      // Dimensions
      const dimensions = await this.getImageDimensions(compressedFile);

      // 🆕 Convertir en base64 pour analyse IA
      const base64 = await this.fileToBase64(compressedFile);

      // Nom fichier unique
      const timestamp = Date.now();
      const uniqueId = uuidv4().substring(0, 8);
      const extension = file.name.split('.').pop();
      const fileName = `${timestamp}_${uniqueId}.${extension}`;
      const filePath = `${userId}/${conversationId}/${fileName}`;

      // Upload vers Supabase Storage
      const { data, error } = await supabase.storage
        .from('ai-chat-attachments')
        .upload(filePath, compressedFile, {
          contentType: compressedFile.type,
          upsert: false
        });

      if (error) throw error;

      console.log('[aiStorageService] Upload réussi:', filePath);

      return {
        success: true,
        path: data.path,
        size: compressedFile.size,
        type: compressedFile.type,
        width: dimensions.width,
        height: dimensions.height,
        originalName: file.name,
        base64 // 🆕 Ajouter base64 pour analyse IA
      };
    } catch (error) {
      console.error('[aiStorageService] Erreur uploadImage:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Sauvegarder metadata attachment
   */
  async saveAttachment(messageId, type, filePath, fileName, fileSize, mimeType, width, height) {
    try {
      const { data, error } = await supabase
        .from('ai_message_attachments')
        .insert({
          message_id: messageId,
          type,
          file_path: filePath,
          file_name: fileName,
          file_size: fileSize,
          mime_type: mimeType,
          width,
          height
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, attachment: data };
    } catch (error) {
      console.error('[aiStorageService] Erreur saveAttachment:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtenir URL signée
   */
  async getSignedUrl(filePath, expiresIn = 3600) {
    try {
      const { data, error } = await supabase.storage
        .from('ai-chat-attachments')
        .createSignedUrl(filePath, expiresIn);

      if (error) throw error;
      return { success: true, url: data.signedUrl };
    } catch (error) {
      console.error('[aiStorageService] Erreur getSignedUrl:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Supprimer un fichier
   */
  async deleteFile(filePath) {
    try {
      const { error } = await supabase.storage
        .from('ai-chat-attachments')
        .remove([filePath]);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('[aiStorageService] Erreur deleteFile:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Formater taille fichier
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }
};

export default aiStorageService;
