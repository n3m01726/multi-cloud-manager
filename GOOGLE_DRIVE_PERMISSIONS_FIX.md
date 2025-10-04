# Correction des Permissions Google Drive

## 🚨 Problème Identifié

L'erreur 500 est causée par des permissions insuffisantes :
```
The user has not granted the app 339803989783 write access to the file
```

## 🔧 Solution

Les scopes OAuth Google Drive ont été mis à jour pour permettre la modification des fichiers existants.

### Avant (Permissions Insuffisantes)
```javascript
const scopes = [
  'https://www.googleapis.com/auth/drive.readonly',  // Lecture seule
  'https://www.googleapis.com/auth/drive.file',      // Seulement fichiers créés par l'app
  'https://www.googleapis.com/auth/userinfo.email',
];
```

### Après (Permissions Complètes)
```javascript
const scopes = [
  'https://www.googleapis.com/auth/drive',           // Accès complet à Google Drive
  'https://www.googleapis.com/auth/userinfo.email',
];
```

## 🚀 Étapes pour Corriger

### 1. Redémarrer le Backend
```bash
cd backend
npm run dev
```

### 2. Reconnecter Google Drive

**IMPORTANT** : Vous devez vous reconnecter à Google Drive pour obtenir les nouvelles permissions.

1. **Déconnectez-vous** de Google Drive dans l'interface
2. **Reconnectez-vous** - Google vous demandera d'accepter les nouvelles permissions
3. **Acceptez** les permissions complètes pour Google Drive

### 3. Tester le Déplacement

1. Naviguez dans vos fichiers Google Drive
2. Cliquez sur le bouton "⋮" d'un fichier
3. Sélectionnez "Déplacer"
4. Choisissez le dossier de destination
5. Confirmez l'opération

## 📋 Permissions Google Drive Incluses

Avec le scope `https://www.googleapis.com/auth/drive`, votre application peut maintenant :

- ✅ **Lire** tous les fichiers et dossiers
- ✅ **Modifier** les fichiers existants
- ✅ **Déplacer** les fichiers entre dossiers
- ✅ **Copier** les fichiers
- ✅ **Supprimer** les fichiers (si implémenté)
- ✅ **Créer** de nouveaux fichiers et dossiers
- ✅ **Partager** les fichiers

## 🔒 Sécurité

- Les permissions sont **limitées à votre compte Google**
- L'application ne peut accéder qu'aux fichiers que vous autorisez
- Vous pouvez **révoquer l'accès** à tout moment dans les paramètres Google
- Les tokens sont **sécurisés** et stockés de manière chiffrée

## 🐛 Si le Problème Persiste

1. **Vérifiez la console** pour les erreurs
2. **Déconnectez-vous complètement** et reconnectez-vous
3. **Vérifiez les paramètres Google** dans votre compte
4. **Testez avec un fichier simple** (pas un fichier partagé)

## 📝 Notes Importantes

- **Reconnexion requise** : Les anciens tokens n'ont pas les bonnes permissions
- **Fichiers partagés** : Certains fichiers peuvent avoir des restrictions
- **Permissions Google** : Vérifiez que l'application a bien les permissions complètes
