import { ArrowDown, ArrowUp, GraduationCap, Plus, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { FormField } from '@/components/form-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { TeacherEducation } from '@/types';

type EducationRow = TeacherEducation & { key: number };

export function TeacherEducationEditor({
    entries = [],
    errors,
    processing,
    clearErrors,
}: {
    entries?: TeacherEducation[];
    errors: Partial<Record<string, string>>;
    processing: boolean;
    clearErrors: (...fields: string[]) => void;
}) {
    const [rows, setRows] = useState<EducationRow[]>(() =>
        entries.map((entry, key) => ({ ...entry, key })),
    );
    const nextKey = useRef(entries.length);
    const containerRef = useRef<HTMLFieldSetElement>(null);
    const addRef = useRef<HTMLButtonElement>(null);

    function clearEducationErrors() {
        const fields = Object.keys(errors).filter(
            (field) =>
                field === 'education_history' ||
                field.startsWith('education_history.'),
        );
        if (fields.length > 0) clearErrors(...fields);
    }

    function addRow() {
        clearEducationErrors();
        const key = nextKey.current++;
        setRows((current) => [
            ...current,
            {
                key,
                level: '',
                institution: '',
                field_of_study: '',
                graduation_year: null,
            },
        ]);
        requestAnimationFrame(() =>
            containerRef.current
                ?.querySelector<HTMLInputElement>(
                    `[data-education-key="${key}"] input`,
                )
                ?.focus(),
        );
    }

    function updateRow(key: number, changes: Partial<TeacherEducation>) {
        setRows((current) =>
            current.map((row) =>
                row.key === key ? { ...row, ...changes } : row,
            ),
        );
    }

    function moveRow(index: number, direction: -1 | 1) {
        const key = rows[index].key;
        clearEducationErrors();
        setRows((current) => {
            const reordered = [...current];
            [reordered[index], reordered[index + direction]] = [
                reordered[index + direction],
                reordered[index],
            ];
            return reordered;
        });
        requestAnimationFrame(() =>
            containerRef.current
                ?.querySelector<HTMLInputElement>(
                    `[data-education-key="${key}"] input`,
                )
                ?.focus(),
        );
    }

    return (
        <fieldset
            ref={containerRef}
            disabled={processing}
            className="min-w-0 overflow-hidden rounded-2xl border border-[#dce3ee] bg-white"
        >
            <legend className="sr-only">Riwayat pendidikan guru</legend>
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#dce3ee] bg-[#f0f4fa] p-5 sm:p-7">
                <div className="flex items-start gap-3">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-brand-700/10 bg-white text-brand-700">
                        <GraduationCap
                            aria-hidden="true"
                            className="size-6 stroke-[1.75]"
                        />
                    </span>
                    <div>
                        <h2 className="font-heading text-lg font-bold">
                            Riwayat pendidikan
                        </h2>
                        <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
                            Ditampilkan di profil guru publik. Susun dari
                            pendidikan paling awal hingga terbaru.
                        </p>
                    </div>
                </div>
                <Button
                    ref={addRef}
                    type="button"
                    variant="secondary"
                    onClick={addRow}
                    disabled={rows.length >= 12}
                    className="min-h-11 rounded-xl"
                >
                    <Plus aria-hidden="true" className="size-4" />
                    Tambah pendidikan
                </Button>
            </div>
            <div className="p-5 sm:p-7">
                {errors.education_history && (
                    <p role="alert" className="mb-4 text-sm text-red-600">
                        {errors.education_history}
                    </p>
                )}
                {rows.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">
                        <input
                            type="hidden"
                            name="education_history"
                            value=""
                        />
                        <p className="text-sm font-bold text-slate-700">
                            Belum ada riwayat pendidikan
                        </p>
                        <p className="mt-2 text-xs leading-6 text-slate-500">
                            Tambahkan jenjang, sekolah atau kampus, dan tahun
                            kelulusan.
                        </p>
                    </div>
                ) : (
                    <ol className="space-y-5">
                        {rows.map((row, index) => {
                            const prefix = `education_history.${index}`;
                            const inputName = (field: string) =>
                                `education_history[${index}][${field}]`;
                            return (
                                <li
                                    key={row.key}
                                    data-education-key={row.key}
                                    className="rounded-xl border border-[#e2e7ef] bg-[#fafbfd] p-4 sm:p-5"
                                >
                                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                                        <h3 className="text-sm font-bold text-slate-700">
                                            Pendidikan {index + 1}
                                        </h3>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="ghost"
                                                aria-label={`Pindahkan pendidikan ${index + 1} ke atas`}
                                                disabled={index === 0}
                                                onClick={() =>
                                                    moveRow(index, -1)
                                                }
                                                className="size-11"
                                            >
                                                <ArrowUp
                                                    aria-hidden="true"
                                                    className="size-4"
                                                />
                                            </Button>
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="ghost"
                                                aria-label={`Pindahkan pendidikan ${index + 1} ke bawah`}
                                                disabled={
                                                    index === rows.length - 1
                                                }
                                                onClick={() =>
                                                    moveRow(index, 1)
                                                }
                                                className="size-11"
                                            >
                                                <ArrowDown
                                                    aria-hidden="true"
                                                    className="size-4"
                                                />
                                            </Button>
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="ghost"
                                                aria-label={`Hapus pendidikan ${index + 1}`}
                                                onClick={() => {
                                                    clearEducationErrors();
                                                    setRows((current) =>
                                                        current.filter(
                                                            (entry) =>
                                                                entry.key !==
                                                                row.key,
                                                        ),
                                                    );
                                                    requestAnimationFrame(() =>
                                                        addRef.current?.focus(),
                                                    );
                                                }}
                                                className="size-11 text-red-600 hover:bg-red-50"
                                            >
                                                <Trash2
                                                    aria-hidden="true"
                                                    className="size-4"
                                                />
                                            </Button>
                                        </div>
                                    </div>
                                    {errors[prefix] && (
                                        <p
                                            role="alert"
                                            className="mb-3 text-sm text-red-600"
                                        >
                                            {errors[prefix]}
                                        </p>
                                    )}
                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <FormField
                                            htmlFor={`${prefix}.level`}
                                            label="Jenjang pendidikan"
                                            required
                                            error={errors[`${prefix}.level`]}
                                        >
                                            <Input
                                                id={`${prefix}.level`}
                                                name={inputName('level')}
                                                value={row.level}
                                                onChange={(event) =>
                                                    updateRow(row.key, {
                                                        level: event.target
                                                            .value,
                                                    })
                                                }
                                                required
                                                maxLength={100}
                                                placeholder="Contoh: S1 / Sarjana"
                                            />
                                        </FormField>
                                        <FormField
                                            htmlFor={`${prefix}.institution`}
                                            label="Sekolah atau perguruan tinggi"
                                            required
                                            error={
                                                errors[`${prefix}.institution`]
                                            }
                                        >
                                            <Input
                                                id={`${prefix}.institution`}
                                                name={inputName('institution')}
                                                value={row.institution}
                                                onChange={(event) =>
                                                    updateRow(row.key, {
                                                        institution:
                                                            event.target.value,
                                                    })
                                                }
                                                required
                                                maxLength={255}
                                                placeholder="Nama sekolah atau kampus"
                                            />
                                        </FormField>
                                        <FormField
                                            htmlFor={`${prefix}.field_of_study`}
                                            label="Jurusan / program studi"
                                            error={
                                                errors[
                                                    `${prefix}.field_of_study`
                                                ]
                                            }
                                        >
                                            <Input
                                                id={`${prefix}.field_of_study`}
                                                name={inputName(
                                                    'field_of_study',
                                                )}
                                                value={row.field_of_study ?? ''}
                                                onChange={(event) =>
                                                    updateRow(row.key, {
                                                        field_of_study:
                                                            event.target.value,
                                                    })
                                                }
                                                maxLength={255}
                                                placeholder="Contoh: Pendidikan Guru Sekolah Dasar"
                                            />
                                        </FormField>
                                        <FormField
                                            htmlFor={`${prefix}.graduation_year`}
                                            label="Tahun lulus"
                                            error={
                                                errors[
                                                    `${prefix}.graduation_year`
                                                ]
                                            }
                                        >
                                            <Input
                                                id={`${prefix}.graduation_year`}
                                                name={inputName(
                                                    'graduation_year',
                                                )}
                                                type="number"
                                                value={
                                                    row.graduation_year ?? ''
                                                }
                                                onChange={(event) =>
                                                    updateRow(row.key, {
                                                        graduation_year:
                                                            event.target
                                                                .value === ''
                                                                ? null
                                                                : Number(
                                                                      event
                                                                          .target
                                                                          .value,
                                                                  ),
                                                    })
                                                }
                                                min={1900}
                                                max={new Date().getFullYear()}
                                                placeholder="Contoh: 2014"
                                            />
                                        </FormField>
                                    </div>
                                </li>
                            );
                        })}
                    </ol>
                )}
                <p className="mt-4 text-xs leading-5 text-slate-500">
                    Maksimal 12 pendidikan. Jurusan dan tahun lulus boleh
                    dikosongkan.
                </p>
            </div>
        </fieldset>
    );
}
