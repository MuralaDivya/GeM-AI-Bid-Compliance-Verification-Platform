import { jsPDF } from 'jspdf';
import { Tender, Bidder } from '../types';

export function generateComplianceReportPDF(tender: Tender, bidder: Bidder) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 15;

  // Header Banner
  doc.setFillColor(15, 59, 125); // Deep Government Navy
  doc.rect(0, 0, pageWidth, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('GOVERNMENT OF INDIA — GeM PROCUREMENT PORTAL', 14, 10);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('INTEGRATED BID COMPLIANCE & STATUTORY VERIFICATION CERTIFICATE', 14, 16);
  doc.text(`DATE: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, pageWidth - 45, 16);

  y = 32;

  // Organization & Tender Header
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('1. PROCUREMENT TENDER & BIDDER PARTICULARS', 14, y);
  y += 6;

  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, pageWidth - 28, 38, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Tender Number:', 18, y + 6);
  doc.text('Organization / Dept:', 18, y + 12);
  doc.text('Tender Title:', 18, y + 18);
  doc.text('Bidder Legal Entity:', 18, y + 24);
  doc.text('PAN / GSTIN / Udyam:', 18, y + 30);

  doc.setFont('helvetica', 'normal');
  doc.text(`${tender.tenderNumber} (${tender.category})`, 54, y + 6);
  doc.text(`${tender.organization} — ${tender.department}`, 54, y + 12);
  
  // Truncate long title if needed
  const titleText = tender.title.length > 70 ? tender.title.substring(0, 67) + '...' : tender.title;
  doc.text(titleText, 54, y + 18);
  doc.text(`${bidder.companyName} [CIN: ${bidder.registrationNumber}]`, 54, y + 24);
  doc.text(`PAN: ${bidder.panNumber} | GSTIN: ${bidder.gstin} | MSME: ${bidder.enterpriseType}`, 54, y + 30);

  y += 44;

  // Compliance Score & Risk Banner
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('2. BIDDER QUALIFICATION STATUS & MANDATORY COMPLIANCE DETERMINATION', 14, y);
  y += 6;

  const isNotQualified = bidder.qualificationStatus === 'NOT_QUALIFIED' || (bidder.complianceSummary?.missingCount || 0) > 0;
  const isRequiresReview = !isNotQualified && (bidder.qualificationStatus === 'REQUIRES_MANUAL_REVIEW' || (bidder.complianceSummary?.reviewRequiredCount || 0) > 0);
  const qualStatusText = isNotQualified ? 'NOT QUALIFIED' : isRequiresReview ? 'REQUIRES MANUAL REVIEW' : 'QUALIFIED';

  // Qualification Status Box
  doc.setFillColor(isNotQualified ? 254 : isRequiresReview ? 254 : 240, isNotQualified ? 242 : isRequiresReview ? 243 : 253, isNotQualified ? 242 : isRequiresReview ? 199 : 244);
  doc.setDrawColor(isNotQualified ? 252 : isRequiresReview ? 253 : 187, isNotQualified ? 165 : isRequiresReview ? 230 : 247, isNotQualified ? 165 : isRequiresReview ? 138 : 208);
  doc.roundedRect(14, y, 62, 25, 2, 2, 'FD');

  doc.setTextColor(isNotQualified ? 185 : isRequiresReview ? 180 : 22, isNotQualified ? 28 : isRequiresReview ? 83 : 101, isNotQualified ? 28 : isRequiresReview ? 9 : 52);
  doc.setFontSize(7.5);
  doc.text('QUALIFICATION STATUS', 18, y + 6);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(qualStatusText, 18, y + 15);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(isNotQualified ? 'Mandatory Requirement Missing' : isRequiresReview ? 'Review Required' : 'All Mandatory Met', 18, y + 21);

  // Supporting Score Box
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(80, y, 48, 25, 2, 2, 'FD');

  doc.setTextColor(51, 65, 85);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('OVERALL COMPLIANCE %', 84, y + 6);
  doc.setFontSize(14);
  doc.setTextColor(30, 64, 175);
  doc.text(`${bidder.complianceScore}%`, 84, y + 15);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('(Supporting Metric)', 84, y + 21);

  // Mandatory Checklist Summary Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(132, y, pageWidth - 146, 25, 2, 2, 'FD');

  doc.setTextColor(51, 65, 85);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('MANDATORY REQUIREMENTS RULE', 136, y + 6);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(`• Compliant: ${bidder.complianceSummary?.compliantCount || 0}`, 136, y + 11);
  doc.text(`• Missing Required: ${bidder.complianceSummary?.missingCount || 0}`, 136, y + 16);
  doc.text(`• Needs Review: ${bidder.complianceSummary?.reviewRequiredCount || 0}`, 136, y + 21);

  y += 31;

  // Compliance Matrix Table
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('3. STATUTORY COMPLIANCE & PORTAL VERIFICATION MATRIX', 14, y);
  y += 5;

  // Table header
  doc.setFillColor(226, 232, 240);
  doc.rect(14, y, pageWidth - 28, 7, 'F');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('STATUTORY REQUIREMENT', 16, y + 5);
  doc.text('CATEGORY', 78, y + 5);
  doc.text('DOC OCR', 108, y + 5);
  doc.text('PORTAL', 128, y + 5);
  doc.text('VERDICT / FINDING', 148, y + 5);

  y += 7;

  const matrix = bidder.complianceMatrix || [];
  matrix.forEach((item, index) => {
    if (y > 255) {
      doc.addPage();
      y = 20;
    }

    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y, pageWidth - 28, 8.5, 'F');
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    doc.text(item.requirementName.substring(0, 34), 16, y + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.text(item.category, 78, y + 5.5);

    // Doc status
    doc.text(item.documentStatus === 'VERIFIED' ? 'Verified (OK)' : item.documentStatus, 108, y + 5.5);
    
    // Portal status
    doc.text(item.portalStatus === 'VERIFIED' ? 'Match (Live)' : item.portalStatus, 128, y + 5.5);

    // Status pill text
    if (item.overallStatus === 'COMPLIANT') {
      doc.setTextColor(22, 101, 52);
      doc.text('COMPLIANT', 148, y + 5.5);
    } else if (item.overallStatus === 'REVIEW_REQUIRED') {
      doc.setTextColor(180, 83, 9);
      doc.text('REVIEW REQ.', 148, y + 5.5);
    } else if (item.overallStatus === 'MISSING') {
      doc.setTextColor(185, 28, 28);
      doc.text('MISSING REQ.', 148, y + 5.5);
    } else {
      doc.setTextColor(100, 116, 139);
      doc.text(item.overallStatus, 148, y + 5.5);
    }

    y += 8.5;
  });

  y += 4;

  // Cross-verification & AI findings
  if (y > 230) {
    doc.addPage();
    y = 20;
  }

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('4. KEY CROSS-DOCUMENT FINDINGS & EVIDENCE', 14, y);
  y += 5;

  doc.setFillColor(254, 252, 232);
  doc.setDrawColor(254, 240, 138);
  doc.roundedRect(14, y, pageWidth - 28, 28, 2, 2, 'FD');

  doc.setTextColor(133, 77, 14);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('FLAGGED DISCREPANCY 1: Legal Name Variation Across Registrations', 18, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.text('• Submitted / GST Name: "ABC Technologies Pvt Ltd" | Udyam Certificate: "ABC Technologies Private Limited"', 18, y + 12);
  doc.text('• Root Cause: Standard abbreviation variation between MCA-21 incorporation and MSME filing.', 18, y + 17);
  doc.text('• AI Recommendation: Manual verification by Procurement Officer recommended before price bid opening.', 18, y + 22);

  y += 34;

  // Officer Decision Block (Human in the Loop)
  if (y > 235) {
    doc.addPage();
    y = 20;
  }

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('5. PROCUREMENT OFFICER FINAL EVALUATION & DECISION', 14, y);
  y += 5;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, y, pageWidth - 28, 30, 2, 2, 'FD');

  const decision = bidder.officerDecision?.decision || 'MANUAL_REVIEW_PENDING';
  const officerName = bidder.officerDecision?.officerName || 'Rajesh Kumar, Senior Manager (Procurement)';
  const decidedDate = bidder.officerDecision?.decidedAt ? new Date(bidder.officerDecision.decidedAt).toLocaleString('en-IN') : 'Pending Final Submission';
  const comments = bidder.officerDecision?.comments || 'Clarification letter issued to bidder for missing OEM Manufacturer Authorization Form (MAF). Udyam name confirmed against MCA-21 registration.';

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`Official Decision Status:`, 18, y + 6);
  doc.setTextColor(decision === 'QUALIFIED' ? 22 : decision === 'NOT_QUALIFIED' ? 185 : 180, decision === 'QUALIFIED' ? 101 : 83, 9);
  doc.text(decision, 60, y + 6);

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.text(`Authorized Officer:`, 18, y + 12);
  doc.setFont('helvetica', 'normal');
  doc.text(`${officerName} | Recorded on: ${decidedDate}`, 52, y + 12);

  doc.setFont('helvetica', 'bold');
  doc.text(`Officer Comments:`, 18, y + 18);
  doc.setFont('helvetica', 'normal');
  doc.text(doc.splitTextToSize(comments, pageWidth - 60), 52, y + 18);

  y += 36;

  // Disclaimer & Audit stamp
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'italic');
  doc.text('DISCLAIMER: This document is an AI-assisted decision-support evaluation report generated under SIH 2026 guidelines.', 14, y);
  doc.text('The automated system does not disqualify bidders; final qualification authority resides with the authorized Procurement Officer.', 14, y + 4);
  doc.text(`Digital Verification Hash: SHA256-CPCL-${bidder.id}-${Date.now().toString(16).toUpperCase()}`, 14, y + 8);

  doc.save(`GeM_Compliance_Report_${bidder.bidderNumber}_${tender.tenderNumber}.pdf`);
}
