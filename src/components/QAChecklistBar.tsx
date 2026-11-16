import React, { useState } from 'react';
import { AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { ModuleTab } from '../types/hardware';

interface QAChecklistBarProps {
  activeTab: ModuleTab;
  passedModules: Set<ModuleTab>;
  onSelectTab: (tab: ModuleTab) => void;
  onReportFail?: (moduleLabel: string, note: string) => void;
}

const DIAGNOSTIC_MODULES: { id: ModuleTab; label: string }[] = [
  { id: 'keyboard', label: 'Keyboard' },
  { id: 'mouse', label: 'Mouse' },
  { id: 'screen', label: 'Display' },
  { id: 'media', label: 'Audio/Cam' },
  { id: 'gamepad', label: 'Controller' },
  { id: 'touch', label: 'Touch/Stylus' },
  { id: 'system', label: 'System' }
];

export const QAChecklistBar: React.FC<QAChecklistBarProps> = ({
  activeTab,
  passedModules,
  onSelectTab,
  onReportFail
}) => {
  const [showFailForm, setShowFailForm] = useState(false);
  const [failNote, setFailNote] = useState('');

  const passedCount = DIAGNOSTIC_MODULES.filter((m) =>
    passedModules.has(m.id)
  ).length;
  const totalCount = DIAGNOSTIC_MODULES.length;
  const nextUntested = DIAGNOSTIC_MODULES.find((m) => !passedModules.has(m.id));
  const currentModule = DIAGNOSTIC_MODULES.find((m) => m.id === activeTab);
  const pct = Math.round((passedCount / totalCount) * 100);

  const handleQuickFail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onReportFail || !currentModule) return;
    onReportFail(
      `${currentModule.label} — FAIL`,
      failNote.trim() || `${currentModule.label} failed QA inspection`
    );
    setFailNote('');
    setShowFailForm(false);
  };

  return (
    <div className="qa-checklist-bar">
      <div className="qa-checklist-left">
        <span className="qa-checklist-title">
          <CheckCircle2 size={14} className="text-green" />
          <span>
            QA Progress: <strong>{passedCount}/{totalCount}</strong> ({pct}%)
          </span>
        </span>
        <div className="qa-progress-track" aria-label="QA Module Progress">
          <div className="qa-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="qa-pills">
          {DIAGNOSTIC_MODULES.map((m) => {
            const done = passedModules.has(m.id);
            const current = activeTab === m.id;
            return (
              <button
                key={m.id}
                className={`qa-pill ${done ? 'done' : ''} ${current ? 'current' : ''}`}
                onClick={() => onSelectTab(m.id)}
              >
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="qa-checklist-actions">
        {onReportFail && currentModule && (
          <>
            {showFailForm ? (
              <form className="qa-quick-fail-form" onSubmit={handleQuickFail}>
                <input
                  type="text"
                  className="btn text-input"
                  placeholder={`Defect in ${currentModule.label}...`}
                  value={failNote}
                  onChange={(e) => setFailNote(e.target.value)}
                  autoFocus
                />
                <button type="submit" className="btn btn-danger">
                  Save FAIL
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowFailForm(false)}
                >
                  Cancel
                </button>
              </form>
            ) : (
              <button
                className="btn btn-danger"
                onClick={() => setShowFailForm(true)}
                title={`Log a FAIL defect for ${currentModule.label}`}
              >
                <AlertTriangle size={14} />
                <span>Report {currentModule.label} FAIL</span>
              </button>
            )}
          </>
        )}

        {nextUntested ? (
          <button
            className="btn btn-primary qa-next-btn"
            onClick={() => onSelectTab(nextUntested.id)}
          >
            <span>Next: {nextUntested.label}</span>
            <ArrowRight size={14} />
          </button>
        ) : (
          <span className="badge-pass">ALL 7 MODULES VERIFIED</span>
        )}
      </div>
    </div>
  );
};
