import { inventoryRepository, InventoryItem } from '@/lib/repositories/inventory.repository';
import { config } from '@/config';

/**
 * 統一在庫管理サービス
 * ビジネスロジックを集約し、データソースに依存しない実装
 */
export class InventoryService {
  /**
   * 在庫一覧取得（ページネーション付き）
   */
  static async getInventoryList(
    page: number = 1,
    limit: number = 20,
    filters?: {
      category?: string;
      status?: string;
      search?: string;
    }
  ) {
    const where: any = {};
    
    if (filters?.category) where.category = filters.category;
    if (filters?.status) where.status = filters.status;
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { sku: { contains: filters.search } },
      ];
    }

    return await inventoryRepository.findPaginated(page, limit, { where });
  }

  /**
   * 在庫詳細取得
   */
  static async getInventoryById(id: string) {
    return await inventoryRepository.findById(id);
  }

  /**
   * 在庫登録
   */
  static async createInventory(data: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) {
    // ビジネスロジック: SKU重複チェック
    const existing = await inventoryRepository.findMany({
      where: { sku: data.sku }
    });
    
    if (existing.length > 0) {
      throw new Error('SKUが重複しています');
    }

    // ビジネスロジック: 価格検証
    if (data.price <= 0) {
      throw new Error('価格は0より大きい値を設定してください');
    }

    return await inventoryRepository.create(data);
  }

  /**
   * 在庫更新
   */
  static async updateInventory(id: string, data: Partial<InventoryItem>) {
    const existing = await inventoryRepository.findById(id);
    if (!existing) {
      throw new Error('在庫が見つかりません');
    }

    // ビジネスロジック: SKU重複チェック（自分以外）
    if (data.sku) {
      const duplicates = await inventoryRepository.findMany({
        where: { 
          sku: data.sku,
          NOT: { id }
        }
      });
      
      if (duplicates.length > 0) {
        throw new Error('SKUが重複しています');
      }
    }

    return await inventoryRepository.update(id, data);
  }

  /**
   * 在庫削除
   */
  static async deleteInventory(id: string) {
    const existing = await inventoryRepository.findById(id);
    if (!existing) {
      throw new Error('在庫が見つかりません');
    }

    // ビジネスロジック: 削除可能性チェック
    if (existing.status === 'active') {
      throw new Error('アクティブな在庫は削除できません');
    }

    return await inventoryRepository.delete(id);
  }

  /**
   * 在庫統計取得
   */
  static async getInventoryStats() {
    const [total, active, inactive, lowStock] = await Promise.all([
      inventoryRepository.count(),
      inventoryRepository.count({ where: { status: 'active' } }),
      inventoryRepository.count({ where: { status: 'inactive' } }),
      inventoryRepository.count({ where: { status: 'low_stock' } }),
    ]);

    return {
      total,
      active,
      inactive,
      lowStock,
      activeRate: total > 0 ? (active / total) * 100 : 0,
    };
  }

  /**
   * カテゴリ別統計
   */
  static async getCategoryStats() {
    // データソースによって実装が異なる場合の例
    if (config.dataSource === 'mock') {
      // モック環境では簡易統計
      const items = await inventoryRepository.findMany();
      const categoryMap = new Map<string, number>();
      
      items.forEach(item => {
        categoryMap.set(item.category, (categoryMap.get(item.category) || 0) + 1);
      });
      
      return Array.from(categoryMap.entries()).map(([category, count]) => ({
        category,
        count,
      }));
    } else {
      // Prisma環境では高度な集計クエリ
      // 実装は省略（実際にはPrismaの集計機能を使用）
      return [];
    }
  }
} 