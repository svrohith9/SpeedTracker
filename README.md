<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# SpeedTracker

SpeedTracker is a camera‑based motion analysis app that estimates object speed from live video. It includes a native SwiftUI iOS app with on‑device motion analysis and object detection, plus the original web prototype.

## Usage and permissions

This repository and its contents are **proprietary**. You may not use, copy, modify, distribute, or deploy this software without explicit written permission from the owner.

## Repository standards

- SwiftUI native iOS app lives in `ios-native/`
- Web prototype lives at the repo root
- CI builds native iOS on macOS via GitHub Actions

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
