import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';

function Breadcrumb() {
  const location = useLocation();
  const parts = location.pathname.split('/').filter(Boolean);
  
  // Mapping des URLs vers des labels lisibles
  const labelMap = {
    'dashboard': 'Dashboard',
    'my-courses': 'My Courses',
    'course': 'Course',
    'quiz': 'Quiz',
    'profile': 'Profile',
    'leaderboard': 'Leaderboard',
    'challenges': 'Challenges',
    'badges': 'Badges',
    'chatbot': 'Chatbot',
    'exam': 'Exam',
    'my-shared-links': 'Mes Liens de Partage',
    'payment': 'Paiement',
    'orientation': 'Orientation Professionnelle'
  };

  // Mapping des URLs vers des liens de redirection
  const linkMap = {
    'course': '/my-courses', // Si on est sur /course/123, cliquer sur "Course" renvoie à /my-courses
  };
  
  const crumbs = parts.map((part, idx) => {
    const isNumber = !isNaN(part); // Détecte les IDs numériques
    const label = isNumber ? part : (labelMap[part] || decodeURIComponent(part.charAt(0).toUpperCase() + part.slice(1)));
    const defaultPath = '/' + parts.slice(0, idx + 1).join('/');
    const to = linkMap[part] || defaultPath;
    
    return { label, to, isId: isNumber };
  });

  return (
    <nav className="text-sm text-slate-500 dark:text-slate-400">
      <ol className="flex items-center gap-2">
        <li><Link to="/dashboard" className="hover:text-primary dark:hover:text-primary">Dashboard</Link></li>
        {crumbs.map((c, i) => (
          <li key={c.to} className="flex items-center gap-2">
            <span>/</span>
            {i === crumbs.length - 1 || c.isId ? (
              <span className="text-slate-700 dark:text-slate-300">{c.label}</span>
            ) : (
              <Link to={c.to} className="hover:text-primary dark:hover:text-primary">{c.label}</Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default function PrivateLayout({ children, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900 overflow-x-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-[280px] max-w-full overflow-x-hidden">
        {/* Top Bar with Breadcrumb */}
        <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-20 max-w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            {title && <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{title}</h1>}
            <Breadcrumb />
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-x-hidden">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}
