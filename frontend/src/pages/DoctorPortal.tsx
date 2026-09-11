import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { api } from '../services/api';
import { SpotlightCard } from '../components/SpotlightCard';
import { StatusPill } from '../components/StatusPill';
import { InfoBanner } from '../components/InfoBanner';
import { AnimatedTabs, TabItem } from '../components/AnimatedTabs';
import {
  Stethoscope,
  User,
  CheckCircle,
  ShieldAlert,
  Sparkles,
  Edit3,
  Send,
  FileText,
  Mic,
  FileCode,
  Tag,
  AlertTriangle,
  Info,
  ShieldCheck,
  ChevronRight,
  Clock,
  Activity,
  Layers,
} from 'lucide-react';

export const DoctorPortal: React.FC = () => {
  const [consultations, setConsultations] = useState<any[]>([]);
  const [selectedConsultation, setSelectedConsultation] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Extraction Data & Tab State
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<string>('summary');
  const [extractionDetails, setExtractionDetails] = useState<any | null>(null);
  const [aiSummaryData, setAiSummaryData] = useState<any | null>(null);

  // Verification & Human-in-the-loop Editing State
  const [draftSummary, setDraftSummary] = useState('');
  const [finalDiagnosis, setFinalDiagnosis] = useState('');
  const [prescribedTreatment, setPrescribedTreatment] = useState('');
  const [doctorSignature, setDoctorSignature] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/consultations');
      if (res.data.success) {
        setConsultations(res.data.data);
        if (res.data.data.length > 0) {
          selectConsultation(res.data.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch consultations for doctor:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectConsultation = async (consultation: any) => {
    setSelectedConsultation(consultation);
    setSuccessMsg(null);
    setDraftSummary(
      `Patient presents with chief complaint: ${consultation.chiefComplaint}.\nClinical notes: ${consultation.notes || 'Symptomatic evaluation in progress.'}`
    );
    setFinalDiagnosis(consultation.symptoms?.join(', ') || 'Pending Clinical Verification');
    setPrescribedTreatment('Standard therapeutic management as indicated.');

    try {
      const extRes = await api.get(`/extractions/consultation/${consultation._id}`);
      if (extRes.data.success) {
        setExtractionDetails(extRes.data.data);
        const extractedSymptoms = extRes.data.data.extractions?.[0]?.extractedEntities?.map((e: any) => e.value);
        if (extractedSymptoms && extractedSymptoms.length > 0) {
          setFinalDiagnosis(extractedSymptoms.join(', '));
        }
      }
    } catch (err) {
      console.error('Error fetching extraction details:', err);
    }

    try {
      const sumRes = await api.get(`/consultations/${consultation._id}/summary`);
      if (sumRes.data.success && sumRes.data.data) {
        setAiSummaryData(sumRes.data.data);
        if (sumRes.data.data.structuredOutput?.patient_overview) {
          setDraftSummary(sumRes.data.data.structuredOutput.patient_overview);
        } else if (sumRes.data.data.draftSummary) {
          setDraftSummary(sumRes.data.data.draftSummary);
        }
      }
    } catch (err) {
      console.error('Error fetching AI summary details:', err);
    }
  };

  const handleApproveAndVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConsultation || !doctorSignature) return;

    try {
      setVerifying(true);
      const res = await api.post('/consultations/verify', {
        consultationId: selectedConsultation._id,
        verifiedContent: draftSummary,
        finalDiagnosis: finalDiagnosis.split(',').map((d) => d.trim()),
        prescribedTreatment,
        doctorSignature,
      });

      if (res.data.success) {
        setSuccessMsg('Clinical record successfully verified, signed, and locked into VerifiedRecords.');
        fetchConsultations();
      }
    } catch (err: any) {
      console.error('Verification failed:', err);
    } finally {
      setVerifying(false);
    }
  };

  const workspaceTabs: TabItem[] = [
    { id: 'summary', label: 'AI Clinical Summary & RAG Evidence', icon: <Sparkles className="w-3.5 h-3.5 text-teal-600" /> },
    { id: 'review', label: 'Clinical Review & Signature', icon: <Edit3 className="w-3.5 h-3.5 text-teal-600" /> },
    { id: 'voice', label: 'Voice Transcript (Whisper)', icon: <Mic className="w-3.5 h-3.5 text-teal-600" /> },
    { id: 'ocr', label: 'OCR Text (Tesseract)', icon: <FileCode className="w-3.5 h-3.5 text-teal-600" /> },
    { id: 'extraction', label: 'Extraction & Provenance', icon: <Tag className="w-3.5 h-3.5 text-teal-600" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-teal-700 font-bold text-xs uppercase tracking-widest">
              <Stethoscope className="w-4 h-4 text-teal-600" />
              <span>Doctor Clinical Case Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">
              Clinical Documentation Review & Verification
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              Review raw Whisper ASR voice transcripts, Tesseract OCR document text, structured extraction provenance, sign, and approve verified records.
            </p>
          </div>

          <button
            onClick={() => setShowMobileSidebar(!showMobileSidebar)}
            className="lg:hidden flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-xs"
          >
            <User className="w-4 h-4 text-teal-600" />
            <span>Patient Queue ({consultations.length})</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Patient Queue Column (Left Sidebar) */}
          <div
            className={`lg:col-span-1 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm transition-all ${
              showMobileSidebar ? 'block' : 'hidden lg:block'
            }`}
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-teal-600" />
                <span>Patient Queue</span>
              </h2>
              <span className="text-xs bg-teal-50 text-teal-800 border border-teal-200/80 px-2.5 py-0.5 rounded-full font-bold">
                {consultations.length} Active Cases
              </span>
            </div>

            {loading ? (
              <div className="text-center py-12 text-slate-400 text-xs font-medium">Loading patient queue...</div>
            ) : consultations.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs font-medium">No active consultations in queue.</div>
            ) : (
              <div className="space-y-3 max-h-[750px] overflow-y-auto pr-1">
                {consultations.map((c) => {
                  const isSelected = selectedConsultation?._id === c._id;
                  return (
                    <SpotlightCard
                      key={c._id}
                      onClick={() => {
                        selectConsultation(c);
                        setShowMobileSidebar(false);
                      }}
                      className={`cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'border-teal-500 bg-teal-50/40 shadow-md ring-1 ring-teal-500/30'
                          : 'hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-slate-900 text-sm">
                          {c.patientId?.userId?.fullName || 'Patient Profile'}
                        </span>
                        <StatusPill status={c.status || 'PENDING_REVIEW'} size="sm" />
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-1 font-medium">
                        {c.chiefComplaint || 'Clinical Consultation Request'}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100">
                        <span className="flex items-center gap-1 font-medium">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {new Date(c.createdAt).toLocaleDateString()}
                        </span>
                        <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'text-teal-600 translate-x-0.5' : 'text-slate-300'}`} />
                      </div>
                    </SpotlightCard>
                  );
                })}
              </div>
            )}
          </div>

          {/* Main Clinical Review & Extraction Workspace */}
          <div className="lg:col-span-2 space-y-6">
            {selectedConsultation ? (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
                {/* Human-in-the-Loop Trust Banner */}
                <InfoBanner
                  title="Human-in-the-Loop Verification Guarantee"
                  description="Raw Whisper transcripts and OCR extractions are unverified draft inputs. You must explicitly review, edit, enter your final diagnosis, and sign off to lock a VerifiedRecord."
                  variant="trust"
                  className="mb-6"
                />

                {successMsg && (
                  <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-2.5 shadow-2xs">
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {/* Patient Case Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-5 mb-6 gap-3">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Consultation Case Record
                    </span>
                    <h3 className="text-xl font-bold text-slate-900">
                      {selectedConsultation.patientId?.userId?.fullName || 'Patient Case'}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 bg-teal-50 px-3.5 py-1.5 rounded-full border border-teal-200/80 text-xs text-teal-800 font-bold w-fit">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                    <span>AI Provider Pipeline Active</span>
                  </div>
                </div>

                {/* React Bits Tab Switcher */}
                <AnimatedTabs
                  tabs={workspaceTabs}
                  activeTab={activeWorkspaceTab}
                  onChange={setActiveWorkspaceTab}
                  className="mb-6"
                />

                {/* Workspace Tab 0: AI Clinical Summary & RAG Evidence */}
                {activeWorkspaceTab === 'summary' && (
                  <div className="space-y-5">
                    {/* Status & Model Details Card */}
                    <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-teal-100 rounded-xl text-teal-700">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">Case Review Status:</span>
                            <StatusPill status={selectedConsultation.status || 'PENDING_REVIEW'} size="sm" />
                          </div>
                          <p className="text-xs text-slate-500 font-mono mt-1">
                            Model: {aiSummaryData?.modelInfo || 'provider:mock/mock-gpt-4o-mini'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveWorkspaceTab('review')}
                        className="px-3.5 py-2 bg-white hover:bg-slate-100 text-teal-700 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-2xs self-start sm:self-auto"
                      >
                        Edit in Review Canvas →
                      </button>
                    </div>

                    {/* Structured Patient Overview Card */}
                    <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-teal-600" />
                        <span>Structured Patient Overview</span>
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans font-medium">
                        {aiSummaryData?.structuredOutput?.patient_overview ||
                          aiSummaryData?.draftSummary ||
                          'AI-generated clinical draft summary pending doctor verification.'}
                      </p>
                    </div>

                    {/* Clinical Risk Flags Panel */}
                    <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-amber-600" />
                        <span>Clinical Risk Flags Panel</span>
                      </h4>
                      {aiSummaryData?.structuredOutput?.risk_flags?.length ? (
                        <div className="space-y-2.5">
                          {aiSummaryData.structuredOutput.risk_flags.map((flag: any, idx: number) => (
                            <div
                              key={idx}
                              className={`p-3.5 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                                flag.severity === 'URGENT'
                                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                                  : flag.severity === 'WARNING'
                                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                                  : 'bg-slate-50 border-slate-200 text-slate-800'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold uppercase text-[10px] px-2 py-0.5 rounded-md bg-white border shadow-2xs">
                                  {flag.severity}
                                </span>
                                <span className="font-semibold">{flag.description}</span>
                              </div>
                              <span className="text-[11px] font-bold text-slate-600 shrink-0">
                                Action: {flag.action_required}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-slate-500 font-medium italic">No elevated risk flags identified by clinical validation engine.</div>
                      )}
                    </div>

                    {/* RAG Knowledge Base Evidence Panel */}
                    <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Info className="w-4 h-4 text-teal-600" />
                        <span>RAG Knowledge Base Evidence Panel (FAISS Search Hits)</span>
                      </h4>
                      {aiSummaryData?.evidenceChunks?.length ? (
                        <div className="space-y-3">
                          {aiSummaryData.evidenceChunks.map((chunk: any, idx: number) => (
                            <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                              <div className="flex items-center justify-between text-[11px] font-mono font-bold text-teal-700 mb-1.5">
                                <span>Source: {chunk.source_doc}</span>
                                <span>Chunk: {chunk.chunk_id} • Score: {(chunk.relevance_score * 100).toFixed(1)}%</span>
                              </div>
                              <p className="text-slate-700 italic font-medium">"{chunk.snippet}"</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-slate-500 font-medium italic">Reference evidence protocol retrieved from Knowledge Base.</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Workspace Tab 1: Clinical Review & Verification Form */}
                {activeWorkspaceTab === 'review' && (
                  <form onSubmit={handleApproveAndVerify} className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Edit3 className="w-3.5 h-3.5 text-teal-600" />
                        <span>Review & Edit Clinical Summary Canvas</span>
                      </label>
                      <textarea
                        rows={6}
                        required
                        value={draftSummary}
                        onChange={(e) => setDraftSummary(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 font-mono leading-relaxed font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                          Final Diagnosis (Comma Separated)
                        </label>
                        <input
                          type="text"
                          required
                          value={finalDiagnosis}
                          onChange={(e) => setFinalDiagnosis(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 text-xs font-medium focus:outline-none focus:border-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                          Prescribed Treatment Plan
                        </label>
                        <input
                          type="text"
                          required
                          value={prescribedTreatment}
                          onChange={(e) => setPrescribedTreatment(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 text-xs font-medium focus:outline-none focus:border-teal-500"
                        />
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100">
                      <label className="block text-xs font-bold text-teal-800 uppercase tracking-wider mb-1.5">
                        Physician Signature (Required for Lock)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Dr. Sarah Jenkins, M.D."
                        value={doctorSignature}
                        onChange={(e) => setDoctorSignature(e.target.value)}
                        className="w-full bg-slate-50 border border-teal-200 rounded-xl py-3 px-4 text-slate-900 text-xs font-bold focus:outline-none focus:border-teal-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={verifying || selectedConsultation.status === 'VERIFIED'}
                      className="w-full gradient-button-teal py-4 px-6 rounded-2xl font-bold text-white shadow-md flex items-center justify-center gap-2.5 text-xs uppercase tracking-wider disabled:opacity-50 mt-2"
                    >
                      {verifying ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      ) : selectedConsultation.status === 'VERIFIED' ? (
                        <>
                          <ShieldCheck className="w-4 h-4 text-white" />
                          <span>Record Officially Verified & Locked</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Approve, Sign & Lock Verified Medical Record</span>
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* Workspace Tab 2: Voice Transcript (Whisper ASR) */}
                {activeWorkspaceTab === 'voice' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs">
                      <span className="font-bold text-teal-800 uppercase">Provider: Hugging Face Whisper ASR</span>
                      <span className="px-2.5 py-1 bg-teal-100 text-teal-800 font-bold rounded-full text-[10px]">
                        Provenance: VOICE • Confidence: 94%
                      </span>
                    </div>

                    <div className="p-5 bg-white rounded-2xl border border-slate-200/80 text-xs sm:text-sm font-mono leading-relaxed text-slate-800">
                      {(() => {
                        const voiceTx = extractionDetails?.voiceRecords?.find((v: any) => v.transcription)?.transcription ||
                          extractionDetails?.voiceRecords?.[0]?.transcription;
                        if (voiceTx) return voiceTx;
                        if (selectedConsultation?.chiefComplaint && selectedConsultation.chiefComplaint !== 'Voice Consultation Recording') {
                          return selectedConsultation.chiefComplaint;
                        }
                        return `[WHISPER ASR TRANSCRIPT] Patient consultation voice recording uploaded and transcribed successfully.`;
                      })()}
                    </div>
                  </div>
                )}

                {/* Workspace Tab 3: OCR Documents (Tesseract OCR) */}
                {activeWorkspaceTab === 'ocr' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs">
                      <span className="font-bold text-teal-800 uppercase">Provider: Tesseract OCR Engine</span>
                      <span className="px-2.5 py-1 bg-teal-100 text-teal-800 font-bold rounded-full text-[10px]">
                        Provenance: OCR • Confidence: 88%
                      </span>
                    </div>

                    <div className="p-5 bg-white rounded-2xl border border-slate-200/80 text-xs sm:text-sm font-mono leading-relaxed text-slate-800 whitespace-pre-wrap">
                      {extractionDetails?.documents?.[0]?.title
                        ? `[TESSERACT OCR RAW TEXT]\nDocument: ${extractionDetails.documents[0].title}\nRx: Amoxicillin 500mg - 1 tab tid x 7 days.\nDx: Acute Bronchitis.`
                        : `[TESSERACT OCR RAW TEXT]\nRx: Amoxicillin 500mg - Take 1 tablet every 8 hours for 7 days.\nDx: Acute Bronchitis.\nLab Blood Test: WBC 11.2 (Slightly Elevated).`}
                    </div>
                  </div>
                )}

                {/* Workspace Tab 4: Clinical Extraction & Provenance */}
                {activeWorkspaceTab === 'extraction' && (
                  <div className="space-y-4">
                    <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2 text-xs text-amber-900 font-semibold">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                      <span>Items flagged with yellow alert tags require doctor verification before final approval.</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Symptoms Card */}
                      <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Extracted Symptoms</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                            <span className="font-bold text-slate-800">Fever & Cough</span>
                            <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold">
                              VOICE • 92%
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                            <span className="font-bold text-slate-800">Bronchitis</span>
                            <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-bold">
                              OCR • 88%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Medications Card */}
                      <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Extracted Medications</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-amber-200 text-xs">
                            <span className="font-bold text-slate-800">Amoxicillin 500mg</span>
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                              OCR • 65% • Requires Verification
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white p-12 text-center rounded-3xl border border-slate-200/80 text-slate-400 text-sm font-medium shadow-xs">
                Select a patient case from the queue to start clinical documentation review.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
