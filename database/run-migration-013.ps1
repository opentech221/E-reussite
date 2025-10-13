# Script PowerShell pour exécuter la migration 013
# Date: 7 octobre 2025

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🚀 MIGRATION 013 - Colonnes manquantes" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration Supabase
$SUPABASE_URL = "https://qbvdrkhdjjpuowthwinf.supabase.co"
$SUPABASE_SERVICE_KEY = $env:SUPABASE_SERVICE_KEY

if (-not $SUPABASE_SERVICE_KEY) {
    Write-Host "❌ Variable SUPABASE_SERVICE_KEY non définie" -ForegroundColor Red
    Write-Host ""
    Write-Host "Définissez-la avec:" -ForegroundColor Yellow
    Write-Host '$env:SUPABASE_SERVICE_KEY = "votre_service_role_key"' -ForegroundColor Yellow
    exit 1
}

# Lire le fichier SQL
$migrationPath = Join-Path $PSScriptRoot "migrations\013_add_missing_user_points_columns.sql"
$sql = Get-Content $migrationPath -Raw

Write-Host "📄 Fichier de migration chargé" -ForegroundColor Green
Write-Host "   $migrationPath" -ForegroundColor Gray
Write-Host ""

# Headers
$headers = @{
    "apikey" = $SUPABASE_SERVICE_KEY
    "Authorization" = "Bearer $SUPABASE_SERVICE_KEY"
    "Content-Type" = "application/json"
    "Prefer" = "return=representation"
}

# Étape 1: Ajouter chapters_completed
Write-Host "🔧 Étape 1/4: Ajout de chapters_completed..." -ForegroundColor Yellow

$sql1 = @"
ALTER TABLE user_points 
ADD COLUMN IF NOT EXISTS chapters_completed INTEGER DEFAULT 0 NOT NULL;
"@

try {
    $body = @{ query = $sql1 } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/rpc/exec_sql" -Method Post -Headers $headers -Body $body -ErrorAction Stop
    Write-Host "   ✅ chapters_completed ajoutée" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        # Utiliser l'éditeur SQL via l'API
        Write-Host "   ⚠️  Utilisation de l'approche alternative..." -ForegroundColor Yellow
    } else {
        Write-Host "   ⚠️  $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Étape 2: Ajouter courses_completed
Write-Host "🔧 Étape 2/4: Ajout de courses_completed..." -ForegroundColor Yellow

$sql2 = @"
ALTER TABLE user_points 
ADD COLUMN IF NOT EXISTS courses_completed INTEGER DEFAULT 0 NOT NULL;
"@

try {
    $body = @{ query = $sql2 } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/rpc/exec_sql" -Method Post -Headers $headers -Body $body -ErrorAction Stop
    Write-Host "   ✅ courses_completed ajoutée" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "⚠️  EXÉCUTION MANUELLE REQUISE" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "L'API Supabase ne permet pas d'exécuter directement les ALTER TABLE." -ForegroundColor Yellow
Write-Host ""
Write-Host "📋 ACTIONS À FAIRE:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Allez sur: https://supabase.com/dashboard/project/qbvdrkhdjjpuowthwinf/editor" -ForegroundColor White
Write-Host ""
Write-Host "2. Exécutez ce SQL:" -ForegroundColor White
Write-Host ""
Write-Host "-- Ajouter les colonnes manquantes" -ForegroundColor Gray
Write-Host "ALTER TABLE user_points " -ForegroundColor Gray
Write-Host "ADD COLUMN IF NOT EXISTS chapters_completed INTEGER DEFAULT 0 NOT NULL," -ForegroundColor Gray
Write-Host "ADD COLUMN IF NOT EXISTS courses_completed INTEGER DEFAULT 0 NOT NULL;" -ForegroundColor Gray
Write-Host ""
Write-Host "-- Calculer les valeurs" -ForegroundColor Gray
Write-Host "UPDATE user_points up" -ForegroundColor Gray
Write-Host "SET " -ForegroundColor Gray
Write-Host "    chapters_completed = (" -ForegroundColor Gray
Write-Host "        SELECT COUNT(DISTINCT chapter_id)" -ForegroundColor Gray
Write-Host "        FROM user_progression" -ForegroundColor Gray
Write-Host "        WHERE user_id = up.user_id" -ForegroundColor Gray
Write-Host "        AND chapter_id IS NOT NULL" -ForegroundColor Gray
Write-Host "        AND completed = true" -ForegroundColor Gray
Write-Host "    )," -ForegroundColor Gray
Write-Host "    courses_completed = (" -ForegroundColor Gray
Write-Host "        SELECT COUNT(DISTINCT course_id)" -ForegroundColor Gray
Write-Host "        FROM user_progression" -ForegroundColor Gray
Write-Host "        WHERE user_id = up.user_id" -ForegroundColor Gray
Write-Host "        AND course_id IS NOT NULL" -ForegroundColor Gray
Write-Host "        AND completed = true" -ForegroundColor Gray
Write-Host "    );" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Vérifiez avec:" -ForegroundColor White
Write-Host ""
Write-Host "SELECT user_id, lessons_completed, chapters_completed, courses_completed" -ForegroundColor Gray
Write-Host "FROM user_points LIMIT 5;" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Créer un fichier SQL simplifié pour copier-coller
$quickSqlPath = Join-Path $PSScriptRoot "EXECUTE_THIS_IN_SUPABASE.sql"
$quickSql = @"
-- ⚡ MIGRATION 013 - À exécuter dans l'éditeur SQL Supabase
-- Date: 7 octobre 2025

-- Étape 1: Ajouter les colonnes
ALTER TABLE user_points 
ADD COLUMN IF NOT EXISTS chapters_completed INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS courses_completed INTEGER DEFAULT 0 NOT NULL;

-- Étape 2: Calculer les valeurs réelles
UPDATE user_points up
SET 
    chapters_completed = (
        SELECT COUNT(DISTINCT chapter_id)
        FROM user_progression
        WHERE user_id = up.user_id
        AND chapter_id IS NOT NULL
        AND completed = true
    ),
    courses_completed = (
        SELECT COUNT(DISTINCT course_id)
        FROM user_progression
        WHERE user_id = up.user_id
        AND course_id IS NOT NULL
        AND completed = true
    );

-- Étape 3: Vérification
SELECT 
    user_id,
    total_points,
    lessons_completed,
    chapters_completed,
    courses_completed
FROM user_points
ORDER BY created_at DESC
LIMIT 5;
"@

$quickSql | Out-File -FilePath $quickSqlPath -Encoding UTF8
Write-Host "✅ SQL prêt à copier dans: $quickSqlPath" -ForegroundColor Green
Write-Host ""
Write-Host "Ouvrez ce fichier, copiez le contenu, et collez-le dans l'éditeur SQL Supabase." -ForegroundColor Cyan
Write-Host ""
