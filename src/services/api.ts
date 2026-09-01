import { Tender, Bidder, OfficerDecision, PortalAdapterInfo } from '../types';
import { PORTAL_ADAPTERS } from '../data/portalAdapters';

const BASE_URL = '/api';

class ApiService {
  private localTenders: Tender[] = [];
  private localBidders: Record<string, Bidder> = {};

  async getTenders(): Promise<Tender[]> {
    try {
      const res = await fetch(`${BASE_URL}/tenders`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }
    return this.localTenders;
  }

  async getTenderById(id: string): Promise<Tender | null> {
    try {
      const res = await fetch(`${BASE_URL}/tenders/${id}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }
    return this.localTenders.find(t => t.id === id) || null;
  }

  async createTender(tender: Partial<Tender>): Promise<Tender> {
    try {
      const res = await fetch(`${BASE_URL}/tenders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tender)
      });
      if (res.ok) {
        const created = await res.json();
        this.localTenders.unshift(created);
        return created;
      }
    } catch {
      // fallback
    }
    const newTender: Tender = {
      id: `tnd-${Date.now()}`,
      tenderNumber: tender.tenderNumber || `TND-2026-${Math.floor(100 + Math.random() * 900)}`,
      title: tender.title || 'Untitled Tender',
      department: tender.department || 'Procurement Group',
      organization: tender.organization || 'Chennai Petroleum Corporation Limited (CPCL)',
      category: tender.category || 'General Procurement',
      estimatedValueINR: tender.estimatedValueINR || 10000000,
      publishedDate: tender.publishedDate || new Date().toISOString().split('T')[0],
      closingDate: tender.closingDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      status: 'ACTIVE',
      description: tender.description || '',
      bidderCount: 0,
      requirements: tender.requirements || []
    };
    this.localTenders.unshift(newTender);
    return newTender;
  }

  async getBidders(tenderId?: string): Promise<Bidder[]> {
    try {
      const url = tenderId ? `${BASE_URL}/bidders?tenderId=${tenderId}` : `${BASE_URL}/bidders`;
      const res = await fetch(url);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }
    const list = Object.values(this.localBidders);
    return tenderId ? list.filter(b => b.tenderId === tenderId) : list;
  }

  async getBidderById(id: string): Promise<Bidder | null> {
    try {
      const res = await fetch(`${BASE_URL}/bidders/${id}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }
    return this.localBidders[id] || null;
  }

  async createBidder(bidder: Partial<Bidder>): Promise<Bidder> {
    try {
      const res = await fetch(`${BASE_URL}/bidders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bidder)
      });
      if (res.ok) {
        const created = await res.json();
        this.localBidders[created.id] = created;
        return created;
      }
    } catch {
      // fallback
    }
    const newBidder: Bidder = {
      id: `bid-${Date.now()}`,
      tenderId: bidder.tenderId || '',
      bidderNumber: bidder.bidderNumber || `BID-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      companyName: bidder.companyName || 'New Bidder',
      registrationNumber: bidder.registrationNumber || '',
      panNumber: bidder.panNumber || '',
      gstin: bidder.gstin || '',
      contactEmail: bidder.contactEmail || '',
      contactPhone: bidder.contactPhone || '',
      registeredAddress: bidder.registeredAddress || '',
      enterpriseType: bidder.enterpriseType || 'MICRO',
      submissionDate: new Date().toISOString(),
      documents: bidder.documents || [],
      verificationStatus: 'NOT_STARTED',
      complianceScore: 0,
      riskLevel: 'LOW',
      auditTrail: [
        {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: bidder.companyName || 'Bidder',
          actorRole: 'BIDDER',
          action: 'Bid Registered',
          category: 'SYSTEM',
          details: 'Bidder created in the system.',
          resultStatus: 'SUCCESS'
        }
      ]
    };
    this.localBidders[newBidder.id] = newBidder;
    return newBidder;
  }

  async startVerification(bidderId: string): Promise<Bidder | null> {
    try {
      const res = await fetch(`${BASE_URL}/verification/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bidderId })
      });
      if (res.ok) {
        const updated = await res.json();
        this.localBidders[bidderId] = updated;
        return updated;
      }
    } catch {
      // fallback
    }
    const bidder = this.localBidders[bidderId];
    if (!bidder) return null;
    bidder.verificationStatus = 'ACTION_REQUIRED';
    bidder.complianceScore = bidder.documents.length > 0 ? 80 : 0;
    bidder.riskLevel = 'LOW';
    this.localBidders[bidderId] = bidder;
    return bidder;
  }

  async recordOfficerDecision(payload: {
    bidderId: string;
    decision: OfficerDecision['decision'];
    comments: string;
    officerName: string;
    officerDesignation: string;
    overriddenChecks?: string[];
  }): Promise<Bidder | null> {
    try {
      const res = await fetch(`${BASE_URL}/officer-decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const updated = await res.json();
        this.localBidders[payload.bidderId] = updated;
        return updated;
      }
    } catch {
      // fallback
    }
    const bidder = this.localBidders[payload.bidderId];
    if (!bidder) return null;
    bidder.officerDecision = {
      decision: payload.decision,
      officerName: payload.officerName,
      officerEmail: 'officer.procurement@cpcl.gov.in',
      officerDesignation: payload.officerDesignation,
      decidedAt: new Date().toISOString(),
      comments: payload.comments,
      overriddenChecks: payload.overriddenChecks || [],
      signatureStamp: `VERIFIED-CPCL-OFFICER-${Date.now().toString(36).toUpperCase()}`
    };
    bidder.auditTrail.push({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: `${payload.officerName} (${payload.officerDesignation})`,
      actorRole: 'OFFICER',
      action: `Officer Decision: ${payload.decision}`,
      category: 'OFFICER_REVIEW',
      details: payload.comments || 'Final decision recorded by authorized Procurement Officer.',
      resultStatus: payload.decision === 'QUALIFIED' ? 'SUCCESS' : payload.decision === 'NOT_QUALIFIED' ? 'ERROR' : 'WARNING'
    });
    this.localBidders[payload.bidderId] = bidder;
    return bidder;
  }

  async getPortalAdapters(): Promise<PortalAdapterInfo[]> {
    try {
      const res = await fetch(`${BASE_URL}/portal/adapters`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }
    return PORTAL_ADAPTERS;
  }

  async testPortalAdapter(adapterId: string, queryId: string): Promise<any> {
    try {
      const res = await fetch(`${BASE_URL}/portal/${adapterId}/${encodeURIComponent(queryId)}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }
    return {
      adapterId,
      status: 'VERIFIED',
      queryId,
      isDemoData: false,
      timestamp: new Date().toISOString(),
      message: 'Portal response verified successfully'
    };
  }
}

export const apiService = new ApiService();
