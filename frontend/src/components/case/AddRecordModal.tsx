import React from 'react';
import { X, Pill, Stethoscope, TestTube, FileText, Plus } from 'lucide-react';
import { MedicalCase } from './types';

interface AddRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicalCase: MedicalCase | null;
  onSelectAction: (actionType: 'prescription' | 'diagnosis' | 'report' | 'note') => void;
}

export const AddRecordModal: React.FC<AddRecordModalProps> = ({
  isOpen,
  onClose,
  medicalCase,
  onSelectAction,
}) => {
  if (!isOpen || !medicalCase) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden relative">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <span className="text-[11px] font-extrabold text-teal-700 uppercase tracking-widest block">
              Medical Record Attachment
            </span>
            <h3 className="font-extrabold text-slate-900 text-lg mt-0.5">Add Record</h3>
            <p className="text-xs text-slate-500 font-medium">
              Case: <strong className="text-slate-800">{medicalCase.title}</strong>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options List */}
        <div className="p-6 space-y-3">
          <button
            onClick={() => onSelectAction('prescription')}
            className="w-full p-4 rounded-2xl border border-slate-200/80 hover:border-teal-500 hover:bg-teal-50/50 transition-all text-left flex items-center gap-4 group"
          >
            <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors shrink-0 shadow-sm">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm group-hover:text-teal-900">
                💊 Add Prescription
              </h4>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Attach doctor prescription PDF/Image & medication notes
              </p>
            </div>
          </button>

          <button
            onClick={() => onSelectAction('diagnosis')}
            className="w-full p-4 rounded-2xl border border-slate-200/80 hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left flex items-center gap-4 group"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0 shadow-sm">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-900">
                🩺 Add Diagnosis
              </h4>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Record physician diagnosis & diagnostic clinical notes
              </p>
            </div>
          </button>

          <button
            onClick={() => onSelectAction('report')}
            className="w-full p-4 rounded-2xl border border-slate-200/80 hover:border-purple-500 hover:bg-purple-50/50 transition-all text-left flex items-center gap-4 group"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors shrink-0 shadow-sm">
              <TestTube className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm group-hover:text-purple-900">
                🧪 Add Medical Report
              </h4>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Upload CBC, Blood Test, X-Ray, ECG, MRI or CT Scan
              </p>
            </div>
          </button>

          <button
            onClick={() => onSelectAction('note')}
            className="w-full p-4 rounded-2xl border border-slate-200/80 hover:border-amber-500 hover:bg-amber-50/50 transition-all text-left flex items-center gap-4 group"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors shrink-0 shadow-sm">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm group-hover:text-amber-900">
                📝 Add Doctor Note
              </h4>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Add clinical advice, rest instructions or doctor notes
              </p>
            </div>
          </button>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-400 font-medium">
          Attached record will visually link to this medical case
        </div>
      </div>
    </div>
  );
};
