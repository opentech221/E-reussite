# ============================================================================
# SCRIPT INSTALLATION SUPABASE CLI - MÉTHODE SCOOP
# Date: 10 octobre 2025
# ============================================================================

Write-Host "🚀 Installation Supabase CLI pour E-reussite" -ForegroundColor Cyan
Write-Host ""

# Vérifier si Supabase CLI est déjà installé
$supabaseInstalled = Get-Command supabase -ErrorAction SilentlyContinue

if ($supabaseInstalled) {
    Write-Host "✅ Supabase CLI déjà installé" -ForegroundColor Green
    supabase --version
} else {
    Write-Host "📦 Installation de Supabase CLI..." -ForegroundColor Yellow
    Write-Host ""
    
    # Vérifier si Scoop est installé
    $scoopInstalled = Get-Command scoop -ErrorAction SilentlyContinue
    
    if ($scoopInstalled) {
        Write-Host "Méthode: Scoop (recommandée)" -ForegroundColor Gray
        Write-Host ""
        
        # Ajouter le bucket Supabase
        Write-Host "📦 Ajout du bucket Supabase..." -ForegroundColor Cyan
        scoop bucket add supabase https://github.com/supabase/scoop-bucket.git 2>$null
        
        # Installer Supabase CLI
        Write-Host "📥 Installation de Supabase CLI..." -ForegroundColor Cyan
        scoop install supabase
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅ Supabase CLI installé avec succès!" -ForegroundColor Green
            supabase --version
        } else {
            Write-Host "❌ Erreur lors de l'installation" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "⚠️  Scoop n'est pas installé" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Gray
        Write-Host "  INSTALLATION REQUISE: Scoop (Gestionnaire de paquets)" -ForegroundColor Cyan
        Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Étape 1: Ouvrez PowerShell en tant qu'administrateur" -ForegroundColor White
        Write-Host ""
        Write-Host "Étape 2: Exécutez ces 2 commandes:" -ForegroundColor White
        Write-Host ""
        Write-Host "  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser" -ForegroundColor Cyan
        Write-Host "  Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Étape 3: Relancez ce script" -ForegroundColor White
        Write-Host ""
        Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor Gray
        Write-Host "Alternative: Installation manuelle" -ForegroundColor Yellow
        Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor Gray
        Write-Host "1. Téléchargez: https://github.com/supabase/cli/releases" -ForegroundColor Gray
        Write-Host "2. Extrayez supabase.exe dans C:\Program Files\Supabase" -ForegroundColor Gray
        Write-Host "3. Ajoutez au PATH système" -ForegroundColor Gray
        Write-Host ""
        exit 1
    }
}

Write-Host ""
Write-Host "📋 Prochaines étapes:" -ForegroundColor Cyan
Write-Host "1. supabase login" -ForegroundColor White
Write-Host "2. supabase link --project-ref qbvdrkhdjjpuowthwinf" -ForegroundColor White
Write-Host "3. supabase functions deploy perplexity-search" -ForegroundColor White
Write-Host ""
Write-Host "📖 Guide complet: DEPLOY_PERPLEXITY_EDGE_FUNCTION.md" -ForegroundColor Gray
