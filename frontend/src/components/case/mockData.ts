import { MedicalCase } from './types';

export const INITIAL_MEDICAL_CASES: MedicalCase[] = [
  {
    id: 'case-001',
    title: 'Fever, Cough & Weakness',
    status: 'ACTIVE',
    startDate: '11 Sep 2026',
    symptoms: [
      'Fever (101°F)',
      'headache',
      'body weakness',
      'dry cough',
      'sore throat',
    ],
    diagnoses: [
      {
        id: 'diag-101',
        diagnosis: 'Acute Viral Bronchitis',
        date: '11 Sep 2026',
        doctorName: 'Dr. Ananya Sharma',
        notes: 'Patient presented with 3-day history of fever and dry cough. Lungs clear on auscultation.',
      },
    ],
    prescriptions: [
      {
        id: 'rx-101',
        doctorName: 'Dr. Ananya Sharma',
        date: '11 Sep 2026',
        fileName: 'Prescription_11Sep2026.pdf',
        notes: 'Tab Paracetamol 650mg TDS x 5 days, Syrup Benadryl 10ml BD x 5 days, Steam inhalation.',
      },
      {
        id: 'rx-102',
        doctorName: 'Dr. Rajesh Verma',
        date: '12 Sep 2026',
        fileName: 'Followup_Prescription_12Sep.pdf',
        notes: 'Added Tab Azithromycin 500mg OD x 3 days for secondary infection prevention.',
      },
    ],
    reports: [
      {
        id: 'rep-101',
        reportType: 'CBC',
        date: '11 Sep 2026',
        fileName: 'CBC_Report_11Sep2026.pdf',
        notes: 'WBC 11.2 (Slightly elevated). Hemoglobin 13.8 g/dL. Platelets normal.',
      },
    ],
    doctorNotes: [
      {
        id: 'note-101',
        doctorName: 'Dr. Ananya Sharma',
        date: '11 Sep 2026',
        note: 'Advised 5 days strict bed rest, warm fluids, and return immediately if fever exceeds 102°F or breathlessness occurs.',
      },
      {
        id: 'note-102',
        doctorName: 'Dr. Rajesh Verma',
        date: '12 Sep 2026',
        note: 'Patient reported slight improvement in throat pain. Continue medication schedule.',
      },
    ],
    voiceConsultationTranscript:
      'Patient statement: "Hi, I am experiencing high fever for the last 3 days along with severe headache, body weakness, and a dry cough that gets worse at night. I also have a sore throat when swallowing."',
    clinicalSummary:
      '20-year-old female presenting with acute upper respiratory illness symptoms. Vitals stable. Diagnosed with Acute Viral Bronchitis. Prescribed antipyretics and supportive therapy.',
    followUpDate: '16 Sep 2026',
    timeline: [
      {
        id: 'tl-1',
        date: '11 Sep 2026',
        title: 'Voice Consultation',
        description: 'Patient reported fever, headache, weakness and dry cough via voice note.',
        type: 'voice',
      },
      {
        id: 'tl-2',
        date: '11 Sep 2026',
        title: 'Doctor Consultation',
        description: 'Assigned to Dr. Ananya Sharma for clinical evaluation.',
        type: 'doctor',
      },
      {
        id: 'tl-3',
        date: '11 Sep 2026',
        title: 'Diagnosis Added',
        description: 'Acute Viral Bronchitis diagnosed by Dr. Ananya Sharma.',
        type: 'diagnosis',
      },
      {
        id: 'tl-4',
        date: '11 Sep 2026',
        title: 'Prescription Added',
        description: 'Prescription_11Sep2026.pdf issued by Dr. Ananya Sharma.',
        type: 'prescription',
      },
      {
        id: 'tl-5',
        date: '11 Sep 2026',
        title: 'CBC Blood Report Added',
        description: 'CBC Report uploaded (WBC 11.2 slightly elevated).',
        type: 'report',
      },
    ],
  },
  {
    id: 'case-002',
    title: 'Hypertension & Routine Follow-up',
    status: 'UNDER_REVIEW',
    startDate: '02 Sep 2026',
    symptoms: ['Occasional dizziness', 'mild morning headache', 'fatigue'],
    diagnoses: [
      {
        id: 'diag-201',
        diagnosis: 'Essential Hypertension (Stage 1)',
        date: '02 Sep 2026',
        doctorName: 'Dr. Rajesh Verma',
        notes: 'Resting BP recorded 144/92 mmHg. Heart rate 78 bpm.',
      },
    ],
    prescriptions: [
      {
        id: 'rx-201',
        doctorName: 'Dr. Rajesh Verma',
        date: '02 Sep 2026',
        fileName: 'BP_Prescription_02Sep.pdf',
        notes: 'Tab Amlodipine 5mg OD morning after breakfast.',
      },
    ],
    reports: [
      {
        id: 'rep-201',
        reportType: 'ECG',
        date: '02 Sep 2026',
        fileName: 'ECG_Baseline_02Sep2026.pdf',
        notes: 'Normal sinus rhythm. No ischemic changes.',
      },
    ],
    doctorNotes: [
      {
        id: 'note-201',
        doctorName: 'Dr. Rajesh Verma',
        date: '02 Sep 2026',
        note: 'Low sodium diet (< 2g/day) recommended. Daily 30-minute brisk walk. Monitor morning BP.',
      },
    ],
    voiceConsultationTranscript:
      'Patient statement: "I have been having mild morning headaches for the past 2 weeks and occasional lightheadedness when standing up quickly."',
    clinicalSummary:
      'Stage 1 Essential Hypertension diagnosed during routine screening. Started on low-dose antihypertensive therapy and lifestyle modifications.',
    followUpDate: '25 Sep 2026',
    timeline: [
      {
        id: 'tl-201',
        date: '02 Sep 2026',
        title: 'Doctor Consultation',
        description: 'Evaluated by Dr. Rajesh Verma.',
        type: 'doctor',
      },
      {
        id: 'tl-202',
        date: '02 Sep 2026',
        title: 'Diagnosis Added',
        description: 'Essential Hypertension Stage 1.',
        type: 'diagnosis',
      },
      {
        id: 'tl-203',
        date: '02 Sep 2026',
        title: 'Prescription Added',
        description: 'BP_Prescription_02Sep.pdf (Amlodipine 5mg).',
        type: 'prescription',
      },
      {
        id: 'tl-204',
        date: '02 Sep 2026',
        title: 'ECG Report Uploaded',
        description: 'Normal baseline ECG.',
        type: 'report',
      },
    ],
  },
];
