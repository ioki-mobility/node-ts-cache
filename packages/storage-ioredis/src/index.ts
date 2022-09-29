import type { Redis } from "ioredis"
import type { CachedItem, IStorage } from "node-ts-cache"
import superjson from "superjson"

export class IoRedisStorage implements IStorage {
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

    async setItem(key: string, content: CachedItem | undefined): Promise<void> {
        if (content === undefined) {
            await this.ioRedisInstance.del(key)
            return
        }

        if (content.meta.isLazy) {
            await this.ioRedisInstance.set(key, superjson.stringify(content))
            return;
        }
        await this.ioRedisInstance.set(key, superjson.stringify(content), 'PX', content.meta.ttl)
    }
}
