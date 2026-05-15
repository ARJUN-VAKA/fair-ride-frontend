Write-Host "Building Fair Ride APK..." -ForegroundColor Cyan
npm run build
npx cap sync android
cd android
.\gradlew assembleDebug
Write-Host "Done! Your APK is at: android\app\build\outputs\apk\debug\app-debug.apk" -ForegroundColor Green
