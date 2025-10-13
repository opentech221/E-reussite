import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCircle, AlertCircle, Info, Trophy, Calendar, BookOpen, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { dbHelpers } from '@/lib/supabaseHelpers';

const NotificationCenter = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen && user) {
      fetchNotifications();
    }
  }, [isOpen, user]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await dbHelpers.getUserNotifications(user.id);
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Fallback to mock data
      setNotifications([
        {
          id: '1',
          type: 'achievement',
          title: 'Nouveau badge débloqué !',
          message: 'Félicitations ! Vous avez gagné le badge "Persévérant"',
          is_read: false,
          created_at: new Date().toISOString(),
          action_url: '/profile#badges'
        },
        {
          id: '2',
          type: 'reminder',
          title: 'Quiz de révision disponible',
          message: 'Un nouveau quiz de mathématiques vous attend pour tester vos connaissances',
          is_read: false,
          created_at: new Date(Date.now() - 3600000).toISOString(),
          action_url: '/quiz/math-revision'
        },
        {
          id: '3',
          type: 'recommendation',
          title: 'Recommandation personnalisée',
          message: 'Basé sur vos performances, nous vous suggérons de réviser les équations du second degré',
          is_read: true,
          created_at: new Date(Date.now() - 7200000).toISOString(),
          action_url: '/courses/math/equations'
        },
        {
          id: '4',
          type: 'system',
          title: 'Nouvelle fonctionnalité',
          message: 'Découvrez notre nouveau système de suivi de progression amélioré !',
          is_read: true,
          created_at: new Date(Date.now() - 86400000).toISOString(),
          action_url: '/dashboard'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await dbHelpers.markNotificationAsRead(notificationId);
      setNotifications(notifications.map(notif => 
        notif.id === notificationId ? { ...notif, is_read: true } : notif
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
      await Promise.all(unreadIds.map(id => dbHelpers.markNotificationAsRead(id)));
      setNotifications(notifications.map(notif => ({ ...notif, is_read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'achievement':
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 'reminder':
        return <Calendar className="w-5 h-5 text-blue-500" />;
      case 'recommendation':
        return <Target className="w-5 h-5 text-green-500" />;
      case 'system':
        return <Info className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-slate-500" />;
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);

    if (diffInSeconds < 60) return 'À l\'instant';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}j`;
    return time.toLocaleDateString('fr-FR');
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b bg-slate-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-slate-700" />
              <h2 className="text-lg font-semibold">Notifications</h2>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          {unreadCount > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={markAllAsRead}
              className="w-full"
            >
              Tout marquer comme lu
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-slate-500">
              <Bell className="w-12 h-12 mb-2 opacity-50" />
              <p className="text-sm">Aucune notification</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors hover:bg-slate-50 ${
                    !notification.is_read 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'bg-white border-slate-200'
                  }`}
                  onClick={() => {
                    if (!notification.is_read) {
                      markAsRead(notification.id);
                    }
                    if (notification.action_url) {
                      window.location.href = notification.action_url;
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-slate-900 truncate">
                          {notification.title}
                        </h4>
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                      
                      <p className="text-sm text-slate-600 leading-relaxed mb-2">
                        {notification.message}
                      </p>
                      
                      <p className="text-xs text-slate-400">
                        {formatTimeAgo(notification.created_at)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-slate-50">
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => {
              onClose();
              window.location.href = '/notifications';
            }}
          >
            Voir toutes les notifications
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// Notification Bell Component
export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Check for unread notifications periodically
      const checkNotifications = async () => {
        try {
          const notifications = await dbHelpers.getUserNotifications(user.id, 5);
          const unread = notifications.filter(n => !n.is_read).length;
          setUnreadCount(unread);
        } catch (error) {
          // Fallback to mock count
          setUnreadCount(2);
        }
      };

      checkNotifications();
      const interval = setInterval(checkNotifications, 30000); // Check every 30 seconds

      return () => clearInterval(interval);
    }
  }, [user]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  if (!user) return null;

  return (
    <>
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="relative"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </Button>
      </div>

      <NotificationCenter 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
};

export default NotificationCenter;