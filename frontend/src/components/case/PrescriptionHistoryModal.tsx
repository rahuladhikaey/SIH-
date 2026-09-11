import React from 'react';
import { X, Pill, FileText, Download, Plus, AlertCircle } from 'lucide-react';
import { MedicalCase, PrescriptionItem } from './types';

interface PrescriptionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicalCase: MedicalCase | null;
  onViewDocument: (title: string, date: string, doctorName: string, fileName: string, notes?: string) => void;
  onOpenAddPrescription: () => void;
}

export const PrescriptionHistoryModal: React.FC<PrescriptionHistoryModalProps> = ({
  isOpen,
  onClose,
  medicalCase,
  onViewDocument,
  onOpenAddPrescription,
}) => {
  if (!isOpen || !medicalCase) return null;

  const handleDownload = (fileName: string) => {
    alert(`Demo document (${fileName}) — backend file storage will be connected later.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden relative flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-teal-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-600 text-white rounded-2xl shadow-sm">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg leading-tight">PRESCRIPTION HISTORY</h3>
              <p className="text-xs text-slate-500 font-medium">Case: {medicalCase.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenAddPrescription();
              }}
              className="px-3.5 py-2 rounded-xl gradient-button-teal text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Prescription</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-slate-50/50">
          {/* Patient Safety UX Notice */}
          <div className="p-4 bg-amber-50 border border-amber-200/80 rounded-2xl text-xs text-amber-900 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="font-medium leading-relaxed">
              <strong>Patient Safety Notice:</strong> Previous prescriptions are provided for medical history. Consult your doctor before restarting any medication.
            </p>
          </div>

          {medicalCase.prescriptions.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs font-medium">
              No prescriptions attached to this case yet.
            </div>
          ) : (
            medicalCase.prescriptions.map((rx) => (
              <div
                key={rx.id}
                className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-teal-300 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-sm">{rx.doctorName}</span>
                    <span className="text-[11px] text-slate-400 font-mono">({rx.date})</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-teal-800 font-semibold bg-teal-50 px-2.5 py-1 rounded-lg w-fit border border-teal-100">
                    <FileText className="w-3.5 h-3.5 text-teal-600" />
                    <span>{rx.fileName}</span>
                  </div>

                  {rx.notes && (
                    <p className="text-xs text-slate-600 font-medium italic mt-1 bg-slate-50 p-2 rounded-lg">
                      "{rx.notes}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0">
                  <button
                    onClick={() =>
                      onViewDocument(
                        `Prescription by ${rx.doctorName}`,
                        rx.date,
                        rx.doctorName,
                        rx.fileName,
                        rx.notes
                      )
                    }
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-600" />
                    <span>View Prescription</span>
                  </button>

                  <button
                    onClick={() => handleDownload(rx.fileName)}
                    className="p-2 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-xl font-bold text-xs transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-white text-right">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
