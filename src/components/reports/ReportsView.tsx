import React, { useState } from 'react';
import { Download, FileText, CheckCircle2, AlertTriangle, XCircle, ArrowLeft } from 'lucide-react';
import { Tender, Bidder } from '../../types';
import { generateComplianceReportPDF } from '../../services/pdfReport';

interface ReportsViewProps {
  bidders: Bidder[];
  tenders: Tender[];
  activeBidder?: Bidder | null;
  activeTender?: Tender | null;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  bidders,
  tenders,
  activeBidder,
  activeTender,
}) => {
  const [selectedBidderForReport, setSelectedBidderForReport] = useState<Bidder | null>(
    activeBidder?.officerDecision || activeBidder?.complianceMatrix ? activeBidder : null
  );

  // Filter bidders that have completed verification or officer decision
  const qualifiedOrVerifiedBidders = bidders.filter(
    (b) => b.complianceMatrix && b.complianceMatrix.length > 0
  );

  const handleDownloadPDF = (targetBidder: Bidder) => {
    const targetTender = tenders.find((t) => t.id === targetBidder.tenderId) || activeTender || {
      id: 'tnd-gen',
      tenderNumber: 'GEM/2026/PROC/1001',
      title: 'Procurement Supply Contract',
      organization: 'Chennai Petroleum Corporation Limited',
      department: 'Procurement Group',
      category: 'Goods',
      estimatedValueINR: 5000000,
      publishedDate: new Date().toISOString().split('T')[0],
      closingDate: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
      description: '',
      requirements: [],
      bidderCount: 1,
    };
    generateComplianceReportPDF(targetTender, targetBidder);
  };

  // If viewing detailed report for a specific bidder
  if (selectedBidderForReport) {
    const b = selectedBidderForReport;
    const t = tenders.find((tend) => tend.id === b.tenderId) || activeTender;
    const matrix = b.complianceMatrix || [];

    return (
      <div className="space-y-6">
        {/* Back navigation & Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedBidderForReport(null)}
            className="flex items-center space-x-1 text-xs text-blue-700 hover:text-blue-900 font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Reports</span>
          </button>
          <button
            id="download-report-pdf-btn"
            onClick={() => handleDownloadPDF(b)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-md shadow-sm transition"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF Certificate</span>
          </button>
        </div>

        {/* Printable Report Sheet */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-sm space-y-6">
          {/* Report Top Header */}
          <div className="border-b border-slate-200 pb-5">
            <div className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">
              Government of India • GeM Procurement Portal
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">
              Bid Compliance & Statutory Verification Report
            </h1>
            <div className="text-xs text-slate-600 mt-1 flex flex-wrap gap-x-4 gap-y-1">
              <span>Date: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              <span>•</span>
              <span>Report Ref: {`REP-${b.id.substring(0, 8).toUpperCase()}`}</span>
            </div>
          </div>

          {/* Tender & Bidder Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-md border border-slate-200 text-xs">
            <div className="space-y-1.5">
              <div>
                <span className="text-slate-500 font-medium">Tender Reference: </span>
                <strong className="text-slate-900 font-mono">{t?.tenderNumber || 'GEM/2026/B/1001'}</strong>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Tender Title: </span>
                <span className="text-slate-800 font-semibold">{t?.title || 'General Procurement'}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Procuring Authority: </span>
                <span className="text-slate-800">{t?.organization || 'CPCL'}</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <div>
                <span className="text-slate-500 font-medium">Bidder Legal Name: </span>
                <strong className="text-slate-900">{b.companyName}</strong>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Registration / PAN: </span>
                <span className="text-slate-800 font-mono">{b.panNumber || b.registrationNumber || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Overall Compliance: </span>
                <strong className="text-blue-700">{b.complianceScore}% Compliant</strong>
              </div>
            </div>
          </div>

          {/* Requirement-wise Results Table */}
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-2">Requirement-wise Results</h2>
            <div className="border border-slate-200 rounded overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-semibold">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Requirement</th>
                    <th className="py-2.5 px-3">Document Identified</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {matrix.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{item.requirementName}</td>
                      <td className="py-2.5 px-3 text-slate-700">
                        {item.hasDocument ? item.documentRef?.documentType : 'Not Found in PDF'}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {item.overallStatus === 'COMPLIANT' && (
                          <span className="text-green-700 font-semibold flex items-center justify-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Compliant</span>
                          </span>
                        )}
                        {item.overallStatus === 'REVIEW_REQUIRED' && (
                          <span className="text-amber-700 font-semibold flex items-center justify-center space-x-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Needs Review</span>
                          </span>
                        )}
                        {item.overallStatus === 'MISSING' && (
                          <span className="text-red-700 font-semibold flex items-center justify-center space-x-1">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Missing</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Officer Decision & Comments */}
          <div className="border border-slate-200 rounded-md p-4 bg-slate-50 space-y-2 text-xs">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Procurement Officer Decision
            </h2>
            <div className="flex items-center space-x-3">
              <span className="text-slate-600 font-medium">Final Determination:</span>
              <span
                className={`px-2.5 py-0.5 rounded font-bold uppercase ${
                  b.officerDecision?.decision === 'QUALIFIED'
                    ? 'bg-green-100 text-green-800'
                    : b.officerDecision?.decision === 'NOT_QUALIFIED'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {b.officerDecision?.decision || 'PENDING OFFICER SIGN-OFF'}
              </span>
            </div>
            {b.officerDecision?.comments && (
              <div>
                <span className="text-slate-600 font-medium">Comments: </span>
                <span className="text-slate-800 italic">"{b.officerDecision.comments}"</span>
              </div>
            )}
            <div className="text-slate-500 pt-1">
              Signed by: {b.officerDecision?.officerName || 'Procurement Officer'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Reports List View
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Compliance Reports</h1>
        <p className="text-sm text-slate-600 mt-1">
          View and download official bid evaluation summaries and compliance certificates.
        </p>
      </div>

      {qualifiedOrVerifiedBidders.length === 0 ? (
        /* Empty State */
        <div className="bg-white border border-slate-200 rounded-lg p-10 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">No reports generated yet</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-2">
            Reports are generated once bidder document verification is performed.
          </p>
        </div>
      ) : (
        /* Clean Reports Table */
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                <th className="py-3 px-4">Tender Number</th>
                <th className="py-3 px-4">Bidder Legal Name</th>
                <th className="py-3 px-4 text-center">Compliance Score</th>
                <th className="py-3 px-4 text-center">Officer Decision</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {qualifiedOrVerifiedBidders.map((b) => {
                const t = tenders.find((tend) => tend.id === b.tenderId);
                return (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition text-xs">
                    <td className="py-3 px-4 font-mono font-medium text-blue-700">
                      {t?.tenderNumber || 'GEM/2026/B/1001'}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {b.companyName}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-blue-700">
                      {b.complianceScore}%
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          b.officerDecision?.decision === 'QUALIFIED'
                            ? 'bg-green-50 text-green-700'
                            : b.officerDecision?.decision === 'NOT_QUALIFIED'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {b.officerDecision?.decision || 'Verified'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedBidderForReport(b)}
                        className="text-blue-700 hover:text-blue-900 font-semibold px-2 py-1 rounded hover:bg-blue-50"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDownloadPDF(b)}
                        className="text-slate-700 hover:text-slate-900 font-semibold px-2 py-1 rounded bg-slate-100 hover:bg-slate-200"
                      >
                        Download PDF
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
