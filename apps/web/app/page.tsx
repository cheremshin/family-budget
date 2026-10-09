import Link from 'next/link';

import { Button } from '@family-budget/ui';

import { routes } from '@/routes';

export default function Landing() {
    return (
        <main className="m-4 flex gap-4">
            <Button asChild>
                <Link href={routes.signIn}>Войти</Link>
            </Button>
            <Button asChild>
                <Link href={routes.signUp}>Зарегистрироваться</Link>
            </Button>
        </main>
    );
}
