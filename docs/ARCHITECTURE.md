# Technical Architecture Specification

## 1. Architectural Overview

**Hardware Diagnostic Suite** is a client-side Single Page Application (SPA) built with **React 18** and **TypeScript**. All hardware diagnostics execute directly in the browser using low-level Web APIs (`KeyboardEvent`, `MouseEvent`, `WheelEvent`, `Fullscreen API`, `Web Audio API`, `MediaDevices API`, `Canvas 2D API`, and `Gamepad API`) to guarantee zero network latency during real-time switch and sensor measurements.

---

## 2. State Management & Data Flow

### 2.1. Root Coordinator (`src/App.tsx`)
`App.tsx` serves as the central state coordinator and owns:
- `activeTab: ModuleTab` — Controls which diagnostic bench is mounted.
- `theme: ThemeMode` (`'dark' | 'light'`) — Synchronizes the `data-theme` attribute on `document.documentElement`.
- `resetDurationSec: number` — Configurable auto-reset interval (default `600` seconds = 10 minutes).
- `remainingSec: number` — Live countdown state decremented every 1,000 ms by a master `setInterval` clock.
- `resetSignal: number` — Monotonically increasing counter passed to child modules; incrementing `resetSignal` triggers an immediate state wipe inside the active diagnostic component.
- `passNotification: PassNotification | null` — Controls visibility and content of the top `PassBanner`.
- `batchHistory: BatchRecord[]` — Immutable session log of all hardware units that achieved `PASS` verification.

### 2.2. Event & Reset Lifecycle
1. **User Activity**: Every key press, mouse click, scroll step, or pattern verification invokes `onActivity()`, which resets `remainingSec` back to `resetDurationSec` (preventing premature reset while a technician is actively testing a device).
2. **Module Completion (`onPass`)**: When a child module verifies 100% of its target inputs with zero hardware faults:
   - A `hasTriggeredPassRef` guard ensures `onPass` fires exactly once per test cycle.
   - `soundEngine.playPassFanfare()` synthesizes a 4-note ascending triad (`C5 -> E5 -> G5 -> C6`).
   - `PassBanner` mounts at the top of the viewport displaying the live auto-reset countdown.
   - A new `BatchRecord` is prepended to `batchHistory`.
3. **Automatic or Manual Reset**:
   - When `remainingSec` reaches `0`, or when the operator clicks **Reset Now** / presses `ESC` three times within `900 ms`, `triggerInstantReset()` clears `passNotification` and increments `resetSignal`, restoring the active module to `0%`.

---

## 3. Subsystem Implementation Details

### 3.1. Keyboard Switch Chatter & NKRO Engine (`KeyboardTester.tsx`)
- **Scan Code Mapping**: Uses `KeyboardEvent.code` (physical key position, e.g., `KeyA`, `ShiftLeft`, `NumpadEnter`) rather than `KeyboardEvent.key` so international keyboard layouts and Shift states do not affect physical switch verification.
- **Chatter Algorithm**:
  - Ignores OS auto-repeat events (`e.repeat === true`).
  - Records `performance.now()` timestamp $t_{\text{now}}$ on each distinct `keydown` per scan code.
  - Computes $\Delta t = t_{\text{now}} - t_{\text{prev}}$. If $2\text{ ms} < \Delta t < 28\text{ ms}$, the switch is flagged in `chatterCodes` as exhibiting mechanical contact bounce.

### 3.2. Mouse Polling Rate & Microswitch Fault Detector (`MouseTester.tsx`)
- **Polling Rate Estimation**:
  - Stores `mousemove` timestamps in a rolling buffer filtered to the last `500 ms`.
  - Computes estimated frequency as $f = \text{count}_{500\text{ms}} \times 2\text{ Hz}$ and tracks the session peak frequency.
- **Double-Click Bounce Detection**:
  - Measures $\Delta t$ between consecutive `mousedown` events per button index (`0..4`).
  - If $\Delta t < 42\text{ ms}$, `doubleClickFaults` increments and blocks automatic `PASS` certification.

### 3.3. Display VSync & Calibration Engine (`ScreenTester.tsx`)
- Uses `requestAnimationFrame` delta accumulation over `1000 ms` windows to compute real-time display refresh rate (`Hz / FPS`) while rendering dual high-contrast vertical reference bars on an HTML5 `<canvas>` for visual motion-blur inspection.

### 3.4. Web Audio Synthesizer (`src/utils/soundEngine.ts`)
- Generates all acoustic feedback procedurally without external MP3/WAV assets:
  - **Key Click**: Short `35 ms` exponential frequency ramp (`520 Hz -> 140 Hz` for first actuation, `380 Hz -> 140 Hz` for subsequent actuations).
  - **Channel Isolation**: Routes oscillator output through a `StereoPannerNode` (`pan = -1` for Left, `pan = +1` for Right, `pan = 0` for Center).
