# Script pour nettoyer les clés API exposées dans les fichiers de documentation
# Date: 13 octobre 2025

Write-Host "`n🔒 Nettoyage des clés API dans les fichiers de documentation...`n" -ForegroundColor Yellow

$claudeKey = "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"
$perplexityKey = "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"

$claudePlaceholder = "sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
$perplexityPlaceholder = "pplx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Fichiers à nettoyer
$files = @(
    ".env",
    "TEST_PERPLEXITY_API.md",
    "PERPLEXITY_INTEGRATION_COMPLETE.md",
    "RECAPITULATIF_COMPLET_10_OCT_2025.md",
    "RECAPITULATIF_FINAL_PERPLEXITY_DUB.md",
    "TODO_FIX_CORS_PERPLEXITY.md",
    "PRET_A_TESTER.md",
    "QUICKSTART_FIX_CORS.md"
)

$count = 0

foreach ($file in $files) {
    $filePath = Join-Path -Path $PWD -ChildPath $file
    
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw -ErrorAction SilentlyContinue
        
        if ($content) {
            $originalContent = $content
            
            # Remplacer les clés Claude
            $content = $content -replace [regex]::Escape($claudeKey), $claudePlaceholder
            
            # Remplacer les clés Perplexity
            $content = $content -replace [regex]::Escape($perplexityKey), $perplexityPlaceholder
            
            # Sauvegarder si modifié
            if ($content -ne $originalContent) {
                Set-Content -Path $filePath -Value $content -NoNewline
                Write-Host "✅ Nettoyé: $file" -ForegroundColor Green
                $count++
            }
        }
    }
}

Write-Host "`n🎉 $count fichiers nettoyés !`n" -ForegroundColor Green
Write-Host "⚠️  IMPORTANT: Révoque ces clés API sur les plateformes:`n" -ForegroundColor Red
Write-Host "   1. https://console.anthropic.com/settings/keys" -ForegroundColor Yellow
Write-Host "   2. https://www.perplexity.ai/settings/api`n" -ForegroundColor Yellow
Write-Host "Ensuite, génère de nouvelles clés et mets à jour ton .env local.`n" -ForegroundColor Cyan
