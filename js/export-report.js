/**
 * CSV & JSON Report Exporter for Batch Hardware Testing Sessions
 */
function exportBatchHistoryToCSV(historyList) {
  if (!historyList || historyList.length === 0) {
    alert('មិនទាន់មានទិន្នន័យតេស្តសម្រាប់ទាញយកទេ (No batch history to export).');
    return;
  }

  const headers = ['ID', 'Module', 'Details', 'Status', 'Timestamp'];
  const rows = historyList.map((item) => [
    item.id,
    `"${(item.module || '').replace(/"/g, '""')}"`,
    `"${(item.details || '').replace(/"/g, '""')}"`,
    'PASS',
    `"${item.time}"`
  ]);

  const csvContent =
    'data:text/csv;charset=utf-8,\uFEFF' +
    [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `hardware-test-report-${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

window.exportBatchHistoryToCSV = exportBatchHistoryToCSV;
