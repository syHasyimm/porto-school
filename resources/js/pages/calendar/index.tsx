import { Form, Head, Link } from '@inertiajs/react';
import { CalendarDays, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { PageTransition } from '@/components/page-transition';
import { Button, buttonVariants } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
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
const weekdays = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

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

    return Array.from(
        { length: 42 },
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

export default function PublicCalendar({
    categories,
    events,
    filters,
    month,
}: PublicCalendarProps) {
    const [year, monthNumber] = month.split('-').map(Number);
    const monthDate = new Date(year, monthNumber - 1, 1);
    const days = daysForMonth(month);

    return (
        <PublicLayout>
            <Head title="Kalender Akademik" />
            <PageTransition>
                <main>
                    <section className="bg-slate-50">
                        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
                            <p className="text-sm font-bold text-brand-600">
                                Agenda sekolah
                            </p>
                            <h1 className="mt-3 font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">
                                Kalender akademik
                            </h1>
                            <p className="mt-5 max-w-2xl leading-7 text-slate-600">
                                Pantau jadwal libur, ujian, kegiatan, dan
                                pengumuman SD Negeri 001 Kepenuhan.
                            </p>
                        </div>
                    </section>
                    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                            <div className="flex items-center gap-2">
                                <Link
                                    href={index({
                                        query: {
                                            month: addMonths(month, -1),
                                            category:
                                                filters.category || undefined,
                                        },
                                    })}
                                    className={buttonVariants({
                                        size: 'icon',
                                        variant: 'secondary',
                                    })}
                                    aria-label="Bulan sebelumnya"
                                >
                                    <ChevronLeft className="size-4" />
                                </Link>
                                <h2 className="min-w-52 text-center font-heading text-xl font-bold capitalize">
                                    {monthFormatter.format(monthDate)}
                                </h2>
                                <Link
                                    href={index({
                                        query: {
                                            month: addMonths(month, 1),
                                            category:
                                                filters.category || undefined,
                                        },
                                    })}
                                    className={buttonVariants({
                                        size: 'icon',
                                        variant: 'secondary',
                                    })}
                                    aria-label="Bulan berikutnya"
                                >
                                    <ChevronRight className="size-4" />
                                </Link>
                            </div>
                            <Form action={index()} className="flex gap-2">
                                <input
                                    type="hidden"
                                    name="month"
                                    value={month}
                                />
                                <Select
                                    name="category"
                                    defaultValue={filters.category}
                                    className="min-w-44"
                                >
                                    <option value="">Semua kategori</option>
                                    {categories.map((category) => (
                                        <option
                                            key={category.value}
                                            value={category.value}
                                        >
                                            {category.label}
                                        </option>
                                    ))}
                                </Select>
                                <Button type="submit" variant="secondary">
                                    Filter
                                </Button>
                            </Form>
                        </div>

                        <div className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white">
                            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
                                {weekdays.map((day) => (
                                    <div
                                        key={day}
                                        className="px-2 py-3 text-center text-xs font-bold text-slate-500"
                                    >
                                        {day}
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7">
                                {days.map((day) => {
                                    const key = dateKey(day);
                                    const dayEvents = eventsOnDate(events, key);
                                    const isCurrentMonth =
                                        day.getMonth() === monthDate.getMonth();
                                    return (
                                        <div
                                            key={key}
                                            className={cn(
                                                'min-h-24 border-r border-b border-slate-100 p-1.5 sm:min-h-32 sm:p-2',
                                                !isCurrentMonth &&
                                                    'bg-slate-50/60 text-slate-300',
                                            )}
                                        >
                                            <span className="text-xs font-bold">
                                                {day.getDate()}
                                            </span>
                                            <div className="mt-1 space-y-1">
                                                {dayEvents
                                                    .slice(0, 2)
                                                    .map((event) => (
                                                        <div
                                                            key={event.id}
                                                            title={event.title}
                                                            className="truncate rounded px-1.5 py-1 text-[10px] font-bold text-white sm:text-xs"
                                                            style={{
                                                                backgroundColor:
                                                                    event.color,
                                                            }}
                                                        >
                                                            {event.title}
                                                        </div>
                                                    ))}
                                                {dayEvents.length > 2 && (
                                                    <p className="text-[10px] font-semibold text-slate-500">
                                                        +{dayEvents.length - 2}{' '}
                                                        agenda
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="mt-12">
                            <h2 className="font-heading text-2xl font-bold">
                                Agenda bulan ini
                            </h2>
                            {events.length === 0 ? (
                                <div className="mt-5 rounded-xl border border-slate-200">
                                    <EmptyState
                                        icon={CalendarDays}
                                        title="Belum ada agenda"
                                        description="Tidak ada agenda untuk bulan dan kategori yang dipilih."
                                    />
                                </div>
                            ) : (
                                <div className="mt-6 divide-y divide-slate-200 border-y border-slate-200">
                                    {events.map((event) => (
                                        <article
                                            key={event.id}
                                            className="grid gap-3 py-5 sm:grid-cols-[10rem_1fr]"
                                        >
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">
                                                    {dateFormatter.format(
                                                        new Date(
                                                            `${event.start_date}T00:00:00`,
                                                        ),
                                                    )}
                                                </p>
                                                {event.end_date &&
                                                    event.end_date !==
                                                        event.start_date && (
                                                        <p className="mt-1 text-xs text-slate-500">
                                                            sampai{' '}
                                                            {dateFormatter.format(
                                                                new Date(
                                                                    `${event.end_date}T00:00:00`,
                                                                ),
                                                            )}
                                                        </p>
                                                    )}
                                            </div>
                                            <div>
                                                <p
                                                    className="flex items-center gap-2 text-xs font-bold"
                                                    style={{
                                                        color: event.color,
                                                    }}
                                                >
                                                    <MapPin className="size-3.5" />
                                                    {event.category_label}
                                                </p>
                                                <h3 className="mt-2 font-heading text-lg font-bold">
                                                    {event.title}
                                                </h3>
                                                {event.description && (
                                                    <p className="mt-2 text-sm leading-6 text-slate-600">
                                                        {event.description}
                                                    </p>
                                                )}
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                </main>
            </PageTransition>
        </PublicLayout>
    );
}
