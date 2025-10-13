import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu, X, Book, Sparkles, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export default function NavbarPublic() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Accueil', path: '/' },
    { name: 'Nos cours', path: '/courses' },
    { name: 'Tarifs', path: '/pricing' },
    { name: 'Boutique', path: '/shop' },
    { name: 'À propos', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const linkClass = ({ isActive }) =>
    `text-sm font-semibold transition-all duration-300 hover:scale-105 relative group ${
      isActive ? 'text-primary' : 'text-slate-700 dark:text-slate-200 hover:text-primary'
    }`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-white/95 via-blue-50/90 to-white/95 backdrop-blur-xl border-b border-slate-200/50 shadow-lg shadow-blue-500/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo modernisé */}
          <Link to="/" className="flex items-center space-x-3 group">
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
              <span className="text-xs text-slate-500 font-medium -mt-1">Votre succès commence ici</span>
            </div>
          </Link>

          {/* Navigation desktop */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <NavLink key={link.path} to={link.path} className={linkClass} end={link.path === '/'}>
                {({ isActive }) => (
                  <>
                    {link.name}
                    {isActive && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-accent rounded-full"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* Boutons d'action */}
          <div className="hidden md:flex items-center space-x-3">
            <Link to="/login">
              <Button 
                variant="ghost" 
                className="text-primary font-semibold hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all duration-300"
              >
                Connexion
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-gradient-to-r from-primary to-accent text-white font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:scale-105 transition-all duration-300">
                <Sparkles className="w-4 h-4 mr-2" />
                Inscription
              </Button>
            </Link>
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
            className="md:hidden bg-white/98 backdrop-blur-xl border-t border-slate-200/50 shadow-2xl"
          >
            <div className="px-4 py-6 space-y-4">
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
                    end={link.path === '/'}
                  >
                    {link.name}
                  </NavLink>
                </motion.div>
              ))}
              <motion.div 
                className="pt-4 flex flex-col gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Link to="/login" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full text-primary border-primary/30 hover:bg-primary/5">
                    Connexion
                  </Button>
                </Link>
                <Link to="/signup" onClick={() => setIsOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-primary to-accent text-white shadow-lg">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Inscription
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

