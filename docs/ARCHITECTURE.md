# System Architecture (React + TypeScript)

## 1. Technology Stack
- **Framework**: React 18 with Functional Components and Hooks
- **Language**: Strict TypeScript (`tsconfig.json`)
- **Build Tool**: Vite 5
- **Iconography**: Lucide React SVG Icons (Zero Emojis)
- **Audio Synthesis**: Native Web Audio API (`SoundEngine`)

## 2. Directory Structure
- `src/types/hardware.ts`: Core TypeScript interfaces for modules, key definitions, and batch logs.
- `src/data/`: Structured keymap matrices and display calibration patterns.
- `src/utils/`: Sound synthesis engine, CSV report generator, and telemetry formatters.
- `src/components/`: Modular React diagnostic views (`KeyboardTester`, `MouseTester`, `ScreenTester`, `AudioMediaTester`, `GamepadTester`, `BatchHistoryTable`, `Header`, `Navigation`, `PassBanner`).
- `src/styles/global.css`: Industrial dark theme stylesheet.
