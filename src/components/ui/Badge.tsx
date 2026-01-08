import type { HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
}

export const Badge = ({ className, variant = 'neutral', ...props }: BadgeProps) => {
    return (
        <span
            className={twMerge(
                clsx(
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                    {
                        'bg-emerald-100 text-emerald-800': variant === 'success',
                        'bg-amber-100 text-amber-800': variant === 'warning',
                        'bg-red-100 text-red-800': variant === 'danger',
                        'bg-blue-100 text-blue-800': variant === 'info',
                        'bg-slate-100 text-slate-800': variant === 'neutral',
                    },
                    className
                )
            )}
            {...props}
        />
    );
};
