import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Fingerprint, PenTool, RotateCcw, ShieldCheck } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface TouchTesterProps {
  resetSignal: number;
  onActivity: () => void;
  onPass: (title: string, description: string) => void;
}

interface ActivePointer {
  id: number;
  type: string;
  x: number;
  y: number;
  pressure: number;
  tiltX: number;
  tiltY: number;
}

const TOTAL_CELLS = 24;

export const TouchTester: React.FC<TouchTesterProps> = ({
  resetSignal,
  onActivity,
  onPass
}) => {
  const [verifiedCells, setVerifiedCells] = useState<Set<number>>(new Set());
  const [activePointers, setActivePointers] = useState<Record<number, ActivePointer>>({});
  const [maxSimultaneous, setMaxSimultaneous] = useState<number>(0);
  const [lastPointer, setLastPointer] = useState<ActivePointer | null>(null);

  const hasTriggeredPassRef = useRef<boolean>(false);

  const resetTouchState = useCallback(() => {
    setVerifiedCells(new Set());
    setActivePointers({});
    setMaxSimultaneous(0);
    setLastPointer(null);
    hasTriggeredPassRef.current = false;
  }, []);

  useEffect(() => {
    resetTouchState();
  }, [resetSignal, resetTouchState]);

  useEffect(() => {
    if (verifiedCells.size === TOTAL_CELLS && !hasTriggeredPassRef.current) {
      hasTriggeredPassRef.current = true;
      onPass(
        'Touchscreen & Stylus Verified — PASS',
        `All ${TOTAL_CELLS}/${TOTAL_CELLS} touch grid zones verified | Max Multi-Touch: ${Math.max(1, maxSimultaneous)} point(s)`
      );
    }
  }, [verifiedCells, maxSimultaneous, onPass]);

  const markCellAtPoint = (clientX: number, clientY: number) => {
    const el = document.elementFromPoint(clientX, clientY);
    const cellAttr = el?.getAttribute('data-touch-cell');
    if (cellAttr !== null && cellAttr !== undefined) {
      const idx = Number(cellAttr);
      if (!Number.isNaN(idx)) {
        setVerifiedCells((prev) => {
          if (prev.has(idx)) return prev;
          soundEngine.playKeyClick(true);
          const next = new Set(prev);
          next.add(idx);
          return next;
        });
      }
    }
  };

  const updatePointer = (e: React.PointerEvent<HTMLDivElement>) => {
    onActivity();
    const info: ActivePointer = {
      id: e.pointerId,
      type: e.pointerType || 'mouse',
      x: Math.round(e.clientX),
      y: Math.round(e.clientY),
      pressure: Number(e.pressure.toFixed(2)),
      tiltX: e.tiltX || 0,
      tiltY: e.tiltY || 0
    };
    setLastPointer(info);
    setActivePointers((prev) => {
      const next = { ...prev, [e.pointerId]: info };
      const count = Object.keys(next).length;
      setMaxSimultaneous((m) => Math.max(m, count));
      return next;
    });
    markCellAtPoint(e.clientX, e.clientY);
  };

  const removePointer = (e: React.PointerEvent<HTMLDivElement>) => {
    setActivePointers((prev) => {
      const next = { ...prev };
      delete next[e.pointerId];
      return next;
    });
  };

  const activeCount = Object.keys(activePointers).length;
  const pct = Math.round((verifiedCells.size / TOTAL_CELLS) * 100);

  return (
    <section className="module-panel active">
      <div className="diagnostic-stats-row">
        <div className="stat-card">
          <div className="stat-label">
            <Fingerprint size={14} />
            <span>Grid Coverage</span>
          </div>
          <div className="stat-value">
            {verifiedCells.size}/{TOTAL_CELLS} ({pct}%)
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            <ShieldCheck size={14} />
            <span>Active / Max Multi-Touch</span>
          </div>
          <div className="stat-value">
            {activeCount} / {maxSimultaneous} pts
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            <PenTool size={14} />
            <span>Stylus / Pointer Telemetry</span>
          </div>
          <div className="stat-value mono-cell">
            {lastPointer
              ? `${lastPointer.type.toUpperCase()} | P: ${lastPointer.pressure} | Tilt: ${lastPointer.tiltX}°,${lastPointer.tiltY}°`
              : 'Touch, swipe, or use stylus on grid'}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="canvas-header">
          <div>
            <h3 className="card-title">Dead-Zone Touch & Stylus Grid</h3>
            <p className="card-desc">
              Swipe or tap across every cell to verify digitizer responsiveness and multi-touch tracking.
            </p>
          </div>
          <button className="btn btn-secondary" onClick={resetTouchState}>
            <RotateCcw size={15} />
            <span>Reset Grid</span>
          </button>
        </div>

        <div
          className="touch-grid"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture?.(e.pointerId);
            updatePointer(e);
          }}
          onPointerMove={(e) => {
            if (e.buttons > 0 || e.pointerType === 'touch' || e.pointerType === 'pen') {
              updatePointer(e);
            }
          }}
          onPointerUp={removePointer}
          onPointerCancel={removePointer}
        >
          {Array.from({ length: TOTAL_CELLS }, (_, idx) => {
            const isTested = verifiedCells.has(idx);
            return (
              <div
                key={idx}
                data-touch-cell={idx}
                className={`touch-cell ${isTested ? 'tested' : ''}`}
              >
                {idx + 1}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
