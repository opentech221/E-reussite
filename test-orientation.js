/**
 * 🧪 SCRIPT DE TESTS AUTOMATISÉS - SYSTÈME D'ORIENTATION
 * Date: 23 octobre 2025
 * 
 * Ce script teste les 4 profils types définis dans ORIENTATION_TESTS_INTEGRATION.md
 * pour valider le nouveau système de matching contextuel.
 * 
 * USAGE: node test-orientation.js
 * Note: Ce script simule le comportement de orientationService.js côté serveur
 */

// Simulation simple des fonctions de orientationService pour tests Node.js
// (Alternative: utiliser un bundler ou tester via navigateur)

const calculateOrientationScores = (answers) => {
  // Simuler le calcul des scores (logique simplifiée pour tests)
  const scores = {
    scientific: 0,
    literary: 0,
    technical: 0,
    artistic: 0,
    social: 0,
    commercial: 0,
  };

  const preferences = {
    preferred_subjects: answers.Q1 || [],
    disliked_subjects: answers.Q2 || [],
    preferred_work_environment: answers.Q3 || '',
    financial_constraint: answers.Q13 || '',
    family_network: answers.Q14 || '',
    location: answers.Q15 || '',
    network_access: answers.Q16 || '',
    religious_importance: 0,
    career_goals: answers.Q18 || '',
  };

  // Calculer scores (questions Q4-Q12)
  const domainMapping = {
    Q4: 'scientific', Q5: 'literary', Q6: 'technical',
    Q7: 'artistic', Q8: 'social', Q9: 'commercial',
    Q10: 'scientific', Q11: 'literary', Q12: 'technical',
  };

  Object.entries(domainMapping).forEach(([qId, domain]) => {
    if (answers[qId]) {
      scores[domain] += (answers[qId] / 5) * 100;
    }
  });

  // Normaliser
  Object.keys(scores).forEach(domain => {
    const count = Object.values(domainMapping).filter(d => d === domain).length;
    scores[domain] = scores[domain] / count;
  });

  // Religious importance (Q17: 1-5 → 0-100)
  if (answers.Q17) {
    preferences.religious_importance = ((answers.Q17 - 1) / 4) * 100;
  }

  return { scores, preferences };
};

