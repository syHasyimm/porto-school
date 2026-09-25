import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BookOpen,
    CalendarDays,
    MessageSquareText,
    ShieldCheck,
} from 'lucide-react';
import { PageTransition } from '@/components/page-transition';
import { buttonVariants } from '@/components/ui/button';
import PublicLayout from '@/layouts/public-layout';
import { dashboard, login } from '@/routes';

const information = [
    {
        icon: CalendarDays,
        title: 'Kalender sekolah',
        description: 'Agenda akademik yang mudah dipantau orang tua.',
    },
    {
        icon: BookOpen,
        title: 'Kabar sekolah',
        description: 'Berita dan kegiatan terbaru dari lingkungan sekolah.',
    },
    {
        icon: MessageSquareText,
        title: 'Layanan pengaduan',
        description: 'Saluran komunikasi yang tercatat dan transparan.',
    },
];

export default function Welcome() {
    const { auth, name } = usePage().props;

    return (
        <PublicLayout>
            <Head title="Beranda" />
            <PageTransition>
                <main>
                    <section className="overflow-hidden bg-slate-50">
                        <div className="mx-auto grid min-h-[calc(100dvh-4.5rem)] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1.15fr_0.85fr] lg:px-8">
                            <div className="max-w-2xl">
                                <p className="text-sm font-bold text-brand-600">
                                    Tumbuh, belajar, dan berkarakter
                                </p>
                                <h1 className="mt-4 font-heading text-4xl leading-[1.08] font-extrabold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                                    Sekolah yang dekat dengan keluarga dan masa
                                    depan anak.
                                </h1>
                                <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                                    Temukan informasi resmi, agenda, layanan,
                                    dan perkembangan {name} dalam satu tempat.
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
                                        <ArrowRight
                                            aria-hidden="true"
                                            className="size-4"
                                        />
                                    </Link>
                                    <a
                                        href="#informasi"
                                        className={buttonVariants({
                                            size: 'lg',
                                            variant: 'secondary',
                                        })}
                                    >
                                        Lihat informasi
                                    </a>
                                </div>
                            </div>

                            <div className="relative mx-auto w-full max-w-md">
                                <div className="absolute -inset-8 rounded-full bg-brand-100/60 blur-3xl" />
                                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_28px_80px_-42px_rgba(30,64,175,0.45)] sm:p-9">
                                    <span className="grid size-14 place-items-center rounded-xl bg-brand-500 text-white">
                                        <ShieldCheck
                                            aria-hidden="true"
                                            className="size-7"
                                            strokeWidth={1.8}
                                        />
                                    </span>
                                    <h2 className="mt-8 font-heading text-2xl font-bold text-slate-950">
                                        Informasi resmi sekolah
                                    </h2>
                                    <p className="mt-3 text-sm leading-6 text-slate-600">
                                        Dikelola langsung oleh tim {name} agar
                                        informasi publik dan layanan internal
                                        tetap rapi.
                                    </p>
                                    <dl className="mt-8 grid grid-cols-2 gap-5 border-t border-slate-200 pt-6">
                                        <div>
                                            <dt className="text-xs font-semibold text-slate-500">
                                                Status
                                            </dt>
                                            <dd className="mt-1 font-heading text-lg font-bold">
                                                Negeri
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-xs font-semibold text-slate-500">
                                                Wilayah
                                            </dt>
                                            <dd className="mt-1 font-heading text-lg font-bold">
                                                Kepenuhan
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section
                        id="informasi"
                        className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
                    >
                        <div className="max-w-2xl">
                            <h2 className="font-heading text-3xl font-bold tracking-tight">
                                Akses informasi dengan lebih mudah
                            </h2>
                            <p className="mt-4 leading-7 text-slate-600">
                                Fondasi portal sekolah sudah siap untuk
                                menghadirkan layanan yang ringkas dan mudah
                                digunakan.
                            </p>
                        </div>
                        <div className="mt-10 grid gap-8 border-t border-slate-200 pt-10 md:grid-cols-3">
                            {information.map(
                                ({ icon: Icon, title, description }) => (
                                    <article key={title}>
                                        <Icon
                                            aria-hidden="true"
                                            className="size-6 text-brand-600"
                                            strokeWidth={1.8}
                                        />
                                        <h3 className="mt-5 font-heading text-lg font-bold">
                                            {title}
                                        </h3>
                                        <p className="mt-2 text-sm leading-6 text-slate-600">
                                            {description}
                                        </p>
                                    </article>
                                ),
                            )}
                        </div>
                    </section>
                </main>
            </PageTransition>
        </PublicLayout>
    );
}
