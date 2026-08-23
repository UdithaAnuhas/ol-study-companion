import type {
  ScheduleDay,
  DailyLog,
  Subject,
  DayStatus,
  DayStatusType,
  WeeklyReviewData,
  MonthlyReviewData,
} from '../types';
import { getFormattedDateString, isBlockChecked, ROTATION_ANCHOR_DATE } from './scheduleEngine';

// --- CONFIGURABLE COMPLETION RULE CONSTANTS ---
export const COMPLETE_THRESHOLD_PERCENT = 80; // 80% or more study blocks done = Complete
export const PARTIAL_THRESHOLD_PERCENT = 1;   // 1% to 79% study blocks done = Partial
export const EXAM_INTENSIFY_DAYS_THRESHOLD = 14; // Countdown visually intensifies when <= 14 days

/**
 * Calculates calendar days remaining until the O/L exam (inclusive of today).
 */
export function calculateDaysUntilExam(examDateStr: string, currentDate: Date = new Date()): number {
  if (!examDateStr) return 0;

  const [year, month, day] = examDateStr.split('-').map(Number);
  const examDate = new Date(year, (month || 1) - 1, day || 1);

  // Normalize times to midnight for accurate calendar day count
  const startOfToday = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
  const startOfExam = new Date(examDate.getFullYear(), examDate.getMonth(), examDate.getDate());

  const diffMs = startOfExam.getTime() - startOfToday.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  // Inclusive of today: if exam is today (diffDays === 0), 1 day remains.
  return Math.max(0, diffDays + 1);
}

/**
 * Calculates live days, hours, minutes, and seconds until the O/L exam date.
 */
export function calculateDetailedExamCountdown(
  examDateStr: string,
  currentDate: Date = new Date()
): { days: number; hours: number; minutes: number; seconds: number; totalSeconds: number } {
  if (!examDateStr) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 };
  }

  const [year, month, day] = examDateStr.split('-').map(Number);
  // Target exam date at 08:30 AM on December 6
  const examTarget = new Date(year, (month || 1) - 1, day || 1, 8, 30, 0, 0);

  const diffMs = examTarget.getTime() - currentDate.getTime();
  if (diffMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
    totalSeconds,
  };
}

/**
 * Evaluates the completion status of a specific date based strictly on STUDY blocks.
 * (Excludes rest, meal, break, and game blocks from the completion ratio).
 */
export function evaluateDayStatus(
  dateStr: string,
  dailyLog: DailyLog | undefined,
  scheduleDay: ScheduleDay | undefined,
  currentDate: Date = new Date()
): DayStatus {
  const todayStr = getFormattedDateString(currentDate);
  const anchorStr = getFormattedDateString(ROTATION_ANCHOR_DATE);

  // Days before the app launch anchor are not tracked — treat as empty (future)
  if (dateStr < anchorStr) {
    return {
      date: dateStr,
      status: 'future',
      completionPercent: 0,
      completedStudyBlocks: 0,
      totalStudyBlocks: 0,
    };
  }

  if (!scheduleDay || !scheduleDay.blocks || scheduleDay.blocks.length === 0) {
    const isPast = dateStr < todayStr;
    const isToday = dateStr === todayStr;
    return {
      date: dateStr,
      status: isToday ? 'today' : isPast ? 'missed' : 'future',
      completionPercent: 0,
      completedStudyBlocks: 0,
      totalStudyBlocks: 0,
    };
  }

  // Filter ONLY study blocks (exclude rest, break, meal, game)
  const studyBlocks = scheduleDay.blocks.filter((b) => b.type === 'study');
  const totalStudyBlocks = studyBlocks.length;

  if (totalStudyBlocks === 0) {
    const isPast = dateStr < todayStr;
    const isToday = dateStr === todayStr;
    return {
      date: dateStr,
      status: isToday ? 'today' : isPast ? 'complete' : 'future',
      completionPercent: 100,
      completedStudyBlocks: 0,
      totalStudyBlocks: 0,
    };
  }

  const completions = dailyLog?.blockCompletions || {};
  const completedStudyBlocks = studyBlocks.filter((b) => isBlockChecked(completions, b.id)).length;
  const completionPercent = Math.round((completedStudyBlocks / totalStudyBlocks) * 100);

  const isToday = dateStr === todayStr;
  const isFuture = dateStr > todayStr;

  let status: DayStatusType;

  if (isFuture) {
    status = 'future';
  } else if (isToday) {
    status = 'today';
  } else {
    // Past date verdict based on named thresholds
    if (completionPercent >= COMPLETE_THRESHOLD_PERCENT) {
      status = 'complete';
    } else if (completionPercent >= PARTIAL_THRESHOLD_PERCENT) {
      status = 'partial';
    } else {
      status = 'missed';
    }
  }

  return {
    date: dateStr,
    status,
    completionPercent,
    completedStudyBlocks,
    totalStudyBlocks,
  };
}

