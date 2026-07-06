import { createContext, useContext } from 'react';
import { CreateFamilyResult } from '../types';

export const FamilyContext = createContext<CreateFamilyResult | null>(null);

export function useCreateFamilyResult() {
    const ctx = useContext(FamilyContext);
    if (!ctx) {
        throw new Error('useCreateFamilyResult must be used in FamilyContext');
    }
    return ctx;
}
