import { BatchMetadata, BatchRecord } from '../types/hardware';

export function exportBatchHistoryCSV(
  records: BatchRecord[],
  metadata?: BatchMetadata
): void {
  if (records.length === 0) return;

  const headers = [
    'ID',
    'Module',
    'Diagnostic Summary',
    'Status',
    'Timestamp',
    'Technician',
    'Asset Tag / Serial'
  ];
  const tech = (metadata?.technician || '').replace(/"/g, '""');
  const asset = (metadata?.assetTag || '').replace(/"/g, '""');

  const rows = records.map((r) => [
    String(r.id),
    `"${r.module.replace(/"/g, '""')}"`,
    `"${r.details.replace(/"/g, '""')}"`,
    r.status,
    `"${r.timestamp}"`,
    `"${tech}"`,
    `"${asset}"`
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

export function buildBatchHistoryJSON(
  records: BatchRecord[],
  metadata?: BatchMetadata
): string {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      technician: metadata?.technician || undefined,
      assetTag: metadata?.assetTag || undefined,
      totalRecords: records.length,
      records
    },
    null,
    2
  );
}

export function exportBatchHistoryJSON(
  records: BatchRecord[],
  metadata?: BatchMetadata
): void {
  if (records.length === 0) return;

  const jsonBody = buildBatchHistoryJSON(records, metadata);
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

export function buildBatchTicketSummary(
  records: BatchRecord[],
  metadata?: BatchMetadata
): string {
  const passCount = records.filter((r) => r.status === 'PASS').length;
  const failCount = records.filter((r) => r.status === 'FAIL').length;
  const lines: string[] = [
    '=== Hardware Diagnostic QA Summary ===',
    `Date: ${new Date().toLocaleString()}`
  ];
  if (metadata?.assetTag) lines.push(`Asset / Serial: ${metadata.assetTag}`);
  if (metadata?.technician) lines.push(`Technician: ${metadata.technician}`);
  lines.push(`Results: ${passCount} PASS, ${failCount} FAIL (${records.length} total)`);
  lines.push('');
  records.forEach((r) => {
    lines.push(`- [${r.status}] #${r.id} ${r.module}: ${r.details} (${r.timestamp})`);
  });
  return lines.join('\n');
}
