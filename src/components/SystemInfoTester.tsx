import React, { useState, useEffect } from 'react';
import {
  Cpu,
  BatteryCharging,
  MonitorSmartphone,
  Wifi,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { getAspectRatioString } from '../utils/formatters';

interface SystemInfoTesterProps {
  onActivity: () => void;
  onPass: (title: string, description: string) => void;
}

interface BatteryInfo {
  supported: boolean;
  levelPct: number | null;
  charging: boolean | null;
  chargingTime: number | null;
  dischargingTime: number | null;
}

interface BatteryManagerLike extends EventTarget {
  level: number;
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
}

function getWebGLRenderer(): { vendor: string; renderer: string } {
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl') ||
      (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);
    if (!gl) {
      return { vendor: 'Unavailable', renderer: 'WebGL not supported' };
    }
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      return {
        vendor: String(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || 'Unknown'),
        renderer: String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'Unknown')
      };
    }
    return {
      vendor: String(gl.getParameter(gl.VENDOR) || 'Standard'),
      renderer: String(gl.getParameter(gl.RENDERER) || 'Standard WebGL')
    };
  } catch {
    return { vendor: 'Unavailable', renderer: 'Blocked by browser' };
  }
}

export const SystemInfoTester: React.FC<SystemInfoTesterProps> = ({
  onActivity,
  onPass
}) => {
  const [gpu] = useState(() => getWebGLRenderer());
  const [battery, setBattery] = useState<BatteryInfo>({
    supported: false,
    levelPct: null,
    charging: null,
    chargingTime: null,
    dischargingTime: null
  });
  const [online, setOnline] = useState<boolean>(navigator.onLine);

  const readBattery = async () => {
    const nav = navigator as Navigator & {
      getBattery?: () => Promise<BatteryManagerLike>;
    };
    if (!nav.getBattery) {
      setBattery((prev) => ({ ...prev, supported: false }));
      return;
    }
    try {
      const bm = await nav.getBattery();
      setBattery({
        supported: true,
        levelPct: Math.round(bm.level * 100),
        charging: bm.charging,
        chargingTime: bm.chargingTime,
        dischargingTime: bm.dischargingTime
      });
    } catch {
      setBattery((prev) => ({ ...prev, supported: false }));
    }
  };

  useEffect(() => {
    void readBattery();
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const cores = navigator.hardwareConcurrency || 'Unknown';
  const memoryGb =
    (navigator as Navigator & { deviceMemory?: number }).deviceMemory || null;
  const dpr = window.devicePixelRatio || 1;
  const isP3 =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(color-gamut: p3)').matches;
  const maxTouchPoints = navigator.maxTouchPoints ?? 0;
  const navExtra = navigator as Navigator & {
    connection?: { effectiveType?: string; downlink?: number; rtt?: number };
    usb?: unknown;
    hid?: unknown;
    bluetooth?: unknown;
  };
  const netConn = navExtra.connection;
  const hasWebUSB = 'usb' in navExtra;
  const hasWebHID = 'hid' in navExtra;
  const hasWebBT = 'bluetooth' in navExtra;

  const handleLogSystemPass = () => {
    onActivity();
    const batterySummary = battery.supported
      ? `Battery: ${battery.levelPct}% (${battery.charging ? 'Charging' : 'On Battery'})`
      : 'Battery API: N/A';
    onPass(
      'System & Battery Telemetry Verified — PASS',
      `CPU: ${cores} threads | GPU: ${gpu.renderer} | Display: ${window.screen.width}x${window.screen.height} @${dpr}x | ${batterySummary}`
    );
  };

  return (
    <section className="module-panel active">
      <div className="card">
        <div className="canvas-header">
          <div>
            <h3 className="card-title">System, GPU & Battery Telemetry</h3>
            <p className="card-desc">
              Real-time browser hardware introspection for CPU, memory, WebGL GPU, display capabilities, and battery health.
            </p>
          </div>
          <div className="card-actions">
            <button
              className="btn btn-secondary"
              onClick={() => {
                onActivity();
                void readBattery();
              }}
            >
              <RefreshCw size={15} />
              <span>Refresh Battery</span>
            </button>
            <button className="btn btn-primary" onClick={handleLogSystemPass}>
              <CheckCircle2 size={15} />
              <span>Log System PASS</span>
            </button>
          </div>
        </div>

        <div className="system-info-grid">
          <div className="system-info-card">
            <div className="stat-label">
              <Cpu size={15} />
              <span>Compute & Platform</span>
            </div>
            <dl className="system-kv-list">
              <div>
                <dt>Logical CPU Cores</dt>
                <dd>{cores}</dd>
              </div>
              <div>
                <dt>Device Memory</dt>
                <dd>{memoryGb ? `${memoryGb} GB (approx)` : 'Not exposed'}</dd>
              </div>
              <div>
                <dt>Max Touch Points</dt>
                <dd>{maxTouchPoints}</dd>
              </div>
              <div>
                <dt>Network State</dt>
                <dd>{online ? 'Online' : 'Offline (PWA Ready)'}</dd>
              </div>
            </dl>
          </div>

          <div className="system-info-card">
            <div className="stat-label">
              <MonitorSmartphone size={15} />
              <span>Graphics & Display</span>
            </div>
            <dl className="system-kv-list">
              <div>
                <dt>GPU Vendor</dt>
                <dd>{gpu.vendor}</dd>
              </div>
              <div>
                <dt>GPU Renderer</dt>
                <dd>{gpu.renderer}</dd>
              </div>
              <div>
                <dt>Resolution & Aspect</dt>
                <dd>
                  {window.screen.width}×{window.screen.height} (
                  {getAspectRatioString(window.screen.width, window.screen.height)})
                </dd>
              </div>
              <div>
                <dt>DPR / Color Gamut</dt>
                <dd>
                  {dpr}x DPR · {window.screen.colorDepth}-bit ·{' '}
                  {isP3 ? 'Display P3' : 'sRGB'}
                </dd>
              </div>
            </dl>
          </div>

          <div className="system-info-card">
            <div className="stat-label">
              <BatteryCharging size={15} />
              <span>Battery Status</span>
            </div>
            {battery.supported ? (
              <dl className="system-kv-list">
                <div>
                  <dt>Charge Level</dt>
                  <dd>{battery.levelPct}%</dd>
                </div>
                <div>
                  <dt>Power State</dt>
                  <dd>{battery.charging ? 'Charging (AC Connected)' : 'Discharging'}</dd>
                </div>
                <div>
                  <dt>Time to Full</dt>
                  <dd>
                    {battery.chargingTime && Number.isFinite(battery.chargingTime)
                      ? `${Math.round(battery.chargingTime / 60)} min`
                      : '—'}
                  </dd>
                </div>
                <div>
                  <dt>Remaining Runtime</dt>
                  <dd>
                    {battery.dischargingTime && Number.isFinite(battery.dischargingTime)
                      ? `${Math.round(battery.dischargingTime / 60)} min`
                      : '—'}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="card-desc" style={{ marginTop: '0.5rem' }}>
                Battery Status API is not exposed by this browser/desktop environment.
              </p>
            )}
          </div>

          <div className="system-info-card">
            <div className="stat-label">
              <Wifi size={15} />
              <span>Network & Peripheral Buses</span>
            </div>
            <dl className="system-kv-list">
              <div>
                <dt>Link Profile</dt>
                <dd>
                  {netConn
                    ? `${(netConn.effectiveType || 'unknown').toUpperCase()} · ${netConn.downlink ?? '?'} Mbps · ${netConn.rtt ?? '?'} ms`
                    : online
                      ? 'Connected (NetworkInfo N/A)'
                      : 'Offline'}
                </dd>
              </div>
              <div>
                <dt>WebUSB API</dt>
                <dd>{hasWebUSB ? 'Supported' : 'Unavailable'}</dd>
              </div>
              <div>
                <dt>WebHID API</dt>
                <dd>{hasWebHID ? 'Supported' : 'Unavailable'}</dd>
              </div>
              <div>
                <dt>Web Bluetooth</dt>
                <dd>{hasWebBT ? 'Supported' : 'Unavailable'}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
};
