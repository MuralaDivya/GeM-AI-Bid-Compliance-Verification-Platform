import React from 'react';
import { X, CheckCircle2, AlertTriangle, XCircle, FileText } from 'lucide-react';
import { ComplianceMatrixItem } from '../../types';

interface EvidenceModalProps {
  isOpen: boolean;
  item: ComplianceMatrixItem | null;
  onClose: () => void;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({
  isOpen,
  item,
  onClose,
}) => {
  if (!isOpen || !item) return null;

  const getStatusDisplay = () => {
    switch (item.overallStatus) {
      case 'COMPLIANT':
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
          label: 'Compliant',
          badgeClass: 'bg-green-50 text-green-800 border-green-200',
        };
      case 'REVIEW_REQUIRED':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
          label: 'Needs Review',
          badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
        };
      case 'MISSING':
      case 'NON_COMPLIANT':
        return {
          icon: <XCircle className="w-5 h-5 text-red-600" />,
          label: 'Missing / Non-Compliant',
          badgeClass: 'bg-red-50 text-red-800 border-red-200',
        };
      default:
        return {
          icon: <AlertTriangle className="w-5 h-5 text-slate-500" />,
          label: item.overallStatus,
          badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
        };
    }
  };

  const status = getStatusDisplay();
  const rawValues = item.documentRef?.extraction?.rawKeyValues || {};
  const sourcePages = rawValues['Source Pages'] || 'Extracted from combined PDF';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-2">
            {status.icon}
            <div>
              <h3 className="text-base font-bold text-slate-900">{item.requirementName}</h3>
              <p className="text-xs text-slate-500">Requirement Code: {item.requirementCode}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4 text-sm">
          {/* Status Badge */}
          <div className="flex items-center justify-between p-3 rounded-md border bg-slate-50 border-slate-200">
            <span className="text-xs font-semibold text-slate-700">Verification Result</span>
            <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${status.badgeClass}`}>
              {status.label}
            </span>
          </div>

          {/* Expected Requirement */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Expected
            </label>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs text-slate-800">
              {item.requirementName} ({item.level === 'REQUIRED' ? 'Mandatory Statutory Requirement' : 'Optional Criterion'})
            </div>
          </div>

          {/* Extracted Information */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Extracted Information
            </label>
            {item.hasDocument && Object.keys(rawValues).length > 0 ? (
              <div className="bg-slate-50 border border-slate-200 rounded divide-y divide-slate-200 text-xs">
                {Object.entries(rawValues)
                  .filter(([k]) => k !== 'Source Pages')
                  .map(([key, val]) => (
                    <div key={key} className="flex py-2 px-3 justify-between">
                      <span className="text-slate-500 font-medium">{key}:</span>
                      <span className="font-semibold text-slate-900 text-right max-w-xs">{String(val)}</span>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="p-3 bg-red-50/50 border border-red-200 rounded text-xs text-red-700">
                No matching certificate or declaration was identified in the uploaded PDF.
              </div>
            )}
          </div>

          {/* Source Location */}
          {item.hasDocument && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Source Document & Pages
              </label>
              <div className="flex items-center space-x-2 p-2.5 bg-blue-50/60 border border-blue-100 rounded text-xs text-blue-900">
                <FileText className="w-4 h-4 text-blue-700" />
                <span className="font-semibold">{item.documentRef?.documentType || 'Uploaded Bidder PDF'}</span>
                <span>—</span>
                <span className="font-medium text-blue-700">{sourcePages}</span>
              </div>
            </div>
          )}

          {/* Explanation */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Analysis Summary
            </label>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 border border-slate-200 rounded">
              {item.aiExplanation || 'Document verified against tender requirements.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
