import { join } from 'path';
import { promises as fs } from 'fs';
import mkdirp from 'mkdirp';

const dataFileName = 'data.json';

type BatchOperations<T> =
  | { type: 'set'; key: string; value: T }
  | { type: 'delete'; key: string };

export class Store<T> {
  private readonly location: string;
  private readonly dataFileLocation: string;
  private connection: Promise<void> | null = null;

  constructor(name: string) {
    this.location = join(__dirname, name);
    this.dataFileLocation = join(this.location, dataFileName);
  }

  private connect() {
    if (!this.connection) {
      this.connection = Promise.resolve().then(async () => {
        await mkdirp(this.location);
        await fs.writeFile(this.dataFileLocation, '{}');
      });
    }

    return this.connection;
  }

  private async getAll() {
    await this.connect();
    const file = String(await fs.readFile(this.dataFileLocation));
    return JSON.parse(file) as Record<string, T>;
  }

  private async writeStore(store: Record<string, T>): Promise<void> {
    await fs.writeFile(this.dataFileLocation, JSON.stringify(store));
  }

  async get(key: string): Promise<T | null> {
    await this.connect();
    const store = await this.getAll();

    return store[key] ?? null;
  }

  async set(key: string, value: T): Promise<void> {
    await this.connect();
    const store = await this.getAll();
    store[key] = value;

    await this.writeStore(store);
  }

  async delete(key: string): Promise<void> {
    await this.connect();
    const store = await this.getAll();
    delete store[key];

    await this.writeStore(store);
  }

  async keys(): Promise<string[]> {
    await this.connect();
    return Object.keys(await this.getAll());
  }

  async values(): Promise<T[]> {
    await this.connect();
    return Object.values(await this.getAll());
  }

  async batch(ops: BatchOperations<T>[]): Promise<void> {
    const store = await this.getAll();

    for (const op of ops) {
      if (op.type === 'set') {
        store[op.key] = op.value;
      } else if (op.type === 'delete') {
        delete store[op.key];
      } else {
        // @ts-expect-error Expect an error here in case we ever add a new op type, this will not compile.
        throw new Error(`Unexpected operation type "${op.type}"`);
      }
    }

    this.writeStore(store);
  }
}
