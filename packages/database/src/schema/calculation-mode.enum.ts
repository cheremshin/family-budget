import { pgEnum } from 'drizzle-orm/pg-core';

export const calculationMode = pgEnum('calculation_mode', ['absolute', 'relative']);
