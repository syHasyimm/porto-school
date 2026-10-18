import { Head, Link } from '@inertiajs/react';
import {
    ArrowUpRight,
    BellRing,
    CalendarCheck2,
    CalendarDays,
    ChevronRight,
    MessageSquareText,
    Newspaper,
    UsersRound,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { PageTransition } from '@/components/page-transition';
import AdminLayout from '@/layouts/admin-layout';
import { index as calendarIndex } from '@/routes/admin/calendar';
import { index as newsIndex } from '@/routes/admin/news';

type DashboardEvent = {
    category_label: string;
    end_date: string | null;
    id: number;
    start_date: string;
    title: string;
};

type DashboardNews = {
    id: number;
    published_at: string | null;
    title: string;
};

type AdminDashboardProps = {
    overview: {
        news: {
            count: number;
            latest: DashboardNews | null;
        };
        next_event: DashboardEvent | null;
        today: string;
        today_event_count: number;
        today_events: DashboardEvent[];
    };
};

const modules = [
    {
        icon: UsersRound,
        label: 'Data guru',
        description: 'Kelola akun dan profil pendidik',
    },
    {
        icon: CalendarDays,
        label: 'Kalender',
        description: 'Susun agenda akademik sekolah',
    },
    {
        icon: MessageSquareText,
        label: 'Pengaduan',
        description: 'Pantau tindak lanjut pengaduan',
    },
    {
        icon: Newspaper,
        label: 'Publikasi',
        description: 'Kelola berita dan galeri sekolah',
    },
];

const fullDateFormatter = new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'full',
});

const shortDateFormatter = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
});

const monthFormatter = new Intl.DateTimeFormat('id-ID', {
    month: 'short',
});

const newsDateFormatter = new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
});

function dateFromValue(value: string): Date {
    return new Date(`${value}T00:00:00`);
}

function eventDateLabel(event: DashboardEvent, today: string): string {
    if (event.start_date === today) {
        return event.end_date && event.end_date !== today
            ? `Mulai hari ini hingga ${shortDateFormatter.format(dateFromValue(event.end_date))}`
            : 'Hari ini';
    }

    return event.end_date
        ? `Berlangsung hingga ${shortDateFormatter.format(dateFromValue(event.end_date))}`
        : shortDateFormatter.format(dateFromValue(event.start_date));
}

