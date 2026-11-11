import React from 'react';
import {
  Cpu,
  CheckCircle2,
  Clock,
  Volume2,
  VolumeX,
  RotateCcw,
  Sun,
  Moon
} from 'lucide-react';
import { ThemeMode } from '../types/hardware';
import { formatCountdownTime } from '../utils/formatters';

interface HeaderProps {
  passCount: number;
  resetDurationSec: number;
  remainingSec: number;
  soundEnabled: boolean;
  theme: ThemeMode;
  onDurationChange: (seconds: number) => void;
  onToggleSound: () => void;
  onToggleTheme: () => void;
  onInstantReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  passCount,
  resetDurationSec,
  remainingSec,
  soundEnabled,
  theme,
  onDurationChange,
  onToggleSound,
  onToggleTheme,
  onInstantReset
}) => {
  return (
    <header className="top-header">
      <div className="brand">
        <div className="brand-icon">
          <Cpu size={20} strokeWidth={2.2} />
        </div>
        <div className="brand-title">
          <h1>Hardware Diagnostic Suite</h1>
          <p>All-in-One Peripheral & Display Verification System</p>
        </div>
      </div>

      <div className="global-controls">
        <div className="batch-counter" title="Total verified devices in this session">
          <CheckCircle2 size={16} />
          <span>Verified (PASS):</span>
          <span className="count-badge">{passCount}</span>
        </div>

        <div className="timer-control" title="Configure automatic session reset interval">
          <Clock size={15} className="text-muted-icon" />
          <span>Auto-Reset:</span>
          <select
            value={resetDurationSec}
            onChange={(e) => onDurationChange(Number(e.target.value))}
          >
            <option value={600}>10 Minutes (Default)</option>
            <option value={300}>5 Minutes</option>
            <option value={60}>1 Minute</option>
            <option value={30}>30 Seconds</option>
            <option value={10}>10 Seconds (Fast Batch)</option>
            <option value={5}>5 Seconds (Rapid Batch)</option>
          </select>
          <span className="inactivity-pill">{formatCountdownTime(remainingSec)}</span>
        </div>

        <button
          className="btn"
          onClick={onToggleTheme}
          title="Switch between Dark Grey and Light appearance"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Grey'}</span>
        </button>

        <button className="btn" onClick={onToggleSound} title="Toggle audio feedback">
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          <span>Audio: {soundEnabled ? 'ON' : 'OFF'}</span>
        </button>

        <button
          className="btn btn-danger"
          onClick={onInstantReset}
          title="Reset current module immediately (Shortcut: Press ESC 3 times)"
        >
          <RotateCcw size={15} />
          <span>Reset Now</span>
        </button>
      </div>
    </header>
  );
};
