/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * CONVERSATION LIST - COACH IA
 * Description: Sidebar avec historique des conversations
 * Date: 9 octobre 2025
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Pin,
  PinOff,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  Plus,
  Clock,
  MoreVertical
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const ConversationList = ({
  conversations = [],
  currentConversationId,
  onSelectConversation,
  onCreateConversation,
  onPinConversation,
  onRenameConversation,
  onDeleteConversation,
  loading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [menuOpenId, setMenuOpenId] = useState(null);

  // 🐛 DEBUG: Logger les changements de conversations
  useEffect(() => {
    console.log('📋 [ConversationList] Conversations prop mise à jour:', {
      count: conversations.length,
      ids: conversations.map(c => c.id).slice(0, 5) // Premiers 5 IDs
    });
  }, [conversations]);

  // Sécurité : vérifier que conversations est un tableau
  const safeConversations = Array.isArray(conversations) ? conversations : [];

  /**
   * Filtrer conversations par recherche
   */
  const filteredConversations = safeConversations.filter(conv =>
    conv.title?.toLowerCase().includes(searchTerm.toLowerCase()) ?? true
  );

  /**
   * Séparer épinglées et normales
   */
  const pinnedConversations = filteredConversations.filter(c => c.is_pinned);
  const normalConversations = filteredConversations.filter(c => !c.is_pinned);

  /**
   * Commencer édition titre
   */
  const startEdit = (conv) => {
    setEditingId(conv.id);
    setEditingTitle(conv.title);
    setMenuOpenId(null);
  };

  /**
   * Sauvegarder nouveau titre
   */
  const saveEdit = async () => {
    if (editingTitle.trim() && editingId) {
      await onRenameConversation(editingId, editingTitle.trim());
      setEditingId(null);
      setEditingTitle('');
    }
  };

  /**
   * Annuler édition
   */
  const cancelEdit = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  /**
   * Formater date relative
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

  /**
   * Tronquer texte
   */
  const truncate = (text, maxLength = 60) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  /**
   * Render conversation item
   */
  const renderConversation = (conv) => {
    const isActive = conv.id === currentConversationId;
    const isEditing = editingId === conv.id;
    const isMenuOpen = menuOpenId === conv.id;

    return (
      <div
        key={conv.id}
        className={`relative group p-3 rounded-lg cursor-pointer transition-colors ${
          isActive
            ? 'bg-blue-100 dark:bg-blue-900/30 border-l-4 border-blue-600'
            : 'hover:bg-gray-100 dark:hover:bg-gray-800 border-l-4 border-transparent'
        }`}
        onClick={() => !isEditing && onSelectConversation(conv.id)}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {/* Titre */}
            {isEditing ? (
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <input
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') saveEdit();
                    if (e.key === 'Escape') cancelEdit();
                  }}
                  className="flex-1 px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <button
                  onClick={saveEdit}
                  className="p-1 text-green-600 hover:bg-green-100 rounded"
                  title="Sauvegarder"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={cancelEdit}
                  className="p-1 text-red-600 hover:bg-red-100 rounded"
                  title="Annuler"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {conv.is_pinned && (
                  <Pin className="w-3 h-3 text-blue-600 flex-shrink-0" />
                )}
                <h3
                  className={`text-sm font-medium truncate ${
                    isActive ? 'text-blue-900' : 'text-gray-900 dark:text-white'
                  }`}
                >
                  {conv.title}
                </h3>
              </div>
            )}

            {/* Dernier message */}
            {!isEditing && conv.last_message && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                {truncate(conv.last_message, 50)}
              </p>
            )}

            {/* Métadonnées */}
            {!isEditing && (
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 dark:text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(conv.updated_at)}
                </span>
                {conv.total_messages > 0 && (
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    {conv.total_messages}
                  </span>
                )}
                {conv.context_page && (
                  <span className="px-2 py-0.5 bg-gray-200 rounded text-xs">
                    {conv.context_page}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Menu actions */}
          {!isEditing && (
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setMenuOpenId(isMenuOpen ? null : conv.id)}
                className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded transition-opacity"
              >
                <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>

              {/* Dropdown menu */}
              {isMenuOpen && (
                <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                  <button
                    onClick={() => {
                      onPinConversation(conv.id, !conv.is_pinned);
                      setMenuOpenId(null);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100"
                  >
                    {conv.is_pinned ? (
                      <>
                        <PinOff className="w-4 h-4" />
                        <span>Désépingler</span>
                      </>
                    ) : (
                      <>
                        <Pin className="w-4 h-4" />
                        <span>Épingler</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => startEdit(conv)}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Renommer</span>
                  </button>

                  <hr className="my-1" />

                  <button
                    onClick={() => {
                      if (window.confirm('Supprimer cette conversation ?')) {
                        onDeleteConversation(conv.id);
                        setMenuOpenId(null);
                      }
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Supprimer</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Conversations</h2>
          <button
            onClick={onCreateConversation}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            title="Nouvelle conversation"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Barre recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      {/* Liste conversations */}
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
            {searchTerm ? 'Aucune conversation trouvée' : 'Aucune conversation'}
          </div>
        ) : (
          <div className="space-y-1">
            {/* Conversations épinglées */}
            {pinnedConversations.length > 0 && (
              <>
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Épinglées
                </div>
                {pinnedConversations.map(renderConversation)}
                <div className="my-2 border-t border-gray-200 dark:border-gray-700"></div>
              </>
            )}

            {/* Conversations normales */}
            {normalConversations.length > 0 && (
              <>
                {pinnedConversations.length > 0 && (
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Récentes
                  </div>
                )}
                {normalConversations.map(renderConversation)}
              </>
            )}
          </div>
        )}
      </div>

      {/* Cliquer hors du menu pour fermer */}
      {menuOpenId && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setMenuOpenId(null)}
        />
      )}
    </div>
  );
};

export default ConversationList;
