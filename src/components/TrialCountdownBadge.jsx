/**
 * Composant Badge de Compte à Rebours d'Essai Gratuit
 * Affiche les jours restants de l'essai gratuit dans le dashboard
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Sparkles, Check, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';

const TrialCountdownBadge = () => {
  const { subscription, loading, status, daysRemaining, isActive } = useSubscription();

  // Ne rien afficher si chargement ou si abonnement actif (payé)
  if (loading) return null;
  if (status === 'active') return null;
  if (!subscription?.has_subscription) return null;

  // Déterminer la couleur et l'icône selon les jours restants
  const getStatusConfig = () => {
    if (status === 'expired') {
      return {
        color: 'red',
        bgGradient: 'from-red-500 to-rose-600',
        bgLight: 'from-red-50 to-rose-50',
        borderColor: 'border-red-300',
        textColor: 'text-red-700',
        icon: AlertCircle,
        message: 'Essai gratuit expiré',
        cta: 'Payer maintenant pour continuer'
      };
    } else if (daysRemaining <= 1) {
      return {
        color: 'orange',
        bgGradient: 'from-orange-500 to-amber-600',
        bgLight: 'from-orange-50 to-amber-50',
        borderColor: 'border-orange-300',
        textColor: 'text-orange-700',
        icon: Clock,
        message: `Dernier jour d'essai !`,
        cta: 'Continuer avec 1000 FCFA'
      };
    } else if (daysRemaining <= 3) {
      return {
        color: 'yellow',
        bgGradient: 'from-yellow-500 to-orange-500',
        bgLight: 'from-yellow-50 to-orange-50',
        borderColor: 'border-yellow-300',
        textColor: 'text-yellow-700',
        icon: Clock,
        message: `${daysRemaining} jours d'essai restants`,
        cta: 'Payer maintenant (1000 FCFA)'
      };
    } else {
      return {
        color: 'blue',
        bgGradient: 'from-blue-500 to-cyan-600',
        bgLight: 'from-blue-50 to-cyan-50',
        borderColor: 'border-blue-300',
        textColor: 'text-blue-700',
        icon: Sparkles,
        message: `${daysRemaining} jours d'essai restants`,
        cta: 'Profitez de votre essai !'
      };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Card className={`border-2 ${config.borderColor} shadow-lg overflow-hidden bg-gradient-to-br ${config.bgLight} dark:from-slate-800 dark:to-slate-900`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              {/* Icône animée */}
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${config.bgGradient} flex items-center justify-center shadow-lg`}
              >
                <StatusIcon className="w-6 h-6 text-white" />
              </motion.div>

              {/* Contenu */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className={`text-lg font-bold ${config.textColor} dark:text-white`}>
                    {config.message}
                  </h3>
                  {status === 'trial' && (
                    <span className="px-2 py-1 text-xs font-semibold bg-white/50 dark:bg-slate-700 rounded-full">
                      Essai gratuit
                    </span>
                  )}
                </div>

                {status === 'trial' && (
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                    Votre accès gratuit expire le{' '}
                    <span className="font-semibold">
                      {new Date(subscription.trial_end_date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                    . Ne manquez pas cette opportunité !
                  </p>
                )}

                {status === 'expired' && (
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                    Votre essai gratuit a expiré. Payez 1000 FCFA une seule fois pour continuer à profiter de tous les cours et du Coach IA à vie !
                  </p>
                )}

                {/* Barre de progression */}
                {status === 'trial' && daysRemaining >= 0 && (
                  <div className="mb-4">
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(daysRemaining / 7) * 100}%` }}
                        transition={{ duration: 1 }}
                        className={`h-2 rounded-full bg-gradient-to-r ${config.bgGradient}`}
                      />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {daysRemaining} jour{daysRemaining > 1 ? 's' : ''} sur 7
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Bouton CTA */}
            {(status === 'expired' || daysRemaining <= 3) && (
              <Link to="/pricing">
                <Button
                  size="sm"
                  className={`bg-gradient-to-r ${config.bgGradient} hover:opacity-90 text-white font-semibold shadow-lg hover:scale-105 transition-transform`}
                >
                  {status === 'expired' ? 'Activer maintenant' : 'Payer 1000 FCFA'}
                </Button>
              </Link>
            )}
          </div>

          {/* Avantages rappelés */}
          {status === 'trial' && daysRemaining <= 3 && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Avec 1000 FCFA unique, vous obtenez :
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <Check className="w-3 h-3 text-green-600" />
                  <span>Accès à vie</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <Check className="w-3 h-3 text-green-600" />
                  <span>Coach IA 24h/24</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <Check className="w-3 h-3 text-green-600" />
                  <span>Tous les cours</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <Check className="w-3 h-3 text-green-600" />
                  <span>Quiz illimités</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TrialCountdownBadge;
