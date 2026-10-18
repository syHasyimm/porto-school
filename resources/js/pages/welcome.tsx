import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    ArrowUpRight,
    Award,
    BookOpen,
    GraduationCap,
    MessageSquareText,
    Newspaper,
    Pencil,
    Quote,
    UsersRound,
    type LucideIcon,
} from 'lucide-react';
import {
    motion,
    useInView,
    useReducedMotion,
    useScroll,
    useTransform,
} from 'motion/react';
import { useRef, useState, type PropsWithChildren } from 'react';
import { AlumniAvatar } from '@/components/alumni-avatar';
import {
    HomeCalendar,
    type HomeCalendarData,
} from '@/components/home-calendar';
import { HomeGalleryCarousel } from '@/components/home-gallery-carousel';
import { MediaImage } from '@/components/media-image';
import { buttonVariants } from '@/components/ui/button';
import PublicLayout from '@/layouts/public-layout';
import { cn } from '@/lib/utils';
import { contact, profile } from '@/routes';
import { create as complaintCreate } from '@/routes/complaints';
import { index as galleryIndex } from '@/routes/gallery';
import { index as newsIndex, show as newsShow } from '@/routes/news';
import type { GalleryItem, NewsSummary, TestimonialSummary } from '@/types';

type WelcomeProps = {
    featuredTestimonials: TestimonialSummary[];
    showTestimonialExamples: boolean;
    featuredGallery: GalleryItem[];
    featuredNews: NewsSummary[];
    calendar: HomeCalendarData;
    stats: { teachers: number; upcoming_events: number };
};

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
});
const numberFormatter = new Intl.NumberFormat('id-ID');
const gardenIllustrationUrl = '/images/school-garden-illustration.webp';
const primaryButton = cn(
    buttonVariants({ size: 'lg' }),
    'h-12 gap-3 rounded-full px-6 shadow-sm shadow-brand-700/15 transition duration-200 motion-safe:hover:-translate-y-0.5 motion-reduce:transition-none',
);

function metric(value: string | null): string {
    return value !== null && value !== ''
        ? numberFormatter.format(Number(value))
        : '-';
}

function Reveal({
    children,
    className,
    delay = 0,
}: PropsWithChildren<{ className?: string; delay?: number }>) {
    const reducedMotion = useReducedMotion();
    return (
        <motion.div
            className={className}
            initial={reducedMotion ? false : { opacity: 0, y: 20, scale: 0.99 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.12 }}
            transition={{
                duration: reducedMotion ? 0 : 0.65,
                delay: reducedMotion ? 0 : delay,
                ease: [0.16, 1, 0.3, 1],
            }}
        >
            {children}
        </motion.div>
    );
}

function FloatingHeroIcon({
    icon: Icon,
    className,
    tone,
    tilt,
    duration,
    delay,
    active,
    reducedMotion,
}: {
    icon: LucideIcon;
    className: string;
    tone: string;
    tilt: number;
    duration: number;
    delay: number;
    active: boolean;
    reducedMotion: boolean;
}) {
    return (
        <motion.div
            aria-hidden="true"
            className={cn('pointer-events-none absolute z-10', className)}
            initial={reducedMotion ? false : { opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: reducedMotion ? 0 : 0.45, delay }}
        >
            <motion.div
                className={cn(
                    'grid size-12 place-items-center border-[3px] border-white shadow-[0_10px_22px_-10px_rgba(39,58,88,0.3)] sm:size-16',
                    tone,
                )}
                animate={
                    active
                        ? { y: [0, -8, 0], rotate: [tilt, tilt + 3, tilt] }
                        : { y: 0, rotate: tilt }
                }
                transition={
                    active
                        ? {
                              duration,
                              repeat: Infinity,
                              ease: 'easeInOut',
                              delay,
                          }
                        : { duration: 0 }
                }
            >
                <Icon className="size-6 sm:size-8" strokeWidth={1.75} />
            </motion.div>
        </motion.div>
    );
}

