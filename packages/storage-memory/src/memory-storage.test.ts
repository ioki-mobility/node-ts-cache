import { Cache, CacheContainer } from "@boredland/node-ts-cache"
import { MemoryStorage } from "."

const meta = { createdAt: 1234, ttl: 1000, isLazy: true }
describe("MemoryStorage", () => {
    it("Should add cache item correctly", async () => {
        const storage = new MemoryStorage()
        const content = { data: { name: "deep" } }
        const key = "test"

        await storage.setItem(key, { content, meta })

        const result = await storage.getItem(key)
        expect(result?.content).toBe(content)
    })

    it("Should work with a simple string", async () => {
        const storage = new MemoryStorage()
        const content = "mystring123"
        const key = "key1"

        await storage.setItem(key, { content, meta })

        const result = await storage.getItem(key)
        expect(result?.content).toStrictEqual(content)
    })

    it("Should work with multiple entries", async () => {
        const storage = new MemoryStorage()

        await storage.setItem("k1", { content: "c1", meta })
        await storage.setItem("k2", { content: "c2", meta })

        const k1 = await storage.getItem("k1")
        const k2 = await storage.getItem("k2")
        expect(k1?.content).toStrictEqual("c1")
        expect(k2?.content).toStrictEqual("c2")
    })

    it("Should work with decorator", async () => {
        const origData = ["user-123"]

        class TestClass {
            @Cache(new CacheContainer(new MemoryStorage()), {})
            async getUsers() {
                return origData
            }
        }

        const instance = new TestClass()
        const users = await instance.getUsers()

        expect(origData).toStrictEqual(users)
    })
})
