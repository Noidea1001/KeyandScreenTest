import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Keyboard,
  Layers,
  Terminal,
  ShieldCheck,
  ShieldAlert,
  RotateCcw,
  FastForward,
  Maximize2,
  Sliders
} from 'lucide-react';
import {
  MAIN_ALPHANUMERIC_ROWS,
  NAVIGATION_CLUSTER_ROWS,
  NUMPAD_DEFINITIONS,
  NAV_SIX_BLOCK_CODES,
  SYS_TRIAD_CODES,
  EXTRA_MODIFIER_CODES,
  getDefaultSectionsForLayout,
  getTargetKeyCodes
} from '../data/keyboardLayouts';
import {
  KeyboardLayoutType,
  KeyDefinition,
  KeyboardSectionVisibility
} from '../types/hardware';
import { soundEngine } from '../utils/soundEngine';
import { resolveMatchedKeyCodes } from '../utils/keyMatcher';

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
  const [sections, setSections] = useState<KeyboardSectionVisibility>(() =>
    getDefaultSectionsForLayout('full')
  );
  const [excludedCodes, setExcludedCodes] = useState<Set<string>>(new Set());
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

  const targetCodes = useMemo(
    () => new Set(getTargetKeyCodes(sections, excludedCodes)),
    [sections, excludedCodes]
  );

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
  }, [resetSignal, resetKeyboardState]);

  const handleLayoutChange = (nextLayout: KeyboardLayoutType) => {
    setLayout(nextLayout);
    setSections(getDefaultSectionsForLayout(nextLayout));
    setExcludedCodes(new Set());
    resetKeyboardState();
  };

  const toggleSection = (key: keyof KeyboardSectionVisibility) => {
    setSections((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
    hasTriggeredPassRef.current = false;
  };

  const toggleExcludeSingleKey = (code: string, e: React.MouseEvent) => {
    e.preventDefault();
    setExcludedCodes((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
    hasTriggeredPassRef.current = false;
  };

  const handleKeyPressBatch = useCallback(
    (codes: string[], label: string, isRepeat: boolean) => {
      onActivity();
      if (codes.length === 0) return;

      const primaryCode = codes[0];

      setTestedCodes((prev) => {
        const isFirst = codes.some((c) => !prev.has(c));
        if (!isRepeat) {
          soundEngine.playKeyClick(isFirst);
        }
        const next = new Set(prev);
        codes.forEach((c) => {
          if (targetCodes.has(c)) {
            next.add(c);
          }
        });
        return next;
      });

      if (!isRepeat) {
        const now = performance.now();
        const prevTime = lastPressTimeRef.current[primaryCode];
        let detectedChatter = false;

        if (prevTime !== undefined) {
          const delta = now - prevTime;
          if (delta > 2 && delta < 28) {
            detectedChatter = true;
            setChatterCodes((prev) => new Set(prev).add(primaryCode));
            setChatterDetail(
              `Switch chatter on ${primaryCode} (${Math.round(delta)} ms interval)`
            );
          }
        }
        lastPressTimeRef.current[primaryCode] = now;

        setPressCounts((prev) => {
          const updated = { ...prev };
          codes.forEach((c) => {
            updated[c] = (updated[c] || 0) + 1;
          });
          return updated;
        });

        setHistory((prev) => [
          { id: Date.now() + Math.random(), code: primaryCode, isChatter: detectedChatter },
          ...prev.slice(0, 17)
        ]);
      }

      setPressedCodes((prev) => {
        const next = new Set(prev);
        codes.forEach((c) => next.add(c));
        setMaxRollover((m) => Math.max(m, next.size));
        return next;
      });

      setLastKeyInfo({ label: label || primaryCode, code: codes.join(' / ') });
    },
    [onActivity, targetCodes]
  );

  const handleKeyReleaseBatch = useCallback((codes: string[]) => {
    setPressedCodes((prev) => {
      const next = new Set(prev);
      codes.forEach((c) => next.delete(c));
      return next;
    });
  }, []);

  useEffect(() => {
    if (!isActive) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.code === 'KeyR' || e.code === 'F5')) {
        return;
      }
      e.preventDefault();
      const matchedCodes = resolveMatchedKeyCodes(e);
      const displayLabel = e.key === ' ' ? 'SPACE' : e.key.toUpperCase();
      handleKeyPressBatch(matchedCodes, displayLabel, e.repeat);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      e.preventDefault();
      const matchedCodes = resolveMatchedKeyCodes(e);
      handleKeyReleaseBatch(matchedCodes);
      if (e.code === 'PrintScreen' || e.key === 'PrintScreen') {
        handleKeyPressBatch(['PrintScreen'], 'PRTSC', false);
        setTimeout(() => handleKeyReleaseBatch(['PrintScreen']), 100);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [isActive, handleKeyPressBatch, handleKeyReleaseBatch]);

  const activeTestedCount = useMemo(() => {
    let count = 0;
    targetCodes.forEach((code) => {
      if (testedCodes.has(code)) count++;
    });
    return count;
  }, [targetCodes, testedCodes]);

  useEffect(() => {
    const total = targetCodes.size;
    if (total > 0 && activeTestedCount === total && !hasTriggeredPassRef.current) {
      hasTriggeredPassRef.current = true;
      onPass(
        `Keyboard Verified — PASS (${layout.toUpperCase()} / ${total} Keys)`,
        `All ${total}/${total} active target keys registered properly | Max Rollover: ${maxRollover}-Key | Switch Chatter: ${chatterCodes.size}`
      );
    }
  }, [activeTestedCount, targetCodes, layout, maxRollover, chatterCodes, onPass]);

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

    const isExcluded =
      excludedCodes.has(k.code) ||
      (!sections.extraModifiers && EXTRA_MODIFIER_CODES.has(k.code)) ||
      (!sections.sysTriad && SYS_TRIAD_CODES.has(k.code)) ||
      (!sections.navSixBlock && NAV_SIX_BLOCK_CODES.has(k.code));

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
      isChatter ? 'chatter' : '',
      isExcluded ? 'excluded' : ''
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div
        key={k.code}
        className={classes}
        title={
          isExcluded
            ? `${k.label} (${k.code}) — Excluded from target count. Right-click to enable.`
            : `${k.label} (${k.code}) — Left-click to test, Right-click to exclude if missing on your keyboard.`
        }
        onClick={() => {
          handleKeyPressBatch([k.code], k.label, false);
          setTimeout(() => handleKeyReleaseBatch([k.code]), 110);
        }}
        onContextMenu={(e) => toggleExcludeSingleKey(k.code, e)}
      >
        {count > 0 && <span className="key-count-badge">{count}</span>}
        <span className="key-main-label">{k.label}</span>
        {k.sub && <span className="key-sub">{k.sub}</span>}
      </div>
    );
  };

  const totalKeys = targetCodes.size;
  const completionPct =
    totalKeys > 0 ? Math.round((activeTestedCount / totalKeys) * 100) : 0;

  const showMiddleNavColumn =
    sections.sysTriad || sections.navSixBlock || sections.arrowCluster;

  return (
    <section className="module-panel active">
      <div className="stats-bar">
        <div className="stat-card">
          <div className="stat-label">
            <span>Verified Keys</span>
            <Keyboard size={15} />
          </div>
          <div className="stat-value">
            {activeTestedCount} / {totalKeys}
          </div>
          <div className="stat-sub">{completionPct}% of active target keys tested</div>
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
          <div className="stat-sub">Code: {lastKeyInfo.code}</div>
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
            {activeTestedCount === 0
              ? 'Waiting for key input'
              : activeTestedCount < totalKeys
              ? `${totalKeys - activeTestedCount} keys remaining`
              : 'PASS — 100% Verified'}
          </span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${completionPct}%` }} />
        </div>
        <button
          className="btn"
          onClick={handleDemoFillAlmost}
          title="Pre-fill all active target keys except SPACE to quickly verify the PASS and Auto-Reset workflow"
        >
          <FastForward size={15} />
          <span>Demo Fill (99% — Press SPACE to Pass)</span>
        </button>
      </div>

      {/* Primary Model & Scale Toolbar */}
      <div className="toolbar-row">
        <div className="toolbar-group">
          <label className="toolbar-label">Keyboard Model:</label>
          <select
            className="btn select-input"
            value={layout}
            onChange={(e) => handleLayoutChange(e.target.value as KeyboardLayoutType)}
          >
            <option value="full">100% Full-Size Desktop (104 Keys)</option>
            <option value="96">96% / 1800 Compact with Numpad (No INS/HOME Block)</option>
            <option value="laptop">Laptop / Notebook (No INS/HOME 6-Key Block)</option>
            <option value="tkl">80% Tenkeyless — TKL (87 Keys)</option>
            <option value="75">75% Compact (No Sys Triad)</option>
            <option value="65">65% Compact (Arrows Only, No Fn/Nav Block)</option>
            <option value="60">60% Mini Mechanical (61 Core Keys)</option>
          </select>

          <label className="toolbar-label" style={{ marginLeft: '0.25rem' }}>
            <Maximize2 size={13} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
            Scale:
          </label>
          <select
            className="btn select-input"
            value={unitSize}
            onChange={(e) => setUnitSize(Number(e.target.value))}
          >
            <option value={62}>Extra Large (62px)</option>
            <option value={58}>Large Full-Width (58px)</option>
            <option value={52}>Medium (52px)</option>
            <option value={46}>Compact (46px)</option>
          </select>

          <button className="btn" onClick={resetKeyboardState}>
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        </div>

        <div className="toolbar-group">
          <span className="legend-item">
            <span className="legend-box" style={{ background: 'var(--key-bg)' }} />
            Untested
          </span>
          <span className="legend-item">
            <span className="legend-box" style={{ background: 'var(--key-active)' }} />
            Active
          </span>
          <span className="legend-item">
            <span
              className="legend-box"
              style={{
                background: 'rgba(16,185,129,0.35)',
                borderColor: 'var(--accent-green)'
              }}
            />
            Verified
          </span>
          <span className="legend-item">
            <span
              className="legend-box"
              style={{
                background: 'rgba(245,158,11,0.35)',
                borderColor: 'var(--accent-amber)'
              }}
            />
            Chatter
          </span>
        </div>
      </div>

      {/* Secondary Section Filter Bar (Customize missing key blocks in 1 click) */}
      <div className="toolbar-row section-filter-bar">
        <div className="toolbar-group">
          <span className="toolbar-label">
            <Sliders size={13} style={{ marginRight: '5px', verticalAlign: 'middle' }} />
            Active Key Groups (Uncheck missing keys on your model):
          </span>

          <button
            className={`btn btn-chip ${sections.navSixBlock ? 'chip-on' : 'chip-off'}`}
            onClick={() => toggleSection('navSixBlock')}
            title="Toggle INS, HOME, PGUP, DEL, END, PGDN block"
          >
            INS / HOME / PGUP / DEL / END / PGDN: {sections.navSixBlock ? 'ON' : 'OFF'}
          </button>

          <button
            className={`btn btn-chip ${sections.sysTriad ? 'chip-on' : 'chip-off'}`}
            onClick={() => toggleSection('sysTriad')}
            title="Toggle PRTSC, SCRLK, PAUSE keys"
          >
            PRTSC / SCRLK / PAUSE: {sections.sysTriad ? 'ON' : 'OFF'}
          </button>

          <button
            className={`btn btn-chip ${sections.extraModifiers ? 'chip-on' : 'chip-off'}`}
            onClick={() => toggleSection('extraModifiers')}
            title="Toggle Right WIN and MENU keys"
          >
            Right WIN & MENU: {sections.extraModifiers ? 'ON' : 'OFF'}
          </button>

          <button
            className={`btn btn-chip ${sections.numpad ? 'chip-on' : 'chip-off'}`}
            onClick={() => toggleSection('numpad')}
            title="Toggle 17-key Numpad section"
          >
            Numpad: {sections.numpad ? 'ON' : 'OFF'}
          </button>

          <button
            className={`btn btn-chip ${sections.fnRow ? 'chip-on' : 'chip-off'}`}
            onClick={() => toggleSection('fnRow')}
            title="Toggle F1-F12 row"
          >
            F1–F12 Row: {sections.fnRow ? 'ON' : 'OFF'}
          </button>
        </div>

        <span className="toolbar-hint">
          Tip: Right-click any individual key to exclude/include it for your exact keyboard model.
        </span>
      </div>

      <div className="keyboard-scroll-wrapper">
        <div
          className="keyboard-chassis"
          style={{ '--u': `${unitSize}px` } as React.CSSProperties}
        >
          {/* Main Alphanumeric Block */}
          <div className="kb-section">
            {MAIN_ALPHANUMERIC_ROWS.map((row, rIdx) => {
              if (!sections.fnRow && rIdx === 0) return null;
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

          {/* Navigation & Arrow Cluster */}
          {showMiddleNavColumn && (
            <div className="kb-section">
              {NAVIGATION_CLUSTER_ROWS.map((row, rIdx) => {
                if (rIdx === 0 && !sections.fnRow && !sections.sysTriad) return null;
                return (
                  <div
                    key={`nav-row-${rIdx}`}
                    className={`kb-row ${rIdx === 0 ? 'fn-row' : ''}`}
                  >
                    {row.map((k, kIdx) => renderKey(k, kIdx))}
                  </div>
                );
              })}
            </div>
          )}

          {/* Numpad Block */}
          {sections.numpad && (
            <div className="kb-section">
              {sections.fnRow && <div className="kb-row fn-row numpad-top-spacer" />}
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
