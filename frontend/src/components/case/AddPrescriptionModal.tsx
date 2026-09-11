import React, { useState } from 'react';
import { X, Pill, Upload, CheckCircle2, Camera } from 'lucide-react';
import { PrescriptionItem } from './types';

interface AddPrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseTitle: string;
  onSave: (prescription: PrescriptionItem) => void;
}

export const AddPrescriptionModal: React.FC<AddPrescriptionModalProps> = ({
  isOpen,
  onClose,
  caseTitle,
  onSave,
}) => {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [doctorName, setDoctorName] = useState('Dr. Ananya Sharma');
  const [notes, setNotes] = useState('');
  const [fileName, setFileName] = useState('');
  const [simulatedSuccess, setSimulatedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      setSimulatedSuccess(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedDate = new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const newPrescription: PrescriptionItem = {
      id: `rx-${Date.now()}`,
      doctorName: doctorName || 'Attending Physician',
      date: formattedDate,
      fileName: fileName || `Prescription_${formattedDate.replace(/ /g, '')}.pdf`,
      notes: notes || 'Prescription added during consultation',
    };

    onSave(newPrescription);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden relative">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-teal-50/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-600 text-white rounded-2xl shadow-sm">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg leading-tight">ADD PRESCRIPTION</h3>
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
              Prescription Date
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 font-medium focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Doctor Name
            </label>
            <input
              type="text"
              required
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              placeholder="e.g. Dr. Ananya Sharma"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 font-medium focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Upload Prescription Document
            </label>
            <div className="p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-3">
              <input
                type="file"
                id="prescription-file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              <label
                htmlFor="prescription-file"
                className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:border-teal-500 hover:text-teal-700 shadow-sm transition-colors"
              >
                <Camera className="w-4 h-4 text-teal-600" />
                <span>📷 Upload / Scan Prescription</span>
              </label>

              {fileName ? (
                <div className="flex items-center justify-center gap-2 text-emerald-700 font-semibold bg-emerald-50 p-2 rounded-xl border border-emerald-200 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Selected: {fileName}</span>
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 font-medium">PDF, JPG, PNG up to 15MB supported</p>
              )}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Prescription Notes / Dosage Details (Optional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Tab Paracetamol 650mg TDS x 5 days after food."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-medium focus:outline-none focus:border-teal-500"
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
              className="flex-1 gradient-button-teal py-3 px-4 rounded-xl font-bold text-white uppercase tracking-wider shadow-sm flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>Save Prescription</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
