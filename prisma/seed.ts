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

  // 商品データを作成
  const products = [
    {
      sku: 'CAM-SONY-A7IV-001',
      name: 'Sony α7 IV ボディ',
      category: 'camera',
      price: 328000,
      status: 'inspection',
      condition: 'very_good',
      entryDate: new Date('2024-06-29'),
      sellerId: seller.id,
    },
    {
      sku: 'CAM-SONY-A7II-002',
      name: 'Sony α7 II ボディ',
      category: 'camera',
      price: 99800,
      status: 'listing',
      condition: 'good',
      entryDate: new Date('2024-06-20'),
      sellerId: seller.id,
    },
    {
      sku: 'CAM-CANON-R6M2-003',
      name: 'Canon EOS R6 Mark II ボディ',
      category: 'camera',
      price: 278000,
      status: 'storage',
      condition: 'very_good',
      entryDate: new Date('2024-06-18'),
      sellerId: seller.id,
    },
    {
      sku: 'CAM-NIKON-Z8-004',
      name: 'Nikon Z8 ボディ',
      category: 'camera',
      price: 468000,
      status: 'inbound',
      condition: 'excellent',
      entryDate: new Date('2024-06-30'),
      sellerId: seller.id,
    },
    {
      sku: 'CAM-FUJIFILM-XT5-005',
      name: 'FUJIFILM X-T5 ボディ ブラック',
      category: 'camera',
      price: 198000,
      status: 'storage',
      condition: 'very_good',
      entryDate: new Date('2024-06-12'),
      sellerId: seller.id,
    },
    {
      sku: 'CAM-CANON-R5-006',
      name: 'Canon EOS R5 ボディ',
      category: 'camera',
      price: 358000,
      status: 'sold',
      condition: 'excellent',
      entryDate: new Date('2024-06-01'),
      sellerId: seller.id,
    },
    {
      sku: 'CAM-PANASONIC-S5II-007',
      name: 'Panasonic LUMIX S5 II ボディ',
      category: 'camera',
      price: 215000,
      status: 'listing',
      condition: 'very_good',
      entryDate: new Date('2024-06-15'),
      sellerId: seller.id,
    },
    {
      sku: 'CAM-SONY-A7R5-008',
      name: 'Sony α7R V ボディ',
      category: 'camera',
      price: 438000,
      status: 'inspection',
      condition: 'excellent',
      entryDate: new Date('2024-06-29'),
      sellerId: seller.id,
    },
    {
      sku: 'CAM-NIKON-ZF-009',
      name: 'Nikon Z f ボディ',
      category: 'camera',
      price: 218000,
      status: 'storage',
      condition: 'very_good',
      entryDate: new Date('2024-06-10'),
      sellerId: seller.id,
    },
    {
      sku: 'CAM-SONY-A9II-010',
      name: 'Sony α9 II ボディ',
      category: 'camera',
      price: 498000,
      status: 'listing',
      condition: 'excellent',
      entryDate: new Date('2024-06-14'),
      sellerId: seller.id,
    },
    {
      sku: 'CAM-CANON-R3-011',
      name: 'Canon EOS R3 ボディ',
      category: 'camera',
      price: 698000,
      status: 'inbound',
      condition: 'like_new',
      entryDate: new Date('2024-07-01'),
      sellerId: seller.id,
    },
    {
      sku: 'CAM-FUJIFILM-GFX100S-012',
      name: 'FUJIFILM GFX100S ボディ',
      category: 'camera',
      price: 748000,
      status: 'storage',
      condition: 'excellent',
      entryDate: new Date('2024-06-05'),
      sellerId: seller.id,
    },
    {
      sku: 'CAM-LEICA-Q2-013',
      name: 'Leica Q2',
      category: 'camera',
      price: 658000,
      status: 'sold',
      condition: 'excellent',
      entryDate: new Date('2024-05-30'),
      sellerId: seller.id,
    },
    {
      sku: 'CAM-OLYMPUS-EM1X-014',
      name: 'OLYMPUS OM-D E-M1X ボディ',
      category: 'camera',
      price: 128000,
      status: 'storage',
      condition: 'good',
      entryDate: new Date('2024-06-08'),
      sellerId: seller.id,
    },
    {
      sku: 'CAM-SIGMA-FP-015',
      name: 'SIGMA fp ボディ',
      category: 'camera',
      price: 99800,
      status: 'inspection',
      condition: 'very_good',
      entryDate: new Date('2024-06-29'),
      sellerId: seller.id,
    },
    {
      sku: 'CAM-CANON-R10-016',
      name: 'Canon EOS R10 ボディ',
      category: 'camera',
      price: 92800,
      status: 'storage',
      condition: 'good',
      entryDate: new Date('2024-06-11'),
      sellerId: seller.id,
    },
    {
      sku: 'CAM-NIKON-D850-017',
      name: 'Nikon D850 ボディ',
      category: 'camera',
      price: 158000,
      status: 'listing',
      condition: 'very_good',
      entryDate: new Date('2024-06-13'),
      sellerId: seller.id,
    },
    {
      sku: 'CAM-FUJIFILM-X100V-018',
      name: 'FUJIFILM X100V シルバー',
      category: 'camera',
      price: 158000,
      status: 'storage',
      condition: 'very_good',
      entryDate: new Date('2024-06-09'),
      sellerId: seller.id,
    },
    {
      sku: 'CAM-SONY-ZV1-019',
      name: 'Sony ZV-1 Vlog Camera',
      category: 'camera',
      price: 64800,
      status: 'inspection',
      condition: 'good',
      entryDate: new Date('2024-06-29'),
      sellerId: seller.id,
    },
    {
      sku: 'CAM-CANON-R7-020',
      name: 'Canon EOS R7 ボディ',
      category: 'camera',
      price: 138000,
      status: 'inbound',
      condition: 'very_good',
      entryDate: new Date('2024-07-01'),
      sellerId: seller.id,
    },
  ];

  // 商品を一括作成
  for (const productData of products) {
    const product = await prisma.product.upsert({
      where: { sku: productData.sku },
      update: {},
      create: productData,
    });
    console.log(`✅ 商品を作成しました: ${product.name}`);
  }

  console.log('🎉 シードデータの作成が完了しました！');
  console.log('');
  console.log('📧 ログイン情報:');
  console.log('セラー: seller@example.com / password123');
  console.log('スタッフ: staff@example.com / password123');
  console.log('管理者: admin@example.com / password123');
  console.log('');
  console.log('📦 商品データ: 20件のカメラを作成しました');
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