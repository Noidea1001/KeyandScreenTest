import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ScreenTester } from '../ScreenTester';

describe('ScreenTester', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders display checks and opens/closes stuck-pixel exerciser', () => {
    const onActivity = vi.fn();
    render(
      <ScreenTester
        isActive={true}
        resetSignal={0}
        onActivity={onActivity}
        onPass={vi.fn()}
      />
    );

    expect(screen.getByText('Stuck-Pixel Exerciser')).toBeTruthy();
    fireEvent.click(screen.getByText('Stuck-Pixel Exerciser'));
    expect(
      screen.getByText('Stuck-Pixel Exerciser Active (~30 Hz RGB Cycle)')
    ).toBeTruthy();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(
      screen.queryByText('Stuck-Pixel Exerciser Active (~30 Hz RGB Cycle)')
    ).toBeNull();
  });
});
