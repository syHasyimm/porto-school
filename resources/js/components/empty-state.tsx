import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type EmptyStateProps = {
    action?: ReactNode;
    description: string;
    icon: LucideIcon;
    title: string;
};

export function EmptyState({
    action,
    description,
    icon: Icon,
    title,
}: EmptyStateProps) {
    return (
        <div className="grid min-h-64 place-items-center px-6 py-12 text-center">
            <div className="max-w-sm">
                <span className="mx-auto grid size-12 place-items-center rounded-xl bg-brand-50 text-brand-600">
                    <Icon aria-hidden="true" className="size-6" />
                </span>
                <h3 className="mt-4 font-heading text-lg font-bold text-slate-950">
                    {title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                    {description}
                </p>
                {action && <div className="mt-5">{action}</div>}
            </div>
        </div>
    );
}
