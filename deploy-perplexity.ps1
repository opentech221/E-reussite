# ============================================================================
# SCRIPT DÉPLOIEMENT EDGE FUNCTION PERPLEXITY
# Date: 10 octobre 2025
# ============================================================================

Write-Host "🚀 Déploiement Edge Function Perplexity" -ForegroundColor Cyan
Write-Host ""

# Vérifier que Supabase CLI est installé
$supabaseInstalled = Get-Command supabase -ErrorAction SilentlyContinue

if (-not $supabaseInstalled) {
    Write-Host "❌ Supabase CLI non trouvé" -ForegroundColor Red
    Write-Host "Installez-le d'abord: .\install-supabase-cli.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Supabase CLI trouvé" -ForegroundColor Green
supabase --version
Write-Host ""

# Vérifier si on est dans le bon répertoire
if (-not (Test-Path "supabase\functions\perplexity-search\index.ts")) {
    Write-Host "❌ Fichier Edge Function non trouvé" -ForegroundColor Red
    Write-Host "Assurez-vous d'être dans le dossier E-reussite" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Fichier Edge Function trouvé" -ForegroundColor Green
Write-Host ""

# Demander confirmation
Write-Host "📝 Informations de déploiement:" -ForegroundColor Cyan
Write-Host "  - Fonction: perplexity-search" -ForegroundColor White
Write-Host "  - Projet: qbvdrkhdjjpuowthwinf" -ForegroundColor White
Write-Host "  - Fichier: supabase\functions\perplexity-search\index.ts" -ForegroundColor White
Write-Host ""

$confirmation = Read-Host "Continuer le déploiement? (o/n)"

if ($confirmation -ne 'o' -and $confirmation -ne 'O') {
    Write-Host "❌ Déploiement annulé" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "� Vérification de l'authentification..." -ForegroundColor Cyan
Write-Host ""

# Vérifier si déjà connecté
$authStatus = supabase projects list 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Pas encore connecté à Supabase" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📝 Connexion à Supabase..." -ForegroundColor Cyan
    Write-Host "   Une page web va s'ouvrir pour l'authentification" -ForegroundColor Gray
    Write-Host ""
    
    supabase login
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erreur lors de la connexion" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    Write-Host "✅ Connecté avec succès!" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "✅ Déjà connecté à Supabase" -ForegroundColor Green
    Write-Host ""
}

# Lier le projet si nécessaire
Write-Host "🔗 Liaison au projet..." -ForegroundColor Cyan
supabase link --project-ref $projectRef 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Projet lié: $projectRef" -ForegroundColor Green
} else {
    Write-Host "⚠️  Projet déjà lié ou erreur mineure (on continue...)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "�🚀 Déploiement en cours..." -ForegroundColor Yellow
Write-Host ""

# Déployer la fonction
supabase functions deploy perplexity-search

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Déploiement réussi!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📍 URL de la fonction:" -ForegroundColor Cyan
    Write-Host "https://qbvdrkhdjjpuowthwinf.supabase.co/functions/v1/perplexity-search" -ForegroundColor White
    Write-Host ""
    Write-Host "🧪 Testez maintenant:" -ForegroundColor Cyan
    Write-Host "1. Relancez l'app: npm run dev" -ForegroundColor White
    Write-Host "2. Ouvrez l'Assistant IA (🧠)" -ForegroundColor White
    Write-Host "3. Activez le mode recherche (🔍)" -ForegroundColor White
    Write-Host "4. Posez une question" -ForegroundColor White
    Write-Host ""
    Write-Host "📊 Voir les logs:" -ForegroundColor Cyan
    Write-Host "https://supabase.com/dashboard/project/qbvdrkhdjjpuowthwinf/functions/perplexity-search/logs" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "❌ Erreur lors du déploiement" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Vérifiez:" -ForegroundColor Yellow
    Write-Host "1. Que vous êtes connecté: supabase login" -ForegroundColor White
    Write-Host "2. Que le projet est lié: supabase link --project-ref qbvdrkhdjjpuowthwinf" -ForegroundColor White
    Write-Host "3. Que la clé PERPLEXITY_API_KEY est configurée dans Supabase Dashboard" -ForegroundColor White
    Write-Host ""
    Write-Host "📖 Guide complet: DEPLOY_PERPLEXITY_EDGE_FUNCTION.md" -ForegroundColor Gray
}
