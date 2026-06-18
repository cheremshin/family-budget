import '@/styles/globals.css';

export default function RootLayout({ children }: Readonly<LayoutProps<'/'>>) {
    return (
        <html lang="ru" className={'h-full antialiased'}>
            <body className="min-h-full flex flex-col">{children}</body>
        </html>
    );
}
