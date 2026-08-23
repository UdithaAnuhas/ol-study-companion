import React, { useState } from 'react';
import { Sparkles, Star, CheckCircle2, MessageSquare, Flame, AlertCircle, BookOpen, Check } from 'lucide-react';
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
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);

  // Sync state whenever a new session finishes
  React.useEffect(() => {
    if (pendingReflectionSession) {
      setSelectedSubjectIds([pendingReflectionSession.subjectId]);
      setNotes('');
      setFocusRating(5);
    }
  }, [pendingReflectionSession]);

  if (!pendingReflectionSession) return null;

  const ratingDescriptions: Record<number, { label: string; color: string }> = {
    1: { label: 'Distracted (Lost focus often)', color: 'text-rose-400' },
    2: { label: 'Somewhat Focused (A few interruptions)', color: 'text-amber-400' },
    3: { label: 'Moderate Focus (Good steady work)', color: 'text-yellow-300' },
    4: { label: 'Deep Focus (Highly productive)', color: 'text-blue-300' },
    5: { label: 'Laser Focused (100% Locked in flow state! ⚡)', color: 'text-emerald-400' },
  };

  const isNotesValid = notes.trim().length > 0;
  const hasSubjects = selectedSubjectIds.length > 0;
  const canSave = isNotesValid && hasSubjects;

  const toggleSubject = (subjectId: string) => {
    setSelectedSubjectIds((prev) => {
      if (prev.includes(subjectId)) {
        if (prev.length === 1) return prev; // Keep at least one subject selected
        return prev.filter((id) => id !== subjectId);
      } else {
        return [...prev, subjectId];
      }
    });
  };

  const handleSave = () => {
    if (!canSave) return;
    saveSessionReflection(
      pendingReflectionSession.id,
      notes.trim(),
      focusRating,
      selectedSubjectIds
    );
    setPendingReflectionSession(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-slate-900 border-2 border-blue-500/60 shadow-2xl shadow-blue-500/25 p-6 sm:p-8 space-y-6 my-8">
        {/* Glow effects */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase tracking-wider shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Timer Complete • Deep Work Logged!</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
            Session Reflection 🎯
          </h3>

          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-300">
            <span className="bg-slate-950 px-3 py-1 rounded-xl border border-slate-800 font-mono text-amber-300 font-bold">
              ⏱️ {pendingReflectionSession.durationMinutes} Minutes Focused Study
            </span>
          </div>
        </div>

        {/* Question 1: Mark Subjects Studied */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-blue-400" />
              Mark Subject(s) Studied in this Session: <span className="text-amber-400 font-black">*</span>
            </label>
            <span className="text-[10px] text-slate-400 font-semibold">
              {selectedSubjectIds.length} Selected
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {subjects.map((s) => {
              const isSelected = selectedSubjectIds.includes(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleSubject(s.id)}
                  className={`flex items-center justify-between p-2 rounded-xl border text-xs font-bold transition transform active:scale-95 text-left ${
                    isSelected
                      ? 'bg-blue-600/20 border-blue-400 text-blue-200 shadow-sm'
                      : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="truncate">{s.name}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Question 2: Mandatory Description of what was accomplished */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-blue-400" />
              What did you accomplish in this session? <span className="text-amber-400 font-black">*</span>
            </label>
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
              Required
            </span>
          </div>

          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Write what you completed (e.g. Solved 10 Past Paper questions, reviewed Science Unit 4, wrote summary notes...)"
            className={`w-full bg-slate-950 text-slate-100 text-xs sm:text-sm p-3.5 rounded-2xl border transition resize-none focus:outline-none focus:ring-2 ${
              !isNotesValid
                ? 'border-amber-500/40 focus:ring-amber-500/50 placeholder:text-slate-500'
                : 'border-blue-500/60 focus:ring-blue-500 placeholder:text-slate-500'
            }`}
            autoFocus
          />
          {!isNotesValid && (
            <p className="text-[11px] text-amber-300/80 font-medium flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />
              Please describe what you completed to save and log this study session.
            </p>
          )}
        </div>

        {/* Question 3: Focus Rating */}
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

        {/* Action Button: Strictly save when notes & subjects are filled */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg ${
              canSave
                ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white shadow-blue-500/25 transform active:scale-95 cursor-pointer'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Complete & Save Session Reflection</span>
          </button>
        </div>
      </div>
    </div>
  );
};
