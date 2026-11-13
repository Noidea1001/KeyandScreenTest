import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { TouchTester } from '../TouchTester';

describe('TouchTester', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders 24 touch grid cells and resets when Reset Grid is clicked', () => {
    render(
      <TouchTester resetSignal={0} onActivity={vi.fn()} onPass={vi.fn()} />
    );

    expect(screen.getByText('Dead-Zone Touch & Stylus Grid')).toBeTruthy();
    expect(screen.getByText('0/24 (0%)')).toBeTruthy();

    fireEvent.click(screen.getByText('Reset Grid'));
    expect(screen.getByText('0/24 (0%)')).toBeTruthy();
  });
});
