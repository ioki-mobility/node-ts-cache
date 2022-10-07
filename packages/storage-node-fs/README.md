# node-ts-cache-storage-node-fs

Node.js file system storage module for [node-ts-cache](https://www.npmjs.com/package/@ioki/node-ts-cache).

```bash
yarn add @ioki/node-ts-cache @ioki/node-ts-cache-storage-node-fs
```

```ts
import { Cache, CacheContainer } from "@ioki/node-ts-cache"
import { NodeFsStorage } from "@ioki/node-ts-cache-storage-node-fs"

const userCache = new CacheContainer(new NodeFsStorage())

class MyService {
    @Cache(userCache, { ttl: 60 })
    public async getUsers(): Promise<string[]> {
        return ["Max", "User"]
    }
}
```
