export function formatCountdownTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function getAspectRatioString(width: number, height: number): string {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height);
  return `${width / divisor}:${height / divisor}`;
}

export function classifyMousePollingRate(hz: number): string {
  if (hz >= 900) return '1000 Hz Class (High-Speed Gaming)';
  if (hz >= 450) return '500 Hz Class (Performance)';
  if (hz >= 220) return '250 Hz Class (Fast)';
  if (hz >= 100) return '125 Hz Class (Standard)';
  return 'Idle / Waiting for Movement';
}
