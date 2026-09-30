import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Home, 
  FileText, 
  FolderLock, 
  CreditCard, 
  HelpCircle 
} from 'lucide-react';

export type NavTab = 'home' | 'applications' | 'wallet' | 'payments' | 'help';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  pendingActionsCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  pendingActionsCount,
}) => {
  const { t } = useTranslation();

  const navItems: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: t('nav.home'), icon: Home },
    { id: 'applications', label: t('nav.applications'), icon: FileText },
    { id: 'wallet', label: t('nav.wallet'), icon: FolderLock },
    { id: 'payments', label: t('nav.payments'), icon: CreditCard },
    { id: 'help', label: t('nav.help'), icon: HelpCircle },
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-30 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 pb-safe max-w-5xl mx-auto"
      id="bottom-nav-bar"
    >
      <div className="flex items-center justify-around px-1 py-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all relative ${
                isActive 
                  ? 'text-amber-400 font-semibold scale-105' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              id={`nav-item-${item.id}`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
                {item.id === 'home' && pendingActionsCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-slate-900">
                    {pendingActionsCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight leading-none text-center truncate max-w-[64px]">
                {item.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 bg-amber-400 rounded-full mt-1"></span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
