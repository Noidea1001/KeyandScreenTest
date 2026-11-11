import React, { useState, useEffect } from 'react';
import { Gamepad2, Check } from 'lucide-react';

interface GamepadTesterProps {
  isActive: boolean;
  onPass: (title: string, description: string) => void;
}

interface GamepadSnapshot {
  id: string;
  axes: number[];
  buttons: { pressed: boolean; value: number }[];
}

export const GamepadTester: React.FC<GamepadTesterProps> = ({ isActive, onPass }) => {
  const [padInfo, setPadInfo] = useState<GamepadSnapshot | null>(null);

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

  return (
    <section className="module-panel active">
      <div className="diagnostic-card gamepad-panel">
        <div className="gamepad-header">
          <Gamepad2 size={28} className="text-blue" />
          <h3 className="card-title">Controller & Analog Axis Drift Diagnostic</h3>
          <p className="card-desc">
            Connect a USB or Bluetooth controller and press any button to inspect digital triggers and analog stick center calibration.
          </p>
        </div>

        <div className="gamepad-status-box">
          {padInfo ? (
            <div>
              <strong className="text-green">Connected: {padInfo.id}</strong>
              <div className="axes-readout">
                Axes: {padInfo.axes.map((a, i) => `Axis ${i}: ${a.toFixed(3)}`).join(' | ')}
              </div>
            </div>
          ) : (
            <span>No controller detected — Connect controller and press any button.</span>
          )}
        </div>

        {padInfo && (
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
        )}

        <div>
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
