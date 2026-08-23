import React, { useState } from 'react';
import { Plus, Minus, TrendingUp, Calendar, Edit3, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const BacklogTrackerView: React.FC = () => {
  const { subjects, updateBacklogProgress } = useApp();

  // Filter subjects with video recordings enabled
  const backlogSubjects = subjects.filter((s) => s.hasRecordings);

  const [dailyPaceGoal, setDailyPaceGoal] = useState<number>(2); // Default 2 recordings/day
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [editWatched, setEditWatched] = useState<number>(0);
  const [editTotal, setEditTotal] = useState<number>(0);

  const handleStartEdit = (subjId: string, watched: number, total: number) => {
    setEditingSubjectId(subjId);
    setEditWatched(watched);
    setEditTotal(total);
  };

  const handleSaveEdit = (subjId: string) => {
    updateBacklogProgress(subjId, Math.max(0, editWatched), Math.max(1, editTotal));
    setEditingSubjectId(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-slate-100 tracking-tight">Video Recording Backlog Tracker</h2>
        <p className="text-sm text-slate-400">
          Tackle large video backlogs methodically without feeling overwhelmed.
        </p>
      </div>

      {/* Target Pace Setting */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-200">Target Completion Pace</h3>
            <p className="text-xs text-slate-400">Set your daily target to calculate estimated days remaining</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 pl-2">Daily Target:</span>
          {[1, 2, 3, 4].map((pace) => (
            <button
              key={pace}
              onClick={() => setDailyPaceGoal(pace)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                dailyPaceGoal === pace
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {pace} / day
            </button>
          ))}
        </div>
      </div>

      {/* Backlog Subject Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {backlogSubjects.map((subj) => {
          const isEditing = editingSubjectId === subj.id;
          const remaining = Math.max(0, subj.recordingsTotal - subj.recordingsWatched);
          const percentWatched = subj.recordingsTotal > 0 ? Math.round((subj.recordingsWatched / subj.recordingsTotal) * 100) : 100;
          const daysLeft = Math.ceil(remaining / Math.max(1, dailyPaceGoal));

          return (
            <div
              key={subj.id}
              className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-6 relative overflow-hidden shadow-xl"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-4 h-4 rounded-full" style={{ backgroundColor: subj.color }} />
                  <div>
                    <h3 className="text-xl font-bold text-slate-100">{subj.name} Recordings</h3>
                    <p className="text-xs text-slate-400">Backlog clearance tracker</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      isEditing
                        ? handleSaveEdit(subj.id)
                        : handleStartEdit(subj.id, subj.recordingsWatched, subj.recordingsTotal)
                    }
                    className="p-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition flex items-center gap-1 text-xs font-semibold px-2.5"
                    title={isEditing ? 'Save Numbers' : 'Edit Recording Counts'}
                  >
                    {isEditing ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Save</span>
                      </>
                    ) : (
                      <>
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </>
                    )}
                  </button>

                  <span className="px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-cyan-400">
                    {percentWatched}% Done
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-300">Watched: {subj.recordingsWatched}</span>
                  <span className="text-amber-400">Remaining: {remaining}</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percentWatched}%`,
                      backgroundColor: subj.color,
                    }}
                  />
                </div>
              </div>

              {/* Direct Count Editor / Stepper */}
              {isEditing ? (
                /* Inline Direct Number Inputs Mode */
                <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/40 space-y-3">
                  <p className="text-xs font-bold text-cyan-300">Set Exact Recording Counts:</p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400 font-semibold">Watched / Done:</label>
                      <input
                        type="number"
                        min="0"
                        max={editTotal}
                        value={editWatched}
                        onChange={(e) => setEditWatched(Math.max(0, Number(e.target.value) || 0))}
                        className="w-full bg-slate-900 text-slate-100 text-sm font-mono font-bold px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400 font-semibold">Total in Backlog:</label>
                      <input
                        type="number"
                        min="1"
                        max="500"
                        value={editTotal}
                        onChange={(e) => setEditTotal(Math.max(1, Number(e.target.value) || 1))}
                        className="w-full bg-slate-900 text-slate-100 text-sm font-mono font-bold px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => setEditingSubjectId(null)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-slate-200 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveEdit(subj.id)}
                      className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-md shadow-cyan-500/20"
                    >
                      Save Numbers
                    </button>
                  </div>
                </div>
              ) : (
                /* Normal Quick-Stepper Mode */
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 font-semibold">Watched / Total</p>
                    <p className="text-lg font-black text-slate-100 font-mono">
                      {subj.recordingsWatched} / {subj.recordingsTotal}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateBacklogProgress(subj.id, subj.recordingsWatched - 1)}
                      disabled={subj.recordingsWatched <= 0}
                      className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 border border-slate-800 transition"
                      title="Minus 1"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => updateBacklogProgress(subj.id, subj.recordingsWatched + 1)}
                      disabled={subj.recordingsWatched >= subj.recordingsTotal}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition shadow-md shadow-cyan-500/20"
                    >
                      <Plus className="w-4 h-4" />
                      Watched 1 More
                    </button>
                  </div>
                </div>
              )}

              {/* Estimated Days Remaining Card */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-400">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  <span>Est. completion at {dailyPaceGoal}/day:</span>
                </div>
                <span className="font-extrabold font-mono text-cyan-300 text-sm">
                  {daysLeft} Days Left
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
