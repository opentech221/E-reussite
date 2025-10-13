import { Trophy, TrendingUp, Flame, Target } from 'lucide-react';

export default function OverviewCards({ stats }) {
  const cards = [
    {
      icon: Trophy,
      label: 'Points totaux',
      value: stats?.total_points?.toLocaleString('fr-FR') || '0',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      iconBg: 'bg-yellow-100'
    },
    {
      icon: TrendingUp,
      label: 'Niveau',
      value: stats?.level || '1',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      iconBg: 'bg-purple-100'
    },
    {
      icon: Flame,
      label: 'Série actuelle',
      value: `${stats?.current_streak || 0} jours`,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      iconBg: 'bg-orange-100'
    },
    {
      icon: Target,
      label: 'Leçons complétées',
      value: stats?.lessons_completed || '0',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      iconBg: 'bg-blue-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className={`${card.bgColor} rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{card.label}</p>
                <p className={`text-2xl font-bold ${card.color}`}>
                  {card.value}
                </p>
              </div>
              <div className={`${card.iconBg} p-3 rounded-lg`}>
                <Icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
