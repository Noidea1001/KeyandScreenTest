import React, { useState, useMemo } from 'react';
import {
  Download,
  FileJson,
  Printer,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Search
} from 'lucide-react';
import { BatchMetadata, BatchRecord } from '../types/hardware';
import {
  exportBatchHistoryCSV,
  exportBatchHistoryJSON
} from '../utils/csvExport';

interface BatchHistoryTableProps {
  records: BatchRecord[];
  metadata?: BatchMetadata;
  onMetadataChange?: (next: BatchMetadata) => void;
  onLogFail?: (moduleName: string, details: string) => void;
  onClearHistory: () => void;
}

export const BatchHistoryTable: React.FC<BatchHistoryTableProps> = ({
  records,
  metadata = { technician: '', assetTag: '' },
  onMetadataChange,
  onLogFail,
  onClearHistory
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PASS' | 'FAIL'>('ALL');
  const [failModule, setFailModule] = useState('Keyboard');
  const [failDetails, setFailDetails] = useState('');

  const filteredRecords = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return records.filter((r) => {
      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
      if (!q) return true;
      return (
        r.module.toLowerCase().includes(q) ||
        r.details.toLowerCase().includes(q) ||
        r.timestamp.toLowerCase().includes(q)
      );
    });
  }, [records, searchQuery, statusFilter]);

  const handleAddFail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onLogFail) return;
    const note = failDetails.trim() || 'Defect reported during QA inspection';
    onLogFail(`${failModule} — FAIL`, note);
    setFailDetails('');
  };
  return (
    <section className="module-panel active">
      <div className="print-certificate-header">
        <h2>Hardware Diagnostic Suite — QA Verification Certificate</h2>
        <p>
          Generated: {new Date().toLocaleString()} · Verified Modules: {records.length}
          {metadata.assetTag ? ` · Asset / Serial: ${metadata.assetTag}` : ''}
          {metadata.technician ? ` · Technician: ${metadata.technician}` : ''}
        </p>
      </div>
      <div className="batch-log-container">
        <div className="batch-log-header">
          <div>
            <h3 className="card-title">Batch Testing Verification Log</h3>
            <p className="card-desc">
              Complete audit log of all hardware units verified during the current testing session.
            </p>
          </div>
          <div className="card-actions">
            <button
              className="btn btn-primary"
              onClick={() => exportBatchHistoryCSV(records, metadata)}
              disabled={records.length === 0}
            >
              <Download size={15} />
              <span>Export CSV Report</span>
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => exportBatchHistoryJSON(records, metadata)}
              disabled={records.length === 0}
            >
              <FileJson size={15} />
              <span>Export JSON Report</span>
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => window.print()}
              disabled={records.length === 0}
            >
              <Printer size={15} />
              <span>Print / PDF Certificate</span>
            </button>
            <button
              className="btn btn-danger"
              onClick={onClearHistory}
              disabled={records.length === 0}
            >
              <Trash2 size={15} />
              <span>Clear Session Log</span>
            </button>
          </div>
        </div>

        <div className="batch-meta-bar">
          <label className="batch-meta-field">
            <span>Technician Name</span>
            <input
              type="text"
              className="btn text-input"
              placeholder="e.g. Alex M."
              value={metadata.technician}
              onChange={(e) =>
                onMetadataChange?.({ ...metadata, technician: e.target.value })
              }
            />
          </label>
          <label className="batch-meta-field">
            <span>Asset Tag / Serial #</span>
            <input
              type="text"
              className="btn text-input"
              placeholder="e.g. SN-2026-9941"
              value={metadata.assetTag}
              onChange={(e) =>
                onMetadataChange?.({ ...metadata, assetTag: e.target.value })
              }
            />
          </label>
          <label className="batch-meta-field">
            <span>Search Log</span>
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              <Search size={14} />
              <input
                type="text"
                className="btn text-input"
                style={{ width: '100%' }}
                placeholder="Filter by module or note..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </label>
          <label className="batch-meta-field" style={{ flex: '0 1 140px' }}>
            <span>Status Filter</span>
            <select
              className="btn select-input"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as 'ALL' | 'PASS' | 'FAIL')
              }
            >
              <option value="ALL">All ({records.length})</option>
              <option value="PASS">PASS Only</option>
              <option value="FAIL">FAIL Only</option>
            </select>
          </label>
        </div>

        {onLogFail && (
          <form className="batch-meta-bar" onSubmit={handleAddFail}>
            <select
              className="btn select-input"
              value={failModule}
              onChange={(e) => setFailModule(e.target.value)}
              aria-label="Defect Module"
            >
              <option value="Keyboard">Keyboard</option>
              <option value="Mouse">Mouse</option>
              <option value="Display">Display</option>
              <option value="Audio / Mic / Camera">Audio / Mic / Camera</option>
              <option value="Controller">Controller</option>
              <option value="Touch / Stylus">Touch / Stylus</option>
              <option value="System / Battery">System / Battery</option>
            </select>
            <input
              type="text"
              className="btn text-input"
              style={{ flex: '1 1 260px' }}
              placeholder="Describe hardware defect (e.g. Sticky Spacebar, Dead pixel at center)..."
              value={failDetails}
              onChange={(e) => setFailDetails(e.target.value)}
            />
            <button type="submit" className="btn btn-danger">
              <AlertTriangle size={14} />
              <span>Log Defect (FAIL)</span>
            </button>
          </form>
        )}

        <table className="batch-table">
          <thead>
            <tr>
              <th>Unit #</th>
              <th>Module / Device Type</th>
              <th>Diagnostic Summary</th>
              <th>Result</th>
              <th>Verified Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty-table-cell">
                  {records.length === 0
                    ? 'No verified devices recorded in this session yet.'
                    : 'No log entries match your current search or filter.'}
                </td>
              </tr>
            ) : (
              filteredRecords.map((item) => (
                <tr key={item.id}>
                  <td className="mono-cell">#{item.id}</td>
                  <td className="strong-cell">{item.module}</td>
                  <td className="muted-cell">{item.details}</td>
                  <td>
                    {item.status === 'FAIL' ? (
                      <span className="badge-fail">
                        <AlertTriangle size={12} />
                        <span>FAIL</span>
                      </span>
                    ) : (
                      <span className="badge-pass">
                        <CheckCircle2 size={12} />
                        <span>PASS</span>
                      </span>
                    )}
                  </td>
                  <td className="mono-cell">{item.timestamp}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
