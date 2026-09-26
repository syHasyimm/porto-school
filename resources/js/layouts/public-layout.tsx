import { Link, usePage } from '@inertiajs/react';
import {
    ExternalLink,
    Mail,
    MapPin,
    Menu,
    Phone,
    School,
    X,
} from 'lucide-react';
import { useState, type PropsWithChildren } from 'react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { dashboard, home, login } from '@/routes';
import { index as calendarIndex } from '@/routes/calendar';
import { create as complaintCreate } from '@/routes/complaints';
import { index as galleryIndex } from '@/routes/gallery';
import { index as newsIndex } from '@/routes/news';
import { index as teachersIndex } from '@/routes/teachers';

export default function PublicLayout({ children }: PropsWithChildren) {
    const { auth, name, site } = usePage().props;
    const [open, setOpen] = useState(false);
    const nav = [
        { label: 'Beranda', href: home.url() },
        { label: 'Profil', href: `${home.url()}#profil` },
        { label: 'Guru', href: teachersIndex.url() },
        { label: 'Kalender', href: calendarIndex.url() },
        { label: 'Pengaduan', href: complaintCreate.url() },
        { label: 'Berita', href: newsIndex.url() },
        { label: 'Galeri', href: galleryIndex.url() },
        { label: 'Kontak', href: `${home.url()}#kontak` },
    ];

    return (
        <div className="min-h-[100dvh] bg-white text-slate-950">
            <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
                <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link
                        href={home()}
                        className="flex min-w-0 items-center gap-3"
                    >
                        <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-brand-500 text-white">
                            {site.logo_url ? (
                                <img
                                    src={site.logo_url}
                                    alt=""
                                    className="size-full bg-white object-contain p-1"
                                />
                            ) : (
                                <School
                                    aria-hidden="true"
                                    className="size-5"
                                    strokeWidth={1.8}
                                />
                            )}
                        </span>
                        <span className="min-w-0">
                            <span className="block truncate font-heading text-sm font-bold sm:text-base">
                                {name}
                            </span>
                            <span className="block text-[11px] font-semibold text-slate-500">
                                Sekolah dasar negeri
                            </span>
                        </span>
                    </Link>

                    <nav
                        className="hidden items-center gap-6 lg:flex"
                        aria-label="Navigasi utama"
                    >
                        {nav.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="text-sm font-semibold text-slate-600 transition hover:text-brand-600"
                            >
                                {item.label}
                            </Link>
                        ))}
                        <Link
                            href={auth.user ? dashboard() : login()}
                            className={buttonVariants({ size: 'sm' })}
                        >
                            {auth.user ? 'Dashboard' : 'Masuk'}
                        </Link>
                    </nav>

                    <button
                        type="button"
                        className="grid size-10 place-items-center rounded-lg text-slate-700 hover:bg-slate-100 lg:hidden"
                        aria-label="Buka menu"
                        onClick={() => setOpen((value) => !value)}
                    >
                        {open ? (
                            <X className="size-5" />
                        ) : (
                            <Menu className="size-5" />
                        )}
                    </button>
                </div>
                {open && (
                    <nav
                        className="border-t border-slate-200 bg-white px-4 py-4 lg:hidden"
                        aria-label="Navigasi seluler"
                    >
                        <div className="mx-auto flex max-w-7xl flex-col gap-1">
                            {nav.map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    onClick={() => setOpen(false)}
                                    className="rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                    {item.label}
                                </Link>
                            ))}
                            <Link
                                href={auth.user ? dashboard() : login()}
                                className={cn(buttonVariants(), 'mt-3')}
                            >
                                {auth.user ? 'Dashboard' : 'Masuk'}
                            </Link>
                        </div>
                    </nav>
                )}
            </header>

            {children}

            <footer
                id="kontak"
                className="border-t border-slate-200 bg-slate-950 text-slate-300"
            >
                <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.1fr_1fr_1fr] lg:px-8">
                    <div>
                        <p className="font-heading text-lg font-bold text-white">
                            {name}
                        </p>
                        <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">
                            {site.school_description ??
                                'Pusat informasi resmi sekolah untuk peserta didik, orang tua, guru, dan masyarakat.'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white">Kontak</p>
                        <div className="mt-3 space-y-2 text-sm text-slate-400">
                            {site.school_address && (
                                <p className="flex gap-2">
                                    <MapPin className="mt-0.5 size-4 shrink-0" />
                                    <span>{site.school_address}</span>
                                </p>
                            )}
                            {site.school_phone && (
                                <p className="flex gap-2">
                                    <Phone className="mt-0.5 size-4 shrink-0" />
                                    <span>{site.school_phone}</span>
                                </p>
                            )}
                            {site.school_email && (
                                <p className="flex gap-2">
                                    <Mail className="mt-0.5 size-4 shrink-0" />
                                    <span className="break-all">
                                        {site.school_email}
                                    </span>
                                </p>
                            )}
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white">
                            Ikuti sekolah
                        </p>
                        <div className="mt-3 flex gap-2">
                            {site.facebook_url && (
                                <a
                                    href={site.facebook_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label="Facebook sekolah"
                                    className="grid size-10 place-items-center rounded-lg border border-white/15 hover:bg-white/10"
                                >
                                    <ExternalLink className="size-4" />
                                </a>
                            )}
                            {site.instagram_url && (
                                <a
                                    href={site.instagram_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label="Instagram sekolah"
                                    className="grid size-10 place-items-center rounded-lg border border-white/15 hover:bg-white/10"
                                >
                                    <ExternalLink className="size-4" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>
                <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-slate-500">
                    © {new Date().getFullYear()} {name}
                </div>
            </footer>
        </div>
    );
}
