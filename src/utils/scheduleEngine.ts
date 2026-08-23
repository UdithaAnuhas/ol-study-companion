import type { Block, ScheduleDay, CurrentBlockState, BlockLockStatus, BlockCompletionsMap } from '../types';

// --- CONFIGURABLE TIME-BOUND TICKING CONSTANTS ---
export const TICK_GRACE_MINUTES = 60;   // 60-minute post-block grace window for ticking an active block
export const UNTICK_GRACE_MINUTES = 30; // 30-minute window after ticking a block to untick it

// --- AUTO-ROTATION ANCHOR ---
// Monday 25 August 2026 = Day 1. The rotation cycles 1→2→3→4→5→6→7→1→2→... automatically.
export const ROTATION_ANCHOR_DATE = new Date(2026, 7, 25); // Month is 0-indexed (7 = August)

/**
 * Calculates which rotation day (1–7) a given date falls on,
 * based on the anchor date (Day 1 = Monday 25 Aug 2026).
 */
export function getRotationDayForDate(date: Date = new Date()): number {
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const anchor = new Date(ROTATION_ANCHOR_DATE.getFullYear(), ROTATION_ANCHOR_DATE.getMonth(), ROTATION_ANCHOR_DATE.getDate());
  const diffMs = target.getTime() - anchor.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  // Modulo that handles negative values (dates before anchor)
  const mod = ((diffDays % 7) + 7) % 7;
  return mod + 1; // 1-indexed (1 to 7)
}

/**
 * Helper to safely extract boolean checked state from BlockCompletionsMap.
 * Supports both legacy boolean shape { [blockId]: true } and new { [blockId]: { checked: true, checkedAt: string } }.
 */
export function isBlockChecked(completions: BlockCompletionsMap | undefined, blockId: string): boolean {
  if (!completions || !completions[blockId]) return false;
  const val = completions[blockId];
  if (typeof val === 'boolean') return val;
  return !!val.checked;
}

/**
 * Helper to extract ISO completion timestamp if available.
 */
export function getBlockCheckedAt(completions: BlockCompletionsMap | undefined, blockId: string): string | null {
  if (!completions || !completions[blockId]) return null;
  const val = completions[blockId];
  if (typeof val === 'object' && val.checkedAt) return val.checkedAt;
  return null;
}

/**
 * Checks whether a completed block can still be unticked.
 * Returns true if less than 30 minutes (UNTICK_GRACE_MINUTES) have elapsed since checkedAt.
 */
export function canUntickCompletedBlock(
  checkedAtIso: string | null | undefined,
  currentTime: Date = new Date()
): boolean {
  if (!checkedAtIso) return true; // Legacy records without timestamp remain untickable
  const checkedAtTime = new Date(checkedAtIso).getTime();
  if (isNaN(checkedAtTime)) return true;
  const untickDeadline = checkedAtTime + UNTICK_GRACE_MINUTES * 60 * 1000;
  return currentTime.getTime() <= untickDeadline;
}

/**
 * Combines a date string ("YYYY-MM-DD") and time string ("HH:MM") into a full Date object.
 */
export function parseDateTime(dateStr: string, timeStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = (timeStr || '00:00').split(':').map(Number);
  return new Date(year, (month || 1) - 1, day || 1, hours || 0, minutes || 0, 0, 0);
}

/**
 * Determines the interaction lock status for a block relative to current time:
 * - 'not_yet_active': before block.startTime
 * - 'active': between startTime and (endTime + 60 mins grace)
 * - 'locked': once (endTime + 60 mins grace) has passed for unticked blocks, or past calendar days
 */
