import { FormField } from '@/components/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { AcademicEvent, SelectOption } from '@/types';

type AcademicEventFieldsProps = {
    categories: SelectOption[];
    errors: Partial<Record<string, string>>;
    event?: AcademicEvent;
};

export function AcademicEventFields({
    categories,
    errors,
    event,
}: AcademicEventFieldsProps) {
    return (
        <div className="space-y-5">
            <FormField
                htmlFor="title"
                label="Judul agenda"
                error={errors.title}
                required
            >
                <Input
                    id="title"
                    name="title"
                    defaultValue={event?.title ?? ''}
                    required
                    autoFocus
                />
            </FormField>
            <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                    htmlFor="category"
                    label="Kategori"
                    error={errors.category}
                    required
                >
                    <Select
                        id="category"
                        name="category"
                        defaultValue={event?.category ?? 'kegiatan'}
                        required
                    >
                        {categories.map((category) => (
                            <option key={category.value} value={category.value}>
                                {category.label}
                            </option>
                        ))}
                    </Select>
                </FormField>
                <FormField
                    htmlFor="color"
                    label="Warna agenda"
                    error={errors.color}
                    required
                >
                    <Input
                        id="color"
                        name="color"
                        type="color"
                        defaultValue={event?.color ?? '#3B82F6'}
                        className="p-1"
                        required
                    />
                </FormField>
                <FormField
                    htmlFor="start_date"
                    label="Tanggal mulai"
                    error={errors.start_date}
                    required
                >
                    <Input
                        id="start_date"
                        name="start_date"
                        type="date"
                        defaultValue={event?.start_date ?? ''}
                        required
                    />
                </FormField>
                <FormField
                    htmlFor="end_date"
                    label="Tanggal selesai"
                    error={errors.end_date}
                    hint="Kosongkan untuk agenda satu hari."
                >
                    <Input
                        id="end_date"
                        name="end_date"
                        type="date"
                        defaultValue={event?.end_date ?? ''}
                    />
                </FormField>
            </div>
            <FormField
                htmlFor="description"
                label="Deskripsi"
                error={errors.description}
            >
                <Textarea
                    id="description"
                    name="description"
                    defaultValue={event?.description ?? ''}
                    rows={5}
                />
            </FormField>
        </div>
    );
}
