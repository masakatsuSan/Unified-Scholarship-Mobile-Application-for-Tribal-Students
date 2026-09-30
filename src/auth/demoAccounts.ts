import { UserRole } from './types.ts';

export interface DemoAccount {
  id: string;
  role: UserRole;
  /** Persona id for student/parent accounts; a synthetic id for staff. */
  personaId: string;
  name: string;
  /**
   * Translation key for the account subtitle. Rendered with `t()`, so the demo
   * account list reads naturally in the language the visitor picked.
   */
  subtitleKey: string;
  /** English subtitle, kept for non-UI contexts and as a `t()` fallback. */
  subtitle: string;
  initials: string;
}

/**
 * Ready-made accounts for demos and testing. Each maps to a real seeded persona
 * (or a staff identity) so the whole workspace can be explored without credentials.
 */
export const DEMO_ACCOUNTS: DemoAccount[] = [
  { id: 'demo-student-ramesh', role: 'student', personaId: 'persona-1', name: 'Ramesh Munda', subtitleKey: 'data.demoAccounts.ramesh', subtitle: 'Class IX · Pre-Matric · DBT initiated', initials: 'RM' },
  { id: 'demo-student-sunita', role: 'student', personaId: 'persona-2', name: 'Sunita Oraon', subtitleKey: 'data.demoAccounts.sunita', subtitle: 'B.Tech 2nd Year · Post-Matric', initials: 'SO' },
  { id: 'demo-student-birsa', role: 'student', personaId: 'persona-3', name: 'Birsa Gond', subtitleKey: 'data.demoAccounts.birsa', subtitle: 'MBBS 1st Year · Top Class', initials: 'BG' },
  { id: 'demo-parent-somra', role: 'parent', personaId: 'persona-6', name: 'Somra Kerketta', subtitleKey: 'data.demoAccounts.somra', subtitle: 'Parent · 2 linked children', initials: 'SK' },
  { id: 'demo-officer', role: 'officer', personaId: 'officer-demo', name: 'Dr. K. S. Meena, DWO', subtitleKey: 'data.demoAccounts.officer', subtitle: 'District Welfare Officer · Khunti', initials: 'KM' },
  { id: 'demo-admin', role: 'admin', personaId: 'admin-demo', name: 'MoTA National Monitoring Wing', subtitleKey: 'data.demoAccounts.admin', subtitle: 'Ministry of Tribal Affairs · New Delhi', initials: 'MW' },
];

export interface RoleMeta {
  /** i18n key for the workspace title. */
  titleKey: string;
  /** i18n key for the workspace description. */
  blurbKey: string;
  /** English title, kept as a `t()` fallback. */
  title: string;
  home: string;
  loginPath: string;
  demoId: string;
}

export const ROLE_META: Record<UserRole, RoleMeta> = {
  student: {
    titleKey: 'roles.studentTitle',
    blurbKey: 'roles.studentBlurb',
    title: 'Student / Parent',
    home: '/home',
    loginPath: '/login/student',
    demoId: 'demo-student-ramesh',
  },
  parent: {
    titleKey: 'roles.parentTitle',
    blurbKey: 'roles.parentBlurb',
    title: 'Student / Parent',
    home: '/home',
    loginPath: '/login/student',
    demoId: 'demo-parent-somra',
  },
  officer: {
    titleKey: 'roles.officerTitle',
    blurbKey: 'roles.officerBlurb',
    title: 'Verification Officer',
    home: '/officer/queue',
    loginPath: '/login/officer',
    demoId: 'demo-officer',
  },
  admin: {
    titleKey: 'roles.adminTitle',
    blurbKey: 'roles.adminBlurb',
    title: 'Ministry Admin',
    home: '/admin',
    loginPath: '/login/admin',
    demoId: 'demo-admin',
  },
};

export const roleHome = (role: UserRole | undefined): string => (role && ROLE_META[role]?.home) || '/home';

/** Staff and student workspaces are separate; pick the login page that fits a path. */
export const loginPathFor = (path: string): string => {
  if (path.startsWith('/admin')) return '/login/admin';
  if (path.startsWith('/officer')) return '/login/officer';
  return '/login/student';
};

/** Routes that only exist for the signed-in student / guardian. */
const STUDENT_ONLY_PREFIXES = [
  '/home',
  '/schemes',
  '/apply',
  '/applications',
  '/actions',
  '/wallet',
  '/payments',
  '/help',
  '/notifications',
  '/profile',
  '/family',
  '/settings',
];

/**
 * True when a path belongs to the student workspace. Staff accounts land on
 * `/` and `/login/*`, so they must be redirected away from these routes rather
 * than shown an empty shell.
 */
export const isStudentOnlyPath = (path: string): boolean =>
  STUDENT_ONLY_PREFIXES.some(prefix => path === prefix || path.startsWith(`${prefix}/`));

export const accountsForRole = (role: UserRole): DemoAccount[] => DEMO_ACCOUNTS.filter(a => a.role === role);
