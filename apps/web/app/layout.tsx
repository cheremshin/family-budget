import { AuthProvider } from '@/lib/contexts/auth-context';
import '@/styles/globals.css';

export default function RootLayout({ children }: Readonly<LayoutProps<'/'>>) {
    return (
        <html lang="ru" className={'h-full antialiased'}>
            <AuthProvider>
                <body className="min-h-full flex flex-col">{children}</body>
            </AuthProvider>
        </html>
    );
}
