# Android project README

This folder contains a generated Capacitor Android project for the Talib AI Studio app.

Important notes:
- The web assets are expected under frontend/dist. Run `npm run build` in the frontend before building the Android app.
- Do NOT commit sensitive keys or keystores. Use GitHub Actions or your local build process to generate a debug keystore.

Build locally:
1. Build frontend: cd frontend && npm install && npm run build
2. Copy web assets to android: npx cap copy android
3. Open Android Studio: npx cap open android
4. Build APK from Android Studio or via Gradle:
   ./gradlew assembleDebug

CI builds should generate a debug keystore at runtime and sign the APK accordingly.
