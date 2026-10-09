import z from 'zod';

/**
 * Деньги везде - decimal-строка, а не число
 *
 * Повторяет колонку `decimal(12, 2)`: до 10 цифр целой части и до 2 дробной.
 */
const MONEY_REGEX = /^\d{1,10}(\.\d{1,2})?$/;
const SIGNED_MONEY_REGEX = /^-?\d{1,10}(\.\d{1,2})?$/;

export const moneySchema = z
    .string()
    .trim()
    .regex(MONEY_REGEX, 'Введите корректную сумму (не более 12 цифр, до 2 знаков после запятой)');

export const signedMoneySchema = z.string().trim().regex(SIGNED_MONEY_REGEX, 'Некорректная сумма');

export type Money = z.infer<typeof moneySchema>;
export type SignedMoney = z.infer<typeof signedMoneySchema>;

export function toKopecks(amount: SignedMoney): number {
    const isNegative = amount.startsWith('-');
    const [whole, fraction = ''] = (isNegative ? amount.slice(1) : amount).split('.');
    const value = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
    return isNegative ? -value : value;
}

export function fromKopecks(kopecks: number): SignedMoney {
    const sign = kopecks < 0 ? '-' : '';
    const absolute = Math.abs(kopecks);
    return `${sign}${Math.trunc(absolute / 100)}.${String(absolute % 100).padStart(2, '0')}`;
}

export function sumMoney(amounts: SignedMoney[]): SignedMoney {
    return fromKopecks(amounts.reduce((acc, amount) => acc + toKopecks(amount), 0));
}

/**
 * Процент от суммы, половина копейки округляется вверх
 *
 * Считается в целых: процент - в сотых долях (`'33.33'` → 3333), произведение в BigInt,
 * потому что копейки × сотые выходят за точный диапазон Number. Через float было UB:
 * 0.57% от 50.00 давало 0.28, а 0.69% - 0.35.
 */
export function percentOf(total: Money, percent: string): Money {
    const scaled = BigInt(toKopecks(total)) * BigInt(toKopecks(percent));
    return fromKopecks(Number((scaled + 5_000n) / 10_000n));
}

/**
 * Делит `total` между `weights` методом наибольших остатков - без потери копеек.
 *
 * `total` может быть отрицательным (например, общий пул личных остатков при перерасходе)
 */
export function allocate(total: SignedMoney, weights: number[]): SignedMoney[] {
    const totalKopecks = toKopecks(total);
    const weightSum = weights.reduce((acc, weight) => acc + weight, 0);

    if (weights.length === 0 || weightSum <= 0) {
        throw new Error('allocate: веса должны быть положительны в сумме');
    }

    const sign = totalKopecks < 0 ? -1 : 1;
    const magnitude = Math.abs(totalKopecks);

    const exact = weights.map((weight) => (magnitude * weight) / weightSum);
    const parts = exact.map(Math.floor);

    const byRemainder = exact
        .map((value, index) => ({ index, remainder: value - parts[index] }))
        .sort((a, b) => b.remainder - a.remainder || a.index - b.index);

    let leftover = magnitude - parts.reduce((acc, part) => acc + part, 0);
    for (let i = 0; leftover > 0; i++, leftover--) {
        parts[byRemainder[i].index]++;
    }

    return parts.map((part) => fromKopecks(sign * part));
}
