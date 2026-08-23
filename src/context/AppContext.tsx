import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import type { Subject, ScheduleDay, Block, DailyLog, FocusSession } from '../types';
import { INITIAL_SUBJECTS, INITIAL_SCHEDULE, INITIAL_DAILY_LOGS } from '../utils/seedData';
import { getFormattedDateString, isBlockChecked, getRotationDayForDate, ROTATION_ANCHOR_DATE } from '../utils/scheduleEngine';
import { audioSynth } from '../utils/audio';
import { triggerConfetti } from '../components/Confetti';
import { supabase } from '../utils/supabaseClient';

export type TabType = 'hero' | 'countdown' | 'calendar' | 'timer' | 'backlog' | 'subjects' | 'schedule' | 'review';
export type CloudSyncStatus = 'synced' | 'syncing' | 'offline';

// Helper to filter out any historical dummy logs before the app launch anchor date
const sanitizeDailyLogs = (logs: Record<string, DailyLog> | undefined): Record<string, DailyLog> => {
  if (!logs || typeof logs !== 'object') return {};
  const anchorStr = getFormattedDateString(ROTATION_ANCHOR_DATE);
  const clean: Record<string, DailyLog> = {};
  Object.entries(logs).forEach(([dateStr, log]) => {
    if (dateStr >= anchorStr && log) {
      clean[dateStr] = log;
    }
  });
  return clean;
};

interface AppContextType {
  rotationDay: number;
  setRotationDay: (day: number) => void;
  examDate: string; // YYYY-MM-DD (e.g. 2026-12-06)
  setExamDate: (date: string) => void;
  subjects: Subject[];
  schedule: ScheduleDay[];
  dailyLogs: Record<string, DailyLog>;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  cloudSyncStatus: CloudSyncStatus;

  // Global Focus Timer state that persists across tab navigation
  timerSecondsLeft: number;
  timerTotalSeconds: number;
  timerIsRunning: boolean;
  timerPresetMins: number;
  timerSelectedSubjectId: string;
  timerCompletedSessionsCount: number;
  setTimerSelectedSubjectId: (id: string) => void;
  startFocusTimer: () => void;
  pauseFocusTimer: () => void;
  resetFocusTimer: () => void;
  setFocusTimerPreset: (mins: number) => void;

  // Actions
  toggleBlockCompletion: (date: string, blockId: string) => void;
  addFocusSession: (session: FocusSession) => void;
  updateSubject: (subject: Subject) => void;
  addSubject: (subject: Subject) => void;
  deleteSubject: (subjectId: string) => void;
  updateScheduleBlock: (dayNumber: number, block: Block) => void;
  addScheduleBlock: (dayNumber: number, block: Block) => void;
  deleteScheduleBlock: (dayNumber: number, blockId: string) => void;
  updateBacklogProgress: (subjectId: string, watchedCount: number, totalCount?: number) => void;
  
  // Data backup & import
  exportDataAsJSON: () => string;
  importDataFromJSON: (jsonStr: string) => boolean;
  resetToDefaults: () => void;

  // Helper selectors
  getDailyLogForDate: (dateStr: string) => DailyLog;
  calculateStreak: () => number;
}

const STORAGE_KEY = 'ol_study_companion_state_v1';

