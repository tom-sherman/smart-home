import level, { Level, LevelOptions } from 'level';

type BatchOperations<T> =
  | { type: 'set'; key: string; value: T }
  | { type: 'delete'; key: string };

/**
 * T must be able to be serializable as JSON.
 */
export class Store<T> {
  private db: Level;

  constructor(location: string, options?: LevelOptions);
  constructor(location: Level);
  constructor(param: Level | string) {
    // Support injecting a db and also a
    if (typeof param === 'string') {
      this.db = level(param);
    } else {
      this.db = param;
    }
  }

  async get(key: string): Promise<T | null> {
    try {
      const result = await this.db.get(key, { valueEncoding: 'json' });
      return result;
    } catch (error) {
      if (error instanceof level.errors.NotFoundError) {
        return null;
      }

      throw error;
    }
  }

  async set(key: string, value: T): Promise<void> {
    await this.db.put(key, value, { valueEncoding: 'json' });
  }

  async delete(key: string): Promise<void> {
    await this.db.del(key);
  }

  async keys(): Promise<string[]> {
    const stream = this.db.createKeyStream();
    const keys: string[] = [];

    for await (const chunk of stream) {
      keys.push(chunk);
    }

    return keys;
  }

  async values(): Promise<T[]> {
    const stream = this.db.createValueStream();
    const values: T[] = [];

    for await (const chunk of stream) {
      console.log(chunk);
      values.push(JSON.parse(chunk));
    }

    return values;
  }

  async batch(ops: BatchOperations<T>[]): Promise<void> {
    await this.db.batch(
      ops.map((op) =>
        op.type === 'delete'
          ? {
              ...op,
              type: 'del',
            }
          : {
              ...op,
              type: 'put',
            }
      ),
      {
        valueEncoding: 'json',
      }
    );
  }
}
