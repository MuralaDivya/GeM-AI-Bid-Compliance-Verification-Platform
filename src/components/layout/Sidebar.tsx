import React from 'react';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Users,
  CheckCircle2,
  GitCompare,
  Database,
  UserCheck,
  History,
  FileText,
  ShieldAlert,
  Info
} from 'lucide-react';

export type NavTab = 
  | 'dashboard'
  | 'tenders'
  | 'bids'
  | 'verification'
  | 'cross-checks'
  | 'adapters'
  | 'decision'
  | 'audit'
  | 'reports';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  pendingReviewCount: number;
  activeTendersCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  pendingReviewCount,
  activeTendersCount = 0,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string | number; badgeColor?: string }[] = [
    {
      id: 'dashboard',
      label: 'Procurement Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'tenders',
      label: 'Tenders & Requirements',
      icon: <FileSpreadsheet className="w-4 h-4" />,
      badge: activeTendersCount > 0 ? `${activeTendersCount} Active` : undefined,
      badgeColor: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'bids',
      label: 'Bid Submissions & OCR',
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: 'verification',
      label: 'Compliance Matrix',
      icon: <CheckCircle2 className="w-4 h-4" />,
      badge: pendingReviewCount > 0 ? `${pendingReviewCount} Flagged` : undefined,
      badgeColor: 'bg-amber-100 text-amber-900 border border-amber-300'
    },
    {
      id: 'cross-checks',
      label: 'Cross-Verification Engine',
      icon: <GitCompare className="w-4 h-4" />,
    },
    {
      id: 'adapters',
      label: 'Govt Portal Adapters (8)',
      icon: <Database className="w-4 h-4" />,
      badge: 'Simulated',
      badgeColor: 'bg-indigo-100 text-indigo-800'
    },
    {
      id: 'decision',
      label: 'Officer Final Decision',
      icon: <UserCheck className="w-4 h-4" />,
    },
    {
      id: 'audit',
      label: 'Immutable Audit Trail',
      icon: <History className="w-4 h-4" />,
    },
    {
      id: 'reports',
      label: 'Evaluation PDF Reports',
      icon: <FileText className="w-4 h-4" />,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col flex-shrink-0 min-h-[calc(100vh-4rem)] border-r border-slate-800 select-none">
      {/* Role Notice */}
      <div className="p-3.5 mx-3 mt-3 rounded-lg bg-slate-800/80 border border-slate-700/60">
        <div className="flex items-center space-x-2 text-xs font-semibold text-blue-300">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span>Decision-Support Tool</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
          AI provides evidence and findings. Final eligibility qualification authority rests strictly with the Procurement Officer.
        </p>
      </div>

      {/* Navigation List */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-1">
          Evaluation Workflow
        </div>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-[11px] text-slate-400">
        <div className="flex items-center space-x-1.5 font-semibold text-slate-300">
          <Info className="w-3.5 h-3.5 text-blue-400" />
          <span>SIH 2026 Problem ID: SIH26100</span>
        </div>
        <div className="mt-1 text-[10px] text-slate-400 leading-tight">
          Smart Automation for GeM Procurement Verification • CPCL MoP&NG
        </div>
      </div>
    </aside>
  );
};
