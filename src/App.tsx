import React, { useEffect, useMemo, useRef, useState } from 'react';
import './i18n/index.ts';
import i18n from './i18n/index.ts';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { useFormatters } from './i18n/format.ts';
import { languageList } from './i18n/translations.ts';
import { NOTIFICATION_TEMPLATES } from './services/notificationTemplates.ts';
import { useRouter, matchRoutePattern } from './context/RouterContext.tsx';
import { useAuth } from './auth/useAuth.tsx';
import { schemesData, seedPersonas, initialConsents } from './data/seedData.ts';
import { initialOfficerExceptions } from './data/officerSeedData.ts';
import { initialCohort, calculateCoverageStats } from './data/cohortData.ts';
import { seedNotifications } from './data/seedNotifications.ts';
import { schemeEligibilityConfigs, evaluateEligibility } from './data/eligibilityRulesConfig.ts';
import { schemeFormSchemas } from './data/applicationFormSchemas.ts';
import { runParallelVerificationOrchestrator, OrchestrationResult } from './services/verificationEngine.ts';
import { useJagoConversation } from './hooks/useJagoConversation.ts';
import { MarkdownText } from './components/ui/MarkdownText.tsx';
import { ApplicationRecord, ApplicationReceiptData, ConsentItem, DraftApplication, OfficerExceptionCase, PaymentRecord, PendingAction, Persona, SchemeId, SchemeInfo, StudentProfile, SupportedLanguage } from './types/index.ts';
import { RolePicker, StaffLoginPage, StudentLoginPage } from './auth/LoginPage.tsx';
import { ROLE_META, isStudentOnlyPath, loginPathFor, roleHome } from './auth/demoAccounts.ts';
import { UserRole } from './auth/types.ts';
import { AlertCircle, ArrowLeft, ArrowRight, Bell, Bot, Check, CheckCircle2, ChevronDown, ChevronRight, CircleHelp, Clock3, CreditCard, FileCheck2, FileText, FolderLock, Globe2, GraduationCap, HelpCircle, Home as HomeIcon, Landmark, Languages, ListFilter, LockKeyhole, LogIn, Maximize2, Menu, Moon, Phone, Plus, RotateCcw, Search, Send, ShieldCheck, Sparkles, Sun, Table2, Upload, User, Users, WalletCards, X, Zap } from 'lucide-react';

const demoToday = new Date('2026-09-19T12:00:00');
const demoDate = (days: number) => { const date = new Date(demoToday); date.setDate(date.getDate() + days); return date; };

const Icon = ({ name, className = 'icon-18' }: { name: string; className?: string }) => { const icons: Record<string, React.ComponentType<{ className?: string }>> = { home: HomeIcon, file: FileText, wallet: FolderLock, payment: CreditCard, help: HelpCircle, bot: Bot, user: User, bell: Bell, check: CheckCircle2, shield: ShieldCheck, upload: Upload, search: Search, arrow: ArrowRight, back: ArrowLeft, close: X, language: Languages, menu: Menu, moon: Moon, sun: Sun, plus: Plus, clock: Clock3, table: Table2, spark: Sparkles, bank: Landmark, users: Users, lock: LockKeyhole, send: Send, zap: Zap, phone: Phone, info: CircleHelp }; const Component = icons[name] || CircleHelp; return <Component className={className} />; };

type Tone = 'success' | 'warning' | 'danger' | 'neutral';

/** Status pill. The label is resolved through i18n so it follows the language. */
const Status: React.FC<{ value: string; tone?: Tone }> = ({ value, tone }) => {
  const { statusLabel } = useFormatters();
  const inferred = tone
    || (/reject|fail|REJECTED/.test(value) ? 'danger'
      : /pending|PENDING|verification|initiated|gap/i.test(value) ? 'warning'
      : /draft|DRAFT/.test(value) ? 'neutral'
      : 'success');
  const icon = inferred === 'success' ? 'check' : inferred === 'danger' ? 'info' : inferred === 'warning' ? 'clock' : 'file';
  return <span className={`status status-${inferred}`}><Icon name={icon} className="icon-14" />{value.includes('%') ? value : statusLabel(value)}</span>;
};

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' }> = ({ variant = 'secondary', children, ...props }) => <button className={`button button-${variant}`} {...props}>{children}</button>;
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => <section className={`surface ${className}`}>{children}</section>;

const Header: React.FC<{ persona: Persona; dark: boolean; toggleDark: () => void; logout: () => void }> = ({ persona, dark, toggleDark, logout }) => {
  const { t, i18n: instance } = useTranslation();
  const { currentPath, navigate } = useRouter();
  const [menu, setMenu] = useState(false);
  const [account, setAccount] = useState(false);
  const activeLanguage = languageList.find(item => item.code === (instance.resolvedLanguage || instance.language)) || languageList[0];
  const links = [
    { label: t('nav.home'), path: '/home' },
    { label: t('nav.applications'), path: '/applications' },
    { label: t('nav.wallet'), path: '/wallet' },
    { label: t('nav.payments'), path: '/payments' },
    { label: t('nav.help'), path: '/help' },
  ];
  return <><div className="tricolor" /><header className="site-header"><div className="header-inner">
    <button className="brand" onClick={() => navigate('/')}><span className="emblem">ST</span><span><strong>{t('app.title')}</strong><small>{t('app.ministry')}</small></span></button>
    <nav className="desktop-nav">{links.map(link => <button className={currentPath === link.path || currentPath.startsWith(link.path + '/') ? 'active' : ''} onClick={() => navigate(link.path)} key={link.path}>{link.label}</button>)}</nav>
    <div className="header-actions">
      <button className="language" onClick={() => navigate('/settings/language')} aria-label={t('header.languageSwitch')} title={t('header.languageSwitch')}>
        <Icon name="language" className="icon-16" /><span>{activeLanguage.nativeName}</span>
      </button>
      <button className="theme" onClick={toggleDark} aria-label={t('header.themeToggle')} title={t('header.themeToggle')}><Icon name={dark ? 'sun' : 'moon'} className="icon-17" /></button>
      <button className="account" onClick={() => setAccount(!account)}><span className="avatar">{persona.name[0]}</span><span>{persona.name.split(' ')[0]}</span><Icon name="menu" className="icon-14" /></button>
      <button className="menu-button" onClick={() => setMenu(!menu)} aria-label={t('header.menu')}><Icon name="menu" /></button>
    </div>
    {account && <div className="popover"><strong>{persona.name}</strong><small>{persona.profile.currentCourse}</small><button onClick={() => navigate('/profile')}>{t('header.viewProfile')}</button><button onClick={() => { logout(); navigate('/login'); }}>{t('header.signOut')}</button></div>}
    {menu && <div className="mobile-menu">{links.map(link => <button key={link.path} onClick={() => { navigate(link.path); setMenu(false); }}>{link.label}</button>)}<button onClick={() => navigate('/profile')}>{t('header.profile')}</button></div>}
  </div></header></>;
};

const BottomNav = () => {
  const { t } = useTranslation();
  const { currentPath, navigate } = useRouter();
  const items = [
    { label: t('nav.home'), path: '/home', icon: 'home' },
    { label: t('nav.applications'), path: '/applications', icon: 'file' },
    { label: t('nav.wallet'), path: '/wallet', icon: 'wallet' },
    { label: t('nav.payments'), path: '/payments', icon: 'payment' },
    { label: t('nav.help'), path: '/help/jago', icon: 'bot' },
  ];
  return <nav className="bottom-nav">{items.map(item => <button className={currentPath === item.path || currentPath.startsWith(item.path + '/') ? 'active' : ''} onClick={() => navigate(item.path)} key={item.path}><Icon name={item.icon} className="icon-18" /><span>{item.label}</span></button>)}</nav>;
};

const PageHeader: React.FC<{ title: string; desc: string; back?: boolean; action?: React.ReactNode }> = ({ title, desc, back, action }) => {
  const { t } = useTranslation();
  const { goBack, navigate } = useRouter();
  return <><div className="page-header"><div className="heading">{back && <button className="icon-button" onClick={goBack}><Icon name="back" /></button>}<div><p className="eyebrow">{t('app.eyebrow')}</p><h1>{title}</h1><p>{desc}</p></div></div>{action}</div><div className="breadcrumbs"><button onClick={() => navigate('/home')}>{t('nav.home')}</button><span>/</span><span>{title}</span></div></>;
};

const SectionTitle: React.FC<{ eyebrow?: string; title: string; text?: string }> = ({ eyebrow, title, text }) => <div className="section-title">{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h2>{title}</h2>{text && <p>{text}</p>}</div>;

const Shell: React.FC<{ children: React.ReactNode; persona: Persona; dark: boolean; toggleDark: () => void; logout: () => void }> = ({ children, persona, dark, toggleDark, logout }) => {
  const { t } = useTranslation();
  return <div className="app-frame"><Header persona={persona} dark={dark} toggleDark={toggleDark} logout={logout} /><main className="page-container">{children}</main>
    <footer className="footer">
      <div><strong>{t('app.title')}</strong><span>{t('footer.tagline')}</span></div>
      <div><button>{t('footer.helpline')}</button><button>{t('footer.privacy')}</button><button>{t('footer.languages')}</button><button>{t('footer.offline')}</button></div>
    </footer><BottomNav /></div>;
};

const JAGO_PANEL_ID = 'jago-quick-panel';

const Jago: React.FC<{ persona: Persona }> = ({ persona }) => {
  const { t } = useTranslation();
  const { currentPath, navigate } = useRouter();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);
  const quickAsks = [t('jago.askPayment'), t('jago.askDocs'), t('jago.askNext')];
  const { messages, thinking, ask, clear, endRef } = useJagoConversation(
    persona,
    t('jago.greetingQuick', { name: persona.name.split(' ')[0] }),
  );

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); fabRef.current?.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const submit = (value: string) => {
    if (!value.trim() || thinking) return;
    setDraft('');
    void ask(value);
  };

  const toggle = () => {
    setOpen(prev => {
      if (prev) fabRef.current?.focus();
      return !prev;
    });
  };

  // The full help page already hosts a JAGO surface, so hide the launcher there.
  if (currentPath === '/help/jago') return null;

  return <>
    <button ref={fabRef} className="jago-fab" onClick={toggle} aria-expanded={open} aria-controls={open ? JAGO_PANEL_ID : undefined} aria-haspopup="dialog">
      <Icon name="bot" />
      <span>{open ? t('jago.fabClose') : t('jago.fabOpen')}</span>
    </button>
    {open && <div className="jago-panel" id={JAGO_PANEL_ID} ref={panelRef} role="dialog" aria-modal="false" aria-label={t('jago.assistant')}>
      <div className="jago-head">
        <span className="jago-head-title">
          <span className="jago-head-mark" aria-hidden="true"><Icon name="spark" className="icon-16" /></span>
          <span><strong>{t('jago.assistant')}</strong><small>{t('jago.answersFromRecords')}</small></span>
        </span>
        <span className="jago-head-actions">
          {messages.length > 1 && <button onClick={clear} title={t('jago.clearConversation')} aria-label={t('jago.clearConversation')}><RotateCcw className="icon-15" /></button>}
          <button onClick={() => navigate('/help/jago')} title={t('jago.openFull')} aria-label={t('jago.openFull')}><Maximize2 className="icon-15" /></button>
          <button onClick={() => setOpen(false)} title={t('jago.close')} aria-label={t('jago.close')}><X className="icon-15" /></button>
        </span>
      </div>
      <div className="jago-body">
        {messages.length === 1 && <div className="quick-asks">{quickAsks.map(item => <button key={item} onClick={() => submit(item)} disabled={thinking}>{item}</button>)}</div>}
        <div className="jago-thread" role="log" aria-live="polite" aria-relevant="additions text">
          {messages.map(m => m.from === 'you'
            ? <p className="jago-you" key={m.id}>{m.text}</p>
            : <div className="answer" key={m.id}><MarkdownText text={m.text} /></div>)}
          {thinking && <p className="jago-thinking" role="status"><span className="jago-dots" aria-hidden="true"><i /><i /><i /></span>{t('jago.thinking')}</p>}
          <div ref={endRef} />
        </div>
        <div className="jago-input">
          <input ref={inputRef} value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); submit(draft); } }} placeholder={t('jago.askPlaceholder')} aria-label={t('jago.askAria')} enterKeyHint="send" />
          <button onClick={() => submit(draft)} disabled={!draft.trim() || thinking} aria-label={t('jago.sendAria')} title={t('jago.send')}><Icon name="send" className="icon-16" /></button>
        </div>
        <button className="jago-expand" onClick={() => { setOpen(false); navigate('/help/jago'); }}>{t('jago.expand')}</button>
      </div>
    </div>}
  </>;
};

