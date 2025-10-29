#!/usr/bin/env pwsh
# =============================================
# SCRIPT DÉPLOIEMENT NETLIFY - E-Réussite
# =============================================

Write-Host "🚀 Déploiement E-Réussite sur Netlify" -ForegroundColor Cyan
Write-Host ""

# Vérifier si Netlify CLI est installé
$netlifyVersion = netlify --version 2>$null
if (-not $netlifyVersion) {
    Write-Host "❌ Netlify CLI n'est pas installé" -ForegroundColor Red
    Write-Host "📦 Installation en cours..." -ForegroundColor Yellow
    npm install -g netlify-cli
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Échec de l'installation" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Netlify CLI installé: $netlifyVersion" -ForegroundColor Green
Write-Host ""

# Vérifier les variables d'environnement
Write-Host "🔍 Vérification des variables d'environnement..." -ForegroundColor Cyan
$envVars = @(
    "VITE_SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "CRON_SECRET"
)

$missingVars = @()
foreach ($var in $envVars) {
    $value = [System.Environment]::GetEnvironmentVariable($var)
    if (-not $value) {
        $missingVars += $var
        Write-Host "❌ $var non définie" -ForegroundColor Red
    } else {
        Write-Host "✅ $var définie" -ForegroundColor Green
    }
}

if ($missingVars.Count -gt 0) {
    Write-Host ""
    Write-Host "⚠️  Variables manquantes: $($missingVars -join ', ')" -ForegroundColor Yellow
    Write-Host "📋 Configurez-les avec: netlify env:set VARIABLE_NAME 'valeur'" -ForegroundColor Cyan
    Write-Host ""
    
    $continue = Read-Host "Voulez-vous continuer quand même ? (o/N)"
    if ($continue -ne "o" -and $continue -ne "O") {
        Write-Host "❌ Déploiement annulé" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "🔨 Build de l'application..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Échec du build" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build réussi" -ForegroundColor Green
Write-Host ""

Write-Host "🚀 Déploiement en production..." -ForegroundColor Cyan
netlify deploy --prod
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Échec du déploiement" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Déploiement réussi!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Prochaines étapes:" -ForegroundColor Cyan
Write-Host "  1. Vérifier les logs: netlify functions:log competition-reminders" -ForegroundColor White
Write-Host "  2. Ouvrir le dashboard: netlify open" -ForegroundColor White
Write-Host "  3. Tester la fonction: curl -X POST https://VOTRE_SITE.netlify.app/.netlify/functions/competition-reminders -H 'Authorization: Bearer VOTRE_CRON_SECRET'" -ForegroundColor White
Write-Host ""
