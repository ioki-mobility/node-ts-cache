import type { CacheContainer, CachingOptions } from "./cache-container";

type WithCacheOptions<Parameters> = Partial<Omit<CachingOptions, 'calculateKey'>> & {
    prefix?: string;
    calculateKey?: (prefix: string, input: Parameters) => string;
}

/**
 * wrapped function factory
 * @param container - cache container to create the fn for
 * @returns a wrapped function
 */
export const withCacheFactory = (container: CacheContainer) => {
    const withCache = <
        Parameters extends Array<unknown>,
        Result extends Promise<unknown>,
    >(
        operation: (...parameters: Parameters) => Result,
        { calculateKey, prefix, ...options }: WithCacheOptions<Parameters>,
    ) => {
        return async (...parameters: Parameters): Promise<Result> => {
            prefix = prefix ?? 'default'
            const key = `${operation.name}:${calculateKey ? calculateKey(prefix, parameters) : `${prefix}:${JSON.stringify(parameters)}`}`;
            const cachedResponse = await container.getItem<Awaited<Result>>(key);

            if (cachedResponse) {
                return cachedResponse;
            }

            const result = await operation(...parameters);
            await container.setItem(key, result, options);
            return result;
        };
    };
    return withCache
}
