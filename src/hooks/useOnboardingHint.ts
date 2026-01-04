import { useState, useEffect, useCallback } from 'react';

const STORAGE_PREFIX = 'onboarding_hint_';

export const useOnboardingHint = (hintId: string) => {
  const storageKey = `${STORAGE_PREFIX}${hintId}`;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(storageKey);
    setIsVisible(!dismissed);
  }, [storageKey]);

  const dismiss = useCallback(() => {
    localStorage.setItem(storageKey, 'true');
    setIsVisible(false);
  }, [storageKey]);

  const reset = useCallback(() => {
    localStorage.removeItem(storageKey);
    setIsVisible(true);
  }, [storageKey]);

  return { isVisible, dismiss, reset };
};

// Utility to reset all hints (for testing/admin)
export const resetAllOnboardingHints = () => {
  const keys = Object.keys(localStorage).filter(key => 
    key.startsWith(STORAGE_PREFIX)
  );
  keys.forEach(key => localStorage.removeItem(key));
};
