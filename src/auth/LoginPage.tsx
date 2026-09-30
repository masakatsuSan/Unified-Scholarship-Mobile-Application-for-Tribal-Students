import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from '../context/RouterContext.tsx';
import { useAuth } from './useAuth.tsx';
import { Button } from '../components/ui/Button.tsx';
import { ArrowRight, Banknote, ShieldCheck, User, Building2 } from 'lucide-react';
import { ROLE_META, accountsForRole, roleHome, DemoAccount } from './demoAccounts.ts';
import { UserRole } from './types.ts';

/** Workspace entries shown on the "choose your role" screen. */
const WORKSPACES: { role: UserRole; Icon: React.ComponentType<{ className?: string }>; path: string }[] = [
  { role: 'student', Icon: User, path: '/login/student' },
  { role: 'officer', Icon: ShieldCheck, path: '/login/officer' },
  { role: 'admin', Icon: Building2, path: '/login/admin' },
];

const LoginFrame: React.FC<{ eyebrow: string; title: string; lede: string; children: React.ReactNode; wide?: boolean }> = ({ eyebrow, title, lede, children, wide }) => (
  <div className="login-page">
    <div className={`login-card${wide ? ' login-card-wide' : ''}`}>
      <span className="emblem large">ST</span>
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p>{lede}</p>
      {children}
    </div>
  </div>
);

const DemoAccounts: React.FC<{ role: UserRole; onPick: (account: DemoAccount) => void; busy: boolean }> = ({ role, onPick, busy }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="or">{t('login.demoAccounts')}</div>
      <div className="demo-accounts">
        {accountsForRole(role).map(account => (
          <button key={account.id} className="demo-chip" onClick={() => onPick(account)} disabled={busy}>
            <span className="demo-initials">{account.initials}</span>
            <span>
              <strong>{account.name}</strong>
              <small>{t(account.subtitleKey, { defaultValue: account.subtitle })}</small>
            </span>
          </button>
        ))}
      </div>
    </>
  );
};

/* ------------------------------------------------------------------ */
/* /login — pick a workspace                                           */
/* ------------------------------------------------------------------ */
export const RolePicker: React.FC = () => {
  const { t } = useTranslation();
  const { navigate } = useRouter();
  const { isLoggedIn, user, logout } = useAuth();

  return (
    <LoginFrame
      eyebrow={t('login.govt')}
      title={t('login.title')}
      lede={t('login.lede')}
    >
      {isLoggedIn && user && (
        <div className="notice">
          {t('login.alreadySignedIn', {
            name: user.personaName,
            role: t(ROLE_META[user.role]?.titleKey ?? 'roles.studentTitle', { defaultValue: ROLE_META[user.role]?.title ?? user.role }),
          })}
          <Button onClick={() => { logout(); navigate('/login'); }}>{t('login.signOutSwitch')}</Button>
        </div>
      )}
      <div className="role-picker">
        {WORKSPACES.map(({ role, Icon, path }) => {
          const meta = ROLE_META[role];
          return (
            <button key={role} className="role-card" onClick={() => navigate(path)}>
              <Icon className="role-card-icon" />
              <span>
                <strong>{t(meta.titleKey, { defaultValue: meta.title })}</strong>
                <small>{t(meta.blurbKey)}</small>
              </span>
              <ArrowRight className="role-card-arrow" />
            </button>
          );
        })}
      </div>
      {isLoggedIn && user && (
        <Button variant="primary" onClick={() => navigate(roleHome(user.role))}>
          {t('login.continueWorkspace', {
            role: t(ROLE_META[user.role]?.titleKey ?? 'roles.studentTitle', { defaultValue: ROLE_META[user.role]?.title ?? 'your workspace' }),
          })}
        </Button>
      )}
    </LoginFrame>
  );
};

