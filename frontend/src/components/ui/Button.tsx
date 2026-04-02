import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'glass';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    'relative inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none',
                    {
                        'bg-primary text-dark-900 hover:bg-primary-hover shadow-[0_0_20px_-5px_rgba(204,255,0,0.5)] hover:shadow-[0_0_25px_-5px_rgba(204,255,0,0.6)]': variant === 'primary',
                        'bg-dark-800 text-white hover:bg-dark-700 border border-dark-700': variant === 'secondary',
                        'bg-transparent text-white hover:bg-white/5': variant === 'ghost',
                        'bg-glass backdrop-blur-md border border-glass-border text-white hover:bg-glass-hover hover:border-white/20': variant === 'glass',
                        'px-4 py-2 text-sm': size === 'sm',
                        'px-6 py-3 text-base': size === 'md',
                        'px-8 py-4 text-lg': size === 'lg',
                    },
                    className
                )}
                disabled={isLoading}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';

export default Button;
