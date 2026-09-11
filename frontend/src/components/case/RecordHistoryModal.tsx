import React from 'react';
import { X, Stethoscope, TestTube, FileText, Download, Plus } from 'lucide-react';
import { MedicalCase } from './types';

interface RecordHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicalCase: MedicalCase | null;
  type: 'diagnoses' | 'reports' | 'notes';
  onViewDocument?: (title: string, date: string, doctorName: string, fileName: string, notes?: string) => void;
  onOpenAddRecord: (type: 'diagnosis' | 'report' | 'note') => void;
}

export const RecordHistoryModal: React.FC<RecordHistoryModalProps> = ({
  isOpen,
  onClose,
  medicalCase,
  type,
  onViewDocument,
  onOpenAddRecord,
}) => {
  if (!isOpen || !medicalCase) return null;

  const getTitle = () => {
    switch (type) {
      case 'diagnoses':
        return { name: 'DIAGNOSIS HISTORY', icon: <Stethoscope className="w-5 h-5" />, bg: 'bg-blue-50/50', btnBg: 'bg-blue-600' };
      case 'reports':
        return { name: 'MEDICAL REPORTS', icon: <TestTube className="w-5 h-5" />, bg: 'bg-purple-50/50', btnBg: 'bg-purple-600' };
      case 'notes':
        return { name: 'DOCTOR NOTES', icon: <FileText className="w-5 h-5" />, bg: 'bg-amber-50/50', btnBg: 'bg-amber-600' };
    }
  };

  const info = getTitle();

  const handleDownload = (fileName: string) => {
    alert(`Demo document (${fileName}) — backend file storage will be connected later.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden relative flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className={`p-6 border-b border-slate-100 flex items-center justify-between ${info.bg}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 ${info.btnBg} text-white rounded-2xl shadow-sm`}>
              {info.icon}
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg leading-tight">{info.name}</h3>
              <p className="text-xs text-slate-500 font-medium">Case: {medicalCase.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenAddRecord(type === 'diagnoses' ? 'diagnosis' : type === 'reports' ? 'report' : 'note');
              }}
              className={`px-3.5 py-2 rounded-xl ${info.btnBg} text-white font-bold text-xs flex items-center gap-1.5 shadow-sm hover:opacity-90`}
            >
              <Plus className="w-4 h-4" />
              <span>+ Add {type === 'diagnoses' ? 'Diagnosis' : type === 'reports' ? 'Report' : 'Note'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-slate-50/50">
          {type === 'diagnoses' && (
            medicalCase.diagnoses.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs font-medium">
                No diagnoses recorded for this case yet.
              </div>
            ) : (
              medicalCase.diagnoses.map((d) => (
                <div key={d.id} className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-blue-900 text-base">🩺 {d.diagnosis}</span>
                    <span className="text-xs font-mono text-slate-400">{d.date}</span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">Physician: <strong>{d.doctorName}</strong></p>
                  {d.notes && <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 italic">"{d.notes}"</p>}
                </div>
              ))
            )
          )}

          {type === 'reports' && (
            medicalCase.reports.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs font-medium">
                No medical reports attached to this case yet.
              </div>
            ) : (
              medicalCase.reports.map((r) => (
                <div key={r.id} className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-purple-900 text-sm">🧪 {r.reportType}</span>
                      <span className="text-xs text-slate-400 font-mono">({r.date})</span>
                    </div>
                    <span className="text-xs font-mono text-slate-600 block mt-1">{r.fileName}</span>
                    {r.notes && <p className="text-xs text-slate-600 italic mt-1">{r.notes}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onViewDocument?.(r.reportType, r.date, 'Lab Technician', r.fileName, r.notes)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs"
                    >
                      View Report
                    </button>
                    <button
                      onClick={() => handleDownload(r.fileName)}
                      className="p-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )
          )}

          {type === 'notes' && (
            medicalCase.doctorNotes.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs font-medium">
                No doctor notes added for this case yet.
              </div>
            ) : (
              medicalCase.doctorNotes.map((n) => (
                <div key={n.id} className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">📝 Note by {n.doctorName}</span>
                    <span className="text-xs font-mono text-slate-400">{n.date}</span>
                  </div>
                  <p className="text-xs text-slate-700 bg-amber-50/60 p-3.5 rounded-xl border border-amber-200/60 leading-relaxed">
                    {n.note}
                  </p>
                </div>
              ))
            )
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
