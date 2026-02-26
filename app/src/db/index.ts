/**
 * Local database abstraction using AsyncStorage.
 *
 * This replaces WatermelonDB to allow running in Expo Go (no native modules).
 * Data is stored as JSON in AsyncStorage, keyed by table name.
 * The API surface matches what services/ expects.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { v4 as uuidv4 } from "uuid";

type Record = { id: string; [key: string]: any };

class Collection<T extends Record> {
  constructor(private tableName: string) {}

  private async getAll(): Promise<T[]> {
    const raw = await AsyncStorage.getItem(`@db_${this.tableName}`);
    return raw ? JSON.parse(raw) : [];
  }

  private async saveAll(records: T[]): Promise<void> {
    await AsyncStorage.setItem(
      `@db_${this.tableName}`,
      JSON.stringify(records)
    );
  }

  async query(filter?: (item: T) => boolean): Promise<T[]> {
    const all = await this.getAll();
    return filter ? all.filter(filter) : all;
  }

  async find(id: string): Promise<T | null> {
    const all = await this.getAll();
    return all.find((r) => r.id === id) || null;
  }

  async create(data: Omit<T, "id">): Promise<T> {
    const all = await this.getAll();
    const record = { id: uuidv4(), ...data, created_at: Date.now(), updated_at: Date.now() } as unknown as T;
    all.push(record);
    await this.saveAll(all);
    return record;
  }

  async update(id: string, updates: Partial<T>): Promise<T | null> {
    const all = await this.getAll();
    const idx = all.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...updates, updated_at: Date.now() };
    await this.saveAll(all);
    return all[idx];
  }

  async remove(id: string): Promise<void> {
    const all = await this.getAll();
    await this.saveAll(all.filter((r) => r.id !== id));
  }

  async count(): Promise<number> {
    const all = await this.getAll();
    return all.length;
  }

  async batchCreate(items: Array<Omit<T, "id">>): Promise<T[]> {
    const all = await this.getAll();
    const created = items.map(
      (data) =>
        ({ id: uuidv4(), ...data, created_at: Date.now(), updated_at: Date.now() } as unknown as T)
    );
    all.push(...created);
    await this.saveAll(all);
    return created;
  }
}

class LocalDatabase {
  private collections = new Map<string, Collection<any>>();

  get<T extends Record>(tableName: string): Collection<T> {
    if (!this.collections.has(tableName)) {
      this.collections.set(tableName, new Collection<T>(tableName));
    }
    return this.collections.get(tableName)!;
  }
}

export const database = new LocalDatabase();
