import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import commonFr from './locales/fr/common.json';
import commonEn from './locales/en/common.json';
import authFr from './locales/fr/auth.json';
import authEn from './locales/en/auth.json';
import eventsFr from './locales/fr/events.json';
import eventsEn from './locales/en/events.json';
import teamsFr from './locales/fr/teams.json';
import teamsEn from './locales/en/teams.json';
import matchingFr from './locales/fr/matching.json';
import matchingEn from './locales/en/matching.json';

const resources = {
  fr: {
    common: commonFr,
    auth: authFr,
    events: eventsFr,
    teams: teamsFr,
    matching: matchingFr,
  },
  en: {
    common: commonEn,
    auth: authEn,
    events: eventsEn,
    teams: teamsEn,
    matching: matchingEn,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr', // French as default for France launch
    supportedLngs: ['fr', 'en'],
    defaultNS: 'common',
    ns: ['common', 'auth', 'events', 'teams', 'matching'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'athletica_language',
    },
  });

export default i18n;
