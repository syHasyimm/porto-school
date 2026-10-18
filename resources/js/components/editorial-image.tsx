import { Camera, Newspaper } from 'lucide-react';
import { MediaImage } from '@/components/media-image';
import { cn } from '@/lib/utils';

export function EditorialImage({
    src,
    alt,
    className,
    kind = 'news',
    loading = 'lazy',
}: {
    src: string | null;
    alt: string;
    className?: string;
    kind?: 'news' | 'gallery';
    loading?: 'eager' | 'lazy';
}) {
    const Icon = kind === 'news' ? Newspaper : Camera;
    const label =
        kind === 'news'
            ? 'Foto artikel belum tersedia'
            : 'Foto belum dapat ditampilkan';

    return (
        <MediaImage
            key={src ?? 'missing'}
            src={src}
            alt={alt}
            loading={loading}
            className={className}
            fallbackLabel={label}
            fallback={
                <div
                    aria-hidden="true"
                    className={cn(
                        'relative flex size-full flex-col items-center justify-center overflow-hidden p-6 text-center',
                        kind === 'news' ? 'bg-[#e8eef8]' : 'bg-[#eae9e3]',
                    )}
                >
                    <span className="absolute inset-4 rounded-[inherit] border border-slate-600/10 sm:inset-6" />
                    <span className="absolute top-7 left-7 hidden text-[10px] font-semibold tracking-[0.15em] text-slate-500 sm:block">
                        {kind === 'news'
                            ? 'BERITA SEKOLAH'
                            : 'DOKUMENTASI SEKOLAH'}
                    </span>
                    <Icon className="size-12 stroke-[1] text-brand-700/60 sm:size-16" />
                    <span className="mt-5 text-xs leading-6 font-medium text-slate-500">
                        {label}
                    </span>
                    <span className="mt-5 h-px w-12 bg-brand-700/25" />
                </div>
            }
        />
    );
}
