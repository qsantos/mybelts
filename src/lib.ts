import i18n from 'i18next';

interface APIErrorBody {
    message?: string;
}

interface APIError {
    body?: APIErrorBody;
    message: string;
}

export function getAPIError(error: APIError): string {
    return error.body?.message || error.message;
}

export function formatDatetime(datetime: string): string {
    const d = new Date(datetime);
    return d.toLocaleString(i18n.language, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
    });
}

export function formatDate(date: string): string {
    const d = new Date(date);
    return d.toLocaleDateString(i18n.language, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

// inspired from https://stackoverflow.com/a/65914484/4457767
export function joinArray<T, S>(array: Array<T>, separator: S): Array<T | S> {
    return array.reduce<(T | S)[]>((p, c, idx) => {
        if (idx === 0) {
            return [c];
        } else {
            return [...p, separator, c];
        }
    }, []);
}

export function assertNotUndefined<T>(obj: T | undefined): T {
    if (obj === undefined) {
        throw Error("An object is unexpectedly undefined");
    }
    return obj;
}

export function assertNotNull<T>(obj: T | null): T {
    if (obj === null) {
        throw Error("An object is unexpectedly undefined");
    }
    return obj;
}


export function assertNotNullish<T>(obj: T | undefined | null): T {
    if (obj === undefined || obj === null) {
        throw Error("An object is unexpectedly undefined");
    }
    return obj;
}

