import { Link, usePage } from '@inertiajs/react';
import {
    ArrowUpRight,
    ExternalLink,
    Mail,
    MapPin,
    Menu,
    Phone,
    School,
    X,
} from 'lucide-react';
import {
    AnimatePresence,
    motion,
    useIsPresent,
    useReducedMotion,
    type Variants,
} from 'motion/react';
import { useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { contact, home, profile } from '@/routes';
import { index as calendarIndex } from '@/routes/calendar';
import { create as complaintCreate } from '@/routes/complaints';
import { index as galleryIndex } from '@/routes/gallery';
import { index as newsIndex } from '@/routes/news';
import { index as teachersIndex } from '@/routes/teachers';

function StudentRegistrationLink({
    className,
    registrationUrl,
    onClick,
}: {
    className: string;
    registrationUrl: string | null;
    onClick?: () => void;
}) {
    const content = (
        <>
            Daftar siswa baru
            <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
        </>
    );

    return registrationUrl ? (
        <a href={registrationUrl} className={className} onClick={onClick}>
            {content}
        </a>
    ) : (
        <Link href={contact()} className={className} onClick={onClick}>
            {content}
        </Link>
    );
}

function MobileNavigation({
    items,
    isActive,
    registrationUrl,
    onClose,
}: {
    items: { label: string; href: string }[];
    isActive: (href: string) => boolean;
    registrationUrl: string | null;
    onClose: () => void;
}) {
    const isPresent = useIsPresent();
    const reducedMotion = useReducedMotion();
    const panelVariants: Variants = {
        closed: {
            opacity: 0,
            y: reducedMotion ? 0 : -14,
            scale: reducedMotion ? 1 : 0.975,
            transition: { duration: reducedMotion ? 0 : 0.18 },
        },
        open: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: reducedMotion
                ? { duration: 0 }
                : {
                      type: 'spring',
                      stiffness: 300,
                      damping: 26,
                      mass: 0.8,
                      opacity: { duration: 0.18 },
                      delayChildren: 0.05,
                      staggerChildren: 0.035,
                  },
        },
    };
    const itemVariants: Variants = {
        closed: {
            opacity: 0,
            x: reducedMotion ? 0 : -12,
            transition: { duration: reducedMotion ? 0 : 0.1 },
        },
        open: {
            opacity: 1,
            x: 0,
            transition: {
                duration: reducedMotion ? 0 : 0.28,
                ease: [0.16, 1, 0.3, 1],
            },
        },
    };

    return (
        <motion.nav
            id="public-mobile-navigation"
            aria-label="Navigasi seluler"
            aria-hidden={!isPresent || undefined}
            inert={!isPresent}
            initial="closed"
            animate="open"
            exit="closed"
            variants={panelVariants}
            className="absolute inset-x-3 top-full mt-3 max-h-[calc(100dvh-6rem)] origin-top overflow-y-auto overscroll-contain rounded-3xl border border-slate-200 bg-white p-3 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.3)] sm:inset-x-6 sm:p-4 lg:hidden"
        >
            <ul className="flex flex-col gap-1">
                {items.map((item) => (
                    <motion.li key={item.label} variants={itemVariants}>
                        <Link
                            href={item.href}
                            onClick={onClose}
                            aria-current={
                                isActive(item.href) ? 'page' : undefined
                            }
                            className={cn(
                                'group/mobile-link flex min-h-12 items-center justify-between gap-3 rounded-xl px-4 text-sm font-semibold transition-colors hover:bg-brand-50 hover:text-brand-700 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-600 motion-reduce:transition-none',
                                isActive(item.href)
                                    ? 'bg-brand-50 text-brand-700'
                                    : 'text-slate-700',
                            )}
                        >
                            <span>{item.label}</span>
                            <ArrowUpRight
                                aria-hidden="true"
                                className={cn(
                                    'size-4 shrink-0 transition-transform duration-200 motion-safe:group-hover/mobile-link:translate-x-0.5 motion-safe:group-hover/mobile-link:-translate-y-0.5 motion-reduce:transition-none',
                                    isActive(item.href)
                                        ? 'text-brand-700'
                                        : 'text-slate-400',
                                )}
                            />
                        </Link>
                    </motion.li>
                ))}
            </ul>
            <motion.div variants={itemVariants} className="mt-3">
                <StudentRegistrationLink
                    registrationUrl={registrationUrl}
                    className={cn(
                        buttonVariants(),
                        'h-12 w-full rounded-xl bg-brand-700 hover:bg-brand-600',
                    )}
                    onClick={onClose}
                />
            </motion.div>
        </motion.nav>
    );
}

