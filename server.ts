import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { dataStore } from './server/dataStore';
import { runFullVerificationPipeline } from './server/complianceEngine';
import { portalService } from './server/adapters';
import { PORTAL_ADAPTERS } from './src/data/portalAdapters';

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString(), sihProblem: 'SIH26100', org: 'CPCL' });
  });

  // Tenders
  app.get('/api/tenders', (req, res) => {
    res.json(dataStore.getAllTenders());
  });

  app.get('/api/tenders/:id', (req, res) => {
    const tender = dataStore.getTender(req.params.id);
    if (!tender) {
      return res.status(404).json({ error: 'Tender not found' });
    }
    res.json(tender);
  });

  app.post('/api/tenders', (req, res) => {
    const body = req.body;
    const newTender = {
      id: `tnd-${Date.now()}`,
      tenderNumber: body.tenderNumber || `TND-2026-${Math.floor(100 + Math.random() * 900)}`,
      title: body.title || 'New Procurement Tender',
      department: body.department || 'Procurement Group',
      organization: body.organization || 'Chennai Petroleum Corporation Limited (CPCL)',
      category: body.category || 'Goods & Services',
      estimatedValueINR: Number(body.estimatedValueINR) || 10000000,
      publishedDate: body.publishedDate || new Date().toISOString().split('T')[0],
      closingDate: body.closingDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      status: 'ACTIVE' as const,
      description: body.description || '',
      bidderCount: 0,
      requirements: body.requirements || []
    };
    dataStore.addTender(newTender);
    res.status(201).json(newTender);
  });

  // Bidders
  app.get('/api/bidders', (req, res) => {
    const tenderId = req.query.tenderId as string | undefined;
    res.json(dataStore.getAllBidders(tenderId));
  });

  app.get('/api/bidders/:id', (req, res) => {
    const bidder = dataStore.getBidder(req.params.id);
    if (!bidder) {
      return res.status(404).json({ error: 'Bidder not found' });
    }
    res.json(bidder);
  });

  app.post('/api/bidders', (req, res) => {
    const body = req.body;
    const newBidder = {
      id: `bid-${Date.now()}`,
      tenderId: body.tenderId || 'tnd-2026-001',
      bidderNumber: `BID-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      companyName: body.companyName || 'New Bidder Ltd',
      registrationNumber: body.registrationNumber || 'U74999DL2020PTC123456',
      panNumber: body.panNumber || 'AABCN9999K',
      gstin: body.gstin || '07AABCN9999K1Z2',
      contactEmail: body.contactEmail || 'contact@bidder.in',
      contactPhone: body.contactPhone || '+91 9876543210',
      registeredAddress: body.registeredAddress || 'Industrial Area, India',
      enterpriseType: body.enterpriseType || 'SMALL',
      submissionDate: new Date().toISOString(),
      documents: body.documents || [],
      verificationStatus: 'NOT_STARTED' as const,
      complianceScore: 0,
      riskLevel: 'LOW' as const,
      auditTrail: [
        {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: body.companyName || 'Bidder',
          actorRole: 'BIDDER',
          action: 'Bid Registered',
          category: 'SYSTEM' as const,
          details: 'Bidder registered on GeM compliance portal.',
          resultStatus: 'SUCCESS' as const
        }
      ]
    };
    dataStore.saveBidder(newBidder);
    res.status(201).json(newBidder);
  });

  // Start Verification Pipeline
  app.post('/api/verification/start', async (req, res) => {
    const { bidderId } = req.body;
    const bidder = dataStore.getBidder(bidderId);
    if (!bidder) {
      return res.status(404).json({ error: 'Bidder not found' });
    }
    const tender = dataStore.getTender(bidder.tenderId) || dataStore.getAllTenders()[0];

    const updated = await runFullVerificationPipeline(bidder, tender);
    dataStore.saveBidder(updated);
    res.json(updated);
  });

  // Compliance & Audit
  app.get('/api/compliance/:bidId', (req, res) => {
    const bidder = dataStore.getBidder(req.params.bidId);
    if (!bidder) {
      return res.status(404).json({ error: 'Bidder not found' });
    }
    res.json({
      complianceScore: bidder.complianceScore,
      riskLevel: bidder.riskLevel,
      summary: bidder.complianceSummary,
      matrix: bidder.complianceMatrix,
      findings: bidder.crossCheckFindings,
      recommendation: bidder.aiRecommendation
    });
  });

  app.get('/api/audit/:bidId', (req, res) => {
    const bidder = dataStore.getBidder(req.params.bidId);
    if (!bidder) {
      return res.status(404).json({ error: 'Bidder not found' });
    }
    res.json(bidder.auditTrail);
  });

  // Officer Decision (Human in the loop)
  app.post('/api/officer-decision', (req, res) => {
    const { bidderId, decision, comments, officerName, officerDesignation, overriddenChecks } = req.body;
    const bidder = dataStore.getBidder(bidderId);
    if (!bidder) {
      return res.status(404).json({ error: 'Bidder not found' });
    }

    bidder.officerDecision = {
      decision: decision || 'MANUAL_REVIEW_PENDING',
      officerName: officerName || 'Rajesh Kumar',
      officerEmail: 'officer.procurement@cpcl.gov.in',
      officerDesignation: officerDesignation || 'Senior Manager (Procurement)',
      decidedAt: new Date().toISOString(),
      comments: comments || 'Evaluation noted by Procurement Officer.',
      overriddenChecks: overriddenChecks || [],
      signatureStamp: `VERIFIED-CPCL-OFFICER-${Date.now().toString(36).toUpperCase()}`
    };

    bidder.auditTrail.push({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: `${bidder.officerDecision.officerName} (${bidder.officerDecision.officerDesignation})`,
      actorRole: 'OFFICER',
      action: `Officer Decision: ${decision}`,
      category: 'OFFICER_REVIEW',
      details: comments || 'Final decision recorded by Procurement Officer.',
      resultStatus: decision === 'QUALIFIED' ? 'SUCCESS' : decision === 'NOT_QUALIFIED' ? 'ERROR' : 'WARNING'
    });

    dataStore.saveBidder(bidder);
    res.json(bidder);
  });

  // Portal Adapters Endpoints
  app.get('/api/portal/adapters', (req, res) => {
    res.json(PORTAL_ADAPTERS);
  });

  app.get('/api/portal/udyam/:id', async (req, res) => {
    const result = await portalService.udyam.verify(req.params.id);
    res.json(result);
  });

  app.get('/api/portal/gst/:id', async (req, res) => {
    const result = await portalService.gst.verify(req.params.id);
    res.json(result);
  });

  app.get('/api/portal/pan/:id', async (req, res) => {
    const result = await portalService.incomeTax.verify(req.params.id);
    res.json(result);
  });

  app.get('/api/portal/blacklist/:id', async (req, res) => {
    const result = await portalService.blacklist.verify(req.params.id);
    res.json(result);
  });

  app.get('/api/portal/epfo/:id', async (req, res) => {
    const result = await portalService.epfo.verify(req.params.id);
    res.json(result);
  });

  app.get('/api/portal/esic/:id', async (req, res) => {
    const result = await portalService.esic.verify(req.params.id);
    res.json(result);
  });

  app.get('/api/portal/startup/:id', async (req, res) => {
    const result = await portalService.startupIndia.verify(req.params.id);
    res.json(result);
  });

  app.get('/api/portal/nsic/:id', async (req, res) => {
    const result = await portalService.nsic.verify(req.params.id);
    res.json(result);
  });


  // Vite Middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GeM Compliance Verification Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
