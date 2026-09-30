import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Globe,
  User,
  ShieldCheck,
  ChevronDown,
  Bell,
  Sun,
  Moon,
  Menu,
  X,
  Building2,
  Check,
  ExternalLink,
  HelpCircle,
  FileText,
  CreditCard,
  FolderLock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Persona } from '../../types/index.ts';
import { languageList } from '../../i18n/translations.ts';
import { useRouter } from '../../context/RouterContext.tsx';
import { useAuth } from '../../auth/useAuth.tsx';

interface HeaderProps {
  currentPersona: Persona;
  personas: Persona[];
  onSelectPersona: (persona: Persona) => void;
  unreadNotificationsCount?: number;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPersona,
  personas,
  onSelectPersona,
  unreadNotificationsCount = 0,
  darkMode,
  onToggleDarkMode,
}) => {
  const { t, i18n } = useTranslation();
  const { currentPath, navigate } = useRouter();
  const { isLoggedIn, logout } = useAuth();

  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const langRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangMenuOpen(false);
      }
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
    setLangMenuOpen(false);
  };

  const activeLang = languageList.find(l => l.code === i18n.language) || languageList[0];

  const navLinks = [
    { label: 'Home', path: '/home' },
    { label: 'Schemes', path: '/schemes' },
    { label: 'Applications', path: '/applications' },
    { label: 'DigiLocker Wallet', path: '/wallet' },
    { label: 'DBT Payments', path: '/payments' },
    { label: 'Help', path: '/help' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-2xs">
      {/* 1. Tricolor Authority Strip (Thin Saffron, White, Green) */}
      <div className="h-1 w-full flex">
        <div className="flex-1 bg-amber-500"></div>
        <div className="flex-1 bg-white border-y border-slate-200"></div>
        <div className="flex-1 bg-emerald-600"></div>
      </div>

      {/* 2. Top Ministry Identification Bar */}
      <div className="bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 px-4 py-1 text-xs text-slate-600 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 truncate">
            {/* Ashoka Emblem Placeholder */}
            <div className="w-4 h-4 rounded-full border border-amber-600/60 flex items-center justify-center text-[9px] font-serif font-bold text-amber-700 dark:text-amber-500 shrink-0">
              🏛
            </div>
            <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
              Ministry of Tribal Affairs (MoTA), Government of India
            </span>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-600">|</span>
            <span className="hidden sm:inline truncate">जनजातीय कार्य मंत्रालय, भारत सरकार</span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden md:flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>DigiLocker & NPCI Verified</span>
            </span>
            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="p-1 rounded-md text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={darkMode ? 'Switch to Light theme' : 'Switch to Dark theme'}
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Main Header Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Logo & Portal Identity */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => navigate('/')}
        >
          <div className="w-10 h-10 rounded-xl bg-teal-800 dark:bg-teal-700 text-white flex items-center justify-center font-bold text-base shadow-xs group-hover:bg-teal-900 transition-colors shrink-0">
            <span>ST</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-slate-100 tracking-tight leading-none truncate">
                ST Scholarship Saathi
              </span>
              <span className="hidden lg:inline-flex text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800">
                MoTA Apex
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
              Unified Portal for Pre-Matric, Post-Matric, Top Class & Fellowships
            </p>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden xl:flex items-center gap-1">
          {navLinks.map(link => {
            const isActive = currentPath === link.path || currentPath.startsWith(link.path + '/');
            return (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`
                  px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap
                  ${
                    isActive
                      ? 'text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }
                `}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Right Controls: Notifications, Role Switcher, Language & Account */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Notifications Bell */}
          <button
            onClick={() => navigate('/notifications')}
            className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Notification Center (In-App, SMS, WhatsApp)"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Compact Language Selector (Never clipped) */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors cursor-pointer"
              aria-label="Select Language"
            >
              <Globe className="w-4 h-4 text-teal-700 dark:text-teal-400 shrink-0" />
              <span className="font-semibold">{activeLang.nativeName}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${langMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                  Select Language (7 Localized)
                </div>
                {languageList.map(l => (
                  <button
                    key={l.code}
                    onClick={() => handleLanguageChange(l.code)}
                    className="w-full text-left px-3.5 py-2 text-sm flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="font-medium text-slate-800 dark:text-slate-200">{l.nativeName}</div>
                      <div className="text-xs text-slate-400">{l.name}</div>
                    </div>
                    {i18n.language === l.code && <Check className="w-4 h-4 text-teal-700 dark:text-teal-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Account / Role Dropdown */}
          <div className="relative" ref={accountRef}>
            <button
              onClick={() => setAccountMenuOpen(!accountMenuOpen)}
              className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 flex items-center justify-center font-bold text-xs shrink-0">
                {currentPersona.name.charAt(0)}
              </div>
              <div className="hidden sm:block text-left max-w-[120px] truncate">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate leading-tight">
                  {currentPersona.name}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {currentPersona.profile.tribe} ST
                </div>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${accountMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {accountMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Persona</div>
                  <div className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5 truncate">
                    {currentPersona.name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {currentPersona.profile.institutionName}
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setAccountMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>My Profile & APAAR ID</span>
                  </button>
                  <button
                    onClick={() => {
                      navigate('/profile/consent');
                      setAccountMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>DPDP Consent & Privacy</span>
                  </button>
                  <button
                    onClick={() => {
                      navigate('/family');
                      setAccountMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer"
                  >
                    <Layers className="w-4 h-4 text-amber-600" />
                    <span>Family / Sibling Switcher</span>
                  </button>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 px-3 py-1.5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Demo Student Personas
                  </div>
                  {personas.map(p => (
                    <button
                      key={p.id}
                      onClick={() => {
                        onSelectPersona(p);
                        setAccountMenuOpen(false);
                        navigate('/home');
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer ${
                        p.id === currentPersona.id ? 'bg-teal-50 text-teal-800 dark:bg-teal-950/50 dark:text-teal-300 font-bold' : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <span className="truncate">{p.name} ({p.activeSchemeId})</span>
                      {p.id === currentPersona.id && <Check className="w-3.5 h-3.5 text-teal-700 shrink-0" />}
                    </button>
                  ))}
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 px-3 pt-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Official Portals
                  </div>
                  <button
                    onClick={() => {
                      setAccountMenuOpen(false);
                      navigate('/officer/queue');
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <Building2 className="w-3.5 h-3.5 text-teal-700" />
                    <span>DWO Verification Officer Console</span>
                  </button>
                  <button
                    onClick={() => {
                      setAccountMenuOpen(false);
                      navigate('/admin');
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>MoTA Apex Admin Dashboard</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Collapsible Navigation Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 animate-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col space-y-1">
            {navLinks.map(link => {
              const isActive = currentPath === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => {
                    navigate(link.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`
                    w-full text-left px-3 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer
                    ${
                      isActive
                        ? 'text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 font-semibold'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }
                  `}
                >
                  {link.label}
                </button>
              );
            })}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-1">
              <button
                onClick={() => {
                  navigate('/officer/queue');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-teal-800 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/30 rounded-lg cursor-pointer"
              >
                Verification Officer Queue
              </button>
              <button
                onClick={() => {
                  navigate('/admin');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-amber-800 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded-lg cursor-pointer"
              >
                Ministry Apex Admin
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
