# SmartRental mobile apps

The Android and iOS projects package the existing React app with Capacitor. The UI is bundled in the app; Firebase data and remote images require an internet connection. Vercel continues hosting the web version separately.

- App name: SmartRental
- App ID: com.theiventhiramthanus.smartrental
- Web output: build

## Update native projects

Use Node.js 22 or newer:

```sh
npm install --legacy-peer-deps
npm run mobile:sync
```

After changing web code, sync again before compiling a mobile build. A Vercel deployment alone does not update an installed mobile app.

## Android

Open with `npm run mobile:android`. Use Android Studio with JDK 21 and the Android SDK required by android/variables.gradle. Build a debug APK for testing; create a signed release bundle with your own signing key before Play Store submission. Keep signing keys out of Git.

## iOS

Use a Mac with Xcode 26 or newer, then run `npm run mobile:ios`. Select your Apple development team in Signing & Capabilities and a simulator or connected iPhone. The project uses Swift Package Manager. Windows cannot compile or sign the iOS app.

## Validation before release

These are initial mobile projects, not store-reviewed releases. Test login, registration, bookings, staff/admin screens, maps and uploads on real devices. Google popup sign-in from the website needs a native authentication integration before it can be relied on in a mobile WebView. Test PDF downloads and external links as well; browser downloads may need native sharing/file handling. No native background GPS tracking, push notifications, store accounts, signing credentials or store submissions are configured by this conversion.

The existing Firebase backend and security rules remain in use. Review production access controls and demo accounts before distributing to customers.
