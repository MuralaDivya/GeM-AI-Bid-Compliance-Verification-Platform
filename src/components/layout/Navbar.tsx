import React from 'react';
import { Shield, User, LogOut } from 'lucide-react';

export type NavTab = 'dashboard' | 'tenders' | 'verification' | 'reports';

interface NavbarProps {
  currentOfficerName: string;
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onLogout: () => void;
  pendingReviewsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentOfficerName,
  activeTab,
  onSelectTab,
  onLogout,
  pendingReviewsCount = 0,
}) => {
  const navLinks: { id: NavTab; label: string; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'tenders', label: 'Tenders' },
    { id: 'verification', label: 'Verification', badge: pendingReviewsCount > 0 ? pendingReviewsCount : undefined },
    { id: 'reports', label: 'Reports' },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      {/* Top subtle government tricolor line */}
      <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-white to-green-600"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Portal Identity */}
          <div className="flex items-center space-x-8">
            <button
              onClick={() => onSelectTab('dashboard')}
              className="flex items-center space-x-2.5 text-left focus:outline-none"
            >
              <div className="w-8 h-8 rounded-md bg-blue-700 flex items-center justify-center text-white shadow-sm">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-base text-slate-900 tracking-tight block leading-tight">
                  GeM Bid Compliance
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Government e-Marketplace Verification
                </span>
              </div>
            </button>

            {/* Simple Top Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-${item.id}`}
                    onClick={() => onSelectTab(item.id)}
                    className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition flex items-center space-x-1.5 ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.badge !== undefined && (
                      <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Officer Profile & Sign Out */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-600">
                <User className="w-4 h-4" />
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-slate-800 leading-tight">{currentOfficerName}</div>
                <div className="text-[10px] text-slate-500">Procurement Officer</div>
              </div>
            </div>

            <button
              id="logout-btn"
              onClick={onLogout}
              className="flex items-center space-x-1 px-2.5 py-1.5 text-xs text-slate-600 hover:text-red-600 rounded-md hover:bg-slate-50 transition border border-transparent hover:border-slate-200"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Sub-bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-100 py-1.5 px-2 bg-slate-50">
        {navLinks.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`px-2.5 py-1 text-xs rounded font-medium ${
              activeTab === item.id ? 'bg-blue-600 text-white' : 'text-slate-600'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
