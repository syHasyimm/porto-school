import { createInertiaApp } from '@inertiajs/react';
import { contact, home, profile } from '@/routes';
import { index as calendarIndex } from '@/routes/calendar';
import {
    create as complaintCreate,
    success as complaintSuccess,
} from '@/routes/complaints';
import { index as galleryIndex } from '@/routes/gallery';
import { index as newsIndex } from '@/routes/news';
import { index as teachersIndex } from '@/routes/teachers';

const appName = import.meta.env.VITE_APP_NAME || 'SD Negeri 001 Kepenuhan';

const publicPaths = new Set([
    home.url(),
    profile.url(),
    teachersIndex.url(),
    calendarIndex.url(),
    complaintCreate.url(),
    complaintSuccess.url(),
    newsIndex.url(),
    galleryIndex.url(),
    contact.url(),
]);

function isPublicPath(pathname: string): boolean {
    const newsArticlePrefix = `${newsIndex.url()}/`;
    const articleSlug = pathname
        .slice(newsArticlePrefix.length)
        .replace(/\/$/, '');

    return (
        publicPaths.has(pathname) ||
        (pathname.startsWith(newsArticlePrefix) &&
            articleSlug.length > 0 &&
            !articleSlug.includes('/'))
    );
}

void createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    progress: {
        color: '#4B5563',
    },
    defaults: {
        visitOptions: (href, options) => {
            if (
                typeof window === 'undefined' ||
                (options.method && options.method !== 'get') ||
                window.matchMedia('(prefers-reduced-motion: reduce)').matches
            ) {
                return {};
            }

            const destination = new URL(href, window.location.href);
            const current = window.location;

            if (
                destination.origin !== current.origin ||
                !isPublicPath(current.pathname) ||
                !isPublicPath(destination.pathname) ||
                `${current.pathname}${current.search}` ===
                    `${destination.pathname}${destination.search}`
            ) {
                return {};
            }

            return { viewTransition: true };
        },
    },
});
