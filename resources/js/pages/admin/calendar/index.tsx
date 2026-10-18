import { Form, Head, Link } from '@inertiajs/react';
import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    LoaderCircle,
    MousePointer2,
    Pencil,
    Plus,
    Save,
    Search,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { AcademicEventFields } from '@/components/academic-event-fields';
import { PageHeader } from '@/components/page-header';
import { PageTransition } from '@/components/page-transition';
import { Button, buttonVariants } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';
import { destroy, edit, index, store } from '@/routes/admin/calendar';
import type { AcademicEvent, SelectOption } from '@/types';

type CalendarIndexProps = {
    categories: SelectOption[];
    events: AcademicEvent[];
    filters: { category: string; search: string };
    month: string;
    today: string;
};

type CalendarContext = { month: string; category: string; search: string };

const weekdays = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const monthFormatter = new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
});
const dateFormatter = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
});
const shortDateFormatter = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
});

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
    const offset = (first.getDay() + 6) % 7;
    const cellCount =
        Math.ceil((offset + new Date(year, monthNumber, 0).getDate()) / 7) * 7;

    return Array.from(
        { length: cellCount },
        (_, dayIndex) => new Date(year, monthNumber - 1, 1 - offset + dayIndex),
    );
}

function eventsOnDate(events: AcademicEvent[], date: string): AcademicEvent[] {
    return events.filter(
        (event) =>
            event.start_date <= date &&
            (event.end_date ?? event.start_date) >= date,
    );
}

function formatDate(value: string): string {
    return dateFormatter.format(new Date(`${value}T00:00:00`));
}

function eventDateRange(event: AcademicEvent): string {
    const start = shortDateFormatter.format(
        new Date(`${event.start_date}T00:00:00`),
    );
    return event.end_date && event.end_date !== event.start_date
        ? `${start} – ${shortDateFormatter.format(new Date(`${event.end_date}T00:00:00`))}`
        : start;
}

