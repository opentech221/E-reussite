import React from 'react';
import NavbarPublic from '@/components/NavbarPublic';
import Footer from '@/components/Footer';
import { Outlet } from 'react-router-dom';

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <NavbarPublic />
      <main className="flex-1 pt-20 max-w-full overflow-x-hidden">{children || <Outlet />}</main>
      <Footer />
    </div>
  );
}
