// 一時ファイルのクリーンアップ
import { unlink } from 'fs/promises';
import { resolve } from 'path';

const tempFiles = [
  'scripts/check-data.ts',
  'scripts/populate-demo-data.ts',
  'scripts/verify-sqlite-data.ts',
  'scripts/test-api-direct.ts',
  'scripts/debug-api-response.ts',
  'scripts/full-data-verification.ts',
  'scripts/cleanup-temp-files.ts'
];

async function cleanupTempFiles() {
  console.log('🧹 一時ファイルをクリーンアップ中...\n');
  
  for (const file of tempFiles) {
    try {
      await unlink(resolve(file));
      console.log(`✅ 削除: ${file}`);
    } catch (error) {
      console.log(`⏭️ スキップ: ${file} (存在しない)`);
    }
  }
  
  console.log('\n✨ クリーンアップ完了！');
}

cleanupTempFiles();