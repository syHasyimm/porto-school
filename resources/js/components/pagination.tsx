import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import type { PaginationLink } from '@/types';

type PaginationProps = {
    from: number | null;
    links: PaginationLink[];
    to: number | null;
    total: number;
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

export function Pagination({ from, links, to, total }: PaginationProps) {
    if (total === 0) {
        return null;
    }

    return (
        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 px-5 py-4 sm:flex-row">
            <p className="text-xs font-semibold text-slate-500">
                Menampilkan {from} sampai {to} dari {total} data
            </p>
            <nav
                aria-label="Paginasi"
                className="flex flex-wrap items-center gap-1"
            >
                {links.map((link, index) => {
                    const label = readableLabel(link.label);

                    if (!link.url) {
                        return (
                            <span
                                key={`${link.label}-${index}`}
                                className="grid min-h-9 min-w-9 place-items-center rounded-lg px-2 text-xs font-bold text-slate-300"
                            >
                                {label}
                            </span>
                        );
                    }

                    return (
                        <Link
                            key={`${link.label}-${index}`}
                            href={link.url}
                            preserveScroll
                            className={cn(
                                'grid min-h-9 min-w-9 place-items-center rounded-lg px-2 text-xs font-bold transition-colors',
                                link.active
                                    ? 'bg-brand-500 text-white'
                                    : 'text-slate-600 hover:bg-slate-100',
                            )}
                        >
                            {label}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
