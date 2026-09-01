# GeM AI Bid Compliance Verification Platform
## System Requirements & Operational Workflow (SIH 2026 – CPCL)

---

## 1. System Overview & Objectives
The **GeM AI Bid Compliance Verification Platform** is an enterprise-grade, decision-support solution designed for Public Procurement Officers evaluating bids under Government of India GeM (Government e-Marketplace) and CPCL (Chennai Petroleum Corporation Limited) tender guidelines.

The platform automates the intake, segmentation, cross-registry verification, and deterministic qualification assessment of multi-document tender submissions from a single combined PDF upload.

---

## 2. End-to-End System Workflow

```text
┌────────────────────────────────────────────────────────────────────────────┐
│                             END-TO-END WORKFLOW                            │
└────────────────────────────────────────────────────────────────────────────┘

 1. TENDER CREATION & CONFIGURATION
    ├── Define Tender ID, Title, Organization (CPCL/GeM), Estimated Value & Due Date
    └── Select Statutory Document Requirements (PAN, GST, Udyam, OEM, MII, Non-Blacklist)
        └── Tag each requirement strictly as REQUIRED (Mandatory) or OPTIONAL

 2. BIDDER SUBMISSION & INTAKE (ISOLATED LIFECYCLE)
    ├── Open "Add Bidder" Modal (Starts strictly in fresh/empty state)
    ├── Input Bidder details (Legal Company Name, PAN, Contact, Email, Phone)
    └── Upload single combined PDF (Statutory dossier with auto-segmentation)
        └── Select/Validate document inclusions

 3. AUTOMATED SEGMENTATION & AI-ASSISTED EXTRACTION
    ├── Multi-document boundary segmentation from single PDF
    ├── Entity Name, Registration ID, Validity & Metadata parsing
    └── Resilient Gemini AI service extraction with multi-model failover & deterministic fallback

 4. DETERMINISTIC QUALIFICATION & COMPLIANCE RULES ENGINE
    ├── Cross-reference extracted documents against Tender Mandatory Requirements
    ├── Validate PAN / GSTIN / Udyam / OEM Authorization / MII % / Non-Debarment
    ├── Evaluate Strict Mandatory Qualification Rule:
    │   ├── All Mandatory Met & Verified ───────► ✅ QUALIFIED
    │   ├── 1+ Mandatory Missing/Non-Compliant ─► ❌ NOT QUALIFIED
    │   └── Name/Format Ambiguity / Discrepancy ─► ⚠️ REQUIRES MANUAL REVIEW
    └── Calculate Overall Compliance % as a Supporting Metric (cannot override missing items)

 5. PROCUREMENT OFFICER DECISION & AUDIT TRAIL
    ├── Officer reviews requirement-by-requirement checklist & extracted evidence pages
    ├── Inspect detected discrepancies or warnings in the Verification Review Panel
    ├── System presets officer recommendation matching deterministic finding
    ├── Override safeguard: Requires justification if qualifying a bidder with missing documents
    └── Record official decision (QUALIFIED, DISQUALIFIED, CLARIFICATION_REQUESTED)

 6. FORMAL REPORT & AUDIT TRAIL GENERATION
    ├── Generate tamper-evident PDF Compliance Certificate
    ├── Detailed breakdown of requirements, portal validations, source pages, and officer notes
    └── Update dashboard analytics and qualification statistics
```

---

## 3. Functional Requirements

### 3.1 Tender Management
- **FR-1.1**: Ability to create, update, and manage public tenders with unique Tender Numbers and department metadata.
- **FR-1.2**: Ability to configure default and custom compliance requirements categorized as either `REQUIRED` (mandatory) or `OPTIONAL`.
- **FR-1.3**: Automatic tracking of attached bidders, qualification ratios, and submission deadlines.

