import React from 'react';
import { Header } from './Header.tsx';
import { BottomNav } from './BottomNav.tsx';
import { FloatingJagoPanel } from './FloatingJagoPanel.tsx';
import { Persona } from '../../types/index.ts';
import { useRouter } from '../../context/RouterContext.tsx';
import { Phone, Mail, Shield, Globe, ExternalLink } from 'lucide-react';
import { useAuth } from '../../auth/useAuth.tsx';

interface AppShellProps {
  children: React.ReactNode;
  currentPersona: Persona;
  personas: Persona[];
  onSelectPersona: (p: Persona) => void;
  unreadNotificationsCount?: number;
  pendingActionsCount?: number;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  currentPersona,
  personas,
  onSelectPersona,
  unreadNotificationsCount = 0,
  pendingActionsCount = 0,
  darkMode,
  onToggleDarkMode,
}) => {
  const { logout } = useAuth();
  const { navigate, currentPath } = useRouter();

  // Hide bottom nav on specific administrative or full-screen routes if needed
  const isPublicLanding = currentPath === '/';

  return (
    <div className={`min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 ${darkMode ? 'dark' : ''}`}>
      {/* Top Header */}
      <Header
        currentPersona={currentPersona}
        personas={personas}
        onSelectPersona={onSelectPersona}
        unreadNotificationsCount={unreadNotificationsCount}
        darkMode={darkMode}
        onToggleDarkMode={onToggleDarkMode}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-12">
        {children}
      </main>

      {/* Floating JAGO Assistant Button & Panel on every page */}
      <FloatingJagoPanel currentPersona={currentPersona} />

      {/* Mobile Bottom Navigation (Hidden on desktop) */}
      {!isPublicLanding && <BottomNav pendingActionsCount={pendingActionsCount} />}

      {/* Portal Footer */}
      <footer className="bg-white dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 py-8 px-4 sm:px-6 mt-auto text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <div className="w-8 h-8 rounded-lg bg-teal-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
              ST
            </div>
            <div>
              <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                ST Scholarship Saathi • Ministry of Tribal Affairs
              </div>
              <div className="text-[11px] mt-0.5">
                Government of India • In alignment with DPDP Act 2023 & NEP 2020 APAAR Registry
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium">
            <button
              onClick={() => navigate('/help')}
              className="hover:text-teal-700 dark:hover:text-teal-300 flex items-center gap-1 cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>National Toll-Free: 1800-11-7788</span>
            </button>
            <button
              onClick={() => navigate('/profile/consent')}
              className="hover:text-teal-700 dark:hover:text-teal-300 flex items-center gap-1 cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Data Privacy & Consent</span>
            </button>
            <button
              onClick={() => navigate('/settings/language')}
              className="hover:text-teal-700 dark:hover:text-teal-300 flex items-center gap-1 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Languages (7 Indian Languages)</span>
            </button>
          </div>

          <div className="text-center sm:text-right text-[11px] text-slate-400">
            <div>Designed for Scheduled Tribe scholars across India</div>
            <div className="mt-0.5">Pre-Matric • Post-Matric • Top Class • NFST • NOS</div>
          </div>
        </div>
      </footer>
    </div>
  );
};
