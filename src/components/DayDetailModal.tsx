import React from 'react';
import { X, CheckCircle2, Calendar as CalendarIcon, Lock, Clock } from 'lucide-react';
import type { ScheduleDay, DailyLog, Subject } from '../types';
import { evaluateDayStatus } from '../utils/calendarEngine';
import { isBlockChecked, getBlockCheckedAt } from '../utils/scheduleEngine';

interface DayDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateStr: string;
  dailyLog: DailyLog | undefined;
  scheduleDay: ScheduleDay | undefined;
  subjects: Subject[];
}

export const DayDetailModal: React.FC<DayDetailModalProps> = ({
  isOpen,
  onClose,
  dateStr,
  dailyLog,
  scheduleDay,
  subjects,
}) => {
  if (!isOpen || !dateStr) return null;

  const dayStatus = evaluateDayStatus(dateStr, dailyLog, scheduleDay);
  const completions = dailyLog?.blockCompletions || {};
  const blocks = scheduleDay?.blocks || [];

  const formattedDate = new Date(dateStr + 'T00:00:00').toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">{formattedDate}</h3>
              <p className="text-xs text-slate-400">Daily Log & Factual Block Record</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Factual Summary Bar */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold">Study Completion</p>
            <p className="text-xl font-black font-mono text-slate-100">
              {dayStatus.completedStudyBlocks} / {dayStatus.totalStudyBlocks} Study Blocks Done
            </p>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              dayStatus.status === 'complete'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : dayStatus.status === 'partial'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : dayStatus.status === 'missed'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
            }`}
          >
            {dayStatus.status.toUpperCase()} ({dayStatus.completionPercent}%)
          </span>
        </div>

        {/* Block List */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {blocks.map((b) => {
            const isDone = isBlockChecked(completions, b.id);
            const checkedAtIso = getBlockCheckedAt(completions, b.id);
            const subj = subjects.find((s) => s.id === b.subjectId);

            const checkedAtFormatted = checkedAtIso
              ? new Date(checkedAtIso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : null;

            return (
              <div
                key={b.id}
                className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
                  isDone
                    ? 'bg-slate-950/80 border-slate-800'
                    : 'bg-rose-950/10 border-rose-500/20 opacity-75'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-400 font-semibold">
                      {b.startTime} - {b.endTime}
                    </span>
                    <span className="uppercase text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 font-mono">
                      {b.type}
                    </span>
                  </div>
                  <p className={`font-bold ${isDone ? 'text-slate-200' : 'text-slate-400'}`}>{b.label}</p>
                  <div className="flex items-center gap-2 pt-0.5">
                    {subj && (
                      <span
                        className="inline-block px-2 py-0.5 rounded text-[10px] font-bold text-white"
                        style={{ backgroundColor: subj.color }}
                      >
                        {subj.name}
                      </span>
                    )}

                    {checkedAtFormatted && (
                      <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Ticked at {checkedAtFormatted}
                      </span>
                    )}
                  </div>
                </div>

                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <div className="flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-1 rounded border border-rose-500/20">
                    <Lock className="w-3 h-3" /> Locked
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Close Button */}
        <div className="pt-2 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
          >
            Close Detail View
          </button>
        </div>
      </div>
    </div>
  );
};
