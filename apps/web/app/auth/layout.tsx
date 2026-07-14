export default async function AuthLayout({ children }: Readonly<LayoutProps<'/auth'>>) {
    return <main className="h-screen flex justify-center items-center">{children}</main>;
}
