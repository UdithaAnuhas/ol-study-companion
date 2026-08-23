import React from 'react';
import { Play, Pause, RotateCcw, CheckCircle2, Star, MessageSquare, Flame, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getFormattedDateString } from '../utils/scheduleEngine';

export const FocusTimerView: React.FC = () => {
  const {
    subjects,
    timerSecondsLeft,
    timerTotalSeconds,
    timerIsRunning,
    timerPresetMins,
    timerSelectedSubjectId,
    timerCompletedSessionsCount,
    setTimerSelectedSubjectId,
    startFocusTimer,
    pauseFocusTimer,
    resetFocusTimer,
    completeFocusTimerEarly,
    setFocusTimerPreset,
    dailyLogs,
  } = useApp();

  const selectedSubject = subjects.find((s) => s.id === timerSelectedSubjectId);

  const formatSecs = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = timerTotalSeconds > 0 ? ((timerTotalSeconds - timerSecondsLeft) / timerTotalSeconds) * 100 : 0;
  const strokeDashoffset = 565 - (565 * progressPercent) / 100;

  // Retrieve today's completed focus sessions
  const todayStr = getFormattedDateString();
  const todaySessions = dailyLogs[todayStr]?.focusSessions || [];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Title */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-slate-100 tracking-tight">Focused Study Timer</h2>
        <p className="text-sm text-slate-400">
          Pomodoro technique: work deeply with zero distractions, then reflect on what you accomplished.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Options Panel */}
        <div className="space-y-4 rounded-3xl bg-slate-900 border border-slate-800 p-6">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Session Setup</h3>

          {/* Subject Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400">Select Subject to Log</label>
            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              {subjects.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setTimerSelectedSubjectId(s.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-2xl border text-xs font-semibold transition ${
                    timerSelectedSubjectId === s.id
                      ? 'bg-blue-600/20 border-blue-500 text-blue-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                    <span>{s.name}</span>
                  </div>
                  {s.isFinished && <span className="text-[10px] text-amber-400 font-bold">👑 A Ready</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Duration Presets */}
          <div className="space-y-2.5 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-400">Timer Duration</label>
              <span className="text-xs font-mono font-bold text-amber-300">
                {timerPresetMins} Mins
              </span>
            </div>

            {/* Quick Presets Grid */}
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { mins: 5, label: '5m ☕' },
                { mins: 10, label: '10m' },
                { mins: 15, label: '15m' },
                { mins: 20, label: '20m' },
                { mins: 25, label: '25m 🎯' },
                { mins: 30, label: '30m' },
                { mins: 45, label: '45m' },
                { mins: 60, label: '60m (1h)' },
                { mins: 90, label: '90m (1.5h)' },
                { mins: 120, label: '120m (2h)' },
              ].map(({ mins, label }) => (
                <button
                  key={mins}
                  onClick={() => setFocusTimerPreset(mins)}
                  className={`py-1.5 px-2 rounded-xl border text-[11px] font-bold transition ${
                    timerPresetMins === mins
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm shadow-amber-500/10'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Custom Minutes Input */}
            <div className="pt-1.5">
              <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-400 font-semibold pl-1.5">Custom:</span>
                <input
                  type="number"
                  min="1"
                  max="300"
                  placeholder="e.g. 40"
                  value={timerPresetMins}
                  onChange={(e) => {
                    const val = Math.max(1, Math.min(300, Number(e.target.value) || 1));
                    setFocusTimerPreset(val);
                  }}
                  className="w-full bg-slate-900 text-slate-100 text-xs font-mono font-bold px-2 py-1 rounded-lg border border-slate-700 focus:outline-none focus:border-amber-400 text-center"
                />
                <span className="text-[11px] text-slate-400 pr-1.5">mins</span>
              </div>
            </div>
          </div>

          {/* Daily Completed Focus Sessions Counter */}
          <div className="pt-2 border-t border-slate-800">
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <p className="text-[11px] font-semibold text-slate-400">Completed Focus Sessions Today</p>
              <p className="text-xl font-black text-amber-400 mt-0.5">
                {todaySessions.length} Sessions
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                Total:{' '}
                {todaySessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0)} mins focused
              </p>
            </div>
          </div>
        </div>

        {/* Right Main Timer Display */}
        <div className="md:col-span-2 rounded-3xl bg-slate-900 border border-slate-800 p-8 flex flex-col items-center justify-center space-y-8 relative overflow-hidden shadow-2xl">
          {/* Subtle Ambient Backlight Glow */}
          <div
            className="absolute w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-1000"
            style={{
              backgroundColor: selectedSubject ? selectedSubject.color : '#3b82f6',
            }}
          />

          {/* Circular SVG Timer */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
              {/* Background Track Circle */}
              <circle
                cx="100"
                cy="100"
                r="90"
                stroke="currentColor"
                strokeWidth="10"
                fill="transparent"
                className="text-slate-950"
              />
              {/* Animated Progress Ring */}
              <circle
                cx="100"
                cy="100"
                r="90"
                stroke={selectedSubject ? selectedSubject.color : '#3b82f6'}
                strokeWidth="10"
                strokeDasharray="565"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-linear"
              />
            </svg>

            {/* Centered Digital Countdown Clock */}
            <div className="absolute flex flex-col items-center justify-center text-center space-y-1">
              <span className="text-5xl sm:text-6xl font-mono font-black tracking-tighter text-slate-100">
                {formatSecs(timerSecondsLeft)}
              </span>

              {selectedSubject && (
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedSubject.color }} />
                  <span className="text-xs font-bold text-slate-300">
                    {selectedSubject.name}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3 z-10">
            {timerIsRunning ? (
              <button
                onClick={pauseFocusTimer}
                className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/20 transition transform active:scale-95"
              >
                <Pause className="w-4 h-4 fill-current" />
                Pause Focus Session
              </button>
            ) : (
              <button
                onClick={startFocusTimer}
                className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-blue-500/30 transition transform active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                Start Focus Session
              </button>
            )}

            <button
              onClick={resetFocusTimer}
              className="p-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition"
              title="Reset Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* TODAY'S FOCUS SESSIONS REFLECTION FEED */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-400" />
            <span>Today's Focus Log & Reflection Notes</span>
          </h3>
          <span className="text-xs font-mono font-bold text-slate-400">
            {todaySessions.length} Session{todaySessions.length === 1 ? '' : 's'} Logged
          </span>
        </div>

        {todaySessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {todaySessions.map((session, idx) => {
              const subj = subjects.find((s) => s.id === session.subjectId);
              const sessionTime = new Date(session.startedAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={session.id || idx}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2.5 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {session.subjectIds && session.subjectIds.length > 0 ? (
                        session.subjectIds.map((sId) => {
                          const sObj = subjects.find((s) => s.id === sId);
                          return (
                            <span
                              key={sId}
                              className="inline-flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800 text-[11px] font-bold text-slate-200"
                            >
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: sObj?.color || '#3b82f6' }}
                              />
                              <span>{sObj?.name || 'Subject'}</span>
                            </span>
                          );
                        })
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: subj?.color || '#3b82f6' }}
                          />
                          <span className="font-bold text-slate-200 text-xs">
                            {subj?.name || 'General Study'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                      <span>{sessionTime}</span>
                      <span className="px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-300 font-bold border border-blue-500/20">
                        {session.durationMinutes} mins
                      </span>
                    </div>
                  </div>

                  {/* Reflection Notes Description */}
                  <div className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60">
                    <p className="font-medium text-slate-200">
                      {session.notes && session.notes.trim().length > 0 ? (
                        `"${session.notes}"`
                      ) : (
                        <span className="italic text-slate-400">No notes written for this session</span>
                      )}
                    </p>
                  </div>

                  {/* Star Rating Badge */}
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/60">
                    <span className="text-slate-400 font-semibold flex items-center gap-1">
                      <Flame className="w-3 h-3 text-amber-400" /> Focus Quality:
                    </span>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= (session.focusRating || 5)
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 space-y-2">
            <Clock className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs font-semibold text-slate-400">No focus sessions completed yet today.</p>
            <p className="text-[11px] text-slate-500">
              Start a 25-minute timer above to log your deep work and rate your focus!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
