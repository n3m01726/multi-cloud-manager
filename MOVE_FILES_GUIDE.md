# Guide de Test - Déplacement de Fichiers Google Drive

## 🎉 Fonctionnalités Implémentées

### Backend
1. **Connecteur Google Drive** (`backend/src/connectors/googleDrive.js`)
   - `moveFile(fileId, newParentId, oldParentId)` - Déplace un fichier
   - `copyFile(fileId, newParentId, newName)` - Copie un fichier

2. **Endpoints API** (`backend/src/routes/files.js`)
   - `POST /files/:userId/move` - Déplacer un fichier
   - `POST /files/:userId/copy` - Copier un fichier

### Frontend
1. **Service API** (`frontend/src/services/api.js`)
   - `moveFile()` - Appel API pour déplacer
   - `copyFile()` - Appel API pour copier

2. **Composants UI**
   - `FolderSelector.jsx` - Sélecteur de dossier de destination
   - `FileActions.jsx` - Menu d'actions (déplacer, copier, supprimer)
   - `FileItem.jsx` - Bouton menu d'actions ajouté
   - `FileExplorer.jsx` - Gestion des callbacks de déplacement/copie

## 🚀 Comment Tester

### 1. Démarrer l'Application

```bash
# Backend (dans un terminal)
cd backend && npm run dev

# Frontend (dans un autre terminal)
cd frontend && npm run dev
```

### 2. Tester le Déplacement de Fichiers

1. **Connectez-vous à Google Drive** via l'interface
2. **Naviguez dans vos fichiers** Google Drive
3. **Survolez un fichier** - vous devriez voir un bouton "⋮" (trois points)
4. **Cliquez sur le bouton "⋮"** pour ouvrir le menu d'actions
5. **Sélectionnez "Déplacer"** ou "Copier"
6. **Choisissez le dossier de destination** dans le sélecteur
7. **Confirmez l'opération**

### 3. Interface du Sélecteur de Dossiers

- **Navigation** : Utilisez les boutons "Retour" et "Accueil"
- **Recherche** : Tapez pour filtrer les dossiers
- **Sélection** : Cliquez sur un dossier pour le sélectionner
- **Confirmation** : Bouton "Sélectionner" pour confirmer

### 4. Types d'Opérations Supportées

#### ✅ Déplacement (Move)
- Déplace le fichier vers un nouveau dossier
- Supprime le fichier de l'ancien emplacement
- Met à jour la liste des fichiers automatiquement

#### ✅ Copie (Copy)
- Crée une copie du fichier dans le nouveau dossier
- Garde l'original à sa place
- Met à jour la liste des fichiers automatiquement

#### ⚠️ Suppression (Delete)
- Bouton présent mais non implémenté
- Affiche un message d'erreur si cliqué

### 5. Fonctionnalités du Sélecteur de Dossiers

- **Navigation hiérarchique** avec breadcrumb
- **Recherche en temps réel** des dossiers
- **Indicateur de chargement** pendant la navigation
- **Gestion des erreurs** avec bouton de retry
- **Interface responsive** et intuitive

## 🔧 Détails Techniques

### API Endpoints

#### Déplacer un fichier
```bash
POST /files/:userId/move
{
  "provider": "google_drive",
  "fileId": "FILE_ID",
  "newParentId": "FOLDER_ID",
  "oldParentId": "OLD_FOLDER_ID" // optionnel
}
```

#### Copier un fichier
```bash
POST /files/:userId/copy
{
  "provider": "google_drive",
  "fileId": "FILE_ID",
  "newParentId": "FOLDER_ID",
  "newName": "Nouveau nom" // optionnel
}
```

### Gestion des Erreurs

- **Service non connecté** : Message d'erreur approprié
- **Fichier non trouvé** : Gestion des erreurs 404
- **Permissions insuffisantes** : Gestion des erreurs 403
- **Erreurs réseau** : Retry automatique et messages d'erreur

### Mise à Jour de l'Interface

- **Rafraîchissement automatique** de la liste après déplacement/copie
- **Messages de confirmation** dans la console
- **Gestion des états de chargement** pendant les opérations

## 📋 Checklist de Test

### Tests de Base
- [ ] Menu d'actions s'ouvre au clic sur "⋮"
- [ ] Sélecteur de dossiers s'ouvre pour "Déplacer"
- [ ] Sélecteur de dossiers s'ouvre pour "Copier"
- [ ] Navigation dans les dossiers fonctionne
- [ ] Recherche de dossiers fonctionne
- [ ] Sélection de dossier de destination fonctionne

### Tests de Déplacement
- [ ] Fichier déplacé avec succès
- [ ] Fichier disparaît de l'ancien emplacement
- [ ] Fichier apparaît dans le nouveau dossier
- [ ] Liste des fichiers se met à jour automatiquement

### Tests de Copie
- [ ] Fichier copié avec succès
- [ ] Original reste à sa place
- [ ] Copie apparaît dans le nouveau dossier
- [ ] Liste des fichiers se met à jour automatiquement

### Tests d'Erreurs
- [ ] Gestion des erreurs de connexion
- [ ] Gestion des erreurs de permissions
- [ ] Messages d'erreur appropriés
- [ ] Interface reste utilisable après erreur

## 🎯 Prochaines Améliorations Possibles

1. **Drag & Drop** : Glisser-déposer des fichiers entre dossiers
2. **Sélection multiple** : Déplacer/copier plusieurs fichiers à la fois
3. **Undo/Redo** : Annuler les opérations de déplacement
4. **Progression** : Barre de progression pour les gros fichiers
5. **Notifications** : Notifications toast pour les opérations
6. **Raccourcis clavier** : Ctrl+X, Ctrl+C, Ctrl+V

## 🐛 Debugging

Si le déplacement ne fonctionne pas :

1. **Vérifiez la console du navigateur** pour les erreurs
2. **Vérifiez les logs du backend** pour les erreurs API
3. **Testez l'endpoint directement** :
   ```bash
   curl -X POST "http://localhost:3001/files/USER_ID/move" \
     -H "Content-Type: application/json" \
     -d '{"provider":"google_drive","fileId":"FILE_ID","newParentId":"FOLDER_ID"}'
   ```
4. **Vérifiez les permissions** du fichier dans Google Drive

## 📝 Notes Importantes

- Les opérations de déplacement/copie sont **irréversibles** (sauf avec Ctrl+Z dans Google Drive)
- Certains fichiers peuvent avoir des **restrictions de déplacement**
- Les **dossiers partagés** peuvent avoir des permissions spéciales
- Le **rafraîchissement automatique** peut prendre quelques secondes
