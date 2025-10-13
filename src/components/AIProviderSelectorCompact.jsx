/**
 * AI PROVIDER SELECTOR COMPACT
 * Sélecteur compact avec tooltip
 */

import React, { useState } from 'react';
import { AI_PROVIDERS } from '../lib/aiProviderConfig';
import { Info, Lightbulb } from 'lucide-react';

const AIProviderSelectorCompact = ({ currentProvider, onProviderChange, className = '' }) => {
  const [showInfo, setShowInfo] = useState(false);
  const providers = Object.values(AI_PROVIDERS);
  const currentConfig = AI_PROVIDERS[currentProvider?.toUpperCase()] || AI_PROVIDERS.GEMINI;

  return (
    <div className={`ai-provider-selector-compact ${className}`}>
      <div className="flex items-center gap-2">
        {/* Sélecteur */}
        <div className="flex-1">
          <select
            value={currentProvider}
            onChange={(e) => onProviderChange(e.target.value)}
            className="w-full px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            {providers.map((provider) => (
              <option key={provider.id} value={provider.id} className="text-gray-900 dark:text-gray-100">
                {provider.icon} {provider.name}
              </option>
            ))}
          </select>
        </div>

        {/* Bouton info */}
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors group relative"
          title="Informations sur le modèle"
        >
          <Lightbulb 
            className={`w-5 h-5 transition-colors ${
              showInfo ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400'
            }`} 
          />
        </button>
      </div>

      {/* Tooltip info (affiché au clic) */}
      {showInfo && (
        <div 
          className="absolute z-50 mt-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg w-72 text-xs"
          style={{
            borderLeft: `3px solid ${currentConfig.color}`
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{currentConfig.icon}</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {currentConfig.name}
              </span>
            </div>
            <button
              onClick={() => setShowInfo(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {/* Points forts */}
          <div className="mb-2">
            <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">
              ✅ Points forts
            </p>
            <ul className="space-y-0.5">
              {currentConfig.strengths.slice(0, 3).map((strength, i) => (
                <li key={i} className="text-gray-600 dark:text-gray-400 pl-2">
                  • {strength}
                </li>
              ))}
            </ul>
          </div>

          {/* Limitations (si existe) */}
          {currentConfig.limitations && currentConfig.limitations.length > 0 && (
            <div className="mb-2">
              <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                ⚠️ Limitations
              </p>
              <ul className="space-y-0.5">
                {currentConfig.limitations.map((limitation, i) => (
                  <li key={i} className="text-gray-600 dark:text-gray-400 pl-2">
                    • {limitation}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Capacités */}
          <div>
            <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">
              🎯 Capacités
            </p>
            <div className="flex flex-wrap gap-1">
              {currentConfig.capabilities.map((cap, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs"
                >
                  {cap}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIProviderSelectorCompact;
