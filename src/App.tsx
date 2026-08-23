import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { HeroRightNow } from './components/HeroRightNow';
import { CalendarView } from './components/CalendarView';
import { FocusTimerView } from './components/FocusTimerView';
import { BacklogTrackerView } from './components/BacklogTrackerView';
import { SubjectDashboardView } from './components/SubjectDashboardView';
import { ScheduleEditorView } from './components/ScheduleEditorView';
import { WeeklyReviewView } from './components/WeeklyReviewView';

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {activeTab === 'hero' && <HeroRightNow />}
      {activeTab === 'calendar' && <CalendarView />}
      {activeTab === 'timer' && <FocusTimerView />}
      {activeTab === 'backlog' && <BacklogTrackerView />}
      {activeTab === 'subjects' && <SubjectDashboardView />}
      {activeTab === 'schedule' && <ScheduleEditorView />}
      {activeTab === 'review' && <WeeklyReviewView />}
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
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>O/L Exam Study Companion • Built for December Success</p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              100% Offline Ready (Data stored in LocalStorage)
            </p>
          </div>
        </footer>
      </div>
    </AppProvider>
  );
}

export default App;