const Timeline: React.FC<{ app: ApplicationRecord }> = ({ app }) => {
  const { t } = useTranslation();
  return <div className="timeline">{app.timeline.map(item => (
    <div className={`timeline-item ${item.completed ? 'complete' : ''} ${item.current ? 'current' : ''}`} key={item.stage}>
      <span>{item.completed ? <Icon name="check" className="icon-13" /> : ''}</span>
      <strong>{t(`data.timelineStages.${item.stage}`, { defaultValue: item.label })}</strong>
      <small>{item.completed ? item.current ? t('timeline.inProgress') : t('timeline.completed') : t('timeline.upcoming')}</small>
    </div>
  ))}</div>;
};

const Identity: React.FC<{ profile: StudentProfile }> = ({ profile }) => {
  const { t } = useTranslation();
  return <Card><div className="identity-head"><div><p className="eyebrow">{t('dashboard.apaarVerified')}</p><h2>{profile.name}</h2></div><Status value="verified" /></div>
    <div className="data-grid">
      <div><small>{t('data.fields.currentCourse.label')}</small><strong>{profile.currentCourse}</strong></div>
      <div><small>{t('wallet.colNumber')}</small><strong>{profile.institutionName}</strong></div>
      <div><small>APAAR ID</small><strong>{profile.apaarId || profile.udiseSchoolId || t('wallet.registryId')}</strong></div>
      <div><small>{t('profile.tribe')}</small><strong>{profile.tribe}</strong></div>
      <div><small>{t('data.fields.district.label')}</small><strong>{profile.district}, {profile.state}</strong></div>
      <div><small>{t('data.fields.aadhaarMasked.label')}</small><strong>{profile.aadhaarMasked}</strong></div>
    </div></Card>;
};

const Home: React.FC<{ persona: Persona }> = ({ persona }) => {
  const { t } = useTranslation();
  const { money, relativeDays, date } = useFormatters();
  const { navigate } = useRouter();
  const app = persona.applications[0];
  const total = persona.payments.reduce((sum, p) => sum + p.amount, 0);
  const schemeName = (id: SchemeId) => t(`data.schemes.${id}.name`);
  return <><PageHeader
    title={t('dashboard.welcome', { name: persona.name.split(' ')[0] })}
    desc={t('home.tagline')}
    action={<Button variant="primary" onClick={() => navigate(persona.pendingActions[0] ? `/actions/${persona.pendingActions[0].id}` : '/schemes/pre-matric/eligibility')}>
      {persona.pendingActions[0] ? t('home.continueApplication') : t('home.exploreSchemes')} <Icon name="arrow" className="icon-16" />
    </Button>}
  />
    <label htmlFor="home-search" className="sr-only">{t('home.searchLabel')}</label>
    <div className="home-search" style={{marginBottom:'20px'}}><input id="home-search" type="search" placeholder={t('home.searchPlaceholder')} aria-label={t('home.searchLabel')} style={{width:'100%',padding:'10px 14px',border:'1px solid var(--line)',borderRadius:'6px',fontSize:'16px'}} /></div>
    <div className="home-layout"><div className="main-column">
      <Identity profile={persona.profile} />
      <Card className="eligibility-banner"><div><Icon name="spark" className="icon-24" /><div><p className="eyebrow">{t('home.bannerEyebrow')}</p><h2>{t('home.bannerTitle')}</h2><p>{t('home.bannerText')}</p></div></div><Button variant="primary" onClick={() => navigate('/schemes/pre-matric/eligibility')}>{t('home.checkEligibility')}</Button></Card>
      <Card><div className="section-row"><SectionTitle eyebrow={t('home.pendingEyebrow')} title={t('home.pendingTitle')} /><span className="count">{persona.pendingActions.length}</span></div>
        {persona.pendingActions.length ? persona.pendingActions.slice(0, 3).map((action, index) => (
          <div className="action-row" key={action.id}><span className="action-icon"><Icon name="info" /></span>
            <div><div className="action-title"><strong>{t(`data.actions.${action.type}.title`, { defaultValue: action.title })}</strong><span className="source">{action.sourceSystem}</span></div>
              <p>{t(`data.actions.${action.type}.description`, { defaultValue: action.description })}</p>
              <small className="deadline"><Icon name="clock" className="icon-14" />{t('home.due', { when: relativeDays(12 + index * 4) })}</small>
            </div>
            <Button onClick={() => navigate(`/actions/${action.id}`)}>{t('home.resolve')} <Icon name="arrow" className="icon-15" /></Button>
          </div>
        )) : <p className="muted">{t('home.noPendingActions')}</p>}
      </Card>
      <Card><div className="section-row"><div><p className="eyebrow">{t('home.featuredEyebrow')}</p><h2>{app ? schemeName(app.schemeId) : t('home.noApplicationYet')}</h2><p className="muted">{app?.applicationNumber}</p></div>{app && <Status value={app.currentStatus} />}</div>
        {app ? <Timeline app={app} /> : <Button variant="primary" onClick={() => navigate('/schemes')}>{t('applications.startApplication')}</Button>}
        <div className="card-footer"><span>{t('home.lastUpdatedToday')}</span>{app && <button className="link" onClick={() => navigate(`/applications/${app.id}`)}>{t('home.viewApplication')} <Icon name="arrow" className="icon-14" /></button>}</div>
      </Card>
      <Card><div className="section-row"><SectionTitle eyebrow={t('home.otherSchemes')} title={t('home.otherSchemes')} /><button className="link" onClick={() => navigate('/schemes')}>{t('common.viewAll')}</button></div>
        {schemesData.filter(s => s.id !== persona.activeSchemeId).slice(0, 3).map(scheme => <button className="compact-row" key={scheme.id} onClick={() => navigate(`/schemes/${scheme.id}`)}><span><strong>{schemeName(scheme.id)}</strong><small>{scheme.sourcePortal} · {t(`data.schemes.${scheme.id}.maxBenefit`)}</small></span><Icon name="arrow" className="icon-16" /></button>)}
      </Card>
    </div><aside className="rail">
      <Card><SectionTitle eyebrow={t('home.railPaymentsEyebrow')} title={money(total)} text={t('home.receivedSoFar')} /><hr />
        <div className="rail-line"><span>{t('home.nextPayment')}</span><strong>{app?.currentStatus === 'dbt_initiated' ? t('home.inTwoDays') : t('home.afterSanction')}</strong></div>
        <button className="link" onClick={() => navigate('/payments')}>{t('home.paymentHistory')}</button>
      </Card>
      <Card><SectionTitle eyebrow={t('home.railNotificationsEyebrow')} title={t('home.haveUpdate')} text={t('home.updateText')} /><button className="link" onClick={() => navigate('/notifications')}>{t('home.openNotifications')}</button></Card>
      <Card><SectionTitle eyebrow={t('home.railFamilyEyebrow')} title={t('home.switchProfiles')} text={t('home.familyText')} /><button className="link" onClick={() => navigate('/family')}>{t('home.openFamilyView')}</button></Card>
    </aside></div></>;
};

const LANDING_ROLES: { role: UserRole; icon: string }[] = [
  { role: 'student', icon: 'user' },
  { role: 'officer', icon: 'shield' },
  { role: 'admin', icon: 'bank' },
];

const Landing: React.FC = () => {
  const { t } = useTranslation();
  const { navigate } = useRouter();
  const { isLoggedIn, user } = useAuth();
  const signedInRole = user?.role;
  const home = roleHome(signedInRole);
  const steps: [string, string][] = [
    [t('landing.step1'), t('landing.step1Text')],
    [t('landing.step2'), t('landing.step2Text')],
    [t('landing.step3'), t('landing.step3Text')],
    [t('landing.step4'), t('landing.step4Text')],
  ];

  return <div className="landing"><section className="hero"><div><p className="eyebrow">{t('landing.eyebrow')}</p><h1>{t('landing.heroTitle')} <em>{t('landing.heroTitleAccent')}</em></h1><p className="hero-sub">{t('landing.heroSub')}</p>
    <div className="hero-actions">{isLoggedIn
      ? <>
        <Button variant="primary" onClick={() => navigate(home)}><Icon name="arrow" />{t('landing.continueAs', { name: user?.personaName })}</Button>
        <Button onClick={() => navigate('/help/jago')}><Icon name="bot" />{t('landing.askJago')}</Button>
      </>
      : <>
        <Button variant="primary" onClick={() => navigate('/login/student')}><Icon name="spark" />{t('landing.checkEligibility')}</Button>
        <Button onClick={() => navigate('/login')}><Icon name="user" />{t('landing.loginTrack')}</Button>
      </>}</div>
    <p className="hero-proof">{isLoggedIn
      ? <>{t('landing.signedInTo', { role: t(ROLE_META[signedInRole ?? 'student'].titleKey) })} <button className="link" onClick={() => navigate('/login')}>{t('landing.switchAccount')}</button></>
      : <><Icon name="shield" className="icon-16" />{t('landing.recordsProtected')}</>}</p></div>
    <div className="phone"><div className="phone-screen"><strong>{t('app.title')}</strong><h3>{t('landing.greetingName')}</h3><div className="phone-note"><Icon name="spark" className="icon-16" />{t('landing.schemesFit')}</div><p>{t('landing.applicationStatus')} <b>{t('status.dbt_initiated')}</b></p><hr /><p>{t('landing.documentsVerified')} <Icon name="check" className="icon-16" /></p></div></div>
  </section>
    <section className="landing-section"><SectionTitle eyebrow={t('landing.rolesEyebrow')} title={t('landing.rolesTitle')} text={t('landing.rolesText')} /><div className="role-grid">{LANDING_ROLES.map(({ role, icon }) => {
      const meta = ROLE_META[role];
      const isCurrent = isLoggedIn && signedInRole === role;
      const canOpen = isCurrent || (!isLoggedIn && role === 'student');
      return <Card key={role} className={isCurrent ? 'role-current' : ''}><Icon name={icon} className="role-icon" /><h3>{t(meta.titleKey)}</h3><p>{t(meta.blurbKey)}</p>{isCurrent
        ? <span className="status status-success"><Icon name="check" className="icon-14" />{t('landing.signedIn')}</span>
        : <Button variant="ghost" onClick={() => navigate(isLoggedIn && canOpen ? meta.home : meta.loginPath)}>{isLoggedIn ? t('landing.signInWorkspace') : t('landing.enter')} <Icon name="arrow" className="icon-16" /></Button>}</Card>;
    })}</div></section>
    <section className="landing-section schemes-band"><SectionTitle eyebrow={t('landing.schemesEyebrow')} title={t('landing.schemesTitle')} text={t('landing.schemesText')} /><div className="scheme-tiles">{schemesData.map((scheme, i) => <button key={scheme.id} onClick={() => navigate(`/schemes/${scheme.id}`)}><span>0{i + 1}</span><strong>{t(`data.schemes.${scheme.id}.name`)}</strong><small>{t(`data.schemes.${scheme.id}.shortDesc`)}</small><u>{t('home.bannerTitle')}</u></button>)}</div></section>
    <section className="landing-section"><SectionTitle eyebrow={t('landing.howEyebrow')} title={t('landing.howTitle')} text={t('landing.howText')} /><div className="steps">{steps.map(([step, text], i) => <div key={step}><span>0{i + 1}</span><h3>{step}</h3><p>{text}</p></div>)}</div></section>
    <div className="highlights"><span><Icon name="shield" />{t('landing.hlMismatch')}</span><span><Icon name="language" />{t('landing.hlLanguages')}</span><span><Icon name="bot" />{t('landing.hlJago')}</span></div>
  </div>;
};

