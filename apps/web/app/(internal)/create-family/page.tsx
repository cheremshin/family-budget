import { redirect } from 'next/navigation';

import { requireUser } from '@/client/request-context';
import { CreateFamilyWidget } from '@/features/create-family-wizard/create-family.widget';
import { routes } from '@/routes';

export default async function Page() {
    const user = await requireUser();

    if (user.familyId) {
        redirect(routes.home);
    }

    return (
        <>
            <CreateFamilyWidget />
        </>
    );
}
