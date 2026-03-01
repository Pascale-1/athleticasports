import { format, formatDistanceToNow, formatRelative, isToday, isYesterday, isThisWeek, type Locale } from 'date-fns';
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
  return formatAbsoluteTimestamp(date);
};

/**
 * Absolute timestamp formatter for communications (chat, announcements).
 * - Same day   → "Today at 18:00" / "Aujourd'hui à 18h00"
 * - Yesterday  → "Yesterday at 18:00" / "Hier à 18h00"
 * - This week  → "Mon 24 Feb at 18:00" / "lun. 24 fév. à 18h00"
 * - Older      → "24 Feb at 18:00" / "24 fév. à 18h00"
 */
export const formatAbsoluteTimestamp = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const locale = getLocale();
  const isFr = locale === fr;
  const timeFmt = isFr ? "HH'h'mm" : 'HH:mm';

  if (isToday(d)) {
    const prefix = isFr ? "Aujourd'hui" : 'Today';
    const connector = isFr ? 'à' : 'at';
    return `${prefix} ${connector} ${format(d, timeFmt, { locale })}`;
  }
  if (isYesterday(d)) {
    const prefix = isFr ? 'Hier' : 'Yesterday';
    const connector = isFr ? 'à' : 'at';
    return `${prefix} ${connector} ${format(d, timeFmt, { locale })}`;
  }
  if (isThisWeek(d)) {
    const connector = isFr ? 'à' : 'at';
    return `${format(d, 'EEE d MMM', { locale })} ${connector} ${format(d, timeFmt, { locale })}`;
  }
  const connector = isFr ? 'à' : 'at';
  return `${format(d, 'd MMM', { locale })} ${connector} ${format(d, timeFmt, { locale })}`;
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
