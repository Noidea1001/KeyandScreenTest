import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  exportBatchHistoryCSV,
  buildBatchHistoryJSON,
  exportBatchHistoryJSON,
  buildBatchTicketSummary
} from '../csvExport';
import { BatchRecord } from '../../types/hardware';

const SAMPLE_RECORDS: BatchRecord[] = [
  {
    id: 1,
    module: 'Keyboard',
    details: 'Full 104-key pass, 0 chatter',
    status: 'PASS',
    timestamp: '2026-11-13 20:00:00'
  }
];

describe('report exports', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('builds structured JSON report payload with optional metadata', () => {
    const json = buildBatchHistoryJSON(SAMPLE_RECORDS, {
      technician: 'Alex',
      assetTag: 'SN-100'
    });
    const parsed = JSON.parse(json);
    expect(parsed.totalRecords).toBe(1);
    expect(parsed.technician).toBe('Alex');
    expect(parsed.assetTag).toBe('SN-100');
    expect(parsed.records).toEqual(SAMPLE_RECORDS);
    expect(typeof parsed.exportedAt).toBe('string');
  });

  it('does nothing on empty records for CSV and JSON exports', () => {
    const createSpy = vi.spyOn(document, 'createElement');
    exportBatchHistoryCSV([]);
    exportBatchHistoryJSON([]);
    expect(createSpy).not.toHaveBeenCalled();
  });

  it('triggers download anchor for CSV export', () => {
    const clickMock = vi.fn();
    const anchor = document.createElement('a');
    anchor.click = clickMock;
    vi.spyOn(document, 'createElement').mockReturnValue(anchor);

    exportBatchHistoryCSV(SAMPLE_RECORDS);
    expect(clickMock).toHaveBeenCalledTimes(1);
    expect(anchor.getAttribute('download')).toMatch(
      /^hardware-diagnostic-report-\d+\.csv$/
    );
  });

  it('formats a plain-text ticket summary with metadata and PASS/FAIL counts', () => {
    const summary = buildBatchTicketSummary(SAMPLE_RECORDS, {
      technician: 'Alex',
      assetTag: 'SN-555'
    });
    expect(summary).toContain('Asset / Serial: SN-555');
    expect(summary).toContain('Technician: Alex');
    expect(summary).toContain('Results: 1 PASS, 0 FAIL (1 total)');
    expect(summary).toContain('[PASS] #1 Keyboard');
  });
});
