import { BatchRecord } from '../types/hardware';

export function exportBatchHistoryCSV(records: BatchRecord[]): void {
  if (records.length === 0) return;

  const headers = ['ID', 'Module', 'Diagnostic Summary', 'Status', 'Timestamp'];
  const rows = records.map((r) => [
    String(r.id),
    `"${r.module.replace(/"/g, '""')}"`,
    `"${r.details.replace(/"/g, '""')}"`,
    r.status,
    `"${r.timestamp}"`
  ]);

  const csvBody =
    'data:text/csv;charset=utf-8,\uFEFF' +
    [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

  const link = document.createElement('a');
  link.setAttribute('href', encodeURI(csvBody));
  link.setAttribute('download', `hardware-diagnostic-report-${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
