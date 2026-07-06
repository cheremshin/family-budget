import { getCurrentUser } from './_lib/user.queries';
import { CreateFamilyWidget } from '@/features/create-family-wizard/create-family.widget';

export default async function Page() {
    const user = await getCurrentUser();

    return (
        <main className="m-4 flex flex-col">
            <span>Добрый день, {user.username}</span>
            <h1 className="text-2xl font-extrabold">Обзор</h1>
            {user.family ? <></> : <CreateFamilyWidget />}
        </main>
    );
}
