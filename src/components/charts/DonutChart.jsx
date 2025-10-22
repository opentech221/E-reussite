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

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-white">{data.name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {data.value}h - {((data.value / total) * 100).toFixed(1)}%
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
