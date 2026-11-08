# AGENTS.md - MonoJot
> **Antigravity Agent Memory & Engineering Directive**  
> *Project*: MonoJot (`NxAdx/monojot`)  
> *Lead Developer*: Aadarsh Lokhande (`NxAdx`)  
> *Target Distribution*: Google Play Store (`app.monojot`) & Direct GitHub Releases  
> *Current Version*: **v1.0.0** (Android Version Code: `1`)  
> *Core Stack*: React Native 0.74+ | Expo SDK 51/52 (New Architecture) | SQLite | Native Kotlin Glance Module

---

## 0. Global Production Ecosystem & Master Controller
This project is part of the **Aadarsh Lokhande (`NxAdx`) Production Ecosystem** managed centrally from `D:\Production\`:
* **Master Controller**: `D:\Production\` (Root orchestration hub)
* **Master Architecture & Playbooks**:
  * `D:\Production\USER_COMMAND_CENTER.md`: Developer operating manual & quick reference
  * `D:\Production\DEVELOPER_PLAYBOOK.md`: 9-section master architecture and deployment guide
  * `D:\Production\docs\SENIOR_VIBE_CODING_PLAYBOOK.md`: High-velocity engineering standards & AI pair-programming rules
  * `D:\Production\docs\REVERSE_ENGINEERING_PLAYBOOK.md`: Decompilation workflows & APK analysis
* **Sister Projects in Ecosystem**:
  * **`monojot`** (`D:\Production\monojot`): v1.0.0 | Radical minimalist scratchpad with lock screen glance notification & quick settings tile
  * **`saral-lekhan-plus`** (`D:\Production\saral-lekhan-plus`): v2.19.32 | Offline powerhouse note-taking & rich text writing engine
  * **`De-Launcher`** (`D:\Production\De-Launcher`): v1.0.0 | Intentional minimal launcher with Kotlin native module
  * **`Product-ive`** (`D:\Production\Product-ive`): v1.3.3 | Android Home Widgets & productivity tracker
  * **`rea`** (`D:\Production\rea`): Reverse Engineer Anything engine & reference APK repository (`apks/`)

---

## 1. Product Philosophy & Non-Negotiables
MonoJot is an intentional, brutalist-minimalist scratchpad built for **single-thought focus** and **lock screen glance**:
1. **Zero-Second Cold Boot**: Opening the app jumps straight into an active keyboard. No splash delay, no folder picking, no titles.
2. **One Active Thought**: The primary canvas hosts only 1 active thought/task. Tapping the tactile **Done** pill marks it complete and archives it with smooth haptics.
3. **Lock Screen Glance Engine**: Persistent Android notification (`setOngoing(true)`, `PRIORITY_MAX`) with 1-tap `[Done]`, `[Copy]`, and `[Edit]` actions.
4. **Quick Settings Tile**: Pull down the Android status bar and tap "Quick Jot" to write down thoughts from any app.
5. **Anti-Slop Design Invariants**:
   - Hardware squircles on all buttons and cards: `borderCurve: 'continuous'`.
   - Tabular numerals: `fontVariant: ['tabular-nums']`.
   - Dual-mode perfection: Warm paper off-white (`#F6F6F8`) in light mode; pure OLED black (`#000000`) in dark mode.
6. **100% Offline & Private**: Zero accounts, zero ads, zero telemetry, no `INTERNET` permission in manifest.

---

## 2. Directory Layout
* `src/app/`: Expo Router screens (`index.tsx` for main scratchpad, `history.tsx` for archived notes, `settings.tsx`).
* `src/services/`: `glanceService.ts` native notification bridge, `storageService.ts`.
* `src/store/`: Zustand stores (`jotStore.ts`, `themeStore.ts`).
* `src/tokens.ts`: Minimalist monochrome & warm paper design tokens.
* `android/`: Native Android module with `GlanceNotificationModule.kt` and `QuickJotTileService.kt`.
* `context/`: 8-file modular developer context & architecture memory.
* `docs/`: Product Requirements Document (`PRD.md`) & `TASKS.md`.

---

## 3. Security & Git Offline Invariants
> [!CAUTION]
> The following directories are strictly offline and must **NEVER** be tracked or pushed to Git:
> * `docs/` (PRD, task lists, specifications)
> * `context/` (modular agent context memory)
> * `.agents/` (rules and skills)
> * Keystores (`*.keystore`, `*.jks`, `keystore_base64.txt`)
> * `google-services.json`

