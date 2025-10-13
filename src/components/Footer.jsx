import React from 'react';
import { Link } from 'react-router-dom';
import { Book, Facebook, Twitter, Instagram, Linkedin, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const Footer = () => {
  const { toast } = useToast();

  const handleLanguageChange = () => {
    toast({
      title: "Bientôt multilingue !",
      description: "Nous préparons la traduction en Wolof, Peulh et d'autres langues. 🚀",
    });
  };

  return (
    <footer className="bg-slate-50 mt-20 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Book className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold font-heading text-primary">E-Réussite</span>
            </div>
            <p className="text-slate-500 text-sm">
              Votre plateforme d'apprentissage en ligne pour réussir le BFEM et le Baccalauréat.
            </p>
          </div>

          <div>
            <p className="font-semibold font-heading text-slate-800 mb-4">Navigation</p>
            <ul className="space-y-2">
              <li><Link to="/" className="text-slate-500 hover:text-primary transition-colors">Accueil</Link></li>
              <li><Link to="/courses" className="text-slate-500 hover:text-primary transition-colors">Nos cours</Link></li>
              <li><Link to="/pricing" className="text-slate-500 hover:text-primary transition-colors">Tarifs</Link></li>
              <li><Link to="/shop" className="text-slate-500 hover:text-primary transition-colors">Boutique</Link></li>
              <li><Link to="/about" className="text-slate-500 hover:text-primary transition-colors">À propos</Link></li>
            </ul>
          </div>

          <div>
            <p className="font-semibold font-heading text-slate-800 mb-4">Support</p>
            <ul className="space-y-2">
              <li><Link to="/contact" className="text-slate-500 hover:text-primary transition-colors">Contact</Link></li>
              <li><Link to="/faq" className="text-slate-500 hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link to="/help" className="text-slate-500 hover:text-primary transition-colors">Aide</Link></li>
            </ul>
          </div>

          <div>
            <p className="font-semibold font-heading text-slate-800 mb-4">Suivez-nous</p>
            <div className="flex space-x-4 mb-6">
              <a href="#" className="text-slate-500 hover:text-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-500 hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-500 hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-500 hover:text-primary transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
            <Button variant="outline" size="sm" onClick={handleLanguageChange}>
              <Globe className="w-4 h-4 mr-2" /> Français
            </Button>
          </div>
        </div>

        <div className="border-t border-slate-200 mt-8 pt-8 text-center">
          <p className="text-slate-500 text-sm">
            © 2025 E-Réussite. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;