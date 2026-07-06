import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@ui/index';
import { SignInForm } from './_components/sign-in.form';

export default function Page() {
    return (
        <Card className="w-100">
            <CardHeader>
                <CardTitle>Вход</CardTitle>
                <CardDescription>
                    Введите имя пользователя и пароль
                </CardDescription>
            </CardHeader>
            <CardContent>
                <SignInForm />
            </CardContent>
        </Card>
    );
}
