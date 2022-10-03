import { ElasticSearchStorage } from ".";
import { storageTestFactory } from "../../core/src/storage/storageTestFactory";
import { decoratorTestFactory } from "../../core/src/decorator/decoratorTestFactory";
import { Client } from "@elastic/elasticsearch";
import Mock from "@elastic/elasticsearch-mock";
import type { CachedItem } from "@boredland/node-ts-cache";

const mock = new Mock();
const indexName = "123abcTest";

const lastItemFromPath = (path: string) =>
  decodeURIComponent(path.substring(path.lastIndexOf("/") + 1));

let memCache: Record<string, CachedItem> = {};

mock.add(
  {
    method: "GET",
    path: `/${indexName}/_doc/:id`,
  },
  (params) => {
    const key = lastItemFromPath(params.path as string);
    const item = memCache[key];
    return {
      _index: "my-index-000001",
      _id: "0",
      _version: 1,
      _seq_no: 0,
      _primary_term: 1,
      found: !!item,
      _source: item,
    };
  }
);

mock.add(
  {
    method: "PUT",
    path: `/${indexName}/_doc/:id`,
  },
  (params) => {
    const key = lastItemFromPath(params.path as string);
    memCache[key] = params.body as CachedItem;
    return "ok";
  }
);

mock.add(
  {
    method: "DELETE",
    path: `/${indexName}/_doc/:id`,
  },
  async (params) => {
    const key = lastItemFromPath(params.path as string);
    delete memCache[key];
    return "ok";
  }
);

mock.add(
  {
    method: "DELETE",
    path: `/${indexName}`,
  },
  async () => {
    memCache = {};
    return "ok";
  }
);

describe("elasticsearch-storage", () => {
  const client = new Client({
    node: "http://localhost:9200",
    Connection: mock.getConnection(),
  });
  const storage = new ElasticSearchStorage(indexName, client);

  storageTestFactory(storage);
  decoratorTestFactory(storage);
});
