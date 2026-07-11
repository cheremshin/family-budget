import { Family } from '@/lib/family';
import { createContext, useContext } from 'react';

type FamilyContextValue = {
    family: Family | null;
}

export const FamilyContext = createContext<FamilyContextValue | null>(null);

export function useCreateFamily() {
    const ctx = useContext(FamilyContext);
    if (!ctx) {
        throw new Error('useCreateFamilyResult must be used in FamilyContext');
    }
    return ctx;
}
