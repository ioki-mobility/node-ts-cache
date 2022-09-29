import type { CachedItem } from "../cache-container"

export interface IStorage {
    getItem(key: string): Promise<CachedItem | undefined>

    setItem(key: string, content: CachedItem | undefined): Promise<void>

    clear(): Promise<void>
}
