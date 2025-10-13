import ChallengeItem from './ChallengeItem';

export default function ChallengeList({ challenges, userId, onChallengeComplete }) {
  // Vérifier les défis complétés mais non réclamés
  const completedUnclaimed = challenges.filter(
    c => c.user_learning_challenges[0]?.is_completed && !c.user_learning_challenges[0]?.reward_claimed
  );

  const totalClaimablePoints = completedUnclaimed.reduce(
    (sum, c) => sum + c.reward_points, 0
  );

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            🎯 Défis de la semaine
          </h2>
          {completedUnclaimed.length > 0 && (
            <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
              +{totalClaimablePoints} pts à réclamer
            </div>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-1">
          {completedUnclaimed.length} défi{completedUnclaimed.length > 1 ? 's' : ''} complété{completedUnclaimed.length > 1 ? 's' : ''}
        </p>
      </div>

      <div className="space-y-4">
        {challenges.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              Aucun défi actif cette semaine. Revenez lundi ! 📅
            </p>
          </div>
        ) : (
          challenges.map((challenge) => (
            <ChallengeItem
              key={challenge.id}
              challenge={challenge}
              userId={userId}
              onComplete={onChallengeComplete}
            />
          ))
        )}
      </div>

      {challenges.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <p className="font-semibold mb-2">💡 Comment fonctionnent les défis ?</p>
            <ul className="space-y-1 ml-4">
              <li>• Les défis se renouvellent chaque semaine (lundi)</li>
              <li>• Votre progression est mise à jour automatiquement</li>
              <li>• Réclamez vos récompenses après complétion</li>
              <li>• Les points sont ajoutés à votre total immédiatement</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
