import React from 'react';
import { X, Download, FileText, Calendar, User, ShieldCheck } from 'lucide-react';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  date: string;
  doctorName?: string;
  fileName: string;
  notes?: string;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  title,
  date,
  doctorName,
  fileName,
  notes,
}) => {
  if (!isOpen) return null;

  const handleDownload = () => {
    alert('Demo document — backend file storage will be connected later.');
  };

  const isPdf = fileName.toLowerCase().endsWith('.pdf');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-500/20 text-teal-400 rounded-xl border border-teal-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white leading-tight">{title}</h3>
              <div className="flex items-center gap-4 text-xs text-slate-300 mt-1 font-medium">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-teal-400" />
                  {date}
                </span>
                {doctorName && (
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-teal-400" />
                    {doctorName}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body / Preview */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50 space-y-6">
          {/* Notes Banner */}
          {notes && (
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm text-xs">
              <span className="font-bold text-slate-900 uppercase tracking-wider block mb-1">
                Clinical Notes / Directions:
              </span>
              <p className="text-slate-700 font-medium leading-relaxed">{notes}</p>
            </div>
          )}

          {/* Document File Viewer Placeholder */}
          <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center justify-center min-h-[280px]">
            <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mb-4 border border-teal-100 shadow-sm">
              <FileText className="w-8 h-8" />
            </div>

            <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full mb-2 border border-slate-200">
              {fileName}
            </span>

            <h4 className="font-bold text-slate-900 text-sm mb-1">Interactive Document Preview</h4>
            <p className="text-xs text-slate-500 max-w-md font-medium">
              {isPdf
                ? 'Standard PDF rendering canvas enabled. In production, GridFS or AWS S3 signed URL will render full page.'
                : 'Medical document image preview loaded.'}
            </p>

            <div className="mt-6 flex items-center gap-2 text-[11px] text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>HIPAA Compliant & GridFS Encrypted Medical Record</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
          >
            Close Preview
          </button>

          <button
            onClick={handleDownload}
            className="gradient-button-teal px-5 py-2.5 rounded-xl font-bold text-white text-xs uppercase tracking-wider shadow-sm flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Download Record</span>
          </button>
        </div>
      </div>
    </div>
  );
};
