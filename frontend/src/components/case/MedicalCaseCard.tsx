import React from 'react';
import {
  Stethoscope,
  Pill,
  TestTube,
  FileText,
  Plus,
  ChevronRight,
  Calendar,
  Activity,
} from 'lucide-react';
import { MedicalCase } from './types';

interface MedicalCaseCardProps {
  medicalCase: MedicalCase;
  onOpenAddRecord: (medicalCase: MedicalCase) => void;
  onViewDiagnoses: (medicalCase: MedicalCase) => void;
  onViewPrescriptions: (medicalCase: MedicalCase) => void;
  onViewReports: (medicalCase: MedicalCase) => void;
  onViewNotes: (medicalCase: MedicalCase) => void;
  onViewCompleteCase: (medicalCase: MedicalCase) => void;
}

export const MedicalCaseCard: React.FC<MedicalCaseCardProps> = ({
  medicalCase,
  onOpenAddRecord,
  onViewDiagnoses,
  onViewPrescriptions,
  onViewReports,
  onViewNotes,
  onViewCompleteCase,
}) => {
  const getStatusBadge = (status: MedicalCase['status']) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'UNDER_REVIEW':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'CLOSED':
      case 'RESOLVED':
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const latestDiagnosis = medicalCase.diagnoses.length > 0
    ? medicalCase.diagnoses[medicalCase.diagnoses.length - 1].diagnosis
    : 'Pending Evaluation';

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm hover:shadow-md hover:border-teal-300/80 transition-all flex flex-col justify-between">
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">🩺</span>
              <h3 className="font-extrabold text-slate-900 text-lg leading-tight">
                {medicalCase.title}
              </h3>
            </div>
            <span className="text-xs font-mono font-medium text-slate-400 flex items-center gap-1.5 mt-1">
              <Calendar className="w-3.5 h-3.5 text-teal-600" /> Started: {medicalCase.startDate}
            </span>
          </div>

          <span
            className={`text-[11px] font-extrabold px-3 py-1 rounded-full border uppercase tracking-wider ${getStatusBadge(
              medicalCase.status
            )}`}
          >
            ● {medicalCase.status}
          </span>
        </div>

        {/* Symptoms Section */}
        <div className="mb-5 space-y-1.5">
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest block">
            Symptoms
          </span>
          <p className="text-xs text-slate-700 font-medium leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
            {medicalCase.symptoms.join(', ')}
          </p>
        </div>

        {/* Breakdown Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {/* Diagnosis Row */}
          <div className="p-3.5 rounded-2xl bg-blue-50/40 border border-blue-100 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-extrabold text-blue-700 uppercase tracking-wider block">
                Diagnosis
              </span>
              <span className="text-xs font-extrabold text-blue-950 truncate block max-w-[140px]">
                {latestDiagnosis}
              </span>
            </div>
            <button
              onClick={() => onViewDiagnoses(medicalCase)}
              className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-0.5 hover:underline shrink-0"
            >
              View →
            </button>
          </div>

          {/* Prescriptions Row */}
          <div className="p-3.5 rounded-2xl bg-teal-50/40 border border-teal-100 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-extrabold text-teal-700 uppercase tracking-wider block">
                Prescription
              </span>
              <span className="text-xs font-extrabold text-teal-950">
                {medicalCase.prescriptions.length} {medicalCase.prescriptions.length === 1 ? 'Prescription' : 'Prescriptions'}
              </span>
            </div>
            <button
              onClick={() => onViewPrescriptions(medicalCase)}
              className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-0.5 hover:underline shrink-0"
            >
              View →
            </button>
          </div>

          {/* Reports Row */}
          <div className="p-3.5 rounded-2xl bg-purple-50/40 border border-purple-100 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-extrabold text-purple-700 uppercase tracking-wider block">
                Medical Reports
              </span>
              <span className="text-xs font-extrabold text-purple-950">
                {medicalCase.reports.length} {medicalCase.reports.length === 1 ? 'Report' : 'Reports'}
              </span>
            </div>
            <button
              onClick={() => onViewReports(medicalCase)}
              className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-0.5 hover:underline shrink-0"
            >
              View →
            </button>
          </div>

          {/* Notes Row */}
          <div className="p-3.5 rounded-2xl bg-amber-50/40 border border-amber-100 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wider block">
                Doctor Notes
              </span>
              <span className="text-xs font-extrabold text-amber-950">
                {medicalCase.doctorNotes.length} {medicalCase.doctorNotes.length === 1 ? 'Note' : 'Notes'}
              </span>
            </div>
            <button
              onClick={() => onViewNotes(medicalCase)}
              className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-0.5 hover:underline shrink-0"
            >
              View →
            </button>
          </div>
        </div>
      </div>

      {/* Footer Action Buttons */}
      <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
        <button
          onClick={() => onOpenAddRecord(medicalCase)}
          className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 hover:border-teal-400 bg-slate-50 hover:bg-teal-50/50 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 text-teal-600" />
          <span>Add Record</span>
        </button>

        <button
          onClick={() => onViewCompleteCase(medicalCase)}
          className="flex-1 gradient-button-teal py-2.5 px-4 rounded-xl text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1 shadow-sm"
        >
          <span>View Complete Case</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
