/**
 * AI PROVIDER SELECTOR
 * Sélecteur de provider IA (Gemini / Claude)
 */

import React from 'react';
import { AI_PROVIDERS } from '../lib/aiProviderConfig';

const AIProviderSelector = ({ currentProvider, onProviderChange, className = '' }) => {
  const providers = Object.values(AI_PROVIDERS);
  const currentConfig = AI_PROVIDERS[currentProvider?.toUpperCase()] || AI_PROVIDERS.GEMINI;

  return (
    <div className={`ai-provider-selector ${className}`}>
      {/* Sélecteur */}
      <div className="mb-2">
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
          🤖 Modèle IA
        </label>
        <select
          value={currentProvider}
          onChange={(e) => onProviderChange(e.target.value)}
          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        >
          {providers.map((provider) => (
            <option key={provider.id} value={provider.id}>
              {provider.icon} {provider.name}
            </option>
          ))}
        </select>
      </div>

      {/* Info sur le provider actif */}
      <div 
        className="p-3 rounded-lg text-xs"
        style={{
          backgroundColor: `${currentConfig.color}15`,
          borderLeft: `3px solid ${currentConfig.color}`
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{currentConfig.icon}</span>
          <span className="font-semibold text-gray-800 dark:text-gray-200">
            {currentConfig.name}
          </span>
        </div>

        {/* Points forts */}
        <div className="mb-2">
          <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">
            ✨ Points forts :
          </p>
          <ul className="space-y-1 text-gray-600 dark:text-gray-400">
            {currentConfig.strengths.map((strength, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-green-500 mt-0.5">•</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Limitations (si présentes) */}
        {currentConfig.limitations && currentConfig.limitations.length > 0 && (
          <div>
            <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">
              ⚠️ Limitations :
            </p>
            <ul className="space-y-1 text-gray-600 dark:text-gray-400">
              {currentConfig.limitations.map((limitation, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-orange-500 mt-0.5">•</span>
                  <span>{limitation}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Capacités */}
        <div className="mt-2 flex flex-wrap gap-1">
          {currentConfig.capabilities.map((capability) => (
            <span
              key={capability}
              className="px-2 py-0.5 bg-white dark:bg-gray-700 rounded text-xs font-medium text-gray-600 dark:text-gray-300"
            >
              {capability}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIProviderSelector;
