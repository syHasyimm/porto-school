import { FormField } from '@/components/form-field';
import { PhotoUpload } from '@/components/photo-upload';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { TestimonialItem } from '@/types';

type TestimonialFieldsProps = {
    item?: TestimonialItem;
    errors: Partial<Record<string, string>>;
};

export function TestimonialFields({ item, errors }: TestimonialFieldsProps) {
    return (
        <div className="space-y-6">
            <PhotoUpload
                currentUrl={item?.photo_url}
                previewAlt="Pratinjau foto alumni"
                rounded
                error={errors.photo}
            />
            <FormField
                htmlFor="name"
                label="Nama alumni"
                required
                error={errors.name}
            >
                <Input
                    id="name"
                    name="name"
                    defaultValue={item?.name ?? ''}
                    required
                    maxLength={100}
                    autoFocus
                    aria-invalid={Boolean(errors.name)}
                />
            </FormField>
            <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                    htmlFor="graduation_year"
                    label="Tahun lulus"
                    error={errors.graduation_year}
                    hint="Opsional. Tahun kelulusan dari sekolah ini."
                >
                    <Input
                        id="graduation_year"
                        name="graduation_year"
                        type="number"
                        min={1900}
                        max={new Date().getFullYear()}
                        defaultValue={item?.graduation_year ?? ''}
                        placeholder="Contoh: 2018"
                        aria-invalid={Boolean(errors.graduation_year)}
                    />
                </FormField>
                <FormField
                    htmlFor="sort_order"
                    label="Urutan tampil"
                    required
                    error={errors.sort_order}
                    hint="Angka lebih kecil tampil lebih dahulu."
                >
                    <Input
                        id="sort_order"
                        name="sort_order"
                        type="number"
                        min={0}
                        max={9999}
                        defaultValue={item?.sort_order ?? 0}
                        required
                        aria-invalid={Boolean(errors.sort_order)}
                    />
                </FormField>
            </div>
            <FormField
                htmlFor="content"
                label="Isi testimoni"
                required
                error={errors.content}
                hint="Tulis cerita alumni secara singkat. Maksimal 1.000 karakter."
            >
                <Textarea
                    id="content"
                    name="content"
                    rows={5}
                    maxLength={1000}
                    defaultValue={item?.content ?? ''}
                    required
                    placeholder="Pengalaman belajar dan kenangan selama bersekolah..."
                    aria-invalid={Boolean(errors.content)}
                />
            </FormField>
            <div className="rounded-xl border border-brand-100 bg-brand-50 p-4">
                <label className="flex cursor-pointer items-start gap-3">
                    <input
                        name="is_published"
                        type="checkbox"
                        value="1"
                        defaultChecked={item?.is_published ?? false}
                        className="mt-1 size-4 shrink-0 accent-brand-600"
                        aria-describedby="publication-hint"
                    />
                    <span className="text-sm font-bold text-slate-900">
                        Tampilkan di beranda
                        <span
                            id="publication-hint"
                            className="mt-1 block text-xs leading-5 font-normal text-slate-600"
                        >
                            Jika tidak dicentang, testimoni disimpan sebagai
                            draft.
                        </span>
                    </span>
                </label>
                {errors.is_published && (
                    <p className="mt-2 text-sm font-medium text-red-600">
                        {errors.is_published}
                    </p>
                )}
            </div>
        </div>
    );
}
