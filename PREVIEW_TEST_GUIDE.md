# Guide de Test - Prévisualisation Google Drive

## Modifications Apportées

### Backend
1. **Connecteur Google Drive** (`backend/src/connectors/googleDrive.js`)
   - Ajout de la méthode `getPreviewUrl()` pour générer les URLs de prévisualisation
   - Support des documents Google (Docs, Sheets, Slides) avec `webViewLink`
   - Support des fichiers standards (images, PDFs) via proxy backend pour éviter l'erreur 403

2. **Routes API** (`backend/src/routes/files.js`)
   - Nouvel endpoint `GET /files/:userId/preview/:provider/:fileId`
   - Nouvel endpoint `GET /files/preview-proxy/:provider/:fileId` (proxy pour les fichiers)
   - Retourne les URLs de prévisualisation et métadonnées
   - Le proxy gère l'authentification Google Drive automatiquement

### Frontend
1. **Service API** (`frontend/src/services/api.js`)
   - Ajout de `getPreviewUrl()` pour appeler l'endpoint de prévisualisation

2. **Composant FilePreviewModal** (`frontend/src/components/FileExplorer/partials/FilePreviewModal.jsx`)
   - Chargement asynchrone des URLs de prévisualisation
   - Support de différents types de fichiers :
     - Documents Google (iframe avec webViewLink)
     - Images (img via proxy backend - résout l'erreur 403)
     - Vidéos (video via proxy backend)
     - PDFs (iframe via proxy backend)
     - Documents Office (fallback vers Google Drive)
   - Gestion des erreurs et états de chargement
   - Boutons d'action (télécharger, ouvrir dans Google Drive)
   - Construction automatique des URLs complètes du backend

3. **Composants FileItem et Files**
   - Passage du `userId` nécessaire pour la prévisualisation

## Comment Tester

### 1. Démarrer l'Application

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 2. Tester la Prévisualisation

1. **Connectez-vous à Google Drive** via l'interface
2. **Naviguez dans vos fichiers** Google Drive
3. **Cliquez sur un fichier** (pas un dossier) pour ouvrir la modal de prévisualisation

### 3. Types de Fichiers à Tester

#### ✅ Documents Google (Devraient fonctionner parfaitement)
- Google Docs (.gdoc)
- Google Sheets (.gsheet)
- Google Slides (.gslides)
- Google Forms (.gform)

#### ✅ Images (Devraient fonctionner)
- JPG, JPEG, PNG, GIF, WebP
- Utilise `webContentLink` pour l'affichage direct

#### ✅ Vidéos (Devraient fonctionner)
- MP4, WebM, MOV, AVI
- Lecteur vidéo intégré

#### ✅ PDFs (Devraient fonctionner)
- Affichage dans iframe avec `webContentLink`

#### ⚠️ Documents Office (Fallback)
- Word (.doc, .docx)
- Excel (.xls, .xlsx)
- PowerPoint (.ppt, .pptx)
- Affiche un message avec bouton "Ouvrir dans Google Drive"

### 4. Fonctionnalités à Vérifier

- [ ] Modal s'ouvre au clic sur un fichier
- [ ] Indicateur de chargement pendant la récupération de l'URL
- [ ] Prévisualisation des documents Google dans iframe
- [ ] Affichage des images directement
- [ ] Lecteur vidéo pour les vidéos
- [ ] Affichage des PDFs dans iframe
- [ ] Fallback pour les documents Office
- [ ] Boutons d'action (télécharger, ouvrir dans Google Drive)
- [ ] Gestion des erreurs (fichier non accessible, etc.)

### 5. Debugging

Si la prévisualisation ne fonctionne pas :

1. **Vérifiez la console du navigateur** pour les erreurs
2. **Vérifiez les logs du backend** pour les erreurs API
3. **Testez l'endpoint de prévisualisation** :
   ```bash
   curl "http://localhost:3001/files/USER_ID/preview/google_drive/FILE_ID"
   ```
4. **Testez l'endpoint proxy** :
   ```bash
   curl "http://localhost:3001/files/preview-proxy/google_drive/FILE_ID?userId=USER_ID"
   ```
5. **Vérifiez les permissions** du fichier dans Google Drive

### 6. Résolution de l'Erreur 403

L'erreur 403 "Failed to load resource" a été résolue en :
- Utilisant un proxy backend au lieu d'URLs directes
- Le backend gère l'authentification Google Drive automatiquement
- Les URLs de prévisualisation pointent vers le proxy : `/files/preview-proxy/google_drive/FILE_ID?userId=USER_ID`

### 7. Résolution de l'Erreur 404

L'erreur 404 "Not Found" a été résolue en :
- Corrigeant l'URL de l'endpoint proxy de `/api/files/` vers `/files/`
- Les routes sont montées sur `/files` dans le backend Express

## Notes Importantes

- Les URLs de prévisualisation Google Drive peuvent expirer
- Certains fichiers peuvent nécessiter des permissions spéciales
- Les documents Google sont mieux prévisualisés que les documents Office
- La prévisualisation dépend des permissions de partage du fichier
