# Build & Deploy - Athletica Sports iOS

## Prerequis

- **macOS** avec **Xcode** installe (version 15+)
- **Node.js 20.19+** (utiliser `nvm use 20.19.0` si necessaire)
- **CocoaPods** (`sudo gem install cocoapods`)
- **Compte Apple Developer** (https://developer.apple.com)
- Un certificat de distribution et un profil de provisioning configures dans Xcode

## 1. Build web + Sync iOS

Depuis la racine du projet :

```bash
CAPACITOR_BUILD=true npm run build && npx cap sync ios
```

Cette commande :
- Build l'app React en mode production (avec les chemins relatifs pour Capacitor)
- Copie les fichiers web dans `ios/App/App/public/`
- Met a jour les pods iOS

## 2. Ouvrir le projet dans Xcode

```bash
open ios/App/App.xcworkspace
```

> **Important** : Toujours ouvrir le `.xcworkspace` (pas le `.xcodeproj`), sinon les pods ne seront pas inclus.

## 3. Configurer le Signing (premiere fois uniquement)

1. Dans Xcode, cliquer sur le projet **App** dans le navigateur de fichiers (icone bleue en haut a gauche)
2. Selectionner la target **App**
3. Aller dans l'onglet **Signing & Capabilities**
4. Cocher **Automatically manage signing**
5. Selectionner votre **Team** (compte Apple Developer)
6. Le **Bundle Identifier** doit etre : `com.athletica.sports`

## 4. Tester sur simulateur

1. En haut de Xcode, selectionner un simulateur (ex: iPhone 16, iPad Air)
2. Cliquer sur le bouton **Play** (triangle) ou **Cmd + R**
3. L'app se compile et se lance dans le simulateur

## 5. Mettre a jour la version

Avant chaque soumission sur l'App Store, incrementer le **Build Number** :

1. Dans Xcode, cliquer sur le projet **App** > target **App** > onglet **General**
2. Section **Identity** :
   - **Version** : numero de version visible par les utilisateurs (ex: `1.0`, `1.1`)
   - **Build** : incrementer a chaque upload (ex: `1`, `2`, `3`...)

> App Store Connect refuse un upload si le Build number est identique a un precedent.

## 6. Archiver l'app

1. En haut de Xcode, selectionner la destination **Any iOS Device (arm64)** (pas un simulateur)
2. Aller dans **Product** > **Archive** (ou **Cmd + Shift + B** puis **Product** > **Archive**)
3. Attendre que le build se termine (peut prendre quelques minutes)
4. La fenetre **Organizer** s'ouvre automatiquement avec l'archive

## 7. Soumettre sur App Store Connect

Depuis la fenetre **Organizer** (apres l'archive) :

1. Selectionner l'archive
2. Cliquer sur **Distribute App**
3. Selectionner **App Store Connect** > **Upload**
4. Suivre les etapes (laisser les options par defaut)
5. Cliquer **Upload**
6. Attendre la fin de l'upload

## 8. Publier depuis App Store Connect

1. Aller sur [App Store Connect](https://appstoreconnect.apple.com)
2. Selectionner **Athletica Sports**
3. Aller dans **Distribution** > **App iOS**

### TestFlight (test interne)

1. Aller dans l'onglet **TestFlight**
2. Le build apparait automatiquement apres l'upload (peut prendre 10-30 min de traitement)
3. Ajouter des testeurs internes ou creer un lien de test public
4. Les testeurs installent l'app via l'app TestFlight sur leur iPhone/iPad

### Production

1. Aller dans **Distribution** > **App iOS**
2. Cliquer sur le **+** a cote de "App iOS" ou editer la version en cours
3. Remplir les informations (captures d'ecran, description, mots-cles)
4. Dans la section **Build**, selectionner le build uploade
5. Cliquer **Enregistrer** puis **Soumettre pour examen**
6. Apple review prend generalement 24-48h

## Erreurs courantes

### "User Script Sandboxing" error
Dans Xcode : **Build Settings** > chercher "User Script Sandboxing" > mettre a **No**

### CocoaPods UTF-8 error
Ajouter dans votre terminal avant de lancer les commandes :
```bash
export LANG=en_US.UTF-8
```

### Crash au "Take a Photo" (camera)
Verifier que `ios/App/App/Info.plist` contient les permissions camera :
```xml
<key>NSCameraUsageDescription</key>
<string>We need access to your camera to take profile photos.</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>We need access to your photo library to select profile photos.</string>
```

### "platform has not been added yet"
Toujours chainer les commandes avec `&&` :
```bash
CAPACITOR_BUILD=true npm run build && npx cap sync ios
```
Ne pas les lancer separement.

### Archive fails - CFBundleShortVersionString
Le Podfile doit utiliser le linkage statique :
```ruby
use_frameworks! :linkage => :static
```
Puis relancer `pod install` dans `ios/App/`.

## Resume des commandes

```bash
# Build complet + sync
CAPACITOR_BUILD=true npm run build && npx cap sync ios

# Ouvrir Xcode
open ios/App/App.xcworkspace

# Si besoin de reinstaller les pods
cd ios/App && pod install && cd ../..
```
