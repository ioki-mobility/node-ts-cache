import { Cache, CacheContainer, Storage } from ".."



const spy = jest.fn()
const data = ["user", "max", "test"]

const sleep = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

export const decoratorTestFactory = (storage: Storage) => {
    const cache = new CacheContainer(storage)

    describe(`CacheDecorator`, () => {

        beforeEach(() => {
            spy.mockReset()
        })

        class TestClass1 {
            @Cache(cache, { ttl: 0.5, isLazy: false })
            public getUsersPromise(): Promise<string[]> {
                spy();
                return Promise.resolve(data)
            }

            @Cache(cache, { ttl: 0.5, isLazy: false })
            public async getUsersAsync(): Promise<string[]> {
                spy();
                return Promise.resolve(data)
            }

            @Cache(cache, { ttl: 0.5, isLazy: true })
            public getUsersPromiseLazy(): Promise<string[]> {
                spy();
                return Promise.resolve(data)
            }

            @Cache(cache, { ttl: 0.5, isLazy: true })
            public getUsers(): string[] {
                spy();
                return data
            }
        }

        class TestClass3 {
            @Cache(cache, { ttl: 1, calculateKey: (data) => data.methodName })
            public getUsers(): string[] {
                spy();
                return data
            }

            @Cache(cache, { ttl: 1, calculateKey: (data) => data.methodName })
            public getUsersPromise(): Promise<string[]> {
                spy();
                return Promise.resolve(data)
            }
        }

        class TestClass4 {
            @Cache(cache, { ttl: 1, calculateKey: (data) => data.methodName })
            public getUsersPromise(): Promise<string[]> {
                spy();
                return Promise.resolve(data)
            }
        }

        class TestClass5 {
            @Cache(cache, { ttl: 10 })
            public async getUser(name: string) {
                spy();
                if (name == "name1") {
                    return { name: "LONGGTEXTTTTTTTTTT" }
                }
                return undefined
            }
        }

        it("should decorate function with ExpirationStrategy", async () => {
            const myClass = new TestClass1()
            await myClass.getUsersPromise()
        })

        it("should cache Promise response", async () => {
            const myClass = new TestClass1()

            const response = await myClass.getUsersPromise()

            expect(response).toStrictEqual(data)
            expect(spy).toHaveBeenCalledTimes(1)

            const fromCache = await cache.getItem<string[]>("TestClass1:getUsersPromise:[]")
            expect(fromCache?.content).toStrictEqual(data)
        })

        it("should cache async fn response", async () => {
            const myClass = new TestClass1()

            const response = await myClass.getUsersAsync()

            expect(response).toStrictEqual(data)
            expect(spy).toHaveBeenCalledTimes(1)

            const fromCache = await cache.getItem<string[]>("TestClass1:getUsersAsync:[]")
            expect(fromCache?.content).toStrictEqual(data)
        })

        it("should cache sync fn response", async () => {
            const myClass = new TestClass1()

            const response = await myClass.getUsers()

            expect(response).toStrictEqual(data)
            expect(spy).toHaveBeenCalledTimes(1)
        })

        it("should use cache for Promise response", async () => {
            const myClass = new TestClass1()

            const response = await myClass.getUsersPromise()

            expect(response).toStrictEqual(data)
            expect(spy).toHaveBeenCalledTimes(1)

            const responseFromCache = await myClass.getUsersPromise()
            expect(responseFromCache).toStrictEqual(data)
            expect(spy).toHaveBeenCalledTimes(1)
        })

        it("should expire cache", async () => {
            const myClass = new TestClass1()

            const response = await myClass.getUsersPromise()
            expect(response).toStrictEqual(data)
            expect(spy).toHaveBeenCalledTimes(1)

            const fromCache1 = await myClass.getUsersPromise()
            expect(fromCache1).toStrictEqual(data)
            expect(spy).toHaveBeenCalledTimes(1)

            await sleep(750);
            const fromCache2 = await myClass.getUsersPromise()
            expect(fromCache2).toStrictEqual(data)
            expect(spy).toHaveBeenCalledTimes(2)
        })

        it("should expire cache lazy", async () => {
            const myClass = new TestClass1()

            const response = await myClass.getUsersPromiseLazy()
            expect(response).toStrictEqual(data)
            expect(spy).toHaveBeenCalledTimes(1)

            const fromCache1 = await myClass.getUsersPromiseLazy()
            expect(fromCache1).toStrictEqual(data)
            expect(spy).toHaveBeenCalledTimes(1)

            await sleep(750);
            const fromCache2 = await myClass.getUsersPromiseLazy()
            expect(fromCache2).toStrictEqual(data)
            expect(spy).toHaveBeenCalledTimes(1)

            const fromCache3 = await myClass.getUsersPromiseLazy()
            expect(fromCache3).toStrictEqual(data)
            expect(spy).toHaveBeenCalledTimes(2)
        })

        it("should cache Promise response (custom key strategy)", async () => {
            const myClass = new TestClass3()

            const response = await myClass.getUsersPromise()

            expect(response).toStrictEqual(data)
            const fromCache = await cache.getItem<string[]>("getUsersPromise")
            expect(fromCache?.content).toStrictEqual(data)
        })

        it("should cache users with async custom key strategy", async () => {
            const myClass = new TestClass4()

            const response = await myClass.getUsersPromise()

            expect(response).toStrictEqual(data)
            const fromCache = await cache.getItem<string[]>("getUsersPromise")
            expect(fromCache?.content).toStrictEqual(data)
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
