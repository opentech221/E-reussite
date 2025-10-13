import React, { useState } from 'react';
import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Calendar } from 'lucide-react';

// Custom Tooltip pour afficher les détails
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    return (
      <div className="bg-white border-2 border-primary rounded-lg shadow-lg p-3">
        <p className="font-semibold text-slate-900 mb-2">{data.dateFormatted}</p>
        <p className="text-primary font-bold text-lg mb-1">
          {data.points} points
        </p>
        <p className="text-xs text-slate-500">
          {data.actions} action{data.actions > 1 ? 's' : ''}
        </p>
        
        {data.details && data.details.length > 0 && (
          <div className="mt-2 pt-2 border-t border-slate-200">
            <p className="text-xs font-semibold text-slate-700 mb-1">Détails :</p>
            {data.details.map((detail, idx) => (
              <p key={idx} className="text-xs text-slate-600">
                • {detail.type === 'quiz_completion' ? 'Quiz' : 'Leçon'} : +{detail.points}pts
              </p>
            ))}
          </div>
        )}
      </div>
    );
  }
  
  return null;
};

// Composant principal
export const PointsChart = ({ data, loading = false }) => {
  const [period, setPeriod] = useState(7); // 7 ou 30 jours
  const [chartType, setChartType] = useState('area'); // 'line' ou 'area'
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Évolution des Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-pulse text-slate-400">
              Chargement des données...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Évolution des Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex flex-col items-center justify-center text-slate-400">
            <Calendar className="w-12 h-12 mb-2 opacity-50" />
            <p>Pas encore de données</p>
            <p className="text-sm">Complétez des quiz pour voir votre progression</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Calculer les statistiques
  const totalPoints = data.reduce((sum, day) => sum + day.points, 0);
  const averagePoints = Math.round(totalPoints / data.length);
  const maxPoints = Math.max(...data.map(d => d.points));
  const daysWithActivity = data.filter(d => d.points > 0).length;
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Évolution des Points
          </CardTitle>
          
          <div className="flex gap-2">
            <Button
              variant={chartType === 'line' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('line')}
            >
              Ligne
            </Button>
            <Button
              variant={chartType === 'area' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('area')}
            >
              Zone
            </Button>
          </div>
        </div>
        
        {/* Stats rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs text-blue-600 font-medium">Total</p>
            <p className="text-xl font-bold text-blue-700">{totalPoints}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-xs text-green-600 font-medium">Moyenne/jour</p>
            <p className="text-xl font-bold text-green-700">{averagePoints}</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3">
            <p className="text-xs text-amber-600 font-medium">Record</p>
            <p className="text-xl font-bold text-amber-700">{maxPoints}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <p className="text-xs text-purple-600 font-medium">Jours actifs</p>
            <p className="text-xl font-bold text-purple-700">{daysWithActivity}/{data.length}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          {chartType === 'area' ? (
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="dateFormatted" 
                stroke="#64748b"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#64748b"
                style={{ fontSize: '12px' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="points" 
                stroke="#3b82f6" 
                strokeWidth={2}
                fill="url(#colorPoints)"
                animationDuration={1000}
              />
            </AreaChart>
          ) : (
            <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="dateFormatted" 
                stroke="#64748b"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#64748b"
                style={{ fontSize: '12px' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="points" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
                animationDuration={1000}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
        
        <div className="mt-4 text-center text-xs text-slate-500">
          Derniers {data.length} jours
        </div>
      </CardContent>
    </Card>
  );
};

export default PointsChart;
