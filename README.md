# Hardware Diagnostic Suite

A professional, industrial-grade web application for testing and verifying computer peripherals and displays. Built with **React 18**, **TypeScript**, and **Vite**, this suite is engineered for hardware repair technicians, quality assurance (QA) benches, keyboard enthusiasts, and batch assembly verification workflows.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Key Features & Diagnostic Modules](#2-key-features--diagnostic-modules)
3. [How It Works: Auto-PASS & 10-Minute Auto-Reset Engine](#3-how-it-works-auto-pass--10-minute-auto-reset-engine)
4. [System Architecture](#4-system-architecture)
5. [Mathematical Keycap Geometry (15U Precision Layout)](#5-mathematical-keycap-geometry-15u-precision-layout)
6. [Theme Engine (Dark Grey & Light Mode)](#6-theme-engine-dark-grey--light-mode)
7. [Project Structure](#7-project-structure)
8. [Installation & Development](#8-installation--development)

---

## 1. Overview

Testing multiple keyboards, mice, monitors, or controllers in a high-volume environment requires a tool that is accurate, fast, and self-resetting. **Hardware Diagnostic Suite** consolidates five dedicated hardware test benches into a single interface with zero external runtime dependencies.

When a device completes 100% of its required diagnostic checks without hardware faults, the system automatically triggers a **PASS** state, logs the device into a session audit table, plays an acoustic confirmation chord, and initiates a configurable **Auto-Reset Countdown** (defaulted to **10 minutes**, with rapid presets down to **5 seconds**) so the workstation automatically resets for the next hardware unit.

---

## 2. Key Features & Diagnostic Modules

### 2.1. Keyboard Diagnostic (`KeyboardTester.tsx`)
- **Multi-Layout Support**:
  - **100% Full-Size ANSI (104 Keys)**: Alphanumeric block, 12 function keys, navigation cluster, and 17-key numpad.
  - **80% Tenkeyless / TKL (87 Keys)**: Standard layout without the numpad.
  - **75% Compact / Notebook (84 Keys)**: Compact layout excluding `ScrollLock`, `Pause`, and `Insert`.
  - **60% Compact Mechanical (61 Keys)**: Pure 61-key core alphanumeric and modifier block.
- **Adjustable Key Scale**: Real-time keycap scaling (**Extra Large 62px**, **Large Full-Width 58px**, **Medium 52px**, **Compact 46px**) so the virtual deck fills wide monitors clearly.
- **Switch Bounce / Chatter Detection**: Measures the high-resolution `performance.now()` delta between non-repeating `keydown` events on the same scan code. If a switch actuates twice within `< 28 ms`, it is flagged as **Switch Chatter** in amber.
- **N-Key Rollover (NKRO) & Anti-Ghosting**: Tracks simultaneous active scan codes and records the peak rollover count achieved during the test.
- **System Key Interception**: Captures `Tab`, `Alt`, `Meta/Win`, `ContextMenu`, `Space`, and `F1–F12` using `event.preventDefault()` to prevent focus loss during rapid testing, plus special handling for `PrintScreen` on `keyup`.

### 2.2. Mouse & Sensor Diagnostic (`MouseTester.tsx`)
- **5-Button Switch Verification**: Visualizes and counts actuations for Left Click (`button 0`), Middle Click (`button 1`), Right Click (`button 2`), Side Button 4 (`button 3`), and Side Button 5 (`button 4`).
- **Scroll Wheel Encoder Verification**: Tracks upward and downward wheel steps independently.
- **Microswitch Double-Click Fault Detector**: Measures millisecond intervals between consecutive clicks on the same switch. Intervals `< 42 ms` are flagged as mechanical bounce faults.
- **Polling Rate (Hz) & Hold-Drag Surface**: Samples pointer movement timestamps over a rolling 500 ms window to estimate USB polling frequency (`125 Hz`, `250 Hz`, `500 Hz`, `1000 Hz+`) and renders continuous green drag paths to detect intermittent switch drop-outs.

### 2.3. Display & Monitor Diagnostic (`ScreenTester.tsx`)
- **Dead & Stuck Subpixel Inspection**: Fullscreen cycle through 8 pure RGB and CMYK color fields (`#FF0000`, `#00FF00`, `#0000FF`, `#FFFFFF`, `#000000`, `#FFFF00`, `#00FFFF`, `#FF00FF`).
- **Backlight Bleed & Grey Uniformity**: Fullscreen `0%` black field for IPS glow inspection, plus `5%`, `15%`, and `50%` neutral grey fields to identify Dirty Screen Effect (DSE), clouding, or OLED image retention.
- **Color Gradient & Sharpness Grid**: Smooth RGB and luminance ramps to expose 6-bit/8-bit color banding alongside a 1-pixel alignment grid.
- **Real-Time VSync Refresh Rate & Motion Test**: Uses `requestAnimationFrame` cadence measurement to display live `Hz / FPS` alongside high-speed moving reference bars for ghosting and overdrive evaluation.

### 2.4. Audio, Microphone & Camera Diagnostic (`AudioMediaTester.tsx`)
- **Stereo Channel & Frequency Sweep Generator**: Synthesizes pure sine waves panned hard-left (`-1.0`), hard-right (`+1.0`), center stereo (`0.0`), and a logarithmic bass-to-treble sweep (`55 Hz` to `1200 Hz`) via the browser's native `AudioContext` and `StereoPannerNode`.
- **Microphone FFT Spectrum Visualizer**: Streams audio input into an `AnalyserNode` (`fftSize = 256`) to render a real-time 60 FPS frequency bar graph and normalized volume percentage.
- **Webcam Sensor Inspector**: Opens the video capture stream and reads native `videoWidth` and `videoHeight` hardware dimensions.

### 2.5. Controller & Axis Diagnostic (`GamepadTester.tsx`)
- Polls `navigator.getGamepads()` on every animation frame to display digital button actuation percentages and analog stick X/Y axis coordinates to 3 decimal places for center-drift detection.

### 2.6. Batch Audit Log & CSV Export (`BatchHistoryTable.tsx`)
- Records every verified unit with a sequential ID, module name, diagnostic telemetry summary, `PASS` badge, and timestamp, with one-click export to UTF-8 CSV.

---

## 3. How It Works: Auto-PASS & 10-Minute Auto-Reset Engine

```
+-----------------------------------------------------------------------+
|                        ACTIVE TESTING STATE                           |
|  User presses keys / clicks mouse / completes display verification.   |
|  Every interaction resets the 10-minute inactivity timer back to max. |
+-----------------------------------+-----------------------------------+
                                    |
                                    | 100% of target checks verified
                                    | AND 0 hardware faults detected
                                    v
+-----------------------------------------------------------------------+
|                         VERIFIED PASS STATE                           |
|  1. Prominent green PASS banner appears at the top of the workspace.  |
|  2. Web Audio API plays a 4-note ascending confirmation fanfare.      |
|  3. Verified counter increments (+1) and logs entry to Batch Table.   |
+-----------------------------------+-----------------------------------+
                                    |
                                    v
+-----------------------------------------------------------------------+
|                     AUTO-RESET COUNTDOWN STATE                        |
|  Master 1-second timer counts down from configured duration           |
|  (Default: 10 Minutes / 600s, configurable: 5s, 10s, 30s, 1m, 5m).    |
|  Tech can also click "Reset Now" or press ESC 3x for instant reset.   |
+-----------------------------------+-----------------------------------+
                                    |
                                    | Countdown reaches 00:00 (or manual reset)
                                    v
+-----------------------------------------------------------------------+
|                        CLEAN WORKSPACE RESET                          |
|  All module counters, key states, and fault flags reset to 0%.        |
|  Workstation is ready for the next hardware unit.                     |
+-----------------------------------------------------------------------+
```

---

## 4. System Architecture

The application follows a unidirectional React state architecture with strict TypeScript interfaces:

```
src/
├── main.tsx                     # React 18 root mount
├── App.tsx                      # Master state, theme controller, 10m timer & Triple-ESC listener
├── types/
│   └── hardware.ts              # Strict TypeScript contracts for modules, keys, and batch logs
├── data/
│   ├── keyboardLayouts.ts       # Keymap matrices & layout filter functions
│   └── screenPatterns.ts        # Fullscreen CSS color & gradient calibration definitions
├── utils/
│   ├── soundEngine.ts           # Web Audio API oscillator & stereo panner synthesizer
│   ├── csvExport.ts             # Blob/URI CSV report generator
│   └── formatters.ts            # Time formatting, GCD aspect ratio, and Hz classification
├── components/
│   ├── Header.tsx               # Global status bar, theme toggle, timer selector, reset controls
│   ├── Navigation.tsx           # Module tab bar with live PASS indicator dots
│   ├── PassBanner.tsx           # High-visibility PASS alert & auto-reset countdown bar
│   ├── KeyboardTester.tsx       # Keyboard deck renderer, NKRO tracker & chatter detector
│   ├── MouseTester.tsx          # Interactive mouse diagram, Hz counter & HTML5 drag canvas
│   ├── ScreenTester.tsx         # Display metrics, motion canvas & Fullscreen API controller
│   ├── AudioMediaTester.tsx     # Stereo generator, Mic FFT canvas & Webcam stream inspector
│   ├── GamepadTester.tsx        # Gamepad API polling loop & axis drift readout
│   └── BatchHistoryTable.tsx    # Session audit table & CSV export trigger
└── styles/
    └── global.css               # Dark Grey & Light theme variables + 15U keycap math
```

---

## 5. Mathematical Keycap Geometry (15U Precision Layout)

To ensure that all 6 rows of the main keyboard block align to an exact vertical right edge regardless of the selected key scale (`--u`), key widths are calculated dynamically in CSS using the unit multiplier $W$ and inter-key flex gap $G$ (`--gap`):

$$\text{Width}(W) = W \times U + (W - 1) \times G$$

- **Row 1 (Number Row)**: $13 \times 1\text{U} + 1 \times 2\text{U} = 15\text{U} + 14G$
- **Row 2 (QWERTY Row)**: $1 \times 1.5\text{U} + 12 \times 1\text{U} + 1 \times 1.5\text{U} = 15\text{U} + 14G$
- **Row 3 (Home Row)**: $1 \times 1.75\text{U} + 11 \times 1\text{U} + 1 \times 2.25\text{U} = 15\text{U} + 14G$
- **Row 4 (Shift Row)**: $1 \times 2.25\text{U} + 10 \times 1\text{U} + 1 \times 2.75\text{U} = 15\text{U} + 14G$
- **Row 5 (Modifier Row)**: $7 \times 1.25\text{U} + 1 \times 6.25\text{U} = 15\text{U} + 14G$

---

## 6. Theme Engine (Dark Grey & Light Mode)

The UI is powered by semantic CSS custom properties scoped to `[data-theme="dark"]` and `[data-theme="light"]` on the root `<html>` element:
- **Dark Grey Mode (Default)**: Neutral industrial charcoal palette (`#141416` primary background, `#18181b` keyboard chassis, `#222226` cards, `#27272c` keycaps) designed to minimize eye strain in dark QA rooms while providing high contrast for green (`PASS`) and amber (`Chatter`) indicators.
- **Light Mode**: High-clarity daylight palette (`#f1f2f4` primary background, `#e4e6eb` keyboard chassis, `#ffffff` cards and keycaps) togglable with a single click in the top header.

---

## 7. Project Structure

| File Path | Description |
| :--- | :--- |
| `index.html` | HTML5 entry point with Inter and JetBrains Mono font imports |
| `package.json` | Project dependencies (`react`, `react-dom`, `lucide-react`, `typescript`, `vite`) |
| `tsconfig.json` | Strict TypeScript compiler configuration |
| `src/App.tsx` | Top-level state machine, theme switcher, and master countdown timer |
| `src/components/*` | Modular React TypeScript diagnostic components |
| `docs/ARCHITECTURE.md` | Deep-dive technical specification and data flow documentation |
| `docs/USER_GUIDE.md` | Step-by-step operator manual for batch testing stations |
| `docs/CHANGELOG.md` | Version history and release notes |

---

## 8. Installation & Development

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Run Development Server
```bash
npm install
npm run dev
```

### Build for Production
```bash
npm run build
npm run preview
```
