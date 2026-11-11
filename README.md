# Hardware Diagnostic Suite (React + TypeScript)

Professional all-in-one hardware diagnostic and peripheral verification application built with **React 18**, **TypeScript**, and **Vite**. Designed for technicians, QC stations, and batch testing workflows.

## Core Modules

- **Keyboard Diagnostic**:
  - Supports 100% Full-Size ANSI (104 keys), 80% TKL (87 keys), 75% Compact (84 keys), and 60% Compact (61 keys).
  - Real-time N-Key Rollover (NKRO) and anti-ghosting counter.
  - Switch bounce / chatter detection (< 28ms interval).
- **Mouse & Sensor Diagnostic**:
  - 5-button actuation counter (Left, Right, Middle, Side B4, Side B5) and scroll wheel encoder verification.
  - Microswitch double-click fault detector (< 42ms interval).
  - Live Polling Rate (Hz) meter and continuous hold-drag sensor surface.
- **Display & Monitor Diagnostic**:
  - Full-screen 8-color dead/stuck subpixel inspection.
  - Backlight bleed (0% black) and grey uniformity (5%, 15%, 50%) patterns.
  - RGB/Luminance gradient ramp and subpixel alignment grid.
  - Real-time VSync refresh rate (Hz/FPS) and motion response test.
- **Audio, Microphone & Camera Diagnostic**:
  - Left, Right, Center Stereo, and Frequency Sweep synthesis via Web Audio API.
  - Real-time Microphone FFT spectrum analyzer and input level meter.
  - Webcam video stream and native resolution inspector.
- **Controller & Axis Diagnostic**:
  - Gamepad API digital trigger verification and analog stick drift readout.
- **Auto-PASS & 10-Minute Auto-Reset Engine**:
  - Automatically displays a prominent **PASS** banner when 100% of module checks complete.
  - Logs verified units into the session Batch Log (with CSV export) and starts a configurable auto-reset countdown (default **10 minutes**).

## Getting Started

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```