function HeroImage({ src }: { src: string | null }) {
    const ref = useRef<HTMLDivElement>(null);
    const reducedMotion = useReducedMotion();
    const isInView = useInView(ref, { amount: 0.15 });
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start start', 'end start'],
    });
    const imageY = useTransform(scrollYProgress, [0, 1], [0, -20]);
    const iconsActive = isInView && !reducedMotion;

    return (
        <motion.div
            ref={ref}
            className="relative min-w-0 py-6"
            initial={reducedMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: reducedMotion ? 0 : 0.7,
                delay: 0.1,
                ease: [0.16, 1, 0.3, 1],
            }}
        >
            <div
                aria-hidden="true"
                className="absolute top-2 right-4 bottom-4 left-10 rounded-[2rem] border border-brand-600/20 bg-[#e9edf7]"
            />
            <motion.figure
                style={{ y: reducedMotion ? 0 : imageY }}
                className="relative mx-5 sm:mx-6"
            >
                <div className="overflow-hidden rounded-[2rem] border-[6px] border-white bg-[#eeeadf] shadow-[0_16px_40px_-24px_rgba(39,58,88,0.35)]">
                    <img
                        src={src ?? gardenIllustrationUrl}
                        alt={
                            src
                                ? 'Foto kegiatan sekolah'
                                : 'Ilustrasi siswa sekolah dasar belajar berkebun bersama guru'
                        }
                        width={1200}
                        height={900}
                        fetchPriority="high"
                        className="aspect-[4/3] w-full object-cover"
                    />
                </div>
            </motion.figure>
            <FloatingHeroIcon
                icon={BookOpen}
                className="top-1 left-1 sm:top-2 sm:left-0"
                tone="rounded-2xl bg-brand-700 text-white"
                tilt={-10}
                duration={6.5}
                delay={0.25}
                active={iconsActive}
                reducedMotion={Boolean(reducedMotion)}
            />
            <FloatingHeroIcon
                icon={Pencil}
                className="top-[42%] right-0"
                tone="rounded-full bg-[#f6eddb] text-[#8b642c]"
                tilt={8}
                duration={7.5}
                delay={0.4}
                active={iconsActive}
                reducedMotion={Boolean(reducedMotion)}
            />
            <FloatingHeroIcon
                icon={GraduationCap}
                className="bottom-0 left-10 sm:left-14"
                tone="rounded-[1.25rem] bg-[#e0ece5] text-[#32634c]"
                tilt={-6}
                duration={8}
                delay={0.55}
                active={iconsActive}
                reducedMotion={Boolean(reducedMotion)}
            />
        </motion.div>
    );
}

