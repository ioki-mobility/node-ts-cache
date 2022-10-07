# node-ts-cache-storage-memory

In-Memory storage module for [node-ts-cache](https://www.npmjs.com/package/@ioki/node-ts-cache).

```bash
yarn add @ioki/node-ts-cache
yarn add @ioki/node-ts-cache-storage-memory
```

```ts
import { Cache, CacheContainer } from "@ioki/node-ts-cache"
import { MemoryStorage } from "@ioki/node-ts-cache-storage-memory"

const userCache = new CacheContainer(new MemoryStorage())

class MyService {
    @Cache(userCache, { ttl: 60 })
    public async getUsers(): Promise<string[]> {
        return ["Max", "User"]
    }
}
```
