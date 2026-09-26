import type { Auth } from '@/types/auth';
import type { SiteSettings } from '@/types/site';

declare module 'react' {
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            site: SiteSettings;
            auth: Auth;
            flash: {
                success?: string;
            };
            [key: string]: unknown;
        };
    }
}
