import React, { useState, useEffect } from 'react';
import { Gamepad2, Check, Vibrate } from 'lucide-react';

interface GamepadTesterProps {
  isActive: boolean;
  onPass: (title: string, description: string) => void;
}

interface GamepadSnapshot {
  id: string;
  axes: number[];
  buttons: { pressed: boolean; value: number }[];
}

interface StickPlotProps {
  label: string;
  x: number;
  y: number;
}

const StickPlot: React.FC<StickPlotProps> = ({ label, x, y }) => {
  const driftPct = Math.round(Math.min(1, Math.hypot(x, y)) * 100);
  const cx = 50 + x * 40;
  const cy = 50 + y * 40;
  return (
    <div className="stick-plot-card">
      <svg viewBox="0 0 100 100" className="stick-svg" aria-label={label}>
        <circle cx="50" cy="50" r="44" className="stick-ring" />
        <line x1="50" y1="6" x2="50" y2="94" className="stick-crosshair" />
        <line x1="6" y1="50" x2="94" y2="50" className="stick-crosshair" />
        <circle cx={cx} cy={cy} r="6" className="stick-dot" />
      </svg>
      <div className="stick-label">
        {label} ({driftPct}% deflection)
      </div>
    </div>
  );
};

export const GamepadTester: React.FC<GamepadTesterProps> = ({ isActive, onPass }) => {
  const [padInfo, setPadInfo] = useState<GamepadSnapshot | null>(null);
  const [rumbleStatus, setRumbleStatus] = useState<string>('');

  useEffect(() => {
    if (!isActive) return;

    let animId = 0;
    const poll = () => {
      const pads = navigator.getGamepads ? navigator.getGamepads() : [];
      const activePad = pads[0] || pads[1] || pads[2] || pads[3];
      if (activePad) {
        setPadInfo({
          id: activePad.id,
          axes: [...activePad.axes],
          buttons: activePad.buttons.map((b) => ({
            pressed: b.pressed,
            value: b.value
          }))
        });
      } else {
        setPadInfo(null);
      }
      animId = requestAnimationFrame(poll);
    };

    animId = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(animId);
  }, [isActive]);

  const triggerRumbleTest = async () => {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    const activePad = pads[0] || pads[1] || pads[2] || pads[3];
    const actuator = activePad?.vibrationActuator as
      | { playEffect?: (type: string, params: Record<string, number>) => Promise<string> }
      | undefined;
    if (!actuator?.playEffect) {
      setRumbleStatus('Rumble API not supported on this controller/browser.');
      return;
    }
    try {
      await actuator.playEffect('dual-rumble', {
        startDelay: 0,
        duration: 450,
        weakMagnitude: 0.6,
        strongMagnitude: 0.9
      });
      setRumbleStatus('Dual-rumble pulse sent (450 ms).');
    } catch {
      setRumbleStatus('Rumble request failed or blocked.');
    }
  };

  return (
    <section className="module-panel active">
      <div className="diagnostic-card gamepad-panel">
        <div className="gamepad-header">
          <Gamepad2 size={28} className="text-blue" />
          <h3 className="card-title">Controller & Analog Axis Drift Diagnostic</h3>
          <p className="card-desc">
            Connect a USB or Bluetooth controller and press any button to inspect digital triggers, rumble motors, and analog stick center calibration.
          </p>
        </div>

        <div className="gamepad-status-box">
          {padInfo ? (
            <div>
              <strong className="text-green">Connected: {padInfo.id}</strong>
              <div className="axes-readout">
                Axes: {padInfo.axes.map((a, i) => `Axis ${i}: ${a.toFixed(3)}`).join(' | ')}
              </div>
              {rumbleStatus && <div className="axes-readout">{rumbleStatus}</div>}
            </div>
          ) : (
            <span>No controller detected — Connect controller and press any button.</span>
          )}
        </div>

        {padInfo && (
          <>
            <div className="stick-plots-row">
              <StickPlot
                label="Left Stick"
                x={padInfo.axes[0] ?? 0}
                y={padInfo.axes[1] ?? 0}
              />
              {padInfo.axes.length >= 4 && (
                <StickPlot
                  label="Right Stick"
                  x={padInfo.axes[2] ?? 0}
                  y={padInfo.axes[3] ?? 0}
                />
              )}
            </div>

            <div className="gamepad-buttons-grid">
              {padInfo.buttons.map((b, idx) => (
                <div
                  key={idx}
                  className={`key ${b.pressed ? 'active tested' : ''}`}
                  style={{ width: '62px', height: '48px' }}
                >
                  <span>B{idx}</span>
                  <span className="key-sub">{Math.round(b.value * 100)}%</span>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="card-actions">
          <button
            className="btn btn-secondary"
            onClick={() => void triggerRumbleTest()}
            disabled={!padInfo}
          >
            <Vibrate size={15} />
            <span>Test Dual-Motor Rumble</span>
          </button>
          <button
            className="btn btn-success"
            onClick={() =>
              onPass(
                'Controller Verified — PASS',
                padInfo
                  ? `Controller (${padInfo.id}) buttons and analog axes verified`
                  : 'Controller manual verification completed'
              )
            }
          >
            <Check size={15} />
            <span>Mark Controller Verified (PASS)</span>
          </button>
        </div>
      </div>
    </section>
  );
};