/**
 * Generates factual Weekly Review summary data for a given 7-day calendar window (Mon–Sun).
 * Strictly filters DailyLogs by exact date string within [weekStartDateStr ... weekEndDateStr].
 */
export function generateWeeklyReview(
  weekStartDateStr: string,
  dailyLogs: Record<string, DailyLog>,
  schedule: ScheduleDay[],
  subjects: Subject[],
  currentDate: Date = new Date()
): WeeklyReviewData {
  const [startYear, startMonth, startDay] = weekStartDateStr.split('-').map(Number);
  const startDate = new Date(startYear, startMonth - 1, startDay);

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);
  const weekEndDateStr = getFormattedDateString(endDate);

  let completeDays = 0;
  let partialDays = 0;
  let missedDays = 0;
  const totalMinutesBySubject: Record<string, number> = {};

  subjects.forEach((s) => {
    totalMinutesBySubject[s.id] = 0;
  });

  let sciWatchedInWeek = 0;
  let ictWatchedInWeek = 0;

  // Iterate strictly through each date of this specific week range
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const dateStr = getFormattedDateString(d);

    // Exact date lookup in dailyLogs map
    const log = dailyLogs[dateStr];
    const dayRotation = log?.rotationDay || (i % 7) + 1;
    const scheduleDay = schedule.find((s) => s.dayNumber === dayRotation) || schedule[0];

    const dayStatus = evaluateDayStatus(dateStr, log, scheduleDay, currentDate);

    if (dateStr <= getFormattedDateString(currentDate)) {
      if (dayStatus.status === 'complete') completeDays++;
      else if (dayStatus.status === 'partial') partialDays++;
      else if (dayStatus.status === 'missed') missedDays++;
    }

    if (log && log.focusSessions) {
      log.focusSessions.forEach((fs) => {
        if (fs.completed) {
          totalMinutesBySubject[fs.subjectId] = (totalMinutesBySubject[fs.subjectId] || 0) + fs.durationMinutes;
        }
      });
    }

    if (log && log.blockCompletions) {
      scheduleDay.blocks.forEach((b) => {
        if (isBlockChecked(log.blockCompletions, b.id)) {
          if (b.subjectId === 'subj-science') sciWatchedInWeek++;
          if (b.subjectId === 'subj-ict') ictWatchedInWeek++;
        }
      });
    }
  }

  // Science & ICT total backlog stats
  const sciSubj = subjects.find((s) => s.id === 'subj-science');
  const ictSubj = subjects.find((s) => s.id === 'subj-ict');

  const sciTotal = sciSubj?.recordingsTotal || 42;
  const ictTotal = ictSubj?.recordingsTotal || 30;

  const sciRemaining = Math.max(0, sciTotal - (sciSubj?.recordingsWatched || 0));
  const ictRemaining = Math.max(0, ictTotal - (ictSubj?.recordingsWatched || 0));

  // Identify 1-2 active subjects with lowest study time in THIS specific week
  const activeSubjects = subjects.filter((s) => !s.isFinished);
  const sortedByTime = [...activeSubjects].sort(
    (a, b) => (totalMinutesBySubject[a.id] || 0) - (totalMinutesBySubject[b.id] || 0)
  );
  const lowestSubjectIds = sortedByTime.slice(0, 2).map((s) => s.id);
  const lowestSubjName = sortedByTime[0]?.name || 'a core subject';

  const sciPercentCleared = sciTotal > 0 ? Math.round(((sciSubj?.recordingsWatched || 0) / sciTotal) * 100) : 0;
  const summaryLine = `${completeDays} of 7 days completed. Science backlog is ${sciPercentCleared}% cleared. ${lowestSubjName} recorded the least study time this week.`;

  return {
    id: `wk-${weekStartDateStr}`,
    weekStartDate: weekStartDateStr,
    weekEndDate: weekEndDateStr,
    totalMinutesBySubject,
    completeDays,
    partialDays,
    missedDays,
    backlogProgress: {
      scienceWatched: sciWatchedInWeek,
      scienceRemaining: sciRemaining,
      ictWatched: ictWatchedInWeek,
      ictRemaining: ictRemaining,
    },
    lowestSubjectIds,
    summaryLine,
  };
}

