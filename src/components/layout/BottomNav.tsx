import React from 'react';
import { Home, FileText, FolderLock, CreditCard, HelpCircle, Bot } from 'lucide-react';
import { useRouter } from '../../context/RouterContext.tsx';

interface BottomNavProps {
  pendingActionsCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ pendingActionsCount = 0 }) => {
  const { currentPath, navigate } = useRouter();

  const navItems = [
    { label: 'Home', path: '/home', icon: Home },
    { label: 'Applications', path: '/applications', icon: FileText, badge: pendingActionsCount > 0 ? pendingActionsCount : undefined },
    { label: 'Wallet', path: '/wallet', icon: FolderLock },
    { label: 'Payments', path: '/payments', icon: CreditCard },
    { label: 'Help & JAGO', path: '/help/jago', icon: Bot, isAssistant: true },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-lg pb-safe"
      aria-label="Mobile Bottom Navigation"
    >
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentPath === item.path || (item.path !== '/home' && currentPath.startsWith(item.path));

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`
                relative flex flex-col items-center justify-center min-h-[44px] py-1 px-1 transition-colors cursor-pointer select-none
                ${
                  isActive
                    ? 'text-teal-800 dark:text-teal-300 font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }
              `}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 text-teal-800 dark:text-teal-300' : ''
                  }`}
                />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 bg-amber-600 text-white rounded-full text-[10px] font-bold w-4 h-4 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1 leading-none truncate max-w-[64px]">
                {item.label}
              </span>
              {isActive && (
                <div className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-teal-800 dark:bg-teal-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
