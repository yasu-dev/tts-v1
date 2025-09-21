// 超安全な通知システム（外部依存なし）
// 後で完全に削除可能

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

class UltraSafeNotificationSystem {
  constructor() {
    this.dbPath = './prisma/dev.db';
  }

  // SQLite3コマンドで直接実行
  async executeSQL(sql, params = []) {
    try {
      // パラメータを安全にエスケープしてSQL文字列を構築
      let escapedSQL = sql;
      params.forEach((param, index) => {
        const placeholder = `$${index + 1}`;
        const escapedParam = typeof param === 'string' ? `'${param.replace(/'/g, "''")}'` : param;
        escapedSQL = escapedSQL.replace(placeholder, escapedParam);
      });

      const command = `sqlite3 "${this.dbPath}" "${escapedSQL}"`;
      const { stdout, stderr } = await execAsync(command);
      
      if (stderr) {
        console.error('[ULTRA-SAFE] SQLエラー:', stderr);
        return null;
      }
      
      return stdout.trim();
    } catch (error) {
      console.error('[ULTRA-SAFE] 実行エラー:', error.message);
      return null;
    }
  }

  // 全スタッフに納品プラン通知を送信
  async notifyAllStaffForDeliveryPlan(planData) {
    try {
      console.log('[ULTRA-SAFE] 納品プラン通知送信開始');
      
      // 1. スタッフユーザー取得
      const staffQuery = `SELECT id, email FROM users WHERE role = 'staff';`;
      const staffResult = await this.executeSQL(staffQuery);
      
      if (!staffResult) {
        console.log('[ULTRA-SAFE] スタッフユーザー取得失敗');
        return { success: false, error: 'スタッフユーザー取得失敗' };
      }

      const staffLines = staffResult.split('\n').filter(line => line.trim());
      console.log(`[ULTRA-SAFE] スタッフユーザー: ${staffLines.length}人`);

      // 2. 各スタッフに通知作成
      const results = [];
      for (const staffLine of staffLines) {
        const [staffId, email] = staffLine.split('|');
        
        const notificationId = `ultra-safe-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        const title = '📦 新規納品プラン作成';
        const message = `セラー「${planData.sellerName || '不明'}」が納品プラン（${planData.productCount || 0}点）を作成しました。入庫作業の準備をお願いします。`;
        
        const insertSQL = `INSERT INTO notifications (id, type, title, message, userId, "read", priority, notificationType, action, createdAt, updatedAt) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, datetime('now'), datetime('now'));`;
        
        const result = await this.executeSQL(insertSQL, [
          notificationId, 'info', title, message, staffId.trim(), 
          'false', 'medium', 'delivery_plan_created', 'inbound'
        ]);
        
        if (result !== null) {
          console.log(`[ULTRA-SAFE] 通知作成成功: ${staffId.trim()} (${email})`);
          results.push({ staffId: staffId.trim(), success: true });
        } else {
          console.log(`[ULTRA-SAFE] 通知作成失敗: ${staffId.trim()}`);
          results.push({ staffId: staffId.trim(), success: false });
        }
      }

      const successCount = results.filter(r => r.success).length;
      console.log(`[ULTRA-SAFE] 通知送信完了: ${successCount}/${results.length}件成功`);
      
      return {
        success: true,
        notificationCount: successCount,
        totalStaff: results.length,
        results
      };

    } catch (error) {
      console.error('[ULTRA-SAFE] 一括通知エラー:', error.message);
      return { success: false, error: error.message };
    }
  }

  // スタッフ通知確認
  async getStaffNotificationCount() {
    try {
      const countSQL = `SELECT COUNT(*) as count FROM notifications n JOIN users u ON n.userId = u.id WHERE u.role = 'staff';`;
      const result = await this.executeSQL(countSQL);
      
      if (result) {
        const count = parseInt(result.split('|')[0] || '0');
        console.log(`[ULTRA-SAFE] スタッフ通知総数: ${count}件`);
        return count;
      }
      return 0;
    } catch (error) {
      console.error('[ULTRA-SAFE] カウント取得エラー:', error.message);
      return 0;
    }
  }

  // クリーンアップ（全ての超安全通知を削除）
  async cleanup() {
    try {
      const deleteSQL = `DELETE FROM notifications WHERE id LIKE 'ultra-safe-%';`;
      const result = await this.executeSQL(deleteSQL);
      console.log('[ULTRA-SAFE] クリーンアップ完了');
      return { success: true };
    } catch (error) {
      console.error('[ULTRA-SAFE] クリーンアップエラー:', error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = UltraSafeNotificationSystem;