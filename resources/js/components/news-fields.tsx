import { FormField } from '@/components/form-field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { NewsArticle } from '@/types';

type NewsFieldsProps = {
    article?: NewsArticle;
    errors: Partial<Record<string, string>>;
};

export function NewsFields({ article, errors }: NewsFieldsProps) {
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
                htmlFor="content"
                label="Isi berita"
                error={errors.content}
                hint="Pisahkan paragraf dengan baris kosong agar mudah dibaca."
                required
            >
                <Textarea
                    id="content"
                    name="content"
                    defaultValue={article?.content ?? ''}
                    rows={16}
                    required
                />
            </FormField>
        </div>
    );
}
