import { useState, useRef, TouchEvent } from "react";

interface UseSwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
}

export const useSwipe = ({ onSwipeLeft, onSwipeRight, threshold = 60 }: UseSwipeOptions = {}) => {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);

  const handleTouchStart = (e: TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isSwiping) return;
    currentX.current = e.touches[0].clientX;
    const diff = startX.current - currentX.current;
    
    // Allow swipe in both directions but limit the distance
    if (Math.abs(diff) < 120) {
      setSwipeOffset(-diff);
    }
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);
    const diff = startX.current - currentX.current;
    
    // Determine if swipe threshold was met
    if (diff > threshold) {
      // Swiped left
      setSwipeOffset(-80);
      onSwipeLeft?.();
    } else if (diff < -threshold) {
      // Swiped right
      setSwipeOffset(0);
      onSwipeRight?.();
    } else {
      // Not enough swipe, reset
      setSwipeOffset(0);
    }
  };

  const resetSwipe = () => {
    setSwipeOffset(0);
    setIsSwiping(false);
  };

  return {
    swipeOffset,
    isSwiping,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    resetSwipe,
    isRevealed: swipeOffset === -80,
  };
};