const Schemes: React.FC = () => {
  const { t } = useTranslation();
  const { navigate } = useRouter();
  return <><PageHeader title={t('schemesPage.title')} desc={t('schemesPage.desc')} /><div className="scheme-list">{schemesData.map(scheme => (
    <Card key={scheme.id} className="scheme-card"><div><span className="source">{scheme.sourcePortal}</span><h2>{t(`data.schemes.${scheme.id}.name`)}</h2><p>{t(`data.schemes.${scheme.id}.shortDesc`)}</p>
      <div className="facts">
        <span><small>{t('schemesPage.forLabel')}</small>{t(`data.schemes.${scheme.id}.targetGroup`)}</span>
        <span><small>{t('schemesPage.incomeLabel')}</small>{t(`data.schemes.${scheme.id}.incomeCeiling`)}</span>
        <span><small>{t('schemesPage.benefitLabel')}</small>{t(`data.schemes.${scheme.id}.maxBenefit`)}</span>
      </div></div>
      <div className="card-actions"><Button onClick={() => navigate(`/schemes/${scheme.id}`)}>{t('schemesPage.viewScheme')}</Button><Button variant="primary" onClick={() => navigate(`/schemes/${scheme.id}/eligibility`)}>{t('schemesPage.canIApply')}</Button></div>
    </Card>))}</div></>;
};

/** Eligibility verdict + rule checks, shared by the static and interactive pages. */
const EligibilityBody: React.FC<{ scheme: SchemeInfo; persona: Persona }> = ({ scheme, persona }) => {
  const { t } = useTranslation();
  const { navigate } = useRouter();
  const result = evaluateEligibility(scheme.id, persona.profile, persona.activeSchemeId);
  const schemeName = t(`data.schemes.${scheme.id}.name`);
  const heading = result.status === 'eligible' ? t('eligibility.canApply')
    : result.status === 'blocked_by_active_scholarship' ? t('eligibility.blockedTitle')
    : t('eligibility.notEligibleTitle');
  const summary = result.status === 'eligible' ? t('eligibility.summaryEligible', { scheme: schemeName })
    : result.status === 'blocked_by_active_scholarship' ? t('eligibility.summaryBlocked', { scheme: t(`data.schemes.${persona.activeSchemeId || 'pre-matric'}.name`) })
    : t('eligibility.summaryNotEligible', { reasons: result.failedChecks.map(item => item.title).join(', ') });
  const checks = [
    ...result.passedChecks.map(item => ({ key: item.title, title: item.title, detail: item.detail, ok: true })),
    ...result.failedChecks.map(item => ({ key: item.title, title: item.title, detail: item.reason, ok: false })),
  ];
  const ruleTitle = (criterion: { id: string }, fallback: string) => t(`data.eligibility.${criterion.id}.title`, { defaultValue: fallback });
  return <>
    <Card className={`verdict verdict-${result.status}`}><Status value={result.status === 'eligible' ? 'verified' : result.status === 'blocked_by_active_scholarship' ? 'pending' : 'rejected'} /><div><h2>{heading}</h2><p>{summary}</p></div></Card>
    <Card><SectionTitle eyebrow={t('eligibility.ruleCheck')} title={schemeName} /><div className="checks">{checks.map((item, index) => {
      const criterion = schemeEligibilityConfigs[scheme.id]?.criteria.find(entry => entry.title === item.title);
      const title = criterion ? ruleTitle(criterion, item.title) : item.title;
      const detailKey = criterion ? `data.eligibility.${criterion.id}.description` : '';
      const detail = detailKey ? t(detailKey, { defaultValue: item.detail }) : item.detail;
      return <div key={`${item.title}-${index}`}><span className={item.ok ? 'check-ok' : 'check-no'}>{item.ok ? <Icon name="check" className="icon-15" /> : <Icon name="close" className="icon-15" />}</span><span><strong>{title}</strong><small>{detail}</small></span></div>;
    })}</div>
      <div className="form-actions"><Button onClick={() => navigate(`/schemes/${scheme.id}`)}>{t('eligibility.backToScheme')}</Button>{result.canProceedToApply && <Button variant="primary" onClick={() => navigate(`/apply/${scheme.id}/step/1`)}>{t('eligibility.startApplication')} <Icon name="arrow" className="icon-16" /></Button>}</div>
    </Card></>;
};

const SchemePage: React.FC<{ scheme: SchemeInfo; persona: Persona }> = ({ scheme, persona }) => {
  const { t } = useTranslation();
  const { navigate } = useRouter();
  const result = evaluateEligibility(scheme.id, persona.profile, persona.activeSchemeId);
  return <><PageHeader back title={t(`data.schemes.${scheme.id}.name`)} desc={t(`data.schemes.${scheme.id}.shortDesc`)} action={<Button variant="primary" onClick={() => navigate(`/schemes/${scheme.id}/eligibility`)}>{t('home.checkEligibility')}</Button>} />
    <div className="detail-grid">
      <Card>
        <h2>{t('schemePage.whoFor')}</h2><p>{t(`data.schemes.${scheme.id}.targetGroup`)}</p>
        <h2>{t('schemePage.academicLevel')}</h2><p>{t(`data.schemes.${scheme.id}.academicLevel`)}</p>
        <h2>{t('schemePage.incomeCeiling')}</h2><p>{t(`data.schemes.${scheme.id}.incomeCeiling`)}</p>
        <h2>{t('schemePage.maxBenefit')}</h2><p>{t(`data.schemes.${scheme.id}.maxBenefit`)}</p>
      </Card>
      <Card><p className="eyebrow">{t('schemePage.profileCheck')}</p><Status value={result.status === 'eligible' ? 'verified' : 'pending'} /><h2>{result.status === 'eligible' ? t('eligibility.summaryEligible', { scheme: t(`data.schemes.${scheme.id}.name`) }) : t('eligibility.summaryNotEligible', { reasons: result.failedChecks.map(item => item.title).join(', ') })}</h2><Button variant="primary" onClick={() => navigate(`/schemes/${scheme.id}/eligibility`)}>{t('schemePage.seeFull')}</Button></Card>
    </div></>;
};

const Eligibility: React.FC<{ scheme: SchemeInfo; persona: Persona }> = ({ scheme, persona }) => {
  const { t } = useTranslation();
  return <><PageHeader back title={t('eligibility.title')} desc={t('eligibility.checking', { scheme: t(`data.schemes.${scheme.id}.name`) })} /><EligibilityBody scheme={scheme} persona={persona} /></>;
};

const Table: React.FC<{ headers: string[]; rows: React.ReactNode[] }> = ({ headers, rows }) => {
  const { t } = useTranslation();
  return <Card className="table-card"><div className="table-toolbar"><label><Icon name="search" className="icon-16" /><input placeholder={t('common.search')} aria-label={t('common.search')} /></label><button><Icon name="table" className="icon-16" />{t('common.filters')}</button></div><div className="table-head">{headers.map(header => <span key={header}>{header}</span>)}</div>{rows}</Card>;
};

const Applications: React.FC<{ persona: Persona }> = ({ persona }) => {
  const { t } = useTranslation();
  const { navigate } = useRouter();
  return <><PageHeader title={t('applications.title')} desc={t('applications.desc')} action={<Button variant="primary" onClick={() => navigate('/schemes')}>{t('applications.startApplication')} <Icon name="plus" /></Button>} />
    <Table headers={[t('applications.colScheme'), t('applications.colApplicationId'), t('applications.colUpdated'), t('applications.colStatus'), '']}
      rows={persona.applications.map(app => <button className="table-row" key={app.id} onClick={() => navigate(`/applications/${app.id}`)}><span><strong>{t(`data.schemes.${app.schemeId}.name`)}</strong><small>{app.sourceSystem} · {app.academicYear}</small></span><span>{app.applicationNumber}</span><span>{t('common.today')}</span><span><Status value={app.currentStatus} /></span><span><Icon name="arrow" /></span></button>)}
    /></>;
};

const ApplicationDetail: React.FC<{ app: ApplicationRecord }> = ({ app }) => {
  const { t } = useTranslation();
  const { money, date } = useFormatters();
  const { navigate } = useRouter();
  return <><PageHeader back title={t(`data.schemes.${app.schemeId}.name`)} desc={t(`data.statuses.${app.currentStatus}.description`, { defaultValue: app.statusDescription })} action={<Button onClick={() => navigate(`/applications/${app.id}/receipt`)}>{t('applications.viewReceipt')}</Button>} />
    <div className="detail-grid">
      <Card><div className="section-row"><div><p className="eyebrow">{t('applications.appNumber')}</p><h2>{app.applicationNumber}</h2></div><Status value={app.currentStatus} /></div>
        <div className="data-grid">
          <div><small>{t('applications.academicYear')}</small><strong>{app.academicYear}</strong></div>
          <div><small>{t('applications.submitted')}</small><strong>{date(demoDate(-28))}</strong></div>
          <div><small>{t('applications.sanctionedAmount')}</small><strong>{app.sanctionedAmount ? money(app.sanctionedAmount) : t('applications.toBeDecided')}</strong></div>
        </div></Card>
      <Card><SectionTitle eyebrow={t('applications.lifecycle')} title={t('applications.whatNext')} /><Timeline app={app} /></Card>
    </div></>;
};

const Receipt: React.FC<{ app: ApplicationRecord; profile: StudentProfile }> = ({ app, profile }) => {
  const { t } = useTranslation();
  const { date } = useFormatters();
  const { navigate } = useRouter();
  return <><PageHeader back title={t('receipt.title')} desc={t('receipt.desc')} action={<Button onClick={() => window.print()}>{t('receipt.print')}</Button>} />
    <Card className="receipt"><div className="receipt-head"><span className="emblem">ST</span><div><strong>{t('app.title')}</strong><small>{t('app.ministry')}</small></div><Icon name="check" className="receipt-check icon-28" /></div>
      <h2>{t(`data.schemes.${app.schemeId}.name`)}</h2><p className="muted">{t('receipt.submittedSuccess')}</p>
      <div className="data-grid">
        <div><small>{t('applications.appNumber')}</small><strong>{app.applicationNumber}</strong></div>
        <div><small>{t('receipt.applicant')}</small><strong>{profile.name}</strong></div>
        <div><small>{t('receipt.institution')}</small><strong>{profile.institutionName}</strong></div>
        <div><small>{t('receipt.sourcePortal')}</small><strong>{app.sourceSystem}</strong></div>
        <div><small>{t('applications.submitted')}</small><strong>{date(demoDate(-28))}</strong></div>
        <div><small>{t('receipt.receiptHash')}</small><strong>SHA256-DEMO-4821</strong></div>
      </div>
      <div className="notice"><Icon name="shield" />{t('receipt.keepCopy')}</div></Card></>;
};

