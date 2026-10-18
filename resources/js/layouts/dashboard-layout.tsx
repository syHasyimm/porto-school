import { Form, Link, usePage } from '@inertiajs/react';
import {
    BookOpenText,
    CalendarDays,
    FileText,
    GalleryHorizontalEnd,
    LayoutDashboard,
    LogOut,
    Menu,
    MessageSquareText,
    ContactRound,
    Send,
    History,
    Quote,
    School,
    Settings,
    UserRound,
    UserRoundCog,
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
    | 'teacher-contacts'
    | 'whatsapp-settings'
    | 'whatsapp-history'
    | 'users'
    | 'calendar'
    | 'complaints'
    | 'news'
    | 'gallery'
    | 'testimonials'
    | 'settings'
    | 'profile';

type NavigationItem = {
    group?: string;
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
    {
        group: 'Sekolah',
        key: 'dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
    },
    {
        group: 'Sekolah',
        key: 'calendar',
        label: 'Kalender akademik',
        icon: CalendarDays,
    },
    { group: 'Sekolah', key: 'teachers', label: 'Data guru', icon: UsersRound },
    { group: 'Sekolah', key: 'users', label: 'Akun guru', icon: UserRoundCog },
    {
        group: 'Sekolah',
        key: 'complaints',
        label: 'Pengaduan',
        icon: MessageSquareText,
    },
    {
        group: 'WhatsApp',
        key: 'teacher-contacts',
        label: 'Kontak guru',
        icon: ContactRound,
    },
    {
        group: 'WhatsApp',
        key: 'whatsapp-settings',
        label: 'Pengaturan WhatsApp',
        icon: Send,
    },
    {
        group: 'WhatsApp',
        key: 'whatsapp-history',
        label: 'Riwayat pengiriman',
        icon: History,
    },
    { group: 'Website', key: 'news', label: 'Berita', icon: FileText },
    {
        group: 'Website',
        key: 'gallery',
        label: 'Galeri',
        icon: GalleryHorizontalEnd,
    },
    { group: 'Website', key: 'testimonials', label: 'Testimoni', icon: Quote },
    {
        group: 'Website',
        key: 'settings',
        label: 'Pengaturan website',
        icon: Settings,
    },
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
    const groups = Array.from(
        new Set(items.map((item) => item.group ?? 'Menu utama')),
        (label) => ({
            label,
            items: items.filter(
                (item) => (item.group ?? 'Menu utama') === label,
            ),
        }),
    );

    const sidebar = (
        <div className="flex h-full flex-col bg-brand-50 text-slate-700">
            <div className="flex h-18 shrink-0 items-center gap-3 border-b border-brand-100 bg-brand-100/60 px-5">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-600 text-white shadow-sm shadow-brand-600/20">
                    <School
                        aria-hidden="true"
                        className="size-5"
                        strokeWidth={1.8}
                    />
                </span>
                <div className="min-w-0">
                    <p className="truncate font-heading text-sm font-bold text-slate-900">
                        {name}
                    </p>
                    <p className="mt-0.5 text-[11px] font-semibold text-slate-500">
                        Portal internal sekolah
                    </p>
                </div>
            </div>

            <nav
                className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain px-3 py-3"
                aria-label="Navigasi dashboard"
            >
                {groups.map((group) => (
                    <div key={group.label} className="flex flex-col gap-1">
                        <p className="px-3 text-[10px] font-bold tracking-[0.12em] text-slate-500 uppercase">
                            {group.label}
                        </p>
                        <ul
                            aria-label={group.label}
                            className="flex flex-col gap-0.5"
                        >
                            {group.items.map((item) => {
                                const Icon = item.icon;
                                const isActive = active === item.key;
                                const linkClassName = cn(
                                    'flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 lg:min-h-8.5 lg:py-1.5',
                                    isActive
                                        ? 'bg-brand-600 font-semibold text-white shadow-sm shadow-brand-600/15'
                                        : 'text-slate-600 hover:bg-white/80 hover:text-brand-700',
                                );

                                return (
                                    <li key={item.key}>
                                        {item.href ? (
                                            <Link
                                                href={item.href}
                                                aria-current={
                                                    isActive
                                                        ? 'page'
                                                        : undefined
                                                }
                                                onClick={() =>
                                                    setMobileOpen(false)
                                                }
                                                className={linkClassName}
                                            >
                                                <Icon
                                                    aria-hidden="true"
                                                    className="size-4.5 shrink-0"
                                                    strokeWidth={1.8}
                                                />
                                                <span className="truncate">
                                                    {item.label}
                                                </span>
                                            </Link>
                                        ) : (
                                            <span
                                                aria-disabled="true"
                                                className="flex min-h-11 cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-slate-400 lg:min-h-8.5 lg:py-1.5"
                                            >
                                                <Icon
                                                    aria-hidden="true"
                                                    className="size-4.5 shrink-0"
                                                    strokeWidth={1.8}
                                                />
                                                <span className="truncate">
                                                    {item.label}
                                                </span>
                                            </span>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>

            <div className="shrink-0 border-t border-brand-100 bg-brand-100/60 p-3">
                <div className="mb-2 flex items-center gap-3 px-1">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-600 text-sm font-bold text-white shadow-sm shadow-brand-600/20">
                        {auth.user?.name.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-900">
                            {auth.user?.name}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                            {auth.user?.email}
                        </p>
                    </div>
                </div>
                <Form action={logout()}>
                    {({ processing }) => (
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-brand-100 bg-white/85 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-white hover:text-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:opacity-50 lg:h-9"
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
            <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-brand-100 lg:block">
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