### 3.2 Bidder Intake & Form Isolation
- **FR-2.1**: Independent state management for each bidder creation session (`resetBidderForm()`), ensuring zero carryover of state, company names, contact details, or files across sessions.
- **FR-2.2**: Single combined PDF file intake with drag-and-drop and manual file selector support.
- **FR-2.3**: Automated DOM file input clearing on modal cancel, close, or successful save.

### 3.3 Statutory Document Verification
- **FR-3.1 Permanent Account Number (PAN)**:
  - 10-character alphanumeric structure (`[A-Z]{5}[0-9]{4}[A-Z]{1}`).
  - Cross-verification with legal entity name and Income Tax Department standards.
- **FR-3.2 Goods & Services Tax (GSTIN)**:
  - 15-character statutory GSTIN (`[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}`).
  - Validation of state code prefix, PAN embedding, and active taxpayer status.
- **FR-3.3 Udyam / MSME Registration**:
  - Verification of Udyam format (`UDYAM-XX-00-0000000`), enterprise classification (Micro/Small/Medium), and validity.
- **FR-3.4 OEM Authorization Certificate**:
  - Verification of manufacturer name, authorized partner scope, territory validity, and contract period.
- **FR-3.5 Make in India (MII) Declaration**:
  - Calculation and verification of local content percentage ($\ge 50\%$ for Class-I Local Supplier, $20\%\text{--}50\%$ for Class-II).
- **FR-3.6 Non-Blacklisting / Debarment Undertaking**:
  - Verification of notarized self-declaration confirming non-debarment by Central/State Ministries or CPCL.

### 3.4 Deterministic Qualification Rules Engine
- **FR-4.1 Strict Mandatory Rule**: If any mandatory requirement has a status of `MISSING` or `NON_COMPLIANT`, the qualification verdict is deterministically `NOT_QUALIFIED`.
- **FR-4.2 Supporting Metric Designation**: Overall Compliance Score (0–100%) is strictly treated as an informational supporting metric and does not supersede missing mandatory items.
- **FR-4.3 Manual Review Flagging**: Discrepancies (e.g., minor entity name variations between PAN and GST, pending clarifications) automatically set status to `REQUIRES_MANUAL_REVIEW`.

### 3.5 Resilient AI Integration
- **FR-5.1 Failover Hierarchy**: Gemini API requests execute with automated retry and sequential failover (`gemini-3.7-flash` $\rightarrow$ `gemini-3.1-flash-lite` $\rightarrow$ `gemini-flash-latest`).
- **FR-5.2 Deterministic Fallback**: In the event of network unreachability or API unavailability (503/429), the engine automatically executes local rule-based verification with zero downtime.

### 3.6 Officer Decision Support & Audit Trail
- **FR-6.1**: Procurement Officer retains final authority with predefined decision presets aligned to the AI/deterministic findings.
- **FR-6.2**: Warning prompt and mandatory remark requirement if an officer attempts to mark a bidder with missing mandatory requirements as "Qualified".
- **FR-6.3**: Permanent, immutable event log for every action (Upload, AI Analysis, Verification, Officer Decision, Report Download).

### 3.7 PDF Compliance Certificate
- **FR-7.1**: Real-time client-side generation of printable compliance certificates using `jspdf` and `jspdf-autotable`.
- **FR-7.2**: Formatted summary including Tender Details, Qualification Status, Supporting Score %, Statutory Checklist, and Sign-off Blocks.

---

## 4. Technical Requirements & Dependencies

### 4.1 Runtime & Framework
- **Runtime**: Node.js 18+ (Express.js backend + Vite development server)
- **Frontend**: React 18 (TypeScript), Tailwind CSS
- **Icons**: Lucide React (`lucide-react`)
- **Reporting**: jsPDF (`jspdf`, `jspdf-autotable`)
- **AI SDK**: Google Gen AI SDK (`@google/genai`)

### 4.2 Port & Networking
- **Binding**: Port `3000`, Host `0.0.0.0` (Containerized Cloud Run environment)

### 4.3 Environment Variables
- `GEMINI_API_KEY`: Server-side API key for Gemini models (defined in `.env.example`).
