declare module 'level' {
  import { Readable } from 'stream';
  import { AbstractIterator } from 'abstract-leveldown';

  export type BatchOperations =
    | { type: 'put'; key: string; value: any }
    | { type: 'del'; key: string };

  interface CreateStreamOptions {
    gt?: any;
    gte?: any;
    lt?: any;
    lte?: any;
    reverse?: boolean;
    limit?: number;
    keys?: boolean;
    values?: boolean;
  }

  type CreateKeyValueStreamOptions = Omit<
    CreateStreamOptions,
    'keys' | 'values'
  >;

  export type Encoding = 'json' | 'binary' | 'hex' | 'utf8';

  export interface CommitOptions {
    valueEncoding?: Encoding;
    keyEncoding?: Encoding;
  }

  export interface Level {
    get(key: string, options?: CommitOptions): Promise<any>;
    put(key: string, value: any, options?: CommitOptions): Promise<void>;
    del(key: string): Promise<void>;
    batch(
      operations: BatchOperations[],
      options?: CommitOptions
    ): Promise<void>;
    isOpen(): boolean;
    isClosed(): boolean;
    createReadStream(options?: CreateStreamOptions): Readable;
    createKeyStream(options?: CreateKeyValueStreamOptions): Readable;
    createValueStream(options?: CreateKeyValueStreamOptions): Readable;
    iterator(options?: CreateStreamOptions): AbstractIterator;
    clear(): Promise<void>;
  }

  export interface LevelOptions {
    readonly prefix?: string;
    readonly version?: string | number;
  }

  declare const level: {
    (location: string, options?: LevelOptions): Level;
    errors: {
      LevelUPError: typeof Error;
      InitializationError: typeof Error;
      OpenError: typeof Error;
      ReadError: typeof Error;
      WriteError: typeof Error;
      NotFoundError: typeof Error;
      EncodingError: typeof Error;
    };
  };

  export default level;
}
