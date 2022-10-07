# node-ts-cache-storage-ioredis

IoRedis storage module for [node-ts-cache](https://www.npmjs.com/package/node-ts-cache).

An IoRedis instance must be created and passed to the library.
See https://github.com/luin/ioredis#connect-to-redis for available options.

```bash
yarn add @ioki/node-ts-cache @ioki/node-ts-cache-storage-ioredis ioredis
```

```ts
import { Cache, CacheContainer } from "@ioki/node-ts-cache"
import { IoRedisStorage } from "@ioki/node-ts-cache-storage-ioredis"
import IoRedis from "ioredis"

const ioRedisInstance = new IoRedis({
    port: 6379, // Redis port
    host: "127.0.0.1", // Redis host
    family: 4, // 4 (IPv4) or 6 (IPv6)
    password: "auth",
    db: 0
})
const userCache = new CacheContainer(new IoRedisStorage(ioRedisInstance))

class MyService {
    @Cache(userCache, { ttl: 60 })
    public async getUsers(): Promise<string[]> {
        return ["Max", "User"]
    }
}
```
