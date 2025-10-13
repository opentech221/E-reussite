// Simple data URI pour créer des icônes basiques
import fs from 'fs';

// Créer des icônes temporaires en utilisant des data URIs
function createSimpleIcon(size) {
  // Créer un SVG puis le convertir
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#0052cc;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#00a86b;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="${size}" height="${size}" rx="${size * 0.16}" fill="url(#grad)"/>
    <text x="${size/2}" y="${size * 0.36}" font-family="Arial, sans-serif" font-size="${size * 0.15}" font-weight="bold" text-anchor="middle" fill="white">E</text>
    <text x="${size/2}" y="${size * 0.68}" font-family="Arial, sans-serif" font-size="${size * 0.09}" text-anchor="middle" fill="white">Réussite</text>
    <circle cx="${size/2}" cy="${size * 0.73}" r="${size * 0.02}" fill="#FFD700"/>
  </svg>`;
  
  return svg;
}

console.log('🎨 Création des icônes PWA...');

// Créer les SVG pour les tailles requises
const icon192 = createSimpleIcon(192);
const icon512 = createSimpleIcon(512);

// Sauvegarder les SVG 
fs.writeFileSync('public/icon-192x192.svg', icon192);
fs.writeFileSync('public/icon-512x512.svg', icon512);

console.log('✅ Icônes SVG créées avec succès!');

// Mettre à jour le manifest pour utiliser les SVG
const manifest = {
  "name": "E-Réussite",
  "short_name": "E-Réussite", 
  "description": "Votre plateforme d'apprentissage en ligne pour réussir le BFEM et le Baccalauréat en Afrique francophone.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0052cc",
  "icons": [
    {
      "src": "/icon-192x192.svg",
      "sizes": "192x192",
      "type": "image/svg+xml"
    },
    {
      "src": "/icon-512x512.svg", 
      "sizes": "512x512",
      "type": "image/svg+xml"
    },
    {
      "src": "/icon.svg",
      "sizes": "any",
      "type": "image/svg+xml",
      "purpose": "any maskable"
    }
  ]
};

fs.writeFileSync('public/manifest.json', JSON.stringify(manifest, null, 2));
console.log('✅ Manifest mis à jour pour utiliser les SVG!');
console.log('📱 Les navigateurs modernes préfèrent les SVG pour les PWA');