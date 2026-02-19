# Build & Deploy - Athletica Sports Android

## Prerequis

- Node.js
- Android SDK (`~/Library/Android/sdk`)
- Le fichier `eas-upload.keystore` dans `android/app/`

## Build de l'AAB

```bash
# 1. Build web avec Capacitor + Sync avec Android

CAPACITOR_BUILD=true npm run build && npx cap sync android

# 3. Build l'AAB signe
cd android && ./gradlew bundleRelease && cd ..
```

Le fichier AAB se trouve dans :
```
android/app/build/outputs/bundle/release/app-release.aab
```

## Mise a jour du versionCode

Avant chaque nouveau deploy, incrementer le `versionCode` dans `android/app/build.gradle` :

```gradle
defaultConfig {
    versionCode 11    // incrementer a chaque release
    versionName "1.0.3"
}
```

## Upload sur Google Play Console

1. Aller sur [Google Play Console](https://play.google.com/console)
2. Selectionner **Athletica Sports** (`com.athletica.sports`)
3. Aller dans **Release** > **Production** (ou **Tests internes** pour tester)
4. Cliquer **Creer une release**
5. Uploader le fichier `app-release.aab`
6. Ajouter des notes de version
7. Cliquer **Examiner la release** puis **Deployer**

### Test interne

Pour tester avant la production :
1. Aller dans **Tests** > **Tests internes**
2. Creer une release et uploader l'AAB
3. Partager le **lien de test** aux testeurs
4. Pas besoin de review Google pour les tests internes
