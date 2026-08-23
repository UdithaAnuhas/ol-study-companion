import React, { useState, useEffect } from 'react';
import {
  Clock,
  Timer,
  Video,
  BookOpen,
  Calendar,
  BarChart3,
  Flame,
  Flag,
  CalendarDays,
  Settings,
  Cloud,
  CloudOff,
  RefreshCw,
  Hourglass,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { TabType } from '../context/AppContext';
import { calculateDetailedExamCountdown, EXAM_INTENSIFY_DAYS_THRESHOLD } from '../utils/calendarEngine';

export const Navbar: React.FC = () => {
  const {
    rotationDay,
    setRotationDay,
    examDate,
    setExamDate,
    activeTab,
    setActiveTab,
    calculateStreak,
    timerIsRunning,
    timerSecondsLeft,
    cloudSyncStatus,
  } = useApp();

  const [isEditingExamDate, setIsEditingExamDate] = useState<boolean>(false);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Live timer tick every 1 second for exact days, hours, minutes, seconds countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const streak = calculateStreak();
  const countdown = calculateDetailedExamCountdown(examDate, currentDate);
  const isIntensified = countdown.days <= EXAM_INTENSIFY_DAYS_THRESHOLD;

  const formatTimerPreview = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'hero', label: 'Right Now', icon: <Clock className="w-4 h-4" /> },
    { id: 'countdown', label: 'Countdown', icon: <Hourglass className="w-4 h-4" /> },
    { id: 'calendar', label: 'Calendar', icon: <CalendarDays className="w-4 h-4" /> },
    {
      id: 'timer',
      label: timerIsRunning ? `Timer (${formatTimerPreview(timerSecondsLeft)})` : 'Focus Timer',
      icon: <Timer className={`w-4 h-4 ${timerIsRunning ? 'text-amber-400 animate-spin' : ''}`} />,
    },
    { id: 'backlog', label: 'Backlogs', icon: <Video className="w-4 h-4" /> },
    { id: 'subjects', label: 'Subjects', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'schedule', label: 'Schedule Editor', icon: <Calendar className="w-4 h-4" /> },
    { id: 'review', label: 'Weekly Review', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Main Title */}
          <div
            onClick={() => setActiveTab('hero')}
            className="flex items-center gap-3 cursor-pointer select-none"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-500/20">
              OL
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-bold text-slate-100 tracking-tight leading-none">
                Study Companion
              </h1>
              <p className="text-[11px] text-slate-300 font-medium mt-0.5">Exam Success System</p>
            </div>
          </div>

          {/* Prominent Live Exam Countdown: Days, Hours, Minutes, Seconds */}
          <div className="flex items-center gap-2">
            <div
              onClick={() => setActiveTab('countdown')}
              className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl border transition shadow-sm cursor-pointer hover:border-amber-400/80 ${
                isIntensified
                  ? 'bg-gradient-to-r from-amber-950/90 via-rose-950/90 to-amber-950/90 border-amber-500/80 text-amber-200 shadow-amber-500/20 font-black'
                  : activeTab === 'countdown'
                  ? 'bg-blue-950/80 border-blue-500 text-blue-100 shadow-blue-500/20'
                  : 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800'
              }`}
              title="Click to open Full Countdown View"
            >
              <Flag className={`w-4 h-4 ${isIntensified ? 'text-amber-400 fill-amber-400 animate-pulse' : 'text-blue-400'}`} />
              
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1 font-mono font-black text-xs sm:text-sm">
                  <span className="text-amber-300 bg-amber-500/15 px-1.5 py-0.5 rounded-lg border border-amber-500/30">
                    {countdown.days}d
                  </span>
                  <span className="text-slate-400 font-bold">:</span>
                  <span className="text-amber-200 bg-slate-950 px-1.5 py-0.5 rounded-lg border border-slate-800">
                    {countdown.hours.toString().padStart(2, '0')}h
                  </span>
                  <span className="text-slate-400 font-bold">:</span>
                  <span className="text-amber-200 bg-slate-950 px-1.5 py-0.5 rounded-lg border border-slate-800">
                    {countdown.minutes.toString().padStart(2, '0')}m
                  </span>
                  <span className="text-slate-400 font-bold">:</span>
                  <span className="text-amber-400 bg-slate-950 px-1.5 py-0.5 rounded-lg border border-slate-800">
                    {countdown.seconds.toString().padStart(2, '0')}s
                  </span>
                </div>

                <span className="hidden md:inline text-[10px] text-slate-300 font-semibold uppercase tracking-wider pl-1">
                  until O/L Exam (Dec 6)
                </span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditingExamDate(!isEditingExamDate);
                }}
                className="p-1 text-slate-400 hover:text-slate-100 transition"
                title="Configure Exam Date"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Exam Date Inline Picker */}
            {isEditingExamDate && (
              <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs">
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="bg-slate-950 text-slate-200 px-2 py-0.5 rounded border border-slate-800 focus:outline-none"
                />
                <button
                  onClick={() => setIsEditingExamDate(false)}
                  className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded font-bold"
                >
                  Done
                </button>
              </div>
            )}
          </div>

          {/* Rotation & Streak */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Auto-Computed Rotation Day Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-blue-950/60 border border-blue-500/30 text-xs font-bold text-blue-200">
              <span>📅 Day {rotationDay}{rotationDay === 6 ? ' (Papers)' : rotationDay === 7 ? ' (Light)' : ''}</span>
            </div>

            {/* Streak Badge */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-bold">
              <Flame className="w-4 h-4 fill-amber-500 text-amber-400 animate-pulse" />
              <span>{streak} Day Streak</span>
            </div>

            {/* Supabase Cloud Sync Status Badge */}
            <div
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl border text-[11px] font-bold transition ${
                cloudSyncStatus === 'synced'
                  ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                  : cloudSyncStatus === 'syncing'
                  ? 'bg-blue-950/50 border-blue-500/40 text-blue-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
              title={
                cloudSyncStatus === 'synced'
                  ? 'Connected & Real-Time Synced with Supabase Cloud'
                  : cloudSyncStatus === 'syncing'
                  ? 'Syncing changes to Supabase...'
                  : 'Operating in Offline-First mode (saved locally)'
              }
            >
              {cloudSyncStatus === 'synced' ? (
                <>
                  <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Cloud Synced</span>
                </>
              ) : cloudSyncStatus === 'syncing' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                  <span>Syncing...</span>
                </>
              ) : (
                <>
                  <CloudOff className="w-3.5 h-3.5 text-slate-500" />
                  <span>Offline</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Crisp, High-Contrast Navigation Tab Row */}
        <nav className="flex items-center gap-1.5 overflow-x-auto py-2.5 border-t border-slate-800 no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 border border-blue-400/30'
                    : 'bg-slate-900/90 text-slate-200 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
