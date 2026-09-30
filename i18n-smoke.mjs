import puppeteer from 'puppeteer-core';

const CHROME = process.env.CHROME_PATH
  || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE = 'http://127.0.0.1:5199';

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });

const errors = [];
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', e => errors.push(String(e)));
page.on('requestfailed', r => errors.push(`REQFAIL ${r.url()} ${r.failure()?.errorText}`));
page.on('response', r => { if (r.status() >= 400) errors.push(`HTTP ${r.status()} ${r.url()}`); });

const setLanguage = async (lang) => {
  await page.evaluate(async (code) => {
    const mod = await import('/src/i18n/index.ts');
    await mod.default.changeLanguage(code);
  }, lang);
  await new Promise(r => setTimeout(r, 200));
};

// Sign in as the student through the real UI.
await page.goto(`${BASE}/login/student`, { waitUntil: 'networkidle0' });
await setLanguage('or');
await page.waitForSelector('.demo-chip');
await page.click('.demo-chip');
await page.waitForSelector('.home-search', { timeout: 15000 });
console.log('signed in ->', await page.evaluate(() => location.pathname));

const h1 = () => page.evaluate(() => document.querySelector('h1')?.textContent?.trim());
const header = () => page.evaluate(() => document.querySelector('.site-header strong')?.textContent?.trim());
const latin = (s) => (s && /[A-Za-z]{3,}/.test(s.replace(/\b(ST|MoTA|DBT|NSP|SFMP|NOS|JAGO|APAAR|UDISE|AISHE|IFSC|PFMS|DigiLocker|WhatsApp|SMS|ed-District|App|Centre)\b/g, '')) ? s : null);

const DEEP = [
  '/home', '/schemes', '/schemes/post-matric', '/schemes/post-matric/eligibility',
  '/applications', '/payments', '/wallet', '/wallet/upload', '/help', '/help/jago',
  '/notifications', '/settings/language', '/settings/notifications', '/profile',
  '/profile/consent', '/family', '/apply/post-matric/step/1', '/apply/post-matric/step/3',
];

for (const lang of ['or', 'hi', 'sat']) {
  console.log(`\n===== ${lang} =====`);
  await setLanguage(lang);
  for (const path of DEEP) {
    await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 350));
    const heading = await h1();
    const brand = await header();
    const flag = latin(heading) ? '  <-- LATIN LEFT' : '';
    console.log(`${path.padEnd(34)} ${JSON.stringify(heading)}${flag}`);
    if (latin(brand)) console.log(`${' '.repeat(34)} brand=${JSON.stringify(brand)} <-- LATIN LEFT`);
  }
}

console.log(`\nnetwork/console errors: ${errors.length}`);
[...new Set(errors)].slice(0, 12).forEach(e => console.log('  ' + e));

await browser.close();
