# ============================================
# Script d'application - Correction Badges FK V2
# Avec nettoyage des orphelins
# ============================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Correction Foreign Key Badges V2" -ForegroundColor Cyan
Write-Host "  Avec nettoyage des orphelins" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$migrationFile = "supabase\migrations\20251023_fix_badges_fk_v2.sql"

# Vérifier que le fichier existe
if (-not (Test-Path $migrationFile)) {
    Write-Host "❌ Fichier de migration non trouvé: $migrationFile" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Fichier de migration trouvé" -ForegroundColor Green
Write-Host ""

# Lire le contenu SQL
$sql = Get-Content $migrationFile -Raw

Write-Host "📋 Cette migration va:" -ForegroundColor Yellow
Write-Host "  1. ✅ Ajouter badge_id à la table badges" -ForegroundColor White
Write-Host "  2. 🔄 Générer automatiquement les badge_id" -ForegroundColor White
Write-Host "  3. 🔍 Identifier les user_badges orphelins" -ForegroundColor White
Write-Host "  4. 🗑️  SUPPRIMER les orphelins (données invalides)" -ForegroundColor Yellow
Write-Host "  5. 🔄 Mapper user_badges.badge_name → badge_id" -ForegroundColor White
Write-Host "  6. 📝 Renommer badge_name → badge_id" -ForegroundColor White
Write-Host "  7. ✅ Créer la Foreign Key" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  ATTENTION: Les user_badges invalides seront SUPPRIMÉS" -ForegroundColor Yellow
Write-Host "   (badges qui n'existent plus dans la table badges)" -ForegroundColor Gray
Write-Host ""

Write-Host "Choisissez une méthode d'application:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. 🌐 Copier le SQL pour l'interface Supabase (RECOMMANDÉ)" -ForegroundColor Green
Write-Host "2. 📋 Afficher le contenu de la migration" -ForegroundColor White
Write-Host "3. ❌ Annuler" -ForegroundColor Gray
Write-Host ""

$choice = Read-Host "Votre choix (1-3)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "📋 Copie du SQL dans le presse-papiers..." -ForegroundColor Yellow
        
        # Copier dans le presse-papiers
        Set-Clipboard -Value $sql
        
        Write-Host "✅ SQL copié dans le presse-papiers!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📝 Prochaines étapes:" -ForegroundColor Cyan
        Write-Host "   1. Ouvrez https://supabase.com/dashboard" -ForegroundColor White
        Write-Host "   2. Sélectionnez votre projet E-réussite" -ForegroundColor White
        Write-Host "   3. SQL Editor → New Query" -ForegroundColor White
        Write-Host "   4. Collez le SQL (Ctrl+V)" -ForegroundColor White
        Write-Host "   5. Cliquez sur Run (Ctrl+Enter)" -ForegroundColor White
        Write-Host ""
        Write-Host "💡 La migration affichera:" -ForegroundColor Cyan
        Write-Host "   • Le mapping nom → badge_id" -ForegroundColor Gray
        Write-Host "   • Les orphelins détectés" -ForegroundColor Gray
        Write-Host "   • Le nombre de suppressions" -ForegroundColor Gray
        Write-Host "   • Le rapport final avec FK" -ForegroundColor Gray
        Write-Host ""
        
        $openBrowser = Read-Host "Ouvrir Supabase Dashboard maintenant? (O/n)"
        if ($openBrowser -ne 'n' -and $openBrowser -ne 'N') {
            Start-Process "https://supabase.com/dashboard"
            Write-Host "✅ Navigateur ouvert!" -ForegroundColor Green
        }
    }
    
    "2" {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "  Contenu de la migration" -ForegroundColor Cyan
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host $sql -ForegroundColor White
        Write-Host ""
    }
    
    "3" {
        Write-Host ""
        Write-Host "❌ Opération annulée" -ForegroundColor Yellow
        Write-Host ""
        exit 0
    }
    
    default {
        Write-Host ""
        Write-Host "❌ Choix invalide" -ForegroundColor Red
        Write-Host ""
        exit 1
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Script terminé" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
