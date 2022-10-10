import type { CachedItem, Storage } from "@ioki/node-ts-cache";

export class PgStorage implements Storage {
  /**
   * @param tableName - table to store the cache in (have to be provisioned outside of thie module)
   * @param rawQuery - method that return the result of a query as an array: `{ key: string, value: CachedItem }[]`
   */
  constructor(
    private tableName: string,
    private rawQuery: (
      query: string,
      values: unknown[]
    ) => Promise<{ key: string; value: CachedItem }[] | undefined>
  ) {}

  async clear(): Promise<void> {
    await this.rawQuery(`TRUNCATE TABLE ${this.tableName}`, []);
  }

  async getItem(key: string): Promise<CachedItem | undefined> {
    const result = await this.rawQuery(
      `SELECT key, value FROM ${this.tableName} WHERE key = ?`,
      [key]
    );

    if (!result || result.length === 0) return undefined;

    return { ...result[0].value };
  }

  async setItem(key: string, value: CachedItem): Promise<void> {
    const valueJson = JSON.stringify(value);
    await this.rawQuery(
      `INSERT INTO ${this.tableName} (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = ?`,
      [key, valueJson, valueJson]
    );
  }

  async removeItem(key: string): Promise<void> {
    await this.rawQuery(`DELETE FROM ${this.tableName} WHERE key = ?`, [key]);
  }
}
