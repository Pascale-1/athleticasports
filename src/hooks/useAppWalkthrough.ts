import { useCallback } from "react";
import { driver, type DriveStep } from "driver.js";
import { useTranslation } from "react-i18next";
import "driver.js/dist/driver.css";

type WalkthroughPage = 'home' | 'events' | 'teams' | 'profile';

const WALKTHROUGH_PREFIX = 'athletica_walkthrough_';
const WALKTHROUGH_TRIGGER_KEY = 'athletica_trigger_walkthrough';

const getCompletedKey = (page: WalkthroughPage) => `${WALKTHROUGH_PREFIX}${page}_done`;

export const useAppWalkthrough = () => {
  const { t } = useTranslation('walkthrough');

  const hasCompleted = useCallback((page: WalkthroughPage = 'home') => {
    return localStorage.getItem(getCompletedKey(page)) === 'true';
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

  const getSteps = useCallback((page: WalkthroughPage): DriveStep[] => {
    switch (page) {
      case 'home':
        return [
          {
            element: '[data-walkthrough="home-next-event"]',
            popover: {
              title: t('home.nextEvent.title'),
              description: t('home.nextEvent.description'),
              side: "bottom",
              align: "center"
            }
          },
          {
            element: '[data-walkthrough="home-stats"]',
            popover: {
              title: t('home.stats.title'),
              description: t('home.stats.description'),
              side: "bottom",
              align: "center"
            }
          },
          {
            element: '[data-walkthrough="home-quick-actions"]',
            popover: {
              title: t('home.quickActions.title'),
              description: t('home.quickActions.description'),
              side: "bottom",
              align: "center"
            }
          },
          {
            element: '[data-walkthrough="home-games"]',
            popover: {
              title: t('home.games.title'),
              description: t('home.games.description'),
              side: "top",
              align: "center"
            }
          },
          {
            element: '[data-walkthrough="home-feed"]',
            popover: {
              title: t('home.feed.title'),
              description: t('home.feed.description'),
              side: "top",
              align: "center"
            }
          }
        ];
      case 'events':
        return [
          {
            element: '[data-walkthrough="events-tabs"]',
            popover: {
              title: t('events.tabs.title'),
              description: t('events.tabs.description'),
              side: "bottom",
              align: "center"
            }
          },
          {
            element: '[data-walkthrough="events-filters"]',
            popover: {
              title: t('events.filters.title'),
              description: t('events.filters.description'),
              side: "bottom",
              align: "center"
            }
          },
          {
            element: '[data-walkthrough="events-view-toggle"]',
            popover: {
              title: t('events.viewToggle.title'),
              description: t('events.viewToggle.description'),
              side: "bottom",
              align: "center"
            }
          },
          {
            element: '[data-walkthrough="events-list"]',
            popover: {
              title: t('events.eventList.title'),
              description: t('events.eventList.description'),
              side: "top",
              align: "center"
            }
          },
          {
            element: '[data-walkthrough="events-fab"]',
            popover: {
              title: t('events.createButton.title'),
              description: t('events.createButton.description'),
              side: "top",
              align: "center"
            }
          }
        ];
      case 'teams':
        return [
          {
            element: '[data-walkthrough="teams-tabs"]',
            popover: {
              title: t('teams.tabs.title'),
              description: t('teams.tabs.description'),
              side: "bottom",
              align: "center"
            }
          },
          {
            element: '[data-walkthrough="teams-invitations"]',
            popover: {
              title: t('teams.invitations.title'),
              description: t('teams.invitations.description'),
              side: "bottom",
              align: "center"
            }
          },
          {
            element: '[data-walkthrough="teams-card"]',
            popover: {
              title: t('teams.teamCard.title'),
              description: t('teams.teamCard.description'),
              side: "top",
              align: "center"
            }
          },
          {
            element: '[data-walkthrough="teams-create"]',
            popover: {
              title: t('teams.createTeam.title'),
              description: t('teams.createTeam.description'),
              side: "bottom",
              align: "center"
            }
          }
        ];
      case 'profile':
        return [
          {
            element: '[data-walkthrough="profile-header"]',
            popover: {
              title: t('profile.header.title'),
              description: t('profile.header.description'),
              side: "bottom",
              align: "center"
            }
          },
          {
            element: '[data-walkthrough="profile-stats"]',
            popover: {
              title: t('profile.stats.title'),
              description: t('profile.stats.description'),
              side: "bottom",
              align: "center"
            }
          },
          {
            element: '[data-walkthrough="profile-tabs"]',
            popover: {
              title: t('profile.tabs.title'),
              description: t('profile.tabs.description'),
              side: "top",
              align: "center"
            }
          },
          {
            element: '[data-walkthrough="profile-share"]',
            popover: {
              title: t('profile.share.title'),
              description: t('profile.share.description'),
              side: "top",
              align: "center"
            }
          }
        ];
    }
  }, [t]);

  const startWalkthrough = useCallback((page: WalkthroughPage = 'home') => {
    if (hasCompleted(page)) return;

    const steps = getSteps(page);

    // Filter out steps whose elements don't exist in DOM
    const availableSteps = steps.filter(step => {
      if (!step.element) return true;
      return document.querySelector(step.element as string) !== null;
    });

    if (availableSteps.length === 0) return;

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
      steps: availableSteps,
      onDestroyed: () => {
        localStorage.setItem(getCompletedKey(page), 'true');
      }
    });

    setTimeout(() => {
      driverObj.drive();
    }, 800);
  }, [t, getSteps, hasCompleted]);

  const resetWalkthrough = useCallback(() => {
    const pages: WalkthroughPage[] = ['home', 'events', 'teams', 'profile'];
    pages.forEach(page => localStorage.removeItem(getCompletedKey(page)));
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
