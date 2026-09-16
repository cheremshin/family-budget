'use client';

import { type PropsWithChildren, createContext, useContext, useState } from 'react';

import { environmentManager } from '@tanstack/query-core';
import { enableStaticRendering } from 'mobx-react-lite';
import type { QueryClient } from 'mobx-tanstack-query';

import { getQueryClient } from './core/query-client';

enableStaticRendering(environmentManager.isServer());

const QueryClientContext = createContext<QueryClient | null>(null);

export function ClientProvider({ children }: PropsWithChildren) {
    const [queryClient] = useState(getQueryClient);

    return <QueryClientContext value={queryClient}>{children}</QueryClientContext>;
}

export function useQueryClient(): QueryClient {
    const queryClient = useContext(QueryClientContext);

    if (!queryClient) {
        throw new Error('useQueryClient must be used inside ClientProvider');
    }

    return queryClient;
}
