import { Head, usePage } from '@inertiajs/react';
import {
    ArrowDown,
    ArrowUpRight,
    BookOpen,
    Library,
    Trophy,
} from 'lucide-react';
import { useState } from 'react';
import PublicLayout from '@/layouts/public-layout';
import type { SchoolHistoryEntry } from '@/types';

function lines(value: string | null): string[] {
    return (value ?? '')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
}

export default function Profile({
    historyEntries,
}: {
    historyEntries: SchoolHistoryEntry[];
}) {
    const { name, site } = usePage().props;
    const missions = lines(site.school_mission);

    return (
        <PublicLayout>
            <Head title="Profil sekolah" />
            <main
                data-entrance="blocks"
                className="overflow-x-clip bg-[#f8f7f3]"
            >
                <section className="mx-auto max-w-7xl px-4 pt-10 pb-8 sm:px-6 sm:pt-16 lg:px-8">
                    <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
                        <div data-reveal="left">
                            <p className="flex items-center gap-3 text-xs font-bold tracking-[0.16em] text-brand-700 uppercase">
                                <span
                                    aria-hidden="true"
                                    className="h-px w-8 bg-brand-600"
                                />
                                Kenal lebih dekat
                            </p>
                            <h1 className="mt-6 max-w-xl font-heading text-4xl leading-[1.12] font-extrabold tracking-tight text-slate-950 sm:text-5xl lg:text-[3.5rem]">
                                {name}
                            </h1>
                            <p className="mt-6 max-w-lg text-base leading-8 text-slate-600">
                                {site.school_description ??
                                    'Kenali sejarah, arah pendidikan, dan lingkungan belajar sekolah kami.'}
                            </p>
                            <a
                                href="#sejarah"
                                className="mt-8 inline-flex items-center gap-3 border-b border-brand-600 pb-2 text-sm font-bold text-brand-700 outline-offset-4 transition-colors hover:text-slate-950 focus-visible:outline-2"
                            >
                                Jelajahi cerita sekolah
                                <ArrowDown
                                    aria-hidden="true"
                                    className="size-4"
                                />
                            </a>
                        </div>
                        <SchoolCover src={site.profile_image_url} name={name} />
                    </div>
                    <dl
                        data-reveal
                        className="mt-10 grid gap-6 border-y border-slate-300/70 py-6 sm:grid-cols-3 lg:mt-14 lg:py-8"
                    >
                        <Identity label="NPSN" value={site.npsn} />
                        <Identity
                            label="Akreditasi"
                            value={site.accreditation}
                        />
                        <Identity
                            label="Kepala sekolah"
                            value={site.headmaster_name}
                        />
                    </dl>
                </section>

                <section
                    id="sejarah"
                    className="mx-auto grid max-w-7xl scroll-mt-24 gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[0.7fr_1.3fr] lg:gap-24 lg:px-8"
                >
                    <div
                        data-reveal="left"
                        className="self-start lg:sticky lg:top-28"
                    >
                        <p className="text-xs font-bold tracking-[0.16em] text-brand-700 uppercase">
                            Jejak perjalanan
                        </p>
                        <h2 className="mt-4 max-w-sm font-heading text-3xl leading-tight font-bold tracking-tight sm:text-4xl">
                            Cerita yang membentuk sekolah kami.
                        </h2>
                        <p className="mt-5 max-w-sm text-sm leading-7 text-slate-600">
                            Mengenal sekolah melalui peristiwa, perubahan, dan
                            kenangan yang menjadi bagian dari perjalanan kami.
                        </p>
                        <BookOpen
                            aria-hidden="true"
                            className="mt-8 size-8 stroke-[1.25] text-brand-600"
                        />
                    </div>
                    {historyEntries.length > 0 ? (
                        <ol
                            data-reveal
                            className="ml-2 border-l border-slate-300"
                        >
                            {historyEntries.map((entry, index) => (
                                <li
                                    key={entry.id}
                                    className="relative pb-14 pl-7 last:pb-0 sm:pl-10"
                                >
                                    <span
                                        aria-hidden="true"
                                        className="absolute top-3 -left-[7px] size-[13px] rounded-full border-[3px] border-[#f8f7f3] bg-brand-600 outline outline-1 outline-brand-600/30"
                                    />
                                    <div className="flex items-start justify-between gap-5">
                                        <p className="min-w-0 font-heading text-3xl leading-tight font-bold tracking-tight break-words text-brand-700 sm:text-4xl">
                                            {entry.period}
                                        </p>
                                        <span
                                            aria-hidden="true"
                                            className="pt-2 font-mono text-xs text-slate-400"
                                        >
                                            {String(index + 1).padStart(2, '0')}
                                        </span>
                                    </div>
                                    <h3 className="mt-4 font-heading text-xl leading-snug font-bold text-slate-950 sm:text-2xl">
                                        {entry.title}
                                    </h3>
                                    <p className="mt-3 text-sm leading-7 whitespace-pre-line text-slate-600 sm:text-base sm:leading-8">
                                        {entry.description}
                                    </p>
                                    {entry.photo_url && (
                                        <HistoryPhoto
                                            src={entry.photo_url}
                                            title={entry.title}
                                        />
                                    )}
                                </li>
                            ))}
                        </ol>
                    ) : (
                        <div
                            data-reveal
                            className="relative border-l border-slate-300 pl-7 sm:pl-10"
                        >
                            <span
                                aria-hidden="true"
                                className="absolute top-2 -left-[7px] size-[13px] rounded-full border-[3px] border-[#f8f7f3] bg-brand-600"
                            />
                            <h3 className="font-heading text-2xl font-bold">
                                Sejarah sekolah
                            </h3>
                            <p className="mt-5 text-base leading-8 whitespace-pre-line text-slate-600">
                                {site.school_history ??
                                    'Cerita perjalanan sekolah akan hadir di sini setelah dilengkapi oleh sekolah.'}
                            </p>
                        </div>
                    )}
                </section>

                <section className="bg-[#153c74] text-white">
                    <div className="mx-auto grid max-w-7xl gap-14 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.05fr_1fr] lg:gap-24 lg:px-8">
                        <div data-reveal="left">
                            <p className="text-xs font-bold tracking-[0.16em] text-blue-200 uppercase">
                                Visi · Yang kami tuju
                            </p>
                            <span
                                aria-hidden="true"
                                className="mt-6 block h-10 font-serif text-7xl leading-none text-blue-300"
                            >
                                “
                            </span>
                            <blockquote className="mt-4 font-heading text-2xl leading-snug font-semibold tracking-tight sm:text-3xl lg:text-4xl">
                                {site.school_vision ??
                                    'Visi sekolah akan ditampilkan setelah dilengkapi oleh sekolah.'}
                            </blockquote>
                            <p className="mt-8 border-t border-white/20 pt-5 text-xs leading-6 text-blue-100">
                                {name}
                            </p>
                        </div>
                        <div data-reveal="right">
                            <h2 className="text-xs font-bold tracking-[0.16em] text-blue-200 uppercase">
                                Misi · Langkah kami
                            </h2>
                            <ol className="mt-6 divide-y divide-white/15 border-t border-white/15">
                                {missions.length === 0 && (
                                    <li className="py-5 text-sm leading-7 text-blue-100">
                                        Misi sekolah akan ditampilkan setelah
                                        dilengkapi oleh sekolah.
                                    </li>
                                )}
                                {missions.map((mission, index) => (
                                    <li
                                        key={`${index}-${mission}`}
                                        className="flex gap-5 py-5 text-sm leading-7 text-blue-50 sm:text-base"
                                    >
                                        <span
                                            aria-hidden="true"
                                            className="pt-0.5 font-mono text-xs text-blue-300"
                                        >
                                            {String(index + 1).padStart(2, '0')}
                                        </span>
                                        <span>{mission}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>
                </section>

                <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
                    <div
                        data-reveal
                        className="mb-10 flex flex-wrap items-end justify-between gap-5 border-b border-slate-300/70 pb-8"
                    >
                        <div>
                            <p className="text-xs font-bold tracking-[0.16em] text-brand-700 uppercase">
                                Kehidupan sekolah
                            </p>
                            <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                                Ruang belajar, ruang bertumbuh.
                            </h2>
                        </div>
                        <ArrowUpRight
                            aria-hidden="true"
                            className="size-8 stroke-[1.25] text-brand-600"
                        />
                    </div>
                    <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
                        <ProgramList
                            icon={Library}
                            title="Fasilitas sekolah"
                            description="Fasilitas pendukung kegiatan belajar sehari-hari."
                            items={lines(site.school_facilities)}
                        />
                        <ProgramList
                            icon={Trophy}
                            title="Ekstrakurikuler"
                            description="Kegiatan untuk mengembangkan minat dan bakat siswa."
                            items={lines(site.school_extracurriculars)}
                        />
                    </div>
                </section>
            </main>
        </PublicLayout>
    );
}

function Identity({ label, value }: { label: string; value: string | null }) {
    return (
        <div>
            <dt className="text-xs text-slate-500">{label}</dt>
            <dd className="mt-2 text-sm font-bold text-slate-900">
                {value || 'Belum dicantumkan'}
            </dd>
        </div>
    );
}

function SchoolCover({ src, name }: { src: string | null; name: string }) {
    const [failedUrl, setFailedUrl] = useState<string | null>(null);
    const hasPhoto = Boolean(src && src !== failedUrl);
    return (
        <figure data-reveal="right">
            <div className="overflow-hidden rounded-t-[2.5rem] rounded-b-xl bg-[#eeeade] p-2">
                <img
                    src={hasPhoto ? src! : '/images/school-learning.jpg'}
                    alt={
                        hasPhoto
                            ? `Lingkungan ${name}`
                            : 'Ilustrasi kegiatan belajar di sekolah'
                    }
                    onError={() => setFailedUrl(src)}
                    fetchPriority="high"
                    width={960}
                    height={800}
                    className="aspect-[6/5] w-full rounded-t-[2rem] rounded-b-lg object-cover"
                />
            </div>
            <figcaption className="mt-3 flex items-center justify-between gap-3 px-1 text-xs text-slate-500">
                <span>
                    {hasPhoto
                        ? 'Lingkungan sekolah kami'
                        : 'Ilustrasi kegiatan belajar'}
                </span>
                <span aria-hidden="true" className="font-mono">
                    01 / PROFIL
                </span>
            </figcaption>
        </figure>
    );
}

function HistoryPhoto({ src, title }: { src: string; title: string }) {
    const [failedUrl, setFailedUrl] = useState<string | null>(null);
    if (failedUrl === src) return null;
    return (
        <img
            src={src}
            alt={title}
            onError={() => setFailedUrl(src)}
            loading="lazy"
            width={960}
            height={600}
            className="mt-6 aspect-[8/5] w-full rounded-2xl object-cover"
        />
    );
}

function ProgramList({
    description,
    icon: Icon,
    items,
    title,
}: {
    description: string;
    icon: typeof Library;
    items: string[];
    title: string;
}) {
    return (
        <article data-reveal="scale">
            <div className="flex items-start gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-brand-600/20 text-brand-700">
                    <Icon aria-hidden="true" className="size-6 stroke-[1.5]" />
                </span>
                <div>
                    <h3 className="font-heading text-xl font-bold sm:text-2xl">
                        {title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                        {description}
                    </p>
                </div>
            </div>
            <ul className="mt-7 divide-y divide-slate-200 border-y border-slate-200">
                {items.length === 0 && (
                    <li className="py-4 text-sm leading-6 text-slate-500">
                        Informasi akan ditampilkan setelah dilengkapi oleh
                        sekolah.
                    </li>
                )}
                {items.map((item, index) => (
                    <li
                        key={`${index}-${item}`}
                        className="flex items-start gap-5 py-4 text-sm font-semibold text-slate-700"
                    >
                        <span
                            aria-hidden="true"
                            className="pt-0.5 font-mono text-xs font-normal text-slate-400"
                        >
                            {String(index + 1).padStart(2, '0')}
                        </span>
                        {item}
                    </li>
                ))}
            </ul>
        </article>
    );
}
