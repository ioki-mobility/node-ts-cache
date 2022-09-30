import { Cache, CacheContainer } from "../src"
import { MemoryStorage } from "../../storage-memory/src"
import { NodeFsStorage } from "../../storage-node-fs/src"
import { IoRedisStorage } from "../../storage-ioredis/src"
import fs from "fs"
import type { default as IORedis } from "ioredis"
const IoRedisMock: typeof IORedis = require('ioredis-mock')

const fsCacheFile = "user-cache-decorator.json"

const caches = [
    new CacheContainer(new MemoryStorage()),
    new CacheContainer(new NodeFsStorage(fsCacheFile)),
    new CacheContainer(new IoRedisStorage(new IoRedisMock()))
]

const data = ["user", "max", "test"]

caches.forEach((c) => testForCache(c))

function testForCache(cache: CacheContainer) {
    class TestClass1 {
        @Cache(cache, { ttl: 1 })
        public getUsers(): string[] {
            return data
        }

        @Cache(cache, { ttl: 1 })
        public getUsersPromise(): Promise<string[]> {
            return Promise.resolve(data)
        }
    }

    class TestClass2 {
        @Cache(cache, { ttl: 1 })
        public async getUsers(): Promise<string[]> {
            return new Promise<string[]>((resolve) => {
                setTimeout(() => resolve(data), 200)
            })
        }
    }

    class TestClass3 {
        @Cache(cache, { ttl: 1, calculateKey: (data) => data.methodName })
        public getUsers(): string[] {
            return data
        }

        @Cache(cache, { ttl: 1, calculateKey: (data) => data.methodName })
        public getUsersPromise(): Promise<string[]> {
            return Promise.resolve(data)
        }
    }

    class TestClass4 {
        @Cache(cache, { ttl: 1, calculateKey: (data) => data.methodName })
        public getUsersPromise(): Promise<string[]> {
            return Promise.resolve(data)
        }
    }

    class TestClass5 {
        @Cache(cache, { ttl: 10 })
        // @ts-ignore
        public async getUser(name: string) {
            if (name == "name1") {
                return { name: "LONGGTEXTTTTTTTTTT" }
            } else if (name == "name2") {
                return undefined
            }
        }
    }

    describe(`CacheDecorator ${(cache as any).storage.constructor.name
        }`, () => {
            beforeEach(async () => {
                await cache.clear()
            })

            afterEach(async () => {
                try {
                    await fs.unlinkSync(fsCacheFile)
                } catch (e) { }
            })

            it("Should decorate function with ExpirationStrategy", async () => {
                const myClass = new TestClass1()
                await myClass.getUsersPromise()
            })

            it("Should cache function call", async () => {
                const myClass = new TestClass1()

                const users = await myClass.getUsers()

                expect(data).toStrictEqual(users)
                expect(
                    (await cache.getItem<string[]>("TestClass1:getUsers:[]"))?.content
                ).toStrictEqual(data)
            })

            it("Should cache Promise response", async () => {
                const myClass = new TestClass1()

                const response = await myClass.getUsersPromise()

                expect(data).toStrictEqual(response)
                expect(
                    (await cache.getItem<string[]>("TestClass1:getUsersPromise:[]"))?.content
                ).toStrictEqual(data)
            })

            it("Should cache async response", async () => {
                const myClass = new TestClass2()

                const users = await myClass.getUsers()
                expect(data).toStrictEqual(users)
                expect(
                    (await cache.getItem<string[]>("TestClass2:getUsers:[]"))?.content
                ).toStrictEqual(data)
            })

            it("Should cache function call (custom key strategy)", async () => {
                const myClass = new TestClass3()

                const users = await myClass.getUsers()

                expect(data).toStrictEqual(users)
                expect((await cache.getItem<string[]>("getUsers"))?.content).toStrictEqual(
                    data
                )
            })

            it("Should cache Promise response (custom key strategy)", async () => {
                const myClass = new TestClass3()

                const response = await myClass.getUsersPromise()

                expect(data).toStrictEqual(response)
                expect(
                   (await cache.getItem<string[]>("getUsersPromise"))?.content
                ).toStrictEqual(data)
            })

            it("Should cache users with async custom key strategy", async () => {
                const myClass = new TestClass4()

                await myClass.getUsersPromise().then(async (response) => {
                    expect(data).toStrictEqual(response)
                    expect(
                        (await cache.getItem<string[]>("getUsersPromise"))?.content
                    ).toStrictEqual(data)
                })
            })

            it("#27 should cache string parameter and value", async () => {
                const myClass = new TestClass5()

                const response1 = await myClass.getUser("name1")
                const response2 = await myClass.getUser("name2")
                const response3 = await myClass.getUser("namex")

                expect({ name: "LONGGTEXTTTTTTTTTT" }).toStrictEqual(response1)
                expect(undefined).toStrictEqual(response2)
                expect(undefined).toStrictEqual(response3)
            })

            it("#27 test parallel access", async () => {
                const myClass = new TestClass5()

                const [response1, response2, response3] = await Promise.all([
                    myClass.getUser("name1"),
                    myClass.getUser("name2"),
                    myClass.getUser("namexxx")
                ])

                expect({ name: "LONGGTEXTTTTTTTTTT" }).toStrictEqual(response1)
                expect(undefined).toStrictEqual(response2)
                expect(undefined).toStrictEqual(response3)
            })
        })
}
