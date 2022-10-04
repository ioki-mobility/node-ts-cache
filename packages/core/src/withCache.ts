import type { CacheContainer, CachingOptions } from "./cacheContainer";

type WithCacheOptions<Parameters> = Partial<
  Omit<CachingOptions, "calculateKey">
> & {
  /** an optional prefix to prepend to the key */
  prefix?: string;
  /** an optional function to calculate a key based on the parameters of the wrapped function */
  calculateKey?: (input: Parameters) => string;
  /** an optional function that is called when a lazy item has expired and thus got removed  */
  afterExpired?: () => Promise<void>;
};

/**
 * wrapped function factory
 * @param container - cache container to create the fn for
 * @returns wrapping function
 */
export const withCacheFactory = (container: CacheContainer) => {
  /**
   * function wrapper
   * @param operation - the function to be wrapped
   * @param options - caching options
   * @returns wrapped operation
   */
  const withCache = <
    Parameters extends Array<unknown>,
    Result extends Promise<unknown>
  >(
    operation: (...parameters: Parameters) => Result,
    options: WithCacheOptions<Parameters> = {}
  ) => {
    return async (...parameters: Parameters): Promise<Result> => {
      const { calculateKey, ...rest } = options;
      const prefix = options.prefix ?? "default";
      const key = `${operation.name}:${prefix}:${
        calculateKey ? calculateKey(parameters) : JSON.stringify(parameters)
      }`;
      const cachedResponse = await container.getItem<Awaited<Result>>(key);

      if (cachedResponse) {
        if (cachedResponse.meta.expired && options.afterExpired) {
          await options.afterExpired();
        }
        return cachedResponse.content;
      }

      const result = await operation(...parameters);
      await container.setItem(key, result, rest);
      return result;
    };
  };
  return withCache;
};
