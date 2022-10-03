import { MemoryStorage } from ".";
import { storageTestFactory } from "../../core/src/storage/storageTestFactory";
import { decoratorTestFactory } from "../../core/src/decorator/decoratorTestFactory";

describe("memory-storage", () => {
  const storage = new MemoryStorage();
  storageTestFactory(storage);
  decoratorTestFactory(storage);
});
