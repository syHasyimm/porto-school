import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                'rounded-xl border border-slate-200 bg-white shadow-[0_12px_36px_-28px_rgba(15,23,42,0.45)]',
                className,
            )}
            {...props}
        />
    );
}
