import type { JustStartPrompt, BlockType } from '../types';

export const STARTER_PROMPTS: Record<string, JustStartPrompt[]> = {
  science: [
    {
      id: 'sci-1',
      title: 'Watch 5 Mins of Recording',
      prompt: 'Open your video recording player, press play at 1.0x speed, and just watch for 5 minutes with a notebook open.',
      suggestedDurationMinutes: 5,
    },
    {
      id: 'sci-2',
      title: 'Diagram & Key Definitions',
      prompt: 'Open your Science textbook to the current chapter. Copy down just ONE diagram or 3 bold key term definitions.',
      suggestedDurationMinutes: 5,
    },
    {
      id: 'sci-3',
      title: 'One Past Paper Question',
      prompt: 'Pick a single 1-mark or short question from a Science past paper. Answer it and check the scheme.',
      suggestedDurationMinutes: 5,
    },
  ],
  maths: [
    {
      id: 'math-1',
      title: 'Copy & Solve 1 Worked Example',
      prompt: 'Open your textbook or past paper. Copy down 1 worked math example step-by-step into your notebook.',
      suggestedDurationMinutes: 5,
    },
    {
      id: 'math-2',
      title: 'Formula Cheat Sheet',
      prompt: 'Write down 5 math formulas (algebra, geometry, or trigonometry) on a clean sheet of paper.',
      suggestedDurationMinutes: 5,
    },
    {
      id: 'math-3',
      title: 'Solve 2 Simple Equations',
      prompt: 'Pick 2 basic practice problems. Set a 5-minute timer and solve just those two.',
      suggestedDurationMinutes: 5,
    },
  ],
  ict: [
    {
      id: 'ict-1',
      title: 'Watch 5 Mins of ICT Video',
      prompt: 'Open the ICT recording backlog, scroll to the next video, and watch just the first 5 minutes.',
      suggestedDurationMinutes: 5,
    },
    {
      id: 'ict-2',
      title: 'Flowchart or Truth Table',
      prompt: 'Draw one quick logic gate truth table or a simple flowchart for a basic algorithm.',
      suggestedDurationMinutes: 5,
    },
    {
      id: 'ict-3',
      title: 'Read 3 Key Concepts',
      prompt: 'Read 3 short sub-sections from ICT theory (e.g. database keys, networking cables, or binary conversion).',
      suggestedDurationMinutes: 5,
    },
  ],
  default: [
    {
      id: 'def-1',
      title: 'Open Notes & Read 1 Page',
      prompt: 'Open your subject notebook to today’s topic. Read just one page out loud or quietly for 5 minutes.',
      suggestedDurationMinutes: 5,
    },
    {
      id: 'def-2',
      title: 'Write 3 Bullet Points',
      prompt: 'Write down 3 things you already know or remember about this topic on a sticky note.',
      suggestedDurationMinutes: 5,
    },
    {
      id: 'def-3',
      title: 'Organize Study Space',
      prompt: 'Clear your desk, grab your pen and textbook, and open to the required chapter.',
      suggestedDurationMinutes: 5,
    },
  ],
};

export function getPromptsForBlock(subjectId?: string, _blockType?: BlockType): JustStartPrompt[] {
  if (!subjectId) return STARTER_PROMPTS.default;

  if (subjectId.includes('science')) return STARTER_PROMPTS.science;
  if (subjectId.includes('maths')) return STARTER_PROMPTS.maths;
  if (subjectId.includes('ict')) return STARTER_PROMPTS.ict;

  return STARTER_PROMPTS.default;
}
