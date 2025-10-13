import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, Shield, Bot, LogOut, LayoutDashboard, BookOpen, TrendingUp, Target, Trophy, Award, GraduationCap, Sparkles, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useCart } from '@/hooks/useCart';
import { NotificationBell } from '@/components/NotificationCenter';
import { supabase } from '@/lib/customSupabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

export default function NavbarPrivate() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [role, setRole] = useState(null);

  useEffect(() => {
    const fetchRole = async () => {
      if (user) {
        const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        setRole(data?.role || null);
      } else {
        setRole(null);
      }
    };
    fetchRole();
  }, [user]);

  const linkClass = ({ isActive }) =>
    `text-sm font-semibold transition-all duration-300 hover:scale-105 relative group ${
      isActive ? 'text-primary' : 'text-slate-700 dark:text-slate-200 hover:text-primary'
    }`;

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const navLinks = [
    { name: 'Tableau de bord', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Cours', path: '/my-courses', icon: BookOpen },
    { name: 'Progression', path: '/progress', icon: TrendingUp },
    { name: 'Coach IA', path: '/ai-coach', icon: Sparkles },
    { name: 'Défis', path: '/challenges', icon: Target },
    { name: 'Classement', path: '/leaderboard', icon: Trophy },
    { name: 'Badges', path: '/badges', icon: Award },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-white/95 via-purple-50/90 to-white/95 backdrop-blur-xl border-b border-slate-200/50 shadow-lg shadow-purple-500/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo modernisé */}
          <Link to="/dashboard" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold font-heading bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                E-Réussite
              </span>
              <span className="text-xs text-slate-500 font-medium -mt-1">Espace Apprenant</span>
            </div>
          </Link>

          {/* Navigation desktop */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <NavLink key={link.path} to={link.path} className={linkClass}>
                {({ isActive }) => (
                  <div className="relative px-3 py-2 rounded-lg">
                    <span className="inline-flex items-center gap-2">
                      <link.icon className="w-4 h-4" />
                      {link.name}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="navbar-private-indicator"
                        className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </div>
                )}
              </NavLink>
            ))}
          </div>

          {/* Actions utilisateur */}
          <div className="hidden md:flex items-center space-x-2">
            <Link to="/chatbot">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-primary border-primary/30 hover:bg-primary/10 hover:border-primary font-semibold transition-all duration-300"
              >
                <Bot className="w-4 h-4 mr-2" /> Assistant IA
              </Button>
            </Link>
            
            <NotificationBell />
            
            {/* Panier avec badge */}
            <Link to="/cart" className="relative group">
              <Button 
                variant="ghost" 
                size="icon" 
                className="hover:bg-primary/10 transition-all duration-300 hover:scale-110"
              >
                <ShoppingCart className="w-5 h-5 text-slate-700 dark:text-slate-200 group-hover:text-primary transition-colors" />
                {cart.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg"
                  >
                    {cart.length}
                  </motion.span>
                )}
              </Button>
            </Link>
            
            {/* Profil */}
            <Link to="/profile">
              <Button 
                variant="ghost" 
                className="text-slate-700 dark:text-slate-200 hover:text-primary hover:bg-primary/10 font-semibold transition-all duration-300"
              >
                <User className="w-4 h-4 mr-2" /> Profil
              </Button>
            </Link>
            
            {/* Paramètres */}
            <Link to="/settings">
              <Button 
                variant="ghost" 
                className="text-slate-700 dark:text-slate-200 hover:text-primary hover:bg-primary/10 font-semibold transition-all duration-300"
              >
                <Settings className="w-4 h-4 mr-2" /> Paramètres
              </Button>
            </Link>
            
            {/* Admin */}
            {role === 'admin' && (
              <Link to="/admin">
                <Button 
                  variant="destructive" 
                  size="sm"
                  className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 shadow-lg"
                >
                  <Shield className="w-4 h-4 mr-2" /> Admin
                </Button>
              </Link>
            )}
            
            {/* Déconnexion */}
            <Button 
              onClick={handleLogout} 
              variant="outline" 
              className="border-primary/30 text-primary hover:bg-primary hover:text-white font-semibold transition-all duration-300"
            >
              <LogOut className="w-4 h-4 mr-2" /> Déconnexion
            </Button>
          </div>

          {/* Menu mobile */}
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="md:hidden text-primary p-2 hover:bg-primary/10 rounded-lg transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Menu mobile animé */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white/98 backdrop-blur-xl border-t border-slate-200/50 shadow-2xl overflow-hidden"
          >
            <div className="px-4 py-6 space-y-3 max-h-[80vh] overflow-y-auto">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <NavLink 
                    to={link.path} 
                    onClick={() => setIsOpen(false)} 
                    className={linkClass}
                  >
                    {({ isActive }) => (
                      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive ? 'bg-primary/10 border border-primary/20' : 'hover:bg-slate-100'}`}>
                        <link.icon className="w-5 h-5" />
                        <span>{link.name}</span>
                      </div>
                    )}
                  </NavLink>
                </motion.div>
              ))}
              
              <motion.div 
                className="pt-4 grid grid-cols-2 gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Link to="/chatbot" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full text-primary border-primary/30">
                    <Bot className="w-4 h-4 mr-2" /> IA
                  </Button>
                </Link>
                <Link to="/cart" onClick={() => setIsOpen(false)} className="relative">
                  <Button variant="outline" className="w-full">
                    <ShoppingCart className="w-4 h-4 mr-2" /> Panier
                    {cart.length > 0 && (
                      <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {cart.length}
                      </span>
                    )}
                  </Button>
                </Link>
                <Link to="/profile" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full text-primary">
                    <User className="w-4 h-4 mr-2" /> Profil
                  </Button>
                </Link>
                <Link to="/settings" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full text-primary">
                    <Settings className="w-4 h-4 mr-2" /> Paramètres
                  </Button>
                </Link>
                {role === 'admin' && (
                  <Link to="/admin" onClick={() => setIsOpen(false)}>
                    <Button variant="destructive" className="w-full">
                      <Shield className="w-4 h-4 mr-2" /> Admin
                    </Button>
                  </Link>
                )}
                <Button 
                  onClick={() => { handleLogout(); setIsOpen(false); }} 
                  variant="outline" 
                  className="w-full col-span-2 border-primary text-primary"
                >
                  <LogOut className="w-4 h-4 mr-2" /> Déconnexion
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

