import React from 'react';
import {
  X,
  Stethoscope,
  Pill,
  TestTube,
  FileText,
  Mic,
  Calendar,
  Clock,
  Download,
  AlertCircle,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { MedicalCase } from './types';
import { MedicalTimeline } from './MedicalTimeline';

interface CaseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicalCase: MedicalCase | null;
  onViewDocument: (title: string, date: string, doctorName: string, fileName: string, notes?: string) => void;
}

export const CaseDetailsModal: React.FC<CaseDetailsModalProps> = ({
  isOpen,
  onClose,
  medicalCase,
  onViewDocument,
}) => {
  if (!isOpen || !medicalCase) return null;

  const handleDownload = (fileName: string) => {
    alert(`Demo document (${fileName}) — backend file storage will be connected later.`);
  };

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-start justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className={`text-[11px] font-extrabold px-3 py-0.5 rounded-full border ${getStatusBadge(medicalCase.status)}`}>
                ● {medicalCase.status}
              </span>
              <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-teal-400" /> Started: {medicalCase.startDate}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2 mt-1">
              <span>🩺 {medicalCase.title}</span>
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-2xl transition-colors shrink-0"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8 bg-slate-50/50 flex-1">
          {/* Section 1: Clinical Summary */}
          {medicalCase.clinicalSummary && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
              <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-teal-600" />
                <span>1. Clinical Summary</span>
              </h4>
              <p className="text-xs text-slate-800 font-medium leading-relaxed bg-teal-50/50 p-3.5 rounded-xl border border-teal-100">
                {medicalCase.clinicalSummary}
              </p>
            </div>
          )}

          {/* Section 2: Symptoms */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">
              2. Reported Symptoms
            </h4>
            <div className="flex flex-wrap gap-2">
              {medicalCase.symptoms.map((s, i) => (
                <span key={i} className="px-3 py-1 bg-slate-100 text-slate-800 text-xs font-bold rounded-lg border border-slate-200">
                  • {s}
                </span>
              ))}
            </div>
          </div>

          {/* Section 3: Diagnosis History */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4 text-blue-600" />
              <span>3. Diagnosis History ({medicalCase.diagnoses.length})</span>
            </h4>
            {medicalCase.diagnoses.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No recorded diagnoses yet.</p>
            ) : (
              <div className="space-y-2">
                {medicalCase.diagnoses.map((d) => (
                  <div key={d.id} className="p-3.5 bg-blue-50/40 rounded-xl border border-blue-100 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-blue-900">{d.diagnosis}</span>
                      <span className="text-slate-400 font-mono text-[11px]">{d.date}</span>
                    </div>
                    <p className="text-slate-600">Doctor: <strong>{d.doctorName}</strong></p>
                    {d.notes && <p className="text-slate-700 italic">"{d.notes}"</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 4: Prescription History */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Pill className="w-4 h-4 text-teal-600" />
                <span>4. Prescription History ({medicalCase.prescriptions.length})</span>
              </h4>
            </div>

            {/* Patient Safety UX Notice */}
            <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="font-medium">
                Previous prescriptions are provided for medical history. Consult your doctor before restarting any medication.
              </p>
            </div>

            {medicalCase.prescriptions.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No prescriptions attached yet.</p>
            ) : (
              <div className="space-y-2">
                {medicalCase.prescriptions.map((rx) => (
                  <div key={rx.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-extrabold text-slate-900">{rx.doctorName}</span>
                      <span className="text-slate-400 font-mono text-[11px] ml-2">({rx.date})</span>
                      <span className="block text-teal-700 font-semibold font-mono mt-0.5">{rx.fileName}</span>
                      {rx.notes && <p className="text-slate-600 italic mt-0.5">"{rx.notes}"</p>}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onViewDocument(`Prescription by ${rx.doctorName}`, rx.date, rx.doctorName, rx.fileName, rx.notes)}
                        className="px-3 py-1.5 bg-white border border-slate-200 text-slate-800 rounded-lg font-bold text-xs hover:border-teal-400"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDownload(rx.fileName)}
                        className="p-1.5 bg-teal-50 text-teal-700 rounded-lg font-bold"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 5: Medical Reports */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <TestTube className="w-4 h-4 text-purple-600" />
              <span>5. Medical Reports ({medicalCase.reports.length})</span>
            </h4>
            {medicalCase.reports.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No lab or imaging reports attached yet.</p>
            ) : (
              <div className="space-y-2">
                {medicalCase.reports.map((r) => (
                  <div key={r.id} className="p-3.5 bg-purple-50/30 rounded-xl border border-purple-100 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-extrabold text-purple-900">🧪 {r.reportType}</span>
                      <span className="text-slate-400 font-mono text-[11px] ml-2">({r.date})</span>
                      <span className="block font-mono text-slate-600 mt-0.5">{r.fileName}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onViewDocument(r.reportType, r.date, 'Lab Technician', r.fileName, r.notes)}
                        className="px-3 py-1.5 bg-white border border-slate-200 text-slate-800 rounded-lg font-bold text-xs"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDownload(r.fileName)}
                        className="p-1.5 bg-purple-50 text-purple-700 rounded-lg"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 6: Doctor Notes */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-600" />
              <span>6. Doctor Notes ({medicalCase.doctorNotes.length})</span>
            </h4>
            {medicalCase.doctorNotes.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No physician notes added yet.</p>
            ) : (
              <div className="space-y-2">
                {medicalCase.doctorNotes.map((n) => (
                  <div key={n.id} className="p-3.5 bg-amber-50/50 rounded-xl border border-amber-200/60 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">Dr. {n.doctorName}</span>
                      <span className="text-slate-400 font-mono text-[11px]">{n.date}</span>
                    </div>
                    <p className="text-slate-800 leading-relaxed font-medium">{n.note}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 7: Voice Consultation */}
          {medicalCase.voiceConsultationTranscript && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
              <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Mic className="w-4 h-4 text-teal-600" />
                <span>7. Voice Consultation Audio Transcript</span>
              </h4>
              <p className="text-xs text-slate-800 font-mono italic bg-slate-50 p-3.5 rounded-xl border border-slate-200 leading-relaxed">
                "{medicalCase.voiceConsultationTranscript}"
              </p>
            </div>
          )}

          {/* Section 8: Follow-up */}
          {medicalCase.followUpDate && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">
                  8. Follow-up Schedule
                </h4>
                <p className="text-sm font-bold text-slate-900 mt-0.5">Next Appointment: {medicalCase.followUpDate}</p>
              </div>
              <div className="p-2.5 bg-teal-50 text-teal-700 rounded-xl border border-teal-200 text-xs font-bold">
                Scheduled
              </div>
            </div>
          )}

          {/* Section 9: Medical Timeline */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <Clock className="w-4 h-4 text-teal-600" />
              <span>9. Chronological Medical Timeline</span>
            </h4>
            <MedicalTimeline timeline={medicalCase.timeline} />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-white text-right">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
          >
            Close Full Case
          </button>
        </div>
      </div>
    </div>
  );
};
