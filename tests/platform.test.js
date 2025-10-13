import { test, expect } from '@playwright/test';

// Test simple pour vérifier que la plateforme se charge
test('E-Réussite Platform loads correctly', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Vérifier que le titre de la page est correct
  await expect(page).toHaveTitle(/E-Réussite/);
  
  // Vérifier que la navbar est présente
  await expect(page.locator('nav')).toBeVisible();
  
  // Vérifier que le bouton d'inscription est présent
  await expect(page.locator('text=Inscription')).toBeVisible();
  
  console.log('✅ Page d\'accueil chargée avec succès');
});

test('Navigation works correctly', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Tester la navigation vers la page "À propos"
  await page.click('text=À propos');
  await expect(page.url()).toContain('/about');
  
  // Tester la navigation vers les cours
  await page.click('text=Nos cours');
  await expect(page.url()).toContain('/courses');
  
  console.log('✅ Navigation fonctionne correctement');
});

test('Badge system loads without errors', async ({ page }) => {
  await page.goto('http://localhost:3000/badges');
  
  // Vérifier que la page des badges se charge
  await expect(page.locator('h1')).toContainText('Badges');
  
  console.log('✅ Système de badges charge sans erreur');
});

test('Leaderboard displays correctly', async ({ page }) => {
  await page.goto('http://localhost:3000/leaderboard');
  
  // Vérifier que le classement se charge
  await expect(page.locator('h1')).toContainText('Classement');
  
  console.log('✅ Classement s\'affiche correctement');
});