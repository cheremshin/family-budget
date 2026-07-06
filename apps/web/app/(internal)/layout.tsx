import { Sidebar } from '@/features/navigation/sidebar.widget';
import { requireSession } from '@/lib/guards/auth/require-session';

export default async function InternalLayout({
    children,
}: Readonly<LayoutProps<'/'>>) {
    await requireSession();
    return (
        <main className="flex">
            <Sidebar />
            {children}
        </main>
    );
}
