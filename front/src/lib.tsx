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
