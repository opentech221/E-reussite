# 🤖 INSTALLATION ASSISTANT IA CONTEXTUEL

## 📦 Installation Package Gemini

```bash
npm install @google/generative-ai
```

## 🔑 Configuration Clé API

1. **Obtenir une clé API Gemini** :
   - Allez sur https://makersuite.google.com/app/apikey
   - Connectez-vous avec votre compte Google
   - Cliquez sur "Create API Key"
   - Copiez la clé générée

2. **Configurer le fichier .env** :
   ```bash
   # Copier le template
   cp .env.example .env
   
   # Éditer .env et ajouter votre clé
   VITE_GEMINI_API_KEY=votre_clé_api_gemini_ici
   ```

3. **Vérifier la configuration** :
   - La clé doit commencer par `AIza...`
   - Ne partagez JAMAIS cette clé publiquement
   - Ajoutez `.env` dans `.gitignore` (déjà fait)

## ✅ Vérification Installation

```bash
# Démarrer le serveur dev
npm run dev

# Vérifier la console :
# Vous devriez voir : "🤖 [App] Assistant IA Contextuel initialisé avec Gemini"
```

## 🎯 Utilisation

L'Assistant IA est maintenant disponible **partout** dans l'application :

1. **Bouton flottant** en bas à droite (🤖)
2. **Contextuel** selon la page (Dashboard, Cours, Quiz, etc.)
3. **Intelligent** : comprend où vous êtes et ce que vous faites
4. **Persistant** : historique de conversation conservé

## 🔧 Si problème

### Erreur "Service IA non disponible"
- ✅ Vérifier que `VITE_GEMINI_API_KEY` est dans `.env`
- ✅ Redémarrer le serveur dev (`npm run dev`)
- ✅ Vider le cache navigateur (F12 > Application > Clear storage)

### Pas de bouton flottant
- ✅ Se connecter (l'IA nécessite authentification)
- ✅ Vérifier console pour erreurs
- ✅ Confirmer import dans `App.jsx`

### Réponses lentes
- Normal ! Gemini peut prendre 2-5 secondes
- L'indicateur de chargement s'affiche pendant ce temps

## 📚 Fonctionnalités

### Contextuelles :
- **Dashboard** : Explique stats, conseille actions
- **Cours** : Explique concepts, donne exemples
- **Quiz/Examens** : Astuces, explications erreurs
- **Progression** : Interprète graphiques, recommande
- **Coach IA** : Approfondit analyses, clarifie prédictions
- **Badges/Défis** : Stratégies déblocage
- **Profil** : Aide configuration

### Commandes spéciales :
- "Explique-moi [concept]"
- "Donne-moi des exemples"
- "Comment améliorer [compétence] ?"
- "Pourquoi [statistique] ?"
- "Que dois-je faire maintenant ?"

## 🔐 Sécurité

✅ Clé API côté client (VITE_ prefix)  
✅ Historique local par utilisateur  
✅ Pas de données sensibles envoyées  
✅ Conversations isolées par page  

## 📊 Limites

- **Quota Gemini** : ~60 requêtes/minute (gratuit)
- **Longueur message** : 500 caractères max
- **Historique** : 20 derniers messages conservés
- **Timeout** : 30 secondes par requête

## 🎉 C'est tout !

L'Assistant IA Contextuel est prêt à aider les étudiants partout dans l'application ! 🚀
