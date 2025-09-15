const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function preciseDataAnalysis() {
  try {
    console.log('=== 精密データ分析（手動確認用） ===\n');

    // 1. 全データを時系列で表示
    console.log('📅 全データ作成時系列:');

    // ユーザー作成順
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'asc' }
    });

    console.log('\n👤 ユーザー作成履歴:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} | ${user.username || 'No name'} | ${user.createdAt} | Role: ${user.role}`);
    });

    // 納品プラン作成順（詳細情報付き）
    const plans = await prisma.deliveryPlan.findMany({
      orderBy: { createdAt: 'asc' },
      take: 20 // 最初の20件
    });

    console.log('\n📋 納品プラン作成履歴（最初20件）:');
    plans.forEach((plan, index) => {
      console.log(`${index + 1}. ID: ${plan.id}`);
      console.log(`   セラー: ${plan.sellerName} (${plan.contactEmail})`);
      console.log(`   住所: ${plan.deliveryAddress}`);
      console.log(`   商品数: ${plan.totalItems} | 総額: ¥${plan.totalValue?.toLocaleString() || 0}`);
      console.log(`   作成日: ${plan.createdAt}`);
      console.log(`   ステータス: ${plan.status}`);
      console.log('');
    });

    // 2. seed.tsファイルで作成されるデータのパターンを確認
    console.log('🌱 seed.tsで作成される既知のデモデータ:');
    console.log('   - demo-seller@example.com (デモセラー)');
    console.log('   - FedEx, DHL, EMS, Others キャリア情報');

    // 3. comprehensive-seed.tsパターンの確認
    console.log('\n🏭 comprehensive-seed.tsで作成される可能性のあるパターン:');
    console.log('   - @example.com ドメインのユーザー');
    console.log('   - テスト、デモ、temp系の名前');
    console.log('   - 規則的なデータパターン');

    // 4. 手動チェック用の質問
    console.log('\n❓ 手動確認が必要な項目:');
    console.log('1. 上記のユーザー一覧で、実際にあなたが手動登録したユーザーはありますか？');
    console.log('2. 上記の納品プラン一覧で、UIから手動作成したものはありますか？');
    console.log('3. demo-seller@example.com 以外に保護すべきアカウントはありますか？');

    // 5. 最も安全な削除戦略の提案
    console.log('\n🛡️  最も安全な削除戦略:');
    console.log('1. demo-seller@example.com のみを残す');
    console.log('2. すべての納品プランを削除');
    console.log('3. すべての商品を削除');
    console.log('4. その他のユーザーを削除');
    console.log('5. キャリア情報は保持');

  } catch (error) {
    console.error('❌ エラー:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

preciseDataAnalysis();