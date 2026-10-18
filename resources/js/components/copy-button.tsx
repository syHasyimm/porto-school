import { Check, Copy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export function CopyButton({ value, label }: { value: string; label: string }) {
    const [status, setStatus] = useState<
        'idle' | 'copying' | 'copied' | 'error'
    >('idle');

    useEffect(() => {
        if (status !== 'copied' && status !== 'error') return;
        const timeout = window.setTimeout(() => setStatus('idle'), 4000);
        return () => window.clearTimeout(timeout);
    }, [status]);

    async function copyValue() {
        if (status === 'copying') return;
        setStatus('copying');
        try {
            await navigator.clipboard.writeText(value);
            setStatus('copied');
        } catch {
            setStatus('error');
        }
    }

    const Icon = status === 'copied' ? Check : Copy;

    return (
        <span className="inline-flex flex-col items-start">
            <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={copyValue}
                aria-disabled={status === 'copying'}
                aria-label={`Salin ${label}`}
                aria-busy={status === 'copying'}
                className="min-w-25 rounded-full border-[#dce1ea] px-4 text-xs font-semibold text-slate-600 hover:border-brand-700/30 hover:bg-brand-50 hover:text-brand-700"
            >
                <Icon aria-hidden="true" className="size-4 stroke-[1.75]" />
                {status === 'copied'
                    ? 'Tersalin'
                    : status === 'copying'
                      ? 'Menyalin...'
                      : 'Salin'}
            </Button>
            <span
                role="status"
                aria-atomic="true"
                className={
                    status === 'error'
                        ? 'mt-2 max-w-48 text-xs leading-5 text-slate-600'
                        : 'sr-only'
                }
            >
                {status === 'copied'
                    ? `${label} berhasil disalin.`
                    : status === 'error'
                      ? 'Belum bisa menyalin. Pilih teks di atas untuk menyalin secara manual.'
                      : ''}
            </span>
        </span>
    );
}
