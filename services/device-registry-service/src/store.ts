import { join } from 'path';
import { promises as fs } from 'fs';
import mkdirp from 'mkdirp';

const dataFileName = 'data.json';

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

  async get(key: string): Promise<T | null> {
    await this.connect();
    const store = await this.getAll();

    return store[key] ?? null;
  }

  async set(key: string, value: T): Promise<void> {
    await this.connect();
    const store = await this.getAll();
    store[key] = value;

    await fs.writeFile(this.dataFileLocation, JSON.stringify(store));
  }

  async delete(key: string): Promise<void> {
    await this.connect();
    const store = await this.getAll();
    delete store[key];

    await fs.writeFile(this.dataFileLocation, JSON.stringify(store));
  }

  async keys(): Promise<string[]> {
    await this.connect();
    return Object.keys(await this.getAll());
  }

  async values(): Promise<T[]> {
    await this.connect();
    return Object.values(await this.getAll());
  }
}
