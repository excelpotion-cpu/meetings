Meetings (جلسات من) v1.0.0 - Offline Android WebView app
Package: ir.fileland.meetings
UI source: app/src/main/assets/index.html

Build: upload all files to a GitHub repo (keep the hidden .github folder) -> Actions -> Build APK -> Run workflow -> download artifact "meetings-apk".

Files you edit: app/src/main/assets/index.html (markup), style.css (look), app.js (logic).
fonts.css is generated (embedded font) - do not edit.
Version: change versionName in app/build.gradle only (the app reads it from there).
Signing: app/debug.keystore is a fixed key so each new build installs over the old one and keeps your data. Keep the GitHub repo PRIVATE.
