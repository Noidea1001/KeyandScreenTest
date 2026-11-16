import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { QAChecklistBar } from '../QAChecklistBar';

describe('QAChecklistBar', () => {
  afterEach(() => {
    cleanup();
  });

  it('displays progress and navigates to the next untested module', () => {
    const onSelectTab = vi.fn();
    render(
      <QAChecklistBar
        activeTab="keyboard"
        passedModules={new Set(['keyboard'])}
        onSelectTab={onSelectTab}
      />
    );

    expect(screen.getByText('1/7')).toBeTruthy();
    fireEvent.click(screen.getByText('Next: Mouse'));
    expect(onSelectTab).toHaveBeenCalledWith('mouse');
  });

  it('shows ALL 7 MODULES VERIFIED when all modules pass', () => {
    render(
      <QAChecklistBar
        activeTab="system"
        passedModules={
          new Set(['keyboard', 'mouse', 'screen', 'media', 'gamepad', 'touch', 'system'])
        }
        onSelectTab={vi.fn()}
      />
    );

    expect(screen.getByText('ALL 7 MODULES VERIFIED')).toBeTruthy();
  });

  it('allows reporting a FAIL defect for the active module', () => {
    const onReportFail = vi.fn();
    render(
      <QAChecklistBar
        activeTab="mouse"
        passedModules={new Set()}
        onSelectTab={vi.fn()}
        onReportFail={onReportFail}
      />
    );

    fireEvent.click(screen.getByText('Report Mouse FAIL'));
    fireEvent.change(screen.getByPlaceholderText('Defect in Mouse...'), {
      target: { value: 'Scroll wheel skips' }
    });
    fireEvent.click(screen.getByText('Save FAIL'));
    expect(onReportFail).toHaveBeenCalledWith('Mouse — FAIL', 'Scroll wheel skips');
  });
});
