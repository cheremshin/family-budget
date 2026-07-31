import { redirect } from 'next/navigation';

import { CreateFamilyWidget } from '@/features/create-family-wizard/create-family.widget';
import { requireUser } from '@/lib/request-context';

export default async function Page() {
    const user = await requireUser();

    if (user.familyId) {
        redirect('/home');
    }

    return (
        <>
            <CreateFamilyWidget />
        </>
    );
}
