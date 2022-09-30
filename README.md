# @boredland/node-ts-cache

[![CI](https://github.com/boredland/node-ts-cache/actions/workflows/ci.yml/badge.svg)](https://github.com/boredland/node-ts-cache/actions/workflows/ci.yml)
[![The MIT License](https://img.shields.io/npm/l/node-ts-cache.svg)](http://opensource.org/licenses/MIT)

Simple and extensible caching module supporting decorators.

## Install

```bash
yarn add @boredland/node-ts-cache
```

_Note: The underlying storage layer must be installed separately._

## Storage

| Storage                                                               | Install                                         |
|-----------------------------------------------------------------------|-------------------------------------------------|
| [memory](https://www.npmjs.com/package/boredland/node-ts-cache-storage-memory)| ```yarn add @boredland/node-ts-cache-storage-memory```|
| [node-fs](https://www.npmjs.com/package/boredland/node-ts-cache-storage-node-fs)| ```yarn add @boredland/node-ts-cache-storage-node-fs```|
| [ioredis](https://www.npmjs.com/package/boredland/node-ts-cache-storage-ioredis)| ```yarn add @boredland/node-ts-cache-storage-ioredis```|

## Usage

### withCacheFactory

Function wrapper factory for arbitrary functions. The cache key is caculated based on the parameters passed to the function.

```ts
import { withCacheFactory, CacheContainer } from '@boredland/node-ts-cache'
import { MemoryStorage } from '@boredland/node-ts-cache-storage-memory'

const doThingsCache = new CacheContainer(new MemoryStorage())

const someFn = (input: { a: string, b: number })

const wrappedFn = withCacheFactory(doThingsCache)(someFn);

const result = someFn({ a: "lala", b: 123 })
```

### With decorator

Caches function response using the given options. By default, uses all arguments to build an unique key.

_Note: @Cache will consider the return type of the function. If the return type is a thenable, it will stay that way, otherwise not._

```ts
import { Cache, CacheContainer } from '@boredland/node-ts-cache'
import { MemoryStorage } from '@boredland/node-ts-cache-storage-memory'

const userCache = new CacheContainer(new MemoryStorage())

class MyService {
    @Cache(userCache, {ttl: 60})
    public async getUsers(): Promise<string[]> {
        return ["Max", "User"]
    }
}
```

### Direct usage

```ts
import { CacheContainer } from '@boredland/node-ts-cache'
import { MemoryStorage } from '@boredland/node-ts-cache-storage-memory'

const myCache = new CacheContainer(new MemoryStorage())

class MyService {
    public async getUsers(): Promise<string[]> {
        const cachedUsers = await myCache.getItem<string[]>("users")

        if (cachedUsers) {
            return cachedUsers
        }

        const newUsers = ["Max", "User"]

        await myCache.setItem("users", newUsers, {ttl: 60})

        return newUsers
    }
}
```

## Logging

This project uses [debug](https://github.com/visionmedia/debug) to log useful caching information.
Set environment variable **DEBUG=node-ts-cache** to enable logging.

## Development & Testing

This project follows the monorepo architecture using yarn workspaces.

To start development and run tests for all the packages, run:

```bash
cd node-ts-cache
yarn
yarn build
yarn test
```
