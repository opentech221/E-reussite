import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  BookOpen, 
  Target, 
  FileText, 
  Trophy, 
  Award, 
  MessageSquare, 
  User, 
  Menu, 
  X,
  ChevronRight,
  Settings,
  LogOut,
  BarChart3,
  Bot,
  History,
  Share2,
  CreditCard
} from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const menuItems = [
    { 
      path: '/dashboard', 
      icon: Home, 
      label: 'Dashboard',
      description: 'Vue d\'ensemble'
    },
    { 
      path: '/study-plan', 
      icon: Bot, 
      label: 'Plan d\'Étude',
      description: 'Prédictions & Planning',
      badge: 'NEW',
      badgeColor: 'bg-gradient-to-r from-purple-500 to-pink-500'
    },
    { 
      path: '/my-courses', 
      icon: BookOpen, 
      label: 'Mes cours',
      description: 'Matières et leçons'
    },
    { 
      path: '/progress', 
      icon: BarChart3, 
      label: 'Progression',
      description: 'Stats et défis'
    },
    { 
      path: '/historique', 
      icon: History, 
      label: 'Historique',
      description: 'Activités récentes'
    },
    { 
      path: '/quiz', 
      icon: Target, 
      label: 'Quiz',
      description: 'Tester vos connaissances'
    },
    { 
      path: '/exam', 
      icon: FileText, 
      label: 'Examens',
      description: 'Simulations d\'examen'
    },
    { 
      path: '/leaderboard', 
      icon: Trophy, 
      label: 'Classement',
      description: 'Top élèves'
    },
    { 
      path: '/badges', 
      icon: Award, 
      label: 'Succès',
      description: 'Vos badges'
    },
    { 
      path: '/my-shared-links', 
      icon: Share2, 
      label: 'Mes Liens',
      description: 'Liens partagés',
      badge: 'NEW',
      badgeColor: 'bg-gradient-to-r from-blue-500 to-cyan-500'
    },
    { 
      path: '/payment', 
      icon: CreditCard, 
      label: 'Paiement',
      description: 'Finaliser l\'inscription',
      badge: '1000 FCFA',
      badgeColor: 'bg-gradient-to-r from-green-500 to-emerald-500'
    },
  ];

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  // Get user initials
  const getUserInitials = () => {
    if (!user?.user_metadata?.display_name) return 'U';
    const names = user.user_metadata.display_name.split(' ');
    return names.map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 h-screen w-[280px] bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 z-50 flex flex-col
          transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="h-16 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-lg">E-Réussite</span>
          </Link>
          
          {/* Close button (mobile only) */}
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`
                    relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
                    ${active 
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm' 
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }
                  `}
                >
                  {/* Active Indicator */}
                  {active && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 dark:bg-blue-400 rounded-r"
                    />
                  )}
                  
                  <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`} />
                  
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium flex items-center gap-2 ${active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-slate-100'}`}>
                      <span>{item.label}</span>
                      {/* Badge NEW pour Plan d'Étude */}
                      {item.badge && (
                        <span className={`px-1.5 py-0.5 text-[10px] font-bold text-white rounded ${item.badgeColor || 'bg-blue-500'} animate-pulse`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {item.description}
                    </div>
                  </div>

                  {active && (
                    <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Section */}
        <div className="border-t border-slate-200 dark:border-slate-700 p-4">
          {/* User Info */}
          <Link
            to="/profile"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors mb-2"
          >
            <Avatar className="w-10 h-10">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-slate-900 dark:text-white truncate">
                {user?.user_metadata?.display_name || 'Utilisateur'}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {user?.email}
              </div>
            </div>
          </Link>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 !text-gray-700 dark:!text-gray-200 border-gray-300 dark:border-gray-600"
              asChild
            >
              <Link to="/settings">
                <Settings className="w-4 h-4 mr-2" />
                Paramètres
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Menu Button - Only visible on mobile */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-30 lg:hidden p-2 bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
      >
        <Menu className="w-6 h-6 text-slate-700 dark:text-slate-300" />
      </button>
    </>
  );
};

export default Sidebar;
