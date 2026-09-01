import React, { useState } from 'react';
import { History, Search, Clock, CheckCircle2, AlertTriangle, FolderOpen } from 'lucide-react';
import { Bidder, Tender } from '../../types';

interface AuditTrailViewProps {
  bidder?: Bidder | null;
  tender?: Tender | null;
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({ bidder, tender }) => {
  const [filterRole, setFilterRole] = useState('ALL');
  const [search, setSearch] = useState('');

  if (!bidder) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
        <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-slate-800">No Bidder Selected</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Please select or register a bidder from the Bids section to view the immutable audit trail.
        </p>
      </div>
    );
  }

  const logs = bidder.auditTrail || [];

  const filteredLogs = logs.filter(log => {
    const matchesRole = filterRole === 'ALL' || log.actorRole === filterRole;
    const matchesSearch = log.action.toLowerCase().includes(search.toLowerCase()) ||
                          log.actor.toLowerCase().includes(search.toLowerCase()) ||
                          log.details.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-700 uppercase tracking-wider">
            <History className="w-4 h-4 text-blue-700" />
            <span>Compliance Integrity • Legal Accountability</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
            Immutable Audit Trail & Chain of Custody
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-3xl">
            Every document extraction, government portal lookup, AI cross-check score, and Procurement Officer decision is logged with timestamps and actor roles for {bidder.companyName}.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-mono font-bold border border-slate-300">
            {logs.length} Cryptographic Events Logged
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search audit actions, actors, or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <span className="text-slate-500 font-semibold">Filter Actor:</span>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-700 outline-none"
          >
            <option value="ALL">All Actors</option>
            <option value="OFFICER">Procurement Officer</option>
            <option value="SYSTEM">AI Verification System</option>
            <option value="BIDDER">Bidder Submissions</option>
          </select>
        </div>
      </div>

      {/* Timeline List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
        {filteredLogs.length > 0 ? (
          <div className="relative border-l-2 border-slate-200 ml-4 space-y-6">
            {filteredLogs.map((log) => {
              const isOfficer = log.actorRole === 'OFFICER';
              const isSystem = log.actorRole === 'SYSTEM';

              return (
                <div key={log.id} className="relative pl-6">
                  {/* Timeline Dot */}
                  <div className={`absolute -left-2.5 top-0.5 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center shadow-xs ${
                    isOfficer ? 'bg-amber-500 text-white' : isSystem ? 'bg-blue-600 text-white' : 'bg-slate-500 text-white'
                  }`}>
                    {log.resultStatus === 'SUCCESS' ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : log.resultStatus === 'WARNING' ? (
                      <AlertTriangle className="w-3 h-3" />
                    ) : (
                      <Clock className="w-3 h-3" />
                    )}
                  </div>

                  {/* Event Card */}
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-1.5 hover:bg-blue-50/30 transition">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-slate-900">{log.action}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          isOfficer ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-blue-100 text-blue-900'
                        }`}>
                          {log.actorRole}
                        </span>
                      </div>

                      <span className="text-[11px] font-mono text-slate-500">
                        {new Date(log.timestamp).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed">
                      {log.details}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                      <span>Actor: <strong className="text-slate-700">{log.actor}</strong></span>
                      <span className="font-mono text-[10px] text-slate-400">ID: {log.id}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 text-xs">
            <p className="font-semibold text-slate-700">No audit records found.</p>
            <p className="text-slate-400 mt-1">Actions performed on this bidder will automatically record here.</p>
          </div>
        )}
      </div>
    </div>
  );
};
