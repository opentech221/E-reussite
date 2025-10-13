import { useState } from 'react';
import { CheckCircle, Gift, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/hooks/use-toast';

export default function ChallengeItem({ challenge, userId, onComplete }) {
  const [claiming, setClaiming] = useState(false);
  const { toast } = useToast();

  const userChallenge = challenge.user_learning_challenges[0];
  const progress = userChallenge?.current_progress || 0;
  const target = challenge.target_value;
  const isCompleted = userChallenge?.is_completed || false;
  const isClaimed = userChallenge?.reward_claimed || false;
  const percentage = Math.min((progress / target) * 100, 100);

  const handleClaim = async () => {
    try {
      setClaiming(true);

      // Appeler la fonction Supabase pour réclamer la récompense
      const { data, error } = await supabase.rpc('complete_learning_challenge', {
        p_user_id: userId,
        p_challenge_id: challenge.id
      });

      if (error) throw error;

      toast({
        title: '🎉 Récompense réclamée !',
        description: `+${challenge.reward_points} points ajoutés à votre total`,
        duration: 5000,
      });

      // Rafraîchir les données
      if (onComplete) {
        onComplete();
      }

    } catch (err) {
      console.error('Erreur lors de la réclamation:', err);
      toast({
        title: 'Erreur',
        description: err.message || 'Impossible de réclamer la récompense',
        variant: 'destructive',
        duration: 5000,
      });
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className={`p-4 rounded-lg border-2 transition-all ${
      isCompleted && !isClaimed
        ? 'bg-green-50 border-green-300 shadow-md'
        : isClaimed
        ? 'bg-gray-50 border-gray-200'
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <span className="text-3xl">{challenge.icon}</span>
          <div>
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              {challenge.name}
              {isClaimed && (
                <CheckCircle className="w-4 h-4 text-green-600" />
              )}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {challenge.description}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-sm font-semibold text-purple-600">
            <Gift className="w-4 h-4" />
            {challenge.reward_points} pts
          </div>
        </div>
      </div>

      {/* Barre de progression */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-600">Progression</span>
          <span className={`font-semibold ${
            isCompleted ? 'text-green-600' : 'text-gray-900'
          }`}>
            {progress} / {target}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-2.5 rounded-full transition-all duration-500 ${
              isCompleted ? 'bg-green-500' : 'bg-purple-600'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Bouton de réclamation */}
      {isCompleted && !isClaimed && (
        <button
          onClick={handleClaim}
          disabled={claiming}
          className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {claiming ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Réclamation...
            </>
          ) : (
            <>
              <Gift className="w-4 h-4" />
              Réclamer {challenge.reward_points} points
            </>
          )}
        </button>
      )}

      {isClaimed && (
        <div className="mt-2 text-center text-sm text-green-600 font-semibold">
          ✓ Récompense réclamée
        </div>
      )}
    </div>
  );
}
