import type { CacheContainer, CachingOptions } from "./cache-container";

type WithCacheOptions<Parameters> = Partial<Omit<CachingOptions, 'calculateKey'>> & {
    /** an optional prefix to prepend to the key */
    prefix?: string;
    /** an optional function to calculate a key based on the parameters of the wrapped function */
    calculateKey?: (input: Parameters) => string;
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
        options: WithCacheOptions<Parameters> = {},
    ) => {
        return async (...parameters: Parameters): Promise<Result> => {
            let { prefix, calculateKey, ...rest } = options;
            prefix = prefix ?? 'default'
            const key = `${operation.name}:${prefix}:${calculateKey ? calculateKey(parameters) : JSON.stringify(parameters)}`;
            const cachedResponse = await container.getItem<Awaited<Result>>(key);

            if (cachedResponse) {
                return cachedResponse;
            }

            const result = await operation(...parameters);
            await container.setItem(key, result, rest);
            return result;
        };
    };
    return withCache
}
