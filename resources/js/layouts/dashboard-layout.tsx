import { Form, Link, usePage } from '@inertiajs/react';
import {
    BookOpenText,
    CalendarDays,
    ChevronRight,
    FileText,
    GalleryHorizontalEnd,
    LayoutDashboard,
    LogOut,
    Menu,
    MessageSquareText,
    School,
    Settings,
    UserRound,
    UsersRound,
    X,
    type LucideIcon,
} from 'lucide-react';
import { useState, type PropsWithChildren } from 'react';
import { FlashMessage } from '@/components/flash-message';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { logout } from '@/routes';

export type DashboardNavKey =
    | 'dashboard'
    | 'teachers'
    | 'calendar'
    | 'complaints'
    | 'news'
    | 'gallery'
    | 'settings'
    | 'profile';

type NavigationItem = {
    href?: string;
    icon: LucideIcon;
    key: DashboardNavKey;
    label: string;
};

type DashboardLayoutProps = PropsWithChildren<{
    active: DashboardNavKey;
    dashboardHref: string;
    navigation?: NavigationItem[];
    title: string;
}>;

export const adminNavigation: NavigationItem[] = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'teachers', label: 'Data guru', icon: UsersRound },
    { key: 'calendar', label: 'Kalender akademik', icon: CalendarDays },
    { key: 'complaints', label: 'Pengaduan', icon: MessageSquareText },
    { key: 'news', label: 'Berita', icon: FileText },
    { key: 'gallery', label: 'Galeri', icon: GalleryHorizontalEnd },
    { key: 'settings', label: 'Pengaturan', icon: Settings },
];

export const guruNavigation: NavigationItem[] = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'profile', label: 'Profil saya', icon: UserRound },
];

export default function DashboardLayout({
    active,
    children,
    dashboardHref,
    navigation = adminNavigation,
    title,
}: DashboardLayoutProps) {
    const { auth, name } = usePage().props;
    const [mobileOpen, setMobileOpen] = useState(false);
    const items = navigation.map((item) => ({
        ...item,
        href: item.key === 'dashboard' ? dashboardHref : item.href,
    }));

    const sidebar = (
        <div className="flex h-full flex-col bg-slate-950 text-slate-200">
            <div className="flex h-20 items-center gap-3 border-b border-white/10 px-5">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-500 text-white">
                    <School
                        aria-hidden="true"
                        className="size-5"
                        strokeWidth={1.8}
                    />
                </span>
                <div className="min-w-0">
                    <p className="font-heading text-sm font-bold text-white">
                        {name}
                    </p>
                    <p className="mt-0.5 text-[11px] font-semibold text-slate-400">
                        Portal internal sekolah
                    </p>
                </div>
            </div>

            <nav
                className="flex-1 space-y-1 overflow-y-auto px-3 py-5"
                aria-label="Navigasi dashboard"
            >
                {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = active === item.key;

                    if (!item.href) {
                        return (
                            <span
                                key={item.key}
                                aria-disabled="true"
                                className="flex h-11 cursor-not-allowed items-center gap-3 rounded-lg px-3 text-sm font-semibold text-slate-600"
                            >
                                <Icon
                                    aria-hidden="true"
                                    className="size-5"
                                    strokeWidth={1.8}
                                />
                                {item.label}
                            </span>
                        );
                    }

                    return (
                        <Link
                            key={item.key}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                                'flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition-colors',
                                isActive
                                    ? 'bg-brand-500 text-white'
                                    : 'text-slate-300 hover:bg-white/7 hover:text-white',
                            )}
                        >
                            <Icon
                                aria-hidden="true"
                                className="size-5"
                                strokeWidth={1.8}
                            />
                            {item.label}
                            {isActive && (
                                <ChevronRight
                                    aria-hidden="true"
                                    className="ml-auto size-4"
                                />
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t border-white/10 p-4">
                <div className="mb-4 flex items-center gap-3 px-1">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/10 text-sm font-bold text-white">
                        {auth.user?.name.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-white">
                            {auth.user?.name}
                        </p>
                        <p className="truncate text-xs text-slate-400">
                            {auth.user?.email}
                        </p>
                    </div>
                </div>
                <Form action={logout()}>
                    {({ processing }) => (
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-white/15 text-sm font-bold text-slate-200 transition hover:bg-white/7 disabled:opacity-50"
                        >
                            <LogOut aria-hidden="true" className="size-4" />
                            Keluar
                        </button>
                    )}
                </Form>
            </div>
        </div>
    );

    return (
        <div className="min-h-[100dvh] bg-slate-50 text-slate-950">
            <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 lg:block">
                {sidebar}
            </aside>

            {mobileOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <button
                        type="button"
                        aria-label="Tutup navigasi"
                        className="absolute inset-0 bg-slate-950/55"
                        onClick={() => setMobileOpen(false)}
                    />
                    <aside className="relative h-full w-[min(18rem,88vw)] shadow-2xl">
                        {sidebar}
                    </aside>
                </div>
            )}

            <div className="lg:pl-72">
                <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="lg:hidden"
                            aria-label={
                                mobileOpen ? 'Tutup navigasi' : 'Buka navigasi'
                            }
                            onClick={() => setMobileOpen((value) => !value)}
                        >
                            {mobileOpen ? (
                                <X className="size-5" />
                            ) : (
                                <Menu className="size-5" />
                            )}
                        </Button>
                        <div>
                            <p className="text-xs font-semibold text-slate-500">
                                {auth.user?.role === 'admin'
                                    ? 'Administrator'
                                    : 'Guru'}
                            </p>
                            <p className="font-heading text-sm font-bold text-slate-900">
                                {title}
                            </p>
                        </div>
                    </div>
                    <BookOpenText
                        aria-hidden="true"
                        className="size-5 text-brand-500"
                        strokeWidth={1.8}
                    />
                </header>

                <main className="mx-auto w-full max-w-[1440px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
                    <FlashMessage />
                    {children}
                </main>
            </div>
        </div>
    );
}
