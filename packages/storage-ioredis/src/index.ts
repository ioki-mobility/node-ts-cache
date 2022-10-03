import type { Redis } from "ioredis"
import type { CachedItem, Storage } from "@boredland/node-ts-cache"
import superjson from "superjson"

export class IoRedisStorage implements Storage {
    constructor(private ioRedisInstance: Redis) { }

    async clear(): Promise<void> {
        await this.ioRedisInstance.flushdb()
    }

    async getItem(key: string): Promise<CachedItem | undefined> {
        const response = await this.ioRedisInstance.get(key)

        if (response === undefined || response === null || response === "") {
            return undefined
        }

        return superjson.parse(response);
    }

    async setItem(key: string, content: CachedItem): Promise<void> {
        if (content.meta.isLazy || !content.meta.ttl) {
            await this.ioRedisInstance.set(key, superjson.stringify(content))
            return;
        }
        await this.ioRedisInstance.set(key, superjson.stringify(content), 'PX', content.meta.ttl)
    }

    async removeItem(key: string): Promise<void> {
        await this.ioRedisInstance.unlink(key);
    }
}
