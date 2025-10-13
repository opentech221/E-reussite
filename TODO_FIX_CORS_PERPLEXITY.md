# ✅ RÉSOLUTION PROBLÈME CORS - RÉCAPITULATIF

Date: 10 octobre 2025  
Durée: 30 minutes  
Statut: **PRÊT À DÉPLOYER**

---

## 🎯 Ce qui a été fait

### **Diagnostic**
✅ Identifié: Erreur CORS lors d'appel direct Perplexity API  
✅ Cause: Headers personnalisés bloqués par politique CORS  
✅ Solution: Proxy backend via Supabase Edge Function  

### **Fichiers créés** (7)

1. **`supabase/functions/perplexity-search/index.ts`**
   - Edge Function proxy Perplexity
   - Gère CORS et erreurs
   - Logs détaillés

2. **`supabase/functions/perplexity-search/.env.example`**
   - Template configuration

3. **`src/services/perplexityService.js`** (modifié)
   - Utilise `supabase.functions.invoke()`
   - Interface inchangée

4. **`install-supabase-cli.ps1`**
   - Script installation CLI

5. **`deploy-perplexity.ps1`**
   - Script déploiement automatisé

6. **`DEPLOY_PERPLEXITY_EDGE_FUNCTION.md`**
   - Guide complet (200+ lignes)

7. **`CORRECTION_CORS_PERPLEXITY.md`**
   - Documentation problème/solution

8. **`QUICKSTART_FIX_CORS.md`**
   - Guide rapide 5 minutes

---

## 🚀 Actions requises (10 min)

### **Étape 1: Installation CLI** (2 min)

**Option A: Script automatique**
```powershell
cd C:\Users\toshiba\Downloads\E-reussite
.\install-supabase-cli.ps1
```

**Option B: Manuel**
```powershell
npm install -g supabase
```

### **Étape 2: Authentification** (1 min)
```powershell
supabase login
```
→ Page web s'ouvre → Autoriser → Revenir terminal

### **Étape 3: Lier projet** (1 min)
```powershell
supabase link --project-ref qbvdrkhdjjpuowthwinf
```

### **Étape 4: Configurer secret** (2 min)

1. Ouvrir: https://supabase.com/dashboard/project/qbvdrkhdjjpuowthwinf/settings/functions
2. **Secrets** → **Add secret**
3. Name: `PERPLEXITY_API_KEY`
4. Value: `pplx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
5. **Save**

### **Étape 5: Déployer** (3 min)

**Option A: Script automatique**
```powershell
.\deploy-perplexity.ps1
```

**Option B: Manuel**
```powershell
supabase functions deploy perplexity-search
```

### **Étape 6: Tester** (1 min)
```powershell
npm run dev
```
→ http://localhost:3000  
→ Assistant IA (🧠) → Mode recherche (🔍)  
→ Poser question → ✅ **Fonctionne !**

---

## 📊 Avant vs Après

| Aspect | ❌ Avant | ✅ Après |
|--------|---------|---------|
| **Erreur CORS** | Oui | Non |
| **Sécurité clé API** | Frontend (visible) | Backend (cachée) |
| **Architecture** | Frontend → Perplexity | Frontend → Edge Function → Perplexity |
| **Logs** | Console uniquement | Dashboard Supabase |
| **Performance** | Direct | Proxy rapide (CDN global) |
| **Coût ajouté** | - | $0 (Free tier) |

---

## ✅ Tests de validation

### **Test 1: Pas d'erreur CORS**
```
Console (F12) devrait montrer:
✅ [Perplexity] Envoi requête via Edge Function
✅ [Perplexity] Réponse reçue avec X sources

Au lieu de:
❌ Access to fetch... has been blocked by CORS policy
```

### **Test 2: Réponse avec sources**
```
Interface devrait afficher:
- Cadre "Réponse" avec texte
- Cadre "Sources (X)" avec liens cliquables
- Timestamp en bas
```

### **Test 3: Logs Supabase**
```
Dashboard → Edge Functions → perplexity-search → Logs:
🔍 [Perplexity Proxy] Requête: {...}
✅ [Perplexity Proxy] Réponse reçue
```

---

## 🎯 Checklist finale

### **Installation**
- [ ] Supabase CLI installé (`supabase --version` fonctionne)
- [ ] Authentifié (`supabase login` réussi)
- [ ] Projet lié (`supabase projects list` montre qbvdrkhdjjpuowthwinf)

### **Configuration**
- [ ] Secret `PERPLEXITY_API_KEY` créé dans Dashboard
- [ ] Valeur correcte: `pplx-4GrYK2X...`

### **Déploiement**
- [ ] Edge Function déployée (message "Deployed successfully")
- [ ] URL visible: `https://qbvdrkhdjjpuowthwinf.supabase.co/functions/v1/perplexity-search`

### **Tests**
- [ ] App relancée (`npm run dev`)
- [ ] Mode Perplexity activé (icône 🔍)
- [ ] Question posée
- [ ] ✅ **Pas d'erreur CORS**
- [ ] ✅ **Réponse affichée**
- [ ] ✅ **Sources cliquables**
- [ ] Logs visibles dans Dashboard

---

## 📚 Documentation créée

| Fichier | Taille | Usage |
|---------|--------|-------|
| `QUICKSTART_FIX_CORS.md` | 1 page | Démarrage rapide 5 min |
| `DEPLOY_PERPLEXITY_EDGE_FUNCTION.md` | 10 pages | Guide complet détaillé |
| `CORRECTION_CORS_PERPLEXITY.md` | 8 pages | Problème + solution expliqués |

---

## 🚨 Si problème

### **Erreur: "supabase: command not found"**
```powershell
# Réinstaller
npm install -g supabase

# Vérifier PATH
$env:PATH
```

### **Erreur: "Function not found" (404)**
```powershell
# Redéployer
supabase functions deploy perplexity-search

# Vérifier liste
supabase functions list
```

### **Erreur: "PERPLEXITY_API_KEY is not defined"**
```
→ Vérifier Dashboard → Settings → Edge Functions → Secrets
→ Le secret doit être nommé exactement: PERPLEXITY_API_KEY
```

### **Toujours CORS**
```powershell
# Vider cache navigateur
Ctrl+Shift+Delete → Tout vider → Recharger F5

# Vérifier que perplexityService.js utilise bien la Edge Function
# (pas d'appel direct à api.perplexity.ai)
```

---

## 💡 Points clés à retenir

1. **Pourquoi Edge Function?**
   → Perplexity API ne supporte pas CORS depuis navigateur

2. **Sécurité améliorée?**
   → Oui, clé API cachée côté serveur (pas visible dans code frontend)

3. **Coût?**
   → $0 (Free tier Supabase = 500k invocations/mois, largement suffisant)

4. **Performance?**
   → Même temps de réponse (~2-3s), proxy transparent

5. **Maintenance?**
   → Aucune, Edge Function auto-scale et deploy global (CDN)

---

## 🎉 Résultat final

```
AVANT:
Frontend → ❌ CORS → Perplexity API

APRÈS:
Frontend → ✅ OK → Edge Function → ✅ OK → Perplexity API → ✅ OK
```

**Statut**: ✅ **PRODUCTION READY après déploiement**  
**Temps estimé**: 10 minutes  
**Complexité**: ⭐ Facile (scripts automatisés)

---

**Prochaine action**: Exécuter `.\install-supabase-cli.ps1` 🚀
