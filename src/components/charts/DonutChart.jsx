import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

/**
 * DonutChart - Graphique circulaire pour la répartition du temps par matière
 * 
 * @param {Array} data - Données au format [{name: "Maths", value: 120, color: "#3B82F6"}, ...]
 * @param {string} title - Titre du graphique
 * @param {string} subtitle - Sous-titre optionnel
 * @param {string} className - Classes CSS additionnelles
 */
const DonutChart = ({ 
  data = [], 
  title = "Répartition par matière", 
  subtitle = "",
  className = "" 
}) => {
  // Couleurs par défaut si non spécifiées
  const COLORS = [
    '#3B82F6', // blue
    '#10B981', // green
    '#A855F7', // purple
    '#F97316', // orange
    '#EC4899', // pink
    '#8B5CF6', // violet
    '#059669', // emerald
    '#F59E0B', // amber
  ];

  // Si pas de données, afficher message
  if (!data || data.length === 0) {
    return (
      <Card className={`${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            {title}
          </CardTitle>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">Aucune donnée disponible</p>
              <p className="text-sm">Commencez à étudier pour voir vos statistiques</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculer le total pour les pourcentages
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Custom label pour afficher les pourcentages
  const renderLabel = (entry) => {
    const percent = ((entry.value / total) * 100).toFixed(1);
    return `${percent}%`;
  };

  // Custom tooltip avec styling premium
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percent = ((data.value / total) * 100).toFixed(2);
      const average = (total / payload.length).toFixed(1);
      const deviation = ((data.value - average) / average * 100).toFixed(1);
      const isAboveAverage = data.value >= average;
      
      return (
        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-4 rounded-xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 backdrop-blur-sm">
          {/* Titre avec couleur de la matière */}
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: data.payload.color || data.color }}
            />
            <p className="font-bold text-gray-900 dark:text-white">{data.name}</p>
          </div>
          
          {/* Valeur principale */}
          <div className="space-y-1 text-sm">
            <p className="text-gray-700 dark:text-gray-200 font-semibold">
              ⏱️ {data.value}h ({percent}%)
            </p>
            
            {/* Comparaison avec la moyenne */}
            <p className={`text-xs flex items-center gap-1 ${
              isAboveAverage 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-orange-600 dark:text-orange-400'
            }`}>
              {isAboveAverage ? '↑' : '↓'} {Math.abs(deviation)}% vs moyenne ({average}h)
            </p>
            
            {/* Indicateur de performance */}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              {isAboveAverage ? '✨ Matière prioritaire' : '💡 À renforcer'}
            </p>
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
          <BookOpen className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
              label={renderLabel}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color || COLORS[index % COLORS.length]} 
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value, entry) => (
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {value} ({entry.payload.value}h)
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Stats totales */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Temps total
            </span>
            <span className="text-lg font-bold text-primary">
              {total}h
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DonutChart;
