import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from '../components/Navbar';
import { api } from '../services/api';
import { SpotlightCard } from '../components/SpotlightCard';
import { StatusPill } from '../components/StatusPill';
import { InfoBanner } from '../components/InfoBanner';
import { AnimatedTabs, TabItem } from '../components/AnimatedTabs';
import {
  Mic,
  Square,
  Upload,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  Play,
  File as FileIcon,
  ShieldCheck,
  Activity,
  Sparkles,
  User,
  Calendar,
  X,
  Stethoscope,
  ChevronRight,
  FolderOpen,
} from 'lucide-react';

export const PatientPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('history');
  const [profile, setProfile] = useState<any>(null);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload & Form State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docTitle, setDocTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<any | null>(null);

  // Web Audio Recorder State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [liveTranscript, setLiveTranscript] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);

  // New Consultation Modal
  const [showBookModal, setShowBookModal] = useState(false);
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  // Polling AI Job Status if an active job is tracking
  useEffect(() => {
    if (!activeJobId) return;

    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/jobs/${activeJobId}/status`);
        if (res.data.success) {
          setJobStatus(res.data.data);
          if (res.data.data.status === 'completed' || res.data.data.status === 'failed') {
            clearInterval(interval);
            fetchData();
          }
        }
      } catch (err) {
        console.error('Error polling job status:', err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [activeJobId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [meRes, consultationsRes, doctorsRes] = await Promise.all([
        api.get('/auth/me'),
        api.get('/consultations'),
        api.get('/doctors'),
      ]);

      if (meRes.data.success) {
        setProfile(meRes.data.data);
      }
      if (consultationsRes.data.success) {
        setConsultations(consultationsRes.data.data);
      }
      if (doctorsRes.data.success) {
        setDoctors(doctorsRes.data.data);
        if (doctorsRes.data.data.length > 0) {
          setSelectedDoctor(doctorsRes.data.data[0]._id);
        }
      }
    } catch (err) {
      console.error('Error fetching patient portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Web Audio Recording Controls
  const startRecording = async () => {
    try {
      setUploadError(null);
      setUploadSuccess(null);
      setAudioBlob(null);
      setLiveTranscript('');
      audioChunksRef.current = [];

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-US';

          recognition.onresult = (event: any) => {
            let current = '';
            for (let i = 0; i < event.results.length; i++) {
              current += event.results[i][0].transcript;
            }
            setLiveTranscript(current);
          };
          recognition.start();
          recognitionRef.current = recognition;
        } catch (e) {
          console.warn('SpeechRecognition initialization warning:', e);
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mimeType = audioChunksRef.current[0]?.type || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      setUploadError('Microphone access denied or audio recording not supported.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
  };

  const handleUploadVoiceRecording = async () => {
    if (!audioBlob) return;
    try {
      setUploading(true);
      setUploadError(null);
      setUploadSuccess(null);

      const voiceFile = new window.File([audioBlob], 'consultation_voice.webm', { type: audioBlob.type || 'audio/webm' });
      const formData = new FormData();
      formData.append('file', voiceFile);
      if (liveTranscript.trim()) {
        formData.append('transcript', liveTranscript.trim());
      }
      if (profile?.profile?._id) {
        formData.append('patientId', profile.profile._id);
      }

      const res = await api.post('/files/upload/voice', formData);

      if (res.data.success) {
        setUploadSuccess('Voice recording uploaded securely & clinical AI summary generated successfully!');
        setActiveJobId(res.data.data.aiJobId);
        setActiveTab('status');
        fetchData();
        setTimeout(() => {
          fetchData();
        }, 1500);
      }
    } catch (err: any) {
      const serverErr = err.response?.data?.error;
      setUploadError(serverErr?.message || 'Voice recording upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleDocumentUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      setUploading(true);
      setUploadError(null);
      setUploadSuccess(null);

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', docTitle || selectedFile.name);
      if (profile?.profile?._id) {
        formData.append('patientId', profile.profile._id);
      }

      const res = await api.post('/files/upload/document', formData);

      if (res.data.success) {
        setUploadSuccess('Document uploaded and stored securely. Tesseract OCR processing enqueued.');
        setActiveJobId(res.data.data.aiJobId);
        setSelectedFile(null);
        setDocTitle('');
        setActiveTab('status');
        fetchData();
      }
    } catch (err: any) {
      const serverErr = err.response?.data?.error;
      setUploadError(serverErr?.message || 'Document upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleBookConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chiefComplaint || !selectedDoctor) return;

    try {
      setBooking(true);
      const res = await api.post('/consultations', {
        doctorId: selectedDoctor,
        chiefComplaint,
        symptoms: chiefComplaint.split(',').map((s) => s.trim()),
      });

      if (res.data.success) {
        setShowBookModal(false);
        setChiefComplaint('');
        fetchData();
      }
    } catch (err: any) {
      console.error('Error booking consultation:', err);
    } finally {
      setBooking(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const portalTabs: TabItem[] = [
    { id: 'history', label: 'Medical History & Files', icon: <FileText className="w-3.5 h-3.5 text-teal-600" /> },
    { id: 'voice', label: 'Voice Consultation', icon: <Mic className="w-3.5 h-3.5 text-teal-600" /> },
    { id: 'prescription', label: 'Prescription Upload', icon: <Upload className="w-3.5 h-3.5 text-teal-600" /> },
    { id: 'report', label: 'Medical Report Upload', icon: <FileIcon className="w-3.5 h-3.5 text-teal-600" /> },
    { id: 'status', label: 'Job Processing Status', icon: <Clock className="w-3.5 h-3.5 text-teal-600" /> },
  ];

  const userName = profile?.user?.fullName || 'Patient';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header Banner */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-teal-700 font-bold text-xs uppercase tracking-widest">
              <User className="w-4 h-4 text-teal-600" />
              <span>Patient Case Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">
              Welcome, {userName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              Upload medical documents, record voice notes, and track real-time clinical case processing.
            </p>
          </div>

          <button
            onClick={() => setShowBookModal(true)}
            className="gradient-button-teal px-5 py-3 rounded-2xl font-bold text-white shadow-md flex items-center gap-2 text-xs uppercase tracking-wider w-fit"
          >
            <Plus className="w-4 h-4" />
            <span>Book New Consultation</span>
          </button>
        </div>

        {/* React Bits Tab Switcher */}
        <AnimatedTabs
          tabs={portalTabs}
          activeTab={activeTab}
          onChange={setActiveTab}
          className="mb-6"
        />

        {/* Tab 1: Medical History & Consultations */}
        {activeTab === 'history' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
              <FolderOpen className="w-5 h-5 text-teal-600" />
              <span>Consultation History & Lifecycle Status</span>
            </h3>

            {loading ? (
              <div className="text-center py-12 text-slate-400 text-xs font-medium">Loading consultations...</div>
            ) : consultations.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs font-medium">
                No consultations recorded yet. Click "Book New Consultation" to start.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {consultations.map((c) => (
                  <SpotlightCard key={c._id} className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          Consultation Case
                        </span>
                        <h4 className="font-bold text-slate-900 text-base">{c.chiefComplaint}</h4>
                      </div>
                      <StatusPill status={c.status || 'PENDING_REVIEW'} />
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 font-medium mb-4">
                      <p className="flex items-center gap-1.5">
                        <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                        <span>Doctor: {c.doctorId?.userId?.fullName || 'Assigned Physician'}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Date: {new Date(c.createdAt).toLocaleDateString()}</span>
                      </p>
                    </div>

                    {c.verifiedRecordId && (
                      <div className="p-3 bg-teal-50 border border-teal-200/80 rounded-xl text-xs text-teal-900 font-medium">
                        <div className="flex items-center gap-1.5 font-bold text-teal-800 mb-1">
                          <CheckCircle2 className="w-4 h-4 text-teal-600" />
                          <span>Doctor Verified Diagnosis</span>
                        </div>
                        <p className="text-slate-700">{c.verifiedRecordId.finalDiagnosis?.join(', ')}</p>
                      </div>
                    )}
                  </SpotlightCard>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Voice Consultation (Whisper ASR) */}
        {activeTab === 'voice' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm max-w-2xl mx-auto">
            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Mic className="w-5 h-5 text-teal-600" />
              <span>Voice Consultation (Hugging Face Whisper ASR)</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mb-6">
              Record your symptoms orally. Whisper ASR will transcribe audio and extract clinical findings automatically.
            </p>

            {uploadError && (
              <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200/80 rounded-2xl text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {uploadSuccess && (
              <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{uploadSuccess}</span>
              </div>
            )}

            <div className="p-8 bg-slate-50 rounded-2xl border border-slate-200/80 text-center mb-6">
              <div className="mb-4 inline-flex p-4 bg-white rounded-full border border-slate-200 shadow-sm">
                <Mic className={`w-8 h-8 ${isRecording ? 'text-rose-600 animate-pulse' : 'text-teal-600'}`} />
              </div>

              <div className="text-2xl font-mono font-bold text-slate-900 mb-4">
                {formatTime(recordingTime)}
              </div>

              <div className="flex items-center justify-center gap-3">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="gradient-button-teal px-6 py-3 rounded-xl font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm"
                  >
                    <Play className="w-4 h-4" />
                    <span>Start Recording</span>
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="bg-rose-600 hover:bg-rose-700 px-6 py-3 rounded-xl font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm"
                  >
                    <Square className="w-4 h-4" />
                    <span>Stop Recording</span>
                  </button>
                )}
              </div>
            </div>

            {liveTranscript && (
              <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                <span className="font-bold text-slate-700 block mb-1">Live Transcript Preview:</span>
                <p className="text-slate-800 font-mono italic">{liveTranscript}</p>
              </div>
            )}

            {audioBlob && !isRecording && (
              <button
                onClick={handleUploadVoiceRecording}
                disabled={uploading}
                className="w-full gradient-button-teal py-3.5 px-4 rounded-xl font-bold text-white text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Upload Voice Note for AI Extraction</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Tab 3 & 4: Document Uploads (Prescription / Medical Report) */}
        {(activeTab === 'prescription' || activeTab === 'report') && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm max-w-xl mx-auto">
            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Upload className="w-5 h-5 text-teal-600" />
              <span>{activeTab === 'prescription' ? 'Prescription Upload' : 'Medical Report Upload'}</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mb-6">
              Upload images or PDF documents. Tesseract OCR will extract text automatically into GridFS.
            </p>

            {uploadError && (
              <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200/80 rounded-2xl text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {uploadSuccess && (
              <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{uploadSuccess}</span>
              </div>
            )}

            <form onSubmit={handleDocumentUpload} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Document Title / Description
                </label>
                <input
                  type="text"
                  required
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder={activeTab === 'prescription' ? 'Dr. Smith Prescription - Feb 2026' : 'Blood Test Lab Report'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 font-medium focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Image or PDF Document
                </label>
                <input
                  type="file"
                  required
                  accept="image/*,application/pdf"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 text-xs focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={uploading || !selectedFile}
                className="w-full gradient-button-teal py-3.5 px-4 rounded-xl font-bold text-white text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
              >
                {uploading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Upload & Process with Tesseract OCR</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Tab 5: Job Processing Status */}
        {activeTab === 'status' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm max-w-xl mx-auto">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Clock className="w-5 h-5 text-teal-600" />
              <span>BullMQ Redis AI Job Queue Tracker</span>
            </h3>

            {jobStatus ? (
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Job ID:</span>
                  <span className="font-mono text-teal-700 font-bold">{jobStatus.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Queue State:</span>
                  <StatusPill status={jobStatus.status || 'processing'} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Progress:</span>
                  <span className="font-bold text-slate-900">{jobStatus.progress || 0}%</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs font-medium">
                No active background processing job currently tracked.
              </div>
            )}
          </div>
        )}
      </main>

      {/* Book New Consultation Modal */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setShowBookModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-teal-600" />
              <span>Book New Clinical Consultation</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mb-6">
              Select a physician and enter your chief complaint to initiate a case file.
            </p>

            <form onSubmit={handleBookConsultation} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Doctor
                </label>
                <select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 font-medium focus:outline-none focus:border-teal-500"
                >
                  {doctors.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.userId?.fullName || 'Doctor'} - {d.specialization}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Chief Complaint / Symptoms
                </label>
                <textarea
                  rows={3}
                  required
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  placeholder="e.g. Persistent fever for 3 days, cough, and fatigue."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-medium focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBookModal(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={booking}
                  className="flex-1 gradient-button-teal py-3 px-4 rounded-xl font-bold text-white uppercase tracking-wider shadow-sm flex items-center justify-center gap-2"
                >
                  {booking ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    <span>Confirm Booking</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
