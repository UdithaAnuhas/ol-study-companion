import React, { useEffect } from 'react';
import {
  Star,
  Video,
  Clock,
  CheckCircle2,
  ShieldAlert,
  Trophy,
  Sparkles,
  Crown,
  Lock,
  Unlock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getFormattedDateString } from '../utils/scheduleEngine';
import { triggerConfetti } from './Confetti';

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
      // If confidence drops below 5, it cannot remain marked as finished
      const nextFinished = level === 5 ? target.isFinished : false;
      updateSubject({
        ...target,
        confidenceLevel: level,
        isFinished: nextFinished,
      });
    }
  };

  const handleToggleFinished = (subjectId: string) => {
    const target = subjects.find((s) => s.id === subjectId);
    if (target) {
      // Rule: Can only mark as finished/mastered if all 5 stars are filled!
      if (!target.isFinished && target.confidenceLevel < 5) {
        return;
      }

      const nextFinished = !target.isFinished;
      updateSubject({
        ...target,
        isFinished: nextFinished,
        confidenceLevel: nextFinished ? 5 : target.confidenceLevel,
      });
      if (nextFinished) {
        triggerConfetti();
      }
    }
  };

  // Metrics
  const totalSubjectsCount = subjects.length;
  const finishedCount = subjects.filter((s) => s.isFinished).length;
  const allSubjectsFinished = totalSubjectsCount > 0 && finishedCount === totalSubjectsCount;
  const masteryPercentage = totalSubjectsCount > 0 ? Math.round((finishedCount / totalSubjectsCount) * 100) : 0;

  // Fire celebratory confetti if all subjects are finished
  useEffect(() => {
    if (allSubjectsFinished) {
      triggerConfetti();
    }
  }, [allSubjectsFinished]);

  // Sort subjects: Weak subjects (confidence <= 2) first, standard active next, finished subjects organized
  const sortedSubjects = [...subjects].sort((a, b) => {
    if (a.isFinished && !b.isFinished) return 1;
    if (!a.isFinished && b.isFinished) return -1;
    return a.confidenceLevel - b.confidenceLevel;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl sm:text-4xl font-black text-slate-100 tracking-tight">
          Subject Overview & Confidence
        </h2>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Fill all 5 stars (5/5) to unlock the Mastered button. Master all 9 subjects to unlock the Grand 9As frame!
        </p>
      </div>

      {/* Progress towards 9As Bar */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span className="text-sm font-bold text-slate-200">
              Road to 9As Mastery Target
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/20">
            {finishedCount} of {totalSubjectsCount} Subjects Mastered ({masteryPercentage}%)
          </span>
        </div>

        <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-emerald-400 to-amber-400 rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${Math.max(5, masteryPercentage)}%` }}
          />
        </div>
      </div>

      {/* MAIN CONTAINER: If all subjects finished, wrap in glorious golden frame */}
      <div
        className={
          allSubjectsFinished
            ? 'relative p-6 sm:p-10 rounded-[2.5rem] bg-gradient-to-b from-amber-950/40 via-yellow-950/20 to-slate-950 border-4 border-amber-400 shadow-[0_0_60px_rgba(251,191,36,0.35)] ring-4 ring-amber-500/30 overflow-hidden space-y-8 animate-in fade-in duration-700'
            : 'space-y-6'
        }
      >
        {/* ALL 9As READY GRAND BANNER (Appears when all subjects are finished) */}
        {allSubjectsFinished && (
          <div className="relative z-10 text-center space-y-4 pb-6 border-b-2 border-amber-500/40">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-amber-500/30 via-yellow-500/30 to-amber-500/30 border-2 border-amber-400 text-amber-200 font-black text-xs sm:text-sm uppercase tracking-widest shadow-xl shadow-amber-500/30 animate-pulse">
              <Crown className="w-5 h-5 text-amber-300 fill-amber-300" />
              <span>ALL 9 SUBJECTS MASTERED • COMPLETE SYLLABUS VICTORY</span>
              <Trophy className="w-5 h-5 text-amber-300 fill-amber-300" />
            </div>

            <h1 className="text-4xl sm:text-6xl font-black bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-400 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(251,191,36,0.7)] tracking-tight">
              🎉 9As READY! 👑
            </h1>

            <p className="text-sm sm:text-base font-bold text-amber-100 max-w-2xl mx-auto leading-relaxed">
              Every single subject has been conquered with full confidence! You are ready to achieve 9 Distinction Passes in the O/L Examination.
            </p>
          </div>
        )}

        {/* Grid of Subject Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {sortedSubjects.map((subj) => {
            const weeklyMins = getSubjectFocusMinutesThisWeek(subj.id);
            const weeklyHours = (weeklyMins / 60).toFixed(1);
            const isLowConfidence = subj.confidenceLevel <= 2 && !subj.isFinished;
            const hasFullFiveStars = subj.confidenceLevel === 5;

            if (subj.isFinished) {
              return (
                <div
                  key={subj.id}
                  className="relative overflow-hidden rounded-3xl border-2 border-amber-500/80 p-5 space-y-4 shadow-2xl shadow-amber-500/20 bg-gradient-to-br from-amber-950/50 via-slate-900 to-emerald-950/60 flex flex-col justify-between ring-1 ring-amber-400/50"
                >
                  {/* Glorious Watermark & Glow */}
                  <div className="absolute -top-6 -right-6 w-28 h-28 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
                  <Trophy className="absolute -bottom-3 -right-3 w-24 h-24 text-amber-500/15 pointer-events-none -rotate-12" />

                  {/* Header */}
                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/80" />

                      <button
                        onClick={() => handleToggleFinished(subj.id)}
                        className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/30 via-emerald-500/30 to-amber-500/30 border border-amber-400/80 text-[11px] font-black text-amber-300 flex items-center gap-1.5 shadow-md shadow-amber-500/20 hover:scale-105 transition"
                        title="Click to unmark"
                      >
                        <Trophy className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span>MASTERED 👑</span>
                      </button>
                    </div>

                    <h3 className="text-xl font-black bg-gradient-to-r from-amber-200 via-yellow-100 to-emerald-300 bg-clip-text text-transparent mt-2.5 flex items-center gap-2">
                      {subj.name}
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                    </h3>
                  </div>

                  {/* Confidence Rating Bar (Glorious 5 Golden Stars) */}
                  <div className="relative z-10 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-amber-300/90 uppercase tracking-wider">
                        Mastery Status
                      </label>
                      <span className="text-[10px] font-bold text-emerald-400 font-mono">5/5 Stars</span>
                    </div>

                    <div className="flex items-center gap-1 bg-slate-950/70 p-1.5 rounded-2xl border border-amber-500/30">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleSetConfidence(subj.id, star)}
                          className="p-1 hover:scale-125 transition"
                          title={`Set confidence to ${star}`}
                        >
                          <Star className="w-5 h-5 text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Glorious Victory Badge (A Ready) */}
                  <div className="relative z-10 p-3 rounded-2xl bg-gradient-to-r from-emerald-950/70 to-amber-950/70 border border-emerald-500/50 flex items-center justify-between text-xs shadow-inner">
                    <span className="text-emerald-200 font-bold flex items-center gap-1.5 text-[11px]">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      Syllabus Completed
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500/30 to-amber-400/20 border border-amber-400/70 text-amber-200 font-mono font-black text-xs shadow-sm">
                      A Ready
                    </span>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={subj.id}
                className={`rounded-3xl border p-5 space-y-4 transition shadow-lg relative flex flex-col justify-between ${
                  isLowConfidence
                    ? 'bg-red-950/20 border-red-500/50 shadow-red-500/10'
                    : hasFullFiveStars
                    ? 'bg-gradient-to-b from-blue-950/40 via-slate-900 to-slate-950 border-amber-500/40 shadow-amber-500/5'
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
                    <div className="flex items-center gap-1.5">
                      {isLowConfidence ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 text-[10px] font-bold text-red-400 flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3" /> Needs Attention
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-[10px] font-bold text-slate-300">
                          Active
                        </span>
                      )}

                      {/* Mastered Button: ONLY unlocked if all 5 stars are filled! */}
                      {hasFullFiveStars ? (
                        <button
                          onClick={() => handleToggleFinished(subj.id)}
                          className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-400/80 text-amber-300 text-xs font-bold transition flex items-center gap-1 shadow-md shadow-amber-500/20 animate-pulse hover:scale-105"
                          title="5/5 Stars Achieved! Click to mark as Mastered (A Ready)"
                        >
                          <Trophy className="w-3.5 h-3.5 text-amber-400" />
                          <span>Master</span>
                        </button>
                      ) : (
                        <div
                          className="px-2 py-0.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-400 text-[10px] flex items-center gap-1 select-none"
                          title="Fill all 5 stars to unlock Mastered"
                        >
                          <Lock className="w-3 h-3 text-slate-400" />
                          <span className="hidden sm:inline">5★ to Master</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-100 mt-2">{subj.name}</h3>
                </div>

                {/* Confidence Rating Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-slate-400">Confidence Level</label>
                    <span className={`text-[10px] font-bold font-mono ${hasFullFiveStars ? 'text-amber-400' : 'text-slate-400'}`}>
                      {subj.confidenceLevel}/5 Stars
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleSetConfidence(subj.id, star)}
                        className="p-1 hover:scale-125 transition"
                        title={`Set confidence to ${star} star${star > 1 ? 's' : ''}`}
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= subj.confidenceLevel
                              ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]'
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
    </div>
  );
};
