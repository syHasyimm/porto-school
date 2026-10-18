import { useState } from 'react';
import { cn } from '@/lib/utils';

export function TeacherPortrait({
    name,
    photoUrl,
    className,
}: {
    name: string;
    photoUrl: string | null;
    className?: string;
}) {
    const [failedUrl, setFailedUrl] = useState<string | null>(null);
    const initials = name
        .split(',')[0]
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((word) => word[0])
        .join('');

    return (
        <div className={cn('relative overflow-hidden bg-[#e8edf5]', className)}>
            {photoUrl && failedUrl !== photoUrl ? (
                <img
                    src={photoUrl}
                    alt={`Foto ${name}`}
                    width={600}
                    height={750}
                    loading="lazy"
                    onError={() => setFailedUrl(photoUrl)}
                    className="size-full object-cover object-top transition-transform duration-500 motion-safe:group-hover:scale-[1.035] motion-reduce:transition-none"
                />
            ) : (
                <div
                    className="flex h-full min-h-32 flex-col items-center justify-center gap-3 p-4"
                    role="img"
                    aria-label={`Foto ${name} belum tersedia`}
                >
                    <span
                        aria-hidden="true"
                        className="font-heading text-5xl font-bold tracking-tight text-brand-700/70 sm:text-6xl"
                    >
                        {initials}
                    </span>
                    <span
                        aria-hidden="true"
                        className="text-[11px] font-medium text-slate-500"
                    >
                        Foto belum tersedia
                    </span>
                </div>
            )}
        </div>
    );
}