export function getBlockLockStatus(
  block: Block,
  dateStr: string,
  currentTime: Date = new Date(),
  completions?: BlockCompletionsMap
): BlockLockStatus {
  const todayStr = getFormattedDateString(currentTime);
  const isChecked = isBlockChecked(completions, block.id);
  const checkedAtIso = getBlockCheckedAt(completions, block.id);

  // If the block is already checked: check 30-minute untick window
  if (isChecked) {
    if (canUntickCompletedBlock(checkedAtIso, currentTime)) {
      return 'active'; // Still within 30m untick grace period
    } else {
      return 'locked'; // Permanently locked as completed
    }
  }

  // Past calendar days: unticked blocks are permanently locked
  if (dateStr < todayStr) {
    return 'locked';
  }

  // Future calendar days: blocks are not active yet
  if (dateStr > todayStr) {
    return 'not_yet_active';
  }

  // Today: evaluate exact time boundaries with full Date objects
  const startDateTime = parseDateTime(dateStr, block.startTime);
  const endDateTime = parseDateTime(dateStr, block.endTime);
  const graceEndDateTime = new Date(endDateTime.getTime() + TICK_GRACE_MINUTES * 60 * 1000);

  if (currentTime < startDateTime) {
    return 'not_yet_active';
  }

  if (currentTime >= startDateTime && currentTime <= graceEndDateTime) {
    return 'active';
  }

  // currentTime > graceEndDateTime
  return 'locked';
}

/**
 * Converts a time string "HH:MM" into seconds from midnight.
 */
export function timeToSeconds(timeStr: string): number {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 3600 + (minutes || 0) * 60;
}

/**
 * Converts seconds from midnight to "HH:MM" 24-hour string format.
 */
export function secondsToTimeString(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600) % 24;
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}`;
}

/**
 * Formats seconds into digital countdown display format "HH:MM:SS" or "MM:SS".
 */
export function formatCountdown(seconds: number): string {
  if (seconds <= 0) return '00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hrs > 0) {
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}

/**
 * Gets formatted date string YYYY-MM-DD for local date.
 */
export function getFormattedDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Evaluates the current schedule day against a specific time to determine the current state.
 */
export function evaluateScheduleState(
  day: ScheduleDay,
  currentTime: Date = new Date()
): CurrentBlockState {
  if (!day || !day.blocks || day.blocks.length === 0) {
    return {
      status: 'day_complete',
      currentBlock: null,
      nextBlock: null,
      secondsRemaining: 0,
      totalDurationSeconds: 0,
      progressPercent: 100,
    };
  }

  // Sort blocks chronologically
  const sortedBlocks = [...day.blocks].sort(
    (a, b) => timeToSeconds(a.startTime) - timeToSeconds(b.startTime)
  );

  const currentSeconds =
    currentTime.getHours() * 3600 +
    currentTime.getMinutes() * 60 +
    currentTime.getSeconds();

  // 1. Check if current time falls within any active block
  for (let i = 0; i < sortedBlocks.length; i++) {
    const block = sortedBlocks[i];
    const startSec = timeToSeconds(block.startTime);
    const endSec = timeToSeconds(block.endTime);

    if (currentSeconds >= startSec && currentSeconds < endSec) {
      const secondsRemaining = endSec - currentSeconds;
      const totalDurationSeconds = endSec - startSec;
      const elapsedSeconds = currentSeconds - startSec;
      const progressPercent = Math.min(
        100,
        Math.max(0, (elapsedSeconds / totalDurationSeconds) * 100)
      );

      const nextBlock = i + 1 < sortedBlocks.length ? sortedBlocks[i + 1] : null;
      const isGameEndingSoon =
        block.type === 'game' && secondsRemaining <= 300 && secondsRemaining > 0;

      return {
        status: 'active_block',
        currentBlock: block,
        nextBlock,
        secondsRemaining,
        totalDurationSeconds,
        progressPercent,
        isGameEndingSoon,
      };
    }
  }

  // 2. Check if we are between blocks (free time) before the day ends
  const futureBlocks = sortedBlocks.filter(
    (b) => timeToSeconds(b.startTime) > currentSeconds
  );

  if (futureBlocks.length > 0) {
    const nextBlock = futureBlocks[0];
    const nextStartSec = timeToSeconds(nextBlock.startTime);
    const secondsRemaining = nextStartSec - currentSeconds;

    return {
      status: 'free_time',
      currentBlock: null,
      nextBlock,
      secondsRemaining,
      totalDurationSeconds: secondsRemaining,
      progressPercent: 0,
    };
  }

  // 3. If all blocks have passed for the day
  return {
    status: 'day_complete',
    currentBlock: null,
    nextBlock: null,
    secondsRemaining: 0,
    totalDurationSeconds: 0,
    progressPercent: 100,
  };
}
