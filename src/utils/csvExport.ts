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

export function buildBatchHistoryJSON(records: BatchRecord[]): string {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      totalRecords: records.length,
      records
    },
    null,
    2
  );
}

export function exportBatchHistoryJSON(records: BatchRecord[]): void {
  if (records.length === 0) return;

  const jsonBody = buildBatchHistoryJSON(records);
  const blob = new Blob([jsonBody], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `hardware-diagnostic-report-${Date.now()}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