const ActionPage: React.FC<{ action: PendingAction }> = ({ action }) => {
  const { t } = useTranslation();
  const [done, setDone] = useState(false);
  return <><PageHeader back title={t(`data.actions.${action.type}.title`, { defaultValue: action.title })} desc={t('action.desc')} />
    <Card className="form-card"><div className="action-detail"><span className="action-icon"><Icon name="info" className="icon-20" /></span>
      <div><Status value="action_required" tone="warning" /><h2>{t(`data.schemes.${action.schemeId}.name`)}</h2><p>{t(`data.actions.${action.type}.description`, { defaultValue: action.description })}</p></div></div>
      <div className="notice"><Icon name="clock" />{t('action.recommended')} <strong>{t('action.withinDays')}</strong></div>
      {action.type === 'income_mismatch' ? <div className="form-section"><label>{t('action.resolveQuestion')}</label><label className="choice"><input type="radio" defaultChecked name="resolve" />{t('action.acceptEdistrict')}</label><label className="choice"><input type="radio" name="resolve" />{t('action.uploadNewer')}</label></div>
        : action.type === 'upload_document' ? <div className="upload"><Icon name="upload" className="icon-28" /><strong>{t('action.uploadDoc')}</strong><span>{t('action.uploadHint')}</span><Button>{t('action.chooseFile')}</Button></div>
        : <div className="readonly">{t('action.bankAccount')} <Status value="verified" /></div>}
      <div className="form-actions"><Button>{t('common.saveForLater')}</Button><Button variant="primary" onClick={() => setDone(true)}>{done ? t('common.completed') : t('action.confirmContinue')} <Icon name="check" className="icon-16" /></Button></div>
      {done && <div className="success"><Icon name="check" className="icon-16" />{t('action.successMessage')}</div>}
    </Card></>;
};

const Wallet: React.FC<{ profile: StudentProfile }> = ({ profile }) => {
  const { t } = useTranslation();
  const { navigate } = useRouter();
  const docs = [
    { id: 'caste', titleKey: 'wallet.docCaste', number: profile.casteCertNo, source: 'e-District' },
    { id: 'income', titleKey: 'wallet.docIncome', number: profile.incomeCertNo, source: 'e-District' },
    { id: 'apaar', titleKey: 'wallet.docApaar', number: profile.apaarId || profile.udiseSchoolId || t('wallet.registryId'), source: 'DigiLocker' },
    { id: 'bank', titleKey: 'wallet.docBank', number: `${profile.bankAccount.bankName} · ${profile.bankAccount.accountNoMasked}`, source: 'NPCI mapper' },
  ];
  return <><PageHeader title={t('wallet.title')} desc={t('wallet.desc')} action={<Button variant="primary" onClick={() => navigate('/wallet/upload')}><Icon name="upload" />{t('wallet.upload')}</Button>} />
    <div className="wallet-summary"><Card><Icon name="shield" className="icon-24" /><strong>{t('wallet.allVerified')}</strong><small>{t('wallet.lastSync')}</small></Card><Card><Icon name="lock" className="icon-24" /><strong>{t('wallet.privacyProtected')}</strong><small>{t('wallet.maskedOnly')}</small></Card></div>
    <Table headers={[t('wallet.colDocument'), t('wallet.colNumber'), t('wallet.colSource'), t('applications.colStatus'), '']}
      rows={docs.map(doc => <button className="table-row" key={doc.id} onClick={() => navigate(`/wallet/${doc.id}`)}><span><strong>{t(doc.titleKey)}</strong><small>{t('wallet.verifiedRecord')}</small></span><span>{doc.number}</span><span>{doc.source}</span><span><Status value="verified" /></span><span><Icon name="arrow" /></span></button>)}
    /></>;
};

const Payments: React.FC<{ payments: PaymentRecord[] }> = ({ payments }) => {
  const { t } = useTranslation();
  const { money, relativeDays } = useFormatters();
  const { navigate } = useRouter();
  const total = payments.reduce((sum, item) => sum + item.amount, 0);
  return <><PageHeader title={t('paymentsPage.title')} desc={t('paymentsPage.desc')} />
    <div className="payment-summary"><Card><small>{t('paymentsPage.totalShown')}</small><strong>{money(total)}</strong><span>{t('paymentsPage.filteredRecords')}</span></Card><Card><small>{t('paymentsPage.dbtAccount')}</small><strong>•••• 4412</strong><span>{t('paymentsPage.seededMapped')}</span></Card></div>
    <Table headers={[t('paymentsPage.colComponent'), t('paymentsPage.colAmount'), t('paymentsPage.colDate'), t('applications.colStatus'), '']}
      rows={payments.map(payment => <button className="table-row" key={payment.id} onClick={() => navigate(`/payments/${payment.id}`)}><span><strong>{t(`data.schemes.${payment.schemeId}.name`)}</strong><small>{t(`data.components.${payment.component}`, { defaultValue: payment.component })} · {t('payments.installment')} {payment.installmentNo}</small></span><span className="amount">{money(payment.amount)}</span><span>{relativeDays(payment.status === 'Disbursed' ? -10 : 2)}</span><span><Status value={payment.status} /></span><span><Icon name="arrow" /></span></button>)}
    /></>;
};

const Help: React.FC = () => {
  const { t } = useTranslation();
  const { navigate } = useRouter();
  const faqs: [string, string][] = [
    [t('help.q1'), t('help.a1')],
    [t('help.q2'), t('help.a2')],
    [t('help.q3'), t('help.a3')],
    [t('help.q4'), t('help.a4')],
  ];
  return <><PageHeader title={t('help.title')} desc={t('help.desc')} action={<Button variant="primary" onClick={() => navigate('/help/jago')}><Icon name="bot" />{t('jago.fabOpen')}</Button>} />
    <div className="help-grid">
      <Card className="help-callout"><Icon name="phone" className="icon-28" /><div><p className="eyebrow">{t('help.needPerson')}</p><h2>{t('help.helplineTitle')}</h2><p>{t('help.helplineHours')}</p></div></Card>
      <Card><SectionTitle eyebrow={t('help.faqEyebrow')} title={t('help.faqTitle')} />{faqs.map(([question, answer], i) => <details key={question} open={i === 0}><summary>{question}<Icon name="arrow" className="icon-15" /></summary><p>{answer}</p></details>)}</Card>
    </div></>;
};

const JagoPage: React.FC<{ persona: Persona }> = ({ persona }) => {
  const { t } = useTranslation();
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const prompts = [t('jago.askStatus'), t('jago.askAmount'), t('jago.askNext')];
  const { messages, thinking, ask, clear, endRef } = useJagoConversation(persona, t('jago.greetingPage', { name: persona.name.split(' ')[0] }));

  const submit = (value: string) => {
    if (!value.trim() || thinking) return;
    setDraft('');
    void ask(value);
  };

  return <>
    <PageHeader title={t('jago.pageTitle')} desc={t('jago.pageDesc')}
      action={messages.length > 1 ? <Button onClick={() => { clear(); inputRef.current?.focus(); }}>{t('jago.clear')}</Button> : undefined} />
    <Card className="chat">
      <div className="chat-head"><span className="chat-head-mark" aria-hidden="true"><Icon name="bot" className="icon-24" /></span>
        <div><h2>{t('jago.assistant')}</h2><p>{t('jago.pageSubtitle')}</p></div></div>
      <div className="messages" role="log" aria-live="polite" aria-relevant="additions text">
        {messages.map(m => m.from === 'you' ? <div className="you" key={m.id}>{m.text}</div> : <div className="jago" key={m.id}><MarkdownText text={m.text} /></div>)}
        {thinking && <div className="jago jago-thinking" role="status"><span className="jago-dots" aria-hidden="true"><i /><i /><i /></span>{t('jago.thinking')}</div>}
        <div ref={endRef} />
      </div>
      <div className="prompts">{prompts.map(p => <button onClick={() => submit(p)} disabled={thinking} key={p}>{p}</button>)}</div>
      <div className="chat-input">
        <input ref={inputRef} value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); submit(draft); } }} placeholder={t('jago.typePlaceholder')} aria-label={t('jago.typeAria')} enterKeyHint="send" />
        <Button variant="primary" onClick={() => submit(draft)} disabled={!draft.trim() || thinking}><Icon name="send" />{t('jago.send')}</Button>
      </div>
    </Card></>;
};

/** Notification text comes from the already-translated 7-locale template registry. */
const localizedNotifications = (language: string) => seedNotifications.map(item => {
  const template = NOTIFICATION_TEMPLATES[item.eventType];
  if (!template) return item;
  const meta = item.metadata || {};
  const vars = {
    amount: meta.amount ?? '',
    bankName: meta.bankName ?? '',
    utrNumber: meta.utrNumber ?? '',
    schemeName: meta.schemeName ?? '',
    applicationNumber: meta.applicationNumber ?? '',
    deadline: meta.deadline ?? '',
    dwoRemarks: meta.dwoRemarks ?? '',
    studentName: '',
    date: '',
  };
  const fill = (source: string) => source.replace(/\{(\w+)\}/g, (_, key: string) => String((vars as Record<string, unknown>)[key] ?? ''));
  return {
    ...item,
    title: template.title[language] ?? template.title.en,
    body: fill(template.inAppBody[language] ?? template.inAppBody.en),
  };
});

const Notifications: React.FC<{ notifications: any[]; setNotifications: React.Dispatch<React.SetStateAction<any[]>> }> = ({ notifications, setNotifications }) => {
  const { t, i18n: instance } = useTranslation();
  const { relativeDays } = useFormatters();
  const { navigate } = useRouter();
  const language = instance.resolvedLanguage || instance.language || 'en';
  const items = localizedNotifications(language);
  return <><PageHeader title={t('notifications.title')} desc={t('notifications.desc')} action={<Button variant="ghost" onClick={() => setNotifications(prev => prev.map(item => ({ ...item, isRead: true })))}>{t('notifications.markAllRead')}</Button>} />
    <Card>{items.slice(0, 8).map((notification, index) => <button className="notification" key={notification.id} onClick={() => { setNotifications(prev => prev.map(item => item.id === notification.id ? { ...item, isRead: true } : item)); navigate(notification.actionUrl || '/applications'); }}>
      <span className="notification-icon"><Icon name="bell" /></span>
      <span><strong>{notification.title}</strong><small>{notification.body}</small><em>{notification.isRead ? relativeDays(-index) : t('status.unread')}</em></span>
      <Icon name="arrow" />
    </button>)}</Card></>;
};

