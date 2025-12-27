<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1F6WT3KlbS_Vg1C-cgIiYn1GWVCjvnH7n

## Native iOS (SwiftUI)

This repo also includes a full native iOS rewrite in `ios-native/` using SwiftUI and AVFoundation motion analysis.

**Prerequisites:** Xcode 15+, xcodegen (`brew install xcodegen`)

1. Generate the Xcode project:
   `cd ios-native && xcodegen generate`
2. Open in Xcode:
   `open SpeedTracker.xcodeproj`
3. Select your Team in Signing & Capabilities and run on your iPhone.

Camera permission is already set via `NSCameraUsageDescription`.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
