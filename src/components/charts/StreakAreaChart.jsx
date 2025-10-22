import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame } from 'lucide-react';

/**
 * StreakAreaChart - Graphique en aires pour l'évolution du streak
 * 
 * @param {Array} data - Données au format [{date: "15 Oct", streak: 5}, ...]
 * @param {string} title - Titre du graphique
 * @param {string} subtitle - Sous-titre optionnel
 * @param {string} className - Classes CSS additionnelles
 */
const StreakAreaChart = ({ 
  data = [], 
  title = "Évolution du streak", 
  subtitle = "",
  className = "" 
}) => {
  // Si pas de données, afficher message
  if (!data || data.length === 0) {
    return (
      <Card className={`${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            {title}
          </CardTitle>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <Flame className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">Aucune donnée disponible</p>
              <p className="text-sm">Commencez à étudier pour construire votre streak</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculer les statistiques
  const streaks = data.map(d => d.streak || 0);
  const maxStreak = Math.max(...streaks);
  const currentStreak = streaks[streaks.length - 1] || 0;
  const avgStreak = Math.round(streaks.reduce((sum, s) => sum + s, 0) / streaks.length);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-white">{data.payload.date}</p>
          <p className="text-sm text-orange-600 dark:text-orange-400">
            🔥 {data.value} jours
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          {title}
        </CardTitle>
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorStreak" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F97316" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#F97316" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#e5e7eb" 
              className="dark:stroke-gray-700" 
            />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              className="dark:stroke-gray-400"
            />
            <YAxis 
              stroke="#6b7280"
              tick={{ fill: '#6b7280' }}
              className="dark:stroke-gray-400"
              label={{ 
                value: 'Jours', 
                angle: -90, 
                position: 'insideLeft',
                style: { fill: '#6b7280' }
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="streak" 
              stroke="#F97316" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorStreak)"
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
        
        {/* Stats résumées */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Actuel</p>
            <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
              🔥 {currentStreak}j
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Record</p>
            <p className="text-lg font-bold text-primary">
              {maxStreak}j
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Moyenne</p>
            <p className="text-lg font-bold text-green-600 dark:text-green-400">
              {avgStreak}j
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StreakAreaChart;
