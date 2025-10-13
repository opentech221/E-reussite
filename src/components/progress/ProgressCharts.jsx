import { useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { format, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function ProgressCharts({ pointsHistory, stats }) {
  // Données pour le graphique de points (7 derniers jours)
  const pointsTimelineData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      return {
        date: format(date, 'EEE', { locale: fr }),
        fullDate: format(date, 'yyyy-MM-dd'),
        points: 0
      };
    });

    // Agréger les points par jour
    pointsHistory.forEach(entry => {
      const entryDate = format(new Date(entry.created_at), 'yyyy-MM-dd');
      const dayData = last7Days.find(d => d.fullDate === entryDate);
      if (dayData) {
        dayData.points += entry.points_earned;
      }
    });

    return last7Days;
  }, [pointsHistory]);

  // Données pour le graphique circulaire (répartition par type d'action)
  const actionTypeData = useMemo(() => {
    const counts = {
      lesson_completed: 0,
      chapter_completed: 0,
      course_completed: 0,
      challenge_completed: 0
    };

    pointsHistory.forEach(entry => {
      if (counts.hasOwnProperty(entry.action_type)) {
        counts[entry.action_type] += entry.points_earned;
      }
    });

    return [
      { name: 'Leçons', value: counts.lesson_completed, color: '#8b5cf6' },
      { name: 'Chapitres', value: counts.chapter_completed, color: '#3b82f6' },
      { name: 'Cours', value: counts.course_completed, color: '#10b981' },
      { name: 'Défis', value: counts.challenge_completed, color: '#f59e0b' }
    ].filter(item => item.value > 0);
  }, [pointsHistory]);

  // Statistiques de progression
  const progressData = useMemo(() => {
    return [
      { label: 'Leçons', value: stats?.lessons_completed || 0, max: 100, color: '#8b5cf6' },
      { label: 'Chapitres', value: stats?.chapters_completed || 0, max: 20, color: '#3b82f6' },
      { label: 'Cours', value: stats?.courses_completed || 0, max: 5, color: '#10b981' }
    ];
  }, [stats]);

  return (
    <div className="space-y-6">
      {/* Graphique de points sur 7 jours */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          📈 Points gagnés (7 derniers jours)
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={pointsTimelineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px'
              }}
              formatter={(value) => [`${value} points`, 'Points gagnés']}
            />
            <Line 
              type="monotone" 
              dataKey="points" 
              stroke="#8b5cf6" 
              strokeWidth={3}
              dot={{ fill: '#8b5cf6', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Grille avec 2 graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition des points par type */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            🎯 Répartition des points
          </h3>
          {actionTypeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={actionTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {actionTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value} points`, 'Points']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-gray-500">
              Complétez des leçons pour voir vos statistiques
            </div>
          )}
        </div>

        {/* Barres de progression */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            📊 Progression globale
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={progressData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" stroke="#6b7280" style={{ fontSize: '12px' }} />
              <YAxis 
                type="category" 
                dataKey="label" 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
                formatter={(value) => [`${value}`, 'Complété']}
              />
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                {progressData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
