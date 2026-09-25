import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
    'inline-flex items-center rounded-md px-2 py-1 text-xs font-bold',
    {
        variants: {
            variant: {
                neutral: 'bg-slate-100 text-slate-700',
                blue: 'bg-brand-50 text-brand-700',
                green: 'bg-emerald-50 text-emerald-700',
                amber: 'bg-amber-50 text-amber-800',
                red: 'bg-red-50 text-red-700',
            },
        },
        defaultVariants: { variant: 'neutral' },
    },
);

type BadgeProps = HTMLAttributes<HTMLSpanElement> &
    VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
    return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
