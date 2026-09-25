import type { PropsWithChildren } from 'react';
import { Label } from '@/components/ui/label';

type FormFieldProps = PropsWithChildren<{
    error?: string;
    hint?: string;
    htmlFor: string;
    label: string;
    required?: boolean;
}>;

export function FormField({
    children,
    error,
    hint,
    htmlFor,
    label,
    required,
}: FormFieldProps) {
    return (
        <div className="flex flex-col gap-2">
            <Label htmlFor={htmlFor}>
                {label}
                {required && <span className="ml-1 text-red-600">*</span>}
            </Label>
            {children}
            {hint && !error && (
                <p className="text-xs leading-5 text-slate-500">{hint}</p>
            )}
            {error && (
                <p className="text-sm font-medium text-red-600">{error}</p>
            )}
        </div>
    );
}
