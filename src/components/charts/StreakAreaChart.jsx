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

  // Custom tooltip avec analyse de tendance et statistiques
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const currentValue = data.value;
      const index = data.payload.index || 0;
      
      // Tendance (comparer avec jour précédent)
      let trend = null;
      let trendValue = 0;
      if (index > 0 && streaks[index - 1] !== undefined) {
        trendValue = currentValue - streaks[index - 1];
        trend = trendValue > 0 ? 'up' : trendValue < 0 ? 'down' : 'stable';
      }
      
      // Pourcentage par rapport au max
      const percentOfMax = ((currentValue / maxStreak) * 100).toFixed(1);
      
      // Comparaison avec la moyenne
      const deviation = ((currentValue - avgStreak) / avgStreak * 100).toFixed(1);
      const isAboveAverage = currentValue >= avgStreak;
      
      return (
        <div className="bg-gradient-to-br from-white to-orange-50 dark:from-gray-800 dark:to-orange-950 p-4 rounded-xl shadow-2xl border-2 border-orange-200 dark:border-orange-700 backdrop-blur-sm min-w-[220px]">
          {/* Date */}
          <div className="mb-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {data.payload.date}
            </p>
          </div>
          
          {/* Streak principal avec flame */}
          <div className="mb-3 flex items-center gap-2">
            <Flame className="h-6 w-6 text-orange-500" />
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {currentValue} {currentValue <= 1 ? 'jour' : 'jours'}
            </p>
          </div>
          
          {/* Tendance */}
          {trend && (
            <div className={`flex items-center gap-2 mb-2 p-2 rounded-lg ${
              trend === 'up' 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                : trend === 'down'
                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}>
              <span className="text-lg">
                {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
              </span>
              <span className="text-xs font-semibold">
                {trend === 'up' ? `+${trendValue}` : trend === 'down' ? trendValue : '0'} vs hier
              </span>
            </div>
          )}
          
          {/* Statistiques comparatives */}
          <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between">
              <span>📊 Moyenne:</span>
              <span className="font-semibold">{avgStreak}j</span>
            </div>
            <div className="flex justify-between">
              <span>🏆 Record:</span>
              <span className="font-semibold text-orange-600 dark:text-orange-400">{maxStreak}j</span>
            </div>
            <div className="flex justify-between">
              <span>� % du record:</span>
              <span className="font-semibold">{percentOfMax}%</span>
            </div>
          </div>
          
          {/* Badge de performance */}
          <div className={`mt-3 text-center text-xs font-bold py-2 px-3 rounded-lg ${
            currentValue >= maxStreak * 0.8
              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
              : currentValue >= avgStreak
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
              : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
          }`}>
            {currentValue >= maxStreak * 0.8 
              ? '🔥 EN FEU !' 
              : currentValue >= avgStreak 
              ? '✨ Super forme !'
              : '💪 Continue !'}
          </div>
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
