import { ArrowDown, ArrowUp, BookOpen, Plus, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { FormField } from '@/components/form-field';
import { StoryImageUpload } from '@/components/story-image-upload';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { SchoolHistoryItem } from '@/types';

type StoryRow = Omit<SchoolHistoryItem, 'id'> & {
    id: number | null;
    key: string;
};

export function SchoolHistoryEditor({
    entries,
    errors,
    processing,
    onChange,
    onStructureChange,
    onPhotoError,
}: {
    entries: SchoolHistoryItem[];
    errors: Partial<Record<string, string>>;
    processing: boolean;
    onChange: () => void;
    onStructureChange: (photoErrors: Record<string, string>) => void;
    onPhotoError?: (field: string, error: string | null) => void;
}) {
    const [rows, setRows] = useState<StoryRow[]>(() =>
        entries.map((entry) => ({ ...entry, key: `saved-${entry.id}` })),
    );
    const [pendingRemoval, setPendingRemoval] = useState<string | null>(null);
    const nextKey = useRef(0);
    const container = useRef<HTMLDivElement>(null);
    const addButton = useRef<HTMLButtonElement>(null);
    const photoErrors = useRef<Record<string, string>>({});

    function notifyStructureChange(nextRows: StoryRow[]) {
        onStructureChange(
            Object.fromEntries(
                nextRows.flatMap((row, index) =>
                    photoErrors.current[row.key]
                        ? [
                              [
                                  `history_entries.${index}.photo`,
                                  photoErrors.current[row.key],
                              ],
                          ]
                        : [],
                ),
            ),
        );
    }

    function addRow() {
        const key = `new-${++nextKey.current}`;
        const nextRows = [
            ...rows,
            {
                key,
                id: null,
                period: '',
                title: '',
                description: '',
                photo_url: null,
                is_published: false,
                sort_order: rows.length,
            },
        ];
        setRows(nextRows);
        notifyStructureChange(nextRows);
        requestAnimationFrame(() => {
            container.current
                ?.querySelector<HTMLInputElement>(
                    `[data-story-key="${key}"] input[type="text"]`,
                )
                ?.focus();
        });
    }

    function moveRow(index: number, direction: -1 | 1) {
        const reordered = [...rows];
        [reordered[index], reordered[index + direction]] = [
            reordered[index + direction],
            reordered[index],
        ];
        setRows(reordered);
        notifyStructureChange(reordered);
    }

    function updateRow(key: string, changes: Partial<StoryRow>) {
        setRows((current) =>
            current.map((row) =>
                row.key === key ? { ...row, ...changes } : row,
            ),
        );
        onChange();
    }

    return (
        <div ref={container} className="border-t border-slate-100 pt-8">
            <input type="hidden" name="history_editor" value="1" />
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h3 className="font-heading text-lg font-bold">
                        Cerita sejarah sekolah
                    </h3>
                    <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
                        Susun cerita dari arsip sekolah. Urutan di bawah ini
                        menjadi urutan di halaman Profil.
                    </p>
                </div>
                <Button
                    ref={addButton}
                    type="button"
                    variant="secondary"
                    onClick={addRow}
                    disabled={processing || rows.length >= 50}
                >
                    <Plus aria-hidden="true" className="size-4" />
                    Tambah cerita
                </Button>
            </div>
            {errors.history_entries && (
                <p
                    id="history_entries"
                    role="alert"
                    tabIndex={-1}
                    className="mb-4 text-sm text-red-600"
                >
                    {errors.history_entries}
                </p>
            )}
            {rows.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-9 text-center">
                    <BookOpen
                        aria-hidden="true"
                        className="mx-auto size-7 stroke-[1.5] text-slate-400"
                    />
                    <p className="mt-3 text-sm font-bold text-slate-700">
                        Belum ada cerita sejarah
                    </p>
                    <p className="mt-2 text-xs leading-6 text-slate-500">
                        Klik “Tambah cerita” untuk mulai. Sejarah singkat tetap
                        tampil sampai cerita pertama diterbitkan.
                    </p>
                </div>
            ) : (
                <ol className="space-y-5">
                    {rows.map((row, index) => {
                        const prefix = `history_entries.${index}`;
                        const inputName = (field: string) =>
                            `history_entries[${index}][${field}]`;
                        const fieldError = (field: string) =>
                            errors[`${prefix}.${field}`];
                        return (
                            <li
                                key={row.key}
                                data-story-key={row.key}
                                className="overflow-hidden rounded-2xl border border-slate-200"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-4 py-4 sm:px-5">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <span
                                            aria-hidden="true"
                                            className="font-mono text-sm text-slate-400"
                                        >
                                            {String(index + 1).padStart(2, '0')}
                                        </span>
                                        <span className="max-w-64 truncate text-sm font-bold text-slate-800">
                                            {row.title || 'Cerita baru'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            type="button"
                                            size="icon"
                                            variant="ghost"
                                            disabled={processing || index === 0}
                                            aria-label={`Naikkan cerita ${index + 1}`}
                                            onClick={() => moveRow(index, -1)}
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
                                            disabled={
                                                processing ||
                                                index === rows.length - 1
                                            }
                                            aria-label={`Turunkan cerita ${index + 1}`}
                                            onClick={() => moveRow(index, 1)}
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
                                            disabled={processing}
                                            aria-label={`Hapus cerita ${index + 1}`}
                                            className="text-red-600 hover:bg-red-50"
                                            onClick={() =>
                                                setPendingRemoval(row.key)
                                            }
                                        >
                                            <Trash2
                                                aria-hidden="true"
                                                className="size-4"
                                            />
                                        </Button>
                                    </div>
                                </div>
                                <fieldset
                                    disabled={processing}
                                    className="space-y-6 p-4 sm:p-6"
                                >
                                    <legend className="sr-only">
                                        Cerita {index + 1}
                                    </legend>
                                    <input
                                        type="hidden"
                                        name={inputName('id')}
                                        value={row.id ?? ''}
                                    />
                                    {fieldError('id') && (
                                        <p
                                            id={`${prefix}.id`}
                                            tabIndex={-1}
                                            className="text-sm text-red-600"
                                        >
                                            {fieldError('id')}
                                        </p>
                                    )}
                                    <div className="grid gap-5 sm:grid-cols-[1fr_12rem]">
                                        <FormField
                                            htmlFor={`${prefix}.period`}
                                            label="Tahun / periode"
                                            required
                                            error={fieldError('period')}
                                            hint="Gunakan tahun atau rentang waktu yang sesuai arsip."
                                        >
                                            <Input
                                                id={`${prefix}.period`}
                                                name={inputName('period')}
                                                type="text"
                                                value={row.period}
                                                onChange={(event) =>
                                                    updateRow(row.key, {
                                                        period: event.target
                                                            .value,
                                                    })
                                                }
                                                maxLength={80}
                                                required
                                                aria-invalid={Boolean(
                                                    fieldError('period'),
                                                )}
                                                placeholder="Tahun atau periode peristiwa"
                                            />
                                        </FormField>
                                        <FormField
                                            htmlFor={`${prefix}.is_published`}
                                            label="Status"
                                            error={fieldError('is_published')}
                                        >
                                            <select
                                                id={`${prefix}.is_published`}
                                                name={inputName('is_published')}
                                                value={
                                                    row.is_published ? '1' : '0'
                                                }
                                                onChange={(event) =>
                                                    updateRow(row.key, {
                                                        is_published:
                                                            event.target
                                                                .value === '1',
                                                    })
                                                }
                                                aria-invalid={Boolean(
                                                    fieldError('is_published'),
                                                )}
                                                className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
                                            >
                                                <option value="0">Draft</option>
                                                <option value="1">
                                                    Tampil di profil
                                                </option>
                                            </select>
                                        </FormField>
                                    </div>
                                    <FormField
                                        htmlFor={`${prefix}.title`}
                                        label="Judul cerita"
                                        required
                                        error={fieldError('title')}
                                    >
                                        <Input
                                            id={`${prefix}.title`}
                                            name={inputName('title')}
                                            value={row.title}
                                            onChange={(event) =>
                                                updateRow(row.key, {
                                                    title: event.target.value,
                                                })
                                            }
                                            maxLength={160}
                                            required
                                            aria-invalid={Boolean(
                                                fieldError('title'),
                                            )}
                                            placeholder="Peristiwa penting dalam perjalanan sekolah"
                                        />
                                    </FormField>
                                    <FormField
                                        htmlFor={`${prefix}.description`}
                                        label="Isi cerita"
                                        required
                                        error={fieldError('description')}
                                    >
                                        <Textarea
                                            id={`${prefix}.description`}
                                            name={inputName('description')}
                                            value={row.description}
                                            onChange={(event) =>
                                                updateRow(row.key, {
                                                    description:
                                                        event.target.value,
                                                })
                                            }
                                            rows={4}
                                            maxLength={5000}
                                            required
                                            aria-invalid={Boolean(
                                                fieldError('description'),
                                            )}
                                            placeholder="Ceritakan peristiwa ini berdasarkan informasi sekolah..."
                                        />
                                    </FormField>
                                    <StoryImageUpload
                                        id={`${prefix}.photo`}
                                        name={inputName('photo')}
                                        removeName={inputName('remove_photo')}
                                        label={`Foto cerita ${index + 1}`}
                                        currentUrl={row.photo_url}
                                        error={fieldError('photo')}
                                        onChange={onChange}
                                        onValidationError={(error) => {
                                            if (error)
                                                photoErrors.current[row.key] =
                                                    error;
                                            else
                                                delete photoErrors.current[
                                                    row.key
                                                ];
                                            onPhotoError?.(
                                                `${prefix}.photo`,
                                                error,
                                            );
                                        }}
                                    />
                                </fieldset>
                            </li>
                        );
                    })}
                </ol>
            )}
            <p
                role="status"
                aria-live="polite"
                className="mt-4 text-xs leading-6 text-slate-500"
            >
                {rows.length} cerita ·{' '}
                {rows.filter((row) => row.is_published).length} akan tampil.
                Perubahan dan penghapusan berlaku setelah “Simpan Semua
                Pengaturan”.
            </p>
            <Dialog
                open={pendingRemoval !== null}
                title="Hapus cerita ini?"
                description="Cerita akan dihapus saat semua pengaturan disimpan. Foto cerita juga akan dihapus."
                onClose={() => setPendingRemoval(null)}
                footer={
                    <>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setPendingRemoval(null)}
                        >
                            Batal
                        </Button>
                        <Button
                            type="button"
                            variant="danger"
                            onClick={() => {
                                const remainingRows = rows.filter(
                                    (row) => row.key !== pendingRemoval,
                                );
                                setRows(remainingRows);
                                setPendingRemoval(null);
                                notifyStructureChange(remainingRows);
                                requestAnimationFrame(() =>
                                    addButton.current?.focus(),
                                );
                            }}
                        >
                            Hapus cerita
                        </Button>
                    </>
                }
            />
        </div>
    );
}
