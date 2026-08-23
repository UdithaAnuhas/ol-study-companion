export type BlockType = 'study' | 'break' | 'game' | 'rest' | 'meal';

export interface Subject {
  id: string;
  name: string;
  color: string;
  confidenceLevel: number; // 1 to 5
  hasRecordings: boolean;
  recordingsTotal: number;
  recordingsWatched: number;
  isFinished?: boolean; // English = true
}

export interface Block {
  id: string;
  startTime: string; // "07:00" in 24h format
  endTime: string;   // "08:30" in 24h format
  label: string;
  subjectId: string;
  type: BlockType;
}

export interface ScheduleDay {
  dayNumber: number; // 1 to 7
  title: string;
  blocks: Block[];
}

export interface FocusSession {
  id: string;
  subjectId: string;
  subjectIds?: string[]; // All subjects studied/covered during this session
  startedAt: string; // ISO string
  durationMinutes: number;
  completed: boolean;
  notes?: string;       // What was accomplished in this session
  focusRating?: number; // 1 to 5 star rating of focus quality
}

export interface BlockCompletionRecord {
  checked: boolean;
  checkedAt: string; // ISO timestamp when ticked
}

export type BlockCompletionsMap = Record<string, BlockCompletionRecord | boolean>;

export interface DailyLog {
  date: string; // "YYYY-MM-DD"
  rotationDay: number;
  blockCompletions: BlockCompletionsMap;
  focusSessions: FocusSession[];
}

export interface CurrentBlockState {
  status: 'active_block' | 'free_time' | 'day_complete';
  currentBlock: Block | null;
  nextBlock: Block | null;
  secondsRemaining: number;
  totalDurationSeconds: number;
  progressPercent: number;
  isGameEndingSoon?: boolean; // 5 min warning nudge for game blocks
}

export interface JustStartPrompt {
  id: string;
  title: string;
  prompt: string;
  suggestedDurationMinutes: number;
}

// --- CALENDAR, EXAM COUNTDOWN & BLOCK LOCKING TYPES ---

export type BlockLockStatus = 'not_yet_active' | 'active' | 'locked';

export type DayStatusType = 'complete' | 'partial' | 'missed' | 'today' | 'future';

export interface DayStatus {
  date: string; // YYYY-MM-DD
  status: DayStatusType;
  completionPercent: number; // study blocks only
  completedStudyBlocks: number;
  totalStudyBlocks: number;
}

export interface WeeklyReviewData {
  id: string;
  weekStartDate: string;
  weekEndDate: string;
  totalMinutesBySubject: Record<string, number>;
  completeDays: number;
  partialDays: number;
  missedDays: number;
  backlogProgress: {
    scienceWatched: number;
    scienceRemaining: number;
    ictWatched: number;
    ictRemaining: number;
  };
  lowestSubjectIds: string[];
  summaryLine: string;
}

export interface MonthlyReviewData {
  id: string;
  month: number; // 0 to 11
  year: number;
  monthName: string;
  totalHoursBySubject: Record<string, number>;
  prevMonthTotalHoursBySubject: Record<string, number>;
  completeDays: number;
  partialDays: number;
  missedDays: number;
  daysUntilExam: number;
  summaryLine: string;
}

export interface ExamCountdownDetailed {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
}

