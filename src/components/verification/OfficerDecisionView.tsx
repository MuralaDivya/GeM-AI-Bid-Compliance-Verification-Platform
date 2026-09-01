import React, { useState } from 'react';
import { UserCheck, ShieldAlert, CheckCircle2, XCircle, AlertTriangle, Lock, FolderOpen } from 'lucide-react';
import { Bidder, Tender, OfficerDecision } from '../../types';

interface OfficerDecisionViewProps {
  bidder?: Bidder | null;
  tender?: Tender | null;
  officerName: string;
  onSaveDecision: (payload: {
    bidderId: string;
    decision: OfficerDecision['decision'];
    comments: string;
    officerName: string;
    officerDesignation: string;
    overriddenChecks?: string[];
  }) => void;
  onNavigateToAudit: () => void;
}

export const OfficerDecisionView: React.FC<OfficerDecisionViewProps> = ({
  bidder,
  tender,
  officerName,
  onSaveDecision,
  onNavigateToAudit,
}) => {
  const [decision, setDecision] = useState<OfficerDecision['decision']>(
    bidder?.officerDecision?.decision || 'QUALIFIED'
  );
  const [comments, setComments] = useState<string>(
    bidder?.officerDecision?.comments || ''
  );
  const [officerDesignation, setOfficerDesignation] = useState('Senior Manager (Procurement)');
  const [acknowledgedAI, setAcknowledgedAI] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  if (!bidder) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
        <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-slate-800">No Bidder Selected</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Please select or register a bidder from the Bids section to record official qualification decisions.
        </p>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveDecision({
      bidderId: bidder.id,
      decision,
      comments,
      officerName,
      officerDesignation,
    });
    setIsSaved(true);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-700 uppercase tracking-wider">
            <UserCheck className="w-4 h-4 text-blue-700" />
            <span>Human in the Loop • Final Statutory Evaluation</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
            Procurement Officer Decision & Eligibility Determination
          </h1>
        </div>

        <button
          onClick={onNavigateToAudit}
          className="px-3.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition shadow-2xs self-start sm:self-auto"
        >
          View Audit Trail
        </button>
      </div>

      {/* Critical Statutory Mandate Banner */}
      <div className="bg-amber-50 rounded-xl p-4 border border-amber-300 text-amber-900 shadow-xs flex items-start space-x-3">
        <ShieldAlert className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <div className="font-bold text-amber-950 uppercase tracking-wider text-[11px]">
            Statutory Protocol Notice (GFR / CVC Procurement Guidelines)
          </div>
          <p className="leading-relaxed">
            The AI platform functions strictly as an evidence gathering and decision-support assistant. Under Government of India General Financial Rules (GFR), the system <strong>does not automatically qualify or disqualify</strong> any bidder. The formal qualification verdict, evaluation rationale, and legal accountability reside solely with the authorized Procurement Officer.
          </p>
        </div>
      </div>

      {/* Bidder Particulars Summary */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs">
            {tender && <span className="font-mono font-bold text-blue-700">{tender.tenderNumber}</span>}
            <span>•</span>
            <span className="font-mono text-slate-500">{bidder.bidderNumber}</span>
          </div>
          <h2 className="text-base font-black text-slate-900 mt-0.5">
            {bidder.companyName}
          </h2>
          <div className="text-xs text-slate-500 font-mono mt-0.5">
            PAN: {bidder.panNumber || 'N/A'} | GSTIN: {bidder.gstin || 'N/A'} | Enterprise: {bidder.enterpriseType}
          </div>
        </div>

        <div className="flex items-center space-x-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-500">AI Score</div>
            <div className="text-xl font-black text-blue-700">{bidder.complianceScore}%</div>
          </div>
          <div className="text-right pl-3 border-l border-slate-200">
            <div className="text-[10px] uppercase font-bold text-slate-500">Assessed Risk</div>
            <div className="text-sm font-black text-amber-700">{bidder.riskLevel || 'LOW'}</div>
          </div>
        </div>
      </div>

      {/* Officer Decision Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
        {/* Section 1: Qualification Verdict */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-900">
            1. Select Official Eligibility Verdict *
          </label>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Option 1: Manual Review Pending */}
            <label
              className={`p-4 rounded-xl border-2 transition cursor-pointer flex flex-col justify-between space-y-2 ${
                decision === 'MANUAL_REVIEW_PENDING'
                  ? 'border-amber-500 bg-amber-50/50 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-amber-900 flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Manual Review / Clarification</span>
                </span>
                <input
                  type="radio"
                  name="officer-decision"
                  value="MANUAL_REVIEW_PENDING"
                  checked={decision === 'MANUAL_REVIEW_PENDING'}
                  onChange={() => setDecision('MANUAL_REVIEW_PENDING')}
                  className="text-amber-600 focus:ring-amber-500"
                />
              </div>
              <p className="text-[11px] text-slate-600">
                Bidder is eligible subject to submission of missing documents or clarification.
              </p>
            </label>

            {/* Option 2: Qualified */}
            <label
              className={`p-4 rounded-xl border-2 transition cursor-pointer flex flex-col justify-between space-y-2 ${
                decision === 'QUALIFIED'
                  ? 'border-emerald-500 bg-emerald-50/50 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-emerald-900 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Officially Qualified</span>
                </span>
                <input
                  type="radio"
                  name="officer-decision"
                  value="QUALIFIED"
                  checked={decision === 'QUALIFIED'}
                  onChange={() => setDecision('QUALIFIED')}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
              </div>
              <p className="text-[11px] text-slate-600">
                Bidder meets all mandatory statutory criteria. Clear to open commercial bid.
              </p>
            </label>

            {/* Option 3: Not Qualified */}
            <label
              className={`p-4 rounded-xl border-2 transition cursor-pointer flex flex-col justify-between space-y-2 ${
                decision === 'NOT_QUALIFIED'
                  ? 'border-rose-500 bg-rose-50/50 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-rose-900 flex items-center space-x-1.5">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>Not Qualified</span>
                </span>
                <input
                  type="radio"
                  name="officer-decision"
                  value="NOT_QUALIFIED"
                  checked={decision === 'NOT_QUALIFIED'}
                  onChange={() => setDecision('NOT_QUALIFIED')}
                  className="text-rose-600 focus:ring-rose-500"
                />
              </div>
              <p className="text-[11px] text-slate-600">
                Bidder fails mandatory eligibility clauses without valid exemption.
              </p>
            </label>
          </div>
        </div>

        {/* Section 2: Officer Justification & Evaluation Comments */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-900">
            2. Detailed Evaluation Justification & Procurement Notes *
          </label>
          <textarea
            id="officer-comments-input"
            rows={4}
            required
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="w-full p-3 rounded-lg border border-slate-300 text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none leading-relaxed"
            placeholder="Record the formal reason for qualification, disqualification, or clarification request..."
          />
          <p className="text-[11px] text-slate-500">
            This justification will be permanently appended to the tamper-evident audit trail and included in the final evaluation certificate.
          </p>
        </div>

        {/* Section 3: Officer Particulars & Signature Stamp */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Authorized Officer Name</label>
            <input
              type="text"
              readOnly
              value={officerName}
              className="w-full px-3 py-1.5 rounded border border-slate-300 bg-white font-bold text-slate-900 outline-none"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Designation & Department</label>
            <input
              type="text"
              value={officerDesignation}
              onChange={(e) => setOfficerDesignation(e.target.value)}
              className="w-full px-3 py-1.5 rounded border border-slate-300 bg-white text-slate-800 outline-none"
            />
          </div>
        </div>

        {/* Acknowledgment Checkbox */}
        <label className="flex items-start space-x-2.5 cursor-pointer text-xs text-slate-700">
          <input
            type="checkbox"
            required
            checked={acknowledgedAI}
            onChange={(e) => setAcknowledgedAI(e.target.checked)}
            className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span>
            I confirm that I have reviewed the verification matrix, document extractions, and portal responses, and I am recording this decision under official procurement authority.
          </span>
        </label>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
          {isSaved ? (
            <div className="flex items-center space-x-2 text-emerald-700 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>Decision Saved & Sealed in Immutable Audit Trail!</span>
            </div>
          ) : (
            <div className="text-[11px] text-slate-500">
              Digital Signature Stamp: SHA256-CPCL-OFFICER-2026
            </div>
          )}

          <button
            id="seal-officer-decision-btn"
            type="submit"
            className="px-6 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition flex items-center space-x-2"
          >
            <Lock className="w-4 h-4" />
            <span>Record & Seal Procurement Decision</span>
          </button>
        </div>
      </form>
    </div>
  );
};
