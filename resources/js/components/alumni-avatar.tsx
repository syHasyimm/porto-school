import { useState } from 'react';
import { cn } from '@/lib/utils';

type AlumniAvatarProps = {
    name: string;
    photoUrl: string | null;
    className?: string;
};

export function AlumniAvatar({ name, photoUrl, className }: AlumniAvatarProps) {
    const [failedUrl, setFailedUrl] = useState<string | null>(null);
    const avatarClassName = cn(
        'size-14 shrink-0 rounded-full border border-slate-200 bg-brand-50 object-cover',
        className,
    );

    if (photoUrl && failedUrl !== photoUrl) {
        return (
            <img
                src={photoUrl}
                alt={`Foto ${name}`}
                width={56}
                height={56}
                loading="lazy"
                decoding="async"
                className={avatarClassName}
                onError={() => setFailedUrl(photoUrl)}
            />
        );
    }

    const initials =
        name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part[0])
            .join('')
            .toUpperCase() || 'A';

    return (
        <span
            role="img"
            aria-label={`Foto ${name} belum tersedia`}
            className={cn(
                avatarClassName,
                'grid place-items-center text-sm font-bold text-brand-700',
            )}
        >
            {initials}
        </span>
    );
}
