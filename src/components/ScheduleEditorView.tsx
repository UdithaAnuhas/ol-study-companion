import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Download, Upload, RotateCcw, BookOpen } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Block, BlockType, Subject } from '../types';

export const ScheduleEditorView: React.FC = () => {
  const {
    schedule,
    subjects,
    updateScheduleBlock,
    addScheduleBlock,
    deleteScheduleBlock,
    addSubject,
    deleteSubject,
    exportDataAsJSON,
    importDataFromJSON,
    resetToDefaults,
  } = useApp();

  const [selectedDayNum, setSelectedDayNum] = useState<number>(1);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [editBlockData, setEditBlockData] = useState<Partial<Block>>({});

  // Subject management state
  const [isAddingSubject, setIsAddingSubject] = useState<boolean>(false);
  const [newSubjName, setNewSubjName] = useState<string>('');
  const [newSubjColor, setNewSubjColor] = useState<string>('#3b82f6');
  const [newSubjHasRecordings, setNewSubjHasRecordings] = useState<boolean>(false);

  // New Block modal state
  const [isAddingBlock, setIsAddingBlock] = useState<boolean>(false);
  const [newBlockStartTime, setNewBlockStartTime] = useState<string>('09:00');
  const [newBlockEndTime, setNewBlockEndTime] = useState<string>('10:00');
  const [newBlockLabel, setNewBlockLabel] = useState<string>('');
  const [newBlockSubjectId, setNewBlockSubjectId] = useState<string>('');
  const [newBlockType, setNewBlockType] = useState<BlockType>('study');

  const activeScheduleDay = schedule.find((d) => d.dayNumber === selectedDayNum) || schedule[0];

  const handleStartEdit = (b: Block) => {
    setEditingBlockId(b.id);
    setEditBlockData({ ...b });
  };

  const handleSaveEdit = () => {
    if (editingBlockId && editBlockData.startTime && editBlockData.endTime && editBlockData.label) {
      updateScheduleBlock(selectedDayNum, editBlockData as Block);
      setEditingBlockId(null);
    }
  };

  const handleCreateBlock = () => {
    if (newBlockLabel && newBlockStartTime && newBlockEndTime) {
      const newBlock: Block = {
        id: `blk-${Date.now()}`,
        startTime: newBlockStartTime,
        endTime: newBlockEndTime,
        label: newBlockLabel,
        subjectId: newBlockSubjectId,
        type: newBlockType,
      };
      addScheduleBlock(selectedDayNum, newBlock);
      setIsAddingBlock(false);
      setNewBlockLabel('');
    }
  };

  const handleCreateSubject = () => {
    if (newSubjName) {
      const subj: Subject = {
        id: `subj-${Date.now()}`,
        name: newSubjName,
        color: newSubjColor,
        confidenceLevel: 3,
        hasRecordings: newSubjHasRecordings,
        recordingsTotal: newSubjHasRecordings ? 20 : 0,
        recordingsWatched: 0,
      };
      addSubject(subj);
      setNewSubjName('');
      setIsAddingSubject(false);
    }
  };

  const handleExportJSON = () => {
    const jsonStr = exportDataAsJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ol-study-companion-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          const success = importDataFromJSON(content);
          if (success) {
            alert('Schedule & settings imported successfully!');
          } else {
            alert('Failed to parse JSON backup file.');
          }
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Title & Backup Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-3xl font-black text-slate-100 tracking-tight">Schedule & Subject Settings</h2>
          <p className="text-sm text-slate-400">Edit rotation blocks, subjects, or backup your schedule</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold transition"
          >
            <Download className="w-4 h-4 text-blue-400" /> Export JSON
          </button>
          <label className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold cursor-pointer transition">
            <Upload className="w-4 h-4 text-cyan-400" /> Import JSON
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>
          <button
            onClick={() => {
              if (confirm('Reset schedule and subjects to factory defaults?')) {
                resetToDefaults();
              }
            }}
            className="p-2 rounded-xl bg-slate-900 hover:bg-red-950 text-slate-500 hover:text-red-300 border border-slate-800 text-xs transition"
            title="Reset Defaults"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Day Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {[1, 2, 3, 4, 5, 6, 7].map((dayNum) => (
          <button
            key={dayNum}
            onClick={() => setSelectedDayNum(dayNum)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap border transition ${
              selectedDayNum === dayNum
                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            Day {dayNum} {dayNum === 6 ? '📝' : dayNum === 7 ? '☕' : ''}
          </button>
        ))}
      </div>

      {/* Day Schedule Editor Table */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-100">{activeScheduleDay.title}</h3>
          <button
            onClick={() => setIsAddingBlock(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" /> Add Block
          </button>
        </div>

        {/* Modal/Form for Adding Block */}
        {isAddingBlock && (
          <div className="p-4 rounded-2xl bg-slate-950 border border-blue-500/40 space-y-3">
            <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider">New Block Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
              <input
                type="time"
                value={newBlockStartTime}
                onChange={(e) => setNewBlockStartTime(e.target.value)}
                className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200"
              />
              <input
                type="time"
                value={newBlockEndTime}
                onChange={(e) => setNewBlockEndTime(e.target.value)}
                className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200"
              />
              <input
                type="text"
                placeholder="Block Label"
                value={newBlockLabel}
                onChange={(e) => setNewBlockLabel(e.target.value)}
                className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 col-span-2"
              />
              <select
                value={newBlockSubjectId}
                onChange={(e) => setNewBlockSubjectId(e.target.value)}
                className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200"
              >
                <option value="">No Subject (Break/Meal)</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <select
                value={newBlockType}
                onChange={(e) => setNewBlockType(e.target.value as BlockType)}
                className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200"
              >
                <option value="study">Study</option>
                <option value="break">Break</option>
                <option value="game">Game</option>
                <option value="meal">Meal</option>
                <option value="rest">Rest</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsAddingBlock(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 text-slate-400 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBlock}
                className="px-4 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs"
              >
                Save New Block
              </button>
            </div>
          </div>
        )}

        {/* Block List */}
        <div className="space-y-2">
          {activeScheduleDay.blocks.map((b) => {
            const isEditing = editingBlockId === b.id;
            const subj = subjects.find((s) => s.id === b.subjectId);

            if (isEditing) {
              return (
                <div key={b.id} className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-500/50 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                    <input
                      type="time"
                      value={editBlockData.startTime || ''}
                      onChange={(e) => setEditBlockData({ ...editBlockData, startTime: e.target.value })}
                      className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200"
                    />
                    <input
                      type="time"
                      value={editBlockData.endTime || ''}
                      onChange={(e) => setEditBlockData({ ...editBlockData, endTime: e.target.value })}
                      className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200"
                    />
                    <input
                      type="text"
                      value={editBlockData.label || ''}
                      onChange={(e) => setEditBlockData({ ...editBlockData, label: e.target.value })}
                      className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 col-span-2"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => setEditingBlockId(null)}
                      className="px-3 py-1 rounded-xl bg-slate-900 text-slate-400 text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      className="px-3 py-1 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={b.id}
                className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-slate-400 w-24 font-bold">
                    {b.startTime} - {b.endTime}
                  </span>
                  <span className="font-semibold text-slate-200">{b.label}</span>
                  {subj && (
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold text-white"
                      style={{ backgroundColor: subj.color }}
                    >
                      {subj.name}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleStartEdit(b)}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteScheduleBlock(selectedDayNum, b.id)}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-red-950 text-slate-500 hover:text-red-300 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subjects Manager Section */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-400" /> Subject List Manager
          </h3>
          <button
            onClick={() => setIsAddingSubject(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700"
          >
            <Plus className="w-4 h-4" /> Add Subject
          </button>
        </div>

        {isAddingSubject && (
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
            <h4 className="font-bold text-slate-200">Add New Subject</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Subject Name"
                value={newSubjName}
                onChange={(e) => setNewSubjName(e.target.value)}
                className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200"
              />
              <input
                type="color"
                value={newSubjColor}
                onChange={(e) => setNewSubjColor(e.target.value)}
                className="p-1 h-9 w-full bg-slate-900 border border-slate-800 rounded-xl cursor-pointer"
              />
              <label className="flex items-center gap-2 text-slate-300">
                <input
                  type="checkbox"
                  checked={newSubjHasRecordings}
                  onChange={(e) => setNewSubjHasRecordings(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-800"
                />
                Has Video Recording Backlog
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsAddingSubject(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSubject}
                className="px-4 py-1.5 rounded-xl bg-blue-600 text-white font-bold"
              >
                Save Subject
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {subjects.map((s) => (
            <div
              key={s.id}
              className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="font-bold text-slate-200">{s.name}</span>
              </div>
              {!s.isFinished && (
                <button
                  onClick={() => deleteSubject(s.id)}
                  className="text-slate-500 hover:text-red-400 transition p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
