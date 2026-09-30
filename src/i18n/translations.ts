import en from './locales/en.ts';
import hi from './locales/hi.ts';
import bn from './locales/bn.ts';
import or from './locales/or.ts';
import mr from './locales/mr.ts';
import sat from './locales/sat.ts';
import gon from './locales/gon.ts';
import type { TranslationSchema } from './schema.ts';

export type { TranslationSchema } from './schema.ts';

export const translations: Record<string, TranslationSchema> = { en, hi, bn, or, mr, sat, gon };

export interface LanguageOption {
  code: string;
  /** English name of the language. */
  name: string;
  /** Name written in the language itself. */
  nativeName: string;
}

/** Single source of truth for the language switcher; order is the display order. */
export const languageList: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
  { code: 'sat', name: 'Santali (Ol Chiki)', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ' },
  { code: 'gon', name: 'Gondi', nativeName: 'गोंडी / कोया' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
];

export const SUPPORTED_LANGUAGES = languageList.map(item => item.code);
