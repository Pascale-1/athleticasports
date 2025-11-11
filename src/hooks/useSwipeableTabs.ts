import { useState, useRef, TouchEvent } from "react";

interface UseSwipeableTabsOptions {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  threshold?: number;
}

export const useSwipeableTabs = ({
  tabs,
  activeTab,
  onTabChange,
  threshold = 50,
}: UseSwipeableTabsOptions) => {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);

  const currentIndex = tabs.indexOf(activeTab);

  const handleTouchStart = (e: TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isSwiping) return;

    currentX.current = e.touches[0].clientX;
    const diff = currentX.current - startX.current;
    
    // Allow swipe in both directions
    setSwipeOffset(diff);
  };

  const handleTouchEnd = () => {
    if (!isSwiping) return;

    const diff = currentX.current - startX.current;

    // Swipe right (previous tab)
    if (diff > threshold && currentIndex > 0) {
      onTabChange(tabs[currentIndex - 1]);
    }
    // Swipe left (next tab)
    else if (diff < -threshold && currentIndex < tabs.length - 1) {
      onTabChange(tabs[currentIndex + 1]);
    }

    setIsSwiping(false);
    setSwipeOffset(0);
  };

  return {
    swipeOffset,
    isSwiping,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
};
