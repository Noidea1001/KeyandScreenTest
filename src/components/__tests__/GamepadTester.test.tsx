import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { GamepadTester } from '../GamepadTester';

describe('GamepadTester', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders controller status and triggers manual PASS callback', () => {
    const onPass = vi.fn();
    render(<GamepadTester isActive={false} onPass={onPass} />);

    expect(
      screen.getByText('Controller & Analog Axis Drift Diagnostic')
    ).toBeTruthy();
    fireEvent.click(screen.getByText('Mark Controller Verified (PASS)'));
    expect(onPass).toHaveBeenCalledWith(
      'Controller Verified — PASS',
      'Controller manual verification completed'
    );
  });
});