export default function AdminDashboard({ overview }: AdminDashboardProps) {
    const currentDate = dateFromValue(overview.today);
    const nextEventDate = overview.next_event
        ? shortDateFormatter.format(
              dateFromValue(overview.next_event.start_date),
          )
        : null;
    const hasTodayEvents = overview.today_event_count > 0;
    const hasTodayNews = overview.news.count > 0;

    return (
        <AdminLayout active="dashboard" title="Dashboard Admin">
            <Head title="Dashboard Admin" />
            <PageTransition>
                <PageHeader
                    title="Dashboard"
                    description="Pantau agenda dan publikasi terbaru dari satu tempat."
                />
                <section
                    className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(19rem,1fr)]"
                    aria-label="Ringkasan hari ini"
                >
                    <article className="relative overflow-hidden rounded-2xl bg-brand-600 p-6 text-white shadow-sm shadow-brand-600/20 sm:p-7">
                        <div className="absolute -right-14 -bottom-20 size-60 rounded-full border-[1.5rem] border-white/12" />
                        <div className="relative flex h-full flex-col justify-between gap-7">
                            <div>
                                <p className="text-xs font-bold tracking-[0.16em] text-white/70 uppercase">
                                    Ringkasan hari ini
                                </p>
                                <h2 className="mt-3 max-w-xl font-heading text-2xl font-bold tracking-tight sm:text-3xl">
                                    {hasTodayEvents
                                        ? `${overview.today_event_count} agenda perlu diperhatikan.`
                                        : 'Tidak ada agenda untuk hari ini.'}
                                </h2>
                                <p className="mt-3 max-w-xl text-sm leading-6 text-white/80">
                                    {fullDateFormatter.format(currentDate)}.{' '}
                                    {hasTodayNews
                                        ? `${overview.news.count} berita baru telah diterbitkan.`
                                        : 'Belum ada berita baru yang diterbitkan.'}
                                </p>
                            </div>
                            <Link
                                href={calendarIndex()}
                                className="inline-flex w-fit items-center gap-2 text-sm font-bold text-white underline decoration-white/35 underline-offset-4 transition hover:decoration-white"
                            >
                                Buka kalender akademik
                                <ArrowUpRight
                                    aria-hidden="true"
                                    className="size-4"
                                />
                            </Link>
                        </div>
                        <div className="absolute top-6 right-6 grid size-20 place-items-center rounded-2xl border border-white/25 bg-white/12 text-center backdrop-blur-sm sm:top-7 sm:right-7">
                            <strong className="font-heading text-3xl leading-none tracking-tight">
                                {currentDate.getDate()}
                            </strong>
                            <span className="mt-1 text-[10px] font-bold tracking-[0.14em] uppercase">
                                {monthFormatter.format(currentDate)}
                            </span>
                        </div>
                    </article>

                    <article className="flex flex-col rounded-2xl border border-amber-100 bg-amber-50 p-6 sm:p-7">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-bold tracking-[0.16em] text-amber-700 uppercase">
                                    Pengingat publikasi
                                </p>
                                <h2 className="mt-2 font-heading text-lg font-bold tracking-tight text-slate-950">
                                    Berita baru hari ini
                                </h2>
                            </div>
                            <Badge
                                variant="amber"
                                className="min-w-8 justify-center bg-amber-500 text-white"
                            >
                                {overview.news.count}
                            </Badge>
                        </div>
                        {overview.news.latest ? (
                            <div className="mt-5 flex flex-1 flex-col justify-between gap-4">
                                <div>
                                    <h3 className="font-heading text-base leading-6 font-bold text-slate-900">
                                        {overview.news.latest.title}
                                    </h3>
                                    <p className="mt-2 text-sm leading-6 text-amber-800">
                                        Berita terbaru yang diterbitkan hari
                                        ini.
                                    </p>
                                </div>
                                {overview.news.latest.published_at && (
                                    <p className="text-xs font-bold text-amber-700">
                                        Diterbitkan{' '}
                                        {newsDateFormatter.format(
                                            new Date(
                                                overview.news.latest
                                                    .published_at,
                                            ),
                                        )}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="mt-5 flex flex-1 flex-col justify-center">
                                <BellRing
                                    aria-hidden="true"
                                    className="size-7 text-amber-600"
                                    strokeWidth={1.8}
                                />
                                <p className="mt-3 text-sm leading-6 text-amber-800">
                                    Pengingat akan muncul otomatis saat berita
                                    baru diterbitkan hari ini.
                                </p>
                            </div>
                        )}
                        <Link
                            href={newsIndex()}
                            className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-amber-800 transition hover:text-amber-950"
                        >
                            Kelola berita
                            <ChevronRight
                                aria-hidden="true"
                                className="size-4"
                            />
                        </Link>
                    </article>
                </section>

                <section
                    className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white"
                    aria-labelledby="calendar-reminder-title"
                >
                    <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:p-6">
                        <div>
                            <p className="text-xs font-bold tracking-[0.16em] text-brand-600 uppercase">
                                Kalender akademik
                            </p>
                            <h2
                                id="calendar-reminder-title"
                                className="mt-1 font-heading text-lg font-bold tracking-tight text-slate-950"
                            >
                                {hasTodayEvents
                                    ? 'Agenda yang berlangsung hari ini'
                                    : 'Agenda hari ini'}
                            </h2>
                        </div>
                        <Link
                            href={calendarIndex()}
                            className={buttonVariants({
                                variant: 'secondary',
                                size: 'sm',
                            })}
                        >
                            <CalendarDays
                                aria-hidden="true"
                                className="size-4"
                            />
                            Lihat kalender
                        </Link>
                    </div>
                    {hasTodayEvents ? (
                        <div className="divide-y divide-slate-100">
                            {overview.today_events.map((event) => {
                                const eventDate = dateFromValue(
                                    event.start_date,
                                );

                                return (
                                    <article
                                        key={event.id}
                                        className="flex items-center gap-4 px-5 py-4 sm:px-6"
                                    >
                                        <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand-50 text-center text-brand-700">
                                            <strong className="font-heading text-lg leading-none tracking-tight">
                                                {eventDate.getDate()}
                                            </strong>
                                            <span className="text-[9px] font-bold tracking-[0.12em] uppercase">
                                                {monthFormatter.format(
                                                    eventDate,
                                                )}
                                            </span>
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="truncate font-heading text-sm font-bold text-slate-950">
                                                {event.title}
                                            </h3>
                                            <p className="mt-1 text-xs font-semibold text-slate-500">
                                                {eventDateLabel(
                                                    event,
                                                    overview.today,
                                                )}
                                                <span className="mx-1.5 text-brand-500">
                                                    •
                                                </span>
                                                {event.category_label}
                                            </p>
                                        </div>
                                        <CalendarCheck2
                                            aria-hidden="true"
                                            className="ml-auto size-5 shrink-0 text-brand-600"
                                            strokeWidth={1.8}
                                        />
                                    </article>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                            <div className="flex items-center gap-3">
                                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                                    <CalendarCheck2
                                        aria-hidden="true"
                                        className="size-5"
                                        strokeWidth={1.8}
                                    />
                                </span>
                                <p className="text-sm leading-6 text-slate-600">
                                    {overview.next_event && nextEventDate
                                        ? `Agenda berikutnya: ${overview.next_event.title} pada ${nextEventDate}.`
                                        : 'Belum ada agenda yang dijadwalkan.'}
                                </p>
                            </div>
                            <Link
                                href={calendarIndex()}
                                className="text-sm font-bold text-brand-600 transition hover:text-brand-700"
                            >
                                Atur agenda
                            </Link>
                        </div>
                    )}
                </section>

                <section
                    className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
                    aria-label="Modul admin"
                >
                    {modules.map(({ icon: Icon, label, description }) => (
                        <article
                            key={label}
                            className="rounded-xl border border-slate-200 bg-white p-5"
                        >
                            <Icon
                                aria-hidden="true"
                                className="size-5 text-brand-600"
                                strokeWidth={1.8}
                            />
                            <h2 className="mt-5 font-heading text-base font-bold">
                                {label}
                            </h2>
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                {description}
                            </p>
                        </article>
                    ))}
                </section>
            </PageTransition>
        </AdminLayout>
    );
}
