# Operator User Guide — Hardware Diagnostic Suite

This guide covers standard operating procedures for testing keyboards, mice, monitors, audio peripherals, webcams, and controllers using the **Hardware Diagnostic Suite**.

---

## 1. Global Workstation Controls (Top Header)

- **Verified (PASS) Counter**: Displays the total number of hardware units that have passed verification during the current session.
- **Auto-Reset Interval Selector**:
  - **10 Minutes (Default)**: Automatically resets the test bench 10 minutes after a unit passes or after 10 minutes of inactivity.
  - **Fast Batch Presets (5s, 10s, 30s, 1m, 5m)**: Ideal for high-volume assembly lines where technicians swap keyboards or mice every few seconds.
- **Theme Switcher (`Light Mode` / `Dark Grey`)**: Toggles the workspace between the default **Dark Grey** industrial palette and **Light Mode**.
- **Audio Toggle (`Audio: ON / OFF`)**: Enables or mutes mechanical switch click feedback and the `PASS` confirmation chime.
- **Reset Now Button (or `ESC` 3x)**: Immediately clears the current test module so you can begin testing the next device.

---

## 2. Keyboard Diagnostic Procedure

1. Select the **Keyboard Diagnostic** tab.
2. Choose the physical **Form Factor** matching the unit under test:
   - `100% Full-Size ANSI (104 Keys)`
   - `80% Tenkeyless — TKL (87 Keys)`
   - `75% Compact / Notebook (84 Keys)`
   - `60% Compact Mechanical (61 Keys)`
3. Adjust **Key Scale** (`Extra Large 62px`, `Large Full-Width 58px`, `Medium 52px`, or `Compact 46px`) to fit your monitor comfortably.
4. Actuate every key across the keyboard:
   - **Blue**: Key is currently held down.
   - **Green**: Key actuated and verified healthy.
   - **Amber**: Key exhibited switch chatter/bounce (`< 28 ms` double actuation).
5. When 100% of keys in the active layout turn green, the **PASS** banner appears automatically and the unit is logged in the **Batch Log**.

---

## 3. Mouse & Sensor Diagnostic Procedure

1. Select the **Mouse & Sensor** tab.
2. Select either **Standard 3-Button + Scroll Wheel (5 Checks)** or **5-Button Gaming Mouse + Scroll Wheel (7 Checks)**.
3. Inside the interactive diagram or tracking surface:
   - Click **Left**, **Middle**, and **Right** mouse buttons (plus **B4** and **B5** if testing a 5-button mouse).
   - Scroll the wheel both **Up** and **Down**.
4. Move the mouse rapidly across the right-hand canvas to verify **Polling Rate (Hz)** and hold-drag across the canvas to verify continuous microswitch contact.
5. Once all required inputs are verified with `0` bounce faults, the **PASS** banner triggers automatically.

---

## 4. Display & Monitor Diagnostic Procedure

1. Select the **Display & Monitor** tab.
2. Complete each of the four inspection cards:
   - **Step 1 (Dead & Stuck Pixels)**: Click **Launch Fullscreen Pattern** and press `SPACE` or click to cycle through all 8 solid color fields. Click **Confirm Zero Defect Pixels** when done.
   - **Step 2 (Backlight Bleed & Uniformity)**: Launch the black and grey uniformity patterns to inspect for edge bleed or clouding, then click **Confirm Uniformity OK**.
   - **Step 3 (Gradient & Sharpness)**: Inspect the RGB ramp and alignment grid, then click **Confirm Gradient & Sharpness**.
   - **Step 4 (Motion Response)**: Observe the moving reference bars and live `Hz / FPS` readout, then click **Confirm Motion Stability**.
3. Confirming all 4 steps triggers the **PASS** state.

---

## 5. Exporting Batch Reports

1. Open the **Batch Log** tab to review all devices verified during the session.
2. Click **Export CSV Report** to download a timestamped `.csv` spreadsheet compatible with Microsoft Excel and Google Sheets.
