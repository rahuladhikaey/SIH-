import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, User, Stethoscope } from 'lucide-react';
import { InfoBanner } from '../components/InfoBanner';

export const LoginPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'patient' | 'doctor'>('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password, activeTab);
      // Determine redirection based on current stored user role
      const savedUser = JSON.parse(localStorage.getItem('medmitra_user') || '{}');
      if (savedUser.role === 'doctor') {
        navigate('/doctor');
      } else {
        navigate('/patient');
      }
    } catch (err: any) {
      const serverError = err.response?.data?.error;
      setError(serverError?.message || err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Ambient background soft glow circles */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-teal-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-sky-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-gradient-to-tr from-teal-600 to-sky-600 rounded-2xl shadow-xl shadow-teal-500/15 mb-3">
            <Activity className="w-8 h-8 text-white stroke-[2.5]" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Med<span className="gradient-text-teal">Mitra</span>
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1.5 max-w-xs mx-auto leading-relaxed">
            AI-Assisted Clinical Documentation & Case-Taking Platform
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-slate-200/80 relative">
          {/* Trust Banner */}
          <InfoBanner
            title="Doctor Verified Platform"
            description="AI output must be reviewed before final approval."
            variant="trust"
            className="mb-6"
          />

          {/* 2-Tab Switcher: Patient Login & Doctor Login */}
          <div className="grid grid-cols-2 gap-2 mb-6 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => {
                setActiveTab('patient');
                setError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                activeTab === 'patient'
                  ? 'bg-white text-teal-800 shadow-sm border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/40'
              }`}
            >
              <User className="w-4 h-4 text-teal-600" />
              <span>Patient Login</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('doctor');
                setError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                activeTab === 'doctor'
                  ? 'bg-white text-teal-800 shadow-sm border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/40'
              }`}
            >
              <Stethoscope className="w-4 h-4 text-teal-600" />
              <span>Doctor Login</span>
            </button>
          </div>

          <div className="mb-5 text-[11px] font-bold text-teal-700 uppercase tracking-wider flex items-center justify-between">
            <span>
              {activeTab === 'doctor' ? '👨‍⚕️ Doctor Portal Access' : '👤 Patient Portal Access'}
            </span>
          </div>

          {error && (
            <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200/80 rounded-2xl text-rose-700 text-xs flex items-center gap-2.5 shadow-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 font-sans">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={activeTab === 'doctor' ? 'doctor@medmitra.com' : 'patient@medmitra.com'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-xs font-medium transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-xs font-medium transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-button-teal py-3.5 px-4 rounded-xl font-bold text-white shadow-md flex items-center justify-center gap-2 text-xs uppercase tracking-wider disabled:opacity-50 mt-6"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <span>Sign In as {activeTab === 'doctor' ? 'Doctor' : 'Patient'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500 font-medium">
              Don't have an account?{' '}
              <Link to="/register" className="text-teal-600 font-bold hover:underline">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
