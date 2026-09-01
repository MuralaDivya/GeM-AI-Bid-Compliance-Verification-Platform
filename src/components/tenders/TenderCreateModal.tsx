import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, X, Check } from 'lucide-react';
import { Tender, TenderRequirement } from '../../types';

interface TenderCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (tenderData: Partial<Tender>) => void;
}

const COMMON_REQUIREMENT_PRESETS = [
  { code: 'GST', name: 'GST Registration Certificate', category: 'TAXATION' as const, level: 'REQUIRED' as const, desc: 'Valid GSTIN registration in the relevant operating state.' },
  { code: 'PAN', name: 'PAN Card Copy', category: 'STATUTORY' as const, level: 'REQUIRED' as const, desc: 'Permanent Account Number of the business entity.' },
  { code: 'UDYAM', name: 'Udyam / MSME Certificate', category: 'STATUTORY' as const, level: 'REQUIRED' as const, desc: 'Valid Udyam Registration Certificate for MSME preference.' },
  { code: 'ITR', name: 'Income Tax Returns (Last 3 Years)', category: 'TAXATION' as const, level: 'REQUIRED' as const, desc: 'Audited ITR acknowledgements for the preceding 3 financial years.' },
  { code: 'EPFO', name: 'EPFO Registration & Filing', category: 'LABOUR' as const, level: 'REQUIRED' as const, desc: 'Valid Employees Provident Fund registration & filing records.' },
  { code: 'ESIC', name: 'ESIC Registration Certificate', category: 'LABOUR' as const, level: 'REQUIRED' as const, desc: 'Employees State Insurance Corporation registration.' },
  { code: 'OEM_AUTH', name: 'OEM Authorization Certificate', category: 'TECHNICAL' as const, level: 'REQUIRED' as const, desc: 'Direct Manufacturer Authorization Form (MAF) from original equipment manufacturer.' },
  { code: 'MII_DECL', name: 'Make in India Local Content Declaration', category: 'POLICY' as const, level: 'REQUIRED' as const, desc: 'Class-I/Class-II local supplier self-certification (>50% local content).' },
  { code: 'NON_BLACKLIST', name: 'Non-Blacklisting / Debarment Declaration', category: 'INTEGRITY' as const, level: 'REQUIRED' as const, desc: 'Self-declaration confirming no debarment by GeM, CPCL, or CPSEs.' },
  { code: 'FIN_TURNOVER', name: 'CA Turnover Certificate & Balance Sheet', category: 'TAXATION' as const, level: 'REQUIRED' as const, desc: 'Chartered Accountant certified average annual turnover.' },
  { code: 'EXPERIENCE', name: 'Past Experience / Past Work Orders', category: 'TECHNICAL' as const, level: 'OPTIONAL' as const, desc: 'Satisfactory completion certificates for similar supply contracts.' },
];