const Settings: React.FC<{ language?: boolean }> = ({ language }) => {
  const { t, i18n: instance } = useTranslation();
  const active = (instance.resolvedLanguage || instance.language) as SupportedLanguage;
  const toggles = [t('settings.toggle1'), t('settings.toggle2'), t('settings.toggle3'), t('settings.toggle4')];
  return <><PageHeader title={language ? t('settings.languageTitle') : t('settings.notifTitle')} desc={language ? t('settings.languageDesc') : t('settings.notifDesc')} />
    <Card>{language ? <div className="language-grid">{languageList.map(item => <button
      className={active === item.code ? 'selected' : ''}
      key={item.code}
      lang={item.code}
      onClick={() => { void instance.changeLanguage(item.code); }}
    >
      <span>{item.nativeName}</span>
      {active === item.code && <Icon name="check" />}
    </button>)}</div> : toggles.map((item, i) => <label className="toggle" key={item}><span><strong>{item}</strong><small>{t('settings.toggleHelp')}</small></span><input type="checkbox" defaultChecked={i < 3} /></label>)}</Card></>;
};

const Profile: React.FC<{ profile: StudentProfile; consents: ConsentItem[] }> = ({ profile, consents }) => {
  const { t } = useTranslation();
  const { navigate } = useRouter();
  return <><PageHeader title={t('profile.title')} desc={t('profile.desc')} action={<Button onClick={() => navigate('/profile/consent')}><Icon name="shield" />{t('profile.consentPrivacy')}</Button>} />
    <div className="detail-grid">
      <Card className="profile-card"><div className="profile-head"><span className="avatar large">{profile.name[0]}</span><div><h2>{profile.name}</h2><p>{profile.currentCourse} · {profile.institutionName}</p></div></div>
        <div className="data-grid">
          <div><small>{t('profile.mobile')}</small><strong>+91 {profile.mobile}</strong></div>
          <div><small>{t('profile.email')}</small><strong>{profile.email}</strong></div>
          <div><small>{t('profile.tribe')}</small><strong>{profile.tribe}</strong></div>
          <div><small>{t('profile.address')}</small><strong>{profile.district}, {profile.state}</strong></div>
        </div></Card>
      <Card className="permissions-card"><p className="eyebrow">{t('profile.connectedRecords')}</p><h2>{t('profile.permissionsActive', { active: consents.filter(item => item.granted).length, total: consents.length })}</h2><button className="link" onClick={() => navigate('/profile/consent')}>{t('profile.reviewPermissions')}</button></Card>
    </div></>;
};

/** Consent list. Titles/purposes come from `data.consents.<id>`. */
const ConsentForm: React.FC<{ consents: ConsentItem[]; save: (items: ConsentItem[]) => void }> = ({ consents, save }) => {
  const { t } = useTranslation();
  const [items, setItems] = useState(consents);
  const [optional, setOptional] = useState(true);
  const [confirm, setConfirm] = useState(false);
  const title = (item: ConsentItem) => t(`data.consents.${item.id}.title`, { defaultValue: item.title });
  const purpose = (item: ConsentItem) => t(`data.consents.${item.id}.purpose`, { defaultValue: item.purpose });
  return <><PageHeader back title={t('consentPage.title')} desc={t('consentPage.desc')} />
    <Card className="consent">
      <div className="notice"><Icon name="lock" />{t('consentPage.maskedNotice')}</div>
      {items.map(item => <label className="consent-row" key={item.id}>
        <span><strong>{title(item)}</strong><small>{purpose(item)}</small><em>{item.mandatory ? t('consentPage.required') : t('consentPage.optional')}</em></span>
        <input type="checkbox" checked={item.granted} disabled={item.mandatory} onChange={() => setItems(prev => prev.map(value => value.id === item.id ? { ...value, granted: !value.granted } : value))} />
      </label>)}
      <label className="consent-row"><span><strong>{t('consentPage.serviceNotifications')}</strong><small>{t('consentPage.serviceNotificationsText')}</small><em>{t('consentPage.optional')}</em></span><input type="checkbox" checked={optional} onChange={event => setOptional(event.target.checked)} /></label>
      <div className="form-actions"><Button onClick={() => setConfirm(true)}>{t('consentPage.revokeOptional')}</Button><Button variant="primary" onClick={() => save(items)}>{t('consentPage.save')}</Button></div>
    </Card>
    {confirm && <div className="overlay"><div className="dialog"><h2>{t('consentPage.revokeQuestion')}</h2><p>{t('consentPage.revokeExplain')}</p>
      <div className="form-actions"><Button onClick={() => setConfirm(false)}>{t('common.cancel')}</Button><Button variant="primary" onClick={() => { const next = items.map(item => item.mandatory ? item : { ...item, granted: false }); setItems(next); setOptional(false); save(next); setConfirm(false); }}>{t('consentPage.revokeAndSave')}</Button></div>
    </div></div>}</>;
};

const Officer: React.FC<{ cases: OfficerExceptionCase[] }> = ({ cases }) => {
  const { t } = useTranslation();
  const { navigate } = useRouter();
  return <><PageHeader title={t('officer.queueTitle')} desc={t('officer.queueDesc')} action={<Button onClick={() => navigate('/officer/reports?role=officer')}>{t('officer.reports')}</Button>} />
    <div className="kpis three"><Card><small>{t('officer.onTime')}</small><strong>{cases.filter(c => c.slaUrgency === 'normal').length}</strong></Card><Card><small>{t('officer.nearBreach')}</small><strong>{cases.filter(c => c.slaUrgency === 'warning').length}</strong></Card><Card><small>{t('officer.overdue')}</small><strong>{cases.filter(c => c.slaUrgency === 'critical').length}</strong></Card></div>
    <Table headers={[t('officer.colApplicant'), t('officer.colDistrict'), t('officer.colSla'), t('applications.colStatus'), '']}
      rows={cases.map(item => <button className="table-row" key={item.id} onClick={() => navigate(`/officer/cases/${item.id}`)}><span><strong>{item.applicantName}</strong><small>{t(`data.exceptionCategories.${item.exceptionCategory}`, { defaultValue: item.exceptionTitle })}</small></span><span>{item.district}, {item.state}</span><span>{item.slaUrgency === 'critical' ? t('officer.nearBreach') : t('officer.onTime')}</span><span><Status value={item.status} /></span><span><Icon name="arrow" /></span></button>)}
    /></>;
};

const Admin: React.FC = () => {
  const { t } = useTranslation();
  const { number } = useFormatters();
  const { navigate } = useRouter();
  const stats = calculateCoverageStats(initialCohort);
  const funnel: [string, number, number][] = [
    [t('admin.funnelMatched'), 100, stats.totalCohort],
    [t('admin.funnelRegistered'), 72, stats.registeredCount],
    [t('admin.funnelSubmitted'), 58, 1160],
    [t('admin.funnelSanctioned'), 44, 880],
    [t('admin.funnelDisbursed'), 31, 620],
  ];
  const gaps = [['Odisha', 78], ['Jharkhand', 71], ['Madhya Pradesh', 66], ['Chhattisgarh', 59]] as [string, number][];
  const kpis: [string, string][] = [
    [t('admin.coverageRate'), `${stats.coverageRate.toFixed(1)}%`],
    [t('admin.inProgress'), number(1160)],
    [t('admin.exceptionRate'), '14.2%'],
    [t('admin.outreachGap'), number(stats.unregisteredCount)],
  ];
  return <><PageHeader title={t('admin.dashboardTitle')} desc={t('admin.dashboardDesc')} action={<Button variant="primary" onClick={() => navigate('/admin/campaigns/new?role=admin')}>{t('admin.createCampaign')} <Icon name="plus" /></Button>} />
    <div className="kpis four">{kpis.map(item => <Card key={item[0]}><small>{item[0]}</small><strong>{item[1]}</strong><span>{t('admin.cohortView')}</span></Card>)}</div>
    <div className="admin-grid">
      <Card><SectionTitle eyebrow={t('admin.funnelEyebrow')} title={t('admin.funnelTitle')} /><div className="bars">{funnel.map(([name, width, count]) => <div key={name}><span>{name}</span><i style={{ width: `${width}%` }} /><b>{number(count)}</b></div>)}</div></Card>
      <Card><SectionTitle eyebrow={t('admin.gapEyebrow')} title={t('admin.gapTitle')} /><div className="bars">{gaps.map(([name, width]) => <div key={name}><span>{t(`data.districts.${name}`, { defaultValue: name })}</span><i style={{ width: `${width}%` }} /><b>{t('admin.gapPercent', { value: width })}</b></div>)}</div><button className="link" onClick={() => navigate('/admin/coverage?role=admin')}>{t('admin.openCoverageTable')}</button></Card>
    </div></>;
};

const GenericForm: React.FC<{ title: string; desc: string }> = ({ title, desc }) => {
  const { t } = useTranslation();
  return <><PageHeader back title={title} desc={desc} />
    <Card className="form-card">
      <div className="form-section"><label>{t('forms.audienceOrType')}</label><select defaultValue=""><option value="">{t('forms.chooseOption')}</option><option>{t('forms.incomeCertificate')}</option><option>{t('forms.unregisteredAudience')}</option></select></div>
      <div className="form-section"><label>{t('forms.messageNotes')}</label><textarea placeholder={t('forms.notesPlaceholder')} /></div>
      <div className="form-actions"><Button>{t('common.saveForLater')}</Button><Button variant="primary">{t('common.continue')} <Icon name="arrow" /></Button></div>
    </Card></>;
};

const EligibilityInteractive: React.FC<{ scheme: SchemeInfo; persona: Persona }> = ({ scheme, persona }) => {
  const { t } = useTranslation();
  const [income, setIncome] = useState(persona.profile.annualFamilyIncome);
  const [course, setCourse] = useState(persona.profile.currentCourse);
  const { navigate } = useRouter();
  const profile = { ...persona.profile, annualFamilyIncome: income, currentCourse: course };
  const result = evaluateEligibility(scheme.id, profile, persona.activeSchemeId);
  const schemeName = t(`data.schemes.${scheme.id}.name`);
  const heading = result.status === 'eligible' ? t('eligibility.canApply')
    : result.status === 'blocked_by_active_scholarship' ? t('eligibility.blockedTitle')
    : t('eligibility.notEligibleTitle');
  const summary = result.status === 'eligible' ? t('eligibility.summaryEligible', { scheme: schemeName })
    : result.status === 'blocked_by_active_scholarship' ? t('eligibility.summaryBlocked', { scheme: t(`data.schemes.${persona.activeSchemeId || 'pre-matric'}.name`) })
    : t('eligibility.summaryNotEligible', { reasons: result.failedChecks.map(item => item.title).join(', ') });
  const checks = [
    ...result.passedChecks.map(item => ({ key: item.title, title: item.title, detail: item.detail, ok: true })),
    ...result.failedChecks.map(item => ({ key: item.title, title: item.title, detail: item.reason, ok: false })),
  ];
  return <><PageHeader back title={t('eligibility.title')} desc={t('eligibility.checking', { scheme: schemeName })} />
    <Card className={`verdict verdict-${result.status}`}><Status value={result.status === 'eligible' ? 'verified' : result.status === 'blocked_by_active_scholarship' ? 'pending' : 'rejected'} />
      <div><h2>{heading}</h2><p>{summary}</p>
        {result.status === 'blocked_by_active_scholarship' && <small>{t('eligibility.activeSchemeNote', { scheme: t(`data.schemes.${persona.activeSchemeId || 'pre-matric'}.name`) })}</small>}</div></Card>
    <Card><SectionTitle eyebrow={t('eligibility.ruleCheck')} title={schemeName} />
      <div className="form-section"><label htmlFor="eligibility-income">{t('eligibility.annualIncome')}</label><input id="eligibility-income" type="number" value={income} onChange={event => setIncome(Number(event.target.value))} /></div>
      <div className="form-section"><label htmlFor="eligibility-course">{t('eligibility.currentCourse')}</label><input id="eligibility-course" value={course} onChange={event => setCourse(event.target.value)} /></div>
      <div className="checks">{checks.map((item, index) => <div key={`${item.title}-${index}`}><span className={item.ok ? 'check-ok' : 'check-no'}>{item.ok ? <Icon name="check" className="icon-15" /> : <Icon name="close" className="icon-15" />}</span><span><strong>{item.title}</strong><small>{item.detail}</small></span></div>)}</div>
      <div className="form-actions"><Button onClick={() => navigate(`/schemes/${scheme.id}`)}>{t('eligibility.backToScheme')}</Button>{result.canProceedToApply && <Button variant="primary" onClick={() => navigate(`/apply/${scheme.id}/step/1`)}>{t('eligibility.startApplication')}</Button>}</div>
    </Card></>;
};

