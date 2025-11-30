import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
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
  ChevronDown
} from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const AdminLayout = () => {
  const location = useLocation();
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  // Navigation principale avec sections
  const navSections = [
    {
      title: 'Général',
      items: [
        { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true }
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
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-72' : 'w-20'
        } bg-slate-900 text-white transition-all duration-300 flex flex-col fixed h-screen z-20`}
      >
        {/* Logo et Toggle */}
        <div className="p-6 flex items-center justify-between border-b border-slate-800">
          {sidebarOpen ? (
            <>
              <div>
                <h1 className="text-xl font-bold font-heading">E-Réussite</h1>
                <p className="text-xs text-slate-400 mt-1">Administration</p>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors mx-auto"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-grow overflow-y-auto p-4">
          {navSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-6">
              {sidebarOpen && (
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-3">
                  {section.title}
                </h3>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      className={`flex items-center ${
                        sidebarOpen ? 'space-x-3 px-3' : 'justify-center'
                      } py-3 rounded-lg transition-all group ${
                        isActive(item.href, item.exact)
                          ? 'bg-primary text-white shadow-lg shadow-primary/20'
                          : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                      title={!sidebarOpen ? item.label : ''}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {sidebarOpen && (
                        <span className="font-medium text-sm">{item.label}</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-slate-800">
          {sidebarOpen ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
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
                className="w-full justify-start text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Déconnexion
              </Button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="p-3 w-full hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center"
              title="Déconnexion"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 ${sidebarOpen ? 'ml-72' : 'ml-20'} transition-all duration-300`}>
        {/* Topbar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="px-8 py-4 flex items-center justify-between">
            {/* Recherche globale */}
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Rechercher des utilisateurs, cours, quiz..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 w-full bg-slate-50 border-slate-200 focus:bg-white"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 ml-6">
              {/* Notifications */}
              <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5 text-slate-600" />
                <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs bg-red-500">
                  3
                </Badge>
              </button>

              {/* Profil */}
              <button className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
                  {user?.email?.[0]?.toUpperCase() || 'A'}
                </div>
                <ChevronDown className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;