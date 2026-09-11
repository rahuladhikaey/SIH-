import React, { useState } from 'react';
import { X, TestTube, Upload, CheckCircle2 } from 'lucide-react';
import { ReportItem } from './types';

interface AddReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseTitle: string;
  onSave: (report: ReportItem) => void;
}

export const AddReportModal: React.FC<AddReportModalProps> = ({
  isOpen,
  onClose,
  caseTitle,
  onSave,
}) => {
  const [reportType, setReportType] = useState<ReportItem['reportType']>('CBC');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [fileName, setFileName] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedDate = new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const newReport: ReportItem = {
      id: `rep-${Date.now()}`,
      reportType,
      date: formattedDate,
      fileName: fileName || `${reportType.replace(/ /g, '_')}_Report_${formattedDate.replace(/ /g, '')}.pdf`,
      notes: notes || `${reportType} uploaded for clinical evaluation`,
    };

    onSave(newReport);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden relative">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-purple-50/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-600 text-white rounded-2xl shadow-sm">
              <TestTube className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg leading-tight">ADD MEDICAL REPORT</h3>
              <p className="text-xs text-slate-500 font-medium">Case: {caseTitle}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-sans">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 font-medium focus:outline-none focus:border-purple-500"
            >
              <option value="Blood Test">Blood Test</option>
              <option value="CBC">CBC (Complete Blood Count)</option>
              <option value="X-Ray">X-Ray Imaging</option>
              <option value="ECG">ECG / Electrocardiogram</option>
              <option value="MRI">MRI Scan</option>
              <option value="CT Scan">CT Scan</option>
              <option value="Lab Report">General Lab Report</option>
              <option value="Other">Other Diagnostic Report</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Report Date
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 font-medium focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Upload Report File (PDF / Image)
            </label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 text-xs focus:outline-none"
            />
            {fileName && (
              <div className="mt-2 text-emerald-700 font-semibold flex items-center gap-1.5 text-xs bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Selected: {fileName}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Lab Findings / Summary (Optional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. WBC count 11.2, Hb 13.8 g/dL."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-medium focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-purple-600 hover:bg-purple-700 py-3 px-4 rounded-xl font-bold text-white uppercase tracking-wider shadow-sm flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>Save Report</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
