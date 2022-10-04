import type { Client } from "@elastic/elasticsearch";
import type { CachedItem, Storage } from "@boredland/node-ts-cache";
import type { GetResponse } from "@elastic/elasticsearch/lib/api/types";

export class ElasticSearchStorage implements Storage {
  /**
   * @param indexName - name of the elasticsearch index
   * @param elasticsearchInstance - instance of an elasticsearch client
   */
  constructor(
    private indexName: string,
    private elasticsearchInstance: Client
  ) {}

  async clear(): Promise<void> {
    try {
      await this.elasticsearchInstance.indices.delete({
        index: this.indexName,
        ignore_unavailable: true,
      });
    } catch (e) {
      return;
    }
  }

  async removeItem(key: string): Promise<void> {
    await this.elasticsearchInstance.delete({
      index: this.indexName,
      id: encodeURIComponent(key),
      refresh: "wait_for",
    });
  }

  async getItem(key: string): Promise<CachedItem | undefined> {
    let item: GetResponse<CachedItem | undefined>;

    try {
      item = await this.elasticsearchInstance.get<CachedItem>({
        index: this.indexName,
        id: encodeURIComponent(key),
      });
    } catch (e) {
      return undefined;
    }

    if (!item.found) return undefined;
    return item._source;
  }

  async setItem(key: string, content: CachedItem): Promise<void> {
    await this.elasticsearchInstance.index({
      index: this.indexName,
      id: encodeURIComponent(key),
      refresh: "wait_for",
      body: content,
    });
  }
}
