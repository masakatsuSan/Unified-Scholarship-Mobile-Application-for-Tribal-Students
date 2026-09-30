import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Globe, 
  User, 
  ShieldCheck, 
  ChevronDown, 
  Wifi, 
  Users, 
  Smartphone,
  LogOut,
  Sparkles,
  Bell,
  Building2,
  Scale
} from 'lucide-react';
import { Persona } from '../types/index.ts';
import { languageList } from '../i18n/translations.ts';
import { useAuth } from '../auth/useAuth.tsx';

interface HeaderProps {
  currentPersona: Persona;
  personas: Persona[];
  onSelectPersona: (persona: Persona) => void;
  onOpenConsent: () => void;
  isPhoneFrame: boolean;
  onTogglePhoneFrame: () => void;
  isOfficerMode?: boolean;
  onToggleOfficerMode?: () => void;
  pendingExceptionsCount?: number;
  isMinistryAdminMode?: boolean;
  onToggleMinistryAdminMode?: () => void;
  unreadNotificationsCount?: number;
  onOpenNotifications?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPersona,
  personas,
  onSelectPersona,
  onOpenConsent,
  isPhoneFrame,
  onTogglePhoneFrame,
  isOfficerMode = false,
  onToggleOfficerMode,
  pendingExceptionsCount = 5,
  isMinistryAdminMode = false,
  onToggleMinistryAdminMode,
  unreadNotificationsCount = 0,
  onOpenNotifications,
}) => {
  const { t, i18n } = useTranslation();
  const { isLoggedIn, logout, loginAsPersona } = useAuth();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [personaMenuOpen, setPersonaMenuOpen] = useState(false);

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
    setLangMenuOpen(false);
  };

  const activeLang = languageList.find(l => l.code === i18n.language) || languageList[0];

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-sm" id="header-main">
      {/* Top Ministry Bar */}
      <div className="bg-amber-700/30 border-b border-amber-600/30 px-3 py-1 text-[11px] flex items-center justify-between text-amber-200">
        <div className="flex items-center gap-1.5 font-medium truncate">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{t('app.subtitle')}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={onTogglePhoneFrame}
            className="hidden md:flex items-center gap-1 text-[10px] bg-slate-800 hover:bg-slate-700 text-amber-300 px-2 py-0.5 rounded border border-slate-700 transition-colors"
            title="Toggle 360px Mobile Frame vs Responsive Width"
            id="toggle-mobile-frame-btn"
          >
            <Smartphone className="w-3 h-3" />
            <span>{isPhoneFrame ? 'Full Width' : '360px Frame'}</span>
          </button>
          <div className="flex items-center gap-1 text-[10px] text-emerald-400">
            <Wifi className="w-3 h-3" />
            <span className="hidden sm:inline">{t('common.online')}</span>
          </div>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="px-3 py-2.5 flex items-center justify-between gap-2 max-w-5xl mx-auto w-full">
        {/* Logo & Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-500 p-0.5 shadow-md shrink-0 flex items-center justify-center">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center text-amber-400 font-bold text-sm tracking-wider">
              <span>ST</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-white leading-tight">
                {t('app.title')}
              </h1>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30 font-medium">
                v1.0 MoTA
              </span>
            </div>
            <p className="text-[10px] text-slate-400 truncate max-w-[200px] sm:max-w-none">
              {t('app.tagline')}
            </p>
          </div>
        </div>

        {/* Right Actions: Persona Switcher, Language, Profile */}
        <div className="flex items-center gap-1.5">
          {/* Ministry Admin Coverage-Gap Toggle Button */}
          {onToggleMinistryAdminMode && (
            <button
              onClick={onToggleMinistryAdminMode}
              className={`flex items-center gap-1.5 text-[11px] font-bold px-2 py-1.5 rounded-lg border transition-all ${
                isMinistryAdminMode
                  ? 'bg-indigo-600 text-white border-indigo-400 shadow-md ring-1 ring-indigo-300'
                  : 'bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border-indigo-500/40'
              }`}
              id="header-ministry-admin-btn"
              title="Toggle Ministry Admin Coverage-Gap & Analytics Dashboard"
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden md:inline">{isMinistryAdminMode ? 'Student View' : 'Ministry Apex'}</span>
              <span className="text-[9px] bg-indigo-500/30 text-indigo-200 px-1.5 py-0.2 rounded-full font-mono font-bold">
                2K
              </span>
            </button>
          )}

          {/* DWO Officer Portal Toggle Button */}
          {onToggleOfficerMode && (
            <button
              onClick={onToggleOfficerMode}
              className={`flex items-center gap-1.5 text-[11px] font-bold px-2 py-1.5 rounded-lg border transition-all ${
                isOfficerMode
                  ? 'bg-blue-600 text-white border-blue-400 shadow-md ring-1 ring-blue-300'
                  : 'bg-blue-950/60 hover:bg-blue-900/60 text-blue-300 border-blue-500/40'
              }`}
              id="header-officer-console-btn"
              title="Toggle District Welfare Officer (DWO) Exception Review Console"
            >
              <Scale className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">{isOfficerMode ? 'Student View' : 'DWO Portal'}</span>
              <span className="text-[9px] bg-blue-500/30 text-blue-200 px-1.5 py-0.2 rounded-full font-mono font-bold">
                {pendingExceptionsCount}
              </span>
            </button>
          )}

          {/* Persona Switcher Quick Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setPersonaMenuOpen(!personaMenuOpen);
                setLangMenuOpen(false);
              }}
              className="flex items-center gap-1 text-[11px] font-medium bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 px-2 py-1.5 rounded-lg border border-amber-500/30 transition-colors"
              id="persona-switcher-btn"
              title="Quickly switch between the 6 MoTA demo personas"
            >
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline max-w-[90px] truncate">{currentPersona.name.split(' ')[0]}</span>
              <ChevronDown className="w-3 h-3 text-amber-400" />
            </button>

            {personaMenuOpen && (
              <div 
                className="absolute right-0 mt-2 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-1.5 z-50 text-slate-200"
                id="persona-dropdown-menu"
              >
                <div className="px-3 py-1.5 border-b border-slate-700/70 text-[10px] uppercase font-semibold text-amber-400 flex items-center justify-between">
                  <span>Switch Demo Persona</span>
                  <span className="text-[9px] text-slate-400">6 Personas</span>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-700/50">
                  {personas.map((p) => {
                    const isSelected = p.id === currentPersona.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          onSelectPersona(p);
                          setPersonaMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-700/70 transition-colors flex items-start gap-2 ${
                          isSelected ? 'bg-amber-500/10 text-amber-300' : 'text-slate-200'
                        }`}
                        id={`persona-select-${p.id}`}
                      >
                        <div className="w-6 h-6 rounded-full bg-slate-700 text-amber-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                          {p.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className="font-medium truncate text-[11px]">{p.name}</p>
                            {p.isParent && (
                              <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1 rounded font-normal shrink-0">Family</span>
                            )}
                            {p.id === 'persona-2' && (
                              <span className="text-[9px] bg-rose-500/20 text-rose-300 px-1 rounded font-normal shrink-0">Exception</span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 truncate">{p.tagline}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Language Selector (7 Languages) */}
          <div className="relative">
            <button
              onClick={() => {
                setLangMenuOpen(!langMenuOpen);
                setPersonaMenuOpen(false);
              }}
              className="flex items-center gap-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-1.5 rounded-lg border border-slate-700 transition-colors"
              id="language-switcher-btn"
              title="Switch UI Language"
            >
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">{activeLang.nativeName}</span>
              <span className="sm:hidden">{activeLang.code.toUpperCase()}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {langMenuOpen && (
              <div 
                className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-1 z-50 text-slate-200"
                id="language-dropdown-menu"
              >
                <div className="px-3 py-1.5 border-b border-slate-700/70 text-[10px] uppercase font-semibold text-slate-400">
                  Select Language (7 Languages)
                </div>
                {languageList.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-700 transition-colors flex items-center justify-between ${
                      i18n.language === lang.code ? 'text-amber-400 font-semibold bg-slate-700/50' : 'text-slate-300'
                    }`}
                    id={`lang-select-${lang.code}`}
                  >
                    <span>{lang.nativeName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({lang.name})</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notification Center Trigger */}
          {onOpenNotifications && (
            <button
              onClick={onOpenNotifications}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition-colors relative"
              title="Event Notification Center (In-App, SMS & WhatsApp)"
              id="header-notifications-btn"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-slate-900">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
          )}

          {/* DPDP Consent Icon Trigger */}
          <button
            onClick={onOpenConsent}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition-colors"
            title="DPDP Act 2023 Consent Settings"
            id="dpdp-consent-btn"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>

          {/* User Auth Status */}
          {isLoggedIn ? (
            <button
              onClick={logout}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 border border-slate-700 transition-colors"
              title="Logout"
              id="logout-btn"
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => loginAsPersona('persona-1')}
              className="text-[11px] bg-amber-600 hover:bg-amber-500 text-white font-medium px-2.5 py-1.5 rounded-lg shadow-sm transition-colors flex items-center gap-1"
              id="header-login-btn"
            >
              <User className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