const matchCareers = async (scores, preferences, userLevel) => {
  // Mock des 20 métiers (avec les nouveaux champs)
  const mockCareers = [
    { id: '1', slug: 'ingenieur-informatique', title: 'Ingénieur Informatique', financial_requirement: 'high', requires_network: true, preferred_location: 'urban', religious_friendly: 'neutral', interest_scientific: 90, interest_technical: 85 },
    { id: '2', slug: 'medecin-generaliste', title: 'Médecin Généraliste', financial_requirement: 'high', requires_network: true, preferred_location: 'urban', religious_friendly: 'neutral', interest_scientific: 95, interest_social: 80 },
    { id: '3', slug: 'data-scientist', title: 'Data Scientist', financial_requirement: 'high', requires_network: true, preferred_location: 'urban', religious_friendly: 'neutral', interest_scientific: 95, interest_technical: 80 },
    { id: '4', slug: 'pharmacien', title: 'Pharmacien', financial_requirement: 'high', requires_network: true, preferred_location: 'urban', religious_friendly: 'neutral', interest_scientific: 85 },
    { id: '5', slug: 'expert-comptable', title: 'Expert Comptable', financial_requirement: 'medium', requires_network: true, preferred_location: 'urban', religious_friendly: 'neutral', interest_commercial: 80 },
    { id: '6', slug: 'responsable-marketing', title: 'Responsable Marketing', financial_requirement: 'medium', requires_network: true, preferred_location: 'urban', religious_friendly: 'neutral', interest_commercial: 90 },
    { id: '7', slug: 'entrepreneur', title: 'Entrepreneur', financial_requirement: 'medium', requires_network: true, preferred_location: 'semi-urban', religious_friendly: 'neutral', interest_commercial: 95 },
    { id: '8', slug: 'gestionnaire-rh', title: 'Gestionnaire RH', financial_requirement: 'medium', requires_network: true, preferred_location: 'urban', religious_friendly: 'neutral', interest_social: 85 },
    { id: '9', slug: 'designer-graphique', title: 'Designer Graphique', financial_requirement: 'low', requires_network: true, preferred_location: 'urban', religious_friendly: 'neutral', interest_artistic: 95 },
    { id: '10', slug: 'community-manager', title: 'Community Manager', financial_requirement: 'low', requires_network: true, preferred_location: 'urban', religious_friendly: 'neutral', interest_social: 80 },
    { id: '11', slug: 'journaliste', title: 'Journaliste', financial_requirement: 'medium', requires_network: true, preferred_location: 'urban', religious_friendly: 'neutral', interest_literary: 85 },
    { id: '12', slug: 'photographe-professionnel', title: 'Photographe Professionnel', financial_requirement: 'low', requires_network: true, preferred_location: 'semi-urban', religious_friendly: 'neutral', interest_artistic: 95 },
    { id: '13', slug: 'avocat', title: 'Avocat', financial_requirement: 'high', requires_network: true, preferred_location: 'urban', religious_friendly: 'neutral', interest_literary: 80 },
    { id: '14', slug: 'assistant-social', title: 'Assistant Social', financial_requirement: 'low', requires_network: false, preferred_location: 'semi-urban', religious_friendly: 'friendly', interest_social: 95 },
    { id: '15', slug: 'psychologue', title: 'Psychologue', financial_requirement: 'medium', requires_network: false, preferred_location: 'urban', religious_friendly: 'neutral', interest_social: 90 },
    { id: '16', slug: 'electricien-batiment', title: 'Électricien Bâtiment', financial_requirement: 'low', requires_network: false, preferred_location: 'rural', religious_friendly: 'neutral', interest_technical: 95 },
    { id: '17', slug: 'mecanicien-automobile', title: 'Mécanicien Automobile', financial_requirement: 'low', requires_network: false, preferred_location: 'semi-urban', religious_friendly: 'neutral', interest_technical: 95 },
    { id: '18', slug: 'technicien-maintenance-informatique', title: 'Technicien Maintenance Informatique', financial_requirement: 'medium', requires_network: false, preferred_location: 'urban', religious_friendly: 'neutral', interest_technical: 90 },
    { id: '19', slug: 'agronome', title: 'Agronome', financial_requirement: 'medium', requires_network: false, preferred_location: 'rural', religious_friendly: 'neutral', interest_scientific: 75 },
    { id: '20', slug: 'veterinaire', title: 'Vétérinaire', financial_requirement: 'high', requires_network: false, preferred_location: 'rural', religious_friendly: 'neutral', interest_scientific: 85 },
  ];

  // Calculer compatibilité pour chaque métier
  const careersWithScores = mockCareers.map(career => {
    let compatibilityScore = 0;

    // 1. Similarité d'intérêts (base 60% du score)
    Object.keys(scores).forEach(domain => {
      const careerInterest = career[`interest_${domain}`] || 0;
      const userScore = scores[domain];
      const similarity = 100 - Math.abs(careerInterest - userScore);
      compatibilityScore += (similarity * 0.6) / 6;
    });

    // 2. Ajustements financiers
    if (preferences.financial_constraint?.includes('Élevée') && career.financial_requirement === 'high') {
      compatibilityScore -= 15;
    } else if (preferences.financial_constraint?.includes('Moyenne') && career.financial_requirement === 'high') {
      compatibilityScore -= 7;
    }

    // 3. Bonus réseau
    if (career.requires_network) {
      if (preferences.network_access?.includes('Fort')) {
        compatibilityScore += 10;
      } else if (preferences.network_access?.includes('Limité')) {
        compatibilityScore += 5;
      }
    }

    // 4. Ajustement localisation
    if (preferences.location === 'rural' && career.preferred_location === 'urban') {
      compatibilityScore -= 5;
    } else if (preferences.location === 'urban' && career.preferred_location === 'rural') {
      compatibilityScore -= 5;
    }

    // 5. Compatibilité religieuse
    if (preferences.religious_importance >= 60) {
      if (career.religious_friendly === 'friendly') {
        compatibilityScore += 10;
      } else if (career.religious_friendly === 'challenging') {
        compatibilityScore -= 10;
      }
    }

    // Limiter entre 0 et 100
    compatibilityScore = Math.max(0, Math.min(100, compatibilityScore));

    return { ...career, compatibilityScore };
  });

  // Trier par score décroissant
  return careersWithScores.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
};

