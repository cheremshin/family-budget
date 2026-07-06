import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@ui/index';
import { AcceptInviteForm } from './_components/accept-invite.form';
import { container } from '@/lib/container';
import { FlashCleaner } from '@/components/flash-cleaner/flash-cleaner';

export default async function Page() {
    const flashMessage = await container.services.flashMessageService.get();

    return (
        <main className="w-full min-h-dvh flex justify-center items-center">
            <Card className="w-100">
                <CardHeader>
                    <CardTitle>Вступить в семью</CardTitle>
                    <CardDescription>Введите код-пришлашение</CardDescription>
                </CardHeader>
                <CardContent>
                    <AcceptInviteForm initialError={flashMessage?.message} />
                </CardContent>
            </Card>
            <FlashCleaner />
        </main>
    );
}
