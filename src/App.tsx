import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { HeroRightNow } from './components/HeroRightNow';
import { ExamCountdownView } from './components/ExamCountdownView';
import { CalendarView } from './components/CalendarView';
import { FocusTimerView } from './components/FocusTimerView';
import { BacklogTrackerView } from './components/BacklogTrackerView';
import { SubjectDashboardView } from './components/SubjectDashboardView';
import { ScheduleEditorView } from './components/ScheduleEditorView';
import { WeeklyReviewView } from './components/WeeklyReviewView';
import { FocusReflectionModal } from './components/FocusReflectionModal';

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {activeTab === 'hero' && <HeroRightNow />}
      {activeTab === 'countdown' && <ExamCountdownView />}
      {activeTab === 'calendar' && <CalendarView />}
      {activeTab === 'timer' && <FocusTimerView />}
      {activeTab === 'backlog' && <BacklogTrackerView />}
      {activeTab === 'subjects' && <SubjectDashboardView />}
      {activeTab === 'schedule' && <ScheduleEditorView />}
      {activeTab === 'review' && <WeeklyReviewView />}
      <FocusReflectionModal />
    </main>
  );
};

export function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white transition-colors duration-300">
        <Navbar />
        <MainContent />

        {/* Quiet Footer */}
        <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-400">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="flex items-center gap-1.5 justify-center sm:justify-start">
              <span>O/L Exam Study Companion • Crafted by</span>
              <a
                href="https://uditha-anuhas.vercel.app/"
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:text-blue-300 font-bold transition underline underline-offset-4 decoration-blue-500/50 hover:decoration-blue-400"
              >
                Uditha Anuhas ↗
              </a>
            </p>
            <p className="flex items-center gap-2 justify-center sm:justify-end text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              <span>Real-Time Cloud Synced</span>
            </p>
          </div>
        </footer>
      </div>
    </AppProvider>
  );
}

export default App;
