import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
//
// Learn more:
// https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Helper functions for common database operations
export class DatabaseService {
  static async healthCheck(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  static async createInitialData() {
    try {
      // Create default admin user if none exists
      const adminExists = await prisma.user.findFirst({
        where: { role: 'admin' },
      });

      if (!adminExists) {
        const { AuthService } = await import('./auth');
        const hashedPassword = await AuthService.hashPassword('admin123');
        
        await prisma.user.create({
          data: {
            email: 'admin@worlddoor.com',
            username: 'admin',
            password: hashedPassword,
            role: 'admin',
          },
        });
      }

      // Create default locations if none exist
      const locationCount = await prisma.location.count();
      if (locationCount === 0) {
        const defaultLocations = [
          { code: 'A区画-01', name: 'A区画棚1', zone: 'A区画' },
          { code: 'A区画-02', name: 'A区画棚2', zone: 'A区画' },
          { code: 'A区画-03', name: 'A区画棚3', zone: 'A区画' },
          { code: 'A区画-04', name: 'A区画棚4', zone: 'A区画' },
          { code: 'A区画-05', name: 'A区画棚5', zone: 'A区画' },
          { code: 'V区画-01', name: 'V区画棚1', zone: 'V区画' },
          { code: 'V区画-02', name: 'V区画棚2', zone: 'V区画' },
          { code: 'V区画-03', name: 'V区画棚3', zone: 'V区画' },
          { code: 'H区画-01', name: 'H区画棚1', zone: 'H区画' },
          { code: 'H区画-02', name: 'H区画棚2', zone: 'H区画' },
        ];

        await prisma.location.createMany({
          data: defaultLocations,
        });
      }

      console.log('Initial data setup completed');
    } catch (error) {
      console.error('Failed to create initial data:', error);
    }
  }

  static async cleanupExpiredSessions() {
    try {
      const result = await prisma.session.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });
      console.log(`Cleaned up ${result.count} expired sessions`);
    } catch (error) {
      console.error('Session cleanup failed:', error);
    }
  }

  static async getActivitySummary(days: number = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const activities = await prisma.activity.findMany({
        where: {
          createdAt: {
            gte: startDate,
          },
        },
        select: {
          type: true,
          createdAt: true,
        },
      });

      const summary = activities.reduce((acc, activity) => {
        const type = activity.type;
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return summary;
    } catch (error) {
      console.error('Failed to get activity summary:', error);
      return {};
    }
  }

  static async getInventorySummary() {
    try {
      const statusCounts = await prisma.product.groupBy({
        by: ['status'],
        _count: {
          status: true,
        },
      });

      const categoryCounts = await prisma.product.groupBy({
        by: ['category'],
        _count: {
          category: true,
        },
      });

      const totalValue = await prisma.product.aggregate({
        _sum: {
          price: true,
        },
        where: {
          status: {
            not: 'sold',
          },
        },
      });

      return {
        statusBreakdown: statusCounts.reduce((acc, item) => {
          acc[item.status] = item._count.status;
          return acc;
        }, {} as Record<string, number>),
        categoryBreakdown: categoryCounts.reduce((acc, item) => {
          acc[item.category] = item._count.category;
          return acc;
        }, {} as Record<string, number>),
        totalValue: totalValue._sum.price || 0,
      };
    } catch (error) {
      console.error('Failed to get inventory summary:', error);
      return {
        statusBreakdown: {},
        categoryBreakdown: {},
        totalValue: 0,
      };
    }
  }
}