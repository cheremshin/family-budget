import { pgEnum } from 'drizzle-orm/pg-core';

import { personalRemainderPolicyOptions } from '@family-budget/domain/family';

export const personalRemainderPolicy = pgEnum(
    'personal_remainder_policy',
    personalRemainderPolicyOptions,
);
