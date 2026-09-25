import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export const buttonVariants = cva(
    'inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:pointer-events-none disabled:opacity-55',
    {
        variants: {
            variant: {
                primary: 'bg-brand-500 text-white hover:bg-brand-600',
                secondary:
                    'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50',
                ghost: 'text-slate-700 hover:bg-slate-100',
                danger: 'bg-red-600 text-white hover:bg-red-700',
            },
            size: {
                default: 'h-10 px-4',
                sm: 'h-9 px-3 text-xs',
                lg: 'h-11 px-5',
                icon: 'size-10 px-0',
            },
        },
        defaultVariants: {
            variant: 'primary',
            size: 'default',
        },
    },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
    VariantProps<typeof buttonVariants>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
    { className, size, variant, ...props },
    ref,
) {
    return (
        <button
            ref={ref}
            className={cn(buttonVariants({ size, variant }), className)}
            {...props}
        />
    );
});
