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

  it('supports logging a FAIL defect and filtering by search query', () => {
    const onLogFail = vi.fn();
    render(
      <BatchHistoryTable
        records={[
          ...RECORDS,
          {
            id: 2,
            module: 'Mouse — FAIL',
            details: 'Double click fault on LMB',
            status: 'FAIL',
            timestamp: '20:51:00'
          }
        ]}
        onLogFail={onLogFail}
        onClearHistory={vi.fn()}
      />
    );

    const searchInput = screen.getByPlaceholderText('Filter by module or note...');
    fireEvent.change(searchInput, { target: { value: 'Double click' } });
    expect(screen.queryByText('Keyboard Verified — PASS')).toBeNull();
    expect(screen.getByText('Mouse — FAIL')).toBeTruthy();

    fireEvent.click(screen.getByText('Log Defect (FAIL)'));
    expect(onLogFail).toHaveBeenCalledTimes(1);
  });
});