/* ------------------------------------------------------------------ */
/* /login/student — students and parents                               */
/* ------------------------------------------------------------------ */
export const StudentLoginPage: React.FC = () => {
  const { t } = useTranslation();
  const { navigate } = useRouter();
  const { loginAsPersona, loginWithDigiLocker, loginAsDemo, isLoading, error, clearError } = useAuth();
  const [stage, setStage] = useState<'mobile' | 'otp'>('mobile');
  const [mobile, setMobile] = useState('9876543210');
  const [code, setCode] = useState('123456');
  const [localError, setLocalError] = useState('');

  const finish = (personaId: string) => navigate(`/home?persona=${personaId}`, { replace: true });

  const verify = async () => {
    if (code !== '123456') { setLocalError(t('login.incorrectOtp', { code: '123456' })); return; }
    await loginAsPersona('persona-1');
    finish('persona-1');
  };

  const digilocker = async () => {
    await loginWithDigiLocker();
    finish('persona-1');
  };

  const useDemo = async (account: DemoAccount) => {
    await loginAsDemo(account.id);
    finish(account.personaId);
  };

  return (
    <LoginFrame
      eyebrow={t('login.govt')}
      title={t('login.studentTitle')}
      lede={t('login.studentLede')}
    >
      <button className="link login-back" onClick={() => navigate('/login')}>{t('login.switchWorkspace')}</button>
      {stage === 'mobile' ? (
        <>
          <label htmlFor="student-mobile">{t('login.mobileLabel')}<div className="phone-input"><span>+91</span><input id="student-mobile" inputMode="numeric" value={mobile} onChange={e => setMobile(e.target.value)} /></div></label>
          <Button variant="primary" onClick={() => setStage('otp')} disabled={!mobile.trim()}>{t('login.getOtp')} <ArrowRight className="icon-18" /></Button>
        </>
      ) : (
        <>
          <label htmlFor="student-otp">{t('login.otpLabel')}<input id="student-otp" inputMode="numeric" value={code} onChange={e => { setCode(e.target.value); setLocalError(''); clearError(); }} /></label>
          <small>{t('login.demoOtp', { code: '123456' })}</small>
          {(localError || error) && <span className="error-text">{localError || error}</span>}
          <Button variant="primary" onClick={verify} isLoading={isLoading}>{t('login.verifyContinue')}</Button>
          <Button onClick={() => setStage('mobile')}>{t('login.differentNumber')}</Button>
        </>
      )}
      {stage === 'mobile' && (
        <>
          <div className="or">{t('login.or')}</div>
          <Button onClick={digilocker} isLoading={isLoading}><Banknote className="icon-18" />{t('login.digilocker')}</Button>
        </>
      )}
      <DemoAccounts role="student" onPick={useDemo} busy={isLoading} />
      <DemoAccounts role="parent" onPick={useDemo} busy={isLoading} />
    </LoginFrame>
  );
};

/* ------------------------------------------------------------------ */
/* /login/officer and /login/admin — staff workspaces                  */
/* ------------------------------------------------------------------ */
export const StaffLoginPage: React.FC<{ role: 'officer' | 'admin' }> = ({ role }) => {
  const { t } = useTranslation();
  const { navigate } = useRouter();
  const { loginAsDemo, isLoading } = useAuth();
  const meta = ROLE_META[role];
  const roleTitle = t(meta.titleKey, { defaultValue: meta.title });
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const id = employeeId.trim().toLowerCase();
    const account = accountsForRole(role).find(a => a.personaId.toLowerCase() === id || a.id.toLowerCase() === id || a.name.toLowerCase() === id);
    if (!account) {
      setLocalError(t('login.unknownId'));
      return;
    }
    if (!password) { setLocalError(t('login.passwordRequired')); return; }
    setLocalError('');
    await loginAsDemo(account.id);
    navigate(roleHome(role), { replace: true });
  };

  const useDemo = async (account: DemoAccount) => {
    setLocalError('');
    await loginAsDemo(account.id);
    navigate(roleHome(role), { replace: true });
  };

  return (
    <LoginFrame
      eyebrow={role === 'admin' ? t('login.adminEyebrow') : t('login.officerEyebrow')}
      title={roleTitle}
      lede={t(meta.blurbKey)}
    >
      <button className="link login-back" onClick={() => navigate('/login')}>{t('login.switchWorkspace')}</button>
      <form className="login-form" onSubmit={submit}>
        <label htmlFor="staff-id">{t('login.employeeId')}<input id="staff-id" value={employeeId} onChange={e => { setEmployeeId(e.target.value); setLocalError(''); }} placeholder={role === 'admin' ? 'admin-demo' : t('login.employeePlaceholder')} autoComplete="username" /></label>
        <label htmlFor="staff-password">{t('login.password')}<input id="staff-password" type="password" value={password} onChange={e => { setPassword(e.target.value); setLocalError(''); }} placeholder={t('login.passwordPlaceholder')} autoComplete="current-password" /></label>
        {localError && <span className="error-text">{localError}</span>}
        <Button variant="primary" type="submit" isLoading={isLoading}>{t('login.signInAs', { role: roleTitle })} <ArrowRight className="icon-18" /></Button>
      </form>
      <DemoAccounts role={role} onPick={useDemo} busy={isLoading} />
    </LoginFrame>
  );
};

/** Kept for existing imports; the student screen is the default sign-in. */
export const LoginPage: React.FC<{ onLogin?: () => void }> = ({ onLogin }) => {
  const { t } = useTranslation();
  const { navigate } = useRouter();
  const { loginAsPersona } = useAuth();

  return (
    <LoginFrame eyebrow={t('login.govt')} title={t('login.title')} lede={t('login.studentLede')}>
      <Button variant="primary" onClick={async () => { await loginAsPersona('persona-1'); onLogin?.(); navigate('/home', { replace: true }); }}>
        {t('login.continueAs', { name: 'Ramesh Munda' })} <ArrowRight className="icon-18" />
      </Button>
      <Button onClick={() => navigate('/login')}>{t('login.seeAllOptions')}</Button>
    </LoginFrame>
  );
};
