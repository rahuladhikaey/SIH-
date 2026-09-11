export interface PrescriptionItem {
  id: string;
  doctorName: string;
  date: string;
  fileName: string;
  fileUrl?: string;
  notes?: string;
}

export interface DiagnosisItem {
  id: string;
  diagnosis: string;
  date: string;
  doctorName: string;
  notes?: string;
}

export interface ReportItem {
  id: string;
  reportType: 'Blood Test' | 'CBC' | 'X-Ray' | 'ECG' | 'MRI' | 'CT Scan' | 'Lab Report' | 'Other';
  date: string;
  fileName: string;
  fileUrl?: string;
  notes?: string;
}

export interface DoctorNoteItem {
  id: string;
  doctorName: string;
  date: string;
  note: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'voice' | 'doctor' | 'diagnosis' | 'prescription' | 'report' | 'note';
}

export interface MedicalCase {
  id: string;
  title: string;
  status: 'ACTIVE' | 'UNDER_REVIEW' | 'CLOSED' | 'RESOLVED';
  startDate: string;
  symptoms: string[];
  diagnoses: DiagnosisItem[];
  prescriptions: PrescriptionItem[];
  reports: ReportItem[];
  doctorNotes: DoctorNoteItem[];
  timeline: TimelineEvent[];
  voiceConsultationTranscript?: string;
  clinicalSummary?: string;
  followUpDate?: string;
}
