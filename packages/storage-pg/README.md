# node-ts-cache-storage-pg

Postgres storage module for [node-ts-cache](https://www.npmjs.com/package/node-ts-cache).

This module is driver-agnostic. It expects you to bring your own raw query method - something most of the postgres drivers will provide.

```bash
yarn add @ioki/node-ts-cache @ioki/node-ts-cache-storage-pg
```

In this example, node-postgres (pg) is being used.
You should to provide a table with the following columns:

```kv
* key: text
value: jsonb
```

The query function should return an array of objects: `{ key: string, value: CacheItem }[]`.

```ts
import { PgStorage } from "@ioki/node-ts-cache-storage-pg"
import { Cache, CacheContainer } from "@ioki/node-ts-cache"
import Client from "pg"

const client = new Client()

await client.connect()

const storage = new PgStorage(tableName, async (query) => (await new Client().query(query)).rows)

const userCache = new CacheContainer(storage)

class MyService {
    @Cache(userCache, { ttl: 60 })
    public async getUsers(): Promise<string[]> {
        return ["Max", "User"]
    }
}
```
