import { BaseRepository, BaseEntity, RepositoryOptions, PaginationResult, RepositoryFactory } from './base.repository';
import { prisma } from '@/lib/database';
import { promises as fs } from 'fs';
import path from 'path';

export interface InventoryItem extends BaseEntity {
  name: string;
  sku: string;
  category: string;
  price: number;
  condition: string;
  status: string;
  locationId?: string;
  images?: string[];
}

/**
 * Prisma Repository Implementation
 */
class PrismaInventoryRepository extends BaseRepository<InventoryItem> {
  async findMany(options?: RepositoryOptions): Promise<InventoryItem[]> {
    return await prisma.product.findMany({
      where: options?.where,
      orderBy: options?.orderBy,
      skip: options?.skip,
      take: options?.take,
      include: options?.include,
    }) as InventoryItem[];
  }

  async findById(id: string, options?: RepositoryOptions): Promise<InventoryItem | null> {
    return await prisma.product.findUnique({
      where: { id },
      include: options?.include,
    }) as InventoryItem | null;
  }

  async create(data: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<InventoryItem> {
    return await prisma.product.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }) as InventoryItem;
  }

  async update(id: string, data: Partial<InventoryItem>): Promise<InventoryItem> {
    return await prisma.product.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    }) as InventoryItem;
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.product.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async count(options?: RepositoryOptions): Promise<number> {
    return await prisma.product.count({
      where: options?.where,
    });
  }

  async findPaginated(page: number, limit: number, options?: RepositoryOptions): Promise<PaginationResult<InventoryItem>> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.findMany({ ...options, skip, take: limit }),
      this.count(options),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}

/**
 * Mock Repository Implementation
 */
class MockInventoryRepository extends BaseRepository<InventoryItem> {
  private async loadMockData(): Promise<InventoryItem[]> {
    try {
      const filePath = path.join(process.cwd(), 'data', 'inventory.json');
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(fileContent);
      return data.products || [];
    } catch {
      return [];
    }
  }

  async findMany(options?: RepositoryOptions): Promise<InventoryItem[]> {
    const data = await this.loadMockData();
    let result = data;

    if (options?.where) {
      result = result.filter(item => {
        return Object.entries(options.where!).every(([key, value]) => {
          return (item as any)[key] === value;
        });
      });
    }

    if (options?.orderBy) {
      const [key, direction] = Object.entries(options.orderBy)[0];
      result.sort((a, b) => {
        const aVal = (a as any)[key];
        const bVal = (b as any)[key];
        if (direction === 'asc') return aVal > bVal ? 1 : -1;
        return aVal < bVal ? 1 : -1;
      });
    }

    if (options?.skip) result = result.slice(options.skip);
    if (options?.take) result = result.slice(0, options.take);

    return result;
  }

  async findById(id: string): Promise<InventoryItem | null> {
    const data = await this.loadMockData();
    return data.find(item => item.id === id) || null;
  }

  async create(data: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<InventoryItem> {
    const newItem: InventoryItem = {
      ...data,
      id: `mock-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return newItem;
  }

  async update(id: string, data: Partial<InventoryItem>): Promise<InventoryItem> {
    const existing = await this.findById(id);
    if (!existing) throw new Error('Item not found');
    
    return {
      ...existing,
      ...data,
      updatedAt: new Date(),
    };
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.findById(id);
    return !!existing;
  }

  async count(options?: RepositoryOptions): Promise<number> {
    const data = await this.findMany(options);
    return data.length;
  }

  async findPaginated(page: number, limit: number, options?: RepositoryOptions): Promise<PaginationResult<InventoryItem>> {
    const total = await this.count(options);
    const data = await this.findMany({
      ...options,
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}

/**
 * API Repository Implementation
 */
class ApiInventoryRepository extends BaseRepository<InventoryItem> {
  private baseUrl = process.env.EXTERNAL_API_URL || 'https://api.example.com';

  async findMany(options?: RepositoryOptions): Promise<InventoryItem[]> {
    const params = new URLSearchParams();
    if (options?.skip) params.append('skip', options.skip.toString());
    if (options?.take) params.append('take', options.take.toString());
    
    const response = await fetch(`${this.baseUrl}/inventory?${params}`);
    const data = await response.json();
    return data.items || [];
  }

  async findById(id: string): Promise<InventoryItem | null> {
    const response = await fetch(`${this.baseUrl}/inventory/${id}`);
    if (!response.ok) return null;
    return await response.json();
  }

  async create(data: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<InventoryItem> {
    const response = await fetch(`${this.baseUrl}/inventory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await response.json();
  }

  async update(id: string, data: Partial<InventoryItem>): Promise<InventoryItem> {
    const response = await fetch(`${this.baseUrl}/inventory/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await response.json();
  }

  async delete(id: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/inventory/${id}`, {
      method: 'DELETE',
    });
    return response.ok;
  }

  async count(options?: RepositoryOptions): Promise<number> {
    const response = await fetch(`${this.baseUrl}/inventory/count`);
    const data = await response.json();
    return data.count || 0;
  }

  async findPaginated(page: number, limit: number, options?: RepositoryOptions): Promise<PaginationResult<InventoryItem>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    const response = await fetch(`${this.baseUrl}/inventory/paginated?${params}`);
    return await response.json();
  }
}

/**
 * Repository Factory Instance
 */
export const inventoryRepository = RepositoryFactory.create<InventoryItem>(
  'inventory',
  PrismaInventoryRepository,
  MockInventoryRepository,
  ApiInventoryRepository
); 