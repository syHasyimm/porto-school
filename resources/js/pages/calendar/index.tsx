import { Head, Link, usePage } from '@inertiajs/react';
import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Flag,
    Megaphone,
    NotebookPen,
    Sun,
    type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';
import { EmptyState } from '@/components/empty-state';
import { buttonVariants } from '@/components/ui/button';
import PublicLayout from '@/layouts/public-layout';
import { cn } from '@/lib/utils';
import { index } from '@/routes/calendar';
import type { AcademicEvent, SelectOption } from '@/types';

type PublicCalendarProps = {
    categories: SelectOption[];
    events: AcademicEvent[];
    filters: { category: string };
    month: string;
};

const monthFormatter = new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
});
const dateFormatter = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
});
const shortMonthFormatter = new Intl.DateTimeFormat('id-ID', {
    month: 'short',
});
const todayFormatter = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
});
const weekdays = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const categoryIcons: Record<string, LucideIcon> = {
    libur: Sun,
    ujian: NotebookPen,
    kegiatan: Flag,
    pengumuman: Megaphone,
};

function dateKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function addMonths(month: string, amount: number): string {
    const [year, monthNumber] = month.split('-').map(Number);
    return dateKey(new Date(year, monthNumber - 1 + amount, 1)).slice(0, 7);
}

function daysForMonth(month: string): Date[] {
    const [year, monthNumber] = month.split('-').map(Number);
    const first = new Date(year, monthNumber - 1, 1);
    const mondayOffset = (first.getDay() + 6) % 7;
    const start = new Date(year, monthNumber - 1, 1 - mondayOffset);
    const daysInMonth = new Date(year, monthNumber, 0).getDate();
    const cellCount = Math.ceil((mondayOffset + daysInMonth) / 7) * 7;
    return Array.from(
        { length: cellCount },
        (_, index) =>
            new Date(
                start.getFullYear(),
                start.getMonth(),
                start.getDate() + index,
            ),
    );
}

function eventsOnDate(events: AcademicEvent[], date: string): AcademicEvent[] {
    return events.filter(
        (event) =>
            event.start_date <= date &&
            (event.end_date ?? event.start_date) >= date,
    );
}

export default function PublicCalendar(props: PublicCalendarProps) {
    return (
        <PublicLayout>
            <Head title="Kalender Akademik" />
            <CalendarView
                key={`${props.month}-${props.filters.category}`}
                {...props}
            />
        </PublicLayout>
    );
}

