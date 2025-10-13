/**
 * Script de test pour lister les modèles Gemini disponibles
 * Exécuter: node test-gemini-models.js
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Lire la clé depuis .env
import { config } from 'dotenv';
config();

const API_KEY = process.env.VITE_GEMINI_API_KEY;

if (!API_KEY || API_KEY === 'VOTRE_CLE_GEMINI_ICI') {
  console.error('❌ Clé API Gemini manquante ou invalide dans .env');
  console.log('\n💡 Éditez le fichier .env et remplacez VOTRE_CLE_GEMINI_ICI par votre vraie clé');
  process.exit(1);
}

console.log('🔍 Test des modèles Gemini disponibles...\n');

const genAI = new GoogleGenerativeAI(API_KEY);

// Liste des modèles à tester
const modelsToTest = [
  'gemini-pro',
  'gemini-1.5-pro',
  'gemini-1.5-flash',
  'gemini-1.5-pro-latest',
  'gemini-1.5-flash-latest',
  'gemini-2.0-flash-exp',
  'models/gemini-pro',
  'models/gemini-1.5-flash'
];

async function testModel(modelName) {
  try {
    console.log(`\n🧪 Test: ${modelName}`);
    
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent('Dis juste "OK" si tu fonctionnes');
    const response = await result.response;
    const text = response.text();
    
    console.log(`   ✅ FONCTIONNE ! Réponse: ${text.substring(0, 50)}...`);
    return true;
  } catch (error) {
    console.log(`   ❌ ERREUR: ${error.message.substring(0, 80)}...`);
    return false;
  }
}

async function main() {
  console.log('📋 Test de chaque modèle avec votre clé API:\n');
  console.log('=' .repeat(60));
  
  const results = [];
  
  for (const modelName of modelsToTest) {
    const works = await testModel(modelName);
    results.push({ model: modelName, works });
    
    // Pause entre tests pour éviter rate limit
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n');
  console.log('=' .repeat(60));
  console.log('\n📊 RÉSUMÉ:\n');
  
  const working = results.filter(r => r.works);
  const failing = results.filter(r => !r.works);
  
  if (working.length > 0) {
    console.log('✅ MODÈLES FONCTIONNELS:');
    working.forEach(r => console.log(`   - ${r.model}`));
  }
  
  if (failing.length > 0) {
    console.log('\n❌ MODÈLES NON FONCTIONNELS:');
    failing.forEach(r => console.log(`   - ${r.model}`));
  }
  
  if (working.length > 0) {
    console.log('\n\n🎯 RECOMMANDATION:');
    console.log(`   Utilisez: ${working[0].model}`);
    console.log('\n💡 Modifiez src/lib/contextualAIService.js ligne 17:');
    console.log(`   model: '${working[0].model}'`);
  } else {
    console.log('\n\n⚠️ AUCUN MODÈLE FONCTIONNEL TROUVÉ');
    console.log('Vérifiez que votre clé API est valide:');
    console.log('https://aistudio.google.com/app/apikey');
  }
}

main().catch(console.error);
