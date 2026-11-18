# MPro AI – voice-to-voice Gemini Live assistant
Run: `npm install && npm run dev` (open on HTTPS/localhost for mic). Tap ⚙️ and paste your Gemini API key.
## Build the APK
**Option A (no setup):** push this folder to GitHub, run the "Build APK" workflow, download `MPro-AI-apk`.
**Option B (Android Studio):** `npm install && npm run build && npx cap add android && node scripts_patch.mjs && npx cap sync android && npx cap open android` then Build > Build APK.
Notes: the key is stored on-device only (localStorage). Wake word uses browser SpeechRecognition (works in Chrome; unreliable in Android WebView, so tap the mic there).
