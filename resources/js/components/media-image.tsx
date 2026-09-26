import { ImageOff } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

type MediaImageProps = {
    alt: string;
    className?: string;
    src: string | null;
};

export function MediaImage({ alt, className, src }: MediaImageProps) {
    const [failed, setFailed] = useState(false);

    if (!src || failed) {
        return (
            <div
                role="img"
                aria-label={alt}
                className={cn(
                    'grid place-items-center bg-slate-100 text-slate-400',
                    className,
                )}
            >
                <ImageOff className="size-9" />
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            className={className}
            onError={() => setFailed(true)}
        />
    );
}
