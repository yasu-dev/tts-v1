// 安全な通知システム（Prismaバイパス版）
// 後で完全に削除可能

const Database = require('better-sqlite3');
const path = require('path');

class SafeNotificationSystem {
  constructor() {
    this.dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
    this.db = null;
  }

  connect() {
    if (!this.db) {
      this.db = new Database(this.dbPath);
    }
    return this.db;
  }

  disconnect() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  // 通知作成（納品プラン用）
  async createDeliveryPlanNotification(staffUserId, planData) {
    const db = this.connect();
    try {
      const notificationId = `safe-notif-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      
      const stmt = db.prepare(`
        INSERT INTO notifications (
          id, type, title, message, userId, "read", priority, 
          notificationType, action, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `);
      
      stmt.run(
        notificationId,
        'info',
        '📦 新規納品プラン作成',
        `セラー「${planData.sellerName || '不明'}」が納品プラン（${planData.productCount || 0}点）を作成しました。入庫作業の準備をお願いします。`,
        staffUserId,
        false,
        'medium',
        'delivery_plan_created',
        'inbound'
      );
      
      console.log(`[SAFE-NOTIFICATION] 通知作成成功: ${notificationId} → ${staffUserId}`);
      return { success: true, id: notificationId };
    } catch (error) {
      console.error(`[SAFE-NOTIFICATION] 作成エラー:`, error.message);
      return { success: false, error: error.message };
    }
  }

  // スタッフ通知取得
  async getStaffNotifications(limit = 20) {
    const db = this.connect();
    try {
      const stmt = db.prepare(`
        SELECT * FROM notifications n
        JOIN users u ON n.userId = u.id
        WHERE u.role = 'staff'
        ORDER BY n.createdAt DESC
        LIMIT ?
      `);
      
      const notifications = stmt.all(limit);
      console.log(`[SAFE-NOTIFICATION] スタッフ通知取得: ${notifications.length}件`);
      return notifications;
    } catch (error) {
      console.error(`[SAFE-NOTIFICATION] 取得エラー:`, error.message);
      return [];
    }
  }

  // 全スタッフに納品プラン通知を送信
  async notifyAllStaffForDeliveryPlan(planData) {
    const db = this.connect();
    try {
      // スタッフユーザー取得
      const staffStmt = db.prepare(`SELECT id, email FROM users WHERE role = 'staff'`);
      const staffUsers = staffStmt.all();
      
      console.log(`[SAFE-NOTIFICATION] スタッフユーザー: ${staffUsers.length}人`);
      
      const results = [];
      for (const staff of staffUsers) {
        const result = await this.createDeliveryPlanNotification(staff.id, planData);
        results.push({ staffId: staff.id, ...result });
      }
      
      return {
        success: true,
        notificationCount: results.filter(r => r.success).length,
        results
      };
    } catch (error) {
      console.error(`[SAFE-NOTIFICATION] 一括通知エラー:`, error.message);
      return { success: false, error: error.message };
    }
  }

  // クリーンアップ（全ての安全通知を削除）
  async cleanup() {
    const db = this.connect();
    try {
      const stmt = db.prepare(`DELETE FROM notifications WHERE id LIKE 'safe-notif-%'`);
      const result = stmt.run();
      console.log(`[SAFE-NOTIFICATION] クリーンアップ完了: ${result.changes}件削除`);
      return { success: true, deletedCount: result.changes };
    } catch (error) {
      console.error(`[SAFE-NOTIFICATION] クリーンアップエラー:`, error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = SafeNotificationSystem;