export default function Welcome({
    featuredTestimonials,
    showTestimonialExamples,
    featuredGallery,
    featuredNews,
    calendar,
    stats,
}: WelcomeProps) {
    const { name, site } = usePage().props;
    const reducedMotion = useReducedMotion();
    const heroItem = {
        hidden: { opacity: 0, y: 18 },
        visible: { opacity: 1, y: 0 },
    };
    const testimonials = showTestimonialExamples
        ? [
              {
                  id: -1,
                  name: 'Contoh alumni 1',
                  graduation_year: null,
                  content:
                      'Di sekolah ini saya belajar untuk berani bertanya dan mencoba. Dukungan guru membuat saya percaya diri menghadapi hal-hal baru.',
                  photo_url: '/images/alumni-example-man.png',
              },
              {
                  id: -2,
                  name: 'Contoh alumni 2',
                  graduation_year: null,
                  content:
                      'Yang paling saya ingat adalah teman-teman dan guru yang selalu menyemangati. Kebiasaan saling membantu di sekolah masih saya bawa sampai sekarang.',
                  photo_url: '/images/alumni-example-woman.png',
              },
          ]
        : featuredTestimonials;
    const metrics = [
        {
            label: 'Alumni',
            value: metric(site.alumni_count),
            detail:
                site.alumni_count !== null
                    ? 'Bagian dari perjalanan sekolah'
                    : 'Data alumni belum diisi',
            icon: GraduationCap,
        },
        {
            label: 'Siswa aktif',
            value: metric(site.active_students_count),
            detail:
                site.active_students_count !== null
                    ? 'Belajar dan bertumbuh bersama'
                    : 'Data siswa belum diisi',
            icon: UsersRound,
        },
        {
            label: 'Guru & tendik',
            value: metric(site.teacher_staff_count),
            detail:
                site.teacher_staff_count !== null
                    ? 'Mendampingi setiap langkah'
                    : numberFormatter.format(stats.teachers) +
                      ' guru terdata; total belum diisi',
            icon: BookOpen,
        },
        {
            label: 'Akreditasi',
            value: site.accreditation || '-',
            detail: site.accreditation
                ? 'Akreditasi sekolah'
                : 'Akreditasi belum diisi',
            icon: Award,
        },
    ];

    return (
        <PublicLayout>
            <Head title="Beranda" />
            <main
                data-entrance="custom"
                className="overflow-x-clip bg-[#f8f7f3]"
            >
                <section className="relative">
                    <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pt-10 pb-12 sm:px-6 sm:pt-14 sm:pb-14 lg:min-h-[520px] lg:grid-cols-[1.1fr_1fr] lg:gap-14 lg:px-8 lg:py-14">
                        <motion.div
                            initial={reducedMotion ? false : 'hidden'}
                            animate="visible"
                            transition={{
                                staggerChildren: 0.11,
                                delayChildren: 0.08,
                            }}
                        >
                            <motion.p
                                variants={heroItem}
                                transition={{ duration: 0.55 }}
                                className="mb-6 text-sm font-semibold text-brand-700"
                            >
                                {name}
                            </motion.p>
                            <motion.h1
                                variants={heroItem}
                                transition={{ duration: 0.6 }}
                                className="max-w-xl font-heading text-[clamp(2.2rem,4.6vw,3.65rem)] leading-[1.12] font-extrabold tracking-tight text-slate-950"
                            >
                                Tempat belajar.
                                <span className="block text-brand-700">
                                    Ruang bertumbuh.
                                </span>
                            </motion.h1>
                            <motion.p
                                variants={heroItem}
                                transition={{ duration: 0.6 }}
                                className="mt-6 max-w-md text-base leading-8 text-slate-600"
                            >
                                Mendampingi setiap anak untuk mengenal
                                potensinya, membangun karakter, dan melangkah
                                dengan percaya diri.
                            </motion.p>
                            <motion.div
                                variants={heroItem}
                                transition={{ duration: 0.6 }}
                                className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3"
                            >
                                {site.registration_url ? (
                                    <a
                                        href={site.registration_url}
                                        className={primaryButton}
                                    >
                                        Daftar Siswa Baru{' '}
                                        <ArrowUpRight
                                            aria-hidden="true"
                                            className="size-4"
                                        />
                                    </a>
                                ) : (
                                    <Link
                                        href={contact()}
                                        className={primaryButton}
                                    >
                                        Daftar Siswa Baru{' '}
                                        <ArrowUpRight
                                            aria-hidden="true"
                                            className="size-4"
                                        />
                                    </Link>
                                )}
                                <Link
                                    href={profile()}
                                    className="group inline-flex min-h-11 items-center gap-3 rounded-lg text-sm font-bold text-slate-700 transition-colors hover:text-brand-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600"
                                >
                                    Kenali sekolah{' '}
                                    <ArrowRight
                                        aria-hidden="true"
                                        className="size-4 transition-transform motion-safe:group-hover:translate-x-1"
                                    />
                                </Link>
                            </motion.div>
                        </motion.div>
                        <HeroImage src={site.hero_image_url} />
                    </div>
                </section>

                <section
                    aria-label="Sekolah dalam angka"
                    className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8 lg:pb-16"
                >
                    <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
                        {metrics.map(
                            ({ label, value, detail, icon: Icon }, index) => (
                                <motion.div
                                    key={label}
                                    initial={
                                        reducedMotion
                                            ? false
                                            : { opacity: 0, y: 24, scale: 0.96 }
                                    }
                                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                    viewport={{ once: true, amount: 0.2 }}
                                    transition={{
                                        duration: reducedMotion ? 0 : 0.6,
                                        delay: reducedMotion ? 0 : index * 0.09,
                                        ease: [0.16, 1, 0.3, 1],
                                    }}
                                    className={cn(
                                        'relative min-w-0 overflow-hidden rounded-2xl border p-5 sm:p-6',
                                        index === 3
                                            ? 'border-brand-700/10 bg-[#e7edf8]'
                                            : 'border-[#e5e4df] bg-white',
                                    )}
                                >
                                    <dt className="flex items-center justify-between gap-2 text-xs font-bold text-slate-600 sm:text-sm">
                                        {label}
                                        <Icon
                                            aria-hidden="true"
                                            className="size-5 shrink-0 text-brand-700"
                                            strokeWidth={1.5}
                                        />
                                    </dt>
                                    <dd
                                        className={cn(
                                            'mt-5 font-heading text-4xl leading-none font-extrabold tracking-tight sm:text-[2.75rem]',
                                            index === 3
                                                ? 'text-brand-700'
                                                : 'text-slate-950',
                                        )}
                                    >
                                        <span
                                            className={
                                                label === 'Akreditasi'
                                                    ? 'block text-wrap break-words'
                                                    : 'tabular-nums'
                                            }
                                        >
                                            {value}
                                        </span>
                                    </dd>
                                    <dd className="mt-4 max-w-48 text-xs leading-5 text-slate-500">
                                        {detail}
                                    </dd>
                                    <div
                                        aria-hidden="true"
                                        className={cn(
                                            'absolute inset-x-6 bottom-0 h-[3px] rounded-t-full',
                                            index === 3
                                                ? 'bg-brand-600'
                                                : 'bg-brand-100',
                                        )}
                                    />
                                </motion.div>
                            ),
                        )}
                    </dl>
                </section>

                <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20">
                    <div className="grid items-center gap-8 rounded-[2rem] border border-[#e5e4df] bg-white p-6 sm:p-9 lg:grid-cols-[0.55fr_1.45fr] lg:gap-12 lg:p-10">
                        <Reveal className="mx-auto w-full max-w-60 lg:max-w-none">
                            <div className="overflow-hidden rounded-t-[5rem] rounded-b-2xl bg-[#eceeea] p-2">
                                {site.headmaster_photo_url ? (
                                    <MediaImage
                                        key={site.headmaster_photo_url}
                                        src={site.headmaster_photo_url}
                                        alt={
                                            'Kepala sekolah ' +
                                            (site.headmaster_name ?? name)
                                        }
                                        className="aspect-[4/5] w-full rounded-t-[4.5rem] rounded-b-xl object-cover object-top"
                                    />
                                ) : (
                                    <div className="flex aspect-[4/5] flex-col items-center justify-center gap-4 rounded-t-[4.5rem] rounded-b-xl bg-[#edf1f7] px-5 text-center">
                                        <BookOpen
                                            aria-hidden="true"
                                            className="size-10 stroke-[1.2] text-brand-700"
                                        />
                                        <p className="text-xs leading-6 text-slate-500">
                                            Foto kepala sekolah belum tersedia.
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div className="mt-5 text-center lg:text-left">
                                <p className="text-sm font-bold text-slate-900">
                                    {site.headmaster_name || 'Kepala sekolah'}
                                </p>
                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                    Kepala {name}
                                </p>
                            </div>
                        </Reveal>
                        <Reveal delay={0.12}>
                            <p className="mb-5 text-sm font-semibold text-brand-700">
                                Sambutan kepala sekolah
                            </p>
                            <h2 className="max-w-2xl font-heading text-3xl leading-[1.2] font-bold tracking-tight text-slate-950 sm:text-4xl">
                                Selamat datang di
                                <br className="hidden sm:block" /> {name}.
                            </h2>
                            {site.headmaster_message ? (
                                <p className="mt-6 text-base leading-8 whitespace-pre-line text-slate-600">
                                    {site.headmaster_message}
                                </p>
                            ) : (
                                <div className="mt-6 space-y-3 text-base leading-8 text-slate-600">
                                    <p>
                                        {site.school_description ||
                                            'Kenali lingkungan belajar, kegiatan, dan perkembangan sekolah melalui laman resmi kami.'}
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        Sambutan kepala sekolah akan ditampilkan
                                        setelah diperbarui oleh sekolah.
                                    </p>
                                </div>
                            )}
                        </Reveal>
                    </div>
                </section>

                <div className="border-y border-[#e5e4df] bg-[#f0f2f6]">
                    <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_290px] lg:gap-10 lg:px-8 lg:py-18">
                        <div className="min-w-0 space-y-14">
                            <section id="informasi" className="scroll-mt-24">
                                <Reveal>
                                    <SectionHeading
                                        title="Informasi sekolah"
                                        href={newsIndex.url()}
                                        linkLabel="Semua berita"
                                    />
                                    <p className="mt-3 max-w-lg text-sm leading-7 text-slate-500">
                                        Kabar, kegiatan, dan pengumuman terbaru
                                        dari sekolah.
                                    </p>
                                </Reveal>
                                <div className="mt-7 grid gap-4 md:grid-cols-[1.25fr_1fr]">
                                    {Array.from({ length: 3 }, (_, index) => (
                                        <HomeNewsCard
                                            key={
                                                featuredNews[index]?.id ??
                                                `pending-${index}`
                                            }
                                            article={featuredNews[index]}
                                            featured={index === 0}
                                            index={index}
                                        />
                                    ))}
                                </div>
                            </section>
                            <section aria-labelledby="complaint-heading">
                                <Reveal className="relative overflow-hidden rounded-2xl border border-brand-600/15 bg-[#e4ebf8] p-6 sm:p-8">
                                    <div className="flex items-start gap-4">
                                        <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-brand-700/15 bg-white/60 text-brand-700">
                                            <MessageSquareText
                                                aria-hidden="true"
                                                className="size-6"
                                                strokeWidth={1.5}
                                            />
                                        </span>
                                        <div>
                                            <h2
                                                id="complaint-heading"
                                                className="font-heading text-2xl leading-tight font-bold tracking-tight sm:text-3xl"
                                            >
                                                Sekolah yang mendengar.
                                            </h2>
                                            <p className="mt-3 max-w-lg text-sm leading-7 text-slate-600">
                                                Punya masukan atau hal yang
                                                perlu disampaikan? Gunakan
                                                layanan pengaduan untuk
                                                menghubungi pihak sekolah secara
                                                privat.
                                            </p>
                                        </div>
                                    </div>
                                    <Link
                                        href={complaintCreate()}
                                        className={cn(primaryButton, 'mt-6')}
                                    >
                                        Sampaikan Pengaduan{' '}
                                        <ArrowUpRight
                                            aria-hidden="true"
                                            className="size-4"
                                        />
                                    </Link>
                                </Reveal>
                            </section>
                        </div>
                        <HomeCalendar calendar={calendar} />
                    </div>
                    {featuredGallery.length > 0 && (
                        <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8 lg:pb-18">
                            <Reveal>
                                <SectionHeading
                                    title="Cerita dalam gambar"
                                    href={galleryIndex.url()}
                                    linkLabel="Buka galeri"
                                />
                            </Reveal>
                            <Reveal delay={0.1}>
                                <HomeGalleryCarousel items={featuredGallery} />
                            </Reveal>
                        </section>
                    )}
                </div>

                {testimonials.length > 0 && (
                    <section
                        id="kata-alumni"
                        aria-labelledby="alumni-heading"
                        className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
                    >
                        <div className="grid items-start gap-8 lg:grid-cols-[0.65fr_1.35fr] lg:gap-12">
                            <Reveal className="max-w-md">
                                <Quote
                                    aria-hidden="true"
                                    className="mb-5 size-9 stroke-[1.25] text-brand-700"
                                />
                                <h2
                                    id="alumni-heading"
                                    className="font-heading text-3xl leading-tight font-bold tracking-tight sm:text-4xl"
                                >
                                    Kata alumni
                                </h2>
                                <p className="mt-4 text-sm leading-7 text-slate-600">
                                    Kenangan belajar, persahabatan, dan bekal
                                    yang terus dibawa setelah meninggalkan
                                    sekolah.
                                </p>
                            </Reveal>
                            <div className="grid min-w-0 gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                                {testimonials.map((testimonial, index) => (
                                    <AlumniCard
                                        key={testimonial.id}
                                        testimonial={testimonial}
                                        isExample={showTestimonialExamples}
                                        index={index}
                                    />
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </main>
        </PublicLayout>
    );
}

function HomeNewsCard({
    article,
    featured,
    index,
}: {
    article?: NewsSummary;
    featured: boolean;
    index: number;
}) {
    const reducedMotion = useReducedMotion();
    const entrance = {
        initial: reducedMotion ? false : { opacity: 0, y: 24, scale: 0.985 },
        whileInView: { opacity: 1, y: 0, scale: 1 },
        viewport: { once: true, amount: 0.15 },
        transition: {
            duration: reducedMotion ? 0 : 0.6,
            delay: reducedMotion ? 0 : index * 0.09,
            ease: [0.16, 1, 0.3, 1] as const,
        },
    };

    if (!article) {
        return (
            <motion.article
                {...entrance}
                className={cn(
                    'flex min-w-0 flex-col justify-center rounded-2xl border border-dashed border-slate-300 bg-white/70 p-5',
                    featured && 'min-h-80 md:row-span-2',
                )}
            >
                <Newspaper
                    aria-hidden="true"
                    className="mb-5 size-7 stroke-[1.25] text-slate-400"
                />
                <p className="text-xs font-semibold text-slate-500">
                    Belum diterbitkan
                </p>
                <h3 className="mt-3 font-heading text-lg leading-snug font-bold text-slate-600">
                    Menunggu berita baru
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                    Kabar dan kegiatan sekolah akan tampil di sini setelah
                    berita berikutnya diterbitkan.
                </p>
            </motion.article>
        );
    }
    return (
        <motion.article
            {...entrance}
            className={cn('min-w-0', featured && 'md:row-span-2')}
        >
            <Link
                href={newsShow(article.slug)}
                aria-labelledby={`home-news-${article.id}`}
                className={cn(
                    'group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[#e1e5ed] bg-white transition duration-300 hover:border-brand-600/30 hover:shadow-[0_14px_28px_-20px_rgba(35,57,93,0.3)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600 motion-safe:hover:-translate-y-0.5 motion-reduce:transition-none',
                    !featured && 'sm:flex-row md:flex-col',
                )}
            >
                <div
                    aria-hidden="true"
                    className={cn(
                        'relative shrink-0 overflow-hidden bg-[#e8ebf0]',
                        featured
                            ? 'aspect-[16/10]'
                            : 'aspect-[16/8] sm:aspect-auto sm:w-1/3 md:aspect-[16/8] md:w-full',
                    )}
                >
                    <MediaImage
                        src={article.thumbnail_url}
                        alt=""
                        fallbackLabel="Foto berita belum tersedia"
                        className="absolute inset-0 size-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.035] motion-reduce:transition-none"
                    />
                </div>
                <div
                    className={cn(
                        'flex min-w-0 flex-1 flex-col',
                        featured ? 'p-6' : 'p-5',
                    )}
                >
                    <NewsDate article={article} />
                    <h3
                        id={`home-news-${article.id}`}
                        className={cn(
                            'mt-3 line-clamp-3 font-heading leading-snug font-bold tracking-tight text-slate-900 transition-colors group-hover:text-brand-700',
                            featured ? 'text-xl sm:text-2xl' : 'text-base',
                        )}
                    >
                        {article.title}
                    </h3>
                    {featured && (
                        <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">
                            {article.excerpt}
                        </p>
                    )}
                    <span className="mt-auto flex items-center justify-between gap-3 pt-6 text-xs font-bold text-brand-700">
                        Baca berita{' '}
                        <ArrowRight
                            aria-hidden="true"
                            className="size-4 shrink-0 transition-transform motion-safe:group-hover:translate-x-1"
                        />
                    </span>
                </div>
            </Link>
        </motion.article>
    );
}

function NewsDate({ article }: { article: NewsSummary }) {
    if (!article.published_at) return null;
    return (
        <time
            dateTime={article.published_at}
            className="text-xs font-semibold text-slate-500"
        >
            {dateFormatter.format(new Date(article.published_at))}
        </time>
    );
}

function SectionHeading({
    title,
    href,
    linkLabel,
}: {
    title: string;
    href: string;
    linkLabel: string;
}) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="font-heading text-2xl leading-tight font-bold tracking-tight sm:text-3xl">
                {title}
            </h2>
            <Link
                href={href}
                className="group inline-flex min-h-11 items-center gap-3 rounded-lg text-xs font-bold text-brand-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600"
            >
                {linkLabel}
                <span className="grid size-9 place-items-center rounded-full border border-brand-700/20 bg-white transition-colors group-hover:border-brand-700 group-hover:bg-brand-700 group-hover:text-white">
                    <ArrowUpRight aria-hidden="true" className="size-4" />
                </span>
            </Link>
        </div>
    );
}

function AlumniCard({
    testimonial,
    isExample,
    index,
}: {
    testimonial: TestimonialSummary;
    isExample: boolean;
    index: number;
}) {
    const [expanded, setExpanded] = useState(false);
    const reducedMotion = useReducedMotion();
    const quoteId = `alumni-quote-${testimonial.id}`;
    return (
        <motion.figure
            initial={
                reducedMotion ? false : { opacity: 0, y: 22, scale: 0.985 }
            }
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{
                duration: reducedMotion ? 0 : 0.6,
                delay: reducedMotion ? 0 : index * 0.1,
                ease: [0.16, 1, 0.3, 1],
            }}
            className="flex min-w-0 flex-col rounded-2xl border border-[#e5e4df] bg-white p-6 sm:p-7"
        >
            <div className="flex items-center justify-between gap-4">
                <Quote
                    aria-hidden="true"
                    className="size-6 stroke-[1.5] text-brand-700"
                />
                {isExample && (
                    <span className="rounded-md bg-brand-50 px-2 py-1 text-xs font-semibold text-brand-700">
                        Contoh
                    </span>
                )}
            </div>
            <blockquote
                id={quoteId}
                className="mt-5 flex-1 text-base leading-7 text-slate-700"
            >
                <p
                    className={cn(
                        'break-words whitespace-pre-line',
                        !expanded && 'line-clamp-3',
                    )}
                >
                    {testimonial.content}
                </p>
            </blockquote>
            <button
                type="button"
                aria-expanded={expanded}
                aria-controls={quoteId}
                onClick={() => setExpanded(!expanded)}
                className="mt-2 inline-flex min-h-11 items-center gap-2 self-start rounded-lg text-xs font-bold text-brand-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
            >
                {expanded ? 'Ringkas cerita' : 'Baca cerita lengkap'}
                <ArrowUpRight
                    aria-hidden="true"
                    className={cn(
                        'size-3.5 transition-transform',
                        expanded && 'rotate-180',
                    )}
                />
            </button>
            <figcaption className="mt-5 flex items-center gap-3 border-t border-[#eeede8] pt-5">
                <AlumniAvatar
                    name={testimonial.name}
                    photoUrl={testimonial.photo_url}
                />
                <div className="min-w-0">
                    <p className="text-sm font-bold break-words text-slate-900">
                        {testimonial.name}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                        {testimonial.graduation_year
                            ? `Lulusan ${testimonial.graduation_year}`
                            : isExample
                              ? 'Nama dan tahun lulus belum diisi'
                              : 'Alumni sekolah'}
                    </p>
                </div>
            </figcaption>
        </motion.figure>
    );
}
