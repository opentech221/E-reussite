# 🚀 DÉPLOIEMENT EDGE FUNCTION PERPLEXITY

Date: 10 octobre 2025  
Problème résolu: **CORS Policy Error**

---

## 🎯 Problème

L'API Perplexity bloque les appels directs depuis le navigateur avec une erreur CORS :
```
Access-Control-Allow-Headers in preflight response
```

## ✅ Solution

**Supabase Edge Function** = Proxy backend qui appelle Perplexity depuis le serveur.

---

## 📋 Prérequis

1. **Supabase CLI installé**
   ```powershell
   # Installer via npm
   npm install -g supabase
   
   # Ou via Scoop (Windows)
   scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
   scoop install supabase
   ```

2. **Authentification Supabase**
   ```powershell
   supabase login
   ```

3. **Projet Supabase lié**
   ```powershell
   cd C:\Users\toshiba\Downloads\E-reussite
   supabase link --project-ref qbvdrkhdjjpuowthwinf
   ```

---

## 🚀 Étapes de déploiement

### **Étape 1 : Configurer la clé API Perplexity dans Supabase**

1. **Ouvrir Supabase Dashboard**
   - https://supabase.com/dashboard/project/qbvdrkhdjjpuowthwinf

2. **Aller dans Settings → Edge Functions → Secrets**
   - Cliquer sur "Add secret"
   - **Name**: `PERPLEXITY_API_KEY`
   - **Value**: `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`
   - Cliquer "Save"

### **Étape 2 : Déployer la fonction**

```powershell
# Depuis la racine du projet
cd C:\Users\toshiba\Downloads\E-reussite

# Déployer la Edge Function
supabase functions deploy perplexity-search
```

**Sortie attendue**:
```
Deploying function perplexity-search...
Function URL: https://qbvdrkhdjjpuowthwinf.supabase.co/functions/v1/perplexity-search
✅ Deployed successfully
```

### **Étape 3 : Tester la fonction**

```powershell
# Test avec curl
curl -X POST "https://qbvdrkhdjjpuowthwinf.supabase.co/functions/v1/perplexity-search" `
  -H "Authorization: Bearer YOUR_ANON_KEY" `
  -H "Content-Type: application/json" `
  -d '{"query": "Quelles sont les matières du BFEM ?", "context": {"level": "BFEM"}}'
```

**Remplacez `YOUR_ANON_KEY` par**:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFidmRya2hkampwdW93dGh3aW5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMTc4NjUsImV4cCI6MjA3NDg5Mzg2NX0.eGtl8fEwG8UWX-zSB8TntUAtgEVyLqaKauMMcj0QX8E
```

**Réponse attendue**:
```json
{
  "answer": "Le BFEM (Brevet de Fin d'Études Moyennes) comprend...",
  "citations": [
    "https://education.gouv.sn/...",
    "..."
  ],
  "model": "sonar-medium-online",
  "timestamp": "2025-10-10T..."
}
```

### **Étape 4 : Vérifier dans l'application**

1. **Relancer l'app** (si pas déjà fait):
   ```powershell
   npm run dev
   ```

2. **Tester le mode Perplexity**:
   - Ouvrir http://localhost:3000
   - Cliquer sur Assistant IA (🧠)
   - Cliquer sur mode recherche (🔍)
   - Poser une question
   - ✅ **Plus d'erreur CORS !**

---

## 🔍 Vérification logs

### **Dans Supabase Dashboard**:
1. Aller dans **Edge Functions** → `perplexity-search`
2. Cliquer sur **Logs**
3. Voir les requêtes en temps réel:
   ```
   🔍 [Perplexity Proxy] Requête: {...}
   ✅ [Perplexity Proxy] Réponse reçue
   ```

### **Dans Console navigateur (F12)**:
```javascript
🔍 [Perplexity] Envoi requête via Edge Function: "Question..."
✅ [Perplexity] Réponse reçue avec 3 sources
```

---

## 🛠️ Développement local (optionnel)

Pour tester localement sans déployer :

```powershell
# Démarrer Supabase local
supabase start

# Servir la fonction localement
supabase functions serve perplexity-search --env-file supabase/functions/perplexity-search/.env
```

**Créer `.env` local**:
```env
# supabase/functions/perplexity-search/.env
PERPLEXITY_API_KEY=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
```

**Modifier temporairement `perplexityService.js`**:
```javascript
// URL locale au lieu de production
const { data, error } = await supabase.functions.invoke('perplexity-search', {
  body: { query, context },
  // headers: { 'x-region': 'local' } // Si needed
});
```

---

## 🚨 Troubleshooting

### **Erreur: "Function not found"**
```
Solution: Vérifier que le déploiement a réussi
supabase functions list
```

### **Erreur: "PERPLEXITY_API_KEY is not defined"**
```
Solution: Vérifier que le secret est configuré dans Supabase Dashboard
Settings → Edge Functions → Secrets
```

### **Erreur: "Unauthorized"**
```
Solution: Vérifier que la clé Anon est correcte
Copier depuis Supabase Dashboard → Settings → API
```

### **Timeout**
```
Solution: Les Edge Functions ont un timeout de 50s
Réduire max_tokens si nécessaire
```

---

## 📊 Monitoring

### **Métriques à surveiller**:
- **Nombre de requêtes/jour**: Dashboard → Edge Functions → Usage
- **Temps de réponse moyen**: Logs → Duration
- **Taux d'erreur**: Logs → Filter by "❌"
- **Coût Perplexity**: Dashboard Perplexity API

### **Limites Edge Functions Supabase**:
| Plan | Invocations/mois | Durée max |
|------|------------------|-----------|
| **Free** | 500,000 | 50s |
| **Pro** | 2,000,000 | 150s |

✅ **Largement suffisant pour E-reussite**

---

## 💰 Coûts

### **Supabase Edge Functions**:
- **Free tier**: 500,000 invocations/mois
- **Estimé E-reussite**: ~15,000/mois
- **Coût**: $0 ✅

### **Perplexity API**:
- Inchangé (~$20-50/mois)

---

## 🎯 Avantages Edge Function

✅ **Pas de CORS** - Appels depuis le serveur  
✅ **Sécurité** - Clé API cachée côté serveur  
✅ **Performance** - Déploiement global (CDN)  
✅ **Logs centralisés** - Debug facile  
✅ **Rate limiting** - Contrôle intégré  
✅ **Scaling automatique** - Pas de config  

---

## 📚 Ressources

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Deno Deploy Docs](https://deno.com/deploy/docs)
- [Perplexity API Docs](https://docs.perplexity.ai)

---

## ✅ Checklist déploiement

- [ ] Supabase CLI installé
- [ ] Authentifié (`supabase login`)
- [ ] Projet lié (`supabase link`)
- [ ] Secret `PERPLEXITY_API_KEY` configuré dans Dashboard
- [ ] Edge Function déployée (`supabase functions deploy`)
- [ ] Test curl réussi
- [ ] Test dans l'app réussi (pas d'erreur CORS)
- [ ] Logs vérifiés dans Dashboard

---

**Prêt à déployer ! 🚀**

Temps estimé: **10 minutes**