/**
 * Generates factual Monthly Review data for a specific calendar month.
 * Filters DailyLogs strictly by month dates [year-month-01 ... year-month-end].
 */
export function generateMonthlyReview(
  year: number,
  month: number, // 0 to 11
  dailyLogs: Record<string, DailyLog>,
  schedule: ScheduleDay[],
  subjects: Subject[],
  examDateStr: string,
  currentDate: Date = new Date()
): MonthlyReviewData {
  const monthDate = new Date(year, month, 1);
  const monthName = monthDate.toLocaleString('default', { month: 'long' });
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let completeDays = 0;
  let partialDays = 0;
  let missedDays = 0;
  const totalHoursBySubject: Record<string, number> = {};
  const prevMonthTotalHoursBySubject: Record<string, number> = {};

  subjects.forEach((s) => {
    totalHoursBySubject[s.id] = 0;
    prevMonthTotalHoursBySubject[s.id] = 0;
  });

  const todayStr = getFormattedDateString(currentDate);

  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month, d);
    const dateStr = getFormattedDateString(dateObj);
    const log = dailyLogs[dateStr];
    const dayRotation = log?.rotationDay || ((d - 1) % 7) + 1;
    const scheduleDay = schedule.find((s) => s.dayNumber === dayRotation) || schedule[0];

    const dayStatus = evaluateDayStatus(dateStr, log, scheduleDay, currentDate);

    if (dateStr <= todayStr) {
      if (dayStatus.status === 'complete') completeDays++;
      else if (dayStatus.status === 'partial') partialDays++;
      else if (dayStatus.status === 'missed') missedDays++;
    }

    if (log && log.focusSessions) {
      log.focusSessions.forEach((fs) => {
        if (fs.completed) {
          totalHoursBySubject[fs.subjectId] = (totalHoursBySubject[fs.subjectId] || 0) + fs.durationMinutes / 60;
        }
      });
    }
  }

  const daysUntilExam = calculateDaysUntilExam(examDateStr, currentDate);
  const totalHours = Object.values(totalHoursBySubject).reduce((a, b) => a + b, 0).toFixed(1);

  const summaryLine = `${completeDays} complete days in ${monthName} with ${totalHours} total study hours logged. ${daysUntilExam} days remain until your O/L exam.`;

  return {
    id: `mo-${year}-${month + 1}`,
    month,
    year,
    monthName,
    totalHoursBySubject,
    prevMonthTotalHoursBySubject,
    completeDays,
    partialDays,
    missedDays,
    daysUntilExam,
    summaryLine,
  };
}
