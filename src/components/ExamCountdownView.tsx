import React, { useState, useEffect } from 'react';
import {
  Flag,
  Calendar,
  Clock,
  Sparkles,
  Zap,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Award,
  AlertCircle,
  Timer,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateDetailedExamCountdown, EXAM_INTENSIFY_DAYS_THRESHOLD } from '../utils/calendarEngine';
import { ROTATION_ANCHOR_DATE, getFormattedDateString } from '../utils/scheduleEngine';

export const ExamCountdownView: React.FC = () => {
  const { examDate, setExamDate, setActiveTab, subjects } = useApp();

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [isEditingDate, setIsEditingDate] = useState<boolean>(false);
  const [tempDate, setTempDate] = useState<string>(examDate);

  // Live timer tick every 1 second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const countdown = calculateDetailedExamCountdown(examDate, currentDate);
  const isIntensified = countdown.days <= EXAM_INTENSIFY_DAYS_THRESHOLD;

  // Total journey calculations (From Aug 24 launch to Exam Date)
  const anchorTime = ROTATION_ANCHOR_DATE.getTime();
  const [y, m, d] = examDate.split('-').map(Number);
  const targetTime = new Date(y, (m || 1) - 1, d || 1, 8, 30, 0).getTime();
  const nowTime = currentDate.getTime();

  const totalJourneyDuration = Math.max(1, targetTime - anchorTime);
  const timeElapsed = Math.max(0, nowTime - anchorTime);
  const progressPercent = Math.min(100, Math.max(0, Math.round((timeElapsed / totalJourneyDuration) * 100)));

  // Milestone metrics
  const totalHoursRemaining = Math.max(0, Math.floor(countdown.totalSeconds / 3600));
  const fullRotationsLeft = Math.floor(countdown.days / 7);
  const daysMod = countdown.days % 7;
  const unfinishedSubjectsCount = subjects.filter((s) => !s.isFinished).length;

  // Motivational quote based on days left
  const getMotivationalQuote = (days: number) => {
    if (days <= 7) return { quote: 'Final week! Stay calm, review key formulas, and trust your preparation.', icon: <Award className="w-5 h-5 text-amber-400" /> };
    if (days <= 30) return { quote: 'The Final 30-Day Sprint! Maximize past papers and timed practice runs.', icon: <Zap className="w-5 h-5 text-amber-400" /> };
    if (days <= 60) return { quote: '60 days to go — turn your weak spots into confident strengths daily.', icon: <TrendingUp className="w-5 h-5 text-emerald-400" /> };
    return { quote: 'Consistency beats intensity. Every single block you tick off brings you closer to your 9A goal.', icon: <Sparkles className="w-5 h-5 text-blue-400" /> };
  };

  const motivation = getMotivationalQuote(countdown.days);

  const handleSaveDate = () => {
    if (tempDate) {
      setExamDate(tempDate);
      setIsEditingDate(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/70 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
              <Flag className="w-3.5 h-3.5" />
              <span>Official Target Countdown</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-100 tracking-tight">
              O/L Examination 2026
            </h1>
            <p className="text-sm sm:text-base text-slate-300 font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              Target Date: <span className="font-bold text-amber-300 font-mono">{examDate} (08:30 AM)</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isEditingDate ? (
              <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-2xl border border-slate-700 shadow-lg">
                <input
                  type="date"
                  value={tempDate}
                  onChange={(e) => setTempDate(e.target.value)}
                  className="bg-slate-900 text-slate-100 px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSaveDate}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditingDate(false)}
                  className="px-2 py-1.5 text-slate-400 hover:text-slate-200 text-xs transition"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setTempDate(examDate);
                  setIsEditingDate(true);
                }}
                className="px-4 py-2 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 text-xs font-bold transition flex items-center gap-2 shadow-sm"
              >
                <span>Edit Target Date</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* GIGANTIC HERO COUNTDOWN CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {/* DAYS CARD */}
        <div
          className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center border shadow-2xl transition duration-300 ${
            isIntensified
              ? 'bg-gradient-to-b from-amber-950/60 via-slate-900 to-slate-950 border-amber-500/50 shadow-amber-500/10'
              : 'bg-gradient-to-b from-blue-950/40 via-slate-900 to-slate-950 border-blue-500/40 shadow-blue-500/10'
          }`}
        >
          <div className="text-center space-y-1">
            <span className="text-5xl sm:text-7xl lg:text-8xl font-black font-mono tracking-tight text-amber-300 drop-shadow-md">
              {countdown.days}
            </span>
            <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-400">
              Days Left
            </p>
          </div>
          <div className="mt-4 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[11px] font-bold text-amber-300 font-mono">
            {fullRotationsLeft} full rotations {daysMod > 0 ? `+ ${daysMod}d` : ''}
          </div>
        </div>

        {/* HOURS CARD */}
        <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-xl">
          <div className="text-center space-y-1">
            <span className="text-5xl sm:text-7xl lg:text-8xl font-black font-mono tracking-tight text-slate-100">
              {countdown.hours.toString().padStart(2, '0')}
            </span>
            <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-400">
              Hours
            </p>
          </div>
          <div className="mt-4 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-[11px] font-bold text-slate-300 font-mono">
            Total {totalHoursRemaining.toLocaleString()}h
          </div>
        </div>

        {/* MINUTES CARD */}
        <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-xl">
          <div className="text-center space-y-1">
            <span className="text-5xl sm:text-7xl lg:text-8xl font-black font-mono tracking-tight text-slate-100">
              {countdown.minutes.toString().padStart(2, '0')}
            </span>
            <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-400">
              Minutes
            </p>
          </div>
          <div className="mt-4 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-[11px] font-bold text-slate-300 font-mono">
            60m / hour
          </div>
        </div>

        {/* SECONDS CARD (Live Pulsing) */}
        <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center bg-gradient-to-b from-blue-950/30 via-slate-900 to-slate-950 border border-blue-500/30 shadow-xl">
          <div className="text-center space-y-1">
            <span className="text-5xl sm:text-7xl lg:text-8xl font-black font-mono tracking-tight text-blue-400 animate-pulse">
              {countdown.seconds.toString().padStart(2, '0')}
            </span>
            <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-blue-300">
              Seconds
            </p>
          </div>
          <div className="mt-4 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[11px] font-bold text-blue-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping inline-block" />
            <span>Live Ticking</span>
          </div>
        </div>
      </div>

      {/* MOTIVATIONAL BANNER */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 flex items-center gap-4 shadow-lg">
        <div className="p-3 rounded-2xl bg-slate-800 border border-slate-700 shrink-0">
          {motivation.icon}
        </div>
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Daily Mindset</h3>
          <p className="text-sm sm:text-base font-semibold text-slate-100 mt-0.5">
            "{motivation.quote}"
          </p>
        </div>
      </div>

      {/* PREPARATION TIMELINE & MILESTONES */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-black text-slate-100 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" /> Preparation Journey Roadmap
            </h2>
            <p className="text-xs text-slate-400">Track your progression from today until the examination morning</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono font-bold text-blue-300 bg-blue-500/10 px-3 py-1 rounded-xl border border-blue-500/20">
              {progressPercent}% Elapsed
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full h-3.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-400 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${Math.max(2, progressPercent)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 font-semibold">
            <span>🚀 Start: {getFormattedDateString(ROTATION_ANCHOR_DATE)}</span>
            <span>🏁 O/L Exam: {examDate}</span>
          </div>
        </div>

        {/* 4 Phases Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Phase 1: Launch</span>
            </div>
            <p className="text-xs text-slate-300 font-medium">Build daily study routine</p>
            <p className="text-[10px] text-slate-400">Aug 24 – Sep 15</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Phase 2: Mastery</span>
            </div>
            <p className="text-xs text-slate-300 font-medium">Clear science/ICT backlogs</p>
            <p className="text-[10px] text-slate-400">Sep 16 – Oct 31</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <Zap className="w-3.5 h-3.5" />
              <span>Phase 3: Past Papers</span>
            </div>
            <p className="text-xs text-slate-300 font-medium">Timed exam simulations</p>
            <p className="text-[10px] text-slate-400">Nov 01 – Nov 28</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <Flag className="w-3.5 h-3.5" />
              <span>Phase 4: Final Sprint</span>
            </div>
            <p className="text-xs text-slate-300 font-medium">Formula & summary refresh</p>
            <p className="text-[10px] text-slate-400">Nov 29 – Dec 06</p>
          </div>
        </div>
      </div>

      {/* QUICK LAUNCH SHORTCUTS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setActiveTab('hero')}
          className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition group flex items-center justify-between text-left shadow-lg"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
              <Clock className="w-4 h-4" />
              <span>Today's Plan</span>
            </div>
            <p className="text-base font-black text-slate-100">Right Now View</p>
            <p className="text-xs text-slate-400">Tick off today's study blocks</p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition" />
        </button>

        <button
          onClick={() => setActiveTab('timer')}
          className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition group flex items-center justify-between text-left shadow-lg"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <Timer className="w-4 h-4" />
              <span>Deep Work</span>
            </div>
            <p className="text-base font-black text-slate-100">Start Focus Timer</p>
            <p className="text-xs text-slate-400">Run a 25m or 50m study sprint</p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition" />
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition group flex items-center justify-between text-left shadow-lg"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <Calendar className="w-4 h-4" />
              <span>Monthly Grid</span>
            </div>
            <p className="text-base font-black text-slate-100">Exam Calendar</p>
            <p className="text-xs text-slate-400">View all days until Dec 6</p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition" />
        </button>
      </div>
    </div>
  );
};
