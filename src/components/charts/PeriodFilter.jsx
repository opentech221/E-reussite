import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

/**
 * PeriodFilter - Boutons de filtre de période (7j/30j/90j)
 * 
 * @param {number} period - Période active en jours
 * @param {Function} onPeriodChange - Callback lors du changement de période
 * @param {string} className - Classes CSS additionnelles
 */
const PeriodFilter = ({ 
  period = 7, 
  onPeriodChange,
  className = "" 
}) => {
  const periods = [
    { value: 7, label: '7 jours', short: '7j' },
    { value: 30, label: '30 jours', short: '30j' },
    { value: 90, label: '90 jours', short: '90j' }
  ];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        {periods.map((p) => (
          <Button
            key={p.value}
            variant={period === p.value ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onPeriodChange(p.value)}
            className={`
              text-xs font-medium transition-all duration-200
              ${period === p.value 
                ? 'bg-primary text-white shadow-md' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }
            `}
          >
            <span className="hidden sm:inline">{p.label}</span>
            <span className="sm:hidden">{p.short}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default PeriodFilter;
