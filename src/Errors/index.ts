export function throwError(error: Error): never;
export function throwError(message?: string, options?: ErrorOptions): never;
export function throwError(errorOrMessage?: Error | string, options?: ErrorOptions) {
    if (errorOrMessage instanceof Error) {
        throw errorOrMessage;
    }

    throw new Error(errorOrMessage, options);
}

export class CachedNotFoundError extends Error {}

export function throwCachedNotFounderror(message = 'Item not found in cache.'): never {
    throw new CachedNotFoundError(message);
}
