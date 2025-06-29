import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 シードデータを作成中...');

  // パスワードをハッシュ化
  const hashedPassword = await bcrypt.hash('password123', 12);

  // セラーユーザーを作成
  const seller = await prisma.user.upsert({
    where: { email: 'seller@example.com' },
    update: {},
    create: {
      email: 'seller@example.com',
      username: 'テストセラー',
      password: hashedPassword,
      role: 'seller',
    },
  });

  console.log('✅ セラーユーザーを作成しました:', seller);

  // スタッフユーザーを作成
  const staff = await prisma.user.upsert({
    where: { email: 'staff@example.com' },
    update: {},
    create: {
      email: 'staff@example.com',
      username: 'テストスタッフ',
      password: hashedPassword,
      role: 'staff',
    },
  });

  console.log('✅ スタッフユーザーを作成しました:', staff);

  // 管理者ユーザーを作成
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      username: '管理者',
      password: hashedPassword,
      role: 'admin',
    },
  });

  console.log('✅ 管理者ユーザーを作成しました:', admin);

  console.log('🎉 シードデータの作成が完了しました！');
  console.log('');
  console.log('📧 ログイン情報:');
  console.log('セラー: seller@example.com / password123');
  console.log('スタッフ: staff@example.com / password123');
  console.log('管理者: admin@example.com / password123');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ エラーが発生しました:', e);
    await prisma.$disconnect();
    process.exit(1);
  }); 