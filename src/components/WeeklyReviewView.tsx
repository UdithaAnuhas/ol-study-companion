import React from 'react';
import { Calendar, CheckCircle2, Clock, Flame, ArrowUpRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getFormattedDateString } from '../utils/scheduleEngine';

export const WeeklyReviewView: React.FC = () => {
  const { dailyLogs, subjects } = useApp();

  // Generate last 7 calendar days
  const today = new Date();
  const past7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const dateStr = getFormattedDateString(d);
    return {
      dateStr,
      dayName: d.toLocaleDateString([], { weekday: 'short' }),
      formattedDate: d.toLocaleDateString([], { month: 'short', day: 'numeric' }),
      log: dailyLogs[dateStr],
    };
  });

  // Calculate total focus minutes across all 7 days
  let totalWeeklyFocusMins = 0;
  Object.values(dailyLogs).forEach((log) => {
    if (log && log.focusSessions) {
      log.focusSessions.forEach((fs) => {
        if (fs.completed) totalWeeklyFocusMins += fs.durationMinutes;
      });
    }
  });

  const totalWeeklyFocusHours = (totalWeeklyFocusMins / 60).toFixed(1);

  // Weak subjects needing focus next week
  const weakSubjects = subjects
    .filter((s) => !s.isFinished && s.confidenceLevel <= 2)
    .sort((a, b) => a.confidenceLevel - b.confidenceLevel);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-slate-100 tracking-tight">Weekly Progress & Avoidance Review</h2>
        <p className="text-sm text-slate-400">
          Reflect on your study pattern over the last 7 days without judgment.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold">Total Focused Hours</p>
            <p className="text-2xl font-black text-slate-100 font-mono">{totalWeeklyFocusHours} Hours</p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold">Avoidance Pattern Spotter</p>
            <p className="text-sm font-bold text-amber-300">
              {past7Days.filter((d) => !d.log || Object.keys(d.log.blockCompletions).length === 0).length === 0
                ? 'Great consistency!'
                : 'Rest days spotted — totally normal'}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold">Weakest Areas Addressed</p>
            <p className="text-sm font-bold text-slate-100">{weakSubjects.length} subjects need attention</p>
          </div>
        </div>
      </div>

      {/* 7-Day Completion Grid */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
        <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-400" /> Last 7 Days Completion Log
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-7 gap-3">
          {past7Days.map((d) => {
            const completedCount = d.log ? Object.values(d.log.blockCompletions).filter(Boolean).length : 0;
            const hasActivity = completedCount > 0;

            return (
              <div
                key={d.dateStr}
                className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 ${
                  hasActivity
                    ? 'bg-blue-950/20 border-blue-500/30'
                    : 'bg-slate-950/60 border-slate-800 opacity-60'
                }`}
              >
                <div className="text-center">
                  <p className="text-xs font-bold text-slate-200">{d.dayName}</p>
                  <p className="text-[10px] text-slate-400">{d.formattedDate}</p>
                </div>

                <div className="text-center">
                  <span className={`text-xl font-black font-mono ${hasActivity ? 'text-blue-400' : 'text-slate-600'}`}>
                    {completedCount}
                  </span>
                  <p className="text-[10px] text-slate-400">blocks</p>
                </div>

                <div className="text-center">
                  {hasActivity ? (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-500 text-[10px]">
                      Rest/Skipped
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day 7 Focus Summary & Action Plan for Next Week */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-200">Recommended Priorities For Next Week</h3>

        {weakSubjects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {weakSubjects.map((s) => (
              <div
                key={s.id}
                className="p-4 rounded-2xl bg-red-950/20 border border-red-500/40 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: s.color }} />
                  <div>
                    <p className="font-bold text-slate-100">{s.name}</p>
                    <p className="text-[10px] text-red-300">Confidence: {s.confidenceLevel}/5 stars</p>
                  </div>
                </div>
                <span className="text-red-400 font-semibold flex items-center gap-1">
                  Schedule more focus <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400">All subjects are at confidence level 3 or higher. Great job!</p>
        )}
      </div>
    </div>
  );
};
