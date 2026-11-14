import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Monitor,
  Gauge,
  Palette,
  CheckSquare,
  Maximize2,
  Check,
  RotateCcw
} from 'lucide-react';
import {
  DEAD_PIXEL_PATTERNS,
  UNIFORMITY_PATTERNS,
  GRADIENT_PATTERNS
} from '../data/screenPatterns';
import { ScreenTestPattern } from '../types/hardware';
import { getAspectRatioString } from '../utils/formatters';
import { soundEngine } from '../utils/soundEngine';

interface ScreenTesterProps {
  isActive: boolean;
  resetSignal: number;
  onActivity: () => void;
  onPass: (title: string, description: string) => void;
}

type OverlayGroup = 'deadpixel' | 'uniformity' | 'gradient' | null;

export const ScreenTester: React.FC<ScreenTesterProps> = ({
  isActive,
  resetSignal,
  onActivity,
  onPass
}) => {
  const [passedSteps, setPassedSteps] = useState<Set<number>>(new Set());
  const [fps, setFps] = useState<number>(60);
  const [overlayGroup, setOverlayGroup] = useState<OverlayGroup>(null);
  const [patternIndex, setPatternIndex] = useState<number>(0);
  const [motionSpeed, setMotionSpeed] = useState<1 | 2 | 4>(1);

  const motionCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const motionSpeedRef = useRef<number>(1);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const hasTriggeredPassRef = useRef<boolean>(false);

  useEffect(() => {
    motionSpeedRef.current = motionSpeed;
  }, [motionSpeed]);

  const resetScreenState = useCallback(() => {
    setPassedSteps(new Set());
    setOverlayGroup(null);
    hasTriggeredPassRef.current = false;
  }, []);

  useEffect(() => {
    resetScreenState();
  }, [resetSignal, resetScreenState]);

  useEffect(() => {
    if (passedSteps.size === 4 && !hasTriggeredPassRef.current) {
      hasTriggeredPassRef.current = true;
      onPass(
        `Display Verified — PASS (${window.screen.width}x${window.screen.height})`,
        `Zero pixel defects, uniform backlight distribution, clean gradient ramp, and ${fps} Hz motion stability verified`
      );
    }
  }, [passedSteps, fps, onPass]);

  // Real-time Refresh Rate & Motion Bar Canvas Loop
  useEffect(() => {
    if (!isActive) return;

    let animId = 0;
    let frames = 0;
    let lastTime = performance.now();
    let xPos = 0;

    const tick = (now: number) => {
      frames++;
      if (now - lastTime >= 1000) {
        setFps(frames);
        frames = 0;
        lastTime = now;
      }

      const canvas = motionCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          xPos = (xPos + 5 * motionSpeedRef.current) % canvas.width;
          ctx.fillStyle = '#3b82f6';
          ctx.fillRect(xPos, 12, 18, 46);
          ctx.fillStyle = '#10b981';
          ctx.fillRect((xPos + 180) % canvas.width, 12, 18, 46);
        }
      }
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isActive]);

  const activePatternList: ScreenTestPattern[] =
    overlayGroup === 'uniformity'
      ? UNIFORMITY_PATTERNS
      : overlayGroup === 'gradient'
      ? GRADIENT_PATTERNS
      : DEAD_PIXEL_PATTERNS;

  const openFullscreenTest = (group: OverlayGroup, startIdx = 0) => {
    onActivity();
    setOverlayGroup(group);
    setPatternIndex(startIdx);
    setTimeout(() => {
      if (overlayRef.current && overlayRef.current.requestFullscreen) {
        overlayRef.current.requestFullscreen().catch(() => {});
      }
    }, 20);
  };

  const closeFullscreenTest = useCallback(() => {
    setOverlayGroup(null);
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!overlayGroup) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        closeFullscreenTest();
      } else if (e.code === 'Space' || e.code === 'ArrowRight') {
        e.preventDefault();
        setPatternIndex((i) => i + 1);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setPatternIndex((i) => Math.max(0, i - 1));
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [overlayGroup, closeFullscreenTest]);

  const markStepVerified = (stepNum: number) => {
    onActivity();
    soundEngine.playKeyClick(true);
    setPassedSteps((prev) => new Set(prev).add(stepNum));
  };

  const screenW = window.screen.width;
  const screenH = window.screen.height;
  const dpr = window.devicePixelRatio || 1;
  const currentPattern = activePatternList[patternIndex % activePatternList.length];

  return (
    <section className="module-panel active">
      <div className="stats-bar">
        <div className="stat-card">
          <div className="stat-label">
            <span>Panel Resolution</span>
            <Monitor size={15} />
          </div>
          <div className="stat-value">
            {screenW} x {screenH}
          </div>
          <div className="stat-sub">
            Scale Factor: {dpr}x ({Math.round(screenW * dpr)}x{Math.round(screenH * dpr)})
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            <span>Refresh Rate / Frame Pacing</span>
            <Gauge size={15} />
          </div>
          <div className="stat-value">{fps} Hz / FPS</div>
          <div className="stat-sub">Real-time VSync cadence measurement</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            <span>Color Bit Depth</span>
            <Palette size={15} />
          </div>
          <div className="stat-value">{window.screen.colorDepth}-bit</div>
          <div className="stat-sub">
            Aspect Ratio: {getAspectRatioString(screenW, screenH)}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            <span>Verification Steps</span>
            <CheckSquare size={15} />
          </div>
          <div className="stat-value">{passedSteps.size} / 4</div>
          <div className="stat-sub">Complete all 4 inspections for PASS</div>
        </div>
      </div>

      <div className="screen-grid">
        {/* Step 1 */}
        <div className={`diagnostic-card ${passedSteps.has(1) ? 'done' : ''}`}>
          <div>
            <h3 className="card-title">1. Dead & Stuck Pixel Inspection</h3>
            <p className="card-desc">
              Cycle through 8 full-screen solid primary and secondary color fields to inspect for dark dead pixels or permanently illuminated subpixels.
            </p>
            <div className="color-swatches">
              {DEAD_PIXEL_PATTERNS.map((pat, idx) => (
                <div
                  key={pat.name}
                  className="color-swatch"
                  style={{ background: pat.background }}
                  title={pat.name}
                  onClick={() => openFullscreenTest('deadpixel', idx)}
                />
              ))}
            </div>
          </div>
          <div className="card-actions">
            <button
              className="btn btn-primary"
              onClick={() => openFullscreenTest('deadpixel', 0)}
            >
              <Maximize2 size={14} />
              <span>Launch Fullscreen Pattern</span>
            </button>
            <button className="btn" onClick={() => markStepVerified(1)}>
              <Check size={14} />
              <span>Confirm Zero Defect Pixels</span>
            </button>
          </div>
        </div>

        {/* Step 2 */}
        <div className={`diagnostic-card ${passedSteps.has(2) ? 'done' : ''}`}>
          <div>
            <h3 className="card-title">2. Backlight Bleed & Grey Uniformity</h3>
            <p className="card-desc">
              Evaluate panel edge light leakage (IPS glow) on 0% black and inspect for clouding, dirty screen effect (DSE), or OLED retention across 5%, 15%, and 50% grey fields.
            </p>
          </div>
          <div className="card-actions">
            <button
              className="btn btn-primary"
              onClick={() => openFullscreenTest('uniformity', 0)}
            >
              <Maximize2 size={14} />
              <span>Launch Uniformity Patterns</span>
            </button>
            <button className="btn" onClick={() => markStepVerified(2)}>
              <Check size={14} />
              <span>Confirm Uniformity OK</span>
            </button>
          </div>
        </div>

        {/* Step 3 */}
        <div className={`diagnostic-card ${passedSteps.has(3) ? 'done' : ''}`}>
          <div>
            <h3 className="card-title">3. Color Gradient, Contrast & Subpixel Grid</h3>
            <p className="card-desc">
              Check for color bit-depth banding across smooth RGB/Luminance ramps and verify pixel sharpness across fine alignment lines.
            </p>
          </div>
          <div className="card-actions">
            <button
              className="btn btn-primary"
              onClick={() => openFullscreenTest('gradient', 0)}
            >
              <Maximize2 size={14} />
              <span>Launch Gradient & Grid</span>
            </button>
            <button className="btn" onClick={() => markStepVerified(3)}>
              <Check size={14} />
              <span>Confirm Gradient & Sharpness</span>
            </button>
          </div>
        </div>

        {/* Step 4 */}
        <div className={`diagnostic-card ${passedSteps.has(4) ? 'done' : ''}`}>
          <div>
            <h3 className="card-title">4. Motion Response & Refresh Rate Stability</h3>
            <p className="card-desc">
              Observe high-speed reference bars to evaluate pixel response time, overdrive coronas, and frame pacing smoothness.
            </p>
            <canvas
              ref={motionCanvasRef}
              width={380}
              height={70}
              className="motion-canvas"
            />
          </div>
          <div className="card-actions">
            <select
              className="btn select-input"
              value={motionSpeed}
              onChange={(e) => setMotionSpeed(Number(e.target.value) as 1 | 2 | 4)}
              aria-label="Motion Bar Speed"
            >
              <option value={1}>Speed: 1x (Standard)</option>
              <option value={2}>Speed: 2x (Fast)</option>
              <option value={4}>Speed: 4x (Ghosting Stress)</option>
            </select>
            <button className="btn" onClick={() => markStepVerified(4)}>
              <Check size={14} />
              <span>Confirm Motion Stability</span>
            </button>
            <button className="btn" onClick={resetScreenState}>
              <RotateCcw size={14} />
              <span>Reset Display Test</span>
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Pattern Overlay */}
      {overlayGroup && (
        <div
          ref={overlayRef}
          id="screenOverlay"
          style={{ display: 'block' }}
          onClick={() => setPatternIndex((i) => i + 1)}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              background: currentPattern.background
            }}
          />
          <div
            className="overlay-hud"
            onClick={(e) => {
              e.stopPropagation();
              closeFullscreenTest();
            }}
          >
            <strong>
              {currentPattern.name} ({(patternIndex % activePatternList.length) + 1}/
              {activePatternList.length})
            </strong>
            <span>Click or press SPACE for next pattern</span>
            <span>Press ESC or click here to exit</span>
          </div>
        </div>
      )}
    </section>
  );
};
