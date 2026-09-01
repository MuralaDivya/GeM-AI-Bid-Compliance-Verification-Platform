export type RequirementLevel = 'REQUIRED' | 'OPTIONAL' | 'NOT_APPLICABLE';

export type ComplianceStatus = 'COMPLIANT' | 'REVIEW_REQUIRED' | 'MISSING' | 'NON_COMPLIANT' | 'NOT_APPLICABLE';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type QualificationStatus = 'QUALIFIED' | 'NOT_QUALIFIED' | 'REQUIRES_MANUAL_REVIEW';

export type OfficerDecisionType = 'QUALIFIED' | 'NOT_QUALIFIED' | 'MANUAL_REVIEW_PENDING' | 'NONE';

export interface TenderRequirement {
  id: string;
  code: string;
  name: string;
  category: 'STATUTORY' | 'TAXATION' | 'LABOUR' | 'TECHNICAL' | 'POLICY' | 'INTEGRITY';
  level: RequirementLevel;
  description: string;
  applicablePortals: string[];
}

export interface Tender {
  id: string;
  tenderNumber: string;
  title: string;
  department: string;
  organization: string;
  category: string;
  estimatedValueINR: number;
  publishedDate: string;
  closingDate: string;
  status: 'ACTIVE' | 'EVALUATION' | 'AWARDED' | 'CANCELLED';
  description: string;
  requirements: TenderRequirement[];
  bidderCount: number;
}

export interface DocumentExtractionData {
  companyName?: string;
  registrationNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  status?: string;
  address?: string;
  authorizedPerson?: string;
  enterpriseType?: string;
  panNumber?: string;
  gstin?: string;
  oemName?: string;
  authorizedBidder?: string;
  validity?: string;
  localContentPercentage?: number;
  turnoverLastYearINR?: number;
  epfoMembersCount?: number;
  esicCoverageCount?: number;
  debarmentStatus?: string;
  rawKeyValues: Record<string, any>;
  confidenceScore: number;
  extractedAt: string;
}

export interface BidDocument {
  id: string;
  requirementCode: string;
  documentType: string;
  fileName: string;
  fileSize: string;
  fileUrl?: string;
  uploadStatus: 'UPLOADED' | 'PROCESSING' | 'EXTRACTED' | 'FAILED' | 'MISSING';
  uploadedAt?: string;
  extraction?: DocumentExtractionData;
}

export interface PortalVerificationRecord {
  adapterId: string;
  adapterName: string;
  status: 'VERIFIED' | 'MISMATCH' | 'NOT_FOUND' | 'DEBARRED' | 'SERVICE_UNAVAILABLE' | 'NOT_APPLICABLE';
  verifiedAt: string;
  referenceId: string;
  isDemoData: boolean;
  matchScore: number;
  portalResponse: Record<string, any>;
  remarks: string;
}

export interface CrossCheckFinding {
  id: string;
  checkType: 'NAME_CONSISTENCY' | 'PAN_GSTIN_LINK' | 'ADDRESS_MATCH' | 'DATE_VALIDITY' | 'AUTHORIZED_SIGNATORY' | 'BLACK_LIST_CHECK';
  title: string;
  status: 'PASS' | 'FLAG_REVIEW' | 'FAIL';
  documentsCompared: string[];
  fieldCompared: string;
  submittedValue: string;
  comparedValue: string;
  explanation: string;
  recommendation: string;
  requiresManualVerification: boolean;
  evidenceSnippet?: {
    sourceA: string;
    valueA: string;
    sourceB: string;
    valueB: string;
  };
}

export interface ComplianceMatrixItem {
  id: string;
  requirementCode: string;
  requirementName: string;
  category: string;
  level: RequirementLevel;
  documentStatus: 'VERIFIED' | 'PENDING' | 'MISSING' | 'FAILED';
  portalStatus: 'VERIFIED' | 'MISMATCH' | 'NOT_FOUND' | 'NOT_APPLICABLE' | 'DEBARRED';
  overallStatus: ComplianceStatus;
  hasDocument: boolean;
  hasPortalMatch: boolean;
  findingsCount: number;
  aiExplanation: string;
  actionRequired: string;
  documentRef?: BidDocument;
  portalRef?: PortalVerificationRecord;
  crossChecks: CrossCheckFinding[];
}

export interface OfficerDecision {
  decision: OfficerDecisionType;
  officerName: string;
  officerEmail: string;
  officerDesignation: string;
  decidedAt: string;
  comments: string;
  overriddenChecks: string[];
  signatureStamp: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  action: string;
  category: 'SYSTEM' | 'AI_OCR' | 'PORTAL_ADAPTER' | 'CROSS_CHECK' | 'OFFICER_REVIEW' | 'REPORT_GENERATION';
  details: string;
  resultStatus?: 'SUCCESS' | 'WARNING' | 'ERROR' | 'INFO';
  evidenceRef?: string;
}

export interface Bidder {
  id: string;
  tenderId: string;
  bidderNumber: string;
  companyName: string;
  registrationNumber: string;
  panNumber: string;
  gstin: string;
  contactEmail: string;
  contactPhone: string;
  registeredAddress: string;
  enterpriseType: 'MICRO' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'STARTUP';
  submissionDate: string;
  documents: BidDocument[];
  verificationStatus: 'NOT_STARTED' | 'PROCESSING' | 'COMPLETED' | 'ACTION_REQUIRED';
  complianceScore: number;
  riskLevel: RiskLevel;
  qualificationStatus?: QualificationStatus;
  qualificationReason?: string;
  missingMandatoryCount?: number;
  mandatoryRequirementsCount?: number;
  compliantMandatoryCount?: number;
  reviewRequiredMandatoryCount?: number;
  complianceSummary?: {
    totalRequirements: number;
    compliantCount: number;
    reviewRequiredCount: number;
    missingCount: number;
    nonCompliantCount: number;
  };
  aiRecommendation?: {
    summary: string;
    primaryAction: 'MANUAL_REVIEW_REQUIRED' | 'PROCEED_TO_OFFICER_APPROVAL' | 'RE_SUBMISSION_NEEDED';
    actionExplanation: string;
    suggestedCheckpoints: string[];
  };
  complianceMatrix?: ComplianceMatrixItem[];
  crossCheckFindings?: CrossCheckFinding[];
  portalVerifications?: Record<string, PortalVerificationRecord>;
  officerDecision?: OfficerDecision;
  auditTrail: AuditLogEntry[];
}

export interface PortalAdapterInfo {
  id: string;
  name: string;
  code: string;
  targetMinistry: string;
  status: 'ONLINE' | 'SIMULATED' | 'DEGRADED';
  responseTimeMs: number;
  description: string;
  supportedFields: string[];
}
