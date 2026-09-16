'use client';

import { type PropsWithChildren, useEffect, useState } from 'react';

import { type DehydratedState, hydrate } from '@tanstack/query-core';

import { useQueryClient } from './container';

type HydrationBoundaryProps = PropsWithChildren<{ state: DehydratedState }>;

export function HydrationBoundary({ state, children }: HydrationBoundaryProps) {
    const queryClient = useQueryClient();

    useState(() => {
        const cache = queryClient.getQueryCache();
        const queries = state.queries.filter((query) => !cache.get(query.queryHash));

        if (queries.length > 0) {
            hydrate(queryClient, { mutations: [], queries });
        }
    });

    useEffect(() => {
        const cache = queryClient.getQueryCache();
        const queries = state.queries.filter((query) =>
            isNewer(query.state.data, cache.get(query.queryHash)?.state.data),
        );

        if (queries.length > 0) {
            hydrate(queryClient, { mutations: [], queries });
        }
    }, [queryClient, state]);

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