function CalendarView({
    categories,
    events,
    filters,
    month,
}: PublicCalendarProps) {
    const { name } = usePage().props;
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [year, monthNumber] = month.split('-').map(Number);
    const monthDate = new Date(year, monthNumber - 1, 1);
    const todayDate = new Date();
    const today = dateKey(todayDate);
    const days = daysForMonth(month);
    const visibleEvents = selectedDate
        ? eventsOnDate(events, selectedDate)
        : events;

    return (
        <main data-entrance="blocks" className="bg-[#f8f7f3]">
            <section className="border-b border-[#e6e5e0]">
                <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-6 px-4 pt-10 pb-8 sm:px-6 lg:px-8">
                    <div data-reveal="left">
                        <p className="text-sm font-bold text-brand-700">
                            Agenda sekolah
                        </p>
                        <h1 className="mt-3 font-heading text-[clamp(2rem,3.8vw,3rem)] leading-tight font-extrabold tracking-tight">
                            Kalender akademik
                            <span className="text-brand-700">.</span>
                        </h1>
                        <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">
                            Jadwal libur, ujian, kegiatan, dan pengumuman {name}{' '}
                            dalam satu tempat.
                        </p>
                    </div>
                    <div
                        data-reveal="right"
                        className="hidden items-center gap-3 rounded-2xl border border-[#e2e5ed] bg-white px-5 py-4 md:flex"
                    >
                        <CalendarDays
                            aria-hidden="true"
                            className="size-5 text-brand-700"
                        />
                        <div>
                            <p className="text-xs font-medium text-slate-500">
                                Hari ini
                            </p>
                            <time
                                dateTime={today}
                                className="mt-1 block text-sm font-bold text-slate-800"
                            >
                                {todayFormatter.format(todayDate)}
                            </time>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 pt-7 pb-16 sm:px-6 sm:pb-20 lg:px-8">
                <nav
                    data-reveal
                    aria-label="Filter kategori agenda"
                    className="mb-6 flex flex-wrap gap-2"
                >
                    {[{ value: '', label: 'Semua agenda' }, ...categories].map(
                        (category) => {
                            const Icon =
                                categoryIcons[category.value] ?? CalendarDays;
                            const active = category.value === filters.category;
                            return (
                                <Link
                                    key={category.value}
                                    href={index({
                                        query: {
                                            month,
                                            category:
                                                category.value || undefined,
                                        },
                                    })}
                                    preserveScroll
                                    aria-current={active ? 'page' : undefined}
                                    className={cn(
                                        'inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 data-loading:opacity-60',
                                        active
                                            ? 'border-brand-700 bg-brand-700 text-white'
                                            : 'border-[#dce1ea] bg-white text-slate-600 hover:border-brand-700/30 hover:bg-brand-50 hover:text-brand-700',
                                    )}
                                >
                                    <Icon
                                        aria-hidden="true"
                                        className="size-4 stroke-[1.75]"
                                    />
                                    {category.label}
                                </Link>
                            );
                        },
                    )}
                </nav>

                <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_19rem] xl:grid-cols-[minmax(0,1fr)_21rem]">
                    <section
                        data-reveal="scale"
                        aria-labelledby="calendar-month-heading"
                        className="min-w-0 overflow-hidden rounded-[1.75rem] border border-[#dce3ee] bg-white shadow-[0_14px_36px_-28px_rgba(39,58,88,0.3)]"
                    >
                        <header className="flex items-center justify-between gap-3 border-b border-[#dce3ee] bg-[#eaf0f9] px-4 py-5 sm:px-6">
                            <div className="flex min-w-0 items-center gap-3">
                                <span className="hidden size-11 shrink-0 place-items-center rounded-xl border border-brand-700/10 bg-white text-brand-700 sm:grid">
                                    <CalendarDays
                                        aria-hidden="true"
                                        className="size-5"
                                    />
                                </span>
                                <div>
                                    <h2
                                        id="calendar-month-heading"
                                        className="font-heading text-lg leading-tight font-bold tracking-tight capitalize sm:text-2xl"
                                    >
                                        {monthFormatter.format(monthDate)}
                                    </h2>
                                    <p className="mt-1.5 text-xs text-slate-500">
                                        Jadwal kegiatan sekolah
                                    </p>
                                </div>
                            </div>
                            <div className="flex shrink-0 gap-1.5">
                                <Link
                                    href={index({
                                        query: {
                                            month: addMonths(month, -1),
                                            category:
                                                filters.category || undefined,
                                        },
                                    })}
                                    preserveScroll
                                    aria-label="Bulan sebelumnya"
                                    className={cn(
                                        buttonVariants({
                                            size: 'icon',
                                            variant: 'secondary',
                                        }),
                                        'size-11 rounded-full border-[#d3ddeb] hover:border-brand-700/30 hover:text-brand-700',
                                    )}
                                >
                                    <ChevronLeft
                                        aria-hidden="true"
                                        className="size-4"
                                    />
                                </Link>
                                <Link
                                    href={index({
                                        query: {
                                            month: addMonths(month, 1),
                                            category:
                                                filters.category || undefined,
                                        },
                                    })}
                                    preserveScroll
                                    aria-label="Bulan berikutnya"
                                    className={cn(
                                        buttonVariants({
                                            size: 'icon',
                                            variant: 'secondary',
                                        }),
                                        'size-11 rounded-full border-[#d3ddeb] hover:border-brand-700/30 hover:text-brand-700',
                                    )}
                                >
                                    <ChevronRight
                                        aria-hidden="true"
                                        className="size-4"
                                    />
                                </Link>
                            </div>
                        </header>

                        <div className="grid grid-cols-7 px-2 pt-4 pb-2 sm:px-4">
                            {weekdays.map((day, weekday) => (
                                <span
                                    key={day}
                                    className={cn(
                                        'py-2 text-center text-[11px] font-semibold sm:text-xs',
                                        weekday >= 5
                                            ? 'text-slate-400'
                                            : 'text-slate-600',
                                    )}
                                >
                                    {day}
                                </span>
                            ))}
                        </div>
                        <div
                            aria-label={`Tanggal pada ${monthFormatter.format(monthDate)}`}
                            className="grid grid-cols-7 gap-1 px-2 pb-4 sm:px-4"
                        >
                            {days.map((day) => {
                                const key = dateKey(day);
                                const dayEvents = eventsOnDate(events, key);
                                const isCurrentMonth =
                                    day.getMonth() === monthDate.getMonth();
                                const isToday = key === today;
                                const selected = key === selectedDate;
                                const weekend =
                                    day.getDay() === 0 || day.getDay() === 6;
                                return (
                                    <button
                                        key={key}
                                        type="button"
                                        disabled={!isCurrentMonth}
                                        aria-label={`${dateFormatter.format(day)}, ${dayEvents.length ? `${dayEvents.length} agenda` : 'tidak ada agenda'}`}
                                        aria-current={
                                            isToday ? 'date' : undefined
                                        }
                                        aria-pressed={selected}
                                        aria-controls="calendar-agenda-list"
                                        onClick={() =>
                                            setSelectedDate(
                                                selected ? null : key,
                                            )
                                        }
                                        className={cn(
                                            'flex min-h-16 min-w-0 flex-col items-center rounded-xl border p-1 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-600 sm:min-h-22 sm:items-start sm:p-2',
                                            !isCurrentMonth
                                                ? 'border-transparent bg-slate-50/40 text-slate-300'
                                                : selected
                                                  ? 'border-brand-600 bg-brand-50 ring-1 ring-brand-600'
                                                  : 'border-[#edf0f5] text-slate-700 hover:border-brand-700/20 hover:bg-brand-50/60',
                                            isCurrentMonth &&
                                                !selected &&
                                                weekend &&
                                                'bg-[#f7f9fc]',
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                'inline-flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-semibold tabular-nums sm:text-sm',
                                                isToday &&
                                                    'bg-brand-600 font-bold text-white',
                                            )}
                                        >
                                            {day.getDate()}
                                        </span>
                                        <span
                                            aria-hidden="true"
                                            className="mt-1 hidden w-full space-y-1 sm:block"
                                        >
                                            {dayEvents
                                                .slice(0, 2)
                                                .map((event) => (
                                                    <span
                                                        key={event.id}
                                                        title={event.title}
                                                        className="block truncate rounded-md border-l-[3px] bg-[#edf1f7] px-1.5 py-1 text-[10px] leading-3 font-medium text-slate-700"
                                                        style={{
                                                            borderLeftColor:
                                                                event.color,
                                                        }}
                                                    >
                                                        {event.title}
                                                    </span>
                                                ))}
                                            {dayEvents.length > 2 && (
                                                <span className="block text-[10px] font-semibold text-slate-500">
                                                    +{dayEvents.length - 2}{' '}
                                                    agenda
                                                </span>
                                            )}
                                        </span>
                                        <span
                                            aria-hidden="true"
                                            className="mt-2 flex items-center gap-1 sm:hidden"
                                        >
                                            {dayEvents
                                                .slice(0, 3)
                                                .map((event) => (
                                                    <span
                                                        key={event.id}
                                                        className="size-1.5 rounded-full"
                                                        style={{
                                                            backgroundColor:
                                                                event.color,
                                                        }}
                                                    />
                                                ))}
                                            {dayEvents.length > 3 && (
                                                <span className="text-[9px] font-bold">
                                                    +
                                                </span>
                                            )}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e4e8ef] px-4 py-3 sm:px-6">
                            <Link
                                href={index({
                                    query: {
                                        month: today.slice(0, 7),
                                        category: filters.category || undefined,
                                    },
                                })}
                                preserveScroll
                                className="inline-flex min-h-11 items-center gap-2 rounded-lg text-xs font-bold text-brand-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                            >
                                <CalendarDays
                                    aria-hidden="true"
                                    className="size-4"
                                />
                                Bulan ini
                            </Link>
                            <p
                                className={cn(
                                    'text-[11px] leading-5 text-slate-500',
                                    selectedDate && 'hidden lg:block',
                                )}
                            >
                                Pilih tanggal untuk melihat agenda.
                            </p>
                            {selectedDate && (
                                <a
                                    href="#calendar-agenda-list"
                                    className="inline-flex min-h-11 items-center rounded-lg text-xs font-bold text-brand-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 lg:hidden"
                                >
                                    Lihat agenda tanggal ini
                                </a>
                            )}
                        </footer>
                    </section>

                    <aside
                        data-reveal="right"
                        id="calendar-agenda-list"
                        aria-label="Daftar agenda sekolah"
                        className="min-w-0 scroll-mt-24 self-start lg:sticky lg:top-24"
                    >
                        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <h2 className="font-heading text-xl font-bold tracking-tight">
                                    {selectedDate
                                        ? 'Agenda tanggal terpilih'
                                        : 'Agenda bulan ini'}
                                </h2>
                                <p
                                    className="mt-2 text-xs leading-5 text-slate-500"
                                    role="status"
                                >
                                    {selectedDate
                                        ? dateFormatter.format(
                                              new Date(
                                                  `${selectedDate}T00:00:00`,
                                              ),
                                          )
                                        : monthFormatter.format(monthDate)}{' '}
                                    · {visibleEvents.length} agenda
                                </p>
                            </div>
                            {selectedDate && (
                                <button
                                    type="button"
                                    onClick={() => setSelectedDate(null)}
                                    className="min-h-11 rounded-lg text-xs font-bold text-brand-700 hover:underline focus-visible:outline-2 focus-visible:outline-brand-600"
                                >
                                    Lihat semua
                                </button>
                            )}
                        </div>
                        {visibleEvents.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-[#d4dce8] bg-white">
                                <EmptyState
                                    icon={CalendarDays}
                                    title={
                                        selectedDate
                                            ? 'Tidak ada agenda pada tanggal ini'
                                            : 'Belum ada agenda'
                                    }
                                    description={
                                        selectedDate
                                            ? 'Pilih tanggal lain atau lihat seluruh agenda bulan ini.'
                                            : 'Agenda akan muncul setelah diperbarui oleh sekolah. Coba bulan atau kategori lainnya.'
                                    }
                                />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {visibleEvents.map((event) => (
                                    <AgendaCard key={event.id} event={event} />
                                ))}
                            </div>
                        )}
                        <p className="mt-5 text-xs leading-6 text-slate-500">
                            Jadwal mengikuti informasi terbaru yang diterbitkan
                            sekolah.
                        </p>
                    </aside>
                </div>
            </section>
        </main>
    );
}

function AgendaCard({ event }: { event: AcademicEvent }) {
    const start = new Date(`${event.start_date}T00:00:00`);
    const Icon = categoryIcons[event.category] ?? CalendarDays;
    const spansDates = Boolean(
        event.end_date && event.end_date !== event.start_date,
    );
    return (
        <article className="overflow-hidden rounded-2xl border border-[#e1e5ed] bg-white">
            <div
                className="h-1"
                aria-hidden="true"
                style={{ backgroundColor: event.color }}
            />
            <div className="p-5">
                <div className="flex items-start gap-4">
                    <time
                        dateTime={event.start_date}
                        className="flex w-14 shrink-0 flex-col items-center rounded-xl border border-brand-700/10 bg-brand-50 px-2 py-3 text-brand-700"
                    >
                        <span className="font-heading text-2xl leading-none font-bold tabular-nums">
                            {start.getDate()}
                        </span>
                        <span className="mt-1.5 text-[11px] font-semibold">
                            {shortMonthFormatter.format(start)}
                        </span>
                    </time>
                    <div className="min-w-0">
                        <p className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                            <Icon aria-hidden="true" className="size-3.5" />
                            {event.category_label}
                        </p>
                        <h3 className="mt-2 font-heading text-base leading-6 font-bold tracking-tight break-words text-slate-900">
                            {event.title}
                        </h3>
                    </div>
                </div>
                <p className="mt-4 text-xs leading-6 font-medium text-slate-500">
                    {dateFormatter.format(start)}
                    {spansDates && (
                        <>
                            {' '}
                            s.d.{' '}
                            {dateFormatter.format(
                                new Date(`${event.end_date}T00:00:00`),
                            )}
                        </>
                    )}
                </p>
                {event.description && (
                    <p className="mt-3 border-t border-[#edf0f5] pt-3 text-sm leading-6 break-words whitespace-pre-line text-slate-600">
                        {event.description}
                    </p>
                )}
            </div>
        </article>
    );
}
