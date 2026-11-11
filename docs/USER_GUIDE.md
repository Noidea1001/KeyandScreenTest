# User Guide — Hardware Diagnostic Suite

## 1. Batch Keyboard Verification
1. Select the keyboard form factor (**100% Full-Size**, **80% TKL**, **75% Compact**, or **60% Compact**).
2. Press every key across the keyboard:
   - Verified keys highlight in green.
   - Keys exhibiting switch bounce (< 28ms between actuations) highlight in amber.
3. Upon reaching 100% key verification:
   - The **PASS** banner is displayed automatically and the session counter increments.
   - The **Auto-Reset Timer** (default 10 minutes, configurable from 5 seconds to 10 minutes) begins counting down to reset the board for the next unit.
   - Click **Reset Now** or press `ESC` three times to reset immediately.

## 2. Mouse & Sensor Verification
1. Open the **Mouse & Sensor** module.
2. Actuate Left Click, Right Click, Middle Click, and scroll both Up and Down.
3. Move and drag across the tracking canvas to measure Polling Rate (Hz) and verify hold-drag continuity.

## 3. Display & Monitor Verification
1. Open the **Display & Monitor** module.
2. Launch fullscreen patterns for Dead Pixel, Backlight Uniformity, and Color Gradient checks.
3. Confirm each of the 4 inspection steps to record a **PASS** result.
