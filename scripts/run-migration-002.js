/**
 * Script d'exécution de migration - Ajouter difficulty à quiz
 * Usage: node scripts/run-migration-002.js
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://gbjhghjlllbihpbsrhpo.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiamhnaGpsbGxiaWhwYnNyaHBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc4Nzk5NzgsImV4cCI6MjA0MzQ1NTk3OH0.g8_mYi4ZU1ZZ-7zNEEoYD11kRogVjZTpGLUbfwW7a7Q';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    console.log('\n🚀 Démarrage de la migration 002_add_difficulty_to_quiz.sql...\n');

    // Lire le fichier SQL
    const migrationPath = join(__dirname, '..', 'database', 'migrations', '002_add_difficulty_to_quiz.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');

    console.log('📄 Fichier de migration chargé');
    console.log('📊 Contenu:');
    console.log('─'.repeat(60));
    console.log(migrationSQL);
    console.log('─'.repeat(60));

    // Exécuter la migration
    console.log('\n⚙️  Exécution de la migration...');
    
    // Note: Supabase client ne permet pas d'exécuter du SQL brut directement
    // Vous devez exécuter cette migration via l'interface Supabase SQL Editor
    // ou via psql si vous avez accès direct à la base
    
    console.log('\n⚠️  ATTENTION: Cette migration doit être exécutée manuellement');
    console.log('\n📋 Instructions:');
    console.log('   1. Allez sur https://supabase.com/dashboard');
    console.log('   2. Sélectionnez votre projet E-Réussite');
    console.log('   3. Cliquez sur "SQL Editor" dans le menu de gauche');
    console.log('   4. Créez une nouvelle query');
    console.log('   5. Copiez-collez le contenu du fichier:');
    console.log('      database/migrations/002_add_difficulty_to_quiz.sql');
    console.log('   6. Exécutez la requête (Run)');
    console.log('\n✅ Après l\'exécution, vérifiez que:');
    console.log('   • La colonne "difficulty" existe dans la table "quiz"');
    console.log('   • Les quiz existants ont une difficulté assignée');
    console.log('\n💡 Alternative via psql (si vous avez les credentials):');
    console.log('   psql -h <host> -U <user> -d <database> -f database/migrations/002_add_difficulty_to_quiz.sql');

  } catch (error) {
    console.error('\n❌ Erreur lors de la préparation de la migration:', error.message);
    process.exit(1);
  }
}

runMigration();
