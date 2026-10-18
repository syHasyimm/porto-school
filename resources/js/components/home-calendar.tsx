import { Link } from '@inertiajs/react';
import { ArrowUpRight, CalendarDays } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';
import { index as calendarIndex } from '@/routes/calendar';

type HomeEvent = {
    id: number;
    title: string;
    start_date: string;
    end_date: string | null;
    category_label: string;
};

export type HomeCalendarData = {
    today: string;
    month: string;
    events: HomeEvent[];
    upcoming: HomeEvent[];
};

const monthFormatter = new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
});
const dayFormatter = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
});
const weekdays = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

function dateKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function HomeCalendar({ calendar }: { calendar: HomeCalendarData }) {
    const reducedMotion = useReducedMotion();
    const [year, month] = calendar.month.split('-').map(Number);
    const first = new Date(year, month - 1, 1);
    const offset = (first.getDay() + 6) % 7;
    const days = Array.from(
        { length: 42 },
        (_, index) => new Date(year, month - 1, 1 - offset + index),
    );

    return (
        <motion.aside
            aria-label="Kalender dan agenda sekolah"
            className="self-start lg:sticky lg:top-24"
            initial={reducedMotion ? false : { opacity: 0, x: 22 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{
                duration: reducedMotion ? 0 : 0.65,
                ease: [0.16, 1, 0.3, 1],
            }}
        >
            <div className="overflow-hidden rounded-2xl border border-[#dce3ed] bg-white shadow-[0_12px_32px_-24px_rgba(35,57,93,0.22)] lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto">
                <div className="flex items-center gap-3 border-b border-[#dce3ed] bg-[#e7edf8] px-5 py-5">
                    <CalendarDays
                        aria-hidden="true"
                        className="size-5 text-brand-700"
                    />
                    <h2 className="font-heading text-base font-bold text-brand-700">
                        Kalender sekolah
                    </h2>
                </div>
                <div className="p-5">
                    <p className="mb-5 font-heading text-base font-bold capitalize">
                        {monthFormatter.format(first)}
                    </p>
                    <div className="grid grid-cols-7 gap-y-1 text-center">
                        {weekdays.map((day) => (
                            <span
                                key={day}
                                className="pb-2 text-[11px] font-semibold text-slate-500"
                            >
                                {day}
                            </span>
                        ))}
                        {days.map((day) => {
                            const key = dateKey(day);
                            const hasEvent = calendar.events.some(
                                (event) =>
                                    event.start_date <= key &&
                                    (event.end_date ?? event.start_date) >= key,
                            );
                            const currentMonth =
                                day.getMonth() === first.getMonth();

                            return (
                                <span
                                    key={key}
                                    title={`${key}${hasEvent ? ', ada agenda sekolah' : ''}`}
                                    aria-current={
                                        key === calendar.today
                                            ? 'date'
                                            : undefined
                                    }
                                    className={cn(
                                        'relative mx-auto grid size-8 place-items-center rounded-lg text-xs font-semibold',
                                        !currentMonth
                                            ? 'text-slate-300'
                                            : 'text-slate-700',
                                        key === calendar.today &&
                                            'bg-brand-600 text-white',
                                        hasEvent &&
                                            key !== calendar.today &&
                                            currentMonth &&
                                            'bg-brand-50 text-brand-700',
                                    )}
                                >
                                    {day.getDate()}
                                    {hasEvent && currentMonth && (
                                        <span
                                            aria-hidden="true"
                                            className={cn(
                                                'absolute bottom-0.5 size-1 rounded-full',
                                                key === calendar.today
                                                    ? 'bg-white'
                                                    : 'bg-brand-600',
                                            )}
                                        />
                                    )}
                                </span>
                            );
                        })}
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500">
                        <span
                            aria-hidden="true"
                            className="size-1.5 rounded-full bg-brand-600"
                        />{' '}
                        Ada agenda sekolah
                    </div>
                    <div className="mt-6 border-t border-slate-200 pt-5">
                        <h3 className="text-xs font-bold text-slate-500">
                            Agenda terdekat
                        </h3>
                        {calendar.upcoming.length === 0 ? (
                            <p className="mt-3 text-sm leading-6 text-slate-500">
                                Belum ada agenda mendatang. Jadwal terbaru akan
                                muncul di sini.
                            </p>
                        ) : (
                            <ul className="mt-4 space-y-4">
                                {calendar.upcoming.map((event) => (
                                    <li key={event.id}>
                                        <Link
                                            href={calendarIndex({
                                                query: {
                                                    month: event.start_date.slice(
                                                        0,
                                                        7,
                                                    ),
                                                },
                                            })}
                                            className="group grid grid-cols-[3rem_1fr] items-start gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600"
                                        >
                                            <time
                                                dateTime={event.start_date}
                                                className="rounded-lg border border-brand-700/10 bg-brand-50 px-1 py-2 text-center text-xs font-bold text-brand-700"
                                            >
                                                {dayFormatter.format(
                                                    new Date(
                                                        `${event.start_date}T00:00:00`,
                                                    ),
                                                )}
                                            </time>
                                            <span>
                                                <span className="block text-sm leading-5 font-bold text-slate-800 group-hover:text-brand-600">
                                                    {event.title}
                                                </span>
                                                <span className="mt-1 block text-[11px] text-slate-500">
                                                    {event.category_label}
                                                    {event.end_date &&
                                                    event.end_date !==
                                                        event.start_date
                                                        ? ` · s.d. ${dayFormatter.format(new Date(`${event.end_date}T00:00:00`))}`
                                                        : ''}
                                                </span>
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <Link
                        href={calendarIndex()}
                        className="mt-6 flex items-center justify-between rounded-full border border-brand-700/20 bg-white px-4 py-3 text-xs font-bold text-brand-700 transition-colors hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-brand-600"
                    >
                        Kalender lengkap{' '}
                        <ArrowUpRight aria-hidden="true" className="size-4" />
                    </Link>
                </div>
            </div>
        </motion.aside>
    );
}
