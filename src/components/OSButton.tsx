import React from 'react';

interface OSButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'default';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const OSButton: React.FC<OSButtonProps> = ({
  children,
  variant = 'default',
  size = 'md',
  icon,
  className = '',
  ...props
}) => {
  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-0.5 text-sm',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  const parentSizeClasses = {
    xs: 'border-[1px] rounded-[5px]',
    sm: 'border-[1.5px] rounded-[5px]',
    md: 'border-[1.5px] rounded-[6px]',
    lg: 'border-[1.5px] rounded-[6px]',
  };

  const childSizeClasses = {
    xs: 'px-1.5 py-0.5 text-[11px] gap-0.5 rounded-[5px] translate-y-[-1px] hover:translate-y-[-2px] active:-translate-y-px border-[1.5px] -mx-px',
    sm: 'px-2 py-0.5 text-xs gap-1 rounded-[5px] translate-y-[-2px] hover:translate-y-[-3px] active:translate-y-[-1.5px] border-[1.5px] mx-[-1.5px]',
    md: 'px-2.5 py-1 gap-1 rounded-[6px] text-[13px] translate-y-[-2px] hover:translate-y-[-3px] active:translate-y-[-1.5px] border-[1.5px] mx-[-1.5px]',
    lg: 'px-3 py-1.5 text-[15px] gap-1 rounded-[6px] translate-y-[-2px] hover:translate-y-[-4px] active:translate-y-[-1px] border-[1.5px] mx-[-1.5px]',
  };

  if (variant === 'primary' || variant === 'secondary') {
    return (
      <button
        className={`
          relative inline-block text-center group
          ${parentSizeClasses[size]}
          ${variant === 'primary'
            ? 'bg-button-shadow dark:bg-button-shadow-dark border-button-border'
            : 'bg-orange dark:bg-button-shadow-dark border-button-border'
          }
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
        {...props}
      >
        <span
          className={`
            flex items-center justify-center no-underline font-bold select-none
            ${childSizeClasses[size]}
            ${variant === 'primary'
              ? 'bg-orange text-black border-button-border dark:border-button-border hover:text-black'
              : 'bg-white text-black border-button-border dark:bg-dark dark:text-white dark:border-orange'
            }
            transition-all duration-100
          `}
        >
          {icon && <span className="w-4 h-4">{icon}</span>}
          {children}
        </span>
      </button>
    );
  }

  // Default variant
  return (
    <button
      className={`
        inline-flex items-center gap-1 rounded border border-transparent
        text-primary transition-colors
        hover:border-primary hover:bg-accent/50
        active:bg-accent active:border-primary
        disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:bg-transparent
        ${sizeClasses[size]}
        ${className}
      `}
      {...props}
    >
      {icon && <span className="w-4 h-4">{icon}</span>}
      {children}
    </button>
  );
};
