import { ImageOff, ImagePlus, RotateCcw, Trash2, Upload } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type SettingsImageUploadProps = {
    id: string;
    name: string;
    label: string;
    currentUrl: string | null;
    removeName?: string;
    error?: string;
    description?: string;
    accept?: string;
    maxSizeMb?: number;
    fit?: 'cover' | 'contain';
    aspect?: 'wide' | 'landscape' | 'square' | 'portrait';
    compact?: boolean;
    className?: string;
    disabled?: boolean;
    onChange?: () => void;
    onValidationError?: (error: string | null) => void;
};

export function SettingsImageUpload({
    id,
    name,
    label,
    currentUrl,
    removeName,
    error,
    description,
    accept = 'image/jpeg,image/png,image/webp',
    maxSizeMb = 4,
    fit = 'cover',
    aspect = 'landscape',
    compact = false,
    className,
    disabled = false,
    onChange,
    onValidationError,
}: SettingsImageUploadProps) {
    const [selection, setSelection] = useState<{
        file: File;
        url: string;
    } | null>(null);
    const [removed, setRemoved] = useState(false);
    const [clientError, setClientError] = useState<string | null>(null);
    const [failedUrl, setFailedUrl] = useState<string | null>(null);
    const input = useRef<HTMLInputElement>(null);
    const previewUrl = removed ? null : (selection?.url ?? currentUrl);
    const visibleError = clientError ?? error;
    const formats = accept.includes('image/gif')
        ? 'JPG, PNG, WebP, atau GIF'
        : 'JPG, PNG, atau WebP';

    useEffect(
        () => () => {
            if (selection) URL.revokeObjectURL(selection.url);
        },
        [selection],
    );

    function clearSelection() {
        if (input.current) {
            input.current.value = '';
            input.current.dispatchEvent(new Event('input', { bubbles: true }));
        }
        setSelection(null);
        setClientError(null);
        onValidationError?.(null);
        onChange?.();
    }

    return (
        <div
            className={cn(
                'min-w-0',
                compact && 'grid gap-5 sm:grid-cols-[12rem_1fr] sm:items-start',
                className,
            )}
        >
            <label
                htmlFor={id}
                className={cn(
                    'group hover:border-brand-300 relative block cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition-colors',
                    disabled && 'pointer-events-none opacity-60',
                )}
            >
                <div
                    className={cn(
                        'relative grid w-full place-items-center',
                        {
                            wide: 'aspect-[16/9]',
                            landscape: 'aspect-[4/3]',
                            square: 'aspect-square',
                            portrait: 'aspect-[4/5]',
                        }[aspect],
                    )}
                >
                    {previewUrl && previewUrl !== failedUrl ? (
                        <img
                            src={previewUrl}
                            alt={`Pratinjau ${label.toLowerCase()}`}
                            onError={() => setFailedUrl(previewUrl)}
                            className={cn(
                                'absolute inset-0 size-full',
                                fit === 'contain'
                                    ? 'object-contain p-7'
                                    : 'object-cover',
                            )}
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-3 p-5 text-center">
                            <span className="grid size-12 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-400">
                                {removed ? (
                                    <ImageOff
                                        aria-hidden="true"
                                        className="size-5"
                                    />
                                ) : (
                                    <ImagePlus
                                        aria-hidden="true"
                                        className="size-5"
                                    />
                                )}
                            </span>
                            <span className="text-xs font-medium text-slate-500">
                                {removed
                                    ? 'Foto akan dihapus'
                                    : `Tambahkan ${label.toLowerCase()}`}
                            </span>
                        </div>
                    )}
                </div>
                {previewUrl && previewUrl !== failedUrl && (
                    <span
                        aria-hidden="true"
                        className="absolute right-3 bottom-3 grid size-9 place-items-center rounded-lg bg-white/95 text-slate-700 shadow-sm transition-colors group-hover:text-brand-700"
                    >
                        <Upload className="size-4" />
                    </span>
                )}
            </label>
            <div className={cn('min-w-0 space-y-3', !compact && 'pt-4')}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <label
                        htmlFor={id}
                        className="text-sm font-bold text-slate-800"
                    >
                        {label}
                    </label>
                    {(selection || removed) && (
                        <span
                            role="status"
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700"
                        >
                            <span className="size-1.5 rounded-full bg-amber-500" />
                            Belum disimpan
                        </span>
                    )}
                </div>
                {description && (
                    <p className="text-xs leading-5 text-slate-500">
                        {description}
                    </p>
                )}
                {removeName && (
                    <input
                        type="hidden"
                        name={removeName}
                        value={removed ? '1' : '0'}
                    />
                )}
                <input
                    ref={input}
                    id={id}
                    name={name}
                    type="file"
                    accept={accept}
                    disabled={disabled}
                    aria-invalid={Boolean(visibleError)}
                    aria-describedby={`${id}-${visibleError ? 'error' : 'hint'}`}
                    className="peer sr-only"
                    onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        const validationError = !accept
                            .split(',')
                            .includes(file.type)
                            ? `Gunakan gambar ${formats}.`
                            : file.size > maxSizeMb * 1024 * 1024
                              ? `Ukuran gambar maksimal ${maxSizeMb} MB.`
                              : null;
                        if (validationError) {
                            clearSelection();
                            setClientError(validationError);
                            onValidationError?.(validationError);
                            return;
                        }
                        setSelection({ file, url: URL.createObjectURL(file) });
                        setRemoved(false);
                        setClientError(null);
                        onValidationError?.(null);
                        onChange?.();
                    }}
                />
                <label
                    htmlFor={id}
                    className={cn(
                        'hover:border-brand-300 inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-600 hover:bg-brand-50 hover:text-brand-700',
                        disabled && 'pointer-events-none opacity-60',
                    )}
                >
                    <Upload aria-hidden="true" className="size-3.5" />
                    {previewUrl ? 'Ganti gambar' : 'Pilih gambar'}
                </label>
                {selection && (
                    <p
                        className="truncate text-xs text-slate-600"
                        title={selection.file.name}
                    >
                        {selection.file.name} ·{' '}
                        {(selection.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                )}
                <p
                    id={`${id}-hint`}
                    className="text-xs leading-5 text-slate-400"
                >
                    {formats}. Maksimal {maxSizeMb} MB.
                </p>
                {visibleError && (
                    <p
                        id={`${id}-error`}
                        role="alert"
                        className="text-xs font-medium text-red-600"
                    >
                        {visibleError}
                    </p>
                )}
                <div className="flex flex-wrap gap-2">
                    {(selection || clientError) && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={disabled}
                            className="h-8 px-0 hover:bg-transparent hover:text-brand-700"
                            onClick={clearSelection}
                        >
                            <RotateCcw
                                aria-hidden="true"
                                className="size-3.5"
                            />
                            Batalkan pilihan
                        </Button>
                    )}
                    {removeName && currentUrl && !selection && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={disabled}
                            className={cn(
                                'h-8 px-0 hover:bg-transparent',
                                removed
                                    ? 'text-brand-700'
                                    : 'text-slate-500 hover:text-red-600',
                            )}
                            onClick={() => {
                                clearSelection();
                                setRemoved(!removed);
                            }}
                        >
                            {removed ? (
                                <RotateCcw
                                    aria-hidden="true"
                                    className="size-3.5"
                                />
                            ) : (
                                <Trash2
                                    aria-hidden="true"
                                    className="size-3.5"
                                />
                            )}
                            {removed ? 'Batalkan penghapusan' : 'Hapus foto'}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