/** Resolve a form field label/placeholder through i18n, falling back to the seed text. */
const fieldLabel = (t: TFunction, name: string, fallback: string) => t(`data.fields.${name}.label`, { defaultValue: fallback });
const fieldHelp = (t: TFunction, name: string, fallback?: string) => (fallback ? t(`data.fields.${name}.helpText`, { defaultValue: fallback }) : undefined);
const fieldPlaceholder = (t: TFunction, name: string, fallback?: string) => (fallback ? t(`data.fields.${name}.placeholder`, { defaultValue: fallback }) : undefined);

const FormPage: React.FC<{ persona: Persona; schemeId: SchemeId; step: number; drafts: Record<string, DraftApplication>; setDrafts: React.Dispatch<React.SetStateAction<Record<string, DraftApplication>>>; addApp: (app: ApplicationRecord) => void }> = ({ persona, schemeId, step, drafts, setDrafts, addApp }) => {
  const { t } = useTranslation();
  const { date } = useFormatters();
  const { navigate } = useRouter();
  const schema = schemeFormSchemas[schemeId];
  const current = schema.steps[Math.min(step - 1, schema.steps.length - 1)];
  const stepTitle = (index: number) => t(`data.steps.${schemeId}.${schema.steps[index]?.id}.title`, { defaultValue: schema.steps[index]?.title });
  const stepDescription = (index: number) => t(`data.steps.${schemeId}.${schema.steps[index]?.id}.description`, { defaultValue: schema.steps[index]?.description });
  const profileData = Object.fromEntries(
    schema.steps
      .flatMap(formStep => formStep.fields)
      .filter(field => field.prefillFromProfileKey)
      .map(field => [field.name, field.prefillFromProfileKey!.split('.').reduce((value: any, key: string) => value?.[key], persona.profile)])
      .filter(([, value]) => value !== undefined),
  );
  const [data, setData] = useState(drafts[schemeId]?.formData || profileData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const submitting = useRef(false);
  const total = schema.steps.length + 1;

  const save = () => setDrafts(prev => ({ ...prev, [schemeId]: { id: `draft-${schemeId}`, schemeId, schemeName: t(`data.schemes.${schemeId}.name`), lastSaved: t('common.justNow'), currentStepIndex: step - 1, formData: data, isComplete: false } }));

  const next = () => {
    const missing = step <= schema.steps.length ? current.fields.filter(field => field.required && !String(data[field.name] || '').trim()) : [];
    if (missing.length) {
      setErrors(Object.fromEntries(missing.map(field => [field.name, t('forms.isRequired', { field: fieldLabel(t, field.name, field.label) })])));
      return;
    }
    setErrors({});
    save();
    if (step < total) { navigate(`/apply/${schemeId}/step/${step + 1}`); return; }
    if (submitting.current) return;
    submitting.current = true;
    const stage = (key: string, fallback: string, days?: number) => ({ stage: key, label: fallback, date: days === undefined ? date(demoToday) : date(demoDate(days)), completed: days !== undefined, current: days === 0 });
    const app: ApplicationRecord = {
      id: `app-${Date.now()}`,
      applicationNumber: `NSP/DEMO/${Date.now().toString().slice(-6)}`,
      schemeId,
      schemeName: t(`data.schemes.${schemeId}.name`),
      academicYear: schema.academicYear,
      currentStatus: 'submitted',
      statusDescription: t('data.statuses.submitted.description'),
      submissionDate: date(demoToday),
      lastUpdated: date(demoToday),
      sourceSystem: schema.sourcePortal,
      sanctionedAmount: 24000,
      timeline: [
        { stage: 'draft', label: t('data.timelineStages.draft'), date: date(demoToday), completed: true },
        { stage: 'submitted', label: t('data.timelineStages.submitted'), date: date(demoToday), completed: true, current: true },
        { stage: 'institute_verification', label: t('data.timelineStages.institute_verification'), date: t('timeline.upcoming'), completed: false },
        { stage: 'state_verification', label: t('data.timelineStages.state_verification'), date: t('timeline.upcoming'), completed: false },
        { stage: 'sanctioned', label: t('data.timelineStages.sanctioned'), date: t('timeline.upcoming'), completed: false },
        { stage: 'dbt_initiated', label: t('data.timelineStages.dbt_initiated'), date: t('timeline.upcoming'), completed: false },
        { stage: 'disbursed', label: t('data.timelineStages.disbursed'), date: t('timeline.upcoming'), completed: false },
      ],
      pendingActionIds: [],
    };
    addApp(app);
    navigate(`/applications/${app.id}/receipt`);
  };

  return <><PageHeader back title={t(`data.schemes.${schemeId}.name`)} desc={t('forms.desc')} />
    <Card className="form-card">
      <div className="stepper">{Array.from({ length: total }).map((_, i) => <span className={i + 1 <= step ? 'active' : ''} key={i}><b>{i + 1}</b><small>{i === schema.steps.length ? t('forms.reviewStep') : stepTitle(i)}</small></span>)}</div>
      <small className="muted" style={{display:'block',marginBottom:'16px'}}>{t('forms.requiredHint')}</small>
      {step <= schema.steps.length ? <>
        <p className="eyebrow">{t('forms.stepLabel', { n: step })}</p>
        <h2>{stepTitle(step - 1)}</h2><p>{stepDescription(step - 1)}</p>
        {current.fields.map(field => <div className="form-section" key={field.name}>
          <label htmlFor={field.name}>{fieldLabel(t, field.name, field.label)}{field.required && ' *'}</label>
          {field.type === 'textarea' ? <textarea id={field.name} value={data[field.name] || ''} placeholder={fieldPlaceholder(t, field.name, field.placeholder)} onChange={e => setData({ ...data, [field.name]: e.target.value })} />
            : field.type === 'select' ? <select id={field.name} value={data[field.name] || ''} onChange={e => setData({ ...data, [field.name]: e.target.value })}><option value="">{t('common.selectOption')}</option>{field.options?.map(option => <option value={option.value} key={option.value}>{t(`data.gender.${option.value}`, { defaultValue: option.label })}</option>)}</select>
            : <input id={field.name} type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'} value={data[field.name] || ''} placeholder={fieldPlaceholder(t, field.name, field.placeholder)} onChange={e => setData({ ...data, [field.name]: e.target.value })} readOnly={field.type === 'readonly'} aria-readonly={field.type === 'readonly'} />}
          {fieldHelp(t, field.name, field.helpText) && <small className="muted">{fieldHelp(t, field.name, field.helpText)}</small>}
          {errors[field.name] && <small className="error-text">{errors[field.name]}</small>}
        </div>)}
      </> : <>
        <p className="eyebrow">{t('forms.finalReview')}</p><h2>{t('forms.finalReviewTitle')}</h2>
        <div className="review">{Object.entries(data).map(([key, value]) => <div key={key}><span>{key}</span><strong>{String(value)}</strong></div>)}</div>
      </>}
      <div className="form-actions">
        <Button onClick={() => navigate(step > 1 ? `/apply/${schemeId}/step/${step - 1}` : `/schemes/${schemeId}/eligibility`)}>{t('common.back')}</Button>
        <Button onClick={save}>{t('common.saveForLater')}</Button>
        <Button variant="primary" onClick={next}>{step === total ? t('forms.submit') : t('common.next')} <Icon name="arrow" /></Button>
      </div>
    </Card></>;
};

const FamilyPage: React.FC<{ persona: Persona }> = ({ persona }) => {
  const { t } = useTranslation();
  const { money } = useFormatters();
  const { navigate } = useRouter();
  const children = persona.children || [];
  return <><PageHeader title={t('dashboard.familyViewTitle')} desc={t('family.desc')} />
    <div className="family-grid">{children.length ? children.map(child => <Card key={child.id}>
      <div className="profile-head"><span className="avatar">{child.name[0]}</span><div><h2>{child.name}</h2><p>{t(`data.relationships.${child.relationship}`, { defaultValue: child.relationship })} · {child.institution}</p></div></div>
      <div className="family-meta"><span>{t(`data.schemes.${child.schemeId}.name`)}</span><Status value={child.status} /></div>
      <p>{t('family.pendingSummary', { count: child.pendingCount, amount: money(child.fundsDisbursed) })}</p>
      <Button variant="ghost" onClick={() => navigate(`/family/${child.id}?persona=${persona.id}`)}>{t('family.openChild')} <Icon name="arrow" /></Button>
    </Card>) : <Card><h2>{t('family.emptyTitle')}</h2><p>{t('family.emptyText')}</p></Card>}</div></>;
};

const PaymentsInteractive: React.FC<{ payments: PaymentRecord[] }> = ({ payments }) => {
  const { t } = useTranslation();
  const { money } = useFormatters();
  const { navigate } = useRouter();
  const [filter, setFilter] = useState('all');
  const visible = filter === 'all' ? payments : payments.filter(payment => payment.schemeId === filter);
  const total = visible.reduce((sum, item) => sum + item.amount, 0);
  return <><PageHeader title={t('paymentsPage.title')} desc={t('paymentsPage.desc')} />
    <div className="payment-summary"><Card><small>{t('paymentsPage.totalShown')}</small><strong>{money(total)}</strong><span>{t('paymentsPage.filteredRecords')}</span></Card><Card><small>{t('paymentsPage.dbtAccount')}</small><strong>•••• 4412</strong><span>{t('paymentsPage.seededMapped')}</span></Card></div>
    <Card className="table-card">
      <div className="table-toolbar"><label><Icon name="search" className="icon-16" /><input placeholder={t('paymentsPage.searchPayments')} aria-label={t('paymentsPage.searchPayments')} /></label>
        <select aria-label={t('paymentsPage.filterPayments')} value={filter} onChange={event => setFilter(event.target.value)}><option value="all">{t('paymentsPage.allSchemes')}</option>{Array.from(new Set(payments.map(payment => payment.schemeId))).map(id => <option value={id} key={id}>{t(`data.schemes.${id}.name`)}</option>)}</select></div>
      <div className="table-head"><span>{t('paymentsPage.colComponent')}</span><span>{t('paymentsPage.colAmount')}</span><span>{t('paymentsPage.colDate')}</span><span>{t('applications.colStatus')}</span><span /></div>
      {visible.map(payment => <button className="table-row" key={payment.id} onClick={() => navigate(`/payments/${payment.id}`)}><span><strong>{t(`data.schemes.${payment.schemeId}.name`)}</strong><small>{t(`data.components.${payment.component}`, { defaultValue: payment.component })} · {t('payments.installment')} {payment.installmentNo}</small></span><span className="amount">{money(payment.amount)}</span><span>{payment.disbursementDate}</span><span><Status value={payment.status} /></span><span><Icon name="arrow" /></span></button>)}
    </Card></>;
};

const PaymentDetailInteractive: React.FC<{ payment?: PaymentRecord }> = ({ payment }) => {
  const { t } = useTranslation();
  const { money } = useFormatters();
  const { navigate } = useRouter();
  if (!payment) return <div className="not-found"><PageHeader title={t('paymentsPage.notFound')} desc={t('paymentsPage.notFoundDesc')} /></div>;
  return <><PageHeader back title={t('paymentsPage.detailsTitle')} desc={t('paymentsPage.detailsDesc')} />
    <Card><div className="section-row"><div><p className="eyebrow">{payment.sourceSystem}</p><h2>{t(`data.schemes.${payment.schemeId}.name`)}</h2></div><Status value={payment.status} /></div>
      <div className="metric">{money(payment.amount)}</div>
      <div className="data-grid">
        <div><small>{t('paymentsPage.component')}</small><strong>{t(`data.components.${payment.component}`, { defaultValue: payment.component })}</strong></div>
        <div><small>{t('paymentsPage.installment')}</small><strong>#{payment.installmentNo}</strong></div>
        <div><small>{t('paymentsPage.disbursementDate')}</small><strong>{payment.disbursementDate}</strong></div>
        <div><small>{t('paymentsPage.bankAccount')}</small><strong>{payment.bankName} · {payment.accountNumberMasked}</strong></div>
        <div><small>UTR</small><strong>{payment.utrNumber}</strong></div>
        <div><small>{t('paymentsPage.pfms')}</small><strong>{payment.pfmsTransactionId}</strong></div>
      </div>
      <Button variant="ghost" onClick={() => navigate('/payments')}>{t('paymentsPage.back')}</Button></Card></>;
};

const NotificationsInteractive: React.FC<{ notifications: any[]; setNotifications: React.Dispatch<React.SetStateAction<any[]>> }> = ({ notifications, setNotifications }) => {
  const { t, i18n: instance } = useTranslation();
  const { relativeDays } = useFormatters();
  const { navigate } = useRouter();
  const language = instance.resolvedLanguage || instance.language || 'en';
  const items = localizedNotifications(language);
  return <><PageHeader title={t('notifications.title')} desc={t('notifications.desc')} action={<Button variant="ghost" onClick={() => setNotifications(prev => prev.map(item => ({ ...item, isRead: true })))}>{t('notifications.markAllRead')}</Button>} />
    <Card>{items.slice(0, 8).map((notification, index) => <button className="notification" key={notification.id} onClick={() => { setNotifications(prev => prev.map(item => item.id === notification.id ? { ...item, isRead: true } : item)); navigate(notification.actionUrl || '/applications'); }}>
      <span className="notification-icon"><Icon name="bell" /></span>
      <span><strong>{notification.title}</strong><small>{notification.body}</small><em>{notification.isRead ? relativeDays(-index) : t('status.unread')}</em></span>
      <Icon name="arrow" />
    </button>)}</Card></>;
};

const Redirect: React.FC<{ to: string }> = ({ to }) => {
  const { t } = useTranslation();
  const { navigate } = useRouter();
  useEffect(() => { navigate(to, { replace: true }); }, [to, navigate]);
  return <div className="login-page"><div className="login-card"><p className="eyebrow">{t('app.title')}</p><h1>{t('access.redirectTitle')}</h1><p>{t('access.redirectText')}</p></div></div>;
};

const AdminSubPage: React.FC<{ path: string }> = ({ path }) => {
  const { t } = useTranslation();
  const { navigate } = useRouter();

  if (path.includes('/campaigns/new')) return <><PageHeader back title={t('admin.campaignNewTitle')} desc={t('admin.campaignNewDesc')} />
    <Card className="form-card">
      <div className="form-section"><label htmlFor="campaign-audience">{t('admin.audience')}</label><select id="campaign-audience"><option>{t('forms.unregisteredAudience')}</option><option>{t('forms.incomeCertificate')}</option></select></div>
      <div className="form-section"><label htmlFor="campaign-message">{t('admin.message')}</label><textarea id="campaign-message" defaultValue={t('settings.languageDesc')} /></div>
      <div className="form-actions"><Button onClick={() => navigate('/admin/campaigns?role=admin')}>{t('admin.cancel')}</Button><Button variant="primary" onClick={() => navigate('/admin/campaigns?role=admin')}>{t('admin.create')}</Button></div>
    </Card></>;

  if (path.includes('/campaigns')) {
    const campaigns: [string, number][] = [[t('data.campaigns.campaign1'), 560], [t('data.campaigns.campaign2'), 184], [t('data.campaigns.campaign3'), 184]];
    return <><PageHeader title={t('admin.campaignTitle')} desc={t('admin.campaignDesc')} action={<Button variant="primary" onClick={() => navigate('/admin/campaigns/new?role=admin')}>{t('admin.newCampaign')}</Button>} />
      <Table headers={[t('admin.colCampaign'), t('admin.colAudience'), t('admin.colChannel'), t('applications.colStatus'), '']}
        rows={campaigns.map(([name, count], index) => <button className="table-row" key={name}><span><strong>{name}</strong><small>{t('admin.studentsCount', { count })}</small></span><span>{count}</span><span>{index === 0 ? t('admin.whatsapp') : t('admin.sms')}</span><span><Status value="sent" /></span><span><Icon name="arrow" /></span></button>)}
      /></>;
  }

  if (path.includes('/analytics')) return <><PageHeader title={t('admin.analyticsTitle')} desc={t('admin.analyticsDesc')} />
    <div className="admin-grid">
      <Card><SectionTitle eyebrow={t('admin.takeaway')} title={t('admin.takeawayCoverage')} /><div className="chart-placeholder"><div style={{height:'48%'}}/><div style={{height:'72%'}}/><div style={{height:'61%'}}/><div style={{height:'84%'}}/></div></Card>
      <Card><SectionTitle eyebrow={t('admin.takeaway')} title={t('admin.takeawayIncome')} /><div className="metric">14.2%</div></Card>
    </div></>;

  const districts = ['Sundargarh', 'Khunti', 'Mayurbhanj', 'Dumka', 'Bastar'];
  const states: Record<string, string> = { Sundargarh: 'Odisha', Khunti: 'Jharkhand', Mayurbhanj: 'Odisha', Dumka: 'Jharkhand', Bastar: 'Chhattisgarh' };
  return <><PageHeader title={t('admin.coverageTitle')} desc={t('admin.coverageDesc')} />
    <Table headers={[t('admin.colDistrict'), t('admin.colEligible'), t('admin.colRegistered'), t('admin.colGap'), '']}
      rows={districts.map((district, index) => <button className="table-row" key={district}><span><strong>{t(`data.districts.${district}`, { defaultValue: district })}</strong><small>{t(`data.districts.${states[district]}`)}</small></span><span>{180 + index * 34}</span><span>{128 + index * 21}</span><span><Status value={t('admin.gapPercent', { value: 28 + index * 4 })} tone="warning" /></span><span><Icon name="arrow" /></span></button>)}
    /></>;
};

const WalletInteractive: React.FC<{ profile: StudentProfile }> = ({ profile }) => {
  const { t } = useTranslation();
  const [result, setResult] = useState<OrchestrationResult | null>(null);
  const [outage, setOutage] = useState(false);
  const [running, setRunning] = useState(false);
  const run = async () => {
    setRunning(true);
    const next = await runParallelVerificationOrchestrator(profile, 'post-matric', outage ? { EDISTRICT: true } : {});
    setResult(next);
    setRunning(false);
  };
  return <><Wallet profile={profile} />
    <Card className="verification-card">
      <div className="section-row"><div><p className="eyebrow">{t('wallet.engineEyebrow')}</p><h2>{t('wallet.engineTitle')}</h2><p>{t('wallet.engineText')}</p></div><Button variant="primary" onClick={run}>{running ? t('wallet.checking') : t('wallet.runVerification')}</Button></div>
      <label className="toggle"><span><strong>{t('wallet.simulateOutage')}</strong><small>{t('wallet.simulateOutageText')}</small></span><input type="checkbox" checked={outage} onChange={event => setOutage(event.target.checked)} /></label>
      {result && <>
        <div className="kpis three"><Card><small>{t('wallet.verifiedCount')}</small><strong>{result.summary.verified}</strong></Card><Card><small>{t('wallet.mismatchCount')}</small><strong>{result.summary.mismatch}</strong></Card><Card><small>{t('wallet.unavailableCount')}</small><strong>{result.summary.unavailable}</strong></Card></div>
        <p className="notice"><Icon name="shield" />{result.nonBlockingGuaranteeNotice}</p>
        <div className="audit-list">{result.auditEntries.map(entry => <div className="compact-row" key={entry.id}><span><strong>{entry.providerName}</strong><small>{entry.summary}</small></span><Status value={entry.outcome} /></div>)}</div>
      </>}
    </Card></>;
};

const OfficerCaseInteractive: React.FC<{ item: OfficerExceptionCase; onDecision: (action: 'APPROVED' | 'CORRECTION_REQUESTED' | 'REJECTED', reason: string) => void }> = ({ item, onDecision }) => {
  const { t } = useTranslation();
  const { navigate } = useRouter();
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const hasMismatch = item.sideBySideFields.some(field => field.hasDiscrepancy);
  const decide = (action: 'APPROVED' | 'CORRECTION_REQUESTED' | 'REJECTED') => {
    if (!reason.trim()) { setError(t('officer.reasonRequired')); return; }
    onDecision(action, reason);
    setSaved(true);
  };
  return <><PageHeader back title={t('officer.caseReview')}
    desc={`${item.applicantName} · ${item.applicationNumber} · ${t('officer.slaSummary', { age: item.slaAgeDays, target: item.slaTargetDays })}`}
    action={<Button variant="ghost" onClick={() => navigate('/officer/queue')}>{t('officer.backToQueue')}</Button>} />
    <div className="case-grid">
      <Card><Status value={item.status} />{hasMismatch && <span className="status status-warning"><Icon name="info" className="icon-14" />{t('officer.dataMismatch')}</span>}
        <h2>{t(`data.exceptionCategories.${item.exceptionCategory}`, { defaultValue: item.exceptionTitle })}</h2>
        <p>{item.exceptionDescription}</p>
        <div className="comparison">{item.sideBySideFields.map(field => <div key={field.field}><strong>{field.label}</strong><span><small>{t('officer.entered')}</small>{field.enteredValue}</span><span className={field.hasDiscrepancy ? 'discrepancy' : ''}><small>{t('officer.source')}</small>{field.sourceValue}</span></div>)}</div></Card>
      <Card><SectionTitle eyebrow={t('officer.decisionEyebrow')} title={t('officer.decisionTitle')} />
        <label className="form-section" htmlFor="officer-reason">{t('officer.reasonLabel')}<textarea id="officer-reason" value={reason} placeholder={t('officer.reasonPlaceholder')} onChange={event => { setReason(event.target.value); setError(''); }} /></label>
        {error && <p className="error-text">{error}</p>}
        <div className="decision-buttons"><Button variant="primary" onClick={() => decide('APPROVED')}>{t('officer.approve')}</Button><Button onClick={() => decide('CORRECTION_REQUESTED')}>{t('officer.correction')}</Button><Button onClick={() => decide('REJECTED')}>{t('officer.reject')}</Button></div>
        {saved && <div className="success"><Icon name="check" />{t('officer.decisionRecordedNotify')}</div>}
      </Card>
    </div></>;
};

const UploadPage: React.FC = () => {
  const { t } = useTranslation();
  const { navigate } = useRouter();
  const [message, setMessage] = useState('');
  const [ready, setReady] = useState(false);
  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowed.includes(file.type)) { setReady(false); setMessage(t('wallet.badType')); return; }
    if (file.size > 5 * 1024 * 1024) { setReady(false); setMessage(t('wallet.tooBig')); return; }
    setReady(true);
    setMessage(t('wallet.readyUpload', { name: file.name }));
  };
  return <><PageHeader back title={t('wallet.uploadTitle')} desc={t('wallet.uploadDesc')} />
    <Card className="form-card">
      <div className="form-section"><label htmlFor="wallet-file">{t('wallet.fileLabel')}</label><input id="wallet-file" type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={handleFile} /></div>
      <small className="muted">{t('wallet.fileHint')}</small>
      {message && <p className={ready ? 'success' : 'error-text'}>{message}</p>}
      <div className="form-actions"><Button onClick={() => navigate('/wallet')}>{t('common.cancel')}</Button><Button variant="primary" disabled={!ready} onClick={() => navigate('/wallet')}>{t('wallet.upload')}</Button></div>
    </Card></>;
};

