import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SpotlightCard } from '../components/SpotlightCard';
import { InfoBanner } from '../components/InfoBanner';
import { AnimatedTabs, TabItem } from '../components/AnimatedTabs';
import {
  Activity,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Mic,
  FileCode,
  Tag,
  ShieldAlert,
  Edit3,
  UserCheck,
  CheckCircle2,
  FileText,
  Clock,
  Database,
  Search,
  Lock,
  ChevronRight,
  Stethoscope,
  User,
  Zap,
  Check,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Role Tab in How It Works section
  const [activeRoleTab, setActiveRoleTab] = useState<'patients' | 'doctors'>('patients');

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const roleTabs: TabItem[] = [
    { id: 'patients', label: 'For Patients', icon: <User className="w-4 h-4 text-teal-600" /> },
    { id: 'doctors', label: 'For Doctors & Clinics', icon: <Stethoscope className="w-4 h-4 text-teal-600" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* 1. Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md px-6 py-3.5 flex items-center justify-between border-b border-slate-200/80 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-tr from-teal-600 to-sky-600 rounded-xl shadow-md shadow-teal-500/10">
            <Activity className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
          <Link to="/" className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5">
            Med<span className="gradient-text-teal">Mitra</span>
          </Link>

          <div className="hidden lg:flex items-center ml-4 px-3 py-1 bg-teal-50 border border-teal-200/80 rounded-full text-xs font-semibold text-teal-800 gap-1.5 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>AI Assists • Doctor Decides</span>
          </div>
        </div>

        {/* Marketing Navigation Links */}
        <div className="hidden md:flex items-center space-x-6 text-xs font-bold text-slate-600">
          <button onClick={() => scrollToSection('features')} className="hover:text-teal-700 transition-colors">
            Features
          </button>
          <button onClick={() => scrollToSection('how-it-works')} className="hover:text-teal-700 transition-colors">
            How It Works
          </button>
          <button onClick={() => scrollToSection('problem')} className="hover:text-teal-700 transition-colors">
            Why MedMitra
          </button>
          <button onClick={() => scrollToSection('trust')} className="hover:text-teal-700 transition-colors">
            Trust & Safety
          </button>
        </div>

        {/* Auth CTAs */}
        <div className="flex items-center space-x-3">
          {user ? (
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(user.role === 'doctor' ? '/doctor' : '/patient')}
                className="gradient-button-teal px-4 py-2 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-teal-700 hover:bg-slate-100 transition-all border border-slate-200"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="gradient-button-teal px-4 py-2 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-teal-200/20 via-sky-200/20 to-purple-200/20 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center max-w-4xl mx-auto relative z-10">
          {/* Eyebrow Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-teal-50 border border-teal-200 rounded-full text-teal-800 text-xs font-extrabold uppercase tracking-widest mb-6 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>AI-Assisted Clinical Documentation Platform</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Clinical documentation that <span className="gradient-text-teal">listens, reads, and verifies</span> — so doctors don't have to type.
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium">
            Physicians lose hours daily on manual note-taking, transcription, and paperwork. MedMitra converts voice consultations and uploaded medical reports into structured, AI-drafted clinical records — with every single record reviewed, edited, and signed off by a licensed doctor.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto gradient-button-teal px-7 py-3.5 rounded-2xl font-bold text-white text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4" />
              <span>Get Started as Patient</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto bg-white border border-slate-300 hover:border-teal-500 hover:bg-slate-50 px-7 py-3.5 rounded-2xl font-bold text-slate-800 text-xs uppercase tracking-wider shadow-2xs flex items-center justify-center gap-2 transition-all"
            >
              <Stethoscope className="w-4 h-4 text-teal-600" />
              <span>Login as Doctor</span>
            </Link>
          </div>

          {/* Trust Strip */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs font-bold text-slate-500">
            <span className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              Human-in-the-Loop Verified
            </span>
            <span className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-2xs">
              <Mic className="w-4 h-4 text-sky-600" />
              Whisper ASR + Tesseract OCR
            </span>
            <span className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-2xs">
              <Database className="w-4 h-4 text-teal-600" />
              RAG-Grounded Clinical Evidence
            </span>
          </div>
        </div>

        {/* Animated Clinical Pipeline Diagram (React Bits Inspired Visual) */}
        <div className="mt-14 max-w-5xl mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xl relative z-10">
          <div className="text-center mb-6">
            <span className="text-[11px] font-bold text-teal-700 uppercase tracking-widest block mb-1">
              End-to-End AI Clinical Pipeline
            </span>
            <h3 className="text-lg font-extrabold text-slate-900">How MedMitra Processes Clinical Data</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            {/* Step 1 */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-center relative group hover:border-teal-300 transition-all">
              <div className="w-10 h-10 mx-auto bg-teal-100 text-teal-700 rounded-xl flex items-center justify-center mb-3">
                <Mic className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-white border text-teal-800">
                1. Voice & OCR Input
              </span>
              <h4 className="text-xs font-bold text-slate-900 mt-2">Whisper & Tesseract</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Audio transcribed & documents scanned automatically.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-center relative group hover:border-teal-300 transition-all">
              <div className="w-10 h-10 mx-auto bg-sky-100 text-sky-700 rounded-xl flex items-center justify-center mb-3">
                <Tag className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-white border text-sky-800">
                2. Extraction & Provenance
              </span>
              <h4 className="text-xs font-bold text-slate-900 mt-2">Schema Normalization</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Symptoms, dosages & history linked to exact source.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-center relative group hover:border-teal-300 transition-all">
              <div className="w-10 h-10 mx-auto bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center mb-3">
                <Database className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-white border text-amber-800">
                3. RAG Knowledge Search
              </span>
              <h4 className="text-xs font-bold text-slate-900 mt-2">FAISS Evidence Hits</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Clinical risk flags & evidence chunks retrieved.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-4 bg-teal-50/80 rounded-2xl border border-teal-200 text-center relative group hover:border-teal-400 transition-all">
              <div className="w-10 h-10 mx-auto bg-teal-600 text-white rounded-xl flex items-center justify-center mb-3 shadow-md">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-white border text-teal-900">
                4. Physician Sign-Off
              </span>
              <h4 className="text-xs font-bold text-slate-900 mt-2">VerifiedRecord Locked</h4>
              <p className="text-[11px] text-slate-600 mt-1">
                Doctor reviews canvas, enters diagnosis & locks record.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Problem / Why We Built This */}
      <section id="problem" className="py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-teal-700 block mb-1">
              Why MedMitra Was Built
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Solving the Clinical Documentation Bottleneck
            </h2>
            <p className="text-sm text-slate-500 mt-2 font-medium">
              Traditional EHR paperwork burdens clinicians and leaves patients with fragmented medical records.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* The Problem */}
            <div className="p-6 sm:p-8 rounded-3xl bg-rose-50/50 border border-rose-200/80 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 bg-rose-100 text-rose-700 rounded-2xl flex items-center justify-center mb-4">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">The Clinical Paperwork Crisis</h3>
                <ul className="space-y-3 text-xs sm:text-sm text-slate-700 font-medium">
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
                    <span>Doctors spend up to 2 hours on data entry for every 1 hour spent with patients.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
                    <span>Handwritten prescriptions & scanned PDF reports are non-searchable and easily misplaced.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
                    <span>Patients struggle to consolidate consultation histories across different clinics and specialists.</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-rose-200/60 text-xs font-bold text-rose-800 uppercase tracking-wider">
                Result: Burnout & Unstructured Data
              </div>
            </div>

            {/* Our Approach */}
            <div className="p-6 sm:p-8 rounded-3xl bg-teal-50/50 border border-teal-200/80 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 bg-teal-100 text-teal-700 rounded-2xl flex items-center justify-center mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">The MedMitra Solution</h3>
                <ul className="space-y-3 text-xs sm:text-sm text-slate-700 font-medium">
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-2 shrink-0" />
                    <span>AI transcribes voice consultations and digitizes lab reports automatically.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-2 shrink-0" />
                    <span>RAG knowledge base links symptoms to medical evidence with complete data provenance.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-2 shrink-0" />
                    <span><strong>AI never replaces the doctor:</strong> A licensed physician verifies, signs, and locks every record.</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-teal-200/60 text-xs font-bold text-teal-800 uppercase tracking-wider">
                Result: AI Assists • Doctor Decides
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. How It Works (Step-by-step for both roles) */}
      <section id="how-it-works" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-extrabold uppercase tracking-widest text-teal-700 block mb-1">
            Step-by-Step Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Tailored Workflows for Patients and Doctors
          </h2>
        </div>

        {/* Role Tab Switcher */}
        <div className="flex justify-center mb-8">
          <AnimatedTabs
            tabs={roleTabs}
            activeTab={activeRoleTab}
            onChange={(id: any) => setActiveRoleTab(id)}
          />
        </div>

        {/* Workflow Grid */}
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-sm">
          {activeRoleTab === 'patients' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80">
                <span className="w-8 h-8 rounded-xl bg-teal-600 text-white font-extrabold text-xs flex items-center justify-center mb-3">
                  01
                </span>
                <h4 className="text-sm font-bold text-slate-900 mb-1">Book & Upload</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Book a consultation and record a voice note or upload prescriptions and lab reports.
                </p>
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80">
                <span className="w-8 h-8 rounded-xl bg-teal-600 text-white font-extrabold text-xs flex items-center justify-center mb-3">
                  02
                </span>
                <h4 className="text-sm font-bold text-slate-900 mb-1">AI Processing</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Whisper ASR transcribes voice notes while Tesseract OCR extracts report data automatically.
                </p>
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80">
                <span className="w-8 h-8 rounded-xl bg-teal-600 text-white font-extrabold text-xs flex items-center justify-center mb-3">
                  03
                </span>
                <h4 className="text-sm font-bold text-slate-900 mb-1">Track Live Status</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Monitor BullMQ Redis queue job status in real time right from your patient portal.
                </p>
              </div>

              <div className="p-5 bg-teal-50/80 rounded-2xl border border-teal-200">
                <span className="w-8 h-8 rounded-xl bg-teal-700 text-white font-extrabold text-xs flex items-center justify-center mb-3">
                  04
                </span>
                <h4 className="text-sm font-bold text-slate-900 mb-1">Doctor-Verified Record</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Access your signed, verified clinical record once your physician completes review.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80">
                <span className="w-8 h-8 rounded-xl bg-sky-600 text-white font-extrabold text-xs flex items-center justify-center mb-3">
                  01
                </span>
                <h4 className="text-sm font-bold text-slate-900 mb-1">Unified Patient Queue</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  View incoming patient cases with status pills, complaints, and dates in your queue.
                </p>
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80">
                <span className="w-8 h-8 rounded-xl bg-sky-600 text-white font-extrabold text-xs flex items-center justify-center mb-3">
                  02
                </span>
                <h4 className="text-sm font-bold text-slate-900 mb-1">Inspect Provenance & RAG</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Review raw Whisper voice transcripts, OCR text, clinical risk flags, and FAISS evidence hits.
                </p>
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80">
                <span className="w-8 h-8 rounded-xl bg-sky-600 text-white font-extrabold text-xs flex items-center justify-center mb-3">
                  03
                </span>
                <h4 className="text-sm font-bold text-slate-900 mb-1">Review Canvas Edit</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Edit the AI-drafted summary, refine the final diagnosis, and enter prescribed treatments.
                </p>
              </div>

              <div className="p-5 bg-sky-50/80 rounded-2xl border border-sky-200">
                <span className="w-8 h-8 rounded-xl bg-sky-700 text-white font-extrabold text-xs flex items-center justify-center mb-3">
                  04
                </span>
                <h4 className="text-sm font-bold text-slate-900 mb-1">Sign & Lock Record</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Provide your digital signature to formally sign and lock a VerifiedRecord.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 5. Feature Grid (What you get after logging in) */}
      <section id="features" className="py-16 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-teal-700 block mb-1">
              Platform Core Surfaces
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Built for Clinical Precision & Doctor Autonomy
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SpotlightCard>
              <div className="p-2 bg-teal-100 text-teal-700 rounded-xl w-fit mb-3">
                <Database className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">AI Clinical Summary & RAG Evidence</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Summaries grounded in a searchable clinical knowledge base using FAISS vector retrieval.
              </p>
            </SpotlightCard>

            <SpotlightCard>
              <div className="p-2 bg-sky-100 text-sky-700 rounded-xl w-fit mb-3">
                <Mic className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Voice Transcript (Whisper ASR)</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                High-accuracy consultation audio transcription powered by Hugging Face Whisper ASR.
              </p>
            </SpotlightCard>

            <SpotlightCard>
              <div className="p-2 bg-amber-100 text-amber-700 rounded-xl w-fit mb-3">
                <FileCode className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">OCR Text Extraction (Tesseract)</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Automatically digitize scanned prescriptions, lab results, and medical PDFs into searchable text.
              </p>
            </SpotlightCard>

            <SpotlightCard>
              <div className="p-2 bg-rose-100 text-rose-700 rounded-xl w-fit mb-3">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Clinical Risk Flags Panel</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Rule-based automated detection of potential dosage gaps and urgent clinical indicators.
              </p>
            </SpotlightCard>

            <SpotlightCard>
              <div className="p-2 bg-purple-100 text-purple-700 rounded-xl w-fit mb-3">
                <Edit3 className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Review Canvas & Digital Signature</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Physicians edit AI drafts, prescribe treatments, and append formal signatures to lock records.
              </p>
            </SpotlightCard>

            <SpotlightCard>
              <div className="p-2 bg-teal-100 text-teal-700 rounded-xl w-fit mb-3">
                <Tag className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Full Extraction Provenance</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Every extracted symptom or medication tag is explicitly traced back to its VOICE or OCR origin.
              </p>
            </SpotlightCard>
          </div>
        </div>
      </section>

      {/* 6. Trust & Safety Section */}
      <section id="trust" className="py-14 bg-teal-50/70 border-y border-teal-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <InfoBanner
            title="Human-in-the-Loop Clinical Guarantee"
            description="Raw AI outputs — transcripts, OCR text, and summaries — are always treated as unverified drafts. A licensed doctor must review, edit, and sign every record before it becomes an official VerifiedRecord."
            variant="trust"
            className="text-left mb-6 shadow-sm"
          />

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-bold text-teal-900">
            <span className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-teal-200 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              100% Doctor Controlled
            </span>
            <span className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-teal-200 shadow-2xs">
              <Lock className="w-4 h-4 text-teal-600" />
              GridFS Immutable Files
            </span>
            <span className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-teal-200 shadow-2xs">
              <Activity className="w-4 h-4 text-teal-600" />
              Full Provenance Traced
            </span>
          </div>
        </div>
      </section>

      {/* 7. CTA Banner */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-tr from-teal-700 via-teal-800 to-sky-800 rounded-3xl p-8 sm:p-12 text-center text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight relative z-10">
            Ready to simplify your clinical workflow?
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-teal-100 max-w-xl mx-auto font-medium relative z-10">
            Join doctors and patients leveraging AI assistance with total human verification.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <Link
              to="/register"
              className="w-full sm:w-auto bg-white text-teal-900 hover:bg-slate-100 px-7 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4 text-teal-700" />
              <span>Sign Up as Patient</span>
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto bg-teal-900/60 hover:bg-teal-900 border border-teal-400/40 text-white px-7 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider shadow-2xs transition-all flex items-center justify-center gap-2"
            >
              <Stethoscope className="w-4 h-4 text-teal-300" />
              <span>Sign Up as Doctor</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 text-xs font-medium text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-tr from-teal-600 to-sky-600 rounded-xl">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-extrabold text-slate-900">
                Med<span className="gradient-text-teal">Mitra</span>
              </span>
            </div>

            <div className="flex flex-wrap justify-center gap-6 font-bold text-slate-600">
              <button onClick={() => scrollToSection('features')} className="hover:text-teal-700">Product</button>
              <button onClick={() => scrollToSection('how-it-works')} className="hover:text-teal-700">For Doctors</button>
              <button onClick={() => scrollToSection('how-it-works')} className="hover:text-teal-700">For Patients</button>
              <button onClick={() => scrollToSection('trust')} className="hover:text-teal-700">Trust & Safety</button>
              <Link to="/login" className="hover:text-teal-700">Login</Link>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
            <p>© {new Date().getFullYear()} MedMitra Platform. All rights reserved.</p>
            <p className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>AI Assists • Doctor Decides</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
