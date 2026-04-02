import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    hoverEffect?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, hoverEffect = false, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    'bg-glass backdrop-blur-xl border border-glass-border rounded-2xl p-6 transition-all duration-300',
                    hoverEffect && 'hover:bg-glass-hover hover:border-white/20 hover:scale-[1.02] hover:shadow-2xl',
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = 'Card';

export default Card;
