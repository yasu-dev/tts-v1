import { test } from '@playwright/test';
import Database from 'better-sqlite3';
import path from 'path';

test('データベース内の★記号チェック', async () => {
  console.log('=== データベース内の★記号チェック ===');

  try {
    // SQLiteデータベースに接続
    const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
    const db = new Database(dbPath);

    console.log(`📊 データベース接続: ${dbPath}`);

    // すべてのテーブルを取得
    const tables = db.prepare(`
      SELECT name FROM sqlite_master
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `).all();

    console.log(`🔍 テーブル数: ${tables.length}`);

    for (const table of tables) {
      const tableName = table.name;
      console.log(`\n📋 テーブル: ${tableName}`);

      try {
        // テーブルの構造を取得
        const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
        const textColumns = columns.filter(col =>
          col.type.toLowerCase().includes('text') ||
          col.type.toLowerCase().includes('varchar') ||
          col.type.toLowerCase().includes('char')
        );

        if (textColumns.length === 0) {
          console.log(`   ℹ️ テキストカラムなし`);
          continue;
        }

        // 各テキストカラムで★をチェック
        for (const column of textColumns) {
          const columnName = column.name;
          const starQuery = db.prepare(`
            SELECT id, ${columnName}
            FROM ${tableName}
            WHERE ${columnName} LIKE '%★%' OR ${columnName} LIKE '%⭐%'
          `);

          const starResults = starQuery.all();

          if (starResults.length > 0) {
            console.log(`   🎯 ${columnName}カラムで★発見: ${starResults.length}件`);
            starResults.forEach((row, index) => {
              console.log(`     ${index + 1}. ID:${row.id} - "${row[columnName]}"`);
            });
          }
        }
      } catch (error) {
        console.log(`   ❌ ${tableName}の処理エラー: ${error.message}`);
      }
    }

    db.close();
    console.log('\n=== データベース★記号チェック完了 ===');

  } catch (error) {
    console.error('❌ データベースアクセスエラー:', error);
  }
});