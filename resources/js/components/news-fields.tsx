import { FormField } from '@/components/form-field';
import { NewsEditor } from '@/components/news-editor';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import type { NewsArticle } from '@/types';

export type NewsCategoryOption = { value: string; label: string };

type NewsFieldsProps = {
    article?: NewsArticle;
    categories: NewsCategoryOption[];
    errors: Partial<Record<string, string>>;
};

export function NewsFields({ article, categories, errors }: NewsFieldsProps) {
    return (
        <div className="space-y-5">
            <FormField
                htmlFor="title"
                label="Judul berita"
                error={errors.title}
                required
            >
                <Input
                    id="title"
                    name="title"
                    defaultValue={article?.title ?? ''}
                    required
                    autoFocus
                />
            </FormField>
            <FormField
                htmlFor="category"
                label="Kategori"
                error={errors.category}
                required
            >
                <Select
                    id="category"
                    name="category"
                    defaultValue={article?.category ?? ''}
                    required
                >
                    <option value="" disabled>
                        Pilih kategori berita
                    </option>
                    {categories.map((category) => (
                        <option key={category.value} value={category.value}>
                            {category.label}
                        </option>
                    ))}
                </Select>
            </FormField>
            <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                    htmlFor="published_at"
                    label="Waktu publikasi"
                    error={errors.published_at}
                    hint="Kosongkan untuk menyimpan sebagai draft."
                >
                    <Input
                        id="published_at"
                        name="published_at"
                        type="datetime-local"
                        defaultValue={article?.published_at ?? ''}
                    />
                </FormField>
                <FormField
                    htmlFor="thumbnail"
                    label="Thumbnail"
                    error={errors.thumbnail}
                    hint="JPG, PNG, GIF, atau WebP, maksimal 5 MB."
                >
                    <Input
                        id="thumbnail"
                        name="thumbnail"
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        className="pt-2"
                    />
                </FormField>
            </div>
            {article?.thumbnail_url && (
                <div className="max-w-sm overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    <img
                        src={article.thumbnail_url}
                        alt={`Thumbnail ${article.title}`}
                        className="aspect-video w-full object-cover"
                    />
                    <p className="px-3 py-2 text-xs text-slate-500">
                        Thumbnail saat ini. Unggah gambar baru untuk mengganti.
                    </p>
                </div>
            )}
            <FormField
                htmlFor="content-editor"
                label="Isi berita"
                error={errors.content ?? errors.content_html}
                hint="Gunakan toolbar untuk judul bagian, daftar, tautan, dan penekanan teks."
                required
            >
                <NewsEditor
                    content={article?.content}
                    contentHtml={article?.content_html}
                />
            </FormField>
        </div>
    );
}
