/**
 * 📊 RADAR CHART - Affichage visuel du profil
 * 6 dimensions d'orientation
 * Date: 23 octobre 2025
 */

import { motion } from 'framer-motion';
import { 
  Atom, 
  BookOpen, 
  Wrench, 
  Palette, 
  Users, 
  TrendingUp,
} from 'lucide-react';

const ResultsRadarChart = ({ scores }) => {
  const dimensions = [
    { key: 'scientific', label: 'Scientifique', icon: Atom, color: '#3B82F6' },
    { key: 'literary', label: 'Littéraire', icon: BookOpen, color: '#10B981' },
    { key: 'technical', label: 'Technique', icon: Wrench, color: '#F59E0B' },
    { key: 'artistic', label: 'Artistique', icon: Palette, color: '#EC4899' },
    { key: 'social', label: 'Social', icon: Users, color: '#8B5CF6' },
    { key: 'commercial', label: 'Commercial', icon: TrendingUp, color: '#EF4444' },
  ];

  const maxScore = 100;
  const center = 200; // SVG center
  const maxRadius = 150;

  // Calculer les points du polygone
  const calculatePoint = (index, score) => {
    const angle = (Math.PI * 2 * index) / dimensions.length - Math.PI / 2;
    const radius = (score / maxScore) * maxRadius;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    return { x, y };
  };

  // Points du polygone utilisateur
  const userPoints = dimensions.map((dim, index) => 
    calculatePoint(index, scores[dim.key] || 0)
  );

  const userPath = userPoints.map((p, i) => 
    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ') + ' Z';

  // Points du polygone max (cercle de référence)
  const maxPoints = dimensions.map((dim, index) => 
    calculatePoint(index, 100)
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
        🎯 Ton Profil d'Orientation
      </h3>

      <div className="flex flex-col lg:flex-row items-center gap-8">
        {/* SVG Radar Chart */}
        <div className="flex-1 flex justify-center">
          <svg width="400" height="400" viewBox="0 0 400 400" className="max-w-full">
            {/* Background circles */}
            {[25, 50, 75, 100].map((percent) => {
              const radius = (percent / 100) * maxRadius;
              return (
                <circle
                  key={percent}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-gray-200 dark:text-gray-700"
                  opacity="0.3"
                />
              );
            })}

            {/* Axis lines */}
            {dimensions.map((dim, index) => {
              const point = calculatePoint(index, 100);
              return (
                <line
                  key={dim.key}
                  x1={center}
                  y1={center}
                  x2={point.x}
                  y2={point.y}
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-gray-300 dark:text-gray-600"
                  opacity="0.5"
                />
              );
            })}

            {/* User score polygon */}
            <motion.path
              d={userPath}
              fill="url(#gradient)"
              stroke="#6366F1"
              strokeWidth="3"
              opacity="0.7"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
            />

            {/* Gradient definition */}
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366F1" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#EC4899" stopOpacity="0.3" />
              </linearGradient>
            </defs>

            {/* Score points */}
            {userPoints.map((point, index) => (
              <motion.circle
                key={index}
                cx={point.x}
                cy={point.y}
                r="6"
                fill={dimensions[index].color}
                stroke="white"
                strokeWidth="2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              />
            ))}

            {/* Labels */}
            {dimensions.map((dim, index) => {
              const labelPoint = calculatePoint(index, 110);
              return (
                <text
                  key={dim.key}
                  x={labelPoint.x}
                  y={labelPoint.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-sm font-semibold fill-gray-700 dark:fill-gray-300"
                >
                  {dim.label}
                </text>
              );
            })}
          </svg>
        </div>

        {/* Legend with scores */}
        <div className="flex-1 space-y-4">
          {dimensions.map((dim, index) => {
            const score = scores[dim.key] || 0;
            const Icon = dim.icon;

            return (
              <motion.div
                key={dim.key}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${dim.color}20` }}
                >
                  <Icon className="w-6 h-6" style={{ color: dim.color }} />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {dim.label}
                    </span>
                    <span 
                      className="text-2xl font-bold"
                      style={{ color: dim.color }}
                    >
                      {score}
                    </span>
                  </div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: dim.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${score}%` }}
                      transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Interpretation */}
      <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
          💡 Interprétation
        </h4>
        <p className="text-gray-700 dark:text-gray-300 text-sm">
          Ton profil est unique ! Les scores élevés indiquent tes forces naturelles. 
          Les métiers recommandés ci-dessous correspondent le mieux à cette combinaison.
        </p>
      </div>
    </div>
  );
};

export default ResultsRadarChart;
