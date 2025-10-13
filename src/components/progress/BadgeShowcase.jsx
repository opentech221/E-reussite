import { Lock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function BadgeShowcase({ badges }) {
  // Tous les badges possibles (définition statique pour afficher les badges verrouillés)
  const allPossibleBadges = [
    {
      badge_name: 'Apprenant Assidu',
      badge_icon: '🎓',
      badge_description: 'Complétez 10 leçons',
      badge_type: 'progression'
    },
    {
      badge_name: 'Finisseur',
      badge_icon: '📚',
      badge_description: 'Complétez 5 chapitres',
      badge_type: 'progression'
    },
    {
      badge_name: 'Maître de cours',
      badge_icon: '🌟',
      badge_description: 'Complétez un cours entier',
      badge_type: 'progression'
    },
    {
      badge_name: 'Expert',
      badge_icon: '🚀',
      badge_description: 'Complétez 3 cours',
      badge_type: 'progression'
    },
    {
      badge_name: "Série d'apprentissage",
      badge_icon: '🔥',
      badge_description: 'Apprenez pendant 7 jours consécutifs',
      badge_type: 'streak'
    }
  ];

  // Créer une liste combinée avec état earned/locked
  const badgesList = allPossibleBadges.map(possibleBadge => {
    const earnedBadge = badges.find(b => b.badge_name === possibleBadge.badge_name);
    return {
      ...possibleBadge,
      earned: !!earnedBadge,
      earned_at: earnedBadge?.earned_at,
      id: earnedBadge?.id
    };
  });

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          🏅 Badges
        </h2>
        <span className="text-sm text-gray-600">
          {badges.length}/{allPossibleBadges.length}
        </span>
      </div>

      <div className="space-y-4">
        {badgesList.map((badge, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border-2 transition-all ${
              badge.earned
                ? 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 shadow-sm'
                : 'bg-gray-50 border-gray-200 opacity-60'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`text-4xl ${badge.earned ? '' : 'grayscale opacity-50'}`}>
                {badge.earned ? badge.badge_icon : <Lock className="w-8 h-8 text-gray-400" />}
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold ${badge.earned ? 'text-gray-900' : 'text-gray-500'}`}>
                  {badge.badge_name}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {badge.badge_description}
                </p>
                {badge.earned && badge.earned_at && (
                  <p className="text-xs text-purple-600 mt-2">
                    ✓ Débloqué le {format(new Date(badge.earned_at), 'dd MMM yyyy', { locale: fr })}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {badges.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">
            Complétez des leçons pour débloquer vos premiers badges ! 🎯
          </p>
        </div>
      )}
    </div>
  );
}
