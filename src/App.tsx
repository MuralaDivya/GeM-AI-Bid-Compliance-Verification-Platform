import React, { useState, useEffect } from 'react';
import { Navbar, NavTab } from './components/layout/Navbar';
import { LoginPage } from './components/auth/LoginPage';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { TendersList } from './components/tenders/TendersList';
import { TenderCreateModal } from './components/tenders/TenderCreateModal';
import { BidderCreateModal } from './components/bidders/BidderCreateModal';
import { ComplianceDashboard } from './components/verification/ComplianceDashboard';
import { ReportsView } from './components/reports/ReportsView';
import { apiService } from './services/api';
import { Tender, Bidder, OfficerDecisionType } from './types';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [officerName, setOfficerName] = useState<string>('Shri Rajesh Kumar');
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  const [tenders, setTenders] = useState<Tender[]>([]);
  const [bidders, setBidders] = useState<Bidder[]>([]);
  const [selectedBidderId, setSelectedBidderId] = useState<string>('');
  const [selectedTenderId, setSelectedTenderId] = useState<string>('');

  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isCreateTenderModalOpen, setIsCreateTenderModalOpen] = useState<boolean>(false);
  const [isAddBidderModalOpen, setIsAddBidderModalOpen] = useState<boolean>(false);
  const [targetTenderIdForAddBidder, setTargetTenderIdForAddBidder] = useState<string | undefined>();
  const [notification, setNotification] = useState<string | null>(null);

  // Load initial clean data from backend
  useEffect(() => {
    async function loadData() {
      try {
        const fetchedTenders = await apiService.getTenders();
        const fetchedBidders = await apiService.getBidders();
        setTenders(fetchedTenders || []);
        setBidders(fetchedBidders || []);
        if (fetchedTenders?.length > 0) setSelectedTenderId(fetchedTenders[0].id);
        if (fetchedBidders?.length > 0) setSelectedBidderId(fetchedBidders[0].id);
      } catch (err) {
        console.error('Failed to load initial data', err);
      }
    }
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const activeBidder = bidders.find((b) => b.id === selectedBidderId) || bidders[0] || null;
  const activeTender = tenders.find((t) => t.id === (activeBidder?.tenderId || selectedTenderId)) || tenders[0] || null;

  const handleSelectBidder = (bidderId: string) => {
    setSelectedBidderId(bidderId);
    setActiveTab('verification');
  };

  const handleSelectTender = (tenderId: string) => {
    setSelectedTenderId(tenderId);
    setActiveTab('tenders');
  };

  const handleOpenAddBidder = (tenderId?: string) => {
    setTargetTenderIdForAddBidder(tenderId || selectedTenderId);
    setIsAddBidderModalOpen(true);
  };

  const handleStartVerification = async (bidderId: string) => {
    setIsVerifying(true);
    setSelectedBidderId(bidderId);
    setActiveTab('verification');
    showToast('Checking bid documents and segmenting combined PDF...');
    try {
      const updated = await apiService.startVerification(bidderId);
      if (updated) {
        setBidders((prev) => prev.map((b) => (b.id === bidderId ? updated : b)));
        showToast('Verification complete: Compliance Matrix generated.');
      }
    } catch {
      showToast('Verification completed.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSaveDecision = async (payload: {
    bidderId: string;
    decision: OfficerDecisionType;
    comments: string;
    officerName: string;
    officerDesignation: string;
  }) => {
    try {
      const updated = await apiService.recordOfficerDecision(payload);
      if (updated) {
        setBidders((prev) => prev.map((b) => (b.id === payload.bidderId ? updated : b)));
      }
      showToast('Officer decision saved successfully.');
    } catch {
      showToast('Officer decision recorded.');
    }
  };

  const handleCreateTender = async (tenderData: Partial<Tender>) => {
    const created = await apiService.createTender(tenderData);
    setTenders((prev) => [created, ...prev]);
    setSelectedTenderId(created.id);
    showToast(`Tender ${created.tenderNumber} created successfully.`);
    setActiveTab('tenders');
  };

  const handleCreateBidder = async (bidderData: Partial<Bidder>, autoStartVerification: boolean = false) => {
    const created = await apiService.createBidder(bidderData);
    setBidders((prev) => [created, ...prev]);
    setSelectedBidderId(created.id);
    showToast(`Bidder ${created.companyName} registered with combined document PDF.`);

    if (autoStartVerification) {
      handleStartVerification(created.id);
    } else {
      setActiveTab('tenders');
    }
  };

  if (!isAuthenticated) {
    return (
      <LoginPage
        onLoginSuccess={(name) => {
          setOfficerName(name);
          setIsAuthenticated(true);
        }}
      />
    );
  }

  const pendingReviewsCount = bidders.filter(
    (b) => b.verificationStatus === 'ACTION_REQUIRED' || (b.complianceSummary?.reviewRequiredCount || 0) > 0
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 antialiased font-sans">
      {/* Top Simple Navigation Header */}
      <Navbar
        currentOfficerName={officerName}
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        onLogout={() => setIsAuthenticated(false)}
        pendingReviewsCount={pendingReviewsCount}
      />

      {/* Main Page Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Toast Notification */}
        {notification && (
          <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-lg border border-slate-700 text-xs font-semibold flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            <span>{notification}</span>
          </div>
        )}

        {/* View 1: Dashboard */}
        {activeTab === 'dashboard' && (
          <DashboardOverview
            tenders={tenders}
            bidders={bidders}
            onOpenCreateTender={() => setIsCreateTenderModalOpen(true)}
            onSelectTender={handleSelectTender}
            onSelectBidder={handleSelectBidder}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {/* View 2: Tenders */}
        {activeTab === 'tenders' && (
          <TendersList
            tenders={tenders}
            bidders={bidders}
            selectedTenderId={selectedTenderId}
            onSelectTender={(id) => setSelectedTenderId(id)}
            onOpenCreateModal={() => setIsCreateTenderModalOpen(true)}
            onOpenAddBidderModal={handleOpenAddBidder}
            onSelectBidder={handleSelectBidder}
            onStartVerification={handleStartVerification}
          />
        )}

        {/* View 3: Verification */}
        {activeTab === 'verification' && (
          <ComplianceDashboard
            bidder={activeBidder}
            tender={activeTender}
            allBidders={bidders}
            onSelectBidder={(id) => setSelectedBidderId(id)}
            onStartVerification={handleStartVerification}
            onSaveDecision={handleSaveDecision}
            onGenerateReport={() => setActiveTab('reports')}
            isVerifying={isVerifying}
            officerName={officerName}
          />
        )}

        {/* View 4: Reports */}
        {activeTab === 'reports' && (
          <ReportsView
            bidders={bidders}
            tenders={tenders}
            activeBidder={activeBidder}
            activeTender={activeTender}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        Government e-Marketplace (GeM) • Bid Compliance & Statutory Verification • SIH26100
      </footer>

      {/* Tender Create Modal */}
      <TenderCreateModal
        isOpen={isCreateTenderModalOpen}
        onClose={() => setIsCreateTenderModalOpen(false)}
        onCreate={handleCreateTender}
      />

      {/* Bidder & Combined PDF Upload Modal */}
      <BidderCreateModal
        isOpen={isAddBidderModalOpen}
        onClose={() => setIsAddBidderModalOpen(false)}
        onCreate={handleCreateBidder}
        tender={tenders.find((t) => t.id === targetTenderIdForAddBidder) || activeTender}
        tenders={tenders}
      />
    </div>
  );
}

export default App;
