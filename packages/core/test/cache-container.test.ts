import { MemoryStorage } from "../../storage-memory/src"
import { CacheContainer } from "../src"

interface ITestType {
    user: {
        name: string
    }
}

const data: ITestType = {
    user: { name: "test" }
}

describe("CacheContainer", () => {
    it("Should set cache item correctly with isLazy", async () => {
        const cache = new CacheContainer(new MemoryStorage())

        await cache.setItem("test", data, { ttl: 10 })
        const entry = await cache.getItem<ITestType>("test")

        expect(entry?.content).toStrictEqual(data)
    })

    it("Should return item if cache expires instantly with isLazy", async () => {
        const cache = new CacheContainer(new MemoryStorage())

        await cache.setItem("test", data, { ttl: -1, isLazy: true })
        const entry = await cache.getItem<ITestType>("test")
        expect(entry?.content).toStrictEqual(data)
    })

    it("Should item if cache expired with isLazy", async () => {
        const cache = new CacheContainer(new MemoryStorage())

        await cache.setItem("test", data, { ttl: 1, isLazy: true })
        await wait(2000)
        const entry = await cache.getItem<ITestType>("test")
        expect(entry?.content).toStrictEqual(data)

        const entryAgain = await cache.getItem<ITestType>("test")
        expect(entryAgain?.content).toStrictEqual(undefined)
    })

    it("Should not find cache item after ttl with isLazy disabled", async () => {
        const cache = new CacheContainer(new MemoryStorage())

        await cache.setItem("test", data, { ttl: 0.001, isLazy: false })
        await wait(10)

        const entry = await cache.getItem<ITestType>("test")
        expect(entry).toStrictEqual(undefined)
    })

    it("Should ignore isLazy and ttl options if isCachedForever option is provided and cache forever", async () => {
        const cache = new CacheContainer(new MemoryStorage())

        await cache.setItem("test", data, {
            ttl: 0,
            isLazy: false,
            isCachedForever: true
        })
        await wait(10)

        const entry = await cache.getItem<ITestType>("test")
        expect(entry?.content).toStrictEqual(data)
    })
})

function wait(ms: number): Promise<void> {
    return new Promise<void>((resolve) => {
        setTimeout(() => {
            resolve()
        }, ms)
    })
}
