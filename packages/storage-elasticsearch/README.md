# node-ts-cache-storage-elasticsearch

ElasticSearch storage module for [node-ts-cache](https://www.npmjs.com/package/node-ts-cache).

This module expects you to bring your own instance of ElasticSearch.

```bash
yarn add @ioki/node-ts-cache @ioki/node-ts-cache-storage-elasticsearch
```

```ts
import { ElasticSearchStorage } from "@ioki/node-ts-cache-storage-elasticsearch"
import { Cache, CacheContainer } from "@ioki/node-ts-cache"
import { Client } from "@elastic/elasticsearch";

const client = new Client({
    node: "http://localhost:9200",
    Connection: mock.getConnection(),
});

const storage = new ElasticSearchStorage(indexName, client);

const userCache = new CacheContainer(storage)

class MyService {
    @Cache(userCache, { ttl: 60 })
    public async getUsers(): Promise<string[]> {
        return ["Max", "User"]
    }
}
```
