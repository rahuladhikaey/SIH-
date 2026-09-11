import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Activity, LogOut, ShieldCheck, UserCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md px-6 py-3.5 flex items-center justify-between border-b border-slate-200/80 shadow-xs">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gradient-to-tr from-teal-600 to-sky-600 rounded-xl shadow-md shadow-teal-500/10">
          <Activity className="w-5 h-5 text-white stroke-[2.5]" />
        </div>
        <Link to="/" className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5">
          Med<span className="gradient-text-teal">Mitra</span>
        </Link>

        <div className="hidden md:flex items-center ml-4 px-3 py-1 bg-teal-50 border border-teal-200/80 rounded-full text-xs font-semibold text-teal-800 gap-1.5 shadow-2xs">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
          <span>AI Assists • Doctor Decides</span>
        </div>
      </div>

      {user && (
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-slate-700">
            <div className="p-1 bg-slate-100 rounded-full">
              <UserCheck className="w-4 h-4 text-teal-600" />
            </div>
            <span className="font-bold text-slate-900">{user.fullName}</span>
            <span className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-full bg-slate-100 text-teal-800 border border-slate-200/80">
              {user.role}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-rose-700 hover:bg-rose-50 transition-all border border-slate-200/80 bg-white shadow-2xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
};
