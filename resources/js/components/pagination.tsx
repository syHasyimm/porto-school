import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PaginationLink } from '@/types';

type PaginationProps = {
    from: number | null;
    links: PaginationLink[];
    to: number | null;
    total: number;
    variant?: 'default' | 'public';
    itemLabel?: string;
};

function readableLabel(label: string): string {
    if (label.includes('Previous')) {
        return 'Sebelumnya';
    }

    if (label.includes('Next')) {
        return 'Berikutnya';
    }

    return label;
}

export function Pagination({
    from,
    links,
    to,
    total,
    variant = 'default',
    itemLabel = 'data',
}: PaginationProps) {
    if (total === 0) {
        return null;
    }

    const isPublic = variant === 'public';

    return (
        <div
            className={cn(
                isPublic
                    ? 'flex flex-col items-center justify-between gap-5 lg:flex-row'
                    : 'flex flex-col items-center justify-between gap-4 border-t border-slate-200 px-5 py-4 sm:flex-row',
            )}
        >
            <p
                className={cn(
                    isPublic
                        ? 'shrink-0 text-center text-sm leading-6 text-slate-500 lg:text-left'
                        : 'text-xs font-semibold text-slate-500',
                )}
            >
                {isPublic ? (
                    <>
                        Menampilkan{' '}
                        <span className="font-semibold text-slate-800">
                            {from ?? 0} sampai {to ?? 0}
                        </span>{' '}
                        dari{' '}
                        <span className="font-semibold text-slate-800">
                            {total}
                        </span>{' '}
                        {itemLabel}
                    </>
                ) : (
                    <>
                        Menampilkan {from} sampai {to} dari {total} {itemLabel}
                    </>
                )}
            </p>
            <nav
                aria-label="Paginasi"
                className={cn(
                    'flex flex-wrap items-center gap-1',
                    isPublic &&
                        'max-w-full justify-center rounded-3xl border border-[#dde4ef] bg-white p-1.5 shadow-[0_6px_20px_-12px_rgba(39,58,88,0.2)] sm:gap-1.5 sm:rounded-full sm:p-2',
                )}
            >
                {links.map((link, index) => {
                    const label = readableLabel(link.label);
                    const isPrevious = label === 'Sebelumnya';
                    const isNext = label === 'Berikutnya';
                    const isDirectional = isPrevious || isNext;
                    const controlClassName = isPublic
                        ? 'inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-2 rounded-full px-3 text-xs font-semibold transition-[color,background-color,box-shadow,translate] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 motion-reduce:transition-none'
                        : 'grid min-h-9 min-w-9 place-items-center rounded-lg px-2 text-xs font-bold';
                    const content = isPublic ? (
                        <>
                            {isPrevious && (
                                <ChevronLeft
                                    aria-hidden="true"
                                    className="size-4"
                                />
                            )}
                            <span
                                className={cn(
                                    isDirectional && 'sr-only sm:not-sr-only',
                                )}
                            >
                                {label}
                            </span>
                            {isNext && (
                                <ChevronRight
                                    aria-hidden="true"
                                    className="size-4"
                                />
                            )}
                        </>
                    ) : (
                        label
                    );

                    if (!link.url) {
                        return (
                            <span
                                key={`${link.label}-${index}`}
                                aria-disabled={label !== '...' || undefined}
                                className={cn(
                                    controlClassName,
                                    isPublic
                                        ? 'text-slate-400'
                                        : 'text-slate-300',
                                )}
                            >
                                {content}
                            </span>
                        );
                    }

                    return (
                        <Link
                            key={`${link.label}-${index}`}
                            href={link.url}
                            preserveScroll
                            aria-current={link.active ? 'page' : undefined}
                            aria-label={
                                isDirectional ? label : `Halaman ${label}`
                            }
                            className={cn(
                                controlClassName,
                                isPublic
                                    ? link.active
                                        ? 'bg-brand-700 text-white shadow-[0_4px_12px_-3px_rgba(30,64,175,0.35)]'
                                        : 'text-slate-600 hover:bg-brand-50 hover:text-brand-700 motion-safe:hover:-translate-y-0.5'
                                    : cn(
                                          'transition-colors',
                                          link.active
                                              ? 'bg-brand-500 text-white'
                                              : 'text-slate-600 hover:bg-slate-100',
                                      ),
                            )}
                        >
                            {content}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
