import { Button } from '@ui/index';
import Link from 'next/link';

export default function Landing() {
    return (
        <main className="m-4 flex gap-4">
            <Button asChild>
                <Link href="/auth/sign-in">Войти</Link>
            </Button>
            <Button asChild>
                <Link href="/auth/sign-up">Зарегистрироваться</Link>
            </Button>
        </main>
    );
}
