import type { default as IORedis } from "ioredis"
import { CacheContainer, withCacheFactory } from "@boredland/node-ts-cache"
import { IoRedisStorage } from "."
const IoRedisMock: typeof IORedis = require('ioredis-mock')

const testingFunctionSpy = jest.fn()
const testingFunction = async ({ a, b }: { a: string, b: number }) => {
    testingFunctionSpy()
    return `${a}-${b}`
}

describe("withCacheFactory", () => {
    const ioRedis = new IoRedisMock()
    const storage = new IoRedisStorage(ioRedis)
    const container = new CacheContainer(storage)

    beforeEach(async () => {
        await container.clear()
        testingFunctionSpy.mockReset()
    })

    it("should run our testing function correctly", async () => {
        const result = await testingFunction({ a: "hello", b: 123 })
        expect(result).toMatchInlineSnapshot(`"hello-123"`)
        expect(testingFunctionSpy).toHaveBeenCalledTimes(1)
    })

    it("return the correct value wrapped", async () => {
        const wrappedFn = withCacheFactory(container)(testingFunction, { prefix: 'testing-function' });
        
        const result = await wrappedFn({ a: "wrapped-hello", b: 555 })
        expect(result).toMatchInlineSnapshot(`"wrapped-hello-555"`)
        expect(testingFunctionSpy).toHaveBeenCalledTimes(1)

        const resultDiff = await wrappedFn({ a: "wrapped-hello", b: 556 })
        expect(resultDiff).toMatchInlineSnapshot(`"wrapped-hello-556"`)
        expect(testingFunctionSpy).toHaveBeenCalledTimes(2)

        const resultRepeat = await wrappedFn({ a: "wrapped-hello", b: 555 })
        expect(resultRepeat).toMatchInlineSnapshot(`"wrapped-hello-555"`)
        // the function has not been called another time
        expect(testingFunctionSpy).toHaveBeenCalledTimes(2)
    })
})
