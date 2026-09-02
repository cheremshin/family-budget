import { Inter } from 'next/font/google';

import { cn } from '@family-budget/ui';

import '@/styles/globals.css';

const inter = Inter();

export default async function RootLayout({ children }: Readonly<LayoutProps<'/'>>) {
    return (
        <html lang="ru" className={cn('h-full antialiased bg-background', inter.className)}>
            <body className="min-h-full">{children}</body>
        </html>
    );
}
