export const cleanObject = <T>(object: T): T => {
    if (object === null || typeof object !== 'object') {
        return object;
    }

    if (Array.isArray(object)) {
        return object.map(cleanObject) as T;
    }

    return Object.fromEntries(
        Object.entries(object)
            .filter(([, value]) => value !== undefined)
            .map(([key, value]) => [key, cleanObject(value)]),
    ) as T;
};
