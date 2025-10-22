# Script PowerShell pour appliquer la migration de base de données
# Date: 2025-10-23
# Description: Applique la migration 20251023_fix_database_schema.sql

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Migration Base de Données E-Réussite" -ForegroundColor Cyan
Write-Host "  Option 4: Correction du schéma" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Chemin de la migration
$migrationFile = "supabase\migrations\20251023_fix_database_schema.sql"

# Vérifier que le fichier existe
if (-Not (Test-Path $migrationFile)) {
    Write-Host "❌ Erreur: Fichier de migration introuvable!" -ForegroundColor Red
    Write-Host "   Chemin attendu: $migrationFile" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Fichier de migration trouvé" -ForegroundColor Green
Write-Host ""

# Menu des options
Write-Host "Choisissez une méthode d'application:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. 🌐 Copier le SQL pour l'interface Supabase (RECOMMANDÉ)" -ForegroundColor White
Write-Host "2. 🚀 Appliquer via Supabase CLI (supabase db push)" -ForegroundColor White
Write-Host "3. 📋 Afficher le contenu de la migration" -ForegroundColor White
Write-Host "4. 📖 Ouvrir le README de migration" -ForegroundColor White
Write-Host "5. ❌ Annuler" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Votre choix (1-5)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "📋 Copie du SQL dans le presse-papiers..." -ForegroundColor Cyan
        
        # Lire et copier le contenu
        $sql = Get-Content $migrationFile -Raw
        Set-Clipboard -Value $sql
        
        Write-Host "✅ SQL copié dans le presse-papiers!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📝 Prochaines étapes:" -ForegroundColor Yellow
        Write-Host "   1. Ouvrez https://supabase.com/dashboard" -ForegroundColor White
        Write-Host "   2. Sélectionnez votre projet E-réussite" -ForegroundColor White
        Write-Host "   3. Allez dans SQL Editor → New Query" -ForegroundColor White
        Write-Host "   4. Collez le SQL (Ctrl+V)" -ForegroundColor White
        Write-Host "   5. Cliquez sur Run (Ctrl+Enter)" -ForegroundColor White
        Write-Host ""
        
        # Proposer d'ouvrir le navigateur
        $openBrowser = Read-Host "Ouvrir Supabase Dashboard maintenant? (O/n)"
        if ($openBrowser -ne "n") {
            Start-Process "https://supabase.com/dashboard"
            Write-Host "✅ Navigateur ouvert!" -ForegroundColor Green
        }
    }
    
    "2" {
        Write-Host ""
        Write-Host "🚀 Application via Supabase CLI..." -ForegroundColor Cyan
        Write-Host ""
        
        # Vérifier que Supabase CLI est installé
        try {
            $version = supabase --version 2>&1
            Write-Host "✅ Supabase CLI détecté: $version" -ForegroundColor Green
        }
        catch {
            Write-Host "❌ Erreur: Supabase CLI non installé!" -ForegroundColor Red
            Write-Host "   Installez-le avec: scoop install supabase" -ForegroundColor Yellow
            exit 1
        }
        
        Write-Host ""
        $confirm = Read-Host "⚠️  Êtes-vous sûr de vouloir appliquer la migration? (oui/non)"
        
        if ($confirm -eq "oui") {
            Write-Host ""
            Write-Host "📡 Connexion à la base de données..." -ForegroundColor Cyan
            
            # Appliquer la migration
            supabase db push
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host ""
                Write-Host "✅ Migration appliquée avec succès!" -ForegroundColor Green
                Write-Host ""
                Write-Host "🎯 Prochaines étapes:" -ForegroundColor Yellow
                Write-Host "   1. Vérifiez les logs Supabase pour les erreurs" -ForegroundColor White
                Write-Host "   2. Testez les pages Analytics et Dashboard" -ForegroundColor White
                Write-Host "   3. Consultez MIGRATION_20251023_README.md pour les vérifications" -ForegroundColor White
            }
            else {
                Write-Host ""
                Write-Host "❌ Erreur lors de l'application de la migration!" -ForegroundColor Red
                Write-Host "   Consultez les logs ci-dessus pour plus de détails" -ForegroundColor Yellow
                Write-Host "   Essayez l'option 1 (interface Supabase) comme alternative" -ForegroundColor Yellow
            }
        }
        else {
            Write-Host "❌ Migration annulée" -ForegroundColor Yellow
        }
    }
    
    "3" {
        Write-Host ""
        Write-Host "📄 Contenu de la migration:" -ForegroundColor Cyan
        Write-Host "========================================" -ForegroundColor Gray
        Get-Content $migrationFile | Write-Host -ForegroundColor White
        Write-Host "========================================" -ForegroundColor Gray
    }
    
    "4" {
        Write-Host ""
        Write-Host "📖 Ouverture du README..." -ForegroundColor Cyan
        
        if (Test-Path "MIGRATION_20251023_README.md") {
            Start-Process "MIGRATION_20251023_README.md"
            Write-Host "✅ README ouvert!" -ForegroundColor Green
        }
        else {
            Write-Host "❌ README introuvable!" -ForegroundColor Red
        }
    }
    
    "5" {
        Write-Host ""
        Write-Host "❌ Opération annulée" -ForegroundColor Yellow
        exit 0
    }
    
    default {
        Write-Host ""
        Write-Host "❌ Choix invalide!" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Script terminé" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
