import en from './src/i18n/locales/en.ts';
import hi from './src/i18n/locales/hi.ts';
import bn from './src/i18n/locales/bn.ts';
import or from './src/i18n/locales/or.ts';
import mr from './src/i18n/locales/mr.ts';
import sat from './src/i18n/locales/sat.ts';
import gon from './src/i18n/locales/gon.ts';

type Node = { [key: string]: unknown };

const paths = (value: unknown, prefix = ''): string[] => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return [];
  return Object.entries(value as Node).flatMap(([key, child]) => {
    const next = prefix ? `${prefix}.${key}` : key;
    const nested = paths(child, next);
    return nested.length ? nested : [next];
  });
};

const values = (value: unknown, prefix = ''): [string, string][] => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return [[prefix, String(value)]];
  }
  return Object.entries(value as Node).flatMap(([key, child]) => values(child, prefix ? `${prefix}.${key}` : key));
};

const locales: Record<string, typeof en> = { en, hi, bn, or, mr, sat, gon };
const base = values(en);
const basePaths = paths(en);
const baseSet = new Set(basePaths);

let failures = 0;
const fail = (message: string) => { failures += 1; console.log(`  FAIL ${message}`); };

console.log(`en keys: ${basePaths.length}`);

for (const [code, locale] of Object.entries(locales)) {
  console.log(`\n[${code}]`);
  const localePaths = paths(locale);
  const localeSet = new Set(localePaths);

  const missing = basePaths.filter(p => !localeSet.has(p));
  const extra = localePaths.filter(p => !baseSet.has(p));
  if (missing.length) fail(`missing ${missing.length} keys: ${missing.slice(0, 8).join(', ')}`);
  if (extra.length) fail(`extra ${extra.length} keys: ${extra.slice(0, 8).join(', ')}`);

  // Placeholder parity: every {{token}} must survive translation.
  const localeValues = new Map(values(locale));
  const placeholderIssues: string[] = [];
  const untranslated: string[] = [];
  for (const [key, source] of base) {
    const translated = localeValues.get(key);
    if (translated === undefined) continue;
    const sourceTokens = (source.match(/\{\{\w+\}\}/g) || []).sort().join(',');
    const targetTokens = (translated.match(/\{\{\w+\}\}/g) || []).sort().join(',');
    if (sourceTokens !== targetTokens) placeholderIssues.push(key);
    // Latin-script UI copy left verbatim in a non-English locale.
    if (code !== 'en' && /^[A-Za-z][A-Za-z0-9 ,.'â€™\-()/:&+]{6,}$/.test(translated) && !/^(MoTA|NSP|SFMP|WhatsApp|SMS|DigiLocker|IFSC|APAAR|UDISE|AISHE|PFMS|DBT|EDS|Job|Class|Year|M\.Sc|MBBS|B\.Tech|Parent|Ministry|Student)/.test(translated)) {
      untranslated.push(`${key}="${translated}"`);
    }
  }
  if (placeholderIssues.length) fail(`placeholder mismatch in ${placeholderIssues.length} keys: ${placeholderIssues.slice(0, 8).join(', ')}`);
  if (untranslated.length) console.log('  latin: ' + untranslated.join('  ||  '));
  if (!missing.length && !extra.length && !placeholderIssues.length) console.log('  keys + placeholders OK');
}

console.log(failures ? `\nFAILED (${failures} checks)` : '\nAll locale files are structurally consistent.');
process.exit(failures ? 1 : 0);
