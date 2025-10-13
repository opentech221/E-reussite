# Script de correction automatique des textes en mode sombre
$sourceDir = 'c:\Users\toshiba\Downloads\E-reussite\src'
$files = Get-ChildItem -Path $sourceDir -Recurse -Filter '*.jsx' | Where-Object { $_.Name -notmatch 'node_modules' }

$corrections = @(
    @{ Pattern = 'text-slate-900(?![\s\S]{0,200}dark:text-)'; Replacement = 'text-slate-900 dark:text-white' },
    @{ Pattern = 'text-slate-800(?![\s\S]{0,200}dark:text-)'; Replacement = 'text-slate-800 dark:text-slate-100' },
    @{ Pattern = 'text-slate-700(?![\s\S]{0,200}dark:text-)'; Replacement = 'text-slate-700 dark:text-slate-200' },
    @{ Pattern = 'text-slate-600(?![\s\S]{0,200}dark:text-)'; Replacement = 'text-slate-600 dark:text-slate-300' },
    @{ Pattern = 'text-gray-900(?![\s\S]{0,200}dark:text-)'; Replacement = 'text-gray-900 dark:text-white' },
    @{ Pattern = 'text-gray-800(?![\s\S]{0,200}dark:text-)'; Replacement = 'text-gray-800 dark:text-gray-100' },
    @{ Pattern = 'text-gray-700(?![\s\S]{0,200}dark:text-)'; Replacement = 'text-gray-700 dark:text-gray-200' },
    @{ Pattern = 'text-gray-600(?![\s\S]{0,200}dark:text-)'; Replacement = 'text-gray-600 dark:text-gray-300' }
)

$totalFiles = 0
$totalChanges = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $originalContent = $content
    $fileChanges = 0
    
    foreach ($correction in $corrections) {
        $matches = [regex]::Matches($content, $correction.Pattern)
        if ($matches.Count -gt 0) {
            $content = $content -replace $correction.Pattern, $correction.Replacement
            $fileChanges += $matches.Count
        }
    }
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
        $totalFiles++
        $totalChanges += $fileChanges
        Write-Host \"✅ $($file.Name): $fileChanges corrections\" -ForegroundColor Green
    }
}

Write-Host \"
📊 RÉSUMÉ\" -ForegroundColor Cyan
Write-Host \"Fichiers modifiés: $totalFiles\" -ForegroundColor Yellow
Write-Host \"Total corrections: $totalChanges\" -ForegroundColor Yellow
Write-Host \"✅ Script terminé avec succès!\" -ForegroundColor Green
