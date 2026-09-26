import { FormField } from '@/components/form-field';
import { Input } from '@/components/ui/input';
import type { GalleryItem } from '@/types';

type GalleryFieldsProps = {
    categories: string[];
    errors: Partial<Record<string, string>>;
    item?: GalleryItem;
};

export function GalleryFields({
    categories,
    errors,
    item,
}: GalleryFieldsProps) {
    return (
        <div className="space-y-5">
            <FormField
                htmlFor="title"
                label="Judul foto"
                error={errors.title}
                required
            >
                <Input
                    id="title"
                    name="title"
                    defaultValue={item?.title ?? ''}
                    required
                    autoFocus
                />
            </FormField>
            <FormField
                htmlFor="category"
                label="Kategori"
                error={errors.category}
                hint="Opsional. Anda dapat memilih kategori lama atau menulis kategori baru."
            >
                <Input
                    id="category"
                    name="category"
                    list="gallery-categories"
                    defaultValue={item?.category ?? ''}
                    placeholder="Contoh: Kegiatan"
                />
                <datalist id="gallery-categories">
                    {categories.map((category) => (
                        <option key={category} value={category} />
                    ))}
                </datalist>
            </FormField>
            <FormField
                htmlFor="image"
                label="Gambar"
                error={errors.image}
                hint={
                    item
                        ? 'Kosongkan jika tidak ingin mengganti gambar. Maksimal 5 MB.'
                        : 'JPG, PNG, GIF, atau WebP, maksimal 5 MB.'
                }
                required={!item}
            >
                <Input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="pt-2"
                    required={!item}
                />
            </FormField>
            {item && (
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    <img
                        src={item.image_url}
                        alt={item.title}
                        className="aspect-[16/10] w-full object-cover"
                    />
                </div>
            )}
        </div>
    );
}
