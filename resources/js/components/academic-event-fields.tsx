import { useState } from 'react';
import { FormField } from '@/components/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { AcademicEvent, SelectOption } from '@/types';

type AcademicEventFieldsProps = {
    categories: SelectOption[];
    errors: Partial<Record<string, string>>;
    event?: AcademicEvent;
    defaultStartDate?: string;
    defaultCategory?: string;
};

export function AcademicEventFields({
    categories,
    errors,
    event,
    defaultStartDate,
    defaultCategory,
}: AcademicEventFieldsProps) {
    const [reminderEnabled, setReminderEnabled] = useState(
        event?.whatsapp_reminder_enabled ?? false,
    );
    const [cancelled, setCancelled] = useState(event?.is_cancelled ?? false);
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
                        defaultValue={
                            event?.category ?? defaultCategory ?? 'kegiatan'
                        }
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
                        defaultValue={
                            event?.start_date ?? defaultStartDate ?? ''
                        }
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
            <div className="space-y-4 border-t border-slate-200 pt-5">
                <input
                    type="hidden"
                    name="whatsapp_reminder_enabled"
                    value={reminderEnabled ? '1' : '0'}
                />
                <label className="flex items-start gap-3 text-sm text-slate-700">
                    <input
                        type="checkbox"
                        checked={reminderEnabled}
                        onChange={(e) => setReminderEnabled(e.target.checked)}
                        className="mt-1 size-4 accent-brand-600"
                    />
                    <span>
                        <span className="block font-semibold">
                            Aktifkan pengingat WhatsApp
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-slate-500">
                            Satu pesan per guru setiap hari selama agenda
                            berlangsung, mengikuti pengaturan WhatsApp.
                        </span>
                    </span>
                </label>
                {errors.whatsapp_reminder_enabled && (
                    <p className="text-sm text-red-600">
                        {errors.whatsapp_reminder_enabled}
                    </p>
                )}
                <input
                    type="hidden"
                    name="is_cancelled"
                    value={cancelled ? '1' : '0'}
                />
                <label className="flex items-start gap-3 text-sm text-slate-700">
                    <input
                        type="checkbox"
                        checked={cancelled}
                        onChange={(e) => setCancelled(e.target.checked)}
                        className="mt-1 size-4 accent-brand-600"
                    />
                    <span>
                        <span className="block font-semibold">
                            Agenda dibatalkan
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-slate-500">
                            Pengingat yang belum dikirim akan dilewati.
                        </span>
                    </span>
                </label>
                {errors.is_cancelled && (
                    <p className="text-sm text-red-600">
                        {errors.is_cancelled}
                    </p>
                )}
            </div>
        </div>
    );
}
