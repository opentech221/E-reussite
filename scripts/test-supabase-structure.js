// Script pour tester la structure Supabase
import { supabase } from '../lib/customSupabaseClient.js';

async function checkDatabaseStructure() {
  console.log('🔍 Vérification de la structure Supabase...');
  
  try {
    // Test 1: Vérifier la table profiles
    console.log('\n1. Test table profiles:');
    const { data: profilesTest, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.error('❌ Erreur profiles:', profilesError.message);
    } else {
      console.log('✅ Table profiles accessible');
      if (profilesTest && profilesTest.length > 0) {
        console.log('📋 Colonnes disponibles:', Object.keys(profilesTest[0]));
      } else {
        console.log('📋 Table vide, récupération de la structure...');
        // Tenter un SELECT avec des colonnes communes
        const { data: structureTest, error: structureError } = await supabase
          .from('profiles')
          .select('id, full_name, username, updated_at')
          .limit(1);
        
        if (structureError) {
          console.log('❌ Colonnes testées non disponibles:', structureError.message);
        } else {
          console.log('✅ Colonnes de base disponibles');
        }
      }
    }
    
    // Test 2: Vérifier user_profiles
    console.log('\n2. Test table user_profiles:');
    const { data: userProfilesTest, error: userProfilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);
    
    if (userProfilesError) {
      console.error('❌ Erreur user_profiles:', userProfilesError.message);
    } else {
      console.log('✅ Table user_profiles accessible');
    }
    
    // Test 3: Vérifier user_notifications
    console.log('\n3. Test table user_notifications:');
    const { data: notifTest, error: notifError } = await supabase
      .from('user_notifications')
      .select('*')
      .limit(1);
    
    if (notifError) {
      console.error('❌ Erreur user_notifications:', notifError.message);
    } else {
      console.log('✅ Table user_notifications accessible');
    }
    
    // Test 4: Lister toutes les tables
    console.log('\n4. Tentative de récupération des tables disponibles...');
    const { data: tablesData, error: tablesError } = await supabase.rpc('get_tables');
    
    if (tablesError) {
      console.log('❌ Impossible de lister les tables:', tablesError.message);
    } else {
      console.log('✅ Tables disponibles:', tablesData);
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le test
checkDatabaseStructure();