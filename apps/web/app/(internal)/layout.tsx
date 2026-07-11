import { Sidebar } from '@/features/navigation/sidebar.widget';
import { requireAuth } from '@/guards/require-auth';

export default async function InternalLayout({
    children,
}: Readonly<LayoutProps<'/'>>) {
    await requireAuth();
    return (
        <div className="flex">
            <Sidebar />
            {children}
        </div>
    );
}
