import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';

type PageHeaderProps = {
    action?: ReactNode;
    breadcrumbs?: Array<{ label: string; href?: string }>;
    description?: string;
    title: string;
};

export function PageHeader({
    action,
    breadcrumbs = [],
    description,
    title,
}: PageHeaderProps) {
    return (
        <header className="mb-7">
            {breadcrumbs.length > 0 && (
                <nav
                    aria-label="Breadcrumb"
                    className="mb-3 flex flex-wrap items-center gap-1 text-xs font-semibold text-slate-500"
                >
                    {breadcrumbs.map((item, index) => (
                        <span
                            key={`${item.label}-${index}`}
                            className="flex items-center gap-1"
                        >
                            {index > 0 && (
                                <ChevronRight
                                    aria-hidden="true"
                                    className="size-3.5"
                                />
                            )}
                            {item.href ? (
                                <Link
                                    href={item.href}
                                    className="hover:text-brand-600"
                                >
                                    {item.label}
                                </Link>
                            ) : (
                                <span>{item.label}</span>
                            )}
                        </span>
                    ))}
                </nav>
            )}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                    <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                        {title}
                    </h1>
                    {description && (
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                            {description}
                        </p>
                    )}
                </div>
                {action && <div className="shrink-0">{action}</div>}
            </div>
        </header>
    );
}
