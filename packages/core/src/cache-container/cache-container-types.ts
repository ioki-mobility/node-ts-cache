export type CachedItem<T = any> = {
    content: T
    meta: {
        createdAt: number
        ttl: number
        isLazy: boolean
    }
}

export interface ICachingOptions {
    ttl: number
    isLazy: boolean
    isCachedForever: boolean
    calculateKey: (data: {
        className: string
        methodName: string
        args: any[]
    }) => string
}
