import React from 'react';
import { Star, Video, Clock, CheckCircle, ShieldAlert } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getFormattedDateString } from '../utils/scheduleEngine';

export const SubjectDashboardView: React.FC = () => {
  const { subjects, updateSubject, dailyLogs } = useApp();

  // Calculate total focus minutes per subject over the last 7 days
  const getSubjectFocusMinutesThisWeek = (subjectId: string): number => {
    let totalMins = 0;
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = getFormattedDateString(d);
      const log = dailyLogs[dateStr];
      if (log && log.focusSessions) {
        log.focusSessions
          .filter((s) => s.subjectId === subjectId && s.completed)
          .forEach((s) => {
            totalMins += s.durationMinutes;
          });
      }
    }
    return totalMins;
  };

  const handleSetConfidence = (subjectId: string, level: number) => {
    const target = subjects.find((s) => s.id === subjectId);
    if (target) {
      updateSubject({
        ...target,
        confidenceLevel: level,
      });
    }
  };

  // Sort subjects: Weak subjects (confidence <= 2) first, then finished subject at bottom
  const sortedSubjects = [...subjects].sort((a, b) => {
    if (a.isFinished) return 1;
    if (b.isFinished) return -1;
    return a.confidenceLevel - b.confidenceLevel;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-slate-100 tracking-tight">Subject Overview & Confidence</h2>
        <p className="text-sm text-slate-400">
          Track confidence levels (1–5) and total focus study hours to spot weak areas.
        </p>
      </div>

      {/* Grid of Subject Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sortedSubjects.map((subj) => {
          const weeklyMins = getSubjectFocusMinutesThisWeek(subj.id);
          const weeklyHours = (weeklyMins / 60).toFixed(1);
          const isLowConfidence = subj.confidenceLevel <= 2 && !subj.isFinished;

          return (
            <div
              key={subj.id}
              className={`rounded-3xl border p-5 space-y-4 transition shadow-lg relative flex flex-col justify-between ${
                subj.isFinished
                  ? 'bg-slate-950/40 border-slate-800 opacity-60'
                  : isLowConfidence
                  ? 'bg-red-950/20 border-red-500/50 shadow-red-500/10'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              {/* Header */}
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className="w-3.5 h-3.5 rounded-full"
                    style={{ backgroundColor: subj.color }}
                  />
                  {subj.isFinished ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-[10px] font-bold text-slate-400 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-400" /> Finished
                    </span>
                  ) : isLowConfidence ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 text-[10px] font-bold text-red-400 flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" /> Needs Attention
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-[10px] font-bold text-slate-300">
                      Active
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-slate-100 mt-2">{subj.name}</h3>
              </div>

              {/* Confidence Rating Bar */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400">Confidence Level</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleSetConfidence(subj.id, star)}
                      className="p-1 hover:scale-110 transition"
                      title={`Set confidence to ${star}`}
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= subj.confidenceLevel
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Weekly Stats */}
              <div className="space-y-2 pt-3 border-t border-slate-800/80 text-xs">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-400" /> Focus Time (7d):
                  </span>
                  <span className="font-bold text-slate-200 font-mono">{weeklyHours} hrs</span>
                </div>

                {subj.hasRecordings && (
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-cyan-400" /> Video Backlog:
                    </span>
                    <span className="font-bold text-cyan-300 font-mono">
                      {subj.recordingsWatched} / {subj.recordingsTotal}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
