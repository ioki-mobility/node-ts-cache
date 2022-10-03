import type { CachedItem } from "../cache-container";

export interface Storage {
  getItem(key: string): Promise<CachedItem | undefined>;

  setItem(key: string, content: CachedItem): Promise<void>;

  removeItem(key: string): Promise<void>;

  clear(): Promise<void>;
}
