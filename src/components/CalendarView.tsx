import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Flag,
  BarChart2,
  CalendarDays,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  evaluateDayStatus,
  generateWeeklyReview,
  generateMonthlyReview,
} from '../utils/calendarEngine';
import { getFormattedDateString } from '../utils/scheduleEngine';
import { DayDetailModal } from './DayDetailModal';

export const CalendarView: React.FC = () => {
  const { examDate, dailyLogs, schedule, subjects } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'calendar' | 'weekly' | 'monthly'>('calendar');
  const [currentViewDate, setCurrentViewDate] = useState<Date>(new Date());
  const [selectedDateForDetail, setSelectedDateForDetail] = useState<string | null>(null);

  const year = currentViewDate.getFullYear();
  const month = currentViewDate.getMonth();

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentViewDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentViewDate(new Date());
  };

  // Calendar Grid Calculation
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const todayStr = getFormattedDateString();

  // Build calendar matrix cells
  const calendarCells: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

  // Padding preceding days from prev month
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const prevDateObj = new Date(year, month - 1, d);
    calendarCells.push({
      dateStr: getFormattedDateString(prevDateObj),
      dayNum: d,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const currDateObj = new Date(year, month, d);
    calendarCells.push({
      dateStr: getFormattedDateString(currDateObj),
      dayNum: d,
      isCurrentMonth: true,
    });
  }

  // Padding trailing days for complete 35 or 42 grid
  const remainingCells = 42 - calendarCells.length;
  for (let d = 1; d <= remainingCells; d++) {
    const nextDateObj = new Date(year, month + 1, d);
    calendarCells.push({
      dateStr: getFormattedDateString(nextDateObj),
      dayNum: d,
      isCurrentMonth: false,
    });
  }

  // Selected date's log & schedule day for detail modal
  const selectedLog = selectedDateForDetail ? dailyLogs[selectedDateForDetail] : undefined;
  const selectedDayNum = selectedLog?.rotationDay || 1;
  const selectedScheduleDay = schedule.find((s) => s.dayNumber === selectedDayNum) || schedule[0];

  // Generate Weekly Reviews for last 4 calendar weeks (Mon-Sun)
  const weeklyReviewsList = Array.from({ length: 4 }, (_, weekIndex) => {
    const todayObj = new Date();
    const dayOfWeek = todayObj.getDay(); // 0 = Sun, 1 = Mon, ...
    const distToMon = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    // Calculate exact Monday date for (weekIndex) weeks ago
    const monOfWeek = new Date(
      todayObj.getFullYear(),
      todayObj.getMonth(),
      todayObj.getDate() - distToMon - weekIndex * 7
    );
    const startStr = getFormattedDateString(monOfWeek);

    return generateWeeklyReview(startStr, dailyLogs, schedule, subjects);
  });

  // Current Month Review
  const currentMonthReview = generateMonthlyReview(
    year,
    month,
    dailyLogs,
    schedule,
    subjects,
    examDate
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* View Header & Crisp Sub-Tab Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-3xl font-black text-slate-100 tracking-tight">Exam Calendar & Progress Reviews</h2>
          <p className="text-sm text-slate-300">Track daily consistency and review progress over time</p>
        </div>

        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setActiveSubTab('calendar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeSubTab === 'calendar'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700'
            }`}
          >
            <CalendarIcon className="w-4 h-4 text-blue-400" /> Calendar Grid
          </button>
          <button
            onClick={() => setActiveSubTab('weekly')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeSubTab === 'weekly'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700'
            }`}
          >
            <CalendarDays className="w-4 h-4 text-amber-400" /> Weekly Reviews
          </button>
          <button
            onClick={() => setActiveSubTab('monthly')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeSubTab === 'monthly'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700'
            }`}
          >
            <BarChart2 className="w-4 h-4 text-emerald-400" /> Monthly Reviews
          </button>
        </div>
      </div>

      {/* --- SUB TAB 1: MONTH CALENDAR GRID --- */}
      {activeSubTab === 'calendar' && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-6 shadow-2xl">
          {/* Calendar Month Header & Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-black text-slate-100 font-sans">
                {new Date(year, month, 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h3>
              <button
                onClick={handleToday}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700"
              >
                Today
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-800 text-xs text-slate-300">
            <span className="font-semibold text-slate-200">Legend:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span>Complete ($\ge 80\%$)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span>Partial ($1-79\%$)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span>Missed ($0\%$)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full border-2 border-blue-400 bg-blue-500/20" />
              <span>Today</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Flag className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>O/L Exam Day (Dec 6)</span>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-300 uppercase tracking-wider">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 gap-2">
            {calendarCells.map((cell) => {
              const isToday = cell.dateStr === todayStr;
              const isExamDay = cell.dateStr === examDate;
              const log = dailyLogs[cell.dateStr];
              const rotationNum = log?.rotationDay || 1;
              const schedDay = schedule.find((s) => s.dayNumber === rotationNum) || schedule[0];

              const statusObj = evaluateDayStatus(cell.dateStr, log, schedDay);

              return (
                <div
                  key={cell.dateStr}
                  onClick={() => cell.isCurrentMonth && setSelectedDateForDetail(cell.dateStr)}
                  className={`min-h-[80px] sm:min-h-[95px] p-2 rounded-2xl border transition flex flex-col justify-between cursor-pointer ${
                    !cell.isCurrentMonth
                      ? 'bg-slate-950/40 border-slate-900 text-slate-500'
                      : isToday
                      ? 'bg-blue-950/60 border-blue-500 shadow-md shadow-blue-500/20'
                      : isExamDay
                      ? 'bg-amber-950/40 border-amber-500 shadow-md shadow-amber-500/20'
                      : statusObj.status === 'complete'
                      ? 'bg-emerald-950/30 border-emerald-500/50 hover:border-emerald-400'
                      : statusObj.status === 'partial'
                      ? 'bg-amber-950/30 border-amber-500/50 hover:border-amber-400'
                      : statusObj.status === 'missed'
                      ? 'bg-rose-950/30 border-rose-500/50 hover:border-rose-400'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold font-mono ${
                        isToday ? 'text-blue-300 text-sm' : cell.isCurrentMonth ? 'text-slate-100' : 'text-slate-500'
                      }`}
                    >
                      {cell.dayNum}
                    </span>

                    {isExamDay && (
                      <span className="p-1 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40" title="O/L Exam Day">
                        <Flag className="w-3.5 h-3.5 fill-current" />
                      </span>
                    )}
                  </div>

                  {cell.isCurrentMonth && (
                    <div className="mt-1 space-y-1">
                      {statusObj.status === 'complete' && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded-md border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>100% Done</span>
                        </div>
                      )}
                      {statusObj.status === 'partial' && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded-md border border-amber-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          <span>{statusObj.completionPercent}%</span>
                        </div>
                      )}
                      {statusObj.status === 'missed' && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-rose-300 bg-rose-500/20 px-1.5 py-0.5 rounded-md border border-rose-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                          <span>0% Missed</span>
                        </div>
                      )}
                      {statusObj.status === 'today' && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-blue-200 bg-blue-500/20 px-1.5 py-0.5 rounded-md border border-blue-500/40">
                          <span>Live: {statusObj.completionPercent}%</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- SUB TAB 2: WEEKLY REVIEWS HISTORY --- */}
      {activeSubTab === 'weekly' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800">
            <h3 className="text-base font-bold text-slate-100">Weekly Performance History</h3>
            <p className="text-xs text-slate-300">Automated factual summaries per 7-day period</p>
          </div>

          <div className="space-y-4">
            {weeklyReviewsList.map((wk, idx) => (
              <div
                key={wk.id}
                className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold">
                      {idx === 0 ? 'Current Week' : `Week -${idx}`}
                    </span>
                    <span className="text-xs font-mono text-slate-300">
                      {wk.weekStartDate} to {wk.weekEndDate}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-bold">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {wk.completeDays} Complete
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {wk.partialDays} Partial
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {wk.missedDays} Missed
                    </span>
                  </div>
                </div>

                {/* Factual Summary Line */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-sm font-semibold text-slate-100">
                  "{wk.summaryLine}"
                </div>

                {/* Science & ICT Backlog Progress */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-300 font-semibold">Science Backlog:</span>
                    <span className="font-bold text-cyan-300 font-mono">
                      {wk.backlogProgress.scienceWatched} Watched / {wk.backlogProgress.scienceRemaining} Remaining
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-300 font-semibold">ICT Backlog:</span>
                    <span className="font-bold text-cyan-300 font-mono">
                      {wk.backlogProgress.ictWatched} Watched / {wk.backlogProgress.ictRemaining} Remaining
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- SUB TAB 3: MONTHLY REVIEWS HISTORY --- */}
      {activeSubTab === 'monthly' && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-xl font-bold text-slate-100">
                  {currentMonthReview.monthName} {currentMonthReview.year} Review
                </h3>
                <p className="text-xs text-slate-300">Month-over-month study hours and countdown context</p>
              </div>

              <div className="px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold font-mono">
                {currentMonthReview.daysUntilExam} Days to O/L Exam
              </div>
            </div>

            {/* Factual Summary Line */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-sm font-semibold text-slate-100">
              "{currentMonthReview.summaryLine}"
            </div>

            {/* Subject Hour Bars */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Total Focus Hours per Subject this Month
              </h4>
              <div className="space-y-2">
                {subjects.map((subj) => {
                  const hrs = currentMonthReview.totalHoursBySubject[subj.id] || 0;
                  return (
                    <div key={subj.id} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-200 flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: subj.color }} />
                          {subj.name}
                        </span>
                        <span className="font-mono text-slate-300">{hrs.toFixed(1)} hrs</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, (hrs / 20) * 100)}%`,
                            backgroundColor: subj.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Day Detail Modal for Clicked Date */}
      <DayDetailModal
        isOpen={!!selectedDateForDetail}
        onClose={() => setSelectedDateForDetail(null)}
        dateStr={selectedDateForDetail || ''}
        dailyLog={selectedLog}
        scheduleDay={selectedScheduleDay}
        subjects={subjects}
      />
    </div>
  );
};
