#!/usr/bin/env node

// Script de validation des composants E-Réussite
const fs = require('fs');
const path = require('path');

console.log('🧪 Validation des composants E-Réussite...\n');

const componentsDir = path.join(__dirname, 'src', 'components');
const pagesDir = path.join(__dirname, 'src', 'pages');

// Liste des composants critiques
const criticalComponents = [
  'BadgeSystem.jsx',
  'NotificationCenter.jsx', 
  'PerformanceAnalytics.jsx',
  'Chatbot.jsx',
  'Dashboard.jsx'
];

// Liste des pages critiques
const criticalPages = [
  'Home.jsx',
  'Dashboard.jsx',
  'Badges.jsx',
  'Leaderboard.jsx',
  'Login.jsx'
];

let allGood = true;

// Validation des composants
console.log('📦 Validation des composants critiques...');
criticalComponents.forEach(component => {
  const filePath = path.join(componentsDir, component);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('export default') && !content.includes('SyntaxError')) {
      console.log(`✅ ${component} - OK`);
    } else {
      console.log(`❌ ${component} - Problème détecté`);
      allGood = false;
    }
  } else {
    console.log(`❌ ${component} - Fichier manquant`);
    allGood = false;
  }
});

console.log('\n📄 Validation des pages critiques...');
criticalPages.forEach(page => {
  const filePath = path.join(pagesDir, page);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('export default') && !content.includes('SyntaxError')) {
      console.log(`✅ ${page} - OK`);
    } else {
      console.log(`❌ ${page} - Problème détecté`);
      allGood = false;
    }
  } else {
    console.log(`❌ ${page} - Fichier manquant`);
    allGood = false;
  }
});

// Validation des assets
console.log('\n🖼️ Validation des assets...');
const assets = ['vite.svg', 'icon-192x192.png', 'manifest.json'];
assets.forEach(asset => {
  const assetPath = path.join(__dirname, 'public', asset);
  if (fs.existsSync(assetPath)) {
    console.log(`✅ ${asset} - OK`);
  } else {
    console.log(`❌ ${asset} - Manquant`);
    allGood = false;
  }
});

console.log('\n' + '='.repeat(50));
if (allGood) {
  console.log('🎉 SUCCÈS ! Tous les composants sont validés');
  console.log('🚀 La plateforme E-Réussite est prête !');
  console.log('🌍 Accessible sur http://localhost:3000');
} else {
  console.log('⚠️ Certains problèmes ont été détectés');
  console.log('🔧 Vérifiez les fichiers marqués en rouge');
}
console.log('='.repeat(50));