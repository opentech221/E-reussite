const fs = require('fs');
const { createCanvas } = require('canvas');

function createIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Gradient background
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#0052cc');
  gradient.addColorStop(1, '#00a86b');
  
  // Draw rounded rectangle
  const radius = size * 0.16;
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(size - radius, 0);
  ctx.quadraticCurveTo(size, 0, size, radius);
  ctx.lineTo(size, size - radius);
  ctx.quadraticCurveTo(size, size, size - radius, size);
  ctx.lineTo(radius, size);
  ctx.quadraticCurveTo(0, size, 0, size - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();
  
  // Draw text
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Main "E"
  ctx.font = `bold ${size * 0.15}px Arial`;
  ctx.fillText('E', size / 2, size * 0.36);
  
  // "Réussite"
  ctx.font = `${size * 0.09}px Arial`;
  ctx.fillText('Réussite', size / 2, size * 0.68);
  
  // Golden star
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.arc(size / 2, size * 0.73, size * 0.02, 0, 2 * Math.PI);
  ctx.fill();
  
  return canvas.toBuffer('image/png');
}

// Create the icons
try {
  console.log('Creating PWA icons...');
  
  const icon192 = createIcon(192);
  const icon512 = createIcon(512);
  
  fs.writeFileSync('public/icon-192x192.png', icon192);
  fs.writeFileSync('public/icon-512x512.png', icon512);
  
  console.log('✅ Icons created successfully!');
} catch (error) {
  console.log('❌ Canvas not available. Using fallback...');
  
  // Create a simple fallback SVG that browsers can use
  const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192">
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
  
  fs.writeFileSync('public/icon.svg', svgIcon);
  console.log('✅ SVG fallback created!');
}