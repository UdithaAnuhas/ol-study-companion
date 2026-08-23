import type { Subject, ScheduleDay, Block, DailyLog } from '../types';

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'subj-science',
    name: 'Science',
    color: '#3b82f6', // Indigo Blue
    confidenceLevel: 2,
    hasRecordings: true,
    recordingsTotal: 42,
    recordingsWatched: 18,
  },
  {
    id: 'subj-maths',
    name: 'Maths',
    color: '#8b5cf6', // Violet
    confidenceLevel: 3,
    hasRecordings: false,
    recordingsTotal: 0,
    recordingsWatched: 0,
  },
  {
    id: 'subj-ict',
    name: 'ICT',
    color: '#06b6d4', // Cyan
    confidenceLevel: 2,
    hasRecordings: true,
    recordingsTotal: 30,
    recordingsWatched: 12,
  },
  {
    id: 'subj-history',
    name: 'History',
    color: '#f59e0b', // Amber
    confidenceLevel: 3,
    hasRecordings: false,
    recordingsTotal: 0,
    recordingsWatched: 0,
  },
  {
    id: 'subj-religion',
    name: 'Religion',
    color: '#10b981', // Emerald
    confidenceLevel: 4,
    hasRecordings: false,
    recordingsTotal: 0,
    recordingsWatched: 0,
  },
  {
    id: 'subj-lang',
    name: 'Sinhala / Tamil',
    color: '#ec4899', // Pink
    confidenceLevel: 3,
    hasRecordings: false,
    recordingsTotal: 0,
    recordingsWatched: 0,
  },
  {
    id: 'subj-commerce',
    name: 'Commerce',
    color: '#f97316', // Orange
    confidenceLevel: 3,
    hasRecordings: false,
    recordingsTotal: 0,
    recordingsWatched: 0,
  },
  {
    id: 'subj-english',
    name: 'English',
    color: '#64748b', // Slate
    confidenceLevel: 5,
    hasRecordings: false,
    recordingsTotal: 0,
    recordingsWatched: 0,
    isFinished: true, // Finished subject
  },
];

const createStandardBlocks = (
  dayPrefix: string,
  rot1Subj: string,
  rot1Label: string,
  rot2Subj: string,
  rot2Label: string,
  rot3Subj: string,
  rot3Label: string
): Block[] => [
  { id: `${dayPrefix}-1`, startTime: '06:00', endTime: '07:00', label: 'Wake up & Morning Routine', subjectId: '', type: 'rest' },
  { id: `${dayPrefix}-2`, startTime: '07:00', endTime: '08:30', label: 'Science Recordings + Notes', subjectId: 'subj-science', type: 'study' },
  { id: `${dayPrefix}-3`, startTime: '08:30', endTime: '08:45', label: 'Morning Quick Break', subjectId: '', type: 'break' },
  { id: `${dayPrefix}-4`, startTime: '08:45', endTime: '10:15', label: rot1Label, subjectId: rot1Subj, type: 'study' },
  { id: `${dayPrefix}-5`, startTime: '10:15', endTime: '10:30', label: 'Mid-Morning Break', subjectId: '', type: 'break' },
  { id: `${dayPrefix}-6`, startTime: '10:30', endTime: '12:00', label: 'Maths Intensive Practice', subjectId: 'subj-maths', type: 'study' },
  { id: `${dayPrefix}-7`, startTime: '12:00', endTime: '13:00', label: 'Lunch & Relaxation', subjectId: '', type: 'meal' },
  { id: `${dayPrefix}-8`, startTime: '13:00', endTime: '14:30', label: rot2Label, subjectId: rot2Subj, type: 'study' },
  { id: `${dayPrefix}-9`, startTime: '14:30', endTime: '15:15', label: 'Afternoon Gaming / Rest Session', subjectId: '', type: 'game' },
  { id: `${dayPrefix}-10`, startTime: '15:15', endTime: '16:45', label: 'Science Recordings (Part 2)', subjectId: 'subj-science', type: 'study' },
  { id: `${dayPrefix}-11`, startTime: '16:45', endTime: '17:00', label: 'Evening Refresh Break', subjectId: '', type: 'break' },
  { id: `${dayPrefix}-12`, startTime: '17:00', endTime: '18:00', label: 'Dinner & Family Time', subjectId: '', type: 'meal' },
  { id: `${dayPrefix}-13`, startTime: '18:00', endTime: '19:30', label: rot3Label, subjectId: rot3Subj, type: 'study' },
  { id: `${dayPrefix}-14`, startTime: '19:30', endTime: '20:00', label: 'Night Gaming Session', subjectId: '', type: 'game' },
  { id: `${dayPrefix}-15`, startTime: '20:00', endTime: '20:30', label: 'Day Wind Down & Prep', subjectId: '', type: 'rest' },
];

