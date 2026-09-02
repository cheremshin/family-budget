import { randomInt } from 'node:crypto';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export function generateRandomCode(length: number = 8) {
    let result = '';

    for (let i = 0; i < length; i++) {
        result += ALPHABET[randomInt(ALPHABET.length)];
    }

    return result;
}
