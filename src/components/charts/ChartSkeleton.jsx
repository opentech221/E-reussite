import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

/**
 * ChartSkeleton - Loading skeleton pour les graphiques
 * 
 * @param {string} type - Type de skeleton: 'donut', 'bar', 'area', 'stat'
 * @param {string} className - Classes CSS additionnelles
 */
const ChartSkeleton = ({ type = 'bar', className = '' }) => {
  if (type === 'stat') {
    return (
      <Card className={`animate-pulse ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (type === 'donut') {
    return (
      <Card className={`animate-pulse ${className}`}>
        <CardHeader>
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mt-2"></div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <div className="h-48 w-48 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between">
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (type === 'area') {
    return (
      <Card className={`animate-pulse ${className}`}>
        <CardHeader>
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mt-2"></div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] bg-gradient-to-t from-gray-200 to-transparent dark:from-gray-700 rounded"></div>
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i}>
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-6 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default: bar chart
  return (
    <Card className={`animate-pulse ${className}`}>
      <CardHeader>
        <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mt-2"></div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-end justify-around gap-2">
          {[60, 80, 45, 90, 70, 55, 85].map((height, i) => (
            <div 
              key={i} 
              className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-t-lg"
              style={{ height: `${height}%` }}
            ></div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 gap-4">
          <div>
            <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <div>
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChartSkeleton;
