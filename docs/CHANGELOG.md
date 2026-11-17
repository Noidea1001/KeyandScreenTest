# Changelog

All notable changes to the **Hardware Diagnostic Suite** project are documented in this file.

## [v2.4.0] - 2026-11-17
### Added
- **Batch Yield KPI Strip**: Added Total Units, PASS count, FAIL count, and Pass Rate % summary cards in `BatchHistoryTable`, plus search, PASS/FAIL filtering, defect logging, and 1-click **Copy Ticket Summary**.
- **Guided QA Checklist & Quick Defect Reporting**: Added `QAChecklistBar` with 7-module progress, 1-click **Next Untested** navigation, and inline **Report FAIL** for any active module.
- **Lazy-Loaded Diagnostic Modules**: Code-split secondary diagnostic tabs in `App.tsx` using `React.lazy` and `Suspense` to reduce initial bundle size.
- **Keyboard Enhancements**: Added `ANSI (104)` / `ISO (105 EU)` switcher, `PC / WIN` vs `macOS / CMD` keycap legends, press-to-release hold duration, active chord readout, **Clear Chatter**, and **Copy Key Log**.
- **Hardware & Media Additions**: Added Mouse 1-inch DPI estimator, Display `1x/2x/4x` motion speed + SMPTE color bars + 30 Hz RGB stuck-pixel exerciser, Gamepad dual-motor rumble + 2D stick drift plots, Audio discrete frequency rattle tester + mic/camera device switcher + webcam snapshot, and System CPU quick benchmark + storage quota + network/bus probe.
- **Expanded Test Coverage**: Added component tests for `MouseTester`, `ScreenTester`, `GamepadTester`, and `QAChecklistBar`.

## [v2.3.0] - 2026-11-13
### Added
- **Touchscreen & Stylus Tester**: Added `TouchTester` with a 24-cell (`6×4`) dead-zone swipe/tap grid, active/max simultaneous multi-touch tracking, stylus pressure & tilt telemetry, and auto-PASS.
- **System, GPU & Battery Telemetry**: Added `SystemInfoTester` for CPU threads, device memory, WebGL GPU vendor/renderer, display DPR/P3 color gamut, live Battery Status API, and manual PASS logging.
- **Printable / PDF QA Certificate**: Added `Print / PDF Certificate` button and `@media print` styling in `BatchHistoryTable`.
- **macOS Keycap Legend Mode**: Added `PC / WIN` vs `macOS / CMD` legend toggle (`CMD`, `OPT`, `RETURN`, `DELETE`) in `KeyboardTester`.
- **Live Microphone Loopback**: Added a `Loopback: ON/OFF` audio monitoring toggle in `AudioMediaTester`.
- **Component Unit Tests**: Added React Testing Library tests for `TouchTester`, `SystemInfoTester`, and `BatchHistoryTable`.

## [v2.2.0] - 2026-11-13
### Added
- **Offline PWA Support**: Configured `vite-plugin-pwa` with Workbox precaching and linked `public/manifest.json` in `index.html` for full offline diagnostic operation.
- **JSON Report Export**: Added structured JSON report export (`exportBatchHistoryJSON`) alongside CSV export in `BatchHistoryTable`.
- **Automated Testing & Linting**: Added Vitest (`npm test`) unit tests for key matching, layout target calculations, formatters, and report exports, plus ESLint 9 flat config (`npm run lint`) integrated into `.github/workflows/deploy.yml`.
- **Expanded Keyboard Layouts & Persistence**: Added 96%, Laptop, and 65% presets, 1-click modular section toggles (`INS/HOME/PGUP`, `PRTSC/SCRLK/PAUSE`, Numpad, Arrows, Fn), right-click single-key exclusion, and `localStorage` persistence for active tab, theme, and timer settings.
- **Multi-Host Deployment Configs**: Added GitHub Pages workflow, Vercel, Netlify, and Cloudflare Pages configs plus `docs/DEPLOYMENT.md`.

## [v2.1.0] - 2026-11-11
### Added
- **Theme Switcher (Dark Grey & Light Mode)**: Added instant theme switching in the top header with a neutral industrial Dark Grey default theme (`#141416` / `#18181b` / `#222226`) and a high-contrast Light theme.
- **Full-Width Precision Keycap Scaling**: Enlarged default keycap size to `58px` with a live **Key Scale** selector (`62px`, `58px`, `52px`, `46px`) and exact `15U` mathematical row alignment so all right-edge keys (`F12`, `BACKSPACE`, `\`, `ENTER`, `SHIFT`, `CTRL`) align flush.
- **Comprehensive English Documentation**: Expanded `README.md`, `docs/ARCHITECTURE.md`, and `docs/USER_GUIDE.md` with full architectural specifications, state machine diagrams, and mathematical layout formulas.

## [v2.0.0] - 2026-11-11
### Changed
- Migrated entire codebase to **React 18**, **TypeScript**, and **Vite**.
- Replaced all emojis with crisp `lucide-react` vector SVG icons.
- Implemented strict TypeScript interfaces across all hardware diagnostic modules.

## [v1.0.0] - 2026-11-11
### Added
- Initial release with Keyboard, Mouse, Display, Audio/Mic/Webcam, and Gamepad diagnostic modules, automatic `PASS` detection, batch logging, and 10-minute auto-reset timer.