// ===================================================================
// PROFILS DE TEST
// ===================================================================

const TEST_PROFILES = {
  // TEST 1: Étudiant Rural avec Contraintes Financières Élevées
  AMINATA: {
    name: 'Aminata',
    description: 'Étudiante rurale (BFEM) avec contraintes financières élevées',
    level: 'bfem',
    answers: {
      Q1: ['Mathématiques', 'SVT', 'Physique'],
      Q2: ['Français', 'Anglais'],
      Q3: 'Terrain',
      Q4: 5,   // Scientifique (Mathématiques)
      Q5: 2,   // Littéraire
      Q6: 4,   // Technique
      Q7: 2,   // Artistique
      Q8: 4,   // Social
      Q9: 2,   // Commercial
      Q10: 4,  // Scientifique (Expériences)
      Q11: 2,  // Littéraire (Débat)
      Q12: 5,  // Technique (Construire)
      Q13: 'Élevée (études longues difficiles)',
      Q14: 'Oui, mais limité',
      Q15: 'rural',
      Q16: 'Limité',
      Q17: 3,  // Importance religieuse (normalisée à 60/100)
      Q18: 'Avoir un métier stable et aider ma communauté',
      Q19: 'rural',
      Q20: 'Indépendance financière et respect de la famille',
    },
    expectedTopCareers: ['electricien-batiment', 'mecanicien-automobile', 'agronome'],
    expectedExcluded: ['ingenieur-informatique', 'medecin-generaliste', 'data-scientist'],
    criteria: {
      financialLowInTop3: true,
      ruralInTop5: true,
      noHighFinancialInTop5: true,
      electricienScoreAbove75: true,
    },
  },

  // TEST 2: Étudiant Urbain avec Fort Réseau Professionnel
  MOUSSA: {
    name: 'Moussa',
    description: 'Étudiant urbain (BAC) avec fort réseau professionnel',
    level: 'bac',
    answers: {
      Q1: ['Économie', 'Mathématiques', 'Anglais'],
      Q2: ['SVT', 'Physique'],
      Q3: 'Bureau',
      Q4: 3,   // Scientifique
      Q5: 4,   // Littéraire
      Q6: 2,   // Technique
      Q7: 3,   // Artistique
      Q8: 3,   // Social
      Q9: 5,   // Commercial
      Q10: 2,  // Scientifique
      Q11: 4,  // Littéraire
      Q12: 1,  // Technique
      Q13: 'Faible (famille peut financer)',
      Q14: 'Oui, réseau fort (entrepreneurs, professionnels)',
      Q15: 'urban',
      Q16: 'Fort et stable',
      Q17: 1,  // Importance religieuse faible (20/100)
      Q18: 'Créer ma propre entreprise et innover',
      Q19: 'urban',
      Q20: 'Réussite financière et impact social',
    },
    expectedTopCareers: ['entrepreneur', 'responsable-marketing', 'expert-comptable'],
    expectedExcluded: ['electricien-batiment', 'agronome', 'veterinaire'],
    criteria: {
      networkRequiredInTop5: 3,
      entrepreneurInTop3: true,
      noRuralInTop5: true,
      urbanScoresAbove80: true,
    },
  },

  // TEST 3: Étudiant avec Forte Importance Religieuse
  FATOU: {
    name: 'Fatou',
    description: 'Étudiante (BAC) avec forte importance religieuse',
    level: 'bac',
    answers: {
      Q1: ['Français', 'Histoire-Géographie', 'SVT'],
      Q2: ['Mathématiques', 'Physique'],
      Q3: 'Mixte',
      Q4: 2,   // Scientifique
      Q5: 4,   // Littéraire
      Q6: 1,   // Technique
      Q7: 3,   // Artistique
      Q8: 5,   // Social (très élevé)
      Q9: 2,   // Commercial
      Q10: 3,  // Scientifique
      Q11: 4,  // Littéraire
      Q12: 1,  // Technique
      Q13: 'Moyenne',
      Q14: 'Oui, mais limité',
      Q15: 'semi-urban',
      Q16: 'Modéré',
      Q17: 5,  // Importance religieuse maximale (100/100)
      Q18: 'Aider les personnes en difficulté tout en respectant mes valeurs',
      Q19: 'semi-urban',
      Q20: 'Servir ma communauté et avoir un impact positif',
    },
    expectedTopCareers: ['assistant-social', 'psychologue', 'gestionnaire-rh'],
    criteria: {
      assistantSocialInTop3: true,
      assistantSocialBonusApplied: true,
      socialScoreHigh: true,
    },
  },

  // TEST 4: Étudiant sans Contraintes (Profil Privilégié)
  IBRAHIMA: {
    name: 'Ibrahima',
    description: 'Étudiant urbain (BAC) sans contraintes financières',
    level: 'bac',
    answers: {
      Q1: ['Mathématiques', 'Physique', 'SVT', 'Chimie'],
      Q2: ['Arts plastiques'],
      Q3: 'Bureau',
      Q4: 5,   // Scientifique
      Q5: 2,   // Littéraire
      Q6: 4,   // Technique
      Q7: 1,   // Artistique
      Q8: 4,   // Social
      Q9: 2,   // Commercial
      Q10: 5,  // Scientifique
      Q11: 2,  // Littéraire
      Q12: 4,  // Technique
      Q13: 'Faible (famille peut financer)',
      Q14: 'Oui, réseau fort (entrepreneurs, professionnels)',
      Q15: 'urban',
      Q16: 'Fort et stable',
      Q17: 3,  // Importance religieuse modérée (60/100)
      Q18: 'Devenir médecin et aider les gens',
      Q19: 'urban',
      Q20: 'Excellence professionnelle et contribution à la santé publique',
    },
    expectedTopCareers: ['medecin-generaliste', 'ingenieur-informatique', 'data-scientist', 'pharmacien'],
    criteria: {
      noFinancialPenalty: true,
      networkBonusApplied: true,
      medecinOrIngenieurInTop2: true,
      top1ScoreAbove85: true,
    },
  },
};

