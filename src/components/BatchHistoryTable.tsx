import React from 'react';
import { Download, FileJson, Printer, Trash2, CheckCircle2 } from 'lucide-react';
import { BatchRecord } from '../types/hardware';
import {
  exportBatchHistoryCSV,
  exportBatchHistoryJSON
} from '../utils/csvExport';

interface BatchHistoryTableProps {
  records: BatchRecord[];
  onClearHistory: () => void;
}

export const BatchHistoryTable: React.FC<BatchHistoryTableProps> = ({
  records,
  onClearHistory
}) => {
  return (
    <section className="module-panel active">
      <div className="print-certificate-header">
        <h2>Hardware Diagnostic Suite — QA Verification Certificate</h2>
        <p>
          Generated: {new Date().toLocaleString()} · Verified Modules: {records.length}
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
              onClick={() => exportBatchHistoryCSV(records)}
              disabled={records.length === 0}
            >
              <Download size={15} />
              <span>Export CSV Report</span>
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => exportBatchHistoryJSON(records)}
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
            {records.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty-table-cell">
                  No verified devices recorded in this session yet.
                </td>
              </tr>
            ) : (
              records.map((item) => (
                <tr key={item.id}>
                  <td className="mono-cell">#{item.id}</td>
                  <td className="strong-cell">{item.module}</td>
                  <td className="muted-cell">{item.details}</td>
                  <td>
                    <span className="badge-pass">
                      <CheckCircle2 size={12} />
                      <span>{item.status}</span>
                    </span>
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
