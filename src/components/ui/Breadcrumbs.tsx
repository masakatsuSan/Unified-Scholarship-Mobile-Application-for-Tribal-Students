import React from 'react';
import { ChevronRight, Home, ArrowLeft } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onBack?: () => void;
  showBackButton?: boolean;
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  onBack,
  showBackButton = true,
  className = '',
}) => {
  return (
    <div className={`flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-3 ${className}`}>
      {showBackButton && onBack && (
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1 text-teal-700 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-300 font-medium py-1 px-2 rounded-md hover:bg-teal-50 dark:hover:bg-teal-950/40 transition-colors mr-1 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>
      )}

      <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-1.5">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;

          return (
            <React.Fragment key={idx}>
              {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0" />}
              {isLast || (!item.href && !item.onClick) ? (
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px] sm:max-w-none">
                  {item.label}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={item.onClick}
                  className="hover:text-teal-700 dark:hover:text-teal-300 transition-colors cursor-pointer truncate max-w-[150px] sm:max-w-none"
                >
                  {item.label}
                </button>
              )}
            </React.Fragment>
          );
        })}
      </nav>
    </div>
  );
};
