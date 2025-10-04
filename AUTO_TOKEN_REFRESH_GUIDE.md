# Guide - Refresh Automatique des Tokens

## 🎯 Fonctionnalité Implémentée

Le système de refresh automatique des tokens OAuth a été implémenté pour éviter les erreurs d'authentification et maintenir les connexions actives.

## 🔧 Comment Ça Marche

### Google Drive
- **Refresh automatique** : Géré par la bibliothèque `googleapis`
- **Mise à jour en base** : Les nouveaux tokens sont automatiquement sauvegardés
- **Transparent** : Aucune action requise de l'utilisateur

### Dropbox
- **Détection d'expiration** : Vérifie si le token expire dans les 5 prochaines minutes
- **Refresh automatique** : Utilise le refresh token pour obtenir un nouveau access token
- **Mise à jour en base** : Sauvegarde automatique des nouveaux tokens

## 🚀 Fonctionnalités

### 1. Middleware de Refresh
- **Application automatique** : Sur toutes les routes de fichiers
- **Vérification proactive** : Avant chaque requête API
- **Gestion d'erreurs** : Continue même si le refresh échoue

### 2. Mise à Jour en Base de Données
- **Tokens Google** : Mis à jour automatiquement via l'événement `tokens`
- **Tokens Dropbox** : Mis à jour via le middleware
- **Timestamps** : Date d'expiration mise à jour

### 3. Gestion des Erreurs
- **Fallback** : Utilise l'ancien token si le refresh échoue
- **Logs détaillés** : Suivi des opérations de refresh
- **Continuité de service** : L'application continue de fonctionner

## 📋 Avantages

### Pour l'Utilisateur
- ✅ **Aucune reconnexion** nécessaire
- ✅ **Sessions persistantes** même après expiration
- ✅ **Expérience fluide** sans interruption
- ✅ **Pas de perte de données** lors des opérations

### Pour le Développeur
- ✅ **Gestion automatique** des tokens
- ✅ **Moins d'erreurs** d'authentification
- ✅ **Code plus robuste** et fiable
- ✅ **Maintenance réduite**

## 🔍 Détails Techniques

### Google Drive
```javascript
// Refresh automatique via OAuth2Client
oauth2Client.on('tokens', async (tokens) => {
  // Mise à jour automatique en base de données
  await prisma.cloudAccount.update({
    where: { userId_provider: { userId, provider: 'google_drive' } },
    data: {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: new Date(tokens.expiry_date)
    }
  });
});
```

### Dropbox
```javascript
// Refresh manuel via API Dropbox
const newTokens = await refreshDropboxToken(refreshToken);
await prisma.cloudAccount.update({
  where: { id: account.id },
  data: {
    accessToken: newTokens.access_token,
    refreshToken: newTokens.refresh_token,
    expiresAt: new Date(Date.now() + newTokens.expires_in * 1000)
  }
});
```

## 🧪 Test du Refresh Automatique

### 1. Test Google Drive
1. **Utilisez l'application** normalement
2. **Attendez l'expiration** du token (1 heure)
3. **Continuez à utiliser** - le refresh se fait automatiquement
4. **Vérifiez les logs** : "Token d'accès Google rafraîchi"

### 2. Test Dropbox
1. **Utilisez l'application** normalement
2. **Attendez l'expiration** du token (4 heures)
3. **Continuez à utiliser** - le refresh se fait automatiquement
4. **Vérifiez les logs** : "Token Dropbox rafraîchi avec succès"

## 📊 Monitoring

### Logs à Surveiller
- `Token d'accès Google rafraîchi` - Google Drive refresh
- `Token Google mis à jour en base de données` - Sauvegarde Google
- `Rafraîchissement du token Dropbox` - Dropbox refresh
- `Token Dropbox rafraîchi avec succès` - Sauvegarde Dropbox

### Erreurs Possibles
- `Erreur lors de la mise à jour du token Google` - Problème de base de données
- `Erreur lors du rafraîchissement du token Dropbox` - Problème API Dropbox

## 🔧 Configuration

### Variables d'Environnement Requises
```env
# Google Drive
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=your_redirect_uri

# Dropbox
DROPBOX_CLIENT_ID=your_client_id
DROPBOX_CLIENT_SECRET=your_client_secret
DROPBOX_REDIRECT_URI=your_redirect_uri
```

### Base de Données
- **Table** : `CloudAccount`
- **Champs** : `accessToken`, `refreshToken`, `expiresAt`
- **Index** : `userId_provider` pour les mises à jour rapides

## 🚨 Dépannage

### Si le Refresh Échoue
1. **Vérifiez les logs** pour l'erreur spécifique
2. **Vérifiez les variables d'environnement**
3. **Vérifiez la connectivité** à la base de données
4. **Testez manuellement** les endpoints OAuth

### Si les Tokens Ne Se Mettent Pas à Jour
1. **Vérifiez la base de données** pour les nouveaux tokens
2. **Vérifiez les permissions** de la base de données
3. **Redémarrez l'application** pour recharger la configuration

## 📝 Notes Importantes

- **Refresh transparent** : L'utilisateur ne voit rien
- **Performance** : Refresh uniquement quand nécessaire
- **Sécurité** : Tokens chiffrés en base de données
- **Fiabilité** : Fallback en cas d'échec du refresh
