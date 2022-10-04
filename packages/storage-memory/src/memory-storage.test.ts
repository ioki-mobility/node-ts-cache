import { MemoryStorage } from ".";
import { storageTestFactory } from "../../core/src/utils/storageTestFactory";
import { decoratorTestFactory } from "../../core/src/utils/decoratorTestFactory";

describe("memory-storage", () => {
  const storage = new MemoryStorage();
  storageTestFactory(storage);
  decoratorTestFactory(storage);
});