export default function App() {
  const { t, i18n: instance } = useTranslation();
  const { date, money } = useFormatters();
  const { currentPath, navigate } = useRouter();
  const { isLoggedIn, user, loginAsPersona, logout } = useAuth();
  const [personas, setPersonas] = useState(seedPersonas);
  const [dark, setDark] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, DraftApplication>>({});
  const [consents, setConsents] = useState(initialConsents);
  const [cases, setCases] = useState(initialOfficerExceptions);
  const [notifications, setNotifications] = useState<any[]>(seedNotifications);

  // A `?persona=` link is a convenience shortcut; otherwise authService restores the session.
  useEffect(() => {
    const personaFromUrl = new URLSearchParams(window.location.search).get('persona');
    if (personaFromUrl && !isLoggedIn) {
      loginAsPersona(personaFromUrl);
    }
  }, []);

  useEffect(() => { document.documentElement.classList.toggle('dark', dark); }, [dark]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleDark = () => setDark(!dark);

  const personaId = new URLSearchParams(window.location.search).get("persona") || "persona-1";
  const persona = personas.find(item => item.id === personaId) || personas[0];

  const addApp = (app: ApplicationRecord) => setPersonas(prev => prev.map(item => item.id === persona.id ? { ...item, applications: [...item.applications, app] } : item));

  const updateCase = (caseId: string, action: 'APPROVED' | 'CORRECTION_REQUESTED' | 'REJECTED', reason: string) => {
    const target = cases.find(item => item.id === caseId);
    setCases(prev => prev.map(item => item.id === caseId ? { ...item, status: action, decision: { action, officerId: 'demo-officer', officerName: 'Demo Officer', timestamp: new Date().toISOString(), remarks: reason, auditHash: 'SHA256-DEMO-AUDIT' } } : item));
    if (target) {
      setPersonas(prev => prev.map(item => ({
        ...item,
        applications: item.applications.map(application => application.id === target.applicationId ? {
          ...application,
          currentStatus: action === 'APPROVED' ? 'sanctioned' : action === 'CORRECTION_REQUESTED' ? 'deficiency_raised' : 'rejected',
          statusDescription: reason,
        } : application),
        pendingActions: action === 'CORRECTION_REQUESTED' ? item.pendingActions : item.pendingActions.filter(pending => !target.applicationId.includes(pending.id)),
      })));
      const language = instance.resolvedLanguage || instance.language || 'en';
      const template = NOTIFICATION_TEMPLATES.DWO_CORRECTION_REQUESTED;
      const body = (template?.inAppBody[language] || template?.inAppBody.en || '')
        .replace('{applicationNumber}', target.applicationNumber);
      setNotifications(prev => [{
        id: `notif-${Date.now()}`,
        eventType: 'DWO_CORRECTION_REQUESTED',
        title: template?.title[language] || template?.title.en || t('notifications.officerDecision'),
        body,
        timestamp: t('common.justNow'),
        isRead: false,
        priority: 'high',
        delivery: { inApp: true, sms: { sent: false, dltHeader: '', timestamp: '', text: '', dltTemplateId: '' }, whatsApp: { sent: false, timestamp: '', text: '', templateId: '' } },
        actionUrl: '/applications',
      }, ...prev]);
    }
  };

  const page = useMemo(() => {
    if (currentPath === '/') return <Landing />;
    if (currentPath === '/login') return <RolePicker />;
    if (currentPath === '/login/student') return <StudentLoginPage />;
    if (currentPath === '/login/officer') return <StaffLoginPage role="officer" />;
    if (currentPath === '/login/admin') return <StaffLoginPage role="admin" />;
    if (currentPath === '/home') return <Home persona={persona} />;
    if (currentPath === '/schemes') return <Schemes />;

    const eligibility = matchRoutePattern('/schemes/:id/eligibility', currentPath);
    if (eligibility.match) return <EligibilityInteractive scheme={schemesData.find(s => s.id === eligibility.params.id) || schemesData[0]} persona={persona} />;

    const scheme = matchRoutePattern('/schemes/:id', currentPath);
    if (scheme.match) return <SchemePage scheme={schemesData.find(s => s.id === scheme.params.id) || schemesData[0]} persona={persona} />;

    const form = matchRoutePattern('/apply/:schemeId/step/:n', currentPath);
    if (form.match) return <FormPage persona={persona} schemeId={form.params.schemeId as SchemeId} step={Number(form.params.n) || 1} drafts={drafts} setDrafts={setDrafts} addApp={addApp} />;

    if (currentPath === '/applications') return <Applications persona={persona} />;

    const receipt = matchRoutePattern('/applications/:id/receipt', currentPath);
    if (receipt.match) {
      const app = persona.applications.find(a => a.id === receipt.params.id);
      if (!app) return <div className="not-found"><PageHeader title={t('access.receiptNotFound')} desc={t('access.receiptNotFoundDesc')} /></div>;
      return <Receipt app={app} profile={persona.profile} />;
    }

    const app = matchRoutePattern('/applications/:id', currentPath);
    if (app.match) {
      const record = persona.applications.find(a => a.id === app.params.id);
      if (!record) return <div className="not-found"><PageHeader title={t('access.appNotFound')} desc={t('access.appNotFoundDesc')} /></div>;
      return <ApplicationDetail app={record} />;
    }

    const action = matchRoutePattern('/actions/:id', currentPath);
    if (action.match) {
      const record = persona.pendingActions.find(a => a.id === action.params.id);
      if (!record) return <div className="not-found"><PageHeader title={t('access.actionNotFound')} desc={t('access.actionNotFoundDesc')} /></div>;
      return <ActionPage action={record} />;
    }

    if (currentPath === '/wallet') return <WalletInteractive profile={persona.profile} />;
    if (currentPath === '/wallet/upload') return <UploadPage />;
    const doc = matchRoutePattern('/wallet/:docId', currentPath);
    if (doc.match) return <GenericForm title={t('forms.docDetailsTitle')} desc={t('forms.docDetailsDesc')} />;

    if (currentPath === '/payments') return <PaymentsInteractive payments={persona.payments} />;
    const payment = matchRoutePattern('/payments/:id', currentPath);
    if (payment.match) return <PaymentDetailInteractive payment={persona.payments.find(item => item.id === payment.params.id)} />;

    if (currentPath === '/help') return <Help />;
    if (currentPath === '/help/jago') return <JagoPage persona={persona} />;
    if (currentPath === '/notifications') return <NotificationsInteractive notifications={notifications} setNotifications={setNotifications} />;
    if (currentPath === '/settings/language') return <Settings language />;
    if (currentPath === '/settings/notifications') return <Settings />;
    if (currentPath === '/profile') return <Profile profile={persona.profile} consents={consents} />;
    if (currentPath === '/profile/consent') return <ConsentForm consents={consents} save={setConsents} />;
    if (currentPath === '/family' || currentPath.startsWith('/family/')) return <FamilyPage persona={persona} />;

    if (currentPath === '/officer/queue') return <Officer cases={cases} />;
    const caseMatch = matchRoutePattern('/officer/cases/:id', currentPath);
    if (caseMatch.match) {
      const record = cases.find(c => c.id === caseMatch.params.id);
      if (!record) return <div className="not-found"><PageHeader title={t('access.caseNotFound')} desc={t('access.caseNotFoundDesc')} /></div>;
      return <OfficerCaseInteractive item={record} onDecision={(action, reason) => updateCase(record.id, action, reason)} />;
    }
    if (currentPath === '/officer/reports') return <GenericForm title={t('officer.reportsTitle')} desc={t('officer.reportsDesc')} />;

    if (currentPath === '/admin') return <Admin />;
    if (currentPath.startsWith('/admin/')) return <AdminSubPage path={currentPath} />;

    return <div className="not-found"><PageHeader title={t('access.pageNotFound')} desc={t('access.pageNotFoundDesc')} /><Button variant="primary" onClick={() => navigate(isLoggedIn ? '/home' : '/')}>{isLoggedIn ? t('access.goHome') : t('access.goStart')}</Button></div>;
  }, [consents, currentPath, dark, drafts, isLoggedIn, navigate, persona, cases, notifications, instance.language]);

  const shell = (content: React.ReactNode, withJago = true) => (
    <Shell persona={persona} dark={dark} toggleDark={toggleDark} logout={handleLogout}>
      {withJago && <Jago persona={persona} />}
      {content}
    </Shell>
  );

  const signedInRole = user?.role;
  const isLoginRoute = currentPath.startsWith('/login');
  const wantsAdmin = currentPath.startsWith('/admin');
  const wantsOfficer = currentPath.startsWith('/officer');
  const isStaff = signedInRole === 'admin' || signedInRole === 'officer';
  const needsRole = wantsAdmin
    ? t('roles.adminTitle')
    : (wantsOfficer || (isStaff && isStudentOnlyPath(currentPath))) ? t('roles.officerTitle') : null;
  const roleBlocked = wantsAdmin
    ? signedInRole !== 'admin'
    : wantsOfficer
      ? (signedInRole !== 'officer' && signedInRole !== 'admin')
      : (isStaff && isStudentOnlyPath(currentPath));

  // Signed-out visitors can still read the landing page and reach any login screen.
  if (isLoginRoute) {
    return isLoggedIn ? <Redirect to={roleHome(signedInRole)} /> : page;
  }
  if (currentPath === '/') return shell(page, false);
  if (!isLoggedIn) return <Redirect to={loginPathFor(currentPath)} />;
  if (roleBlocked) {
    return shell(<>
      <PageHeader title={t('access.restricted')} desc={t('access.restrictedDesc', { role: needsRole ?? '', current: t(ROLE_META[signedInRole ?? 'student'].titleKey) })} />
      <Button variant="primary" onClick={() => navigate(roleHome(signedInRole))}>{t('access.goHome')}</Button>
      <Button onClick={() => navigate('/login')}>{t('landing.switchAccount')}</Button>
    </>);
  }
  return shell(page);
}
