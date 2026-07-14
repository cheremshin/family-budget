import '@/styles/globals.css';
import { cn } from '@ui/index';

import { Inter } from 'next/font/google';

const inter = Inter();

export default async function RootLayout({ children }: Readonly<LayoutProps<'/'>>) {
    return (
        <html lang="ru" className={cn('h-full antialiased', inter.className)}>
            <body className="min-h-full">{children}</body>
        </html>
    );
}
