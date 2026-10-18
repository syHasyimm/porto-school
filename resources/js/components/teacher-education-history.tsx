import { GraduationCap } from 'lucide-react';
import type { TeacherEducation } from '@/types';

export function TeacherEducationHistory({
    entries,
}: {
    entries: TeacherEducation[];
}) {
    if (entries.length === 0) {
        return (
            <div className="flex items-start gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
                <GraduationCap
                    aria-hidden="true"
                    className="mt-0.5 size-5 shrink-0 text-slate-400"
                />
                <p className="text-sm leading-6 text-slate-500">
                    Riwayat pendidikan belum ditambahkan oleh sekolah.
                </p>
            </div>
        );
    }

    return (
        <ol className="space-y-0">
            {entries.map((entry, index) => (
                <li key={index} className="relative flex gap-4 pb-7 last:pb-0">
                    {index < entries.length - 1 && (
                        <div
                            aria-hidden="true"
                            className="absolute top-10 bottom-0 left-5 border-l border-[#dce3ee]"
                        />
                    )}
                    <span className="relative grid size-10 shrink-0 place-items-center rounded-xl border border-brand-700/10 bg-brand-50 text-brand-700">
                        <GraduationCap
                            aria-hidden="true"
                            className="size-5 stroke-[1.75]"
                        />
                    </span>
                    <div className="min-w-0 flex-1 pt-0.5">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                            <p className="text-sm font-bold break-words text-brand-700">
                                {entry.level}
                            </p>
                            {entry.graduation_year && (
                                <p className="text-xs font-medium text-slate-500">
                                    Lulus {entry.graduation_year}
                                </p>
                            )}
                        </div>
                        <p className="mt-1.5 font-heading text-base leading-6 font-bold break-words text-slate-900">
                            {entry.institution}
                        </p>
                        {entry.field_of_study && (
                            <p className="mt-1 text-sm leading-6 break-words text-slate-500">
                                {entry.field_of_study}
                            </p>
                        )}
                    </div>
                </li>
            ))}
        </ol>
    );
}
