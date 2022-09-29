import type { CacheContainer, CachingOptions } from "./cache-container";

type WithCacheOptions<Parameters> = Partial<Omit<CachingOptions, 'calculateKey'>> & {
    name: string;
    keyFn: (input: Parameters) => string;
}
/**
 * wrapper function factory for withCache
 * @param container - cache container to create the fn for
 * @returns a wrapper function
 */
export const withCacheFactory = (container: CacheContainer) => {
    const withCache = <
        Parameters extends Array<unknown>,
        Result extends Promise<unknown>,
    >(
        operation: (...parameters: Parameters) => Result,
        { keyFn, name, ...options }: WithCacheOptions<Parameters>,
    ) => {
        return async (...parameters: Parameters): Promise<Result> => {
            const key = `${name}_${keyFn(parameters)}`;
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
