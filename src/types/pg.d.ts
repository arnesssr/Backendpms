declare module 'pg' {
  export interface Pool {
    query: (text: string, params?: any[]) => Promise<any>;
    connect: () => Promise<PoolClient>;
    on: (event: string, callback: (err: Error) => void) => void;
  }

  export interface PoolClient {
    query: (text: string, params?: any[]) => Promise<any>;
    release: () => void;
  }

  export class Pool {
    constructor(config?: any);
  }
}
