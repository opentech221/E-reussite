import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileQuestion,
  Target,
  Trophy,
  BarChart3,
  Settings,
  LogOut,
  Search,
  Bell,
  Menu,
  X,
  User,
  ChevronDown,
  Home
} from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const AdminLayout = () => {
  const location = useLocation();
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false); // Fermé par défaut (mobile-first)
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // Détection responsive
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true); // Ouvert sur desktop
      } else {
        setSidebarOpen(false); // Fermé sur mobile
      }
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fermer la sidebar lors du changement de page sur mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Fermer la sidebar lors du changement de page sur mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  // Navigation principale avec sections
  const navSections = [
    {
      title: 'Général',
      items: [
        { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
        { href: '/dashboard', icon: Home, label: 'Retour au Dashboard' }
      ]
    },
    {
      title: 'Gestion des Données',
      items: [
        { href: '/admin/users', icon: Users, label: 'Utilisateurs' },
        { href: '/admin/courses', icon: BookOpen, label: 'Cours & Contenus' },
        { href: '/admin/quiz', icon: FileQuestion, label: 'Quiz & Examens' }
      ]
    },
    {
      title: 'Fonctionnalités',
      items: [
        { href: '/admin/orientation', icon: Target, label: 'Orientation' },
        { href: '/admin/gamification', icon: Trophy, label: 'Gamification' }
      ]
    },
    {
      title: 'Système',
      items: [
        { href: '/admin/analytics', icon: BarChart3, label: 'Analytics & Rapports' },
        { href: '/admin/settings', icon: Settings, label: 'Paramètres' }
      ]
    }
  ];

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Overlay mobile */}
      <AnimatePresence>
        {sidebarOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Mobile First Design */}
      <motion.aside
        initial={false}
        animate={{
          x: sidebarOpen || !isMobile ? 0 : -288
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`
          fixed lg:sticky top-0 h-screen w-72 bg-slate-900 text-white z-50 flex flex-col
          shadow-2xl lg:shadow-none
        `}
      >
        `}
      >
        {/* Logo et Toggle */}
        <div className="p-4 lg:p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <div>
              <h1 className="text-lg lg:text-xl font-bold font-heading">E-Réussite</h1>
              <p className="text-xs text-slate-400 mt-0.5">Administration</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-grow overflow-y-auto p-3 lg:p-4">
          {navSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-6">
              <h3 className="text-[10px] lg:text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 lg:mb-3 px-3">
                {section.title}
              </h3>
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      onClick={() => isMobile && setSidebarOpen(false)}
                      className={`flex items-center space-x-3 px-3 py-3 lg:py-3 rounded-lg transition-all group ${
                        isActive(item.href, item.exact)
                          ? 'bg-primary text-white shadow-lg shadow-primary/20'
                          : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      <span className="font-medium text-sm lg:text-sm">{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-3 lg:p-4 border-t border-slate-800">
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                {user?.email?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  Administrateur
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {user?.email || 'admin@example.com'}
                </p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start text-slate-300 hover:bg-slate-800 hover:text-white min-h-12"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Déconnexion
            </Button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen w-full lg:ml-0">
        {/* Topbar - Mobile First */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
          <div className="px-4 lg:px-8 py-3 lg:py-4 flex items-center gap-3 lg:gap-4">
            {/* Menu burger - mobile only */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors lg:hidden"
            >
              <Menu className="w-6 h-6 text-slate-700" />
            </button>

            {/* Recherche globale - responsive */}
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 lg:w-5 lg:h-5" />
                <Input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 lg:pl-10 pr-4 w-full bg-slate-50 border-slate-200 focus:bg-white text-sm lg:text-base h-10 lg:h-auto"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 lg:gap-4">
              {/* Notifications */}
              <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5 text-slate-600" />
                <Badge className="absolute -top-1 -right-1 w-4 h-4 lg:w-5 lg:h-5 p-0 flex items-center justify-center text-[10px] lg:text-xs bg-red-500">
                  3
                </Badge>
              </button>

              {/* Profil - hidden on small mobile */}
              <button className="hidden sm:flex items-center gap-2 p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
                  {user?.email?.[0]?.toUpperCase() || 'A'}
                </div>
                <ChevronDown className="w-4 h-4 text-slate-600 hidden lg:block" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;