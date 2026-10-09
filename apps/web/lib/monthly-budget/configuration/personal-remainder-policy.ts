import { PersonalRemainderPolicy } from '@family-budget/domain/family';

/**
 * family.settings не хранит personal_remainder_policy
 * до появления колонки и формы настроек политика единая для всех семей.
 */
export const PERSONAL_REMAINDER_POLICY: PersonalRemainderPolicy = 'equalized';
