import React from 'react';
import { CheckCircle, RotateCcw } from 'lucide-react';
import { PassNotification } from '../types/hardware';
import { formatCountdownTime } from '../utils/formatters';

interface PassBannerProps {
  notification: PassNotification | null;
  remainingSec: number;
  onResetNow: () => void;
}

export const PassBanner: React.FC<PassBannerProps> = ({
  notification,
  remainingSec,
  onResetNow
}) => {
  if (!notification) return null;

  return (
    <div className="pass-banner visible">
      <div className="pass-badge-large">
        <div className="pass-stamp">
          <CheckCircle size={22} />
          <span>PASS</span>
        </div>
        <div>
          <h2 className="pass-banner-title">{notification.title}</h2>
          <p className="pass-banner-desc">{notification.description}</p>
        </div>
      </div>

      <div className="pass-countdown-box">
        <div>
          <div className="pass-countdown-label">
            Auto-resetting for next device in:
          </div>
          <div className="countdown-digits">{formatCountdownTime(remainingSec)}</div>
        </div>
        <button className="btn btn-success" onClick={onResetNow}>
          <RotateCcw size={15} />
          <span>Reset Now (Test Next Device)</span>
        </button>
      </div>
    </div>
  );
};
