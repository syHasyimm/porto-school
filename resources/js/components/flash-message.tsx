import { usePage } from '@inertiajs/react';
import { CheckCircle2 } from 'lucide-react';

export function FlashMessage() {
    const flash = usePage().props.flash;

    if (!flash?.success) {
        return null;
    }

    return (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
            <CheckCircle2
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0"
            />
            <p>{flash.success}</p>
        </div>
    );
}
