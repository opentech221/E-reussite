# 🔧 GUIDE: Résolution erreur Edge Function perplexity-search (500)

## Problème
L'Edge Function `perplexity-search` retourne une erreur 500 Internal Server Error.

## Causes possibles
1. ❌ Secret `PERPLEXITY_API_KEY` non configuré dans Supabase
2. ❌ Edge Function pas déployée
3. ❌ Clé API Perplexity invalide ou expirée

---

## Solution 1: Vérifier et configurer le secret

### Option A: Via Supabase CLI (recommandé)

```bash
# 1. Vérifier les secrets existants
npx supabase secrets list --project-ref qbvdrkhdjjpuowthwinf

# 2. Configurer le secret PERPLEXITY_API_KEY
npx supabase secrets set PERPLEXITY_API_KEY="VOTRE_NOUVELLE_CLE_PERPLEXITY_ICI" --project-ref qbvdrkhdjjpuowthwinf

# 3. Vérifier que le secret est bien configuré
npx supabase secrets list --project-ref qbvdrkhdjjpuowthwinf
```

### Option B: Via Dashboard Supabase

1. Va sur https://supabase.com/dashboard/project/qbvdrkhdjjpuowthwinf/settings/vault/secrets
2. Clique sur **Add new secret**
3. Nom: `PERPLEXITY_API_KEY`
4. Valeur: `VOTRE_NOUVELLE_CLE_PERPLEXITY_ICI`
5. Clique sur **Save**

---

## Solution 2: Redéployer l'Edge Function

```bash
# 1. Se connecter à Supabase
npx supabase login

# 2. Lier le projet
npx supabase link --project-ref qbvdrkhdjjpuowthwinf

# 3. Déployer l'Edge Function
npx supabase functions deploy perplexity-search --project-ref qbvdrkhdjjpuowthwinf

# 4. Vérifier le déploiement
npx supabase functions list --project-ref qbvdrkhdjjpuowthwinf
```

---

## Solution 3: Tester l'Edge Function

```bash
# Tester localement (développement)
npx supabase functions serve perplexity-search

# Dans un autre terminal, tester avec curl:
curl -X POST http://localhost:54321/functions/v1/perplexity-search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Qu'\''est-ce que le BFEM au Sénégal?",
    "context": {
      "subject": "Éducation",
      "level": "BFEM"
    }
  }'
```

---

## Solution 4: Voir les logs en temps réel

```bash
# Voir les logs de l'Edge Function
npx supabase functions logs perplexity-search --project-ref qbvdrkhdjjpuowthwinf

# Suivre les logs en temps réel
npx supabase functions logs perplexity-search --project-ref qbvdrkhdjjpuowthwinf --follow
```

---

## Vérification finale

1. ✅ Secret `PERPLEXITY_API_KEY` configuré
2. ✅ Edge Function déployée
3. ✅ Pas d'erreur dans les logs
4. ✅ Test réussi depuis l'application

---

## Commandes rapides (copier-coller)

```powershell
# Windows PowerShell - Configuration complète
npx supabase secrets set PERPLEXITY_API_KEY="VOTRE_NOUVELLE_CLE_ICI" --project-ref qbvdrkhdjjpuowthwinf
npx supabase functions deploy perplexity-search --project-ref qbvdrkhdjjpuowthwinf
npx supabase functions logs perplexity-search --project-ref qbvdrkhdjjpuowthwinf
```

---

## Notes importantes

⚠️ **ATTENTION**: La clé API Perplexity dans ce guide est l'ancienne clé (potentiellement exposée).
- Si tu as généré une **nouvelle clé**, utilise-la à la place
- Révoque l'ancienne clé sur https://www.perplexity.ai/settings/api

💡 **Conseil**: Utilise toujours des **nouvelles clés** après une exposition publique, même si l'historique Git a été nettoyé.
