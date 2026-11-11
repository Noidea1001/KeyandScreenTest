import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Keyboard,
  Layers,
  Terminal,
  ShieldCheck,
  ShieldAlert,
  RotateCcw,
  FastForward,
  Maximize2
} from 'lucide-react';
import {
  MAIN_ALPHANUMERIC_ROWS,
  NAVIGATION_CLUSTER_ROWS,
  NUMPAD_DEFINITIONS,
  getTargetKeyCodesForLayout
} from '../data/keyboardLayouts';
import { KeyboardLayoutType, KeyDefinition } from '../types/hardware';
import { soundEngine } from '../utils/soundEngine';

interface KeyboardTesterProps {
  isActive: boolean;
  resetSignal: number;
  onActivity: () => void;
  onPass: (title: string, description: string) => void;
}

interface HistoryEntry {
  id: number;
  code: string;
  isChatter: boolean;
}

export const KeyboardTester: React.FC<KeyboardTesterProps> = ({
  isActive,
  resetSignal,
  onActivity,
  onPass
}) => {
  const [layout, setLayout] = useState<KeyboardLayoutType>('full');
  const [unitSize, setUnitSize] = useState<number>(58);
  const [testedCodes, setTestedCodes] = useState<Set<string>>(new Set());
  const [pressedCodes, setPressedCodes] = useState<Set<string>>(new Set());
  const [pressCounts, setPressCounts] = useState<Record<string, number>>({});
  const [chatterCodes, setChatterCodes] = useState<Set<string>>(new Set());
  const [chatterDetail, setChatterDetail] = useState<string>('No switch bounce detected');
  const [maxRollover, setMaxRollover] = useState<number>(0);
  const [lastKeyInfo, setLastKeyInfo] = useState<{ label: string; code: string }>({
    label: 'None',
    code: '—'
  });
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const lastPressTimeRef = React.useRef<Record<string, number>>({});
  const hasTriggeredPassRef = React.useRef<boolean>(false);

  const targetCodes = useMemo(() => new Set(getTargetKeyCodesForLayout(layout)), [layout]);

  const resetKeyboardState = useCallback(() => {
    setTestedCodes(new Set());
    setPressedCodes(new Set());
    setPressCounts({});
    setChatterCodes(new Set());
    setChatterDetail('No switch bounce detected');
    setMaxRollover(0);
    setLastKeyInfo({ label: 'None', code: '—' });
    setHistory([]);
    lastPressTimeRef.current = {};
    hasTriggeredPassRef.current = false;
  }, []);

  useEffect(() => {
    resetKeyboardState();
  }, [resetSignal, layout, resetKeyboardState]);

  const handleKeyPress = useCallback(
    (code: string, label: string, isRepeat: boolean) => {
      onActivity();

      setTestedCodes((prev) => {
        const isFirst = !prev.has(code);
        if (!isRepeat) {
          soundEngine.playKeyClick(isFirst);
        }
        if (!targetCodes.has(code)) return prev;
        const next = new Set(prev);
        next.add(code);
        return next;
      });

      if (!isRepeat) {
        const now = performance.now();
        const prevTime = lastPressTimeRef.current[code];
        let detectedChatter = false;

        if (prevTime !== undefined) {
          const delta = now - prevTime;
          if (delta > 2 && delta < 28) {
            detectedChatter = true;
            setChatterCodes((prev) => new Set(prev).add(code));
            setChatterDetail(`Switch chatter on ${code} (${Math.round(delta)} ms interval)`);
          }
        }
        lastPressTimeRef.current[code] = now;

        setPressCounts((prev) => ({
          ...prev,
          [code]: (prev[code] || 0) + 1
        }));

        setHistory((prev) => [
          { id: Date.now() + Math.random(), code, isChatter: detectedChatter },
          ...prev.slice(0, 17)
        ]);
      }

      setPressedCodes((prev) => {
        const next = new Set(prev);
        next.add(code);
        setMaxRollover((m) => Math.max(m, next.size));
        return next;
      });

      setLastKeyInfo({ label: label || code, code });
    },
    [onActivity, targetCodes]
  );

  const handleKeyRelease = useCallback((code: string) => {
    setPressedCodes((prev) => {
      const next = new Set(prev);
      next.delete(code);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!isActive) return;

    const onKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      const displayLabel = e.key === ' ' ? 'SPACE' : e.key.toUpperCase();
      handleKeyPress(e.code, displayLabel, e.repeat);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      e.preventDefault();
      handleKeyRelease(e.code);
      if (e.code === 'PrintScreen') {
        handleKeyPress('PrintScreen', 'PRTSC', false);
        setTimeout(() => handleKeyRelease('PrintScreen'), 100);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [isActive, handleKeyPress, handleKeyRelease]);

  useEffect(() => {
    const total = targetCodes.size;
    if (total > 0 && testedCodes.size === total && !hasTriggeredPassRef.current) {
      hasTriggeredPassRef.current = true;
      onPass(
        `Keyboard Verified — PASS (${layout.toUpperCase()} / ${total} Keys)`,
        `All ${total}/${total} keys registered properly | Max Rollover: ${maxRollover}-Key | Switch Chatter: ${chatterCodes.size}`
      );
    }
  }, [testedCodes, targetCodes, layout, maxRollover, chatterCodes, onPass]);

  const handleDemoFillAlmost = () => {
    resetKeyboardState();
    const almostSet = new Set<string>();
    targetCodes.forEach((code) => {
      if (code !== 'Space') {
        almostSet.add(code);
      }
    });
    setTestedCodes(almostSet);
  };

  const renderKey = (k: KeyDefinition, idx: number) => {
    if (k.gap) {
      return <div key={`gap-${idx}`} className={k.gap} />;
    }
    if (k.empty) {
      return <div key={`empty-${idx}`} className="key-empty-slot" />;
    }

    const isPressed = pressedCodes.has(k.code);
    const isTested = testedCodes.has(k.code);
    const isChatter = chatterCodes.has(k.code);
    const count = pressCounts[k.code] || 0;

    const classes = [
      'key',
      k.width || '',
      k.extraClass || '',
      isPressed ? 'active' : '',
      isTested ? 'tested' : '',
      isChatter ? 'chatter' : ''
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div
        key={k.code}
        className={classes}
        onClick={() => {
          handleKeyPress(k.code, k.label, false);
          setTimeout(() => handleKeyRelease(k.code), 110);
        }}
      >
        {count > 0 && <span className="key-count-badge">{count}</span>}
        <span className="key-main-label">{k.label}</span>
        {k.sub && <span className="key-sub">{k.sub}</span>}
      </div>
    );
  };

  const totalKeys = targetCodes.size;
  const testedCount = testedCodes.size;
  const completionPct = totalKeys > 0 ? Math.round((testedCount / totalKeys) * 100) : 0;

  return (
    <section className="module-panel active">
      <div className="stats-bar">
        <div className="stat-card">
          <div className="stat-label">
            <span>Verified Keys</span>
            <Keyboard size={15} />
          </div>
          <div className="stat-value">
            {testedCount} / {totalKeys}
          </div>
          <div className="stat-sub">{completionPct}% of active layout tested</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            <span>Simultaneous (NKRO)</span>
            <Layers size={15} />
          </div>
          <div className="stat-value">
            {pressedCodes.size}{' '}
            <span className="stat-inline-muted">(Peak: {maxRollover})</span>
          </div>
          <div className="stat-sub">Anti-ghosting & rollover check</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            <span>Last Key Event</span>
            <Terminal size={15} />
          </div>
          <div className="stat-value">{lastKeyInfo.label}</div>
          <div className="stat-sub">Scan Code: {lastKeyInfo.code}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            <span>Switch Integrity</span>
            {chatterCodes.size > 0 ? <ShieldAlert size={15} /> : <ShieldCheck size={15} />}
          </div>
          <div
            className="stat-value"
            style={{
              color:
                chatterCodes.size > 0 ? 'var(--accent-amber)' : 'var(--accent-green)'
            }}
          >
            {chatterCodes.size > 0 ? `${chatterCodes.size} Chatter` : 'Healthy (0 Faults)'}
          </div>
          <div className="stat-sub">{chatterDetail}</div>
        </div>
      </div>

      <div className="progress-wrapper">
        <div className="progress-info">
          <span className="progress-title">Diagnostic Progress:</span>
          <span className="status-pill">
            {testedCount === 0
              ? 'Waiting for key input'
              : testedCount < totalKeys
              ? `${totalKeys - testedCount} keys remaining`
              : 'PASS — 100% Verified'}
          </span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${completionPct}%` }} />
        </div>
        <button
          className="btn"
          onClick={handleDemoFillAlmost}
          title="Pre-fill all keys except SPACE to quickly verify the PASS and Auto-Reset workflow"
        >
          <FastForward size={15} />
          <span>Demo Fill (99% — Press SPACE to Pass)</span>
        </button>
      </div>

      <div className="toolbar-row">
        <div className="toolbar-group">
          <label className="toolbar-label">Form Factor:</label>
          <select
            className="btn select-input"
            value={layout}
            onChange={(e) => setLayout(e.target.value as KeyboardLayoutType)}
          >
            <option value="full">100% Full-Size ANSI (104 Keys)</option>
            <option value="tkl">80% Tenkeyless — TKL (87 Keys)</option>
            <option value="75">75% Compact / Notebook (84 Keys)</option>
            <option value="60">60% Compact Mechanical (61 Keys)</option>
          </select>

          <label className="toolbar-label" style={{ marginLeft: '0.35rem' }}>
            <Maximize2 size={13} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
            Key Scale:
          </label>
          <select
            className="btn select-input"
            value={unitSize}
            onChange={(e) => setUnitSize(Number(e.target.value))}
          >
            <option value={62}>Extra Large (62px Full Deck)</option>
            <option value={58}>Large Full-Width (58px Default)</option>
            <option value={52}>Medium (52px)</option>
            <option value={46}>Compact (46px)</option>
          </select>

          <button className="btn" onClick={resetKeyboardState}>
            <RotateCcw size={14} />
            <span>Reset Keyboard</span>
          </button>
        </div>

        <div className="toolbar-group">
          <span className="legend-item">
            <span className="legend-box" style={{ background: 'var(--key-bg)' }} />
            Untested
          </span>
          <span className="legend-item">
            <span className="legend-box" style={{ background: 'var(--key-active)' }} />
            Active Down
          </span>
          <span className="legend-item">
            <span
              className="legend-box"
              style={{
                background: 'rgba(16,185,129,0.35)',
                borderColor: 'var(--accent-green)'
              }}
            />
            Verified OK
          </span>
          <span className="legend-item">
            <span
              className="legend-box"
              style={{
                background: 'rgba(245,158,11,0.35)',
                borderColor: 'var(--accent-amber)'
              }}
            />
            Switch Chatter
          </span>
        </div>
      </div>

      <div className="keyboard-scroll-wrapper">
        <div
          className="keyboard-chassis"
          style={{ '--u': `${unitSize}px` } as React.CSSProperties}
        >
          {/* Main Alphanumeric Block */}
          <div className="kb-section">
            {MAIN_ALPHANUMERIC_ROWS.map((row, rIdx) => {
              if (layout === '60' && rIdx === 0) return null;
              return (
                <div
                  key={`main-row-${rIdx}`}
                  className={`kb-row ${rIdx === 0 ? 'fn-row' : ''}`}
                >
                  {row.map((k, kIdx) => renderKey(k, kIdx))}
                </div>
              );
            })}
          </div>

          {/* Navigation Cluster */}
          {(layout === 'full' || layout === 'tkl' || layout === '75') && (
            <div className="kb-section">
              {NAVIGATION_CLUSTER_ROWS.map((row, rIdx) => (
                <div
                  key={`nav-row-${rIdx}`}
                  className={`kb-row ${rIdx === 0 ? 'fn-row' : ''}`}
                >
                  {row.map((k, kIdx) => {
                    if (
                      layout === '75' &&
                      (k.code === 'ScrollLock' || k.code === 'Pause' || k.code === 'Insert')
                    ) {
                      return null;
                    }
                    return renderKey(k, kIdx);
                  })}
                </div>
              ))}
            </div>
          )}

          {/* Numpad Block */}
          {layout === 'full' && (
            <div className="kb-section">
              <div className="kb-row fn-row numpad-top-spacer" />
              <div className="numpad-grid">
                {NUMPAD_DEFINITIONS.map((k, kIdx) => renderKey(k, kIdx))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="key-history-bar">
        <span className="history-label">Event Stream:</span>
        {history.length === 0 ? (
          <span className="history-empty">Press any key to begin diagnostic logging...</span>
        ) : (
          history.map((item) => (
            <span
              key={item.id}
              className={`history-pill ${item.isChatter ? 'warn' : ''}`}
            >
              {item.code}
            </span>
          ))
        )}
      </div>
    </section>
  );
};
