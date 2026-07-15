import z from 'zod';

export const MONEY_REGEX = /^\d{1,10}(\,\d{1,2})?$/;

export function isValidMoney(value: string): boolean {
    if (!MONEY_REGEX.test(value)) return false;
    const digitsOnly = value.replace(',', '');
    return digitsOnly.length <= 12;
}

export const moneySchema = z
    .string()
    .trim()
    .regex(MONEY_REGEX, 'Введите корректную сумму (не более 12 цифр, до 2 знаков после запятой')
    .refine((v) => v.replace(',', '').length <= 12, { message: 'Слишком длинное число' });
