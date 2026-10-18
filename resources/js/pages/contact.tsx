import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowUpRight,
    ExternalLink,
    Mail,
    MapPin,
    MessageSquare,
    Phone,
    type LucideIcon,
} from 'lucide-react';
import { CopyButton } from '@/components/copy-button';
import PublicLayout from '@/layouts/public-layout';
import { create as complaintCreate } from '@/routes/complaints';

export default function Contact() {
    const { name, site } = usePage().props;
    const phone = site.school_phone?.trim() || null;
    const email = site.school_email?.trim() || null;
    const phoneHref = phone?.replace(/[^+\d]/g, '');
    const address = site.school_address?.trim();
    const hasAddress = Boolean(
        address &&
        address !== 'Lengkapi alamat resmi sekolah sebelum publikasi.',
    );
    const locationQuery = hasAddress
        ? [site.school_name, address].filter(Boolean).join(', ')
        : null;
    const configuredMapUrl = site.map_embed_url?.trim() || null;
    const isShareUrl = configuredMapUrl
        ? isGoogleMapsShareUrl(configuredMapUrl)
        : false;
    const mapEmbedUrl =
        (isShareUrl ? null : configuredMapUrl) ||
        (locationQuery
            ? `https://maps.google.com/maps?q=${encodeURIComponent(locationQuery)}&output=embed`
            : null);
    const mapsUrl =
        (isShareUrl ? configuredMapUrl : null) ||
        (locationQuery
            ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationQuery)}`
            : null);
    const socialLinks = [
        { label: 'Facebook', url: site.facebook_url },
        { label: 'Instagram', url: site.instagram_url },
    ];

    return (
        <PublicLayout>
            <Head title="Kontak">
                <meta
                    name="description"
                    content={`Temukan kontak dan informasi lokasi ${name}.`}
                />
            </Head>
            <main data-entrance="blocks" className="bg-[#f8f7f3]">
                <header className="border-b border-[#e6e5e0]">
                    <div
                        data-reveal
                        className="mx-auto max-w-7xl px-4 pt-10 pb-8 sm:px-6 lg:px-8"
                    >
                        <p className="text-sm font-bold text-brand-700">
                            Kontak & lokasi
                        </p>
                        <h1 className="mt-3 font-heading text-[clamp(2rem,3.8vw,3rem)] leading-tight font-extrabold tracking-tight text-balance">
                            Hubungi sekolah
                            <span className="text-brand-700">.</span>
                        </h1>
                        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
                            Informasi kontak {name} untuk orang tua, calon
                            siswa, dan masyarakat.
                        </p>
                    </div>
                </header>

                <div className="mx-auto max-w-7xl px-4 pt-8 pb-16 sm:px-6 lg:px-8 lg:pb-20">
                    <div className="grid items-start gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                        <section
                            data-reveal="left"
                            aria-labelledby="school-contact-heading"
                            className="min-w-0 rounded-[1.75rem] border border-[#dce3ee] bg-white p-6 sm:p-8"
                        >
                            <h2
                                id="school-contact-heading"
                                className="font-heading text-xl font-bold tracking-tight sm:text-2xl"
                            >
                                Kontak sekolah
                            </h2>
                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                Untuk pertanyaan dan informasi sekolah.
                            </p>
                            <div className="mt-6 divide-y divide-[#e5e9ef] border-t border-[#e5e9ef]">
                                <ContactChannel
                                    icon={Phone}
                                    title="Nomor telepon"
                                    value={phone && phoneHref ? phone : null}
                                    href={
                                        phoneHref
                                            ? `tel:${phoneHref}`
                                            : undefined
                                    }
                                    actionLabel="Telepon sekolah"
                                    copyLabel="nomor telepon"
                                    emptyLabel="Nomor telepon sekolah belum tersedia."
                                />
                                <ContactChannel
                                    icon={Mail}
                                    title="Email sekolah"
                                    value={email}
                                    href={email ? `mailto:${email}` : undefined}
                                    actionLabel="Kirim email"
                                    copyLabel="alamat email"
                                    emptyLabel="Email sekolah belum tersedia."
                                />
                                <section
                                    className="pt-6"
                                    aria-labelledby="school-social-heading"
                                >
                                    <h3
                                        id="school-social-heading"
                                        className="font-heading text-sm font-bold text-slate-800"
                                    >
                                        Ikuti kabar sekolah
                                    </h3>
                                    {socialLinks.some((link) => link.url) ? (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {socialLinks.map(
                                                (link) =>
                                                    link.url && (
                                                        <a
                                                            key={link.label}
                                                            href={link.url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#dce1ea] px-4 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-brand-700/30 hover:bg-brand-50 hover:text-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                                                        >
                                                            {link.label}
                                                            <ExternalLink
                                                                aria-hidden="true"
                                                                className="size-3.5"
                                                            />
                                                            <span className="sr-only">
                                                                {' '}
                                                                (buka di tab
                                                                baru)
                                                            </span>
                                                        </a>
                                                    ),
                                            )}
                                        </div>
                                    ) : (
                                        <p className="mt-2 text-xs leading-6 text-slate-500">
                                            Akun media sosial sekolah belum
                                            tersedia.
                                        </p>
                                    )}
                                </section>
                            </div>
                        </section>

                        <section
                            data-reveal="right"
                            aria-labelledby="school-location-heading"
                            className="min-w-0 overflow-hidden rounded-[1.75rem] border border-[#dce3ee] bg-white"
                        >
                            <header className="px-6 py-5 sm:px-8">
                                <h2
                                    id="school-location-heading"
                                    className="font-heading text-xl font-bold tracking-tight sm:text-2xl"
                                >
                                    Lokasi sekolah
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                    Temukan lokasi sekolah sebelum berkunjung.
                                </p>
                            </header>
                            {mapEmbedUrl ? (
                                <iframe
                                    src={mapEmbedUrl}
                                    title={`Peta lokasi ${name}`}
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    className="h-72 w-full border-y border-[#dce3ee] sm:h-80"
                                />
                            ) : (
                                <div className="flex min-h-72 flex-col items-center justify-center border-y border-[#dce3ee] bg-[#eaf0f9] px-6 py-8 text-center sm:min-h-80">
                                    <span className="grid size-16 place-items-center rounded-2xl border border-brand-700/10 bg-white/70 text-brand-700">
                                        <MapPin
                                            aria-hidden="true"
                                            className="size-7 stroke-[1.5]"
                                        />
                                    </span>
                                    <h3 className="mt-5 font-heading text-lg font-bold tracking-tight text-slate-800">
                                        Lokasi belum tersedia
                                    </h3>
                                    <p className="mt-2 max-w-xs text-sm leading-7 text-slate-500">
                                        Peta akan tampil setelah sekolah
                                        melengkapi informasi lokasi.
                                    </p>
                                </div>
                            )}
                            <div className="flex items-start gap-3 px-6 py-5 sm:px-8">
                                <MapPin
                                    aria-hidden="true"
                                    className="mt-0.5 size-4 shrink-0 text-brand-700"
                                />
                                <div className="min-w-0">
                                    <h3 className="text-xs font-bold text-slate-800">
                                        Alamat sekolah
                                    </h3>
                                    {hasAddress ? (
                                        <div className="mt-2 flex flex-col items-start gap-3">
                                            <address className="text-sm leading-7 break-words whitespace-pre-line text-slate-600 not-italic">
                                                {address}
                                            </address>
                                            {mapsUrl && (
                                                <a
                                                    href={mapsUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex min-h-11 items-center gap-2 text-xs font-bold text-brand-700 hover:text-brand-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                                                >
                                                    Buka di Google Maps
                                                    <ExternalLink
                                                        aria-hidden="true"
                                                        className="size-3.5"
                                                    />
                                                </a>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="mt-2 text-sm leading-7 text-slate-500">
                                            Alamat resmi sekolah belum
                                            dilengkapi.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </section>
                    </div>

                    <section
                        data-reveal="scale"
                        aria-labelledby="contact-complaint-heading"
                        className="mt-8 flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-brand-700/10 bg-[#edf2fa] px-6 py-5 sm:px-8"
                    >
                        <div className="flex items-start gap-4">
                            <span className="hidden size-11 shrink-0 place-items-center rounded-xl border border-brand-700/10 bg-white/80 text-brand-700 sm:grid">
                                <MessageSquare
                                    aria-hidden="true"
                                    className="size-5 stroke-[1.75]"
                                />
                            </span>
                            <div>
                                <h2
                                    id="contact-complaint-heading"
                                    className="font-heading text-base font-bold tracking-tight text-slate-900"
                                >
                                    Punya saran atau keluhan?
                                </h2>
                                <p className="mt-1 text-sm leading-6 text-slate-600">
                                    Sampaikan melalui halaman pengaduan sekolah.
                                </p>
                            </div>
                        </div>
                        <Link
                            href={complaintCreate()}
                            className="inline-flex min-h-11 items-center gap-3 rounded-full border border-brand-700/15 bg-white px-5 py-3 text-xs font-bold text-brand-700 transition-colors hover:border-brand-700/30 hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                        >
                            Buka pengaduan
                            <ArrowUpRight
                                aria-hidden="true"
                                className="size-4"
                            />
                        </Link>
                    </section>
                </div>
            </main>
        </PublicLayout>
    );
}

function isGoogleMapsShareUrl(url: string): boolean {
    try {
        const parsed = new URL(url);

        if (parsed.protocol !== 'https:') {
            return false;
        }

        if (parsed.hostname === 'maps.app.goo.gl') {
            return true;
        }

        return (
            ['google.com', 'www.google.com', 'maps.google.com'].includes(
                parsed.hostname,
            ) &&
            parsed.pathname.startsWith('/maps') &&
            !parsed.pathname.startsWith('/maps/embed') &&
            parsed.searchParams.get('output') !== 'embed'
        );
    } catch {
        return false;
    }
}

function ContactChannel({
    icon: Icon,
    title,
    value,
    href,
    actionLabel,
    copyLabel,
    emptyLabel,
}: {
    icon: LucideIcon;
    title: string;
    value: string | null;
    href?: string;
    actionLabel: string;
    copyLabel: string;
    emptyLabel: string;
}) {
    return (
        <section className="grid grid-cols-[2.75rem_minmax(0,1fr)] items-start gap-x-4 gap-y-2 py-6">
            <span className="grid size-11 place-items-center rounded-xl border border-brand-700/10 bg-brand-50 text-brand-700 sm:row-span-3">
                <Icon aria-hidden="true" className="size-5 stroke-[1.75]" />
            </span>
            <h3 className="self-center text-xs font-semibold text-slate-500 sm:self-start">
                {title}
            </h3>
            {value && href ? (
                <>
                    <p className="col-span-2 text-base leading-7 font-bold break-all text-slate-800 select-all sm:col-span-1 sm:col-start-2 sm:text-lg">
                        {value}
                    </p>
                    <div className="col-span-2 mt-1 flex flex-wrap items-start gap-2 sm:col-span-1 sm:col-start-2">
                        <a
                            href={href}
                            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand-700 px-4 py-3 text-xs font-bold text-white transition-colors hover:bg-brand-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                        >
                            {actionLabel}
                            <ArrowUpRight
                                aria-hidden="true"
                                className="size-3.5"
                            />
                        </a>
                        <CopyButton value={value} label={copyLabel} />
                    </div>
                </>
            ) : (
                <p className="col-span-2 text-sm leading-7 text-slate-500 sm:col-span-1 sm:col-start-2">
                    {emptyLabel}
                </p>
            )}
        </section>
    );
}
