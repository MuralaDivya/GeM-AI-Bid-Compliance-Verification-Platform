import React, { useState } from 'react';
import { Users, FileText, Plus, CheckCircle2, AlertTriangle, Eye, ArrowRight, Sparkles, FolderOpen } from 'lucide-react';
import { Bidder, Tender, BidDocument } from '../../types';
import { BidderCreateModal } from './BidderCreateModal';

interface BiddersListProps {
  bidders: Bidder[];
  tenders: Tender[];
  onSelectBidder: (bidderId: string) => void;
  onStartVerification: (bidderId: string) => void;
  onCreateBidder?: (bidderData: Partial<Bidder>) => Promise<void>;
}

export const BiddersList: React.FC<BiddersListProps> = ({
  bidders,
  tenders,
  onSelectBidder,
  onStartVerification,
  onCreateBidder,
}) => {
  const [selectedBidderId, setSelectedBidderId] = useState<string>(bidders[0]?.id || '');
  const [previewDoc, setPreviewDoc] = useState<BidDocument | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const activeBidder = bidders.find(b => b.id === selectedBidderId) || bidders[0];
  const activeTender = tenders.find(t => t.id === activeBidder?.tenderId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-700" />
            <span>Bid Submissions & Document Repository</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review uploaded statutory certificates, OCR extracted structured fields, and document integrity.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {onCreateBidder && (
            <button
              id="btn-open-register-bidder"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-sm transition flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Register Bidder</span>
            </button>
          )}

          {activeBidder && (
            <button
              id="btn-run-full-pipeline"
              onClick={() => onStartVerification(activeBidder.id)}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition flex items-center space-x-2 border border-amber-600/30"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Run AI Verification</span>
            </button>
          )}
        </div>
      </div>

      {/* Bidder Selector if multiple bidders */}
      {bidders.length > 1 && (
        <div className="flex items-center space-x-2 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-600">Select Active Bidder:</span>
          <select
            value={activeBidder?.id}
            onChange={(e) => setSelectedBidderId(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-bold text-slate-800 outline-none"
          >
            {bidders.map(b => (
              <option key={b.id} value={b.id}>
                {b.companyName} ({b.bidderNumber}) - {b.enterpriseType}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Bidder Card & Document Overview */}
      {activeBidder ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                  {activeBidder.bidderNumber}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800">
                  {activeBidder.enterpriseType} Enterprise
                </span>
                {activeTender && (
                  <span className="text-xs text-slate-500">Tender: {activeTender.tenderNumber}</span>
                )}
              </div>
              <h2 className="text-base font-extrabold text-slate-900 mt-1">
                {activeBidder.companyName}
              </h2>
              <div className="text-xs text-slate-600 flex flex-wrap gap-x-4 gap-y-1 mt-1 font-mono">
                {activeBidder.panNumber && <span>PAN: <strong>{activeBidder.panNumber}</strong></span>}
                {activeBidder.gstin && <span>GSTIN: <strong>{activeBidder.gstin}</strong></span>}
                {activeBidder.registrationNumber && <span>Reg/Udyam: <strong>{activeBidder.registrationNumber}</strong></span>}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                id="btn-goto-compliance-matrix"
                onClick={() => onSelectBidder(activeBidder.id)}
                className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-sm transition flex items-center space-x-1.5"
              >
                <span>Open Compliance Matrix</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Uploaded Documents List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Uploaded Statutory Documents & OCR Data Extraction ({activeBidder.documents?.length || 0} Files)
              </h3>
              <span className="text-[11px] text-slate-500">Click any document to inspect OCR structured data</span>
            </div>

            {activeBidder.documents && activeBidder.documents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {activeBidder.documents.map((doc) => {
                  const isVerified = doc.verificationStatus === 'VERIFIED';
                  return (
                    <div
                      key={doc.id}
                      id={`doc-card-${doc.requirementCode.toLowerCase()}`}
                      onClick={() => setPreviewDoc(doc)}
                      className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-blue-50/50 hover:border-blue-300 transition cursor-pointer flex flex-col justify-between space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start space-x-2">
                          <div className="p-2 rounded bg-white text-blue-700 border border-slate-200 shadow-2xs mt-0.5">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 leading-tight">
                              {doc.title}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                              {doc.fileName} • {doc.fileSize}
                            </div>
                          </div>
                        </div>

                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          isVerified
                            ? 'bg-emerald-100 text-emerald-800'
                            : doc.verificationStatus === 'FLAG_REVIEW'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {doc.verificationStatus}
                        </span>
                      </div>

                      {/* Extraction Summary */}
                      {doc.extraction && (
                        <div className="text-[11px] bg-white p-2 rounded border border-slate-200 space-y-1">
                          <div className="text-[10px] font-semibold text-slate-500 uppercase">Extracted Key Entity</div>
                          <div className="font-semibold text-slate-800 truncate">
                            {doc.extraction.companyName || doc.extraction.registrationNumber || 'Extracted Verified'}
                          </div>
                          {doc.extraction.findings && doc.extraction.findings.length > 0 && (
                            <div className="text-[10px] text-amber-800 font-medium truncate">
                              ⚠️ {doc.extraction.findings[0]}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                        <span>Conf: {Math.round((doc.extraction?.confidenceScore || 0.95) * 100)}%</span>
                        <span className="text-blue-700 font-semibold flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>Inspect OCR JSON</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-xs">
                <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="font-semibold text-slate-600">No documents uploaded for this bidder yet.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
          <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No Bid Submissions Recorded</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Register a bidder entity to attach statutory documents, run automated OCR extraction, and evaluate compliance against government portal adapters.
          </p>
          {onCreateBidder && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-4 px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-sm transition inline-flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Register Bidder Now</span>
            </button>
          )}
        </div>
      )}

      {/* Bidder Creation Modal */}
      {onCreateBidder && (
        <BidderCreateModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          tenders={tenders}
          onCreateBidder={onCreateBidder}
        />
      )}

      {/* OCR Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
            <div className="bg-blue-900 text-white p-4 flex items-center justify-between border-b border-blue-950">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-bold">{previewDoc.title}</h3>
                  <p className="text-[11px] text-blue-200">OCR Text Extraction & Key-Value Pair Audit</p>
                </div>
              </div>
              <button onClick={() => setPreviewDoc(null)} className="p-1 rounded-lg hover:bg-white/10 text-white transition">
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Requirement Code:</span>
                  <div className="font-mono font-bold text-slate-900">{previewDoc.requirementCode}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Verification Status:</span>
                  <div className="font-bold text-emerald-700">{previewDoc.verificationStatus}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Document Name:</span>
                  <div className="font-mono text-slate-800">{previewDoc.fileName}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">OCR Confidence:</span>
                  <div className="font-bold text-blue-700">{Math.round((previewDoc.extraction?.confidenceScore || 0.95) * 100)}%</div>
                </div>
              </div>

              {/* Extracted Key Values */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 mb-2 uppercase tracking-wider">
                  Extracted Key-Value Entity Fields
                </h4>
                <div className="bg-slate-900 text-slate-200 rounded-lg p-3 font-mono text-[11px] overflow-x-auto space-y-1">
                  {previewDoc.extraction?.rawKeyValues && Object.keys(previewDoc.extraction.rawKeyValues).length > 0 ? (
                    Object.entries(previewDoc.extraction.rawKeyValues).map(([k, v]) => (
                      <div key={k} className="flex">
                        <span className="text-amber-400 w-44 flex-shrink-0">{k}:</span>
                        <span className="text-emerald-300">{String(v)}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-400">Structured data will be extracted upon running AI Verification.</div>
                  )}
                </div>
              </div>

              {/* Extraction Findings */}
              {previewDoc.extraction?.findings && previewDoc.extraction.findings.length > 0 && (
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-amber-900 space-y-1">
                  <div className="font-bold text-xs flex items-center space-x-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>AI Engine OCR Finding:</span>
                  </div>
                  <ul className="list-disc list-inside text-[11px] space-y-0.5">
                    {previewDoc.extraction.findings.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="bg-slate-50 p-3.5 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-1.5 rounded-lg bg-blue-700 text-white text-xs font-bold hover:bg-blue-800 transition"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
