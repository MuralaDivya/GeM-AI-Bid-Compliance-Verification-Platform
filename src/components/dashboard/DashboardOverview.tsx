import React from 'react';
import { Plus, FileText, ArrowRight, CheckCircle, Clock } from 'lucide-react';
import { Tender, Bidder } from '../../types';

interface DashboardOverviewProps {
  tenders: Tender[];
  bidders: Bidder[];
  onOpenCreateTender: () => void;
  onSelectTender: (tenderId: string) => void;
  onSelectBidder: (bidderId: string) => void;
  onNavigateTab: (tab: any) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  tenders,
  bidders,
  onOpenCreateTender,
  onSelectTender,
  onSelectBidder,
}) => {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Bid Compliance Verification
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Check bidder documents against tender requirements.
          </p>
        </div>
        <div>
          <button
            id="dashboard-create-tender-btn"
            onClick={onOpenCreateTender}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-md shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Tender</span>
          </button>
        </div>
      </div>

      {/* Simple 3-step workflow guide */}
      <div className="bg-blue-50/60 border border-blue-100 rounded-lg p-4">
        <div className="text-xs font-semibold text-blue-900 uppercase tracking-wider mb-2">
          How It Works
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="flex items-start space-x-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-200 text-blue-800 text-xs font-bold flex items-center justify-center mt-0.5">
              1
            </span>
            <span className="text-slate-700">
              <strong>Create Tender</strong> & define required statutory documents.
            </span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-200 text-blue-800 text-xs font-bold flex items-center justify-center mt-0.5">
              2
            </span>
            <span className="text-slate-700">
              <strong>Upload one PDF</strong> with all bidder documents.
            </span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-200 text-blue-800 text-xs font-bold flex items-center justify-center mt-0.5">
              3
            </span>
            <span className="text-slate-700">
              <strong>Run verification</strong>, review findings & make decision.
            </span>
          </div>
        </div>
      </div>

      {/* Tenders Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Your Tenders</h2>
          {tenders.length > 0 && (
            <span className="text-xs text-slate-500">
              {tenders.length} {tenders.length === 1 ? 'tender' : 'tenders'}
            </span>
          )}
        </div>

        {tenders.length === 0 ? (
          /* Clean Empty State */
          <div className="bg-white border border-slate-200 rounded-lg p-10 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">No tenders created yet</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-5">
              Create a tender to configure required statutory certificates and verify bidder submissions.
            </p>
            <button
              id="empty-create-tender-btn"
              onClick={onOpenCreateTender}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-md shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create Tender</span>
            </button>
          </div>
        ) : (
          /* Simple Clean Table of Tenders */
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                  <th className="py-3 px-4">Tender ID</th>
                  <th className="py-3 px-4">Tender Title</th>
                  <th className="py-3 px-4">Organization</th>
                  <th className="py-3 px-4 text-center">Requirements</th>
                  <th className="py-3 px-4 text-center">Bidders</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {tenders.map((tender) => {
                  const tenderBidders = bidders.filter((b) => b.tenderId === tender.id);
                  return (
                    <tr key={tender.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 font-mono font-medium text-blue-700 text-xs">
                        {tender.tenderNumber}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-900 max-w-xs truncate">
                        {tender.title}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 text-xs">
                        {tender.organization || tender.department}
                      </td>
                      <td className="py-3.5 px-4 text-center text-xs text-slate-700">
                        <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-medium">
                          {tender.requirements?.length || 0} required
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center text-xs text-slate-700">
                        <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 rounded font-medium">
                          {tenderBidders.length} bidders
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          id={`view-tender-${tender.id}`}
                          onClick={() => onSelectTender(tender.id)}
                          className="inline-flex items-center space-x-1 text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded transition"
                        >
                          <span>Open Tender</span>
                          <ArrowRight className="w-3.5 h-3.5" />
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

      {/* Recent Submissions Section (if any bidders exist) */}
      {bidders.length > 0 && (
        <div className="space-y-3 pt-2">
          <h2 className="text-base font-bold text-slate-900">Recent Bidder Submissions</h2>
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                  <th className="py-3 px-4">Company Name</th>
                  <th className="py-3 px-4">Tender</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {bidders.slice(0, 5).map((bidder) => {
                  const tender = tenders.find((t) => t.id === bidder.tenderId);
                  const isCompleted = bidder.verificationStatus === 'COMPLETED' || bidder.complianceMatrix;
                  return (
                    <tr key={bidder.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {bidder.companyName}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600">
                        {tender ? tender.tenderNumber : '—'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isCompleted ? (
                          <span className="inline-flex items-center space-x-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded">
                            <CheckCircle className="w-3 h-3" />
                            <span>Verified</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                            <Clock className="w-3 h-3" />
                            <span>Pending Verification</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onSelectBidder(bidder.id)}
                          className="text-xs font-semibold text-blue-700 hover:text-blue-900"
                        >
                          {isCompleted ? 'View Results' : 'Verify'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