export const TenderCreateModal: React.FC<TenderCreateModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [tenderNumber, setTenderNumber] = useState('');
  const [title, setTitle] = useState('');
  const [organization, setOrganization] = useState('Chennai Petroleum Corporation Limited (CPCL)');
  const [department, setDepartment] = useState('Procurement Group');
  const [description, setDescription] = useState('');
  const [selectedPresets, setSelectedPresets] = useState<string[]>(['GST', 'PAN', 'UDYAM', 'OEM_AUTH', 'MII_DECL', 'NON_BLACKLIST']);
  const [customRequirements, setCustomRequirements] = useState<{ id: string; name: string; level: 'REQUIRED' | 'OPTIONAL' }[]>([]);
  const [newReqName, setNewReqName] = useState('');
  const [newReqLevel, setNewReqLevel] = useState<'REQUIRED' | 'OPTIONAL'>('REQUIRED');

  const resetForm = useCallback(() => {
    setTenderNumber('');
    setTitle('');
    setOrganization('Chennai Petroleum Corporation Limited (CPCL)');
    setDepartment('Procurement Group');
    setDescription('');
    setSelectedPresets(['GST', 'PAN', 'UDYAM', 'OEM_AUTH', 'MII_DECL', 'NON_BLACKLIST']);
    setCustomRequirements([]);
    setNewReqName('');
    setNewReqLevel('REQUIRED');
  }, []);

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  if (!isOpen) return null;

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleAddCustomRequirement = () => {
    if (!newReqName.trim()) return;
    setCustomRequirements((prev) => [
      ...prev,
      {
        id: `custom-${Date.now()}`,
        name: newReqName.trim(),
        level: newReqLevel,
      },
    ]);
    setNewReqName('');
  };

  const handleTogglePreset = (code: string) => {
    setSelectedPresets((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenderNumber.trim() || !title.trim()) return;

    // Combine preset and custom requirements
    const allRequirements: TenderRequirement[] = [
      ...COMMON_REQUIREMENT_PRESETS.filter((p) => selectedPresets.includes(p.code)).map((p) => ({
        id: `req-${p.code.toLowerCase()}`,
        code: p.code,
        name: p.name,
        category: p.category,
        level: p.level,
        description: p.desc,
        applicablePortals: [p.code.toLowerCase()],
      })),
      ...customRequirements.map((c, idx) => ({
        id: c.id,
        code: `CUSTOM_${idx + 1}`,
        name: c.name,
        category: 'STATUTORY' as const,
        level: c.level,
        description: c.name,
        applicablePortals: [],
      })),
    ];

    onCreate({
      tenderNumber: tenderNumber.trim(),
      title: title.trim(),
      organization: organization.trim(),
      department: department.trim(),
      description: description.trim(),
      category: 'Goods & Services',
      estimatedValueINR: 5000000,
      publishedDate: new Date().toISOString().split('T')[0],
      closingDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      status: 'ACTIVE',
      requirements: allRequirements,
      bidderCount: 0,
    });

    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Create Tender</h2>
            <p className="text-xs text-slate-500">Define tender details and statutory document requirements.</p>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tender ID / Reference Number *
              </label>
              <input
                type="text"
                required
                value={tenderNumber}
                onChange={(e) => setTenderNumber(e.target.value)}
                placeholder="e.g. GEM/2026/B/10984"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department / Organization *
              </label>
              <input
                type="text"
                required
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="e.g. Chennai Petroleum Corporation Limited"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tender Title / Scope of Supply *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Supply and Installation of High-Pressure Industrial Flow Control Valves"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tender Description (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of supply terms, delivery timelines, or technical specifications..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          {/* Requirements Section */}
          <div className="pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                Select Required Statutory Documents ({selectedPresets.length + customRequirements.length})
              </label>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              The bidder will upload one combined PDF. The system will extract and verify the selected requirements against that PDF.
            </p>

            {/* Checklist of Standard Documents */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-200 rounded-md bg-slate-50/50">
              {COMMON_REQUIREMENT_PRESETS.map((preset) => {
                const isChecked = selectedPresets.includes(preset.code);
                return (
                  <label
                    key={preset.code}
                    className={`flex items-center space-x-2.5 p-2 rounded cursor-pointer text-xs transition border ${
                      isChecked
                        ? 'bg-blue-50 border-blue-200 text-blue-900'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleTogglePreset(preset.code)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-medium flex-1 truncate">{preset.name}</span>
                    {isChecked && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </label>
                );
              })}
            </div>

            {/* Custom Requirement Input */}
            <div className="mt-3 flex items-center space-x-2">
              <input
                type="text"
                value={newReqName}
                onChange={(e) => setNewReqName(e.target.value)}
                placeholder="+ Add other requirement (e.g. ISO 9001 Certificate)"
                className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomRequirement();
                  }
                }}
              />
              <select
                value={newReqLevel}
                onChange={(e) => setNewReqLevel(e.target.value as any)}
                className="px-2 py-1.5 text-xs border border-slate-300 rounded-md bg-white text-slate-700 focus:outline-none"
              >
                <option value="REQUIRED">Required</option>
                <option value="OPTIONAL">Optional</option>
              </select>
              <button
                type="button"
                onClick={handleAddCustomRequirement}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-md transition"
              >
                Add
              </button>
            </div>

            {/* Custom Requirements Added */}
            {customRequirements.length > 0 && (
              <div className="mt-2 space-y-1">
                {customRequirements.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs"
                  >
                    <span className="font-medium text-slate-800">{c.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {c.level}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCustomRequirements((prev) => prev.filter((r) => r.id !== c.id))}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-md font-medium transition"
            >
              Cancel
            </button>
            <button
              id="save-tender-submit-btn"
              type="submit"
              className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-md shadow-sm transition"
            >
              Save Tender
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
