import type { CachedItem, Storage } from "@boredland/node-ts-cache"

export class MemoryStorage implements Storage {
    private memCache: Record<string, CachedItem> = {}

    public async getItem(key: string): Promise<CachedItem | undefined> {
        return this.memCache[key]
    }

    public async setItem(key: string, content: CachedItem): Promise<void> {
        this.memCache[key] = content
    }

    public async removeItem(key: string): Promise<void> {
        delete this.memCache[key]
    }

    public async clear(): Promise<void> {
        this.memCache = {}
    }
}
