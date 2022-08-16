import i18n from 'i18next';

interface APIErrorBody {
    message?: string,
}

interface APIError {
    body?: APIErrorBody,
    message: string,
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
