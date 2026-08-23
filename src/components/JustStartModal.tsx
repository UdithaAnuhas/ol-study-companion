import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import type { Block, Subject } from '../types';
import { getPromptsForBlock } from '../utils/justStartPrompts';
import { audioSynth } from '../utils/audio';

interface JustStartModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBlock: Block | null;
  subject: Subject | null;
  onCompleteBlock: () => void;
}

export const JustStartModal: React.FC<JustStartModalProps> = ({
  isOpen,
  onClose,
  currentBlock,
  subject,
  onCompleteBlock,
}) => {
  const [selectedPromptIndex, setSelectedPromptIndex] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(300); // 5 minutes
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const prompts = getPromptsForBlock(currentBlock?.subjectId, currentBlock?.type);
  const activePrompt = prompts[selectedPromptIndex] || prompts[0];

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      setIsRunning(false);
      setIsFinished(true);
      audioSynth.playCompletionChime();
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  if (!isOpen) return null;

  const handleStartTimer = () => {
    setIsRunning(true);
  };

  const handlePauseTimer = () => {
    setIsRunning(false);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setTimeLeft(300);
    setIsFinished(false);
  };

  const formatSecs = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Just Start 🚀</h2>
              <p className="text-xs text-slate-400">Break down anxiety into a tiny 5-minute action</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Context */}
        <div className="mt-4 p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {subject && (
              <span
                className="w-3.5 h-3.5 rounded-full"
                style={{ backgroundColor: subject.color }}
              />
            )}
            <span className="text-sm font-semibold text-slate-200">
              {currentBlock ? currentBlock.label : 'Current Session'}
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {currentBlock ? `${currentBlock.startTime} - ${currentBlock.endTime}` : ''}
          </span>
        </div>

        {/* Prompt Selector Pills */}
        <div className="mt-5 space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Choose a micro-action:
          </label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {prompts.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedPromptIndex(idx);
                  handleResetTimer();
                }}
                className={`p-3 rounded-2xl text-left border transition text-xs font-medium ${
                  selectedPromptIndex === idx
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-lg shadow-blue-500/10'
                    : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <div className="font-semibold text-slate-200">{p.title}</div>
                <div className="text-[10px] opacity-75 mt-0.5">{p.suggestedDurationMinutes} mins</div>
              </button>
            ))}
          </div>
        </div>

        {/* Action Prompt Card */}
        <div className="mt-4 p-5 rounded-2xl bg-gradient-to-br from-blue-950/40 to-slate-900 border border-blue-500/30 text-slate-200">
          <p className="text-sm leading-relaxed font-medium text-blue-100">
            "{activePrompt.prompt}"
          </p>
        </div>

        {/* 5-Min Timer Display */}
        <div className="mt-6 flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-950 border border-slate-800">
          <div className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-amber-400">
            {formatSecs(timeLeft)}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {isFinished ? '🎉 Great job taking the first step!' : '5-Minute Momentum Timer'}
          </p>

          <div className="flex items-center gap-3 mt-5">
            {!isRunning ? (
              <button
                onClick={handleStartTimer}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition transform active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                {timeLeft < 300 && !isFinished ? 'Resume 5-Min Timer' : 'Start 5-Min Timer'}
              </button>
            ) : (
              <button
                onClick={handlePauseTimer}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 font-bold text-sm transition"
              >
                <Pause className="w-4 h-4 fill-current" />
                Pause
              </button>
            )}

            <button
              onClick={handleResetTimer}
              className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Footers */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full sm:w-auto text-xs text-slate-400 hover:text-slate-200 transition"
          >
            I feel ready to return
          </button>
          <button
            onClick={() => {
              onCompleteBlock();
              onClose();
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition"
          >
            <CheckCircle2 className="w-4 h-4" />
            Mark Full Block Completed
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
