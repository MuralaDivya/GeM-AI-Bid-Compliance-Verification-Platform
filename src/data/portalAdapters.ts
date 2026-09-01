import { PortalAdapterInfo } from '../types';

export const PORTAL_ADAPTERS: PortalAdapterInfo[] = [
  {
    id: 'udyam',
    name: 'Udyam / MSME Verification Adapter',
    code: 'ADPT-UDYAM-V1',
    targetMinistry: 'Ministry of Micro, Small and Medium Enterprises',
    status: 'ONLINE',
    responseTimeMs: 240,
    description: 'Verifies MSME Udyam Registration Number, enterprise classification, investment, and operational status.',
    supportedFields: ['Udyam Reg Number', 'Enterprise Classification', 'Major Activity', 'DIC Location']
  },
  {
    id: 'gst',
    name: 'GSTN Compliance & Return Filing Adapter',
    code: 'ADPT-GSTN-V2',
    targetMinistry: 'Goods and Services Tax Network (GSTN)',
    status: 'ONLINE',
    responseTimeMs: 310,
    description: 'Cross-verifies GSTIN status, taxpayer constitution, and compliance on GSTR-1 / GSTR-3B filings for preceding 6 months.',
    supportedFields: ['GSTIN', 'Legal Name', 'Taxpayer Type', 'Filing Status (GSTR-3B)']
  },
  {
    id: 'incometax',
    name: 'CBDT PAN & Income Tax Return Adapter',
    code: 'ADPT-CBDT-V1',
    targetMinistry: 'Central Board of Direct Taxes (MoF)',
    status: 'ONLINE',
    responseTimeMs: 190,
    description: 'Checks PAN validity, PAN-Aadhaar linkage, and ITR filing compliance for AY 2024-25 and 2025-26.',
    supportedFields: ['PAN Number', 'Entity Status', 'ITR Acknowledgement', 'Section 206AB Compliance']
  },
  {
    id: 'epfo',
    name: 'EPFO Statutory Compliance Adapter',
    code: 'ADPT-EPFO-V1',
    targetMinistry: 'Employees Provident Fund Organisation (MoLE)',
    status: 'ONLINE',
    responseTimeMs: 280,
    description: 'Verifies Establishment Code, active contributory members, and Electronic Challan cum Return (ECR) payments.',
    supportedFields: ['Establishment Code', 'Wage Month ECR', 'Active Contributory Members']
  },
  {
    id: 'esic',
    name: 'ESIC Employer Compliance Adapter',
    code: 'ADPT-ESIC-V1',
    targetMinistry: 'Employees State Insurance Corporation (MoLE)',
    status: 'ONLINE',
    responseTimeMs: 210,
    description: 'Validates 17-digit ESIC Employer Code and monthly contribution compliance for eligible industrial workforce.',
    supportedFields: ['Employer Code', 'Coverage Status', 'Latest Contribution Challan']
  },
  {
    id: 'startup',
    name: 'Startup India (DPIIT) Recognition Adapter',
    code: 'ADPT-DPIIT-V1',
    targetMinistry: 'Department for Promotion of Industry and Internal Trade (MoCI)',
    status: 'ONLINE',
    responseTimeMs: 180,
    description: 'Checks Startup Recognition Certificate (DIPP/DPIIT) and eligibility for tender exemption on prior turnover.',
    supportedFields: ['DPIIT Certificate No.', 'Entity Stage', 'Tax Exemption u/s 80-IAC']
  },
  {
    id: 'nsic',
    name: 'NSIC Single Point Registration Adapter',
    code: 'ADPT-NSIC-V1',
    targetMinistry: 'National Small Industries Corporation',
    status: 'ONLINE',
    responseTimeMs: 260,
    description: 'Validates Single Point Registration Scheme (SPRS) validity, store items, and quantitative monetary limits.',
    supportedFields: ['NSIC Certificate No.', 'Store Items Approved', 'Monetary Limit (INR)']
  },
  {
    id: 'blacklist',
    name: 'GeM Central Debarment & Blacklist Adapter',
    code: 'ADPT-CVC-DEBAR-V1',
    targetMinistry: 'GeM / Central Vigilance Commission / CPCL Debarment Registry',
    status: 'ONLINE',
    responseTimeMs: 150,
    description: 'Queries national unified blacklisting register across GeM, CVC, MoP&NG, and public procurement bans.',
    supportedFields: ['PAN / CIN / GSTIN', 'Debarment Status', 'Issuing Authority', 'Validity Period']
  }
];
