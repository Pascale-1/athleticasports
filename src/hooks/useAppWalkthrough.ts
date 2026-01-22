import { useCallback } from "react";
import { driver, type DriveStep } from "driver.js";
import { useTranslation } from "react-i18next";
import "driver.js/dist/driver.css";

const WALKTHROUGH_COMPLETED_KEY = 'athletica_walkthrough_completed';
const WALKTHROUGH_TRIGGER_KEY = 'athletica_trigger_walkthrough';

export const useAppWalkthrough = () => {
  const { t } = useTranslation('walkthrough');

  const hasCompleted = useCallback(() => {
    return localStorage.getItem(WALKTHROUGH_COMPLETED_KEY) === 'true';
  }, []);

  const shouldTrigger = useCallback(() => {
    return localStorage.getItem(WALKTHROUGH_TRIGGER_KEY) === 'true';
  }, []);

  const clearTrigger = useCallback(() => {
    localStorage.removeItem(WALKTHROUGH_TRIGGER_KEY);
  }, []);

  const setTrigger = useCallback(() => {
    localStorage.setItem(WALKTHROUGH_TRIGGER_KEY, 'true');
  }, []);

  const startWalkthrough = useCallback(() => {
    const steps: DriveStep[] = [
      {
        element: '[data-walkthrough="profile"]',
        popover: {
          title: t('steps.profile.title'),
          description: t('steps.profile.description'),
          side: "bottom",
          align: "center"
        }
      },
      {
        element: '[data-walkthrough="quick-actions"]',
        popover: {
          title: t('steps.quickActions.title'),
          description: t('steps.quickActions.description'),
          side: "bottom",
          align: "center"
        }
      },
      {
        element: '[data-walkthrough="games"]',
        popover: {
          title: t('steps.games.title'),
          description: t('steps.games.description'),
          side: "top",
          align: "center"
        }
      },
      {
        element: '[data-walkthrough="feed"]',
        popover: {
          title: t('steps.feed.title'),
          description: t('steps.feed.description'),
          side: "top",
          align: "center"
        }
      },
      {
        element: '[data-walkthrough="navigation"]',
        popover: {
          title: t('steps.navigation.title'),
          description: t('steps.navigation.description'),
          side: "top",
          align: "center"
        }
      }
    ];

    const driverObj = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      overlayColor: 'rgba(0, 0, 0, 0.75)',
      stagePadding: 8,
      stageRadius: 8,
      popoverClass: 'athletica-walkthrough',
      nextBtnText: t('buttons.next'),
      prevBtnText: t('buttons.prev'),
      doneBtnText: t('buttons.done'),
      steps,
      onDestroyed: () => {
        localStorage.setItem(WALKTHROUGH_COMPLETED_KEY, 'true');
      }
    });

    // Small delay to ensure DOM is ready
    setTimeout(() => {
      driverObj.drive();
    }, 500);
  }, [t]);

  const resetWalkthrough = useCallback(() => {
    localStorage.removeItem(WALKTHROUGH_COMPLETED_KEY);
  }, []);

  return {
    startWalkthrough,
    resetWalkthrough,
    hasCompleted,
    shouldTrigger,
    clearTrigger,
    setTrigger
  };
};
