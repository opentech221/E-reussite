# ============================================
# Script : Nettoyage avant réapplication
# ============================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Red
Write-Host "  🧹 NETTOYAGE - Badges FK" -ForegroundColor Red
Write-Host "  Suppression des badge_id malformés" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""

$cleanupFile = "supabase\migrations\20251023_cleanup_badges.sql"

if (-not (Test-Path $cleanupFile)) {
    Write-Host "❌ Fichier de nettoyage non trouvé" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Fichier de nettoyage trouvé" -ForegroundColor Green
Write-Host ""

$sql = Get-Content $cleanupFile -Raw

Write-Host "⚠️  Ce script va NETTOYER les données malformées:" -ForegroundColor Yellow
Write-Host "   • Supprimer la colonne badge_id malformée (avec _)" -ForegroundColor White
Write-Host "   • Rétablir badge_name dans user_badges" -ForegroundColor White
Write-Host "   • Supprimer la FK incorrecte" -ForegroundColor White
Write-Host ""
Write-Host "🎯 Après, vous pourrez réexécuter la migration V2 corrigée" -ForegroundColor Cyan
Write-Host ""

$confirm = Read-Host "Continuer le nettoyage? (O/n)"
if ($confirm -eq 'n' -or $confirm -eq 'N') {
    Write-Host "❌ Opération annulée" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "📋 Copie du SQL de nettoyage..." -ForegroundColor Yellow
Set-Clipboard -Value $sql
Write-Host "✅ SQL copié dans le presse-papiers!" -ForegroundColor Green
Write-Host ""

Write-Host "📝 ÉTAPE 1 - Nettoyage:" -ForegroundColor Cyan
Write-Host "   1. Allez dans Supabase Dashboard (déjà ouvert)" -ForegroundColor White
Write-Host "   2. SQL Editor → New Query" -ForegroundColor White
Write-Host "   3. Ctrl+V → Run" -ForegroundColor White
Write-Host ""

$openBrowser = Read-Host "Ouvrir Supabase Dashboard? (O/n)"
if ($openBrowser -ne 'n' -and $openBrowser -ne 'N') {
    Start-Process "https://supabase.com/dashboard"
    Write-Host "✅ Navigateur ouvert!" -ForegroundColor Green
}

Write-Host ""
Write-Host "⏸️  Après avoir exécuté le NETTOYAGE..." -ForegroundColor Yellow
Read-Host "Appuyez sur Entrée pour copier la migration V2 corrigée"

Write-Host ""
Write-Host "📋 Copie de la migration V2 corrigée..." -ForegroundColor Yellow
$migrationV2 = Get-Content "supabase\migrations\20251023_fix_badges_fk_v2.sql" -Raw
Set-Clipboard -Value $migrationV2
Write-Host "✅ Migration V2 corrigée copiée!" -ForegroundColor Green
Write-Host ""

Write-Host "📝 ÉTAPE 2 - Migration V2:" -ForegroundColor Cyan
Write-Host "   1. Nouvelle query dans Supabase" -ForegroundColor White
Write-Host "   2. Ctrl+V → Run" -ForegroundColor White
Write-Host ""
Write-Host "✅ Cette fois les badge_id seront corrects!" -ForegroundColor Green
Write-Host "   (premier_pas, perseverant, matheux, etc.)" -ForegroundColor Gray
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Script terminé" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
