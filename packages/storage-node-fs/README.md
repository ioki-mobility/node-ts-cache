# node-ts-cache-storage-node-fs

Node.js file system storage module for [node-ts-cache](https://www.npmjs.com/package/boredland/node-ts-cache).

```bash
yarn add boredland/node-ts-cache boredland/node-ts-cache-storage-node-fs
```

```ts
import { Cache, CacheContainer } from "@boredland/node-ts-cache"
import { NodeFsStorage } from "@boredland/node-ts-cache-storage-node-fs"

const userCache = new CacheContainer(new NodeFsStorage())

class MyService {
    @Cache(userCache, { ttl: 60 })
    public async getUsers(): Promise<string[]> {
        return ["Max", "User"]
    }
}
```
