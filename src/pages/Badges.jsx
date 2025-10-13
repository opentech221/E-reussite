import React from 'react';
import { Helmet } from 'react-helmet';
import Navbar from '@/components/Navbar';
import BadgeSystem from '@/components/BadgeSystem';

const Badges = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Helmet>
        <title>Badges et Réalisations - E-Réussite</title>
        <meta name="description" content="Découvrez vos badges et réalisations sur E-Réussite" />
      </Helmet>
      
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="text-center mb-8 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 rounded-2xl p-8 shadow-lg">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            🏆 Badges et Réalisations
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Célébrez vos accomplissements et suivez votre progression avec notre système de badges inspiré de la culture africaine
          </p>
        </div>
        
        <BadgeSystem />
      </div>
    </div>
  );
};

export default Badges;