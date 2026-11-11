# Changelog

All notable changes to the **Hardware Diagnostic Suite** project are documented in this file.

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