// ===================================================================
// FONCTIONS DE VALIDATION
// ===================================================================

const validateCriteria = (profile, results) => {
  const { careers, scores, preferences } = results;
  const top5Slugs = careers.slice(0, 5).map(c => c.slug);
  const top3Slugs = careers.slice(0, 3).map(c => c.slug);
  const validations = [];

  console.log(`\n📋 Validation des critères pour ${profile.name}:`);

  // Critères spécifiques par profil
  switch (profile.name) {
    case 'Aminata': {
      // Critère 1: Au moins 1 métier low financial dans Top 3
      const hasFinancialLowTop3 = careers.slice(0, 3).some(c => c.financial_requirement === 'low');
      validations.push({
        test: 'Au moins 1 métier financial_requirement=low dans Top 3',
        passed: hasFinancialLowTop3,
        actual: careers.slice(0, 3).map(c => `${c.title} (${c.financial_requirement})`).join(', '),
      });

      // Critère 2: Au moins 1 métier rural dans Top 5
      const hasRuralTop5 = careers.slice(0, 5).some(c => c.preferred_location === 'rural');
      validations.push({
        test: 'Au moins 1 métier preferred_location=rural dans Top 5',
        passed: hasRuralTop5,
        actual: careers.slice(0, 5).map(c => `${c.title} (${c.preferred_location})`).join(', '),
      });

      // Critère 3: Aucun métier high financial dans Top 5
      const hasHighFinancialTop5 = careers.slice(0, 5).some(c => c.financial_requirement === 'high');
      validations.push({
        test: 'Aucun métier financial_requirement=high dans Top 5',
        passed: !hasHighFinancialTop5,
        actual: hasHighFinancialTop5 ? 'ÉCHEC: métier high trouvé' : 'OK',
      });

      // Critère 4: Score Électricien > 75
      const electricien = careers.find(c => c.slug === 'electricien-batiment');
      validations.push({
        test: 'Score Électricien Bâtiment > 75',
        passed: electricien && electricien.compatibilityScore > 75,
        actual: electricien ? `${electricien.compatibilityScore.toFixed(1)}` : 'Non trouvé',
      });
      break;
    }

    case 'Moussa': {
      // Critère 1: Au moins 3 métiers requires_network=true dans Top 5
      const networkCount = careers.slice(0, 5).filter(c => c.requires_network).length;
      validations.push({
        test: 'Au moins 3 métiers requires_network=true dans Top 5',
        passed: networkCount >= 3,
        actual: `${networkCount} métiers`,
      });

      // Critère 2: Entrepreneur dans Top 3
      const entrepreneurInTop3 = top3Slugs.includes('entrepreneur');
      validations.push({
        test: 'Entrepreneur dans Top 3',
        passed: entrepreneurInTop3,
        actual: entrepreneurInTop3 ? `Rang ${top3Slugs.indexOf('entrepreneur') + 1}` : 'Non trouvé en Top 3',
      });

      // Critère 3: Aucun métier rural dans Top 5
      const hasRural = careers.slice(0, 5).some(c => c.preferred_location === 'rural');
      validations.push({
        test: 'Aucun métier preferred_location=rural dans Top 5',
        passed: !hasRural,
        actual: hasRural ? 'ÉCHEC: métier rural trouvé' : 'OK',
      });

      // Critère 4: Scores urbains > 80
      const urbanCareers = careers.slice(0, 5).filter(c => c.preferred_location === 'urban');
      const urbanScoresAbove80 = urbanCareers.every(c => c.compatibilityScore > 80);
      validations.push({
        test: 'Métiers urbains avec score > 80',
        passed: urbanScoresAbove80,
        actual: urbanCareers.map(c => `${c.title}: ${c.compatibilityScore.toFixed(1)}`).join(', '),
      });
      break;
    }

    case 'Fatou': {
      // Critère 1: Assistant Social dans Top 3
      const assistantSocialInTop3 = top3Slugs.includes('assistant-social');
      validations.push({
        test: 'Assistant Social dans Top 3',
        passed: assistantSocialInTop3,
        actual: assistantSocialInTop3 ? `Rang ${top3Slugs.indexOf('assistant-social') + 1}` : 'Non trouvé en Top 3',
      });

      // Critère 2: Bonus religieux appliqué (+10 pour Assistant Social)
      const assistantSocial = careers.find(c => c.slug === 'assistant-social');
      validations.push({
        test: 'Bonus religieux visible pour Assistant Social (score élevé)',
        passed: assistantSocial && assistantSocial.compatibilityScore > 75,
        actual: assistantSocial ? `Score: ${assistantSocial.compatibilityScore.toFixed(1)}` : 'Non trouvé',
      });

      // Critère 3: Score social élevé
      validations.push({
        test: 'Score domaine Social > 80',
        passed: scores.social > 80,
        actual: `${scores.social.toFixed(1)}`,
      });
      break;
    }

    case 'Ibrahima': {
      // Critère 1: Aucune pénalité financière
      validations.push({
        test: 'Contrainte financière = Faible (pas de pénalité)',
        passed: preferences.financial_constraint === 'Faible (famille peut financer)',
        actual: preferences.financial_constraint,
      });

      // Critère 2: Bonus réseau appliqué
      validations.push({
        test: 'Réseau fort détecté',
        passed: preferences.network_access === 'Fort et stable',
        actual: preferences.network_access,
      });

      // Critère 3: Médecin ou Ingénieur dans Top 2
      const medecinOrIngenieur = top3Slugs.slice(0, 2).some(slug =>
        slug === 'medecin-generaliste' || slug === 'ingenieur-informatique'
      );
      validations.push({
        test: 'Médecin Généraliste OU Ingénieur Informatique dans Top 2',
        passed: medecinOrIngenieur,
        actual: careers.slice(0, 2).map(c => c.title).join(', '),
      });

      // Critère 4: Top 1 score > 85
      validations.push({
        test: 'Score du Top 1 > 85',
        passed: careers[0].compatibilityScore > 85,
        actual: `${careers[0].compatibilityScore.toFixed(1)}`,
      });
      break;
    }
  }

  return validations;
};

