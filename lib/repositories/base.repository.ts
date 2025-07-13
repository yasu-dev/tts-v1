/**
 * Repository パターン基底インターフェース
 * データソース (Prisma/Mock/API) を完全に抽象化
 */

export interface BaseEntity {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RepositoryOptions {
  include?: Record<string, boolean>;
  orderBy?: Record<string, 'asc' | 'desc'>;
  where?: Record<string, any>;
  skip?: number;
  take?: number;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export abstract class BaseRepository<T extends BaseEntity> {
  abstract findMany(options?: RepositoryOptions): Promise<T[]>;
  abstract findById(id: string, options?: RepositoryOptions): Promise<T | null>;
  abstract create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  abstract update(id: string, data: Partial<T>): Promise<T>;
  abstract delete(id: string): Promise<boolean>;
  abstract count(options?: RepositoryOptions): Promise<number>;
  abstract findPaginated(page: number, limit: number, options?: RepositoryOptions): Promise<PaginationResult<T>>;
}

/**
 * Repository Factory
 * 環境変数に基づいて適切なRepositoryを返す
 */
export class RepositoryFactory {
  private static dataSource = process.env.DATA_SOURCE || 'auto';
  
  static getDataSource(): 'prisma' | 'mock' | 'api' {
    if (this.dataSource === 'auto') {
      // 自動判定ロジック
      if (process.env.NODE_ENV === 'development') return 'mock';
      if (process.env.DATABASE_URL) return 'prisma';
      return 'api';
    }
    return this.dataSource as 'prisma' | 'mock' | 'api';
  }
  
  static create<T extends BaseEntity>(
    entityName: string,
    PrismaRepo: new () => BaseRepository<T>,
    MockRepo: new () => BaseRepository<T>,
    ApiRepo: new () => BaseRepository<T>
  ): BaseRepository<T> {
    const source = this.getDataSource();
    
    switch (source) {
      case 'prisma':
        return new PrismaRepo();
      case 'mock':
        return new MockRepo();
      case 'api':
        return new ApiRepo();
      default:
        throw new Error(`Unknown data source: ${source}`);
    }
  }
} 