import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  RotateCcw,
  Check,
  Building,
  FileCheck2,
  Download,
} from 'lucide-react';
import { Bidder, Tender, ComplianceMatrixItem, OfficerDecisionType } from '../../types';
import { EvidenceModal } from './EvidenceModal';

interface ComplianceDashboardProps {
  bidder: Bidder | null;
  tender: Tender | null;
  allBidders?: Bidder[];
  onSelectBidder?: (bidderId: string) => void;
  onStartVerification: (bidderId: string) => void;
  onSaveDecision: (payload: {
    bidderId: string;
    decision: OfficerDecisionType;
    comments: string;
    officerName: string;
    officerDesignation: string;
  }) => void;
  onGenerateReport?: () => void;
  isVerifying: boolean;
  officerName?: string;
}

export const ComplianceDashboard: React.FC<ComplianceDashboardProps> = ({
  bidder,
  tender,
  allBidders = [],
  onSelectBidder,
  onStartVerification,
  onSaveDecision,
  onGenerateReport,
  isVerifying,
  officerName = 'Procurement Officer',
}) => {
  const [selectedEvidenceItem, setSelectedEvidenceItem] = useState<ComplianceMatrixItem | null>(null);

  // Compute deterministic qualification based on MANDATORY requirements
  const matrixItems = bidder?.complianceMatrix || [];
  const mandatoryRequirements = matrixItems.filter((m) => m.level === 'REQUIRED');
  const missingMandatory = mandatoryRequirements.filter(
    (m) => m.overallStatus === 'MISSING' || m.overallStatus === 'NON_COMPLIANT'
  );
  const reviewRequiredMandatory = mandatoryRequirements.filter(
    (m) => m.overallStatus === 'REVIEW_REQUIRED'
  );
  const compliantMandatory = mandatoryRequirements.filter(
    (m) => m.overallStatus === 'COMPLIANT'
  );

  const isNotQualified = missingMandatory.length > 0;
  const isRequiresReview = !isNotQualified && reviewRequiredMandatory.length > 0;

  const defaultStatus: OfficerDecisionType = bidder?.officerDecision?.decision
    ? bidder.officerDecision.decision
    : isNotQualified
      ? 'NOT_QUALIFIED'
      : isRequiresReview
        ? 'MANUAL_REVIEW_PENDING'
        : 'QUALIFIED';

  const [decision, setDecision] = useState<OfficerDecisionType>(defaultStatus);
  const [comments, setComments] = useState<string>(bidder?.officerDecision?.comments || '');
  const [decisionSaved, setDecisionSaved] = useState(false);

  // Sync decision if bidder changes
  useEffect(() => {
    if (bidder?.officerDecision) {
      setDecision(bidder.officerDecision.decision);
      setComments(bidder.officerDecision.comments || '');
    } else {
      const initialDecision: OfficerDecisionType = isNotQualified
        ? 'NOT_QUALIFIED'
        : isRequiresReview
          ? 'MANUAL_REVIEW_PENDING'
          : 'QUALIFIED';
      setDecision(initialDecision);
      setComments('');
    }
    setDecisionSaved(false);
  }, [bidder?.id, isNotQualified, isRequiresReview]);

  // Verification in Progress Screen
  if (isVerifying) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4">
        <div className="bg-white border border-slate-200 rounded-lg p-8 shadow-sm text-center">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-700 mx-auto flex items-center justify-center mb-4">
            <RotateCcw className="w-6 h-6 animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">Checking Bid Documents</h2>
          <p className="text-xs text-slate-500 mb-6">
            Processing combined PDF, segmenting statutory records, and checking compliance.
          </p>

          <div className="space-y-3 text-left max-w-sm mx-auto text-sm">
            <div className="flex items-center space-x-3 text-green-700">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium">Reading document</span>
            </div>
            <div className="flex items-center space-x-3 text-green-700">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium">Extracting information</span>
            </div>
            <div className="flex items-center space-x-3 text-green-700">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium">Checking requirements</span>
            </div>
            <div className="flex items-center space-x-3 text-blue-700">
              <div className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin flex-shrink-0"></div>
              <span className="font-semibold">Cross-checking information</span>
            </div>
            <div className="flex items-center space-x-3 text-slate-400">
              <div className="w-4 h-4 rounded-full border border-slate-300 flex-shrink-0"></div>
              <span>Preparing results</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If no bidder is selected or available
  if (!bidder) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-12 text-center max-w-lg mx-auto my-8">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
          <FileCheck2 className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-800">No verification performed yet</h3>
        <p className="text-sm text-slate-500 mt-1 mb-5">
          Select a tender and upload a bidder document PDF to start automated compliance verification.
        </p>
      </div>
    );
  }

  const isVerified = bidder.verificationStatus === 'COMPLETED' || (bidder.complianceMatrix && bidder.complianceMatrix.length > 0);
  const findingsNeedingReview = matrixItems.filter((m) => m.overallStatus === 'REVIEW_REQUIRED' || m.overallStatus === 'MISSING');

  const handleSaveOfficerDecision = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveDecision({
      bidderId: bidder.id,
      decision,
      comments: comments.trim(),
      officerName,
      officerDesignation: 'Procurement Officer (CPCL)',
    });
    setDecisionSaved(true);
    setTimeout(() => setDecisionSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Bidder Selector */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                {tender ? tender.tenderNumber : 'TENDER'}
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-600 font-medium">{tender?.title}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1 flex items-center space-x-2">
              <span>{bidder.companyName}</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              PAN: {bidder.panNumber || '—'} | GSTIN: {bidder.gstin || '—'} | CIN: {bidder.registrationNumber || '—'}
            </p>
          </div>

          {/* Actions & Selector */}
          <div className="flex items-center space-x-2">
            {allBidders.length > 1 && onSelectBidder && (
              <select
                value={bidder.id}
                onChange={(e) => onSelectBidder(e.target.value)}
                className="text-xs border border-slate-300 rounded px-2.5 py-1.5 bg-white text-slate-800"
              >
                {allBidders.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.companyName}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={() => onStartVerification(bidder.id)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isVerified ? 'Re-run Verification' : 'Start Verification'}</span>
            </button>
          </div>
        </div>

        {/* Overall Qualification Status & Compliance Banner (if verified) */}
        {isVerified && (
          <div className="mt-5 pt-4 border-t border-slate-200 space-y-3">
            {/* Qualification Decision Banner */}
            <div
              className={`p-4 rounded-lg border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                isNotQualified
                  ? 'bg-red-50/80 border-red-200 text-red-950'
                  : isRequiresReview
                  ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                  : 'bg-green-50/80 border-green-200 text-green-950'
              }`}
            >
              <div className="flex items-start space-x-3.5">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    isNotQualified
                      ? 'bg-red-600 text-white'
                      : isRequiresReview
                      ? 'bg-amber-500 text-white'
                      : 'bg-green-600 text-white'
                  }`}
                >
                  {isNotQualified ? (
                    <XCircle className="w-6 h-6" />
                  ) : isRequiresReview ? (
                    <AlertTriangle className="w-6 h-6" />
                  ) : (
                    <CheckCircle2 className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`font-black text-sm uppercase tracking-wide px-2 py-0.5 rounded ${
                        isNotQualified
                          ? 'bg-red-100 text-red-900 border border-red-200'
                          : isRequiresReview
                          ? 'bg-amber-100 text-amber-900 border border-amber-200'
                          : 'bg-green-100 text-green-900 border border-green-200'
                      }`}
                    >
                      {isNotQualified
                        ? '❌ NOT QUALIFIED'
                        : isRequiresReview
                        ? '⚠️ REQUIRES MANUAL REVIEW'
                        : '✅ QUALIFIED'}
                    </span>
                  </div>

                  <div className="text-sm font-bold mt-1 text-slate-900">
                    {isNotQualified
                      ? `"${missingMandatory.length} mandatory requirement${
                          missingMandatory.length > 1 ? 's are' : ' is'
                        } missing."`
                      : isRequiresReview
                      ? `"${reviewRequiredMandatory.length} requirement${
                          reviewRequiredMandatory.length > 1 ? 's require' : ' requires'
                        } manual officer verification."`
                      : '"All mandatory requirements are satisfied and compliant."'}
                  </div>

                  <p className="text-xs text-slate-600 mt-0.5 max-w-2xl">
                    {isNotQualified ? (
                      <>
                        <strong>Deterministic Qualification Rule:</strong> A bidder cannot be qualified when one or more mandatory tender requirements are missing. The overall compliance score ({bidder.complianceScore}%) is only a supporting metric and does not override missing mandatory documents.
                      </>
                    ) : isRequiresReview ? (
                      <>
                        All mandatory documents were detected, but some entries require officer review due to entity name variations or verification checkpoints.
                      </>
                    ) : (
                      <>
                        All statutory documents were verified against tender specifications and portal registers with full compliance.
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Action Buttons & Supporting Metric Badge */}
              <div className="flex flex-row md:flex-col items-end justify-between md:justify-center gap-2 flex-shrink-0">
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-500">
                    Overall Compliance %
                  </div>
                  <div className="text-xs font-semibold text-slate-700">
                    <span className="text-base font-bold text-slate-900">{bidder.complianceScore}%</span>{' '}
                    <span className="text-[10px] text-slate-500 font-normal">(Supporting Metric)</span>
                  </div>
                </div>

                {onGenerateReport && (
                  <button
                    onClick={onGenerateReport}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-md shadow-sm transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Generate Report</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded p-2.5">
                <div className="text-slate-500 text-[11px]">Mandatory Requirements</div>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  {compliantMandatory.length} / {mandatoryRequirements.length} Compliant
                </div>
              </div>
              <div
                className={`border rounded p-2.5 ${
                  missingMandatory.length > 0
                    ? 'bg-red-50 border-red-200 text-red-900'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                <div className="text-slate-500 text-[11px]">Missing Mandatory</div>
                <div
                  className={`text-sm font-bold mt-0.5 ${
                    missingMandatory.length > 0 ? 'text-red-700 font-black' : 'text-slate-900'
                  }`}
                >
                  {missingMandatory.length}
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded p-2.5">
                <div className="text-slate-500 text-[11px]">Requires Review</div>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  {reviewRequiredMandatory.length}
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded p-2.5">
                <div className="text-slate-500 text-[11px]">Supporting Score</div>
                <div className="text-sm font-bold text-blue-700 mt-0.5">
                  {bidder.complianceScore}%
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Compliance Results Section */}
      {!isVerified ? (
        <div className="bg-white border border-slate-200 rounded-lg p-10 text-center">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-700 mx-auto flex items-center justify-center mb-3">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">Bid documents uploaded</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-5">
            Click Start Verification to automatically read, segment, and check the combined PDF against tender criteria.
          </p>
          <button
            onClick={() => onStartVerification(bidder.id)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-md shadow-sm transition"
          >
            <span>Start Verification</span>
          </button>
        </div>
      ) : (
        <>
          {/* Compliance Matrix Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Requirement-by-Requirement Checklist</h2>
              <span className="text-xs text-slate-500">
                {mandatoryRequirements.length} mandatory, {matrixItems.length - mandatoryRequirements.length} optional
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-3 px-4">Tender Requirement</th>
                    <th className="py-3 px-4">Document Found in PDF</th>
                    <th className="py-3 px-4">Source Pages</th>
                    <th className="py-3 px-4 text-center">Compliance Finding</th>
                    <th className="py-3 px-4 text-right">Evidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {matrixItems.map((item) => {
                    const rawKeyValues = item.documentRef?.extraction?.rawKeyValues || {};
                    const sourcePages = rawKeyValues['Source Pages'] || (item.hasDocument ? 'Pages identified' : '—');
                    const isReqMandatory = item.level === 'REQUIRED';

                    return (
                      <tr
                        key={item.id}
                        className={`transition ${
                          item.overallStatus === 'MISSING' && isReqMandatory
                            ? 'bg-red-50/30 hover:bg-red-50/50'
                            : 'hover:bg-slate-50/70'
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-semibold text-slate-900">{item.requirementName}</span>
                            {isReqMandatory ? (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase bg-red-100 text-red-700 border border-red-200">
                                Required
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-medium uppercase bg-slate-100 text-slate-600">
                                Optional
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{item.category}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          {item.hasDocument ? (
                            <span className="font-medium text-slate-800 flex items-center space-x-1">
                              <Check className="w-3 h-3 text-green-600 flex-shrink-0" />
                              <span>{item.documentRef?.documentType || 'Extracted Document'}</span>
                            </span>
                          ) : (
                            <span className="text-red-600 font-medium italic flex items-center space-x-1">
                              <XCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                              <span>Not Found in PDF</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                          {sourcePages}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {item.overallStatus === 'COMPLIANT' && (
                            <span className="inline-flex items-center space-x-1 text-green-700 bg-green-50 px-2 py-0.5 rounded text-[11px] font-semibold border border-green-200">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>✓ Compliant</span>
                            </span>
                          )}
                          {item.overallStatus === 'REVIEW_REQUIRED' && (
                            <span className="inline-flex items-center space-x-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px] font-semibold border border-amber-200">
                              <AlertTriangle className="w-3 h-3" />
                              <span>⚠ Needs Review</span>
                            </span>
                          )}
                          {(item.overallStatus === 'MISSING' || item.overallStatus === 'NON_COMPLIANT') && (
                            <span className="inline-flex items-center space-x-1 text-red-700 bg-red-50 px-2 py-0.5 rounded text-[11px] font-bold border border-red-200">
                              <XCircle className="w-3 h-3" />
                              <span>✕ Missing</span>
                            </span>
                          )}
                          {item.overallStatus === 'NOT_APPLICABLE' && (
                            <span className="inline-block text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-[11px] font-medium">
                              Optional / N.A.
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedEvidenceItem(item)}
                            className="text-blue-700 hover:text-blue-900 font-semibold hover:underline"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Review Findings (if any warnings or items need review) */}
          {findingsNeedingReview.length > 0 && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-4 space-y-2">
              <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Review Findings ({findingsNeedingReview.length} items requiring officer attention)</span>
              </div>
              <div className="space-y-2 pt-1">
                {findingsNeedingReview.map((finding) => (
                  <div key={finding.id} className="bg-white p-3 rounded border border-amber-200 text-xs">
                    <div className="font-semibold text-slate-900">{finding.requirementName}</div>
                    <p className="text-slate-600 mt-0.5 leading-relaxed">{finding.aiExplanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Review & Final Officer Decision Form */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-base font-bold text-slate-900">Review & Final Decision</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                The AI system assists with document analysis and flags mandatory deficiencies. The authorized Procurement Officer records the official qualification decision.
              </p>
            </div>

            <form onSubmit={handleSaveOfficerDecision} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Final Decision *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label
                    className={`flex items-center space-x-2.5 p-3 rounded-lg border cursor-pointer text-xs transition ${
                      decision === 'QUALIFIED'
                        ? 'border-green-500 bg-green-50/60 text-green-900 font-semibold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="officer-decision"
                      value="QUALIFIED"
                      checked={decision === 'QUALIFIED'}
                      onChange={() => setDecision('QUALIFIED')}
                      className="text-green-600 focus:ring-green-500"
                    />
                    <span>Qualified</span>
                  </label>

                  <label
                    className={`flex items-center space-x-2.5 p-3 rounded-lg border cursor-pointer text-xs transition ${
                      decision === 'NOT_QUALIFIED'
                        ? 'border-red-500 bg-red-50/60 text-red-900 font-semibold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="officer-decision"
                      value="NOT_QUALIFIED"
                      checked={decision === 'NOT_QUALIFIED'}
                      onChange={() => setDecision('NOT_QUALIFIED')}
                      className="text-red-600 focus:ring-red-500"
                    />
                    <span>Not Qualified</span>
                  </label>

                  <label
                    className={`flex items-center space-x-2.5 p-3 rounded-lg border cursor-pointer text-xs transition ${
                      decision === 'MANUAL_REVIEW_PENDING'
                        ? 'border-amber-500 bg-amber-50/60 text-amber-900 font-semibold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="officer-decision"
                      value="MANUAL_REVIEW_PENDING"
                      checked={decision === 'MANUAL_REVIEW_PENDING'}
                      onChange={() => setDecision('MANUAL_REVIEW_PENDING')}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span>Manual Review Required</span>
                  </label>
                </div>
              </div>

              {/* Warning if selecting Qualified when mandatory requirements are missing */}
              {decision === 'QUALIFIED' && isNotQualified && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 space-y-1">
                  <div className="font-bold flex items-center space-x-1.5 text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>Override Warning: {missingMandatory.length} Mandatory Requirement(s) Missing</span>
                  </div>
                  <p className="text-slate-700 pl-5 leading-relaxed">
                    This bidder is missing {missingMandatory.map((m) => m.requirementName).join(', ')}. Selecting &quot;Qualified&quot; will override the mandatory compliance rule. Please document your statutory reasoning or GeM concession grounds in the comments below.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Officer Comments / Justification
                </label>
                <textarea
                  rows={3}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Enter official review remarks, justification for qualification or reasons for rejection..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-slate-500">
                  Officer: <strong className="text-slate-700">{officerName}</strong>
                </div>

                <div className="flex items-center space-x-3">
                  {decisionSaved && (
                    <span className="text-xs font-semibold text-green-700 flex items-center space-x-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Decision recorded</span>
                    </span>
                  )}
                  <button
                    id="save-officer-decision-btn"
                    type="submit"
                    className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-md shadow-sm transition"
                  >
                    Save Decision
                  </button>
                </div>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Result Details / Evidence Modal */}
      <EvidenceModal
        isOpen={!!selectedEvidenceItem}
        item={selectedEvidenceItem}
        onClose={() => setSelectedEvidenceItem(null)}
      />
    </div>
  );
};
