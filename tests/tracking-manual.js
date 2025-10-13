// ============================================================================
// TESTS MANUELS - Système Tracking Maison
// Date: 11 octobre 2025
// Instructions: Copier/coller dans la console du navigateur
// ============================================================================

// ============================================================================
// PRÉ-REQUIS
// ============================================================================
// 1. Application lancée : npm run dev
// 2. User connecté
// 3. Console ouverte : F12 → Console
// ============================================================================

// ============================================================================
// TEST 1 : Vérifier import du service
// ============================================================================
console.log('🧪 Test 1 : Import dubService');
const dubServiceTest = await import('./src/services/dubService.js');
console.log('✅ dubService importé:', Object.keys(dubServiceTest.default));
// Attendu: ['createCourseLink', 'createReferralLink', 'getCustomLinkAnalytics', 'createCertificateLink']

// ============================================================================
// TEST 2 : Créer un lien cours
// ============================================================================
console.log('\n🧪 Test 2 : Création lien cours');

// Récupérer user connecté
const { data: { user } } = await window.supabase.auth.getUser();
console.log('👤 User:', user.email);

// Créer lien cours
const courseLink = await dubServiceTest.default.createCourseLink(
  'https://localhost:5173/course/1',
  {
    userId: user.id,
    resourceId: 'test-course-1',
    slug: `test-${Date.now()}`, // Clé unique
    title: 'Test Course - ' + new Date().toLocaleString('fr-FR'),
    description: 'Test de création de lien',
    tags: ['test', 'demo']
  }
);

console.log('✅ Lien créé:', courseLink);
console.log('🔗 Short Link:', courseLink.shortLink);
console.log('🔑 Key:', courseLink.key);
console.log('🆔 ID:', courseLink.id);

// Copier dans presse-papier (à faire manuellement)
console.log('\n📋 Copier ce lien et l\'ouvrir dans un nouvel onglet:');
console.log(courseLink.shortLink);

// ============================================================================
// TEST 3 : Vérifier insertion dans BDD
// ============================================================================
console.log('\n🧪 Test 3 : Vérification BDD');

const { data: linkInDb } = await window.supabase
  .from('shared_links')
  .select('*')
  .eq('id', courseLink.id)
  .single();

console.log('✅ Lien dans BDD:', linkInDb);
console.log('   - Clics:', linkInDb.clicks);
console.log('   - Clics uniques:', linkInDb.unique_clicks);
console.log('   - Key:', linkInDb.key);
console.log('   - Domain:', linkInDb.domain); // Doit être 'edge-function'

// ============================================================================
// TEST 4 : Simuler un clic (MANUEL)
// ============================================================================
console.log('\n🧪 Test 4 : Simuler un clic');
console.log('⚠️  MANUEL : Ouvrir ce lien dans un nouvel onglet:');
console.log(courseLink.shortLink);
console.log('\nAttendre la redirection, puis revenir ici et continuer avec Test 5...');

// ============================================================================
// TEST 5 : Vérifier tracking du clic
// ============================================================================
console.log('\n🧪 Test 5 : Vérification tracking (après clic)');
console.log('⏳ Attendre 2-3 secondes après le clic...');

// Attendre 3 secondes
await new Promise(resolve => setTimeout(resolve, 3000));

// Vérifier insertion dans link_clicks
const { data: clicks } = await window.supabase
  .from('link_clicks')
  .select('*')
  .eq('link_id', courseLink.id)
  .order('clicked_at', { ascending: false })
  .limit(1);

if (clicks && clicks.length > 0) {
  const lastClick = clicks[0];
  console.log('✅ Clic enregistré:', lastClick);
  console.log('   - Date:', new Date(lastClick.clicked_at).toLocaleString('fr-FR'));
  console.log('   - IP:', lastClick.ip_address);
  console.log('   - Device:', lastClick.device_type);
  console.log('   - Browser:', lastClick.browser);
  console.log('   - OS:', lastClick.os);
  console.log('   - Pays:', lastClick.country);
  console.log('   - Ville:', lastClick.city);
  console.log('   - Unique:', lastClick.is_unique);
} else {
  console.log('❌ Aucun clic trouvé. Avez-vous bien cliqué sur le lien ?');
}

// Vérifier mise à jour compteurs
const { data: updatedLink } = await window.supabase
  .from('shared_links')
  .select('clicks, unique_clicks')
  .eq('id', courseLink.id)
  .single();

console.log('✅ Compteurs mis à jour:', updatedLink);
console.log('   - Clics:', updatedLink.clicks);
console.log('   - Clics uniques:', updatedLink.unique_clicks);

// ============================================================================
// TEST 6 : Récupérer analytics
// ============================================================================
console.log('\n🧪 Test 6 : Récupération analytics');

const analytics = await dubServiceTest.default.getCustomLinkAnalytics(
  courseLink.id,
  '30d'
);

console.log('✅ Analytics récupérées:', analytics);
console.log('   - Total clics:', analytics.clicks);
console.log('   - Clics uniques:', analytics.uniqueClicks);
console.log('   - Pays:', analytics.countries);
console.log('   - Devices:', analytics.devices);
console.log('   - Browsers:', analytics.browsers);
console.log('   - Referrers:', analytics.referrers);
console.log('   - Clics par jour:', analytics.clicksByDay);

// ============================================================================
// TEST 7 : Créer lien parrainage
// ============================================================================
console.log('\n🧪 Test 7 : Création lien parrainage');

const referralLink = await dubServiceTest.default.createReferralLink(user, {
  slug: `invite-test-${Date.now()}`
});

console.log('✅ Lien parrainage créé:', referralLink);
console.log('🔗 Short Link:', referralLink.shortLink);

// ============================================================================
// TEST 8 : Page Mes Liens
// ============================================================================
console.log('\n🧪 Test 8 : Page Mes Liens');
console.log('📍 Aller sur: http://localhost:5173/my-shared-links');
console.log('✅ Vérifier que les liens créés apparaissent');
console.log('✅ Cliquer sur "↻ Refresh Analytics"');
console.log('✅ Vérifier mise à jour des compteurs');

// ============================================================================
// RÉSUMÉ
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('📊 RÉSUMÉ DES TESTS');
console.log('='.repeat(80));
console.log('✅ Test 1 : Import service - OK');
console.log('✅ Test 2 : Création lien cours - OK');
console.log('✅ Test 3 : Vérification BDD - OK');
console.log('⏳ Test 4 : Simuler clic - MANUEL (à faire)');
console.log('⏳ Test 5 : Vérification tracking - APRÈS CLIC');
console.log('⏳ Test 6 : Analytics - APRÈS CLIC');
console.log('✅ Test 7 : Lien parrainage - OK');
console.log('⏳ Test 8 : Page Mes Liens - MANUEL');
console.log('='.repeat(80));

// ============================================================================
// CLEANUP (optionnel)
// ============================================================================
console.log('\n🧹 Pour nettoyer les données de test:');
console.log(`
await window.supabase
  .from('shared_links')
  .delete()
  .eq('id', '${courseLink.id}');

await window.supabase
  .from('shared_links')
  .delete()
  .eq('id', '${referralLink.id}');
`);
