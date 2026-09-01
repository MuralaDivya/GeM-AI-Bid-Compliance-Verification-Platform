import React, { useState } from 'react';
import { Plus, ArrowLeft, Building, FileText, CheckCircle, Clock, UploadCloud, Shield, Check } from 'lucide-react';
import { Tender, Bidder } from '../../types';

interface TendersListProps {
  tenders: Tender[];
  bidders: Bidder[];
  selectedTenderId?: string;
  onSelectTender: (tenderId: string) => void;
  onOpenCreateModal: () => void;
  onOpenAddBidderModal: (tenderId: string) => void;
  onSelectBidder: (bidderId: string) => void;
  onStartVerification: (bidderId: string) => void;
}

export const TendersList: React.FC<TendersListProps> = ({
  tenders,
  bidders,
  selectedTenderId,
  onSelectTender,
  onOpenCreateModal,
  onOpenAddBidderModal,
  onSelectBidder,
  onStartVerification,
}) => {
  const [activeTab, setActiveTab] = useState<'requirements' | 'bidders' | 'verification'>('requirements');
  const [currentViewingTenderId, setCurrentViewingTenderId] = useState<string | null>(selectedTenderId || null);

  const currentTender = tenders.find((t) => t.id === (currentViewingTenderId || selectedTenderId)) || null;
  const tenderBidders = currentTender ? bidders.filter((b) => b.tenderId === currentTender.id) : [];

  // If viewing a specific tender details
  if (currentTender) {
    return (
      <div className="space-y-6">
        {/* Back navigation & Tender Header */}
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <button
            onClick={() => setCurrentViewingTenderId(null)}
            className="flex items-center space-x-1 text-blue-700 hover:text-blue-900 font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Tenders</span>
          </button>
          <span>/</span>
          <span className="font-mono text-slate-700">{currentTender.tenderNumber}</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {currentTender.tenderNumber}
                </span>
                <span className="text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded font-semibold">
                  {currentTender.status}
                </span>
              </div>
              <h1 className="text-xl font-bold text-slate-900 mt-1.5">{currentTender.title}</h1>
              <p className="text-xs text-slate-600 mt-1 flex items-center space-x-2">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentTender.organization} — {currentTender.department}</span>
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => onOpenAddBidderModal(currentTender.id)}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-md shadow-sm transition"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Add Bidder & PDF</span>
              </button>
            </div>
          </div>

          {/* 3 Simple Tabs */}
          <div className="flex items-center space-x-1 border-b border-slate-200 mt-6 pt-1">
            <button
              onClick={() => setActiveTab('requirements')}
              className={`px-4 py-2 text-xs font-semibold border-b-2 transition ${
                activeTab === 'requirements'
                  ? 'border-blue-700 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Requirements ({currentTender.requirements?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('bidders')}
              className={`px-4 py-2 text-xs font-semibold border-b-2 transition ${
                activeTab === 'bidders'
                  ? 'border-blue-700 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Bidders ({tenderBidders.length})
            </button>
            <button
              onClick={() => setActiveTab('verification')}
              className={`px-4 py-2 text-xs font-semibold border-b-2 transition ${
                activeTab === 'verification'
                  ? 'border-blue-700 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Verification Status
            </button>
          </div>

          {/* Tab 1: Requirements Table */}
          {activeTab === 'requirements' && (
            <div className="pt-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Requirement</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentTender.requirements?.map((req, idx) => (
                      <tr key={req.id || idx} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-3 font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{req.name}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              req.level === 'REQUIRED'
                                ? 'bg-red-50 text-red-700 border border-red-100'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {req.level}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 max-w-md">{req.description || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 2: Bidders List */}
          {activeTab === 'bidders' && (
            <div className="pt-4">
              {tenderBidders.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-xs text-slate-600 mb-3">No bidders registered for this tender yet.</p>
                  <button
                    onClick={() => onOpenAddBidderModal(currentTender.id)}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Bidder</span>
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                        <th className="py-2.5 px-3">Company Name</th>
                        <th className="py-2.5 px-3">Registration / PAN</th>
                        <th className="py-2.5 px-3">Documents Uploaded</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {tenderBidders.map((b) => {
                        const isVerified = b.verificationStatus === 'COMPLETED' || b.complianceMatrix;
                        const docCount = b.documents?.length || 0;
                        return (
                          <tr key={b.id} className="hover:bg-slate-50/60">
                            <td className="py-2.5 px-3 font-semibold text-slate-900">{b.companyName}</td>
                            <td className="py-2.5 px-3 text-slate-600 font-mono">
                              {b.panNumber || b.registrationNumber || '—'}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600">
                              {docCount > 0 ? (
                                <span className="text-slate-800 font-medium">
                                  {docCount} {docCount === 1 ? 'document' : 'documents extracted'}
                                </span>
                              ) : (
                                <span className="text-slate-400 italic">No document PDF attached</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              {isVerified ? (
                                <span className="inline-flex items-center space-x-1 text-green-700 bg-green-50 px-2 py-0.5 rounded text-[11px] font-semibold">
                                  <CheckCircle className="w-3 h-3" />
                                  <span>{b.complianceScore}% Compliant</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center space-x-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px] font-semibold">
                                  <Clock className="w-3 h-3" />
                                  <span>Pending</span>
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right space-x-2">
                              {isVerified ? (
                                <button
                                  onClick={() => onSelectBidder(b.id)}
                                  className="text-blue-700 hover:text-blue-900 font-semibold text-xs"
                                >
                                  View Results
                                </button>
                              ) : (
                                <button
                                  onClick={() => onStartVerification(b.id)}
                                  className="px-2.5 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded text-xs font-semibold"
                                >
                                  Start Verification
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Verification Overview */}
          {activeTab === 'verification' && (
            <div className="pt-4 space-y-4">
              {tenderBidders.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-xs text-slate-600 mb-2">No bidders registered yet to verify.</p>
                  <button
                    onClick={() => onOpenAddBidderModal(currentTender.id)}
                    className="text-xs font-semibold text-blue-700 hover:underline"
                  >
                    + Add first bidder
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {tenderBidders.map((b) => {
                    const isVerified = b.verificationStatus === 'COMPLETED' || b.complianceMatrix;
                    return (
                      <div
                        key={b.id}
                        className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-md"
                      >
                        <div>
                          <div className="font-semibold text-sm text-slate-900">{b.companyName}</div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {isVerified
                              ? `Verification complete • Score: ${b.complianceScore}%`
                              : 'Document uploaded • Ready for automated compliance check'}
                          </div>
                        </div>

                        <div>
                          {isVerified ? (
                            <button
                              onClick={() => onSelectBidder(b.id)}
                              className="px-3 py-1.5 bg-white border border-blue-600 text-blue-700 hover:bg-blue-50 text-xs font-semibold rounded transition shadow-sm"
                            >
                              View Compliance Matrix & Decision
                            </button>
                          ) : (
                            <button
                              onClick={() => onStartVerification(b.id)}
                              className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded transition shadow-sm"
                            >
                              Check Documents
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // All Tenders List View
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tenders</h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage procurement tenders and configure statutory document criteria.
          </p>
        </div>
        <div>
          <button
            id="create-tender-btn"
            onClick={onOpenCreateModal}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-md shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Tender</span>
          </button>
        </div>
      </div>

      {/* Tenders Content */}
      {tenders.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-10 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">No tenders created yet</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-5">
            Click the button below to create your first procurement tender and set document requirements.
          </p>
          <button
            onClick={onOpenCreateModal}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-md shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Tender</span>
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                <th className="py-3 px-4">Tender ID</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Organization</th>
                <th className="py-3 px-4 text-center">Requirements</th>
                <th className="py-3 px-4 text-center">Bidders</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {tenders.map((tender) => {
                const count = bidders.filter((b) => b.tenderId === tender.id).length;
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
                        {tender.requirements?.length || 0}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center text-xs text-slate-700">
                      <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 rounded font-medium">
                        {count}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center space-x-1 text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded">
                        <Check className="w-3 h-3" />
                        <span>{tender.status}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setCurrentViewingTenderId(tender.id);
                          onSelectTender(tender.id);
                        }}
                        className="text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded transition"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => onOpenAddBidderModal(tender.id)}
                        className="text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded transition"
                      >
                        + Add Bidder
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
