import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';

/**
 * StudyTimeBarChart - Graphique en barres pour le temps d'étude quotidien
 * 
 * @param {Array} data - Données au format [{day: "Lun", minutes: 120}, ...]
 * @param {string} title - Titre du graphique
 * @param {string} subtitle - Sous-titre optionnel
 * @param {string} className - Classes CSS additionnelles
 */
const StudyTimeBarChart = ({ 
  data = [], 
  title = "Temps d'étude quotidien", 
  subtitle = "",
  className = "" 
}) => {
  // Si pas de données, afficher message
  if (!data || data.length === 0) {
    return (
      <Card className={`${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            {title}
          </CardTitle>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">Aucune donnée disponible</p>
              <p className="text-sm">Commencez à étudier pour voir vos statistiques</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculer le total et la moyenne
  const totalMinutes = data.reduce((sum, item) => sum + (item.minutes || 0), 0);
  const averageMinutes = Math.round(totalMinutes / data.length);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const hours = Math.floor(data.value / 60);
      const minutes = data.value % 60;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-white">{data.payload.day}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {hours > 0 && `${hours}h `}{minutes}min
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
          <Clock className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#e5e7eb" 
              className="dark:stroke-gray-700" 
            />
            <XAxis 
              dataKey="day" 
              stroke="#6b7280"
              tick={{ fill: '#6b7280' }}
              className="dark:stroke-gray-400"
            />
            <YAxis 
              stroke="#6b7280"
              tick={{ fill: '#6b7280' }}
              className="dark:stroke-gray-400"
              label={{ 
                value: 'Minutes', 
                angle: -90, 
                position: 'insideLeft',
                style: { fill: '#6b7280' }
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="minutes" 
              fill="#10B981" 
              radius={[8, 8, 0, 0]}
              animationDuration={800}
            />
          </BarChart>
        </ResponsiveContainer>
        
        {/* Stats résumées */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
            <p className="text-lg font-bold text-primary">
              {Math.floor(totalMinutes / 60)}h{totalMinutes % 60}min
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Moyenne/jour</p>
            <p className="text-lg font-bold text-green-600 dark:text-green-400">
              {Math.floor(averageMinutes / 60)}h{averageMinutes % 60}min
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudyTimeBarChart;
