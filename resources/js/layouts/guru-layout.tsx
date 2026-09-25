import type { PropsWithChildren } from 'react';
import DashboardLayout, {
    guruNavigation,
    type DashboardNavKey,
} from '@/layouts/dashboard-layout';
import { dashboard } from '@/routes/guru';

type GuruLayoutProps = PropsWithChildren<{
    active: DashboardNavKey;
    title: string;
}>;

export default function GuruLayout({
    active,
    children,
    title,
}: GuruLayoutProps) {
    return (
        <DashboardLayout
            active={active}
            dashboardHref={dashboard.url()}
            navigation={guruNavigation}
            title={title}
        >
            {children}
        </DashboardLayout>
    );
}
