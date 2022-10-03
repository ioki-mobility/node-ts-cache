import { Cache, CacheContainer, Storage, withCacheFactory } from "..";

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const testingFunctionSpy = jest.fn();
const testingFunction = async ({ a, b }: { a: string; b: number }) => {
  testingFunctionSpy();
  return `${a}-${b}`;
};

const getUserFromBackend = jest
  .fn<{ username: string; level: number }, unknown[]>()
  .mockReturnValueOnce({ username: "max", level: 13 })
  .mockReturnValueOnce({ username: "user-two", level: 34 })
  .mockReturnValueOnce({ username: "user-three", level: 127 });

export const storageTestFactory = (storage: Storage) => {
  const cache = new CacheContainer(storage);

  beforeEach(async () => {
    await cache.clear();
    getUserFromBackend.mockReset();
    testingFunctionSpy.mockReset();
  });

  describe("direct usage", () => {
    it("should initialize the pg storage correctly", () => {
      expect(cache).not.toBeNull();
      expect(cache).not.toBeUndefined();
    });

    it("should add and retrieve string values from the pg storage", async () => {
      await cache.setItem("k1", "test1");
      const k1 = await cache.getItem("k1");
      expect(k1?.content).toBe("test1");

      await cache.setItem("k2", "test2");
      const k2 = await cache.getItem("k2");
      expect(k2?.content).toBe("test2");
    });

    it("should add and retrieve nested values from the pg storage", async () => {
      const v1 = { data: { name: "deep1" } };
      await cache.setItem("k1", v1);
      const k1 = await cache.getItem("k1");
      expect(k1?.content).toEqual(v1);

      const v2 = { data: { name: "deep2" } };
      await cache.setItem("k2", v2);
      const k2 = await cache.getItem("k2");
      expect(k2?.content).toEqual(v2);
    });

    it("should clear", async () => {
      await cache.setItem("k1", "test1");
      const k1 = await cache.getItem("k1");
      expect(k1?.content).toBe("test1");

      await cache.clear();

      const k1_clear = await cache.getItem("k1");
      expect(k1_clear).toBeUndefined();
    });

    it("should overwrite", async () => {
      await cache.setItem("k1", "test1");
      const k1 = await cache.getItem("k1");
      expect(k1?.content).toBe("test1");

      await cache.setItem("k1", "test2");
      const k1_next = await cache.getItem("k1");
      expect(k1_next?.content).toBe("test2");
    });

    it("should set to undefined", async () => {
      await cache.setItem("k1", "test1");
      const k1 = await cache.getItem("k1");
      expect(k1?.content).toBe("test1");

      await cache.setItem("k1", undefined);
      const k1_next = await cache.getItem("k1");
      expect(k1_next?.content).toBeUndefined();
      expect(k1_next?.meta).not.toBeUndefined();
    });

    it("should remove key", async () => {
      await cache.setItem("k1", "test1");
      const k1 = await cache.getItem("k1");
      expect(k1?.content).toBe("test1");

      await cache.unsetKey("k1");
      const k1_next = await cache.getItem("k1");
      expect(k1_next).toBeUndefined();
    });
  });

  describe("expiration", () => {
    it("Should return undefined if set item is expired and not lazy", async () => {
      const raw = {
        username: "max123",
      };

      await cache.setItem("user", raw, { ttl: 0.1, isLazy: false });

      await sleep(200);

      const data = await cache.getItem("user");

      expect(data?.content).toStrictEqual(undefined);
    });

    it("should call afterExpired when a lazy item got removed on a wrapped function", async () => {
      const afterExpired = jest.fn();
      const wrappedFn = withCacheFactory(cache)(testingFunction, {
        isLazy: true,
        afterExpired,
        ttl: 1,
      });

      const result = await wrappedFn({ a: "wrapped-hello", b: 555 });
      expect(result).toMatchInlineSnapshot(`"wrapped-hello-555"`);
      expect(testingFunctionSpy).toHaveBeenCalledTimes(1);
      expect(afterExpired).toHaveBeenCalledTimes(0);

      await sleep(2000);

      const resultDiff = await wrappedFn({ a: "wrapped-hello", b: 555 });
      expect(resultDiff).toMatchInlineSnapshot(`"wrapped-hello-555"`);
      expect(testingFunctionSpy).toHaveBeenCalledTimes(1);
      expect(afterExpired).toHaveBeenCalledTimes(1);
    });
  });

  describe("wrapped functions", () => {
    it("should return the correct value when wrapped", async () => {
      const wrappedFn = withCacheFactory(cache)(testingFunction);

      const result = await wrappedFn({ a: "wrapped-hello", b: 555 });
      expect(result).toMatchInlineSnapshot(`"wrapped-hello-555"`);
      expect(testingFunctionSpy).toHaveBeenCalledTimes(1);

      const resultDiff = await wrappedFn({ a: "wrapped-hello", b: 556 });
      expect(resultDiff).toMatchInlineSnapshot(`"wrapped-hello-556"`);
      expect(testingFunctionSpy).toHaveBeenCalledTimes(2);

      const resultRepeat = await wrappedFn({ a: "wrapped-hello", b: 555 });
      expect(resultRepeat).toMatchInlineSnapshot(`"wrapped-hello-555"`);
      // the function has not been called another time
      expect(testingFunctionSpy).toHaveBeenCalledTimes(2);
    });

    it("should store using a custom calculateKey function and prefix", async () => {
      const wrappedFn = withCacheFactory(cache)(testingFunction, {
        calculateKey: () => "test",
        prefix: "great",
      });

      const result = await wrappedFn({ a: "wrapped-hello", b: 555 });
      expect(result).toMatchInlineSnapshot(`"wrapped-hello-555"`);
      const data = await cache.getItem("testingFunction:great:test");
      expect(data?.content).toMatchInlineSnapshot(`"wrapped-hello-555"`);
    });
  });

  it("should correctly enqueue simultaneous calls", async () => {
    const data = ["user", "max", "test"];
    class TestClass {
      @Cache(cache, { ttl: 2 })
      public async getUsers() {
        return await this.expensiveMethod();
      }

      public async expensiveMethod() {
        return new Promise((resolve) => setTimeout(() => resolve(data), 50));
      }
    }

    const myClass = new TestClass();

    const expensiveMethodSpy = jest.spyOn(myClass, "expensiveMethod");
    const storageGetSpy = jest.spyOn(cache, "getItem");
    const storageSetSpy = jest.spyOn(cache, "setItem");

    const responses = await Promise.all(
      Array.from({ length: 100 }, () => myClass.getUsers())
    );

    expect(storageSetSpy.mock.calls.length).toStrictEqual(1);
    expect(storageGetSpy.mock.calls.length).toStrictEqual(1);
    expect(expensiveMethodSpy.mock.calls.length).toStrictEqual(1);
    expect(responses).toStrictEqual(Array(100).fill(data));
  });

  describe("container policies", () => {
    type ITestType = {
      user: {
        name: string;
      };
    };
    const data: ITestType = {
      user: { name: "test" },
    };

    it("should set cache item correctly with isLazy", async () => {
      await cache.setItem("test", data, { ttl: 10 });
      const entry = await cache.getItem<ITestType>("test");

      expect(entry?.content).toStrictEqual(data);
    });

    it("should return item if cache expires instantly with isLazy", async () => {
      await cache.setItem("test", data, { ttl: -1, isLazy: true });
      const entry = await cache.getItem<ITestType>("test");
      expect(entry?.content).toStrictEqual(data);
    });

    it("should return item if cache expired with isLazy and remove it", async () => {
      await cache.setItem("test", data, { ttl: 0.5, isLazy: true });
      await sleep(750);
      const entry = await cache.getItem<ITestType>("test");
      expect(entry?.content).toStrictEqual(data);

      const entryAgain = await cache.getItem<ITestType>("test");
      expect(entryAgain?.content).toStrictEqual(undefined);
    });

    it("Should not find cache item after ttl with isLazy disabled", async () => {
      await cache.setItem("test", data, { ttl: 0.5, isLazy: false });
      await sleep(750);

      const entry = await cache.getItem<ITestType>("test");
      expect(entry).toStrictEqual(undefined);
    });

    it("Should ignore isLazy and ttl options if isCachedForever", async () => {
      await cache.setItem("test", data, {
        ttl: 0.5,
        isLazy: false,
        isCachedForever: true,
      });
      await sleep(750);

      const entry = await cache.getItem<ITestType>("test");
      expect(entry?.content).toStrictEqual(data);
    });
  });
};
