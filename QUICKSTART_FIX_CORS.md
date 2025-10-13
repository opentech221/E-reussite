# 🚀 GUIDE RAPIDE - FIX CORS EN 5 MINUTES

## Problème
❌ `CORS policy blocked` lors de l'utilisation de Perplexity

## Solution
✅ Déployer une Edge Function Supabase (proxy backend)

---

## 📋 Commandes à exécuter

```powershell
# 1. Installer Supabase CLI
npm install -g supabase

# 2. Se connecter
supabase login

# 3. Lier le projet
supabase link --project-ref qbvdrkhdjjpuowthwinf

# 4. Déployer la fonction
supabase functions deploy perplexity-search
```

---

## ⚙️ Configuration Dashboard (1 fois)

1. Ouvrir: https://supabase.com/dashboard/project/qbvdrkhdjjpuowthwinf/settings/functions
2. Cliquer: **Secrets** → **Add secret**
3. Remplir:
   - **Name**: `PERPLEXITY_API_KEY`
   - **Value**: `pplx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
4. Cliquer: **Save**

---

## ✅ Vérification

```powershell
# Tester l'app
npm run dev

# Ouvrir http://localhost:3000
# Assistant IA (🧠) → Mode recherche (🔍)
# Poser une question
# → Plus d'erreur CORS ! ✅
```

---

## 📚 Documentation complète

- **Déploiement détaillé**: `DEPLOY_PERPLEXITY_EDGE_FUNCTION.md`
- **Correction CORS**: `CORRECTION_CORS_PERPLEXITY.md`

---

**Temps**: 5 minutes  
**Difficulté**: ⭐ Facile
