# 🧪 TEST RAPIDE - NOTIFICATIONS PUSH

## Serveur redémarré ✅

Le serveur Vite tourne sur : `http://localhost:3000/`

---

## 🔍 Étape 1 : Vérifier la clé VAPID

**Option A - Page de test :**
```
http://localhost:3000/test-vapid.html
```

Tu devrais voir :
```
VAPID Key Check:
================

Key exists: true
Key value: BBDKw_bqfuWw72ndcUmPHQ8TbrLNuvBREmwjv9y4lPKuKsavy-oN4PsUIEDTrxi6eHHyVB1gvl_QOUbT2t3BFQI
Key length: 88
Expected length: 88

Status: ✅ OK
```

**Si tu vois "NOT FOUND" ou Key length ≠ 88 :**
- La clé VAPID n'est pas chargée
- Problème de `.env`

---

## 🎯 Étape 2 : Tester dans le Dashboard

**Une fois la clé VAPID confirmée :**

1. Ouvrir : `http://localhost:3000/dashboard`
2. Scroller vers le bas
3. Chercher la carte "Activer les notifications"
4. Cliquer sur "Activer les notifications"
5. Accepter la permission
6. Recevoir la notification de test 🎉

---

## 🐛 Si l'erreur "AbortError" persiste

**Console logs à vérifier :**

```javascript
[NotificationManager] VAPID public key: FOUND  ← Doit être "FOUND"
```

Si tu vois `NOT FOUND`, cela signifie que :
- Le `.env` n'est pas correctement lu
- Le serveur n'a pas redémarré
- La clé est cassée sur plusieurs lignes

**Solution :**
1. Fermer TOUS les onglets du navigateur
2. Dans terminal : `Ctrl+C` pour arrêter Vite
3. Attendre 2 secondes
4. Relancer : `npm run dev`
5. Ouvrir un NOUVEL onglet : `http://localhost:3000/test-vapid.html`

---

## ✅ Commande de vérification rapide

```powershell
# Dans PowerShell
Get-Content .env | Select-String "VITE_VAPID_PUBLIC_KEY"
```

Doit afficher sur **UNE SEULE LIGNE** :
```
VITE_VAPID_PUBLIC_KEY=BBDKw_bqfuWw72ndcUmPHQ8TbrLNuvBREmwjv9y4lPKuKsavy-oN4PsUIEDTrxi6eHHyVB1gvl_QOUbT2t3BFQI
```

Si la clé est sur **plusieurs lignes**, il y a un problème d'encodage.

---

**Prochaine action :**
1. Ouvrir `http://localhost:3000/test-vapid.html`
2. Vérifier que la clé est OK
3. Ensuite tester dans le Dashboard

Dis-moi ce que tu vois sur la page de test ! 🔍
