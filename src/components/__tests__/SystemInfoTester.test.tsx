import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { SystemInfoTester } from '../SystemInfoTester';

describe('SystemInfoTester', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders system telemetry sections and logs PASS on button click', () => {
    const onActivity = vi.fn();
    const onPass = vi.fn();

    render(<SystemInfoTester onActivity={onActivity} onPass={onPass} />);

    expect(screen.getByText('System, GPU & Battery Telemetry')).toBeTruthy();
    expect(screen.getByText('Compute & Platform')).toBeTruthy();
    expect(screen.getByText('Graphics & Display')).toBeTruthy();
    expect(screen.getByText('Battery Status')).toBeTruthy();

    fireEvent.click(screen.getByText('Log System PASS'));
    expect(onActivity).toHaveBeenCalledTimes(1);
    expect(onPass).toHaveBeenCalledTimes(1);
    expect(onPass.mock.calls[0][0]).toBe(
      'System & Battery Telemetry Verified — PASS'
    );
  });
});
