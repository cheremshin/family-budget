import { ClientProvider } from '@/client/container';
import { requireUser } from '@/client/request-context';
import { Sidebar } from '@/features/navigation/sidebar.widget';

export default async function InternalLayout({ children }: Readonly<LayoutProps<'/'>>) {
    await requireUser();

    return (
        <ClientProvider>
            <div className="flex bg-background text-foreground">
                <Sidebar />
                {children}
            </div>
        </ClientProvider>
    );
}
