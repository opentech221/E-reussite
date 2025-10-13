/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * MESSAGE ITEM - COACH IA
 * Description: Affichage message individuel avec images et actions
 * Date: 9 octobre 2025
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import React, { useState } from 'react';
import {
  Bot,
  User,
  Copy,
  Check,
  Edit2,
  Trash2,
  RotateCcw,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const MessageItem = ({
  message,
  onEdit,
  onDelete,
  onRegenerate,
  canEdit = true,
  canDelete = true
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const [selectedImage, setSelectedImage] = useState(null);

  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  /**
   * Copier dans presse-papier
   */
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erreur copie:', error);
    }
  };

  /**
   * Sauvegarder édition
   */
  const saveEdit = () => {
    if (editedContent.trim() && editedContent !== message.content) {
      onEdit(message.id, editedContent.trim());
    }
    setIsEditing(false);
  };

  /**
   * Annuler édition
   */
  const cancelEdit = () => {
    setEditedContent(message.content);
    setIsEditing(false);
  };

  /**
   * Formater date
   */
  const formatDate = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: fr
      });
    } catch {
      return '';
    }
  };

  return (
    <>
      <div
        className={`flex gap-3 mb-4 max-w-full ${
          isUser ? 'flex-row-reverse' : 'flex-row'
        }`}
      >
        {/* Avatar */}
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            isUser
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
          }`}
        >
          {isUser ? (
            <User className="w-5 h-5" />
          ) : (
            <Bot className="w-5 h-5" />
          )}
        </div>

        {/* Contenu message */}
        <div className={`flex-1 max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
          {/* Bubble message */}
          <div
            className={`rounded-lg p-4 ${
              isUser
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
            }`}
          >
            {/* Images attachées */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="mb-3 grid grid-cols-2 gap-2">
                {message.attachments.map((attachment, idx) => (
                  <div
                    key={idx}
                    className="relative group cursor-pointer rounded-lg overflow-hidden bg-white/10"
                    onClick={() => setSelectedImage(attachment)}
                  >
                    <img
                      src={attachment.url || attachment.file_path}
                      alt={attachment.file_name || 'Image'}
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Texte */}
            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) saveEdit();
                    if (e.key === 'Escape') cancelEdit();
                  }}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded 
                             bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={4}
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={saveEdit}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  >
                    Sauvegarder
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                  >
                    Annuler
                  </button>
                  <span className="text-xs text-gray-500 dark:text-gray-400 self-center ml-2">
                    Ctrl+Enter pour sauvegarder
                  </span>
                </div>
              </div>
            ) : (
              <p className="whitespace-pre-wrap break-words">
                {message.content}
              </p>
            )}

            {/* Badge "Modifié" */}
            {message.is_edited && !isEditing && (
              <div className={`mt-2 text-xs ${isUser ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'}`}>
                Modifié
              </div>
            )}
          </div>

          {/* Métadonnées et actions */}
          {!isEditing && (
            <div className={`flex items-center gap-2 mt-1 px-1 ${
              isUser ? 'justify-end' : 'justify-start'
            }`}>
              {/* Date */}
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(message.created_at)}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-1">
                {/* Copier */}
                <button
                  onClick={copyToClipboard}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  title="Copier"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>

                {/* Éditer (utilisateur seulement) */}
                {isUser && canEdit && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    title="Éditer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}

                {/* Régénérer (assistant seulement) */}
                {isAssistant && onRegenerate && (
                  <button
                    onClick={() => onRegenerate(message.id)}
                    className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    title="Régénérer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}

                {/* Supprimer */}
                {canDelete && (
                  <button
                    onClick={() => {
                      if (window.confirm('Supprimer ce message ?')) {
                        onDelete(message.id);
                      }
                    }}
                    className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox image */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <img
            src={selectedImage.url || selectedImage.file_path}
            alt={selectedImage.file_name || 'Image'}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {selectedImage.file_name && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg text-sm">
              {selectedImage.file_name}
              {selectedImage.width && selectedImage.height && (
                <span className="ml-2 text-gray-300">
                  {selectedImage.width} × {selectedImage.height}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default MessageItem;
