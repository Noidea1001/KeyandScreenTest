import { describe, it, expect } from 'vitest';
import {
  formatCountdownTime,
  getAspectRatioString,
  classifyMousePollingRate
} from '../formatters';

describe('formatters', () => {
  it('formats countdown time as MM:SS', () => {
    expect(formatCountdownTime(0)).toBe('00:00');
    expect(formatCountdownTime(59)).toBe('00:59');
    expect(formatCountdownTime(60)).toBe('01:00');
    expect(formatCountdownTime(600)).toBe('10:00');
  });

  it('computes simplified aspect ratio strings', () => {
    expect(getAspectRatioString(1920, 1080)).toBe('16:9');
    expect(getAspectRatioString(2560, 1600)).toBe('8:5');
    expect(getAspectRatioString(3440, 1440)).toBe('43:18');
    expect(getAspectRatioString(1024, 768)).toBe('4:3');
  });

  it('classifies mouse polling rates accurately', () => {
    expect(classifyMousePollingRate(0)).toBe('Idle / Waiting for Movement');
    expect(classifyMousePollingRate(125)).toBe('125 Hz Class (Standard)');
    expect(classifyMousePollingRate(250)).toBe('250 Hz Class (Fast)');
    expect(classifyMousePollingRate(500)).toBe('500 Hz Class (Performance)');
    expect(classifyMousePollingRate(1000)).toBe('1000 Hz Class (High-Speed Gaming)');
  });
});
