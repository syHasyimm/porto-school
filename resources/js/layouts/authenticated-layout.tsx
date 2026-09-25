import { Link, usePage } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import { logout } from '@/routes';

type AuthenticatedLayoutProps = PropsWithChildren<{
    title: string;
}>;

export default function AuthenticatedLayout({
    children,
    title,
}: AuthenticatedLayoutProps) {
    const { auth, name } = usePage().props;
    const user = auth.user;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
            <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-blue-600 dark:text-blue-400">
                            {name}
                        </p>
                        <h1 className="truncate text-lg font-bold">{title}</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden text-right sm:block">
                            <p className="text-sm font-semibold">
                                {user?.name}
                            </p>
                            <p className="text-xs text-slate-500 capitalize dark:text-slate-400">
                                {user?.role}
                            </p>
                        </div>
                        <Link
                            href={logout()}
                            as="button"
                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-slate-700 dark:hover:bg-slate-800"
                        >
                            Keluar
                        </Link>
                    </div>
                </div>
            </header>

            <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
}
