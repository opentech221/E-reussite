# ============================================
# Migration V3 - Correction badge_id malformés
# SIMPLIFIÉ: badge_id existe, juste corriger les valeurs
# ============================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ✨ Migration V3 - SIMPLIFIÉE" -ForegroundColor Cyan
Write-Host "  Correction des badge_id malformés" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$migrationFile = "supabase\migrations\20251023_fix_badges_fk_v3.sql"

if (-not (Test-Path $migrationFile)) {
    Write-Host "❌ Fichier non trouvé: $migrationFile" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Migration V3 trouvée" -ForegroundColor Green
Write-Host ""

$sql = Get-Content $migrationFile -Raw

Write-Host "📋 Situation:" -ForegroundColor Yellow
Write-Host "   • Colonne badge_id EXISTE déjà dans les deux tables ✅" -ForegroundColor White
Write-Host "   • Mais valeurs malformées: _remier_as, _rudit, etc. ❌" -ForegroundColor Red
Write-Host ""
Write-Host "🎯 Cette migration V3 va:" -ForegroundColor Cyan
Write-Host "   1. ✅ Afficher les badge_id AVANT (malformés)" -ForegroundColor White
Write-Host "   2. 🔧 CORRIGER les badge_id dans badges" -ForegroundColor White
Write-Host "   3. ✅ Afficher les badge_id APRÈS (corrects)" -ForegroundColor White
Write-Host "   4. 🔍 Détecter les orphelins dans user_badges" -ForegroundColor White
Write-Host "   5. 🗑️  Supprimer les orphelins" -ForegroundColor White
Write-Host "   6. ✅ Vérifier/créer la Foreign Key" -ForegroundColor White
Write-Host ""
Write-Host "💡 Résultat attendu:" -ForegroundColor Green
Write-Host "   ✅ premier_pas (au lieu de _remier_as)" -ForegroundColor White
Write-Host "   ✅ erudit (au lieu de _rudit)" -ForegroundColor White
Write-Host "   ✅ perseverant (au lieu de _erseverant)" -ForegroundColor White
Write-Host ""

Write-Host "Copier le SQL dans le presse-papiers? (O/n): " -NoNewline -ForegroundColor Yellow
$confirm = Read-Host

if ($confirm -eq 'n' -or $confirm -eq 'N') {
    Write-Host "❌ Annulé" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "📋 Copie du SQL..." -ForegroundColor Yellow
Set-Clipboard -Value $sql
Write-Host "✅ SQL copié!" -ForegroundColor Green
Write-Host ""

Write-Host "📝 Dans Supabase Dashboard:" -ForegroundColor Cyan
Write-Host "   1. SQL Editor → New Query" -ForegroundColor White
Write-Host "   2. Ctrl+V → Run" -ForegroundColor White
Write-Host "   3. Vérifier les messages de succès" -ForegroundColor White
Write-Host ""

$openBrowser = Read-Host "Ouvrir Supabase Dashboard? (O/n)"
if ($openBrowser -ne 'n' -and $openBrowser -ne 'N') {
    Start-Process "https://supabase.com/dashboard"
    Write-Host "✅ Navigateur ouvert!" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Script terminé" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
