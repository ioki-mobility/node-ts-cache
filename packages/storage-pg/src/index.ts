import type { CachedItem, Storage } from "@boredland/node-ts-cache";

export class PgStorage implements Storage {
  constructor(
    private tableName: string,
    private rawQuery: (
      query: string
    ) => Promise<{ key: string; value: CachedItem }[] | undefined>
  ) {}

  async clear(): Promise<void> {
    await this.rawQuery(`TRUNCATE TABLE ${this.tableName};`);
  }

  async getItem(key: string): Promise<CachedItem | undefined> {
    const result = await this.rawQuery(
      `SELECT key, value FROM ${this.tableName} WHERE key = '${key}'`
    );

    if (!result || result.length === 0) return undefined;

    return { ...result[0].value };
  }

  async setItem(key: string, value: CachedItem): Promise<void> {
    await this.rawQuery(
      `INSERT INTO ${
        this.tableName
      } (key, value) VALUES ('${key}', '${JSON.stringify(
        value
      )}') ON CONFLICT (key) DO UPDATE SET value = '${JSON.stringify(value)}'`
    );
  }

  async removeItem(key: string): Promise<void> {
    await this.rawQuery(`DELETE FROM ${this.tableName} WHERE key = '${key}'`);
  }
}
