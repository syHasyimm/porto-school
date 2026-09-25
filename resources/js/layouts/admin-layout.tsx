import type { PropsWithChildren } from 'react';
import DashboardLayout, {
    adminNavigation,
    type DashboardNavKey,
} from '@/layouts/dashboard-layout';
import { dashboard } from '@/routes/admin';

type AdminLayoutProps = PropsWithChildren<{
    active: DashboardNavKey;
    title: string;
}>;

export default function AdminLayout({
    active,
    children,
    title,
}: AdminLayoutProps) {
    return (
        <DashboardLayout
            active={active}
            dashboardHref={dashboard.url()}
            navigation={adminNavigation}
            title={title}
        >
            {children}
        </DashboardLayout>
    );
}
