import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  Sparkles,
  Gamepad2,
  Coffee,
  Brain,
  Utensils,
  Moon,
  Flame,
  Lock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  evaluateScheduleState,
  formatCountdown,
  getFormattedDateString,
  getBlockLockStatus,
  isBlockChecked,
  getBlockCheckedAt,
  canUntickCompletedBlock,
} from '../utils/scheduleEngine';
import { JustStartModal } from './JustStartModal';
import { audioSynth } from '../utils/audio';
import { triggerConfetti } from './Confetti';

export const HeroRightNow: React.FC = () => {
  const {
    rotationDay,
    schedule,
    subjects,
    getDailyLogForDate,
    toggleBlockCompletion,
    setActiveTab,
  } = useApp();

  const [now, setNow] = useState<Date>(new Date());
  const [isJustStartOpen, setIsJustStartOpen] = useState<boolean>(false);
  const [playedGameNudge, setPlayedGameNudge] = useState<boolean>(false);

  // Live timer tick every 1 second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const currentScheduleDay = schedule.find((d) => d.dayNumber === rotationDay) || schedule[0];
  const scheduleState = evaluateScheduleState(currentScheduleDay, now);

  const todayStr = getFormattedDateString(now);
  const dailyLog = getDailyLogForDate(todayStr);

  const activeBlock = scheduleState.currentBlock;
  const activeSubject = activeBlock ? subjects.find((s) => s.id === activeBlock.subjectId) : null;
  const isCompleted = activeBlock ? isBlockChecked(dailyLog.blockCompletions, activeBlock.id) : false;

  // Sound nudge when game break is ending soon (5 mins)
  useEffect(() => {
    if (scheduleState.isGameEndingSoon && !playedGameNudge) {
      audioSynth.playGameNudge();
      setPlayedGameNudge(true);
    } else if (!scheduleState.isGameEndingSoon) {
      setPlayedGameNudge(false);
    }
  }, [scheduleState.isGameEndingSoon, playedGameNudge]);

  const handleToggleCompletion = (blockId: string) => {
    const wasCompleted = isBlockChecked(dailyLog.blockCompletions, blockId);
    const checkedAtIso = getBlockCheckedAt(dailyLog.blockCompletions, blockId);

    // If block was completed and 30 minutes have passed, unticking is blocked!
    if (wasCompleted && !canUntickCompletedBlock(checkedAtIso, now)) {
      return;
    }

    toggleBlockCompletion(todayStr, blockId);
    if (!wasCompleted) {
      audioSynth.playBlockDoneSound();
      triggerConfetti();
    }
  };

  // Block type helpers
  const getBlockTypeBadge = (type: string) => {
    switch (type) {
      case 'study':
        return { label: 'Focused Study', icon: <Brain className="w-4 h-4 text-blue-400" />, bg: 'bg-blue-500/20 border-blue-500/40 text-blue-200' };
      case 'break':
        return { label: 'Short Break', icon: <Coffee className="w-4 h-4 text-amber-400" />, bg: 'bg-amber-500/20 border-amber-500/40 text-amber-200' };
      case 'game':
        return { label: 'Game Session 🎮', icon: <Gamepad2 className="w-4 h-4 text-violet-400" />, bg: 'bg-violet-500/25 border-violet-500/50 text-violet-200' };
      case 'meal':
        return { label: 'Meal & Rest', icon: <Utensils className="w-4 h-4 text-emerald-400" />, bg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200' };
      case 'rest':
      default:
        return { label: 'Wind Down', icon: <Moon className="w-4 h-4 text-slate-300" />, bg: 'bg-slate-800 border-slate-700 text-slate-200' };
    }
  };

  // Calculate daily stats
  const totalBlocks = currentScheduleDay.blocks.length;
  const completedBlocksCount = currentScheduleDay.blocks.filter((b) =>
    isBlockChecked(dailyLog.blockCompletions, b.id)
  ).length;
  const dailyProgressPercent = totalBlocks > 0 ? Math.round((completedBlocksCount / totalBlocks) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Game Break Ending Soon Alert Nudge */}
      {scheduleState.isGameEndingSoon && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-violet-900/90 to-purple-900/90 border border-violet-500/50 text-white shadow-xl shadow-violet-500/20 flex items-center justify-between gap-4 animate-bounce">
          <div className="flex items-center gap-3">
            <Gamepad2 className="w-6 h-6 text-violet-300" />
            <div>
              <p className="font-bold text-sm text-violet-100">Game time ending soon! 🎮</p>
              <p className="text-xs text-violet-300">
                Only {formatCountdown(scheduleState.secondsRemaining)} left in your break. Time to wind up your game!
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-violet-950/60 rounded-full text-xs font-mono font-bold text-violet-200">
            {formatCountdown(scheduleState.secondsRemaining)}
          </span>
        </div>
      )}

      {/* Main Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-10">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-80 h-80 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />

        {/* Top Header info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold uppercase tracking-wider">
                {currentScheduleDay.title}
              </span>
              <span className="text-xs text-slate-300 font-medium">
                {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 mt-2 tracking-tight">
              Right Now Task
            </h2>
          </div>

          {/* Progress Pill */}
          <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <div className="text-right">
              <p className="text-xs text-slate-300 font-semibold">Today's Progress</p>
              <p className="text-sm font-black text-blue-400">
                {completedBlocksCount} / {totalBlocks} blocks done
              </p>
            </div>
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="4" className="text-slate-800" />
                <circle
                  cx="24" cy="24" r="20" fill="none"
                  strokeWidth="4"
                  strokeLinecap="round"
                  className="text-blue-500 transition-all duration-700"
                  style={{
                    strokeDasharray: `${2 * Math.PI * 20}`,
                    strokeDashoffset: `${2 * Math.PI * 20 * (1 - dailyProgressPercent / 100)}`,
                    stroke: dailyProgressPercent >= 80 ? '#10b981' : dailyProgressPercent >= 40 ? '#3b82f6' : '#6366f1',
                  }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-200">
                {dailyProgressPercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Hero Content Based on State */}
        {scheduleState.status === 'active_block' && activeBlock ? (
          <div className="mt-8 space-y-8">
            {/* Countdown Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-3xl bg-slate-950 border border-slate-800/80">
              <div>
                <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">
                  Time Remaining in Block
                </span>
                <div className="text-6xl sm:text-7xl font-black font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 mt-1">
                  {formatCountdown(scheduleState.secondsRemaining)}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full md:w-64 space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-400">
                  <span>Block Progress</span>
                  <span>{Math.round(scheduleState.progressPercent)}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000"
                    style={{ width: `${scheduleState.progressPercent}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-300 text-right font-mono">
                  {activeBlock.startTime} – {activeBlock.endTime}
                </p>
              </div>
            </div>

            {/* Current Task Detail Card */}
            <div
              className={`p-6 sm:p-8 rounded-3xl border transition shadow-xl ${
                activeBlock.type === 'game'
                  ? 'bg-gradient-to-r from-violet-950/40 via-purple-900/30 to-slate-900 border-violet-500/40 shadow-violet-500/10'
                  : 'bg-gradient-to-r from-slate-900 via-slate-850 to-blue-950/20 border-slate-700/80'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  {(() => {
                    const badge = getBlockTypeBadge(activeBlock.type);
                    return (
                      <span className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${badge.bg}`}>
                        {badge.icon}
                        {badge.label}
                      </span>
                    );
                  })()}

                  {activeSubject && (
                    <span
                      className="px-3 py-1 rounded-xl text-xs font-bold text-white shadow-sm flex items-center gap-1.5"
                      style={{ backgroundColor: activeSubject.color }}
                    >
                      {activeSubject.name}
                    </span>
                  )}
                </div>

                {/* Checkbox button evaluated with getBlockLockStatus & canUntick */}
                {(() => {
                  const lockStatus = getBlockLockStatus(activeBlock, todayStr, now, dailyLog.blockCompletions);
                  const isLocked = lockStatus === 'locked' && !isCompleted;
                  const isNotActive = lockStatus === 'not_yet_active' && !isCompleted;
                  const checkedAtIso = getBlockCheckedAt(dailyLog.blockCompletions, activeBlock.id);
                  const isUntickLocked = isCompleted && !canUntickCompletedBlock(checkedAtIso, now);

                  return (
                    <button
                      onClick={() => !isLocked && !isNotActive && !isUntickLocked && handleToggleCompletion(activeBlock.id)}
                      disabled={isLocked || isNotActive || isUntickLocked}
                      title={
                        isUntickLocked
                          ? 'Completed check locked permanently (30m untick window passed)'
                          : isNotActive
                          ? `Starts at ${activeBlock.startTime}`
                          : isLocked
                          ? 'Grace period (60m) expired — Locked Missed'
                          : ''
                      }
                      className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition transform active:scale-95 border ${
                        isCompleted
                          ? isUntickLocked
                            ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300 cursor-not-allowed'
                            : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                          : isLocked
                          ? 'bg-rose-950/30 border-rose-500/50 text-rose-300 cursor-not-allowed'
                          : isNotActive
                          ? 'bg-slate-900 border-slate-800 text-slate-400 cursor-not-allowed'
                          : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                      }`}
                    >
                      {isLocked || isUntickLocked ? (
                        <Lock className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <CheckCircle2 className={`w-4 h-4 ${isCompleted ? 'text-emerald-400 fill-emerald-500/20' : ''}`} />
                      )}
                      {isCompleted
                        ? isUntickLocked
                          ? 'Completed (Locked 🔒)'
                          : 'Marked Completed 🎉'
                        : isLocked
                        ? 'Locked Missed'
                        : isNotActive
                        ? `Starts at ${activeBlock.startTime}`
                        : 'Mark Block Done'}
                    </button>
                  );
                })()}
              </div>

              <h3 className="text-2xl sm:text-4xl font-black text-slate-100 tracking-tight leading-tight">
                {activeBlock.label}
              </h3>

              {/* Anti-anxiety Action Bar */}
              <div className="mt-6 flex flex-wrap items-center gap-3 pt-6 border-t border-slate-800/80">
                <button
                  onClick={() => setIsJustStartOpen(true)}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition transform active:scale-95"
                >
                  <Sparkles className="w-4 h-4 fill-current" />
                  Stuck / Anxious? Just Start 🚀
                </button>

                {activeBlock.type === 'study' && (
                  <button
                    onClick={() => setActiveTab('timer')}
                    className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-blue-300 text-xs font-bold transition"
                  >
                    <Clock className="w-4 h-4" />
                    Open Pomodoro Focus Timer
                  </button>
                )}
              </div>
            </div>

            {/* Next Task Preview */}
            {scheduleState.nextBlock && (
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-slate-300 text-xs font-medium">
                <span className="uppercase font-bold tracking-wider text-slate-400">Up Next:</span>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-100">{scheduleState.nextBlock.label}</span>
                  <span className="font-mono text-slate-300">{scheduleState.nextBlock.startTime}</span>
                </div>
              </div>
            )}
          </div>
        ) : scheduleState.status === 'free_time' ? (
          /* Free Time State */
          <div className="mt-8 p-8 rounded-3xl bg-slate-950 border border-slate-800 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto text-2xl">
              ☕
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-100">Free Time Right Now</h3>
            <p className="text-sm text-slate-300 max-w-md mx-auto">
              You are currently between scheduled study blocks. Take a breath, grab water, or relax!
            </p>
            <div className="py-4 font-mono text-4xl sm:text-5xl font-black text-emerald-400">
              {formatCountdown(scheduleState.secondsRemaining)}
            </div>
            <p className="text-xs text-slate-400">Time until next block starts</p>

            {scheduleState.nextBlock && (
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-200 mt-2">
                <span className="text-slate-400 font-semibold">Next block:</span>
                <span className="font-bold text-slate-100">{scheduleState.nextBlock.label}</span>
                <span className="font-mono text-blue-400">({scheduleState.nextBlock.startTime})</span>
              </div>
            )}
          </div>
        ) : (
          /* Day Complete State */
          <div className="mt-8 p-8 rounded-3xl bg-gradient-to-br from-blue-950/40 via-slate-900 to-indigo-950/40 border border-blue-500/30 text-center space-y-4 shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center justify-center mx-auto text-4xl shadow-xl">
              🌟
            </div>
            <h3 className="text-3xl sm:text-4xl font-black text-slate-100 tracking-tight">
              Schedule Completed For Today!
            </h3>
            <p className="text-sm text-slate-200 max-w-md mx-auto">
              Fantastic work sticking to your rotation schedule! Rest up and get a good night’s sleep to recharge for tomorrow.
            </p>
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-amber-400 pt-2">
              <Flame className="w-4 h-4 fill-current" />
              <span>Streak Maintained</span>
            </div>
          </div>
        )}
      </div>

      {/* Today's Full Schedule Timeline Drawer - High Contrast & Fully Legible */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            Today's Rotating Timeline ({currentScheduleDay.title})
          </h3>
          <span className="text-xs text-slate-300 font-mono">
            {completedBlocksCount} of {totalBlocks} done
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {currentScheduleDay.blocks.map((b) => {
            const isBlockDone = isBlockChecked(dailyLog.blockCompletions, b.id);
            const checkedAtIso = getBlockCheckedAt(dailyLog.blockCompletions, b.id);
            const isCurrent = activeBlock?.id === b.id;
            const subj = subjects.find((s) => s.id === b.subjectId);
            const badge = getBlockTypeBadge(b.type);

            // Time-bound lock status & untick lock check
            const lockStatus = getBlockLockStatus(b, todayStr, now, dailyLog.blockCompletions);
            const isLocked = lockStatus === 'locked' && !isBlockDone;
            const isNotActive = lockStatus === 'not_yet_active' && !isBlockDone;
            const isUntickLocked = isBlockDone && !canUntickCompletedBlock(checkedAtIso, now);

            return (
              <div
                key={b.id}
                onClick={() => !isLocked && !isNotActive && !isUntickLocked && handleToggleCompletion(b.id)}
                className={`p-3.5 rounded-2xl border transition flex items-start justify-between gap-3 ${
                  isCurrent
                    ? 'bg-blue-950/80 border-blue-500 shadow-lg shadow-blue-500/20'
                    : isBlockDone
                    ? 'bg-slate-950 border-emerald-500/50'
                    : isLocked
                    ? 'bg-slate-950 border-rose-500/40'
                    : isNotActive
                    ? 'bg-slate-950 border-slate-800'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 cursor-pointer'
                }`}
                title={
                  isUntickLocked
                    ? 'Completed check locked (30m untick window passed)'
                    : isNotActive
                    ? `Not active yet (starts at ${b.startTime})`
                    : isLocked
                    ? 'Grace period (60m) expired — Locked Missed'
                    : ''
                }
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-300 font-bold">
                      {b.startTime} - {b.endTime}
                    </span>
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${badge.bg}`}>
                      {badge.label}
                    </span>
                  </div>
                  {/* Block Title - Always 100% Bright & Legible */}
                  <h4 className={`text-xs font-bold text-slate-100 ${isBlockDone ? 'line-through text-slate-400' : ''}`}>
                    {b.label}
                  </h4>
                  {subj && (
                    <span
                      className="inline-block px-2 py-0.5 rounded text-[10px] font-bold text-white"
                      style={{ backgroundColor: subj.color }}
                    >
                      {subj.name}
                    </span>
                  )}
                </div>

                <div className="pt-0.5">
                  {isBlockDone ? (
                    isUntickLocked ? (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-1 rounded-xl border border-emerald-500/40" title="Locked Completed (30m passed)">
                        <Lock className="w-3.5 h-3.5 text-emerald-400" /> Done
                      </div>
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                    )
                  ) : isLocked ? (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-rose-300 bg-rose-500/20 px-2 py-1 rounded-xl border border-rose-500/40">
                      <Lock className="w-3.5 h-3.5 text-rose-400" /> Locked
                    </div>
                  ) : isNotActive ? (
                    <div className="text-[10px] font-bold text-slate-300 bg-slate-900 px-2 py-1 rounded-xl border border-slate-800">
                      {b.startTime}
                    </div>
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-slate-400 hover:text-slate-200 cursor-pointer" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Just Start Anti-Anxiety Modal */}
      <JustStartModal
        isOpen={isJustStartOpen}
        onClose={() => setIsJustStartOpen(false)}
        currentBlock={activeBlock}
        subject={activeSubject ?? null}
        onCompleteBlock={() => activeBlock && handleToggleCompletion(activeBlock.id)}
      />
    </div>
  );
};