// Synchronous loader helper for useState initializers
const loadSavedLocalStorageState = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to parse local storage:', e);
  }
  return null;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const currentYear = new Date().getFullYear();

  // Synchronously load saved state directly on initial mount
  const savedState = loadSavedLocalStorageState();

  const [examDate, setExamDateState] = useState<string>(
    savedState?.examDate || `${currentYear}-12-06`
  );
  // Auto-compute rotation day from current date (Mon Aug 25 = Day 1)
  const [rotationDay, setRotationDayState] = useState<number>(
    getRotationDayForDate(new Date())
  );
  const [subjects, setSubjects] = useState<Subject[]>(
    savedState?.subjects && Array.isArray(savedState.subjects) ? savedState.subjects : INITIAL_SUBJECTS
  );
  const [schedule, setSchedule] = useState<ScheduleDay[]>(
    savedState?.schedule && Array.isArray(savedState.schedule) ? savedState.schedule : INITIAL_SCHEDULE
  );
  const [dailyLogs, setDailyLogs] = useState<Record<string, DailyLog>>(
    sanitizeDailyLogs(savedState?.dailyLogs || INITIAL_DAILY_LOGS)
  );
  const [activeTab, setActiveTab] = useState<TabType>('hero');
  const [theme, setThemeState] = useState<'dark' | 'light'>(
    savedState?.theme || 'dark'
  );
  const [cloudSyncStatus, setCloudSyncStatus] = useState<CloudSyncStatus>('synced');

  const isInitialSyncDone = useRef(false);

  // Persistent Focus Timer state across tabs
  const [timerPresetMins, setTimerPresetMins] = useState<number>(25);
  const [timerTotalSeconds, setTimerTotalSeconds] = useState<number>(25 * 60);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(25 * 60);
  const [timerIsRunning, setTimerIsRunning] = useState<boolean>(false);
  const [timerSelectedSubjectId, setTimerSelectedSubjectId] = useState<string>(
    savedState?.subjects?.find((s: Subject) => !s.isFinished)?.id || INITIAL_SUBJECTS.find((s) => !s.isFinished)?.id || ''
  );
  const [timerCompletedSessionsCount, setTimerCompletedSessionsCount] = useState<number>(0);

  // Global background Focus Timer interval
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timerIsRunning && timerSecondsLeft > 0) {
      interval = setInterval(() => {
        setTimerSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (timerIsRunning && timerSecondsLeft === 0) {
      setTimerIsRunning(false);
      audioSynth.playCompletionChime();
      triggerConfetti();
      setTimerCompletedSessionsCount((prev) => prev + 1);

      // Log completed session
      if (timerSelectedSubjectId) {
        addFocusSession({
          id: `fs-${Date.now()}`,
          subjectId: timerSelectedSubjectId,
          startedAt: new Date().toISOString(),
          durationMinutes: timerPresetMins,
          completed: true,
        });
      }
    }
    return () => clearInterval(interval);
  }, [timerIsRunning, timerSecondsLeft, timerSelectedSubjectId, timerPresetMins]);

  const startFocusTimer = () => setTimerIsRunning(true);
  const pauseFocusTimer = () => setTimerIsRunning(false);
  const resetFocusTimer = () => {
    setTimerIsRunning(false);
    setTimerSecondsLeft(timerPresetMins * 60);
    setTimerTotalSeconds(timerPresetMins * 60);
  };
  const setFocusTimerPreset = (mins: number) => {
    setTimerPresetMins(mins);
    setTimerTotalSeconds(mins * 60);
    setTimerSecondsLeft(mins * 60);
    setTimerIsRunning(false);
  };

  // Re-compute rotation day every 60 seconds to auto-advance at midnight
  useEffect(() => {
    const interval = setInterval(() => {
      const computedDay = getRotationDayForDate(new Date());
      setRotationDayState((prev) => (prev !== computedDay ? computedDay : prev));
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Sync to local storage & Supabase Cloud
  useEffect(() => {
    const dataToSave = {
      examDate,
      rotationDay,
      subjects,
      schedule,
      dailyLogs,
      theme,
    };

    // 1. Instant local storage write
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.error('Failed to save to local storage:', e);
    }

    // 2. Background cloud sync to Supabase (debounced)
    if (isInitialSyncDone.current) {
      const timeoutId = setTimeout(async () => {
        try {
          setCloudSyncStatus('syncing');
          const { error } = await supabase.from('study_companion_data').upsert({
            id: 'default_user',
            data: dataToSave,
            updated_at: new Date().toISOString(),
          });
          if (error) {
            console.warn('Supabase sync notice:', error);
            setCloudSyncStatus('offline');
          } else {
            setCloudSyncStatus('synced');
          }
        } catch {
          setCloudSyncStatus('offline');
        }
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [examDate, rotationDay, subjects, schedule, dailyLogs, theme]);

  // Initial Supabase Cloud Fetch & Realtime Sync Subscription
  useEffect(() => {
    const initCloudData = async () => {
      try {
        setCloudSyncStatus('syncing');
        const { data, error } = await supabase
          .from('study_companion_data')
          .select('*')
          .eq('id', 'default_user')
          .single();

        if (!error && data && data.data) {
          const cloud = data.data;
          if (cloud.examDate) setExamDateState(cloud.examDate);
          if (cloud.subjects && Array.isArray(cloud.subjects)) setSubjects(cloud.subjects);
          if (cloud.schedule && Array.isArray(cloud.schedule)) setSchedule(cloud.schedule);
          if (cloud.dailyLogs && typeof cloud.dailyLogs === 'object') setDailyLogs(sanitizeDailyLogs(cloud.dailyLogs));
          if (cloud.theme) setThemeState(cloud.theme);
          setCloudSyncStatus('synced');
        } else {
          // If no remote record exists yet, push initial state to create it
          const initialData = {
            examDate,
            rotationDay,
            subjects,
            schedule,
            dailyLogs,
            theme,
          };
          await supabase.from('study_companion_data').upsert({
            id: 'default_user',
            data: initialData,
            updated_at: new Date().toISOString(),
          });
          setCloudSyncStatus('synced');
        }
      } catch (err) {
        console.warn('Supabase init notice (operating in offline-first mode):', err);
        setCloudSyncStatus('offline');
      } finally {
        isInitialSyncDone.current = true;
      }
    };

    initCloudData();

    // Subscribe to realtime changes (syncs changes made on other devices like phone in <100ms)
    const channel = supabase
      .channel('study_companion_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'study_companion_data', filter: 'id=eq.default_user' },
        (payload) => {
          if (payload.new && (payload.new as { data: Record<string, unknown> }).data) {
            const remote = (payload.new as { data: Record<string, unknown> }).data;
            if (remote.examDate && typeof remote.examDate === 'string') setExamDateState(remote.examDate);
            if (remote.subjects && Array.isArray(remote.subjects)) setSubjects(remote.subjects as Subject[]);
            if (remote.schedule && Array.isArray(remote.schedule)) setSchedule(remote.schedule as ScheduleDay[]);
            if (remote.dailyLogs && typeof remote.dailyLogs === 'object') setDailyLogs(sanitizeDailyLogs(remote.dailyLogs as Record<string, DailyLog>));
            if (remote.theme && (remote.theme === 'dark' || remote.theme === 'light')) setThemeState(remote.theme);
            setCloudSyncStatus('synced');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Apply theme class to document body
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const setExamDate = (newDate: string) => {
    setExamDateState(newDate);
  };

  const setRotationDay = (day: number) => {
    setRotationDayState(day);
  };

  const setTheme = (newTheme: 'dark' | 'light') => {
    setThemeState(newTheme);
  };

  const getDailyLogForDate = (dateStr: string): DailyLog => {
    if (dailyLogs[dateStr]) {
      return dailyLogs[dateStr];
    }
    return {
      date: dateStr,
      rotationDay,
      blockCompletions: {},
      focusSessions: [],
    };
  };

  const toggleBlockCompletion = (dateStr: string, blockId: string) => {
    setDailyLogs((prev) => {
      const currentLog = prev[dateStr] || {
        date: dateStr,
        rotationDay,
        blockCompletions: {},
        focusSessions: [],
      };

      const isCompleted = isBlockChecked(currentLog.blockCompletions, blockId);
      const updatedCompletions = {
        ...currentLog.blockCompletions,
        [blockId]: isCompleted
          ? { checked: false, checkedAt: '' }
          : { checked: true, checkedAt: new Date().toISOString() },
      };

      return {
        ...prev,
        [dateStr]: {
          ...currentLog,
          blockCompletions: updatedCompletions,
        },
      };
    });
  };

  const addFocusSession = (session: FocusSession) => {
    const todayStr = getFormattedDateString();
    setDailyLogs((prev) => {
      const currentLog = prev[todayStr] || {
        date: todayStr,
        rotationDay,
        blockCompletions: {},
        focusSessions: [],
      };

      return {
        ...prev,
        [todayStr]: {
          ...currentLog,
          focusSessions: [...currentLog.focusSessions, session],
        },
      };
    });
  };

  const updateSubject = (updatedSubject: Subject) => {
    setSubjects((prev) =>
      prev.map((s) => (s.id === updatedSubject.id ? updatedSubject : s))
    );
  };

  const addSubject = (newSubject: Subject) => {
    setSubjects((prev) => [...prev, newSubject]);
  };

  const deleteSubject = (subjectId: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== subjectId));
  };

  const updateScheduleBlock = (dayNumber: number, updatedBlock: Block) => {
    setSchedule((prev) =>
      prev.map((d) => {
        if (d.dayNumber !== dayNumber) return d;
        return {
          ...d,
          blocks: d.blocks.map((b) => (b.id === updatedBlock.id ? updatedBlock : b)),
        };
      })
    );
  };

  const addScheduleBlock = (dayNumber: number, newBlock: Block) => {
    setSchedule((prev) =>
      prev.map((d) => {
        if (d.dayNumber !== dayNumber) return d;
        return {
          ...d,
          blocks: [...d.blocks, newBlock],
        };
      })
    );
  };

  const deleteScheduleBlock = (dayNumber: number, blockId: string) => {
    setSchedule((prev) =>
      prev.map((d) => {
        if (d.dayNumber !== dayNumber) return d;
        return {
          ...d,
          blocks: d.blocks.filter((b) => b.id !== blockId),
        };
      })
    );
  };

  const updateBacklogProgress = (subjectId: string, watchedCount: number, totalCount?: number) => {
    setSubjects((prev) =>
      prev.map((s) => {
        if (s.id !== subjectId) return s;
        return {
          ...s,
          recordingsWatched: Math.max(0, Math.min(totalCount ?? s.recordingsTotal, watchedCount)),
          recordingsTotal: totalCount !== undefined ? totalCount : s.recordingsTotal,
        };
      })
    );
  };

  const calculateStreak = (): number => {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = getFormattedDateString(d);
      const log = dailyLogs[dateStr];
      if (!log) {
        if (i === 0) continue; // Today might not have finished yet
        break;
      }
      const completedCount = Object.keys(log.blockCompletions || {}).filter((id) =>
        isBlockChecked(log.blockCompletions, id)
      ).length;
      if (completedCount >= 3) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  };

  const exportDataAsJSON = (): string => {
    const data = {
      version: 1,
      examDate,
      rotationDay,
      subjects,
      schedule,
      dailyLogs,
      theme,
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  };

  const importDataFromJSON = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (
        parsed &&
        typeof parsed === 'object' &&
        Array.isArray(parsed.subjects) &&
        Array.isArray(parsed.schedule)
      ) {
        if (typeof parsed.examDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(parsed.examDate)) {
          setExamDateState(parsed.examDate);
        }
        if (typeof parsed.rotationDay === 'number' && parsed.rotationDay >= 1 && parsed.rotationDay <= 7) {
          setRotationDayState(parsed.rotationDay);
        }
        setSubjects(parsed.subjects);
        setSchedule(parsed.schedule);
        if (parsed.dailyLogs && typeof parsed.dailyLogs === 'object' && !Array.isArray(parsed.dailyLogs)) {
          setDailyLogs(parsed.dailyLogs);
        }
        if (parsed.theme === 'dark' || parsed.theme === 'light') {
          setThemeState(parsed.theme);
        }
        return true;
      }
    } catch (e) {
      console.error('Import validation error:', e);
    }
    return false;
  };

  const resetToDefaults = () => {
    setExamDateState(`${currentYear}-12-06`);
    setRotationDayState(1);
    setSubjects(INITIAL_SUBJECTS);
    setSchedule(INITIAL_SCHEDULE);
    setDailyLogs(INITIAL_DAILY_LOGS);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AppContext.Provider
      value={{
        rotationDay,
        setRotationDay,
        examDate,
        setExamDate,
        subjects,
        schedule,
        dailyLogs,
        activeTab,
        setActiveTab,
        theme,
        setTheme,
        cloudSyncStatus,
        toggleBlockCompletion,
        addFocusSession,
        updateSubject,
        addSubject,
        deleteSubject,
        updateScheduleBlock,
        addScheduleBlock,
        deleteScheduleBlock,
        updateBacklogProgress,
        exportDataAsJSON,
        importDataFromJSON,
        resetToDefaults,
        getDailyLogForDate,
        calculateStreak,
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
        setFocusTimerPreset,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
