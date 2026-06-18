import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@ui/index';
import { SignUpForm } from './_components/sign-up.form';

export default function Page() {
    return (
        <main className="h-screen flex justify-center items-center">
            <Card className="w-100">
                <CardHeader>
                    <CardTitle>Регистрация</CardTitle>
                    <CardDescription>
                        Введите имя пользователя и пароль
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <SignUpForm />
                </CardContent>
            </Card>
        </main>
    );
}
