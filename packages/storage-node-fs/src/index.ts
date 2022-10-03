import fs from "fs"
import type { CachedItem, Storage } from "@boredland/node-ts-cache"
import superjson from "superjson"

export class NodeFsStorage implements Storage {
    constructor(public jsonFilePath: string) {
        let exists: boolean = false;
        fs.open(jsonFilePath, 'r', function (error) {
            exists = !!error;
        });
        if (!exists) {
            this.createEmptyCache()
        }
    }

    public async getItem(key: string): Promise<CachedItem | undefined> {
        return (await this.getCacheObject())[key]
    }

    public async setItem(key: string, content: CachedItem): Promise<void> {
        const cache = await this.getCacheObject()

        cache[key] = content

        await this.setCache(cache)
    }

    public async removeItem(key: string): Promise<void> {
        const cache = await this.getCacheObject()
        cache[key] = undefined
        await this.setCache(cache)
    }

    public async clear(): Promise<void> {
        await this.createEmptyCache()
    }

    private createEmptyCache(): void {
        fs.writeFileSync(this.jsonFilePath, superjson.stringify({}))
    }

    private async setCache(newCache: any): Promise<void> {
        await fs.promises.writeFile(this.jsonFilePath, superjson.stringify(newCache))
    }

    private async getCacheObject(): Promise<any> {
        return superjson.parse(
            (await fs.promises.readFile(this.jsonFilePath)).toString()
        )
    }
}
