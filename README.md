# MonoJot
> **The Radical Single-Thought Scratchpad for Android**  
> *Inspired by the digital minimalist philosophy of [Mononote](https://www.digitalminimalist.com/tools/mononote).*

[![GitHub Release](https://img.shields.io/github/v/release/NxAdx/monojot?color=111113&style=flat-square)](https://github.com/NxAdx/monojot/releases)
[![Build Status](https://img.shields.io/github/actions/workflow/status/NxAdx/monojot/android-build.yml?branch=main&style=flat-square)](https://github.com/NxAdx/monojot/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-black.svg?style=flat-square)](LICENSE)
[![Platform: Android](https://img.shields.io/badge/Platform-Android-3DDC84.svg?style=flat-square&logo=android&logoColor=white)](https://github.com/NxAdx/monojot/releases)
[![100% Offline](https://img.shields.io/badge/Privacy-100%25%20Offline-blue.svg?style=flat-square)](https://github.com/NxAdx/monojot)

---

## What is MonoJot?

Most note-taking apps have become cluttered digital junk drawers — endless folders, hierarchical tags, rich-text toolbars, and forgotten backlogs. 

**MonoJot is the intentional antidote.**

Built for radical single-thought focus, MonoJot holds **exactly one active thought** at any given moment. Capture what matters right now, keep it visible in your peripheral awareness on your Lock Screen, and tap the tactile **Done** pill the moment it's finished.

---

## Key Features

### 1. Zero-Second Cold Boot
* Launches directly into an active, focused keyboard.
* No splash screens, no dashboards, no folder trees, no note titles.
* Dynamic typography scaling: generous text size for short reminders that gracefully scales down for longer notes.

### 2. Ambient Lock Screen Glance (Live Activity)
* Mirrors your active thought directly to your Android Lock Screen and notification shade.
* High-priority ongoing card (`PRIORITY_MAX`, `VISIBILITY_PUBLIC`) that stays pinned without being accidentally dismissed.
* **1-Tap Done on Lock Screen**: Tap the interactive `[Done]` action on your lock screen card to archive the note immediately without unlocking your phone.
* Functional live activity ring (`◎`) inside the card allows instant 1-tap pausing or resuming of the lock screen glance.

### 3. The Tactile "Done" Pill
* Permanently anchored right above your virtual keyboard (`softwareKeyboardLayoutMode: resize`).
* High-contrast hardware squircle capsule (`borderRadius: 26`, `borderCurve: 'continuous'`).
* Affirmative haptic feedback tick upon completion (`expo-haptics`).

### 4. Minimalist Archive Vault
* Tap the discreet `•••` options trigger to access your past completed thoughts.
* Clean, distraction-free cards with tabular timestamps (`11:39 AM · 8 Nov`).
* 1-tap card interaction to restore any archived note back to the active canvas.
* Discreet trash action to permanently delete notes without clutter.

### 5. Anti-Slop Design Invariants
* **Hardware Squircles**: Continuous curvature on all cards, buttons, and sheets.
* **Dual-Mode Perfection**:
  * **Light Theme**: Soft warm paper off-white (`#F6F6F8`) with razor-sharp vector borders (`#E0E0E6`) and zero blurry shadow halos.
  * **Dark Theme**: Pure pitch OLED black (`#000000`) paired with Apple-grade dark elevated cards (`#1C1C1E`).
* **Tabular Numerals**: Clean monospaced alignment for all dates and counts (`fontVariant: ['tabular-nums']`).
* **Zero Accounts, Zero Ads, Zero Telemetry**: 100% offline with zero cloud requirements or trackers.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [React Native 0.74.5](https://reactnative.dev/) & [Expo SDK 51](https://expo.dev/) (New Architecture) |
| **Routing** | [Expo Router v3.5](https://docs.expo.dev/router/introduction/) |
| **Storage** | [expo-sqlite v14](https://docs.expo.dev/versions/latest/sdk/sqlite/) (Synchronous zero-lag SQLite) |
| **Glance Engine** | [expo-notifications](https://docs.expo.dev/versions/latest/sdk/notifications/) (High-priority lock screen channel) |
| **List Performance** | [@shopify/flash-list](https://shopify.github.io/flash-list/) (Recycled view cell recycling) |
| **State Management** | [Zustand](https://github.com/pmndrs/zustand) |
| **Haptics** | [expo-haptics](https://docs.expo.dev/versions/latest/sdk/haptics/) |
| **CI/CD** | GitHub Actions (Gradle-cached automated dual AAB & APK builds) |

---

## Installation & Builds

You can download the latest standalone release APK directly from our [GitHub Releases](https://github.com/NxAdx/monojot/releases) page.

### Building from Source

```bash
# 1. Clone the repository
git clone https://github.com/NxAdx/monojot.git
cd monojot

# 2. Install dependencies
npm install

# 3. Typecheck
npm run typecheck

# 4. Generate Android native code
npx expo prebuild --platform android --clean

# 5. Build release APK locally
cd android
./gradlew assembleRelease --no-daemon
```

---

## License

MonoJot is open-source software licensed under the [MIT License](LICENSE).

Developed with precision by [Aadarsh Lokhande (`NxAdx`)](https://github.com/NxAdx).
Part of the **NxAdx Production Ecosystem**.
