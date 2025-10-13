# 🪟 Installation Scoop + Supabase CLI (Windows)

**Temps estimé**: 5 minutes  
**Prérequis**: PowerShell

---

## 🎯 Pourquoi Scoop ?

Supabase CLI ne supporte **plus** l'installation via `npm install -g`.  
La méthode recommandée officielle est **Scoop** (gestionnaire de paquets Windows).

---

## 📦 Étape 1: Installer Scoop (2 minutes)

### **1.1 Ouvrir PowerShell en Administrateur**

**Méthode rapide**:
- `Win + X` → **Windows PowerShell (Admin)**

Ou:
- Rechercher "PowerShell"
- Clic droit → **Exécuter en tant qu'administrateur**

### **1.2 Autoriser l'exécution de scripts**

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Réponse attendue**: `Y` (Oui) → Entrée

### **1.3 Installer Scoop**

```powershell
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
```

**Durée**: ~30 secondes

**Sortie attendue**:
```
Initializing...
Downloading...
Extracting...
Creating shim...
Adding ~\scoop\shims to your path.
'scoop' (v0.3.1) was installed successfully!
```

### **1.4 Vérifier l'installation**

```powershell
scoop --version
```

**Sortie attendue**: `Current Scoop version: v0.3.1 (ou plus récent)`

---

## 🚀 Étape 2: Installer Supabase CLI (2 minutes)

**Vous pouvez maintenant FERMER PowerShell Admin et ouvrir un terminal normal.**

### **2.1 Revenir au dossier projet**

```powershell
cd C:\Users\toshiba\Downloads\E-reussite
```

### **2.2 Ajouter le bucket Supabase**

```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
```

**Durée**: ~10 secondes

### **2.3 Installer Supabase CLI**

```powershell
scoop install supabase
```

**Durée**: ~20 secondes

**Sortie attendue**:
```
Installing 'supabase' (1.x.x) [64bit]
Downloading...
Extracting...
Linking ~\scoop\apps\supabase\current => ~\scoop\apps\supabase\1.x.x
Creating shim for 'supabase'.
'supabase' (1.x.x) was installed successfully!
```

### **2.4 Vérifier l'installation**

```powershell
supabase --version
```

**Sortie attendue**: `1.x.x` (version actuelle)

---

## ✅ Étape 3: Exécuter le script de déploiement

Maintenant que Supabase CLI est installé, vous pouvez déployer la Edge Function :

```powershell
.\deploy-perplexity.ps1
```

Ou suivre le guide manuel : `QUICKSTART_FIX_CORS.md`

---

## 🔧 Alternative: Installation manuelle (si Scoop échoue)

### **Téléchargement direct**

1. **Aller sur**: https://github.com/supabase/cli/releases/latest
2. **Télécharger**: `supabase_windows_amd64.zip` (ou x86 selon votre système)
3. **Extraire** dans `C:\Program Files\Supabase\`
4. **Ajouter au PATH**:
   - Rechercher "Variables d'environnement"
   - Variables système → Path → Modifier
   - Nouveau → `C:\Program Files\Supabase`
   - OK → OK
5. **Redémarrer PowerShell**
6. **Tester**: `supabase --version`

---

## 🚨 Dépannage

### **Erreur: "Scoop was installed successfully but PATH is not updated"**

**Solution**:
```powershell
# Fermer PowerShell complètement
# Rouvrir un nouveau terminal
scoop --version
```

### **Erreur: "execution of scripts is disabled"**

**Solution**:
```powershell
# Ouvrir PowerShell en Admin
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
```

### **Erreur: "Could not create SSL/TLS secure channel"**

**Solution**:
```powershell
# Activer TLS 1.2
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# Puis réessayer l'installation Scoop
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
```

### **Supabase CLI installé mais "command not found"**

**Solution**:
```powershell
# Vérifier que Scoop est dans le PATH
$env:Path -split ';' | Select-String "scoop"

# Recharger le PATH
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Retester
supabase --version
```

---

## 📊 Résumé des commandes

```powershell
# 1. Installer Scoop (PowerShell Admin)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression

# 2. Installer Supabase CLI (Terminal normal)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# 3. Vérifier
supabase --version

# 4. Déployer Edge Function
cd C:\Users\toshiba\Downloads\E-reussite
.\deploy-perplexity.ps1
```

---

## 🎓 Avantages de Scoop

| Avantage | Description |
|----------|-------------|
| **Officiel** | Méthode recommandée par Supabase |
| **Simple** | 2 commandes pour installer |
| **Pas de PATH manuel** | Auto-configuré |
| **Mises à jour** | `scoop update supabase` |
| **Désinstallation** | `scoop uninstall supabase` |

---

## 🔗 Liens utiles

- **Scoop**: https://scoop.sh/
- **Supabase CLI**: https://github.com/supabase/cli
- **Supabase Scoop Bucket**: https://github.com/supabase/scoop-bucket

---

**Prochaine étape**: Une fois Supabase CLI installé → `.\deploy-perplexity.ps1` 🚀
