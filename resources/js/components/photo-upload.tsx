import { ImagePlus, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';

type PhotoUploadProps = {
    currentUrl?: string | null;
};

export function PhotoUpload({ currentUrl }: PhotoUploadProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(
        currentUrl ?? null,
    );
    const [temporaryUrl, setTemporaryUrl] = useState<string | null>(null);

    useEffect(() => {
        return () => {
            if (temporaryUrl) {
                URL.revokeObjectURL(temporaryUrl);
            }
        };
    }, [temporaryUrl]);

    return (
        <div className="grid gap-4 sm:grid-cols-[8rem_1fr] sm:items-center">
            <div className="grid aspect-square w-28 place-items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                {previewUrl ? (
                    <img
                        src={previewUrl}
                        alt="Pratinjau foto guru"
                        className="size-full object-cover"
                    />
                ) : (
                    <UserRound
                        aria-hidden="true"
                        className="size-10 text-slate-400"
                    />
                )}
            </div>
            <div>
                <label
                    htmlFor="photo"
                    className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700"
                >
                    <ImagePlus
                        aria-hidden="true"
                        className="size-4 text-brand-600"
                    />
                    Foto profil
                </label>
                <Input
                    id="photo"
                    name="photo"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="h-auto py-2 file:mr-3 file:rounded-md file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-brand-700"
                    onChange={(event) => {
                        const file = event.target.files?.[0];

                        if (!file) {
                            setPreviewUrl(currentUrl ?? null);
                            return;
                        }

                        const url = URL.createObjectURL(file);
                        setTemporaryUrl(url);
                        setPreviewUrl(url);
                    }}
                />
                <p className="mt-2 text-xs leading-5 text-slate-500">
                    JPG, PNG, atau WebP. Maksimal 2 MB.
                </p>
            </div>
        </div>
    );
}
