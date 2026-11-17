import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MouseTester } from '../MouseTester';

describe('MouseTester', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders switch diagram, DPI calibration toggle, and resets cleanly', () => {
    const onActivity = vi.fn();
    render(
      <MouseTester
        isActive={true}
        resetSignal={0}
        onActivity={onActivity}
        onPass={vi.fn()}
      />
    );

    expect(screen.getByText('Interactive Switch Diagram')).toBeTruthy();
    const dpiBtn = screen.getByText('Estimate DPI (Move 1 in)');
    fireEvent.click(dpiBtn);
    expect(screen.getByText('Stop 1-Inch DPI Check')).toBeTruthy();
    expect(onActivity).toHaveBeenCalled();

    fireEvent.click(screen.getByText('Reset Mouse Test'));
    expect(screen.getByText('0 / 5')).toBeTruthy();
  });
});
