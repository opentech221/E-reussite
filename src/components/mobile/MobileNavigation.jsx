import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, BookOpen, Target, Trophy, User, 
  LayoutDashboard, Brain, Zap 
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Navigation mobile optimisée en bottom bar
 * Avec animations et indicateurs actifs
 */
const MobileNavigation = () => {
  const location = useLocation();

  const navItems = [
    {
      path: '/dashboard',
      icon: LayoutDashboard,
      label: 'Accueil',
      color: 'text-blue-600'
    },
    {
      path: '/my-courses',
      icon: BookOpen,
      label: 'Cours',
      color: 'text-green-600'
    },
    {
      path: '/quiz',
      icon: Target,
      label: 'Quiz',
      color: 'text-purple-600'
    },
    {
      path: '/challenges',
      icon: Zap,
      label: 'Défis',
      color: 'text-yellow-600'
    },
    {
      path: '/profile',
      icon: User,
      label: 'Profil',
      color: 'text-gray-600'
    }
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <>
      {/* Spacer pour éviter que le contenu soit caché */}
      <div className="h-20 md:hidden" />

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-2xl z-50 md:hidden safe-area-inset-bottom">
        <div className="grid grid-cols-5 h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1",
                  "transition-colors touch-manipulation active:bg-gray-100",
                  active ? item.color : "text-gray-400"
                )}
              >
                {/* Indicateur actif */}
                {active && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-b-full"
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30
                    }}
                  />
                )}

                {/* Icône avec animation */}
                <motion.div
                  animate={{
                    scale: active ? 1.1 : 1,
                    y: active ? -2 : 0
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Icon className={cn("w-6 h-6", active && "drop-shadow-sm")} />
                </motion.div>

                {/* Label */}
                <span
                  className={cn(
                    "text-xs font-medium transition-all",
                    active ? "opacity-100" : "opacity-70"
                  )}
                >
                  {item.label}
                </span>

                {/* Badge de notification (optionnel) */}
                {item.badge && (
                  <span className="absolute top-2 right-4 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default MobileNavigation;
