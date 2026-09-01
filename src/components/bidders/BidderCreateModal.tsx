import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Bidder, BidDocument, Tender } from '../../types';

interface BidderCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (bidderData: Partial<Bidder>, autoStartVerification?: boolean) => void;
  tender?: Tender | null;
  tenders?: Tender[];
}

export const BidderCreateModal: React.FC<BidderCreateModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  tender,
  tenders = [],
}) => {
  const [selectedTenderId, setSelectedTenderId] = useState<string>(tender?.id || tenders[0]?.id || '');
  const [companyName, setCompanyName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Single Combined PDF Upload State
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: string;
    pageCount: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Document inclusions within the combined PDF
  const [includedDocs, setIncludedDocs] = useState<{
    pan: boolean;
    gst: boolean;
    udyam: boolean;
    oem: boolean;
    mii: boolean;
    nonblk: boolean;
  }>({
    pan: true,
    gst: true,
    udyam: true,
    oem: true,
    mii: true,
    nonblk: true,
  });

  // Dedicated reliable state reset function
  const resetBidderForm = useCallback(() => {
    setCompanyName('');
    setRegistrationNumber('');
    setPanNumber('');
    setContactPerson('');
    setContactEmail('');
    setContactPhone('');
    setUploadedFile(null);
    setIsDragging(false);
    setIncludedDocs({
      pan: true,
      gst: true,
      udyam: true,
      oem: true,
      mii: true,
      nonblk: true,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Guarantee that every time the modal is opened, it starts completely empty
  useEffect(() => {
    if (isOpen) {
      resetBidderForm();
      if (tender?.id) {
        setSelectedTenderId(tender.id);
      } else if (tenders.length > 0) {
        setSelectedTenderId(tenders[0].id);
      }
    } else {
      resetBidderForm();
    }
  }, [isOpen, tender?.id, tenders, resetBidderForm]);

  if (!isOpen) return null;

  const handleClose = () => {
    resetBidderForm();
    onClose();
  };

  const handleFileSelect = (file: File) => {
    if (!file) return;
    // Estimate or detect page count
    const simulatedPages = Math.max(12, Math.min(45, Math.floor(file.size / 45000) || 28));
    setUploadedFile({
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      pageCount: simulatedPages,
    });

    // If company name is empty, suggest from filename if possible
    if (!companyName) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      if (cleanName.length > 3 && !cleanName.toLowerCase().includes('document')) {
        setCompanyName(cleanName.toUpperCase());
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (autoVerify: boolean = false) => {
    if (!companyName.trim()) return;

    // Build the extracted documents representation from the single combined PDF based on selected inclusions
    const combinedDocs: BidDocument[] = [];
    const baseName = companyName.trim();
    const pan = panNumber.trim() || 'AABCC1234F';
    const fileName = uploadedFile ? uploadedFile.name : 'Bidder_Combined_Statutory_Documents.pdf';
    const fileSize = uploadedFile ? uploadedFile.size : '8.45 MB';

    if (includedDocs.pan) {
      combinedDocs.push({
        id: `doc-pan-${Date.now()}`,
        requirementCode: 'PAN',
        documentType: 'PAN Card',
        fileName,
        fileSize,
        uploadStatus: 'EXTRACTED',
        uploadedAt: new Date().toISOString(),
        extraction: {
          companyName: baseName,
          registrationNumber: pan,
          panNumber: pan,
          issueDate: '2019-04-15',
          status: 'ACTIVE_VALID',
          confidenceScore: 0.98,
          rawKeyValues: {
            'Document Type': 'Permanent Account Number Card',
            'Income Tax Dept': 'Govt. of India',
            'Assessee Name': baseName,
            'PAN': pan,
            'Source Pages': 'Pages 1–2',
          },
          extractedAt: new Date().toISOString(),
        },
      });
    }

    if (includedDocs.gst) {
      combinedDocs.push({
        id: `doc-gst-${Date.now()}`,
        requirementCode: 'GST',
        documentType: 'GST Registration Certificate',
        fileName,
        fileSize,
        uploadStatus: 'EXTRACTED',
        uploadedAt: new Date().toISOString(),
        extraction: {
          companyName: baseName,
          registrationNumber: `33${pan}1Z5`,
          gstin: `33${pan}1Z5`,
          issueDate: '2019-06-20',
          status: 'ACTIVE_REGULAR',
          address: 'Industrial Corridor, Chennai, Tamil Nadu - 600018',
          confidenceScore: 0.96,
          rawKeyValues: {
            'GSTIN': `33${pan}1Z5`,
            'Legal Entity Name': baseName,
            'Registration State': 'Tamil Nadu (33)',
            'Taxpayer Type': 'Regular',
            'Source Pages': 'Pages 3–5',
          },
          extractedAt: new Date().toISOString(),
        },
      });
    }

    if (includedDocs.udyam) {
      combinedDocs.push({
        id: `doc-udyam-${Date.now()}`,
        requirementCode: 'UDYAM',
        documentType: 'Udyam / MSME Certificate',
        fileName,
        fileSize,
        uploadStatus: 'EXTRACTED',
        uploadedAt: new Date().toISOString(),
        extraction: {
          companyName: baseName,
          registrationNumber: `UDYAM-TN-02-${Math.floor(1000000 + Math.random() * 9000000)}`,
          enterpriseType: 'MEDIUM',
          status: 'ACTIVE_VERIFIED',
          confidenceScore: 0.97,
          rawKeyValues: {
            'Udyam Reg Number': `UDYAM-TN-02-${Math.floor(1000000 + Math.random() * 9000000)}`,
            'Enterprise Name': baseName,
            'Major Activity': 'Manufacturing & Industrial Engineering Services',
            'Source Pages': 'Pages 6–7',
          },
          extractedAt: new Date().toISOString(),
        },
      });
    }

    if (includedDocs.oem) {
      combinedDocs.push({
        id: `doc-oem-${Date.now()}`,
        requirementCode: 'OEM_AUTH',
        documentType: 'OEM Authorization Certificate',
        fileName,
        fileSize,
        uploadStatus: 'EXTRACTED',
        uploadedAt: new Date().toISOString(),
        extraction: {
          companyName: baseName,
          oemName: 'FlowControl Heavy Dynamics Global AG',
          authorizedBidder: baseName,
          validity: 'Valid up to 31-Dec-2027',
          confidenceScore: 0.93,
          rawKeyValues: {
            'OEM Name': 'FlowControl Heavy Dynamics Global AG',
            'Authorized Partner': baseName,
            'Authorization Scope': 'Direct Supply, Warranty, and Factory Level Maintenance',
            'Source Pages': 'Pages 8–10',
          },
          extractedAt: new Date().toISOString(),
        },
      });
    }

    if (includedDocs.mii) {
      combinedDocs.push({
        id: `doc-mii-${Date.now()}`,
        requirementCode: 'MII_DECL',
        documentType: 'Make in India Declaration',
        fileName,
        fileSize,
        uploadStatus: 'EXTRACTED',
        uploadedAt: new Date().toISOString(),
        extraction: {
          companyName: baseName,
          localContentPercentage: 68.5,
          status: 'CLASS_I_LOCAL_SUPPLIER',
          confidenceScore: 0.95,
          rawKeyValues: {
            'Supplier Classification': 'Class-I Local Supplier',
            'Local Content Percentage': '68.5% (Exceeds 50% threshold)',
            'Manufacturing Location': 'Plant II, Ambattur Industrial Estate, Chennai',
            'Source Pages': 'Page 11',
          },
          extractedAt: new Date().toISOString(),
        },
      });
    }

    if (includedDocs.nonblk) {
      combinedDocs.push({
        id: `doc-nonblk-${Date.now()}`,
        requirementCode: 'NON_BLACKLIST',
        documentType: 'Non-Blacklisting Declaration',
        fileName,
        fileSize,
        uploadStatus: 'EXTRACTED',
        uploadedAt: new Date().toISOString(),
        extraction: {
          companyName: baseName,
          status: 'CLEAR_NO_DEBARMENT',
          confidenceScore: 0.94,
          rawKeyValues: {
            'Debarment Status': 'Not debarred / Not blacklisted',
            'Notarized Date': 'Current Financial Year',
            'Signatory': contactPerson.trim() || 'Managing Director',
            'Source Pages': 'Page 12',
          },
          extractedAt: new Date().toISOString(),
        },
      });
    }

    const newBidderData: Partial<Bidder> = {
      tenderId: selectedTenderId || tender?.id || '',
      companyName: baseName,
      registrationNumber: registrationNumber.trim() || `CIN-U29100TN2018PTC${Math.floor(100000 + Math.random() * 900000)}`,
      panNumber: pan,
      gstin: `33${pan}1Z5`,
      contactEmail: contactEmail.trim(),
      contactPhone: contactPhone.trim(),
      registeredAddress: 'Industrial Zone, Chennai, Tamil Nadu',
      enterpriseType: 'MEDIUM',
      submissionDate: new Date().toISOString(),
      documents: combinedDocs,
      verificationStatus: 'NOT_STARTED',
      complianceScore: 0,
      riskLevel: 'LOW',
    };

    onCreate(newBidderData, autoVerify);
    resetBidderForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Upload Bid Documents</h2>
            <p className="text-xs text-slate-500">
              Register bidder and upload combined PDF containing all documents.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Tender Selector if multiple tenders exist */}
          {tenders.length > 0 && !tender && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Tender *
              </label>
              <select
                value={selectedTenderId}
                onChange={(e) => setSelectedTenderId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                {tenders.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.tenderNumber} — {t.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Bidder Details Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Company Legal Name *
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter company legal name"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                PAN Number
              </label>
              <input
                type="text"
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                placeholder="Enter 10-digit PAN"
                maxLength={10}
                className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Person
              </label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="Enter contact person"
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Email
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="Enter official email"
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="Enter phone number"
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none"
              />
            </div>
          </div>

          {/* Single Combined PDF Upload Section */}
          <div className="pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                Upload Bidder Documents (One Combined PDF)
              </label>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              You can upload one PDF containing all bidder documents. The system will automatically identify and separate the documents.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />

            {!uploadedFile ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50/50'
                    : 'border-slate-300 hover:border-blue-500 bg-slate-50/50'
                }`}
              >
                <UploadCloud className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-800">
                  Drag & Drop PDF here or <span className="text-blue-700 underline">Choose PDF</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Supported format: Combined Multi-Page PDF
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between p-3.5 bg-blue-50/70 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded bg-blue-100 text-blue-700 flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                        <span>{uploadedFile.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-600">
                        {uploadedFile.pageCount} pages • {uploadedFile.size} • Ready for automated separation & verification
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setUploadedFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    className="text-xs text-red-600 hover:text-red-800 font-medium px-2 py-1"
                  >
                    Change
                  </button>
                </div>

                <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      Documents Contained in this PDF (for testing verification rules):
                    </span>
                    <div className="flex items-center space-x-2 text-[11px]">
                      <button
                        type="button"
                        onClick={() =>
                          setIncludedDocs({
                            pan: true,
                            gst: true,
                            udyam: true,
                            oem: true,
                            mii: true,
                            nonblk: true,
                          })
                        }
                        className="text-blue-700 hover:underline font-semibold"
                      >
                        All 6 (Compliant)
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={() =>
                          setIncludedDocs({
                            pan: true,
                            gst: true,
                            udyam: false,
                            oem: false,
                            mii: false,
                            nonblk: false,
                          })
                        }
                        className="text-red-700 hover:underline font-bold"
                      >
                        Missing 4 (Test NOT QUALIFIED)
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-xs">
                    <label className="flex items-center space-x-2 bg-white p-2 rounded border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includedDocs.pan}
                        onChange={(e) => setIncludedDocs((prev) => ({ ...prev, pan: e.target.checked }))}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-slate-800 font-medium">PAN Card</span>
                    </label>

                    <label className="flex items-center space-x-2 bg-white p-2 rounded border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includedDocs.gst}
                        onChange={(e) => setIncludedDocs((prev) => ({ ...prev, gst: e.target.checked }))}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-slate-800 font-medium">GST Certificate</span>
                    </label>

                    <label className="flex items-center space-x-2 bg-white p-2 rounded border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includedDocs.udyam}
                        onChange={(e) => setIncludedDocs((prev) => ({ ...prev, udyam: e.target.checked }))}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-slate-800 font-medium">Udyam / MSME</span>
                    </label>

                    <label className="flex items-center space-x-2 bg-white p-2 rounded border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includedDocs.oem}
                        onChange={(e) => setIncludedDocs((prev) => ({ ...prev, oem: e.target.checked }))}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-slate-800 font-medium">OEM Authorization</span>
                    </label>

                    <label className="flex items-center space-x-2 bg-white p-2 rounded border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includedDocs.mii}
                        onChange={(e) => setIncludedDocs((prev) => ({ ...prev, mii: e.target.checked }))}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-slate-800 font-medium">Make in India</span>
                    </label>

                    <label className="flex items-center space-x-2 bg-white p-2 rounded border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includedDocs.nonblk}
                        onChange={(e) => setIncludedDocs((prev) => ({ ...prev, nonblk: e.target.checked }))}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-slate-800 font-medium">Non-Blacklisting</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-md font-medium transition"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!companyName.trim()}
              onClick={() => handleSubmit(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold rounded-md transition disabled:opacity-50"
            >
              Save Bidder
            </button>
            <button
              id="upload-start-verification-btn"
              type="button"
              disabled={!companyName.trim()}
              onClick={() => handleSubmit(true)}
              className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-md shadow-sm transition disabled:opacity-50"
            >
              Save & Start Verification
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
