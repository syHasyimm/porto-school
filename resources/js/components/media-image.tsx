import { ImageOff } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type MediaImageProps = {
    alt: string;
    className?: string;
    src: string | null;
    fallbackLabel?: string;
    fallback?: ReactNode;
    loading?: 'eager' | 'lazy';
};

export function MediaImage({
    alt,
    className,
    src,
    fallbackLabel,
    fallback,
    loading,
}: MediaImageProps) {
    const [failed, setFailed] = useState(false);

    if (!src || failed) {
        return (
            <div
                role="img"
                aria-label={fallbackLabel ? `${fallbackLabel}. ${alt}` : alt}
                className={cn(
                    'grid place-items-center bg-slate-100 text-slate-400',
                    className,
                )}
            >
                {fallback ?? (
                    <div className="flex flex-col items-center gap-3 p-5 text-center">
                        <ImageOff
                            aria-hidden="true"
                            className="size-9 stroke-[1.25]"
                        />
                        {fallbackLabel && (
                            <span className="text-xs leading-6 font-medium text-slate-500">
                                {fallbackLabel}
                            </span>
                        )}
                    </div>
                )}
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            className={className}
            loading={loading}
            decoding="async"
            onError={() => setFailed(true)}
        />
    );
}
