import React from 'react';
import { Mic, Stethoscope, Pill, TestTube, FileText, Calendar, CheckCircle2 } from 'lucide-react';
import { TimelineEvent } from './types';

interface MedicalTimelineProps {
  timeline: TimelineEvent[];
}

export const MedicalTimeline: React.FC<MedicalTimelineProps> = ({ timeline }) => {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-400 text-xs font-medium">
        No chronological timeline events recorded yet.
      </div>
    );
  }

  const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'voice':
        return <Mic className="w-4 h-4 text-teal-600" />;
      case 'doctor':
        return <Stethoscope className="w-4 h-4 text-blue-600" />;
      case 'diagnosis':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'prescription':
        return <Pill className="w-4 h-4 text-amber-600" />;
      case 'report':
        return <TestTube className="w-4 h-4 text-purple-600" />;
      case 'note':
        return <FileText className="w-4 h-4 text-slate-600" />;
      default:
        return <Calendar className="w-4 h-4 text-slate-600" />;
    }
  };

  const getBadgeStyle = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'voice':
        return 'bg-teal-50 border-teal-200 text-teal-800';
      case 'doctor':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'diagnosis':
        return 'bg-emerald-50 border-emerald-200 text-emerald-800';
      case 'prescription':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'report':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      default:
        return 'bg-slate-100 border-slate-200 text-slate-800';
    }
  };

  return (
    <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {timeline.map((event) => (
        <div key={event.id} className="relative group">
          {/* Node Icon */}
          <div className="absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white border-2 border-teal-500 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
            {getEventIcon(event.type)}
          </div>

          {/* Card */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:border-teal-300 transition-colors">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${getBadgeStyle(event.type)}`}>
                {event.title}
              </span>
              <span className="text-xs font-mono font-semibold text-slate-400">{event.date}</span>
            </div>

            <p className="text-xs text-slate-700 font-medium leading-relaxed mt-2">{event.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
