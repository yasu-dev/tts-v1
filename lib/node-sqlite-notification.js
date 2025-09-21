// Node.js内蔵fsでSQLiteファイル直接操作（最後の手段）
const fs = require('fs');

class NodeSQLiteNotificationSystem {
  constructor() {
    this.dbPath = './prisma/dev.db';
  }

  // データベースファイルの存在確認
  checkDatabase() {
    try {
      const stats = fs.statSync(this.dbPath);
      console.log('[NODE-SQLITE] データベースファイル確認:', this.dbPath);
      console.log('[NODE-SQLITE] ファイルサイズ:', stats.size, 'bytes');
      return true;
    } catch (error) {
      console.error('[NODE-SQLITE] データベースファイル不存在:', error.message);
      return false;
    }
  }

  // 手動でスタッフ通知レコードを作成（疑似通知）
  async createMockStaffNotifications() {
    try {
      console.log('[NODE-SQLITE] 疑似通知作成開始');
      
      if (!this.checkDatabase()) {
        return { success: false, error: 'データベースファイルが見つかりません' };
      }

      // 疑似的な通知データを作成（実際にはファイルシステム経由）
      const mockNotifications = [
        {
          id: `mock-notif-${Date.now()}-1`,
          staffId: 'cmfdouvrq0001mku12p0r43zh', // staff@example.com
          title: '📦 新規納品プラン作成（Mock）',
          message: 'セラー「テストセラー」が納品プラン（3点）を作成しました。入庫作業の準備をお願いします。',
          created: new Date().toISOString()
        }
      ];

      // 疑似通知ファイルに保存（後で削除可能）
      const mockFile = './mock-notifications.json';
      fs.writeFileSync(mockFile, JSON.stringify(mockNotifications, null, 2));
      
      console.log('[NODE-SQLITE] 疑似通知ファイル作成:', mockFile);
      console.log('[NODE-SQLITE] 疑似通知数:', mockNotifications.length, '件');
      
      return {
        success: true,
        mockFile,
        notificationCount: mockNotifications.length,
        notifications: mockNotifications
      };

    } catch (error) {
      console.error('[NODE-SQLITE] 疑似通知作成エラー:', error.message);
      return { success: false, error: error.message };
    }
  }

  // 疑似通知の確認
  async getMockNotifications() {
    try {
      const mockFile = './mock-notifications.json';
      if (!fs.existsSync(mockFile)) {
        console.log('[NODE-SQLITE] 疑似通知ファイルなし');
        return [];
      }

      const data = fs.readFileSync(mockFile, 'utf8');
      const notifications = JSON.parse(data);
      console.log('[NODE-SQLITE] 疑似通知読み取り:', notifications.length, '件');
      return notifications;

    } catch (error) {
      console.error('[NODE-SQLITE] 疑似通知読み取りエラー:', error.message);
      return [];
    }
  }

  // クリーンアップ（疑似通知ファイル削除）
  async cleanup() {
    try {
      const mockFile = './mock-notifications.json';
      if (fs.existsSync(mockFile)) {
        fs.unlinkSync(mockFile);
        console.log('[NODE-SQLITE] 疑似通知ファイル削除完了');
        return { success: true, cleaned: true };
      } else {
        console.log('[NODE-SQLITE] クリーンアップ対象なし');
        return { success: true, cleaned: false };
      }
    } catch (error) {
      console.error('[NODE-SQLITE] クリーンアップエラー:', error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = NodeSQLiteNotificationSystem;