import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { SupportedLanguage } from '../types/index.ts';

/**
 * BCP-47 tags used for Intl formatting. `sat` and `gon` have little or no CLDR
 * data in most engines, so they fall back to the closest available locale
 * rather than throwing a RangeError.
 */
const INTL_TAGS: Record<SupportedLanguage, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  bn: 'bn-IN',
  or: 'or-IN',
  mr: 'mr-IN',
  sat: 'sat-IN',
  gon: 'gon-IN',
};

const safeTag = (language: string): string => {
  const tag = INTL_TAGS[language as SupportedLanguage] || 'en-IN';
  try {
    Intl.DateTimeFormat.supportedLocalesOf(tag);
    return tag;
  } catch {
    return 'en-IN';
  }
};

/** Turn `institute_verification` into `Institute verification`. */
export function humanize(value: string): string {
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, character => character.toUpperCase());
}

export interface Formatters {
  /** Active language code, e.g. 'or'. */
  language: string;
  /** Long-form date, e.g. "19 Sep 2026" / "୧୯ ସେପ୍ଟେମ୍ବର ୨୦୨୬". */
  date: (value: Date | string) => string;
  /** Short numeric date, e.g. "19-09-2026". */
  shortDate: (value: Date | string) => string;
  /** Grouped number without a currency symbol. */
  number: (value: number) => string;
  /** Indian-format currency, e.g. "₹1,20,000". */
  money: (value: number) => string;
  /** Percentage with one decimal, e.g. "71.5%". */
  percent: (value: number, fractionDigits?: number) => string;
  /** Localised relative offset, e.g. "in 3 days", "2 days ago", "today". */
  relativeDays: (days: number) => string;
  /** Localised label for a status/tone token, falling back to a readable form. */
  statusLabel: (value: string) => string;
}

/** Status tokens can arrive from several domains; try each vocabulary in order. */
const STATUS_KEY_PATHS = [
  'status.{code}',
  'data.statuses.{code}.label',
  'data.paymentStatuses.{code}',
  'data.caseStatuses.{code}',
  'data.verificationOutcomes.{code}',
  'data.exceptionCategories.{code}',
];

const toDate = (value: Date | string): Date => {
  if (value instanceof Date) return value;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

/**
 * Locale-aware formatters bound to the active language.
 *
 * Everything is rebuilt when the language changes, so a component using this
 * hook re-renders dates, currency and relative labels in the new language
 * instead of keeping the previous locale's formatting.
 */
export function useFormatters(): Formatters {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage || i18n.language || 'en';

  return useMemo<Formatters>(() => {
    const tag = safeTag(language);

    const relative = new Intl.RelativeTimeFormat(tag, { numeric: 'auto' });

    return {
      language,
      date: value => toDate(value).toLocaleDateString(tag, { day: '2-digit', month: 'short', year: 'numeric' }),
      shortDate: value => toDate(value).toLocaleDateString(tag, { day: '2-digit', month: '2-digit', year: 'numeric' }),
      number: value => value.toLocaleString(tag),
      money: value => `₹${value.toLocaleString(tag, { maximumFractionDigits: 0 })}`,
      percent: (value, fractionDigits = 1) =>
        `${value.toLocaleString(tag, { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits })}%`,
      relativeDays: days => relative.format(days, 'day'),
      statusLabel: value => {
        for (const path of STATUS_KEY_PATHS) {
          const translated = t(path.replace('{code}', value), { defaultValue: '' });
          if (translated && translated !== path) return translated;
        }
        return humanize(value);
      },
    };
  }, [language, t]);
}
