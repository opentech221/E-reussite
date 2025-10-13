import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Target, 
  Calendar, 
  Gift, 
  CheckCircle2, 
  Clock,
  Sparkles,
  TrendingUp
} from 'lucide-react';

/**
 * Composant Challenges - Affiche les défis quotidiens et hebdomadaires
 */
export const Challenges = ({ challenges, onClaimReward, loading = false }) => {
  const [claimingId, setClaimingId] = useState(null);

  // Séparer les défis par type
  const dailyChallenges = challenges.filter(c => c.type === 'daily') || [];
  const weeklyChallenges = challenges.filter(c => c.type === 'weekly') || [];

  /**
   * Gérer la réclamation des récompenses
   */
  const handleClaimReward = async (challengeId) => {
    setClaimingId(challengeId);
    try {
      await onClaimReward(challengeId);
    } finally {
      setClaimingId(null);
    }
  };

  /**
   * Obtenir la couleur du badge selon la difficulté
   */
  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: 'bg-green-100 text-green-800 border-green-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      hard: 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[difficulty] || colors.easy;
  };

  /**
   * Obtenir le label de difficulté en français
   */
  const getDifficultyLabel = (difficulty) => {
    const labels = {
      easy: 'Facile',
      medium: 'Moyen',
      hard: 'Difficile'
    };
    return labels[difficulty] || difficulty;
  };

  /**
   * Calculer le temps restant
   */
  const getTimeRemaining = (expiresAt) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires - now;

    if (diff < 0) return 'Expiré';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}j restant${days > 1 ? 's' : ''}`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  /**
   * Composant ChallengeCard
   */
  const ChallengeCard = ({ challenge }) => {
    const isCompleted = challenge.status === 'completed';
    const isClaimed = challenge.status === 'claimed' || challenge.rewards_claimed;
    const progressPercentage = challenge.progress_percentage || 0;

    return (
      <div 
        className={`
          relative p-4 rounded-lg border-2 transition-all duration-300
          ${isCompleted || isClaimed
            ? 'bg-green-50 border-green-300 shadow-sm' 
            : 'bg-white border-slate-200 hover:border-primary hover:shadow-md'
          }
        `}
      >
        {/* Icon et Title */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div 
              className="text-3xl p-2 rounded-lg"
              style={{ backgroundColor: challenge.color + '20' }}
            >
              {challenge.icon}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-slate-900 text-sm mb-1">
                {challenge.title}
              </h4>
              <p className="text-xs text-slate-600 line-clamp-2">
                {challenge.description}
              </p>
            </div>
          </div>

          {isCompleted && (
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          )}
        </div>

        {/* Difficulté et temps restant */}
        <div className="flex items-center gap-2 mb-3">
          <Badge 
            variant="outline" 
            className={`text-xs ${getDifficultyColor(challenge.difficulty)}`}
          >
            {getDifficultyLabel(challenge.difficulty)}
          </Badge>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Clock className="w-3 h-3" />
            <span>{getTimeRemaining(challenge.expires_at)}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-600">Progression</span>
            <span className="font-semibold text-slate-900">
              {challenge.progress} / {challenge.target}
            </span>
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-2"
            style={{
              '--progress-background': challenge.color
            }}
          />
          <div className="text-right text-xs text-slate-500 mt-1">
            {progressPercentage}%
          </div>
        </div>

        {/* Récompenses */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-3 text-sm">
            {challenge.reward_points > 0 && (
              <div className="flex items-center gap-1 text-amber-600">
                <Sparkles className="w-4 h-4" />
                <span className="font-semibold">+{challenge.reward_points}</span>
              </div>
            )}
            {challenge.reward_badge && (
              <div className="flex items-center gap-1 text-purple-600">
                <Trophy className="w-4 h-4" />
                <span className="text-xs">Badge</span>
              </div>
            )}
          </div>

          {isCompleted && !isClaimed && (
            <Button
              size="sm"
              onClick={() => handleClaimReward(challenge.id)}
              disabled={claimingId === challenge.id}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              {claimingId === challenge.id ? (
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Réclamation...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Gift className="w-4 h-4" />
                  Réclamer
                </span>
              )}
            </Button>
          )}
        </div>
      </div>
    );
  };

  // État de chargement
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Défis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-500">Chargement des défis...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // État vide
  if (challenges.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Défis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Target className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Aucun défi disponible
            </h3>
            <p className="text-sm text-slate-600 text-center max-w-md mb-4">
              Les défis quotidiens et hebdomadaires apparaîtront ici. Revenez plus tard pour de nouveaux défis !
            </p>
            <Button 
              variant="outline"
              onClick={() => window.location.reload()}
              className="mt-2"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Défis
          </span>
          <Badge variant="outline" className="text-xs">
            {challenges.filter(c => c.status === 'completed').length} / {challenges.length} complétés
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Défis quotidiens */}
        {dailyChallenges.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-blue-600" />
              <h3 className="font-semibold text-sm text-slate-900">
                Défis Quotidiens
              </h3>
              <Badge variant="secondary" className="text-xs">
                {dailyChallenges.filter(c => c.status === 'completed').length} / {dailyChallenges.length}
              </Badge>
            </div>
            <div className="grid gap-3">
              {dailyChallenges.map(challenge => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
            </div>
          </div>
        )}

        {/* Défis hebdomadaires */}
        {weeklyChallenges.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-4 h-4 text-purple-600" />
              <h3 className="font-semibold text-sm text-slate-900">
                Défis Hebdomadaires
              </h3>
              <Badge variant="secondary" className="text-xs">
                {weeklyChallenges.filter(c => c.status === 'completed').length} / {weeklyChallenges.length}
              </Badge>
            </div>
            <div className="grid gap-3">
              {weeklyChallenges.map(challenge => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Challenges;
