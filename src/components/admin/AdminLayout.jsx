import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, BookCopy, ShoppingBag, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const AdminLayout = () => {
  const location = useLocation();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const navItems = [
    { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/users', icon: Users, label: 'Utilisateurs' },
    { href: '/admin/courses', icon: BookCopy, label: 'Cours' },
    { href: '/admin/products', icon: ShoppingBag, label: 'Produits' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col">
        <h1 className="text-2xl font-bold font-heading mb-12">Admin E-Réussite</h1>
        <nav className="flex-grow">
          <ul className="space-y-2">
            {navItems.map(item => (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    location.pathname === item.href
                      ? 'bg-primary text-white'
                      : 'hover:bg-slate-800'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-slate-300 hover:bg-slate-800 hover:text-white">
            <LogOut className="w-5 h-5 mr-3" />
            Déconnexion
          </Button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;