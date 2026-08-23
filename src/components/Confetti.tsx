import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';

export const triggerConfetti = () => {
  try {
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899'],
      disableForReducedMotion: true,
    });
  } catch {
    // Ignore canvas failures
  }
};

export const ConfettiTrigger: React.FC<{ trigger: boolean }> = ({ trigger }) => {
  useEffect(() => {
    if (trigger) {
      triggerConfetti();
    }
  }, [trigger]);

  return null;
};
