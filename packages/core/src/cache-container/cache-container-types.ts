export type CachedItem<T = any> = {
    content: T
    meta: {
        createdAt: number
        ttl: number
        isLazy: boolean
    }
}

export type CachingOptions = {
    /** (Default: 60) Number of seconds to expire the cachte item */
    ttl: number
    /** (Default: true) If true, expired cache entries will be deleted on touch. If false, entries will be deleted after the given ttl. */
    isLazy: boolean
    /** (Default: false) If true, cache entry has no expiration. */
    isCachedForever: boolean
    /** (Default: JSON.stringify combination of className, methodName and call args) */
    calculateKey: (data: {
        /** The class name for the method being decorated */
        className: string
        /** The method name being decorated */
        methodName: string
        /** The arguments passed to the method when called */
        args: any[]
    }) => string
};
