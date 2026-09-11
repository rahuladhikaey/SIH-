import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Lock, Mail, User, Stethoscope, AlertCircle, ArrowRight, Calendar } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');

  // Role specific state
  const [licenseNumber, setLicenseNumber] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload: any = {
        fullName,
        email,
        password,
        role,
      };

      if (role === 'doctor') {
        payload.licenseNumber = licenseNumber;
        payload.specialization = specialization;
      } else if (role === 'patient') {
        payload.dob = dob;
        payload.gender = gender;
      }

      await register(payload);

      if (role === 'doctor') {
        navigate('/doctor');
      } else {
        navigate('/patient');
      }
    } catch (err: any) {
      const serverError = err.response?.data?.error;
      if (serverError?.details && Array.isArray(serverError.details) && serverError.details.length > 0) {
        setError(serverError.details.map((d: any) => d.message).join('. '));
      } else {
        setError(serverError?.message || err.message || 'Registration failed. Please check inputs.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      <div className="absolute top-1/4 right-1/3 w-[500px] h-[500px] bg-teal-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[500px] h-[500px] bg-sky-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-gradient-to-tr from-teal-600 to-sky-600 rounded-2xl shadow-xl shadow-teal-500/15 mb-3">
            <Activity className="w-8 h-8 text-white stroke-[2.5]" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Create Your Account
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Join MedMitra — AI-Assisted Clinical Documentation
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-slate-200/80 relative">
          {error && (
            <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200/80 rounded-2xl text-rose-700 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Role Switcher */}
          <div className="grid grid-cols-2 gap-2 mb-6 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => setRole('patient')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                role === 'patient'
                  ? 'bg-white text-teal-800 shadow-sm border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/40'
              }`}
            >
              <User className="w-4 h-4 text-teal-600" />
              <span>Patient Account</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('doctor')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                role === 'doctor'
                  ? 'bg-white text-teal-800 shadow-sm border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/40'
              }`}
            >
              <Stethoscope className="w-4 h-4 text-teal-600" />
              <span>Doctor Account</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={role === 'doctor' ? 'Dr. Sarah Jenkins' : 'John Doe'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 font-medium transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@medmitra.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 font-medium transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 font-medium transition-all"
                />
              </div>
            </div>

            {/* Doctor specific fields */}
            {role === 'doctor' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Medical License No.
                  </label>
                  <input
                    type="text"
                    required
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="MD-987452"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Specialization
                  </label>
                  <input
                    type="text"
                    required
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    placeholder="Cardiology / Internal Medicine"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 font-medium"
                  />
                </div>
              </div>
            )}

            {/* Patient specific fields */}
            {role === 'patient' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="date"
                      required
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-900 focus:outline-none focus:border-teal-500 font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e: any) => setGender(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 focus:outline-none focus:border-teal-500 font-medium"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-button-teal py-3.5 px-4 rounded-xl font-bold text-white shadow-md flex items-center justify-center gap-2 uppercase tracking-wider disabled:opacity-50 mt-6"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="text-teal-600 font-bold hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
