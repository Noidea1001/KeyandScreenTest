import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mouse,
  Activity,
  MousePointerClick,
  ShieldCheck,
  ShieldAlert,
  RotateCcw,
  Eraser
} from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';
import { classifyMousePollingRate } from '../utils/formatters';

interface MouseTesterProps {
  isActive: boolean;
  resetSignal: number;
  onActivity: () => void;
  onPass: (title: string, description: string) => void;
}

export const MouseTester: React.FC<MouseTesterProps> = ({
  isActive,
  resetSignal,
  onActivity,
  onPass
}) => {
  const [targetMode, setTargetMode] = useState<5 | 7>(5);
  const [testedActions, setTestedActions] = useState<Set<string>>(new Set());
  const [activeButtons, setActiveButtons] = useState<Set<number>>(new Set());
  const [btnCounts, setBtnCounts] = useState<Record<number, number>>({
    0: 0,
    1: 0,
    2: 0,
    3: 0,
    4: 0
  });
  const [scrollUpCount, setScrollUpCount] = useState(0);
  const [scrollDownCount, setScrollDownCount] = useState(0);
  const [currentHz, setCurrentHz] = useState(0);
  const [peakHz, setPeakHz] = useState(0);
  const [minDeltaMs, setMinDeltaMs] = useState<number | null>(null);
  const [doubleClickFaults, setDoubleClickFaults] = useState(0);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [dragDistance, setDragDistance] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastClickTimeRef = useRef<Record<number, number>>({});
  const moveTimesRef = useRef<number[]>([]);
  const isDraggingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const hasTriggeredPassRef = useRef(false);

  const drawGrid = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  }, []);

  const resetMouseState = useCallback(() => {
    setTestedActions(new Set());
    setActiveButtons(new Set());
    setBtnCounts({ 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 });
    setScrollUpCount(0);
    setScrollDownCount(0);
    setCurrentHz(0);
    setPeakHz(0);
    setMinDeltaMs(null);
    setDoubleClickFaults(0);
    setDragDistance(0);
    lastClickTimeRef.current = {};
    moveTimesRef.current = [];
    hasTriggeredPassRef.current = false;
    drawGrid();
  }, [drawGrid]);

  useEffect(() => {
    resetMouseState();
  }, [resetSignal, targetMode, resetMouseState]);

  const registerMouseButton = (button: number) => {
    if (button < 0 || button > 4) return;
    onActivity();
    soundEngine.playKeyClick(false);

    const now = performance.now();
    const prev = lastClickTimeRef.current[button];
    if (prev !== undefined) {
      const delta = Math.round(now - prev);
      setMinDeltaMs((curr) => (curr === null || delta < curr ? delta : curr));
      if (delta < 42) {
        setDoubleClickFaults((f) => f + 1);
      }
    }
    lastClickTimeRef.current[button] = now;

    setBtnCounts((prevCounts) => ({
      ...prevCounts,
      [button]: (prevCounts[button] || 0) + 1
    }));

    setActiveButtons((prevSet) => new Set(prevSet).add(button));
    setTestedActions((prevSet) => new Set(prevSet).add(`btn-${button}`));
  };

  useEffect(() => {
    if (!isActive) return;

    const onMouseUp = (e: MouseEvent) => {
      setActiveButtons((prev) => {
        const next = new Set(prev);
        next.delete(e.button);
        return next;
      });
      isDraggingRef.current = false;
      lastPosRef.current = null;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      onActivity();
      if (e.deltaY < 0) {
        setScrollUpCount((c) => c + 1);
        setTestedActions((prev) => new Set(prev).add('scroll-up'));
      } else if (e.deltaY > 0) {
        setScrollDownCount((c) => c + 1);
        setTestedActions((prev) => new Set(prev).add('scroll-down'));
      }
    };

    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('wheel', onWheel);
    };
  }, [isActive, onActivity]);

  const requiredKeys =
    targetMode === 7
      ? ['btn-0', 'btn-1', 'btn-2', 'btn-3', 'btn-4', 'scroll-up', 'scroll-down']
      : ['btn-0', 'btn-1', 'btn-2', 'scroll-up', 'scroll-down'];

  const completedCount = requiredKeys.filter((k) => testedActions.has(k)).length;

  useEffect(() => {
    if (
      completedCount === requiredKeys.length &&
      doubleClickFaults === 0 &&
      !hasTriggeredPassRef.current
    ) {
      hasTriggeredPassRef.current = true;
      onPass(
        `Mouse Verified — PASS (${requiredKeys.length}/${requiredKeys.length} Inputs)`,
        `All switches and encoder directions verified | Peak Rate: ${peakHz} Hz | Double-Click Faults: 0`
      );
    }
  }, [completedCount, requiredKeys.length, doubleClickFaults, peakHz, onPass]);

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const now = performance.now();
    moveTimesRef.current.push(now);
    moveTimesRef.current = moveTimesRef.current.filter((t) => now - t <= 500);
    const hz = Math.round(moveTimesRef.current.length * 2);
    setCurrentHz(hz);
    setPeakHz((p) => Math.max(p, hz));

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    setCoords({ x: Math.round(x), y: Math.round(y) });

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (isDraggingRef.current && lastPosRef.current) {
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
      ctx.lineTo(x, y);
      ctx.stroke();

      const dist = Math.hypot(x - lastPosRef.current.x, y - lastPosRef.current.y);
      setDragDistance((d) => Math.round(d + dist));
      lastPosRef.current = { x, y };
    } else {
      ctx.fillStyle = 'rgba(59, 130, 246, 0.65)';
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const totalClicks = Object.values(btnCounts).reduce((a, b) => a + b, 0);

  return (
    <section className="module-panel active">
      <div className="stats-bar">
        <div className="stat-card">
          <div className="stat-label">
            <span>Verified Inputs</span>
            <Mouse size={15} />
          </div>
          <div className="stat-value">
            {completedCount} / {requiredKeys.length}
          </div>
          <div className="stat-sub">Buttons & wheel encoder directions</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            <span>Sensor Polling Rate</span>
            <Activity size={15} />
          </div>
          <div className="stat-value">{currentHz} Hz</div>
          <div className="stat-sub">
            Peak: {peakHz} Hz ({classifyMousePollingRate(peakHz)})
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            <span>Total Actuations</span>
            <MousePointerClick size={15} />
          </div>
          <div className="stat-value">{totalClicks}</div>
          <div className="stat-sub">
            Wheel Steps: {scrollUpCount + scrollDownCount}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            <span>Microswitch Health</span>
            {doubleClickFaults > 0 ? (
              <ShieldAlert size={15} />
            ) : (
              <ShieldCheck size={15} />
            )}
          </div>
          <div
            className="stat-value"
            style={{
              color:
                doubleClickFaults > 0 ? 'var(--accent-red)' : 'var(--accent-green)'
            }}
          >
            {doubleClickFaults > 0
              ? `${doubleClickFaults} Bounce Faults`
              : 'Healthy (0 Faults)'}
          </div>
          <div className="stat-sub">
            Shortest click interval: {minDeltaMs !== null ? `${minDeltaMs} ms` : '—'}
          </div>
        </div>
      </div>

      <div className="toolbar-row">
        <div className="toolbar-group">
          <label className="toolbar-label">Target Mouse Configuration:</label>
          <select
            className="btn select-input"
            value={targetMode}
            onChange={(e) => setTargetMode(Number(e.target.value) as 5 | 7)}
          >
            <option value={5}>Standard 3-Button + Scroll Wheel (5 Checks)</option>
            <option value={7}>5-Button Gaming Mouse + Scroll Wheel (7 Checks)</option>
          </select>
          <button className="btn" onClick={resetMouseState}>
            <RotateCcw size={14} />
            <span>Reset Mouse Test</span>
          </button>
        </div>

        <div className="toolbar-hint">
          Click all buttons and scroll both UP and DOWN inside the test area to trigger PASS.
        </div>
      </div>

      <div className="mouse-grid">
        <div
          className="mouse-visual-card"
          onMouseDown={(e) => {
            e.preventDefault();
            registerMouseButton(e.button);
          }}
          onContextMenu={(e) => e.preventDefault()}
        >
          <h3 className="card-subtitle">Interactive Switch Diagram</h3>
          <div className="mouse-body">
            <div
              className={`mouse-btn left-btn ${
                activeButtons.has(0) ? 'active' : ''
              } ${testedActions.has('btn-0') ? 'tested' : ''}`}
            >
              L-CLICK
              <br />
              <span>{btnCounts[0]}</span>
            </div>

            <div
              className={`mouse-btn middle-btn ${
                activeButtons.has(1) ? 'active' : ''
              } ${testedActions.has('btn-1') ? 'tested' : ''}`}
            >
              M
              <br />
              <span>{btnCounts[1]}</span>
            </div>

            <div
              className={`mouse-btn right-btn ${
                activeButtons.has(2) ? 'active' : ''
              } ${testedActions.has('btn-2') ? 'tested' : ''}`}
            >
              R-CLICK
              <br />
              <span>{btnCounts[2]}</span>
            </div>

            <div
              className={`mouse-btn side-btn-5 ${
                activeButtons.has(4) ? 'active' : ''
              } ${testedActions.has('btn-4') ? 'tested' : ''}`}
              title="Side Button 5 (Forward)"
            >
              B5
            </div>

            <div
              className={`mouse-btn side-btn-4 ${
                activeButtons.has(3) ? 'active' : ''
              } ${testedActions.has('btn-3') ? 'tested' : ''}`}
              title="Side Button 4 (Back)"
            >
              B4
            </div>

            <div className="scroll-indicators">
              <div
                className={`scroll-badge ${
                  testedActions.has('scroll-up') ? 'tested' : ''
                }`}
              >
                SCROLL UP ({scrollUpCount})
              </div>
              <div
                className={`scroll-badge ${
                  testedActions.has('scroll-down') ? 'tested' : ''
                }`}
              >
                SCROLL DOWN ({scrollDownCount})
              </div>
            </div>
          </div>

          <p className="side-btn-counter">
            Side Buttons (B4 / B5): {btnCounts[3]} / {btnCounts[4]}
          </p>
        </div>

        <div className="mouse-canvas-card">
          <div className="canvas-header">
            <div>
              <h3 className="card-title">Sensor Tracking, Polling Rate & Hold-Drag Integrity</h3>
              <p className="card-desc">
                Hold and drag across the surface to verify continuous switch contact and measure sensor smoothness.
              </p>
            </div>
            <button className="btn" onClick={drawGrid}>
              <Eraser size={14} />
              <span>Clear Surface</span>
            </button>
          </div>

          <canvas
            ref={canvasRef}
            id="mouseCanvas"
            width={800}
            height={290}
            onMouseDown={(e) => {
              e.preventDefault();
              registerMouseButton(e.button);
              isDraggingRef.current = true;
              const rect = e.currentTarget.getBoundingClientRect();
              lastPosRef.current = {
                x: (e.clientX - rect.left) * (e.currentTarget.width / rect.width),
                y: (e.clientY - rect.top) * (e.currentTarget.height / rect.height)
              };
            }}
            onMouseMove={handleCanvasMouseMove}
            onContextMenu={(e) => e.preventDefault()}
          />

          <div className="canvas-telemetry">
            <span>
              Coordinates: <strong>X: {coords.x}, Y: {coords.y}</strong>
            </span>
            <span>
              Continuous Drag Path: <strong>{dragDistance} px</strong>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
