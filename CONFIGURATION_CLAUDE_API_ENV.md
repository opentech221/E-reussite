# 🔑 CONFIGURATION - Variables d'Environnement

**Fichier** : `.env`  
**Date** : 9 octobre 2025  
**Objectif** : Configuration des clés API pour les services IA

---

## 📋 Instructions

### **1. Créer/Modifier le fichier .env**

À la **racine du projet** `E-reussite/`, créez ou modifiez le fichier `.env` :

```env
# ═══════════════════════════════════════════════════════════
# SUPABASE (Existe déjà)
# ═══════════════════════════════════════════════════════════
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_supabase


# ═══════════════════════════════════════════════════════════
# GOOGLE GEMINI AI (Existe déjà)
# ═══════════════════════════════════════════════════════════
VITE_GEMINI_API_KEY=votre_cle_gemini_existante


# ═══════════════════════════════════════════════════════════
# CLAUDE AI (NOUVEAU - À AJOUTER)
# ═══════════════════════════════════════════════════════════
# Documentation: https://docs.anthropic.com/claude/reference/getting-started-with-the-api
# Console: https://console.anthropic.com/

VITE_CLAUDE_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 🔐 Obtenir votre Clé API Claude

### **Étape 1 : Créer un compte Anthropic**

1. Aller sur : https://console.anthropic.com/
2. Créer un compte ou se connecter
3. Accepter les conditions d'utilisation

### **Étape 2 : Générer une clé API**

1. Dans la console, aller dans **"API Keys"**
2. Cliquer sur **"Create Key"**
3. Donner un nom : `E-reussite-Coach-IA`
4. Copier la clé générée (format: `sk-ant-api03-...`)

### **Étape 3 : Ajouter la clé dans .env**

```env
VITE_CLAUDE_API_KEY=sk-ant-api03-VOTRE_CLE_COMPLETE_ICI
```

⚠️ **IMPORTANT** :
- Ne **JAMAIS** commiter le fichier `.env` dans Git
- Vérifier que `.env` est dans `.gitignore`
- La clé commence toujours par `sk-ant-api03-`

---

## ✅ Vérification

### **Vérifier que .env est ignoré par Git**

```bash
# Dans .gitignore (doit déjà exister)
.env
.env.local
.env.*.local
```

### **Tester la clé API**

Une fois le fichier `.env` modifié :

1. **Redémarrer le serveur de développement** :
   ```bash
   # Arrêter (Ctrl+C)
   # Relancer
   npm run dev
   ```

2. **Ouvrir Coach IA** et sélectionner "🟣 Claude 3.5"

3. **Envoyer un message test** : "Bonjour"

4. **Logs attendus** :
   ```javascript
   ✅ [claudeAI] Clé API valide
   🟣 [claudeAI] Génération réponse...
   ✅ [claudeAI] Réponse générée
   ```

---

## 🔄 Structure Complète .env

```env
# ═══════════════════════════════════════════════════════════
# E-RÉUSSITE - CONFIGURATION ENVIRONNEMENT
# Date: 9 octobre 2025
# ⚠️ NE JAMAIS COMMITER CE FICHIER
# ═══════════════════════════════════════════════════════════

# ───────────────────────────────────────────────────────────
# DATABASE - SUPABASE
# ───────────────────────────────────────────────────────────
VITE_SUPABASE_URL=https://qbvdrkhdjjpuowthwinf.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_supabase_anon_key

# ───────────────────────────────────────────────────────────
# AI PROVIDERS
# ───────────────────────────────────────────────────────────

# Google Gemini 2.0 Flash (Vision + Text)
# Console: https://aistudio.google.com/app/apikey
VITE_GEMINI_API_KEY=votre_cle_gemini

# Claude 3.5 Sonnet (Text + Reasoning)
# Console: https://console.anthropic.com/
# Documentation: https://docs.anthropic.com/
VITE_CLAUDE_API_KEY=sk-ant-api03-votre_cle_claude

# ───────────────────────────────────────────────────────────
# AUTRES (Si nécessaire à l'avenir)
# ───────────────────────────────────────────────────────────
# VITE_OPENAI_API_KEY=
# VITE_MISTRAL_API_KEY=
```

---

## 📊 Tarification Claude AI

### **Pricing (Octobre 2025)**

| Modèle | Input | Output |
|--------|-------|--------|
| Claude 3.5 Sonnet | $3 / 1M tokens | $15 / 1M tokens |
| Claude 3 Opus | $15 / 1M tokens | $75 / 1M tokens |
| Claude 3 Haiku | $0.25 / 1M tokens | $1.25 / 1M tokens |

**Usage typique Coach IA** :
- Message utilisateur : ~100-500 tokens
- Réponse IA : ~200-1000 tokens
- **Coût par message** : ~$0.001 - $0.005 (0.1 à 0.5 centimes)

### **Crédits Gratuits**

Anthropic offre généralement :
- **$5 de crédits gratuits** lors de l'inscription
- ~1000-5000 messages selon la longueur

---

## 🔗 Ressources

- **Documentation officielle** : https://docs.anthropic.com/
- **Console API** : https://console.anthropic.com/
- **Exemples de code** : https://github.com/anthropics/anthropic-sdk-typescript
- **Limites de l'API** : https://docs.anthropic.com/claude/reference/rate-limits
- **Changelog** : https://docs.anthropic.com/claude/reference/changelog

---

## 🆘 Dépannage

### **Erreur : "Clé API invalide"**

```javascript
❌ [claudeAI] Erreur: Clé API Claude invalide
```

**Solutions** :
1. Vérifier que la clé commence par `sk-ant-api03-`
2. Vérifier qu'il n'y a pas d'espace avant/après la clé
3. Régénérer une nouvelle clé sur la console Anthropic
4. Redémarrer le serveur après modification du `.env`

### **Erreur : "Variable d'environnement undefined"**

```javascript
❌ import.meta.env.VITE_CLAUDE_API_KEY is undefined
```

**Solutions** :
1. Vérifier que la variable commence par `VITE_` (requis par Vite)
2. Redémarrer le serveur de développement
3. Vérifier que le fichier `.env` est à la racine du projet

### **Erreur : "Rate limit exceeded"**

```javascript
❌ [claudeAI] Erreur: 429 - Rate limit exceeded
```

**Solutions** :
1. Attendre quelques minutes (limites par minute)
2. Vérifier votre usage sur console.anthropic.com
3. Upgrade vers un plan payant si nécessaire

---

## ✅ Checklist Finale

Avant de lancer l'application :

- [ ] Fichier `.env` créé à la racine
- [ ] `VITE_CLAUDE_API_KEY` ajouté avec la vraie clé
- [ ] Clé commence par `sk-ant-api03-`
- [ ] `.env` est dans `.gitignore`
- [ ] Serveur de développement redémarré
- [ ] Test avec un message dans Coach IA

---

**Une fois configuré, vous pouvez utiliser Claude AI ! 🚀**