export default function CalendarIndex({
    categories,
    events,
    filters,
    month,
    today,
}: CalendarIndexProps) {
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [dayToView, setDayToView] = useState<string | null>(null);
    const [eventToDelete, setEventToDelete] = useState<AcademicEvent | null>(
        null,
    );
    const context: CalendarContext = { month, ...filters };
    const days = daysForMonth(month);
    const monthDate = new Date(`${month}-01T00:00:00`);
    const dayEvents = dayToView ? eventsOnDate(events, dayToView) : [];
    const isFiltered = Boolean(filters.search || filters.category);

    return (
        <AdminLayout active="calendar" title="Kalender Akademik">
            <Head title="Kalender Akademik" />
            <PageTransition>
                <PageHeader
                    title="Kalender akademik"
                    description="Klik tanggal pada kalender untuk menambahkan agenda sekolah."
                />

                <section
                    aria-label="Kalender agenda sekolah"
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                >
                    <div className="flex flex-col justify-between gap-4 border-b border-slate-200 bg-brand-50/50 px-4 py-5 sm:flex-row sm:items-center sm:px-6">
                        <div className="flex items-center gap-3">
                            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-brand-100 bg-white text-brand-600">
                                <CalendarDays
                                    aria-hidden="true"
                                    className="size-5"
                                />
                            </span>
                            <div>
                                <h2 className="font-heading text-lg font-bold tracking-tight text-slate-950 sm:text-xl">
                                    {monthFormatter.format(monthDate)}
                                </h2>
                                <p className="mt-1 text-xs text-slate-500">
                                    {events.length} agenda pada kalender ini
                                    {isFiltered ? ' · difilter' : ''}
                                </p>
                            </div>
                        </div>
                        <nav
                            aria-label="Navigasi bulan"
                            className="flex items-center gap-2"
                        >
                            <Link
                                href={index({
                                    query: {
                                        ...context,
                                        month: today.slice(0, 7),
                                    },
                                })}
                                preserveScroll
                                className={cn(
                                    buttonVariants({
                                        variant: 'secondary',
                                        size: 'sm',
                                        className: 'mr-auto sm:mr-1',
                                    }),
                                )}
                            >
                                Hari ini
                            </Link>
                            <Link
                                aria-label="Bulan sebelumnya"
                                href={index({
                                    query: {
                                        ...context,
                                        month: addMonths(month, -1),
                                    },
                                })}
                                preserveScroll
                                className={cn(
                                    buttonVariants({
                                        variant: 'secondary',
                                        size: 'icon',
                                    }),
                                )}
                            >
                                <ChevronLeft
                                    aria-hidden="true"
                                    className="size-4"
                                />
                            </Link>
                            <Link
                                aria-label="Bulan berikutnya"
                                href={index({
                                    query: {
                                        ...context,
                                        month: addMonths(month, 1),
                                    },
                                })}
                                preserveScroll
                                className={cn(
                                    buttonVariants({
                                        variant: 'secondary',
                                        size: 'icon',
                                    }),
                                )}
                            >
                                <ChevronRight
                                    aria-hidden="true"
                                    className="size-4"
                                />
                            </Link>
                        </nav>
                    </div>

                    <div className="px-4 py-4 sm:px-6">
                        <Form
                            action={index()}
                            options={{ preserveScroll: true }}
                            className="flex flex-col gap-2 sm:flex-row"
                        >
                            <input type="hidden" name="month" value={month} />
                            <div className="relative min-w-0 flex-1">
                                <Search
                                    aria-hidden="true"
                                    className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
                                />
                                <Input
                                    key={filters.search}
                                    aria-label="Cari judul agenda"
                                    name="search"
                                    defaultValue={filters.search}
                                    placeholder="Cari judul agenda..."
                                    className="pl-9"
                                />
                            </div>
                            <div className="sm:w-44">
                                <Select
                                    key={filters.category}
                                    aria-label="Filter kategori agenda"
                                    name="category"
                                    defaultValue={filters.category}
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
                            </div>
                            <Button type="submit" variant="secondary">
                                Terapkan
                            </Button>
                            {isFiltered && (
                                <Link
                                    href={index({ query: { month } })}
                                    preserveScroll
                                    className={cn(
                                        buttonVariants({
                                            variant: 'ghost',
                                        }),
                                    )}
                                >
                                    Reset
                                </Link>
                            )}
                        </Form>
                    </div>

                    <div className="grid grid-cols-7 border-t border-slate-200 bg-slate-50">
                        {weekdays.map((day, dayIndex) => (
                            <div
                                key={day}
                                className={cn(
                                    'py-3 text-center text-xs font-semibold',
                                    dayIndex >= 5
                                        ? 'text-slate-400'
                                        : 'text-slate-500',
                                )}
                            >
                                {day}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 border-t border-slate-200">
                        {days.map((day) => (
                            <CalendarDay
                                key={dateKey(day)}
                                day={day}
                                month={month}
                                today={today}
                                events={eventsOnDate(events, dateKey(day))}
                                context={context}
                                onAdd={setSelectedDate}
                                onShowDay={setDayToView}
                            />
                        ))}
                    </div>
                    <div className="flex flex-col gap-2 bg-slate-50/70 px-4 py-4 text-xs leading-5 text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                        <p className="flex items-start gap-2">
                            <MousePointer2
                                aria-hidden="true"
                                className="mt-0.5 size-3.5 shrink-0 text-brand-600"
                            />
                            Klik tanggal untuk tambah agenda. Klik judul agenda
                            untuk mengedit.
                        </p>
                        {events.length === 0 && (
                            <p>
                                {isFiltered
                                    ? 'Tidak ada agenda yang sesuai filter.'
                                    : 'Belum ada agenda pada kalender ini.'}
                            </p>
                        )}
                    </div>
                </section>
            </PageTransition>

            <Dialog
                open={selectedDate !== null}
                onClose={() => setSelectedDate(null)}
                size="lg"
                title="Tambah agenda"
                description={
                    selectedDate
                        ? `Agenda untuk ${formatDate(selectedDate)}.`
                        : undefined
                }
            >
                {selectedDate && (
                    <Form
                        key={selectedDate}
                        {...store.form({ query: context })}
                        options={{ preserveScroll: true }}
                        resetOnSuccess
                        onSuccess={() => setSelectedDate(null)}
                    >
                        {({ errors, processing }) => (
                            <fieldset disabled={processing} className="min-w-0">
                                <AcademicEventFields
                                    categories={categories}
                                    errors={errors}
                                    defaultStartDate={selectedDate}
                                    defaultCategory={
                                        filters.category || 'kegiatan'
                                    }
                                />
                                <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => setSelectedDate(null)}
                                    >
                                        Batal
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? (
                                            <LoaderCircle
                                                aria-hidden="true"
                                                className="size-4 animate-spin"
                                            />
                                        ) : (
                                            <Save
                                                aria-hidden="true"
                                                className="size-4"
                                            />
                                        )}
                                        {processing
                                            ? 'Menyimpan...'
                                            : 'Simpan agenda'}
                                    </Button>
                                </div>
                            </fieldset>
                        )}
                    </Form>
                )}
            </Dialog>

            <Dialog
                open={dayToView !== null}
                onClose={() => setDayToView(null)}
                size="lg"
                title="Agenda pada tanggal ini"
                description={dayToView ? formatDate(dayToView) : undefined}
            >
                <ul className="flex flex-col divide-y divide-slate-100">
                    {dayEvents.map((event) => (
                        <li
                            key={event.id}
                            className="flex items-start gap-3 py-4 first:pt-0"
                        >
                            <span
                                aria-hidden="true"
                                className="mt-1.5 size-2.5 shrink-0 rounded-full"
                                style={{ backgroundColor: event.color }}
                            />
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-bold wrap-anywhere text-slate-900">
                                    {event.title}
                                </p>
                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                    {event.category_label} ·{' '}
                                    {eventDateRange(event)}
                                </p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {event.is_cancelled && (
                                        <Badge variant="red">Dibatalkan</Badge>
                                    )}
                                    {event.whatsapp_reminder_enabled && (
                                        <Badge variant="blue">
                                            Pengingat WhatsApp
                                        </Badge>
                                    )}
                                </div>
                                {event.description && (
                                    <p className="mt-2 text-sm leading-6 wrap-anywhere whitespace-pre-wrap text-slate-600">
                                        {event.description}
                                    </p>
                                )}
                            </div>
                            <div className="flex shrink-0 flex-col gap-1 sm:flex-row">
                                <Link
                                    href={edit(event.id, { query: context })}
                                    aria-label={`Edit ${event.title}`}
                                    className={cn(
                                        buttonVariants({
                                            variant: 'ghost',
                                            size: 'icon',
                                        }),
                                    )}
                                >
                                    <Pencil
                                        aria-hidden="true"
                                        className="size-4"
                                    />
                                </Link>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-600 hover:bg-red-50"
                                    aria-label={`Hapus ${event.title}`}
                                    onClick={() => {
                                        setDayToView(null);
                                        setEventToDelete(event);
                                    }}
                                >
                                    <Trash2
                                        aria-hidden="true"
                                        className="size-4"
                                    />
                                </Button>
                            </div>
                        </li>
                    ))}
                </ul>
                <Button
                    type="button"
                    variant="secondary"
                    className="mt-5 w-full"
                    onClick={() => {
                        setSelectedDate(dayToView);
                        setDayToView(null);
                    }}
                >
                    <Plus aria-hidden="true" className="size-4" /> Tambah agenda
                    pada tanggal ini
                </Button>
            </Dialog>

            <Dialog
                open={eventToDelete !== null}
                onClose={() => setEventToDelete(null)}
                title="Hapus agenda?"
                description={`${eventToDelete?.title ?? 'Agenda'} akan dihapus dari kalender publik.`}
            >
                <p className="text-sm text-slate-600">
                    Tindakan ini tidak dapat dibatalkan.
                </p>
                {eventToDelete && (
                    <Form
                        {...destroy.form(eventToDelete.id, { query: context })}
                        options={{ preserveScroll: true }}
                        onSuccess={() => setEventToDelete(null)}
                        className="mt-6 flex justify-end gap-3"
                    >
                        {({ processing }) => (
                            <>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    disabled={processing}
                                    onClick={() => setEventToDelete(null)}
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    variant="danger"
                                    disabled={processing}
                                >
                                    {processing
                                        ? 'Menghapus...'
                                        : 'Hapus agenda'}
                                </Button>
                            </>
                        )}
                    </Form>
                )}
            </Dialog>
        </AdminLayout>
    );
}

type CalendarDayProps = {
    day: Date;
    month: string;
    today: string;
    events: AcademicEvent[];
    context: CalendarContext;
    onAdd: (date: string) => void;
    onShowDay: (date: string) => void;
};

function CalendarDay({
    day,
    month,
    today,
    events,
    context,
    onAdd,
    onShowDay,
}: CalendarDayProps) {
    const key = dateKey(day);
    const inMonth = key.slice(0, 7) === month;
    const isToday = key === today;
    const isWeekend = day.getDay() === 0 || day.getDay() === 6;
    const dateLabel = formatDate(key);

    return (
        <div
            role="group"
            aria-label={dateLabel}
            className={cn(
                'group relative isolate min-h-22 min-w-0 border-r border-b border-slate-200 p-1.5 transition-colors nth-[7n]:border-r-0 sm:min-h-32 sm:p-2',
                !inMonth
                    ? 'bg-slate-50'
                    : isWeekend
                      ? 'bg-slate-50/40'
                      : 'bg-white',
                'hover:bg-brand-50/50',
            )}
        >
            <button
                type="button"
                aria-label={`Tambah agenda ${dateLabel}`}
                className="absolute inset-0 z-0 cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-600"
                onClick={() => onAdd(key)}
            />
            <div className="pointer-events-none relative z-1 mb-1 flex items-center justify-between sm:mb-2">
                <span
                    aria-current={isToday ? 'date' : undefined}
                    className={cn(
                        'flex size-7 items-center justify-center rounded-full text-xs font-semibold sm:text-sm',
                        isToday
                            ? 'bg-brand-500 text-white'
                            : inMonth
                              ? 'text-slate-700'
                              : 'text-slate-400',
                    )}
                >
                    {day.getDate()}
                </span>
                <Plus
                    aria-hidden="true"
                    className="hidden size-3.5 text-brand-500 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 sm:block"
                />
            </div>
            {events.length > 0 && (
                <>
                    <div className="relative z-1 hidden flex-col gap-1 sm:flex">
                        {events.slice(0, 3).map((event) => (
                            <Link
                                key={event.id}
                                href={edit(event.id, { query: context })}
                                aria-label={`Edit ${event.title}`}
                                title={`${event.title} · ${event.category_label}`}
                                className="block truncate rounded-md border-l-3 bg-slate-100/90 px-2 py-1.5 text-[11px] leading-4 font-medium text-slate-700 transition-colors hover:bg-brand-100 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-600"
                                style={{ borderLeftColor: event.color }}
                            >
                                {event.title}
                            </Link>
                        ))}
                        <button
                            type="button"
                            aria-label={`Lihat ${events.length} agenda ${dateLabel}`}
                            className="mt-1 w-full rounded px-1 py-1 text-left text-[11px] font-semibold text-slate-500 transition-colors hover:bg-brand-50 hover:text-brand-700 focus-visible:outline-2 focus-visible:outline-brand-600"
                            onClick={() => onShowDay(key)}
                        >
                            {events.length > 3
                                ? `+${events.length - 3} agenda lainnya`
                                : 'Lihat rincian'}
                        </button>
                    </div>
                    <button
                        type="button"
                        aria-label={`Lihat ${events.length} agenda ${dateLabel}`}
                        onClick={() => onShowDay(key)}
                        className="relative z-1 flex w-full flex-col items-center gap-1 rounded-md py-1 text-[10px] font-semibold text-brand-700 hover:bg-brand-100 focus-visible:outline-2 focus-visible:outline-brand-600 sm:hidden"
                    >
                        <span aria-hidden="true" className="flex gap-0.5">
                            {events.slice(0, 3).map((event) => (
                                <span
                                    key={event.id}
                                    className="size-1 rounded-full"
                                    style={{ backgroundColor: event.color }}
                                />
                            ))}
                        </span>
                        <span>{events.length} agenda</span>
                    </button>
                </>
            )}
        </div>
    );
}
