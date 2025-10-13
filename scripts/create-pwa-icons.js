// Script pour créer des icônes PWA valides
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Créer un SVG simple pour E-Réussite
const createSVGIcon = () => {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#0052cc;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#00a86b;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="192" height="192" rx="32" fill="url(#grad)"/>
    <text x="96" y="70" font-family="Arial, sans-serif" font-size="28" font-weight="bold" text-anchor="middle" fill="white">E</text>
    <text x="96" y="130" font-family="Arial, sans-serif" font-size="18" text-anchor="middle" fill="white">Réussite</text>
    <circle cx="96" cy="140" r="4" fill="#FFD700"/>
  </svg>`;
};

// Fonction pour créer une icône base64
const createBase64Icon = (size) => {
  const svg = createSVGIcon();
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
};

console.log('🎨 Création des icônes PWA...');

// Créer le SVG
const svgContent = createSVGIcon();
fs.writeFileSync(path.join(process.cwd(), 'public', 'icon.svg'), svgContent);

console.log('✅ Icône SVG créée : public/icon.svg');
console.log('🔧 Pour les icônes PNG, utilisez un convertisseur en ligne ou un outil comme ImageMagick');
console.log('📱 L\'icône SVG sera automatiquement utilisée par les navigateurs modernes');