export default function PublicLayout({ children }: PropsWithChildren) {
    const {
        props: { name, site },
        url,
    } = usePage();
    const pathname = url.split(/[?#]/)[0];
    const [open, setOpen] = useState(false);
    const layoutRef = useRef<HTMLDivElement>(null);
    const menuButtonRef = useRef<HTMLButtonElement>(null);
    const reducedMotion = useReducedMotion();
    const nav = [
        { label: 'Beranda', href: home.url() },
        { label: 'Profil', href: profile.url() },
        { label: 'Guru', href: teachersIndex.url() },
        { label: 'Kalender', href: calendarIndex.url() },
        { label: 'Pengaduan', href: complaintCreate.url() },
        { label: 'Berita', href: newsIndex.url() },
        { label: 'Galeri', href: galleryIndex.url() },
        { label: 'Kontak', href: contact.url() },
    ];

    useEffect(() => {
        if (!open) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        const desktopQuery = window.matchMedia('(min-width: 1024px)');
        document.body.style.overflow = 'hidden';

        function handleKeyDown(event: KeyboardEvent): void {
            if (event.key === 'Escape') {
                event.preventDefault();
                setOpen(false);
                menuButtonRef.current?.focus({ preventScroll: true });
            }
        }

        function handleBreakpointChange(event: MediaQueryListEvent): void {
            if (event.matches) {
                setOpen(false);
            }
        }

        document.addEventListener('keydown', handleKeyDown);
        desktopQuery.addEventListener('change', handleBreakpointChange);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener('keydown', handleKeyDown);
            desktopQuery.removeEventListener('change', handleBreakpointChange);
        };
    }, [open]);

    useEffect(() => {
        const layout = layoutRef.current;
        const main = layout?.querySelector('main');

        if (reducedMotion || !layout) {
            return;
        }

        const chrome = layout.querySelectorAll<HTMLElement>(
            ':scope > header > div > :is(a, nav, div, button), :scope > footer > div:first-child > div',
        );
        let content: NodeListOf<HTMLElement> | HTMLElement[] = [];

        if (main?.dataset.entrance === 'blocks') {
            content = main.querySelectorAll<HTMLElement>('[data-reveal]');
        } else if (main && main.dataset.entrance !== 'custom') {
            content = main.querySelectorAll<HTMLElement>(
                ':scope > :is(header, section, article), :scope > div > :is(section, article, aside, form), .grid > :is(article, figure, section, aside, form)',
            );
        }
        const targets = [...chrome, ...content];
        const animations: Animation[] = [];
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) {
                        return;
                    }

                    const element = entry.target as HTMLElement;
                    const siblings = Array.from(
                        element.parentElement?.children ?? [],
                    );
                    const delay = Math.min(siblings.indexOf(element) * 85, 255);
                    const revealDirection = element.dataset.reveal;
                    const isCard =
                        element.matches('article, figure, form') ||
                        revealDirection === 'scale';
                    const isSidebar = element.matches('aside');
                    const isNavigation = Boolean(
                        element.closest('header') === layout.firstElementChild,
                    );
                    let transform = 'translateY(22px)';

                    if (isNavigation) {
                        transform = 'translateY(-12px)';
                    } else if (revealDirection === 'left') {
                        transform = 'translateX(-20px)';
                    } else if (revealDirection === 'right') {
                        transform = 'translateX(20px)';
                    } else if (revealDirection === 'headline') {
                        transform = 'translateY(26px)';
                    } else if (revealDirection === 'image') {
                        transform = 'translateY(12px) scale(1.035)';
                    } else if (revealDirection === 'feature-copy') {
                        transform = 'translateX(22px)';
                    } else if (revealDirection === 'news-card') {
                        transform = 'translateY(24px) scale(0.975)';
                    } else if (revealDirection === 'article-body') {
                        transform = 'translateY(18px)';
                    } else if (isSidebar) {
                        transform = 'translateX(18px)';
                    } else if (isCard) {
                        transform = 'translateY(14px) scale(0.985)';
                    }

                    animations.push(
                        element.animate(
                            [
                                {
                                    opacity:
                                        revealDirection === 'image' ? 0.35 : 0,
                                    transform,
                                },
                                { opacity: 1, transform: 'none' },
                            ],
                            {
                                duration: isNavigation
                                    ? 450
                                    : revealDirection === 'image'
                                      ? 850
                                      : revealDirection === 'headline'
                                        ? 780
                                        : revealDirection === 'news-card' ||
                                            revealDirection ===
                                                'feature-copy' ||
                                            revealDirection === 'article-body'
                                          ? 720
                                          : isCard
                                            ? 550
                                            : 650,
                                delay,
                                easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
                                fill: 'backwards',
                            },
                        ),
                    );
                    observer.unobserve(element);
                });
            },
            { rootMargin: '0px 0px -24px 0px', threshold: 0 },
        );

        targets.forEach((target) => observer.observe(target));

        return () => {
            observer.disconnect();
            animations.forEach((animation) => animation.cancel());
        };
    }, [url, reducedMotion]);

    function isActive(href: string): boolean {
        if (href === home.url()) {
            return pathname === href;
        }

        return pathname === href || pathname.startsWith(`${href}/`);
    }

    return (
        <div ref={layoutRef} className="min-h-[100dvh] bg-white text-slate-950">
            <header className="sticky top-0 z-30 w-full border-b border-slate-200 bg-white/95 backdrop-blur">
                <div className="flex h-18 w-full items-center justify-between gap-4 px-4 sm:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] xl:gap-6">
                    <Link
                        href={home()}
                        onClick={() => setOpen(false)}
                        className="flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600"
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
                        className="hidden h-full items-center justify-center gap-4 lg:flex xl:gap-6"
                        aria-label="Navigasi utama"
                    >
                        {nav.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                aria-current={
                                    isActive(item.href) ? 'page' : undefined
                                }
                                className={cn(
                                    'relative inline-flex h-full items-center text-sm font-semibold whitespace-nowrap transition-colors after:absolute after:inset-x-0 after:bottom-4 after:h-0.5 after:origin-center after:rounded-full after:bg-brand-600 after:transition-transform after:duration-200 hover:text-brand-600 hover:after:scale-x-100 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600 motion-reduce:after:transition-none',
                                    isActive(item.href)
                                        ? 'text-brand-600 after:scale-x-100'
                                        : 'text-slate-600 after:scale-x-0',
                                )}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                    <div className="hidden min-w-0 justify-end lg:flex">
                        <StudentRegistrationLink
                            registrationUrl={site.registration_url}
                            className={cn(buttonVariants(), 'shrink-0')}
                        />
                    </div>

                    <button
                        ref={menuButtonRef}
                        type="button"
                        className={cn(
                            'grid size-11 shrink-0 place-items-center rounded-full border transition-[background-color,color,border-color,scale] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 motion-safe:active:scale-95 motion-reduce:transition-none lg:hidden',
                            open
                                ? 'border-brand-700 bg-brand-700 text-white hover:bg-brand-600'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-brand-700/20 hover:bg-brand-50 hover:text-brand-700',
                        )}
                        aria-label={open ? 'Tutup menu' : 'Buka menu'}
                        aria-expanded={open}
                        aria-controls="public-mobile-navigation"
                        onClick={() => setOpen((value) => !value)}
                    >
                        <span aria-hidden="true" className="relative size-5">
                            <motion.span
                                initial={false}
                                animate={{
                                    opacity: open ? 0 : 1,
                                    rotate: open ? 90 : 0,
                                    scale: open ? 0.65 : 1,
                                }}
                                transition={{
                                    duration: reducedMotion ? 0 : 0.24,
                                    ease: [0.16, 1, 0.3, 1],
                                }}
                                className="absolute inset-0"
                            >
                                <Menu className="size-5" />
                            </motion.span>
                            <motion.span
                                initial={false}
                                animate={{
                                    opacity: open ? 1 : 0,
                                    rotate: open ? 0 : -90,
                                    scale: open ? 1 : 0.65,
                                }}
                                transition={{
                                    duration: reducedMotion ? 0 : 0.24,
                                    ease: [0.16, 1, 0.3, 1],
                                }}
                                className="absolute inset-0"
                            >
                                <X className="size-5" />
                            </motion.span>
                        </span>
                    </button>
                </div>
                <AnimatePresence initial={false}>
                    {open && (
                        <MobileNavigation
                            key="mobile-navigation"
                            items={nav}
                            isActive={isActive}
                            registrationUrl={site.registration_url}
                            onClose={() => setOpen(false)}
                        />
                    )}
                </AnimatePresence>
            </header>

            <AnimatePresence initial={false}>
                {open && (
                    <motion.button
                        key="mobile-navigation-backdrop"
                        type="button"
                        aria-label="Tutup menu navigasi"
                        tabIndex={-1}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: reducedMotion ? 0 : 0.18 }}
                        onClick={() => {
                            setOpen(false);
                            menuButtonRef.current?.focus({
                                preventScroll: true,
                            });
                        }}
                        className="fixed inset-x-0 top-18 bottom-0 z-20 cursor-default bg-slate-950/25 backdrop-blur-[3px] lg:hidden"
                    />
                )}
            </AnimatePresence>

            <div key={url} inert={open} className="public-page-shell">
                {children}
            </div>

            <footer
                id="kontak"
                inert={open}
                className="scroll-mt-18 border-t border-slate-200 bg-slate-950 text-slate-300"
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
