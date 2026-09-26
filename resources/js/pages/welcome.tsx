import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BookOpenCheck,
    CalendarDays,
    GraduationCap,
    Library,
    MapPin,
    MessageSquareText,
    School,
    ShieldCheck,
    Sparkles,
    Trophy,
    UsersRound,
} from 'lucide-react';
import { MediaImage } from '@/components/media-image';
import { PageTransition } from '@/components/page-transition';
import { buttonVariants } from '@/components/ui/button';
import PublicLayout from '@/layouts/public-layout';
import { dashboard, login } from '@/routes';
import { index as calendarIndex } from '@/routes/calendar';
import { create as complaintCreate } from '@/routes/complaints';
import { index as galleryIndex } from '@/routes/gallery';
import { index as newsIndex, show as newsShow } from '@/routes/news';
import { index as teachersIndex } from '@/routes/teachers';
import type { GalleryItem, NewsSummary } from '@/types';

type WelcomeProps = {
    featuredGallery: GalleryItem[];
    featuredNews: NewsSummary[];
    stats: { teachers: number; upcoming_events: number };
};

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
});

function lines(value: string | null): string[] {
    return (value ?? '')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
}

export default function Welcome({
    featuredGallery,
    featuredNews,
    stats,
}: WelcomeProps) {
    const { auth, name, site } = usePage().props;
    const missions = lines(site.school_mission);
    const facilities = lines(site.school_facilities);
    const extracurriculars = lines(site.school_extracurriculars);

    return (
        <PublicLayout>
            <Head title="Beranda" />
            <PageTransition>
                <main>
                    <section className="overflow-hidden bg-slate-50">
                        <div className="mx-auto grid min-h-[calc(100dvh-4.5rem)] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8">
                            <div className="max-w-2xl">
                                <p className="inline-flex items-center gap-2 text-sm font-bold text-brand-600">
                                    <Sparkles className="size-4" /> Tumbuh,
                                    belajar, dan berkarakter
                                </p>
                                <h1 className="mt-4 font-heading text-4xl leading-[1.08] font-extrabold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                                    Sekolah yang dekat dengan keluarga dan masa
                                    depan anak.
                                </h1>
                                <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                                    {site.school_description ??
                                        `Temukan informasi resmi, agenda, layanan, dan perkembangan ${name} dalam satu tempat.`}
                                </p>
                                <div className="mt-8 flex flex-wrap gap-3">
                                    <Link
                                        href={auth.user ? dashboard() : login()}
                                        className={buttonVariants({
                                            size: 'lg',
                                        })}
                                    >
                                        {auth.user
                                            ? 'Buka dashboard'
                                            : 'Masuk ke portal'}
                                        <ArrowRight className="size-4" />
                                    </Link>
                                    <a
                                        href="#profil"
                                        className={buttonVariants({
                                            size: 'lg',
                                            variant: 'secondary',
                                        })}
                                    >
                                        Kenali sekolah
                                    </a>
                                </div>
                                <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-5 border-t border-slate-200 pt-6">
                                    <div>
                                        <dt className="text-xs font-bold text-slate-500">
                                            Tenaga pendidik
                                        </dt>
                                        <dd className="mt-1 font-heading text-2xl font-extrabold">
                                            {stats.teachers}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-bold text-slate-500">
                                            Agenda mendatang
                                        </dt>
                                        <dd className="mt-1 font-heading text-2xl font-extrabold">
                                            {stats.upcoming_events}
                                        </dd>
                                    </div>
                                    {site.npsn && (
                                        <div>
                                            <dt className="text-xs font-bold text-slate-500">
                                                NPSN
                                            </dt>
                                            <dd className="mt-1 font-heading text-2xl font-extrabold">
                                                {site.npsn}
                                            </dd>
                                        </div>
                                    )}
                                </dl>
                            </div>

                            <div className="relative mx-auto w-full max-w-md">
                                <div className="absolute -inset-8 rounded-full bg-brand-100/60 blur-3xl" />
                                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_28px_80px_-42px_rgba(30,64,175,0.45)] sm:p-9">
                                    <span className="grid size-16 place-items-center overflow-hidden rounded-xl bg-brand-500 text-white">
                                        {site.logo_url ? (
                                            <img
                                                src={site.logo_url}
                                                alt={`Logo ${name}`}
                                                className="size-full bg-white object-contain p-1.5"
                                            />
                                        ) : (
                                            <School className="size-8" />
                                        )}
                                    </span>
                                    <h2 className="mt-8 font-heading text-2xl font-bold text-slate-950">
                                        {name}
                                    </h2>
                                    <p className="mt-3 text-sm leading-6 text-slate-600">
                                        Informasi resmi sekolah yang dikelola
                                        langsung untuk peserta didik, keluarga,
                                        dan masyarakat.
                                    </p>
                                    <dl className="mt-8 space-y-4 border-t border-slate-200 pt-6">
                                        <div className="flex gap-3">
                                            <ShieldCheck className="mt-0.5 size-4 text-brand-600" />
                                            <div>
                                                <dt className="text-xs font-bold text-slate-500">
                                                    Status
                                                </dt>
                                                <dd className="mt-1 text-sm font-bold">
                                                    Sekolah Dasar Negeri
                                                </dd>
                                            </div>
                                        </div>
                                        {site.headmaster_name && (
                                            <div className="flex gap-3">
                                                <GraduationCap className="mt-0.5 size-4 text-brand-600" />
                                                <div>
                                                    <dt className="text-xs font-bold text-slate-500">
                                                        Kepala sekolah
                                                    </dt>
                                                    <dd className="mt-1 text-sm font-bold">
                                                        {site.headmaster_name}
                                                    </dd>
                                                </div>
                                            </div>
                                        )}
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section
                        id="profil"
                        className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8 lg:py-24"
                    >
                        <div>
                            <p className="text-sm font-bold text-brand-600">
                                Profil sekolah
                            </p>
                            <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                                Bertumbuh bersama masyarakat Kepenuhan
                            </h2>
                        </div>
                        <div className="space-y-5 text-base leading-8 text-slate-600">
                            <p>{site.school_description}</p>
                            {site.school_history && (
                                <p className="whitespace-pre-line">
                                    {site.school_history}
                                </p>
                            )}
                        </div>
                    </section>

                    <section className="bg-slate-950 text-white">
                        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
                            <div>
                                <p className="text-brand-300 text-sm font-bold">
                                    Visi
                                </p>
                                <h2 className="mt-4 font-heading text-3xl leading-tight font-bold">
                                    {site.school_vision ??
                                        'Membentuk peserta didik yang berkarakter dan berprestasi.'}
                                </h2>
                            </div>
                            <div>
                                <p className="text-brand-300 text-sm font-bold">
                                    Misi
                                </p>
                                <ol className="mt-5 space-y-4">
                                    {missions.map((mission, index) => (
                                        <li
                                            key={mission}
                                            className="flex gap-4 text-sm leading-7 text-slate-300"
                                        >
                                            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-bold text-white">
                                                {index + 1}
                                            </span>
                                            {mission}
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        </div>
                    </section>

                    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
                        <div className="grid gap-6 lg:grid-cols-2">
                            <ProgramList
                                icon={Library}
                                title="Fasilitas sekolah"
                                description="Lingkungan pendukung untuk kegiatan belajar sehari-hari."
                                items={facilities}
                            />
                            <ProgramList
                                icon={Trophy}
                                title="Ekstrakurikuler"
                                description="Ruang bagi siswa untuk mencoba, berlatih, dan berprestasi."
                                items={extracurriculars}
                            />
                        </div>
                    </section>

                    <section
                        id="informasi"
                        className="border-y border-slate-200 bg-slate-50"
                    >
                        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                            <div className="max-w-2xl">
                                <h2 className="font-heading text-3xl font-bold tracking-tight">
                                    Layanan informasi sekolah
                                </h2>
                                <p className="mt-4 leading-7 text-slate-600">
                                    Akses informasi utama melalui kanal resmi
                                    sekolah.
                                </p>
                            </div>
                            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                                <ServiceLink
                                    icon={UsersRound}
                                    title="Data guru"
                                    description="Kenali tenaga pendidik sekolah."
                                    href={teachersIndex.url()}
                                />
                                <ServiceLink
                                    icon={CalendarDays}
                                    title="Kalender"
                                    description="Pantau agenda akademik sekolah."
                                    href={calendarIndex.url()}
                                />
                                <ServiceLink
                                    icon={BookOpenCheck}
                                    title="Berita"
                                    description="Baca kabar dan kegiatan terbaru."
                                    href={newsIndex.url()}
                                />
                                <ServiceLink
                                    icon={MessageSquareText}
                                    title="Pengaduan"
                                    description="Sampaikan laporan secara privat."
                                    href={complaintCreate.url()}
                                />
                            </div>
                        </div>
                    </section>

                    {featuredNews.length > 0 && (
                        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
                            <SectionHeading
                                eyebrow="Kabar terbaru"
                                title="Berita dari lingkungan sekolah"
                                href={newsIndex.url()}
                                linkLabel="Semua berita"
                            />
                            <div className="mt-10 grid gap-8 md:grid-cols-3">
                                {featuredNews.map((article) => (
                                    <Link
                                        key={article.id}
                                        href={newsShow(article.slug)}
                                        className="group"
                                    >
                                        <MediaImage
                                            src={article.thumbnail_url}
                                            alt={article.title}
                                            className="aspect-[16/10] w-full rounded-xl object-cover"
                                        />
                                        <time className="mt-4 block text-xs font-bold text-brand-600">
                                            {article.published_at
                                                ? dateFormatter.format(
                                                      new Date(
                                                          article.published_at,
                                                      ),
                                                  )
                                                : ''}
                                        </time>
                                        <h3 className="mt-2 font-heading text-lg leading-snug font-bold group-hover:text-brand-600">
                                            {article.title}
                                        </h3>
                                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                                            {article.excerpt}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {featuredGallery.length > 0 && (
                        <section className="bg-slate-50">
                            <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
                                <SectionHeading
                                    eyebrow="Dokumentasi"
                                    title="Momen di sekolah"
                                    href={galleryIndex.url()}
                                    linkLabel="Buka galeri"
                                />
                                <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 lg:gap-5">
                                    {featuredGallery.map((item) => (
                                        <MediaImage
                                            key={item.id}
                                            src={item.image_url}
                                            alt={item.title}
                                            className="aspect-[4/3] w-full rounded-xl object-cover"
                                        />
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    {site.map_embed_url && (
                        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-20 sm:px-6 lg:grid-cols-[0.7fr_1.3fr] lg:px-8 lg:py-24">
                            <div>
                                <MapPin className="size-6 text-brand-600" />
                                <h2 className="mt-5 font-heading text-3xl font-bold">
                                    Kunjungi sekolah
                                </h2>
                                <p className="mt-4 leading-7 text-slate-600">
                                    {site.school_address}
                                </p>
                            </div>
                            <iframe
                                src={site.map_embed_url}
                                title={`Peta lokasi ${name}`}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                className="h-80 w-full rounded-xl border border-slate-200"
                            />
                        </section>
                    )}
                </main>
            </PageTransition>
        </PublicLayout>
    );
}

type IconType = typeof School;

function ProgramList({
    description,
    icon: Icon,
    items,
    title,
}: {
    description: string;
    icon: IconType;
    items: string[];
    title: string;
}) {
    return (
        <article className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
            <Icon className="size-6 text-brand-600" />
            <h2 className="mt-5 font-heading text-2xl font-bold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
                {description}
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {items.map((item) => (
                    <li
                        key={item}
                        className="flex items-center gap-3 rounded-lg bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700"
                    >
                        <span className="size-2 rounded-full bg-brand-500" />
                        {item}
                    </li>
                ))}
            </ul>
        </article>
    );
}

function ServiceLink({
    description,
    href,
    icon: Icon,
    title,
}: {
    description: string;
    href: string;
    icon: IconType;
    title: string;
}) {
    return (
        <Link
            href={href}
            className="group hover:border-brand-300 rounded-xl border border-slate-200 bg-white p-5 transition"
        >
            <Icon className="size-5 text-brand-600" />
            <h3 className="mt-5 font-heading text-lg font-bold group-hover:text-brand-600">
                {title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
                {description}
            </p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-brand-600">
                Buka halaman <ArrowRight className="size-4" />
            </span>
        </Link>
    );
}

function SectionHeading({
    eyebrow,
    href,
    linkLabel,
    title,
}: {
    eyebrow: string;
    href: string;
    linkLabel: string;
    title: string;
}) {
    return (
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
                <p className="text-sm font-bold text-brand-600">{eyebrow}</p>
                <h2 className="mt-2 font-heading text-3xl font-bold">
                    {title}
                </h2>
            </div>
            <Link
                href={href}
                className="inline-flex items-center gap-2 text-sm font-bold text-brand-600"
            >
                {linkLabel} <ArrowRight className="size-4" />
            </Link>
        </div>
    );
}
