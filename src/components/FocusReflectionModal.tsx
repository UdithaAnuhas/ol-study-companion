import React, { useState } from 'react';
import { Sparkles, Star, CheckCircle2, MessageSquare, Flame, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const FocusReflectionModal: React.FC = () => {
  const {
    pendingReflectionSession,
    setPendingReflectionSession,
    saveSessionReflection,
    subjects,
  } = useApp();

  const [notes, setNotes] = useState<string>('');
  const [focusRating, setFocusRating] = useState<number>(5);

  if (!pendingReflectionSession) return null;

  const subject = subjects.find((s) => s.id === pendingReflectionSession.subjectId);

  const ratingDescriptions: Record<number, { label: string; color: string }> = {
    1: { label: 'Distracted (Lost focus often)', color: 'text-rose-400' },
    2: { label: 'Somewhat Focused (A few interruptions)', color: 'text-amber-400' },
    3: { label: 'Moderate Focus (Good steady work)', color: 'text-yellow-300' },
    4: { label: 'Deep Focus (Highly productive)', color: 'text-blue-300' },
    5: { label: 'Laser Focused (100% Locked in flow state! ⚡)', color: 'text-emerald-400' },
  };

  const handleSave = () => {
    saveSessionReflection(pendingReflectionSession.id, notes.trim(), focusRating);
    setPendingReflectionSession(null);
  };

  const handleSkip = () => {
    saveSessionReflection(pendingReflectionSession.id, '', focusRating);
    setPendingReflectionSession(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-slate-900 border-2 border-blue-500/50 shadow-2xl shadow-blue-500/20 p-6 sm:p-8 space-y-6">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close/Skip button */}
        <button
          onClick={handleSkip}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          title="Close / Skip"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Session Completed!</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
            Great Work! 🎯
          </h3>

          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-300">
            {subject && (
              <span className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: subject.color }} />
                {subject.name}
              </span>
            )}
            <span className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 font-mono text-amber-300">
              {pendingReflectionSession.durationMinutes} Minutes Focused
            </span>
          </div>
        </div>

        {/* Question 1: What did you do? */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-blue-400" />
            What did you accomplish in this session?
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Solved 10 Maths Algebra questions, completed Science Unit 3 notes, watched ICT recording..."
            className="w-full bg-slate-950 text-slate-100 text-xs sm:text-sm p-3.5 rounded-2xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400 resize-none transition"
            autoFocus
          />
        </div>

        {/* Question 2: Focus Rating */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-400" />
              How focused were you?
            </label>
            <span className={`text-xs font-bold font-mono ${ratingDescriptions[focusRating].color}`}>
              {focusRating}/5 Stars
            </span>
          </div>

          <div className="flex items-center justify-center gap-2 bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setFocusRating(star)}
                className="p-1.5 hover:scale-125 transition transform"
                title={`Rate ${star} star${star > 1 ? 's' : ''}`}
              >
                <Star
                  className={`w-7 h-7 transition ${
                    star <= focusRating
                      ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.7)]'
                      : 'text-slate-700 hover:text-slate-500'
                  }`}
                />
              </button>
            ))}
          </div>

          <p className={`text-center text-xs font-bold ${ratingDescriptions[focusRating].color}`}>
            {ratingDescriptions[focusRating].label}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleSkip}
            className="w-1/3 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
          >
            Skip Notes
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="w-2/3 py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2 transform active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            Save Session Reflection
          </button>
        </div>
      </div>
    </div>
  );
};
