import fs from "fs";
import path from "path";
import { NodeFsStorage } from ".";
import { storageTestFactory } from "../../core/src/storage/storageTestFactory";
import { decoratorTestFactory } from "../../core/src/decorator/decoratorTestFactory";

describe("node-fs-storage", () => {
  const cacheFile = path.join(__dirname, "cache-test.json");
  const storage = new NodeFsStorage(cacheFile);

  afterAll(() => {
    fs.unlinkSync(cacheFile);
  });

  it("Should create file on storage construction", () => {
    const testPath = path.join(__dirname, "cache-test-construct.json");
    const storage = new NodeFsStorage(testPath);

    storage.clear();

    fs.readFileSync(testPath);
    fs.unlinkSync(testPath);
  });

  it("Should be empty cache file on storage construction", () => {
    const testPath = path.join(__dirname, "cache-test-construct-empty.json");
    const storage = new NodeFsStorage(testPath);

    storage.clear();

    const cache = fs.readFileSync(testPath).toString();

    expect(cache).toMatchInlineSnapshot(`"{"json":{}}"`);

    fs.unlinkSync(testPath);
  });

  storageTestFactory(storage);
  decoratorTestFactory(storage);
});
