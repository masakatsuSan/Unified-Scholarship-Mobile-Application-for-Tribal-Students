import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverEffect?: boolean;
  className?: string;
  as?: 'div' | 'section' | 'article';
}

export const Card: React.FC<CardProps> = ({
  children,
  padding = 'md',
  hoverEffect = false,
  className = '',
  as: Component = 'div',
  ...props
}) => {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  return (
    <Component
      className={`
        bg-white dark:bg-slate-850
        rounded-xl
        border border-slate-200 dark:border-slate-800
        shadow-xs
        ${paddingClasses[padding]}
        ${hoverEffect ? 'hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all duration-200' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </Component>
  );
};

export const CardHeader: React.FC<{
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, action, className = '' }) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800 ${className}`}>
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0 flex items-center gap-2">{action}</div>}
    </div>
  );
};
