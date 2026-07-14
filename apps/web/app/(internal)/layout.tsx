import { Sidebar } from '@/features/navigation/sidebar.widget';
import { requireUser } from '@/lib/request-context';

export default async function InternalLayout({ children }: Readonly<LayoutProps<'/'>>) {
    await requireUser();

    return (
        <div className="flex bg-background text-foreground">
            <Sidebar />
            {children}
        </div>
    );
}