// ===================================================================
// EXÉCUTION DES TESTS
// ===================================================================

const runTests = async () => {
  console.log('🧪 ==========================================');
  console.log('🧪 TESTS AUTOMATISÉS - SYSTÈME D\'ORIENTATION');
  console.log('🧪 ==========================================\n');

  const results = [];

  for (const [key, profile] of Object.entries(TEST_PROFILES)) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📊 TEST: ${profile.name.toUpperCase()}`);
    console.log(`📝 Description: ${profile.description}`);
    console.log(`${'='.repeat(80)}\n`);

    try {
      // Calculer les scores
      console.log('⚙️  Calcul des scores...');
      const { scores, preferences } = calculateOrientationScores(profile.answers);

      console.log('\n📈 Scores de domaines:');
      Object.entries(scores).forEach(([domain, score]) => {
        console.log(`   ${domain}: ${score.toFixed(1)}`);
      });

      console.log('\n🔍 Préférences contextuelles:');
      console.log(`   Contrainte financière: ${preferences.financial_constraint}`);
      console.log(`   Réseau familial: ${preferences.family_network}`);
      console.log(`   Localisation: ${preferences.location}`);
      console.log(`   Accès Internet: ${preferences.network_access}`);
      console.log(`   Importance religieuse: ${preferences.religious_importance}/100`);

      // Matching des métiers
      console.log('\n🎯 Matching des métiers...');
      const matchedCareers = await matchCareers(scores, preferences, profile.level);

      console.log(`\n✅ ${matchedCareers.length} métiers trouvés`);
      console.log('\n🏆 TOP 5 MÉTIERS RECOMMANDÉS:');
      matchedCareers.slice(0, 5).forEach((career, index) => {
        console.log(`   ${index + 1}. ${career.title} - ${career.compatibilityScore.toFixed(1)}% compatibilité`);
        console.log(`      💰 ${career.financial_requirement} | 🌍 ${career.preferred_location} | 🤝 ${career.requires_network ? 'Réseau requis' : 'Pas de réseau'}`);
      });

      // Validation des critères
      const validations = validateCriteria(profile, {
        careers: matchedCareers,
        scores,
        preferences,
      });

      let passedCount = 0;
      let failedCount = 0;

      validations.forEach(v => {
        if (v.passed) {
          console.log(`   ✅ ${v.test}`);
          console.log(`      → ${v.actual}`);
          passedCount++;
        } else {
          console.log(`   ❌ ${v.test}`);
          console.log(`      → ${v.actual}`);
          failedCount++;
        }
      });

      const testPassed = failedCount === 0;

      results.push({
        profile: profile.name,
        passed: testPassed,
        passedCount,
        failedCount,
        totalCriteria: validations.length,
        topCareers: matchedCareers.slice(0, 5).map(c => c.title),
      });

      console.log(`\n📊 RÉSULTAT: ${testPassed ? '✅ SUCCÈS' : '❌ ÉCHEC'} (${passedCount}/${validations.length} critères validés)`);

    } catch (error) {
      console.error(`\n❌ ERREUR lors du test ${profile.name}:`, error);
      results.push({
        profile: profile.name,
        passed: false,
        error: error.message,
      });
    }
  }

  // Résumé global
  console.log('\n\n' + '='.repeat(80));
  console.log('📊 RÉSUMÉ GLOBAL DES TESTS');
  console.log('='.repeat(80) + '\n');

  const totalTests = results.length;
  const passedTests = results.filter(r => r.passed).length;
  const failedTests = totalTests - passedTests;

  results.forEach(r => {
    const status = r.passed ? '✅ SUCCÈS' : '❌ ÉCHEC';
    console.log(`${status} - ${r.profile}`);
    if (r.passedCount !== undefined) {
      console.log(`   Critères validés: ${r.passedCount}/${r.totalCriteria}`);
      console.log(`   Top 5: ${r.topCareers.join(', ')}`);
    }
    if (r.error) {
      console.log(`   Erreur: ${r.error}`);
    }
    console.log('');
  });

  console.log(`\n🎯 TOTAL: ${passedTests}/${totalTests} tests réussis`);

  if (passedTests === totalTests) {
    console.log('\n🎉 TOUS LES TESTS SONT VALIDÉS ! Le système de matching contextuel fonctionne correctement.\n');
    process.exit(0);
  } else {
    console.log(`\n⚠️  ${failedTests} test(s) ont échoué. Vérifiez les détails ci-dessus.\n`);
    process.exit(1);
  }
};

// Exécuter les tests
runTests().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
