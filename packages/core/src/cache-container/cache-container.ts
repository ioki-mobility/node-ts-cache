import Debug from "debug"
import type { Storage } from "../storage"
import type { CachedItem, CachingOptions } from "./cache-container-types"

const debug = Debug("node-ts-cache")

const DEFAULT_TTL_SECONDS = 60

export class CacheContainer {
    constructor(private storage: Storage) { }

    public async getItem<T>(key: string): Promise<{ content: T, meta: { expired: boolean, createdAt: number } } | undefined> {
        const item = await this.storage.getItem(key)

        if (!item) return;

        const result = {
            content: item.content,
            meta: {
                createdAt: item.meta.createdAt,
                expired: this.isItemExpired(item)
            }
        }

        if (result.meta.expired)
            await this.unsetKey(key);

        if (result.meta.expired && !item.meta.isLazy)
            return undefined;

        return result;
    }

    public async setItem(
        key: string,
        content: any,
        options?: Partial<CachingOptions>
    ): Promise<void> {
        const finalOptions = {
            ttl: DEFAULT_TTL_SECONDS,
            isLazy: true,
            isCachedForever: false,
            ...options
        }

        const meta: CachedItem<typeof content>["meta"] = {
            createdAt: Date.now(),
            isLazy: finalOptions.isLazy,
            ttl: finalOptions.isCachedForever ? null : finalOptions.ttl * 1000
        }

        await this.storage.setItem(key, { meta, content })
    }

    public async clear(): Promise<void> {
        await this.storage.clear()

        debug("Cleared cache")
    }

    private isItemExpired(item: CachedItem): boolean {
        if (item.meta.ttl === null) return false;
        return Date.now() > item.meta.createdAt + item.meta.ttl
    }

    public async unsetKey(key: string): Promise<void> {
        await this.storage.removeItem(key)
    }
}
