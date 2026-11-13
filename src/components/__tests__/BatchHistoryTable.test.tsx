import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { BatchHistoryTable } from '../BatchHistoryTable';
import { BatchRecord } from '../../types/hardware';

const RECORDS: BatchRecord[] = [
  {
    id: 1,
    module: 'Keyboard Verified — PASS',
    details: '104/104 keys passed',
    status: 'PASS',
    timestamp: '20:50:00'
  }
];

describe('BatchHistoryTable', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('disables export and print buttons when records are empty', () => {
    render(<BatchHistoryTable records={[]} onClearHistory={vi.fn()} />);

    expect(
      (screen.getByText('Export CSV Report').closest('button') as HTMLButtonElement)
        .disabled
    ).toBe(true);
    expect(
      (screen.getByText('Export JSON Report').closest('button') as HTMLButtonElement)
        .disabled
    ).toBe(true);
    expect(
      (
        screen.getByText('Print / PDF Certificate').closest(
          'button'
        ) as HTMLButtonElement
      ).disabled
    ).toBe(true);
  });

  it('triggers window.print when Print / PDF Certificate is clicked', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    render(<BatchHistoryTable records={RECORDS} onClearHistory={vi.fn()} />);

    fireEvent.click(screen.getByText('Print / PDF Certificate'));
    expect(printSpy).toHaveBeenCalledTimes(1);
  });
});