export const INITIAL_SCHEDULE: ScheduleDay[] = [
  {
    dayNumber: 1,
    title: 'Day 1 - History & ICT Focus',
    blocks: createStandardBlocks(
      'd1',
      'subj-history', 'History Chapter Revision',
      'subj-ict', 'ICT Backlog Recordings & Practical',
      'subj-lang', 'Sinhala/Tamil Past Questions'
    ),
  },
  {
    dayNumber: 2,
    title: 'Day 2 - Religion & Commerce Focus',
    blocks: createStandardBlocks(
      'd2',
      'subj-religion', 'Religion Key Terms & Essays',
      'subj-commerce', 'Commerce Calculations & Concepts',
      'subj-history', 'History Timeline & Maps'
    ),
  },
  {
    dayNumber: 3,
    title: 'Day 3 - ICT & Language Focus',
    blocks: createStandardBlocks(
      'd3',
      'subj-ict', 'ICT Systems & Database Module',
      'subj-lang', 'Sinhala/Tamil Grammar & Essay Work',
      'subj-religion', 'Religion Short Questions'
    ),
  },
  {
    dayNumber: 4,
    title: 'Day 4 - Commerce & History Focus',
    blocks: createStandardBlocks(
      'd4',
      'subj-commerce', 'Commerce Accounting Principles',
      'subj-history', 'History Modern Period Review',
      'subj-ict', 'ICT Programming / Logic Blocks'
    ),
  },
  {
    dayNumber: 5,
    title: 'Day 5 - Language & Religion Focus',
    blocks: createStandardBlocks(
      'd5',
      'subj-lang', 'Language Comprehension & Literature',
      'subj-religion', 'Religion Model Papers',
      'subj-commerce', 'Commerce Practice Questions'
    ),
  },
  {
    dayNumber: 6,
    title: 'Day 6 - Past Paper Marathon & Error Analysis',
    blocks: [
      { id: 'd6-1', startTime: '06:00', endTime: '07:00', label: 'Morning Wake up & Mindset Prep', subjectId: '', type: 'rest' },
      { id: 'd6-2', startTime: '07:00', endTime: '10:00', label: 'Full Timed Science Past Paper (Paper I & II)', subjectId: 'subj-science', type: 'study' },
      { id: 'd6-3', startTime: '10:00', endTime: '10:30', label: 'Post-Paper Rest & Snack', subjectId: '', type: 'break' },
      { id: 'd6-4', startTime: '10:30', endTime: '12:00', label: 'Science Paper Marking & Error Log', subjectId: 'subj-science', type: 'study' },
      { id: 'd6-5', startTime: '12:00', endTime: '13:00', label: 'Lunch & Brain Recovery', subjectId: '', type: 'meal' },
      { id: 'd6-6', startTime: '13:00', endTime: '15:30', label: 'Full Timed Maths Paper Practice', subjectId: 'subj-maths', type: 'study' },
      { id: 'd6-7', startTime: '15:30', endTime: '16:30', label: 'Long Reward Gaming Session 🎮', subjectId: '', type: 'game' },
      { id: 'd6-8', startTime: '16:30', endTime: '18:00', label: 'Maths Correction & Weak Concept Review', subjectId: 'subj-maths', type: 'study' },
      { id: 'd6-9', startTime: '18:00', endTime: '19:00', label: 'Dinner', subjectId: '', type: 'meal' },
      { id: 'd6-10', startTime: '19:00', endTime: '20:00', label: 'Light Revision / English Touch-up', subjectId: 'subj-english', type: 'study' },
      { id: 'd6-11', startTime: '20:00', endTime: '20:30', label: 'Night Gaming & Wind Down', subjectId: '', type: 'game' },
    ],
  },
  {
    dayNumber: 7,
    title: 'Day 7 - Light Revision & Weekly Refresh',
    blocks: [
      { id: 'd7-1', startTime: '07:00', endTime: '08:30', label: 'Gentle Science Catch-up', subjectId: 'subj-science', type: 'study' },
      { id: 'd7-2', startTime: '08:30', endTime: '09:00', label: 'Morning Relaxing Break', subjectId: '', type: 'break' },
      { id: 'd7-3', startTime: '09:00', endTime: '10:30', label: 'Weakest Subject Targeted Review', subjectId: 'subj-maths', type: 'study' },
      { id: 'd7-4', startTime: '10:30', endTime: '12:00', label: 'Extended Gaming / Hobby Time 🎮', subjectId: '', type: 'game' },
      { id: 'd7-5', startTime: '12:00', endTime: '13:30', label: 'Sunday Lunch & Rest', subjectId: '', type: 'meal' },
      { id: 'd7-6', startTime: '13:30', endTime: '15:00', label: 'ICT Backlog Catch-up', subjectId: 'subj-ict', type: 'study' },
      { id: 'd7-7', startTime: '15:00', endTime: '17:00', label: 'Free Rest / Outing', subjectId: '', type: 'rest' },
      { id: 'd7-8', startTime: '17:00', endTime: '18:00', label: 'Dinner', subjectId: '', type: 'meal' },
      { id: 'd7-9', startTime: '18:00', endTime: '19:30', label: 'Next Week Planning & Light Flashcards', subjectId: 'subj-history', type: 'study' },
      { id: 'd7-10', startTime: '19:30', endTime: '20:30', label: 'Evening Gaming Session', subjectId: '', type: 'game' },
    ],
  },
];

