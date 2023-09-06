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

export function formatDatetimeRelative(datetime: string): string {
    const then = new Date(datetime);
    const now = new Date();
    const delta = then.valueOf() - now.valueOf();
    const rtf = new Intl.RelativeTimeFormat(i18n.language);
    const timeframes: {unit: Intl.RelativeTimeFormatUnit, duration: number}[] = [
        { unit: 'year', duration: 365.25 * 86400 * 1000 },
        { unit: 'month', duration: (365.25 * 86400 * 1000) / 12 },
        { unit: 'day', duration: 86400 * 1000 },
        { unit: 'hour', duration: 3600 * 1000 },
        { unit: 'minute', duration: 60 * 1000 },
    ];
    const absDelta = Math.abs(delta);
    for (const { unit, duration } of timeframes) {
        if (absDelta >= duration) {
            const value = Math.trunc(delta / duration);
            return rtf.format(value, unit);
        }
    }
    const value = Math.trunc(delta / 1000);
    return rtf.format(value, 'second');
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
