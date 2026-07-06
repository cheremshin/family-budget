import { Family } from './family';

export type User = {
    id: string;
    username: string;
    family: Family | null;
};