// Pre-loaded realistic historical logs for calendar & review testing
export const INITIAL_DAILY_LOGS: Record<string, DailyLog> = {
  '2026-08-22': {
    date: '2026-08-22',
    rotationDay: 6,
    blockCompletions: { 'd6-2': true, 'd6-4': true, 'd6-6': true, 'd6-8': true, 'd6-10': true }, // Complete (100%)
    focusSessions: [
      { id: 'fs-1', subjectId: 'subj-science', startedAt: '2026-08-22T07:00:00Z', durationMinutes: 90, completed: true },
      { id: 'fs-2', subjectId: 'subj-maths', startedAt: '2026-08-22T13:00:00Z', durationMinutes: 90, completed: true },
    ],
  },
  '2026-08-21': {
    date: '2026-08-21',
    rotationDay: 5,
    blockCompletions: { 'd5-2': true, 'd5-4': true, 'd5-6': true, 'd5-8': true, 'd5-10': true, 'd5-13': true }, // Complete (100%)
    focusSessions: [
      { id: 'fs-3', subjectId: 'subj-lang', startedAt: '2026-08-21T08:45:00Z', durationMinutes: 45, completed: true },
      { id: 'fs-4', subjectId: 'subj-religion', startedAt: '2026-08-21T13:00:00Z', durationMinutes: 45, completed: true },
    ],
  },
  '2026-08-20': {
    date: '2026-08-20',
    rotationDay: 4,
    blockCompletions: { 'd4-2': true, 'd4-6': true }, // Partial (2/6 study blocks = 33%)
    focusSessions: [
      { id: 'fs-5', subjectId: 'subj-science', startedAt: '2026-08-20T07:00:00Z', durationMinutes: 60, completed: true },
    ],
  },
  '2026-08-19': {
    date: '2026-08-19',
    rotationDay: 3,
    blockCompletions: {}, // Missed (0%)
    focusSessions: [],
  },
  '2026-08-18': {
    date: '2026-08-18',
    rotationDay: 2,
    blockCompletions: { 'd2-2': true, 'd2-4': true, 'd2-6': true, 'd2-8': true, 'd2-10': true, 'd2-13': true }, // Complete (100%)
    focusSessions: [
      { id: 'fs-6', subjectId: 'subj-religion', startedAt: '2026-08-18T08:45:00Z', durationMinutes: 60, completed: true },
      { id: 'fs-7', subjectId: 'subj-commerce', startedAt: '2026-08-18T13:00:00Z', durationMinutes: 60, completed: true },
    ],
  },
  '2026-08-17': {
    date: '2026-08-17',
    rotationDay: 1,
    blockCompletions: { 'd1-2': true, 'd1-4': true, 'd1-6': true, 'd1-8': true, 'd1-10': true }, // Complete (83%)
    focusSessions: [
      { id: 'fs-8', subjectId: 'subj-history', startedAt: '2026-08-17T08:45:00Z', durationMinutes: 60, completed: true },
      { id: 'fs-9', subjectId: 'subj-ict', startedAt: '2026-08-17T13:00:00Z', durationMinutes: 60, completed: true },
    ],
  },
  '2026-08-16': {
    date: '2026-08-16',
    rotationDay: 7,
    blockCompletions: { 'd7-1': true, 'd7-3': true, 'd7-6': true }, // Complete (100%)
    focusSessions: [
      { id: 'fs-10', subjectId: 'subj-maths', startedAt: '2026-08-16T09:00:00Z', durationMinutes: 45, completed: true },
    ],
  },
  '2026-08-15': {
    date: '2026-08-15',
    rotationDay: 6,
    blockCompletions: { 'd6-2': true, 'd6-6': true }, // Partial (40%)
    focusSessions: [
      { id: 'fs-11', subjectId: 'subj-science', startedAt: '2026-08-15T07:00:00Z', durationMinutes: 90, completed: true },
    ],
  },
  '2026-08-14': {
    date: '2026-08-14',
    rotationDay: 5,
    blockCompletions: {}, // Missed (0%)
    focusSessions: [],
  },
};
