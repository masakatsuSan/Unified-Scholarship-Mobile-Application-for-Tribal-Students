import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { translations, SUPPORTED_LANGUAGES } from './translations.ts';
import type { SupportedLanguage } from '../types/index.ts';

export const LANGUAGE_STORAGE_KEY = 'i18nextLng';

type Resource = (typeof translations)['en'];

const resources = Object.keys(translations).reduce((acc, lang) => {
  acc[lang] = { translation: translations[lang] };
  return acc;
}, {} as Record<string, { translation: Resource }>);

const isSupported = (value: unknown): value is SupportedLanguage =>
  typeof value === 'string' && (SUPPORTED_LANGUAGES as string[]).includes(value);

/**
 * Resolve the initial language from the saved preference, then the browser.
 * Returns undefined when nothing matches so i18next can fall back to 'en'.
 */
function detectLanguage(): SupportedLanguage | undefined {
  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (isSupported(stored)) return stored;
  } catch {
    // Private-mode browsers can throw on localStorage access; fall through.
  }

  if (typeof navigator === 'undefined') return undefined;

  const candidates: readonly string[] = navigator.languages?.length
    ? navigator.languages
    : [navigator.language];

  for (const candidate of candidates) {
    if (!candidate) continue;
    if (isSupported(candidate)) return candidate;
    const base = candidate.split('-')[0].toLowerCase();
    if (isSupported(base)) return base;
  }
  return undefined;
}

/** Keep the document in sync so screen readers use the right pronunciation. */
function applyDocumentLanguage(language: string) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.lang = language;
  root.dataset.language = language;
}

/** Mirror the app name into the tab title so it follows the chosen language. */
function applyDocumentTitle() {
  if (typeof document === 'undefined') return;
  const name = i18n.t('app.title');
  const ministry = i18n.t('app.subtitle');
  if (name) document.title = `${name} | ${ministry}`;
}

const initialLanguage = detectLanguage();

void i18n.use(initReactI18next).init({
  resources,
  lng: initialLanguage,
  fallbackLng: 'en',
  supportedLngs: SUPPORTED_LANGUAGES,
  nonExplicitSupportedLngs: true,
  // The detected language must be applied before the first paint, otherwise the
  // whole UI renders in English and then snaps to the saved language.
  initAsync: false,
  interpolation: { escapeValue: false },
});

// `changeLanguage` is the single entry point for switching, so persistence and
// the <html lang> attribute are handled here instead of at each call site.
i18n.on('languageChanged', (language: string) => {
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Ignore quota/permission failures; the UI still switches language.
  }
  applyDocumentLanguage(language);
  applyDocumentTitle();
});

applyDocumentLanguage(initialLanguage || 'en');
applyDocumentTitle();

export default i18n;
