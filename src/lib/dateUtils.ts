import { format, formatDistanceToNow, formatRelative, type Locale } from 'date-fns';
import { fr } from 'date-fns/locale';
import { enUS } from 'date-fns/locale';

const locales: Record<string, Locale> = {
  fr: fr,
  en: enUS,
};

export const getLocale = (): Locale => {
  const lang = localStorage.getItem('athletica_language') || 
               navigator.language?.split('-')[0] || 
               'fr';
  return locales[lang] || fr;
};

export const formatDate = (date: Date | string, formatStr: string = 'PPP'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, formatStr, { locale: getLocale() });
};

export const formatDateShort = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'EEEE d MMMM', { locale: getLocale() });
};

export const formatDateTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'EEEE d MMMM, HH:mm', { locale: getLocale() });
};

export const formatDateTimeShort = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'EEE d MMM, HH:mm', { locale: getLocale() });
};

export const formatRelativeDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: getLocale() });
};

export const formatRelativeDateShort = (date: Date | string, baseDate: Date = new Date()): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatRelative(d, baseDate, { locale: getLocale() });
};

export const formatMonthYear = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MMMM yyyy', { locale: getLocale() });
};

export const formatTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'HH:mm', { locale: getLocale() });
};
