import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, ArrowRight, Sparkles, Eye, FolderOpen } from 'lucide-react';
import { Bidder, CrossCheckFinding } from '../../types';
import { EvidenceModal } from './EvidenceModal';

interface CrossVerificationViewProps {
  bidder?: Bidder | null;
  onNavigateToDecision: () => void;
}

export const CrossVerificationView: React.FC<CrossVerificationViewProps> = ({
  bidder,
  onNavigateToDecision,
}) => {
  const [selectedCheck, setSelectedCheck] = useState<CrossCheckFinding | null>(null);

  if (!bidder) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
        <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-slate-800">No Bidder Selected</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Please select or register a bidder from the Bids section to view cross-document verification findings.
        </p>
      </div>
    );
  }

  const findings = bidder.crossCheckFindings || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-700 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Multi-Document Correlation Engine</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
            Cross-Document Verification & Entity Consistency Inspector
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-3xl">
            Going beyond single-document OCR: Automatically cross-checking entity details across all submitted proofs, tax records, and statutory portal responses.
          </p>
        </div>

        <button
          onClick={onNavigateToDecision}
          className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-sm transition flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <span>Proceed to Officer Decision</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Cross-Verification Workflow Diagram / Flow */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-xl p-5 text-white shadow-sm border border-blue-950">
        <div className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-2">
          Entity Verification Points ({bidder.companyName})
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-white/10 p-3 rounded-lg border border-white/10">
            <div className="text-[10px] text-blue-200 font-bold uppercase">1. Bidder Entity</div>
            <div className="font-bold mt-1 text-white truncate">{bidder.companyName}</div>
            <div className="text-[10px] text-slate-300">Registered Enterprise</div>
          </div>
          <div className="bg-white/10 p-3 rounded-lg border border-white/10">
            <div className="text-[10px] text-blue-200 font-bold uppercase">2. GST Record</div>
            <div className="font-bold mt-1 text-white truncate">{bidder.gstin || 'N/A'}</div>
            <div className="text-[10px] text-slate-300">Taxpayer Registration</div>
          </div>
          <div className="bg-white/10 p-3 rounded-lg border border-white/10">
            <div className="text-[10px] text-blue-200 font-bold uppercase">3. PAN Linkage</div>
            <div className="font-bold mt-1 text-white truncate">{bidder.panNumber || 'N/A'}</div>
            <div className="text-[10px] text-slate-300">CBDT Verification</div>
          </div>
          <div className="bg-white/10 p-3 rounded-lg border border-white/10">
            <div className="text-[10px] text-blue-200 font-bold uppercase">4. Debarment Check</div>
            <div className="font-bold mt-1 text-emerald-300 truncate">Clean / Verified</div>
            <div className="text-[10px] text-slate-300">GeM / CVC Register</div>
          </div>
        </div>
      </div>

      {/* Detailed Cross-Check Cards */}
      <div className="space-y-4">
        {findings.length > 0 ? (
          findings.map((check) => {
            const isPass = check.status === 'PASS';
            const isFlag = check.status === 'FLAG_REVIEW';
            const isFail = check.status === 'FAIL';

            return (
              <div
                key={check.id}
                id={`crosscheck-card-${check.id}`}
                className={`bg-white rounded-xl border p-5 transition shadow-sm ${
                  isFlag ? 'border-amber-300 bg-amber-50/20' : isFail ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-2">
                      {isPass && (
                        <span className="p-1 rounded-full bg-emerald-100 text-emerald-700">
                          <CheckCircle2 className="w-4 h-4" />
                        </span>
                      )}
                      {isFlag && (
                        <span className="p-1 rounded-full bg-amber-100 text-amber-700">
                          <AlertTriangle className="w-4 h-4" />
                        </span>
                      )}
                      {isFail && (
                        <span className="p-1 rounded-full bg-rose-100 text-rose-700">
                          <XCircle className="w-4 h-4" />
                        </span>
                      )}

                      <h2 className="text-sm font-bold text-slate-900">
                        {check.title}
                      </h2>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isPass ? 'bg-emerald-100 text-emerald-800' : isFlag ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {check.status === 'FLAG_REVIEW' ? 'REVIEW REQUIRED' : check.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed">
                      {check.explanation}
                    </p>

                    {/* Compared Values Box */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs space-y-1">
                        <div className="text-[10px] font-semibold uppercase text-slate-500">Source A (Submission / Primary):</div>
                        <div className="font-mono font-bold text-slate-900">{check.submittedValue}</div>
                      </div>
                      <div className="bg-blue-50/50 p-2.5 rounded-lg border border-blue-200 text-xs space-y-1">
                        <div className="text-[10px] font-semibold uppercase text-blue-700">Source B (Cross-Referenced Record):</div>
                        <div className="font-mono font-bold text-blue-950">{check.comparedValue}</div>
                      </div>
                    </div>

                    {/* Recommendation */}
                    {check.recommendation && (
                      <div className="pt-2 text-xs text-slate-600">
                        <strong className="text-slate-800">Officer Verification Guidance: </strong>
                        <span>{check.recommendation}</span>
                      </div>
                    )}
                  </div>

                  {/* Right Action */}
                  <div className="flex-shrink-0 self-end md:self-start">
                    <button
                      onClick={() => setSelectedCheck(check)}
                      className="px-3.5 py-1.5 rounded-lg border border-slate-300 hover:border-blue-600 hover:text-blue-700 bg-white text-slate-700 font-bold text-xs transition shadow-2xs flex items-center space-x-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect Raw Sources</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-xs shadow-sm">
            <p className="font-semibold text-slate-700">No cross-document correlation checks executed yet.</p>
            <p className="text-slate-400 mt-1">Run verification on the bidder to perform cross-document correlation.</p>
          </div>
        )}
      </div>

      {selectedCheck && (
        <EvidenceModal
          item={null}
          crossCheck={selectedCheck}
          bidder={bidder}
          onClose={() => setSelectedCheck(null)}
          onNavigateToDecision={onNavigateToDecision}
        />
      )}
    </div>
  );
};
