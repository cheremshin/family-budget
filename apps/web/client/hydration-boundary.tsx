'use client';

import { type PropsWithChildren, useCallback, useEffect, useState } from 'react';

import { type DehydratedState, hydrate } from '@tanstack/query-core';

import { useQueryClient } from './container';

type HydrationBoundaryProps = PropsWithChildren<{ state: DehydratedState }>;

export function HydrationBoundary({ state, children }: HydrationBoundaryProps) {
    const queryClient = useQueryClient();

    const hydrateFresher = useCallback((config: { allowObserved: boolean }) => {
        const cache = queryClient.getQueryCache();
        const queries = state.queries.filter((query) => {
            const cached = cache.get(query.queryHash);

            if (!config.allowObserved && cached && cached.getObserversCount() > 0) {
                return false;
            }

            return isNewer(query.state.data, cached?.state.data);
        });

        if (queries.length > 0) {
            hydrate(queryClient, { mutations: [], queries });
        }
    }, [queryClient, state]);

    useState(() => hydrateFresher({ allowObserved: false }));

    useEffect(() => {
        hydrateFresher({ allowObserved: true });
    }, [queryClient, state, hydrateFresher]);

    return children;
}

type Versioned = { version: number };

function isVersioned(value: unknown): value is Versioned {
    return (
        typeof value === 'object' &&
        value !== null &&
        typeof (value as Versioned).version === 'number'
    );
}

function isNewer(incoming: unknown, cached: unknown): boolean {
    if (!isVersioned(cached)) return true;

    return isVersioned(incoming) && incoming.version >= cached.version;
}
