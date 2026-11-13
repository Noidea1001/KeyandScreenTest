import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  exportBatchHistoryCSV,
  buildBatchHistoryJSON,
  exportBatchHistoryJSON
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

  it('builds structured JSON report payload', () => {
    const json = buildBatchHistoryJSON(SAMPLE_RECORDS);
    const parsed = JSON.parse(json);
    expect(parsed.totalRecords).toBe(1);
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
});
