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

  // 顧客ユーザーを作成（受注デモ用）
  const customers = [
    {
      email: 'tanaka@customer.com',
      username: '田中太郎',
      password: hashedPassword,
      role: 'customer',
    },
    {
      email: 'suzuki@customer.com',
      username: '鈴木花子',
      password: hashedPassword,
      role: 'customer',
    },
    {
      email: 'sato@customer.com',
      username: '佐藤次郎',
      password: hashedPassword,
      role: 'customer',
    },
    {
      email: 'yamada@customer.com',
      username: '山田美里',
      password: hashedPassword,
      role: 'customer',
    },
    {
      email: 'kobayashi@customer.com',
      username: '小林健太',
      password: hashedPassword,
      role: 'customer',
    },
    {
      email: 'watanabe@customer.com',
      username: '渡辺恵子',
      password: hashedPassword,
      role: 'customer',
    },
    {
      email: 'nakamura@customer.com',
      username: '中村雄一',
      password: hashedPassword,
      role: 'customer',
    },
    {
      email: 'takahashi@customer.com',
      username: '高橋優子',
      password: hashedPassword,
      role: 'customer',
    }
  ];

  const customerUsers = [];
  for (const customerData of customers) {
    const customer = await prisma.user.upsert({
      where: { email: customerData.email },
      update: {},
      create: customerData,
    });
    customerUsers.push(customer);
    console.log(`✅ 顧客ユーザーを作成しました: ${customer.username}`);
  }

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
      inspectedAt: new Date('2024-06-19'),
      inspectedBy: staff.id,
      inspectionNotes: '状態良好、全機能正常動作確認済み'
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
    // 追加のカメラ商品（ページネーション用）
    {
      sku: 'CAM-SONY-A1-021',
      name: 'Sony α1 ボディ',
      category: 'camera',
      price: 798000,
      status: 'storage',
      condition: 'excellent',
      entryDate: new Date('2024-06-08'),
      sellerId: seller.id,
    },
    {
      sku: 'CAM-CANON-R6-022',
      name: 'Canon EOS R6 ボディ',
      category: 'camera',
      price: 248000,
      status: 'listing',
      condition: 'very_good',
      entryDate: new Date('2024-06-16'),
      sellerId: seller.id,
    },
    {
      sku: 'CAM-NIKON-Z7II-023',
      name: 'Nikon Z7 II ボディ',
      category: 'camera',
      price: 298000,
      status: 'storage',
      condition: 'excellent',
      entryDate: new Date('2024-06-07'),
      sellerId: seller.id,
    },
    {
      sku: 'CAM-FUJIFILM-XH2-024',
      name: 'FUJIFILM X-H2 ボディ',
      category: 'camera',
      price: 248000,
      status: 'inspection',
      condition: 'very_good',
      entryDate: new Date('2024-07-04'),
      sellerId: seller.id,
    },
    {
      sku: 'CAM-PANASONIC-GH6-025',
      name: 'Panasonic LUMIX GH6 ボディ',
      category: 'camera',
      price: 248000,
      status: 'storage',
      condition: 'good',
      entryDate: new Date('2024-06-21'),
      sellerId: seller.id,
    },
    {
      sku: 'CAM-OLYMPUS-EM1III-026',
      name: 'OLYMPUS OM-D E-M1 Mark III ボディ',
      category: 'camera',
      price: 178000,
      status: 'listing',
      condition: 'very_good',
      entryDate: new Date('2024-06-17'),
      sellerId: seller.id,
    },
    {
      sku: 'CAM-CANON-RP-027',
      name: 'Canon EOS RP ボディ',
      category: 'camera',
      price: 98000,
      status: 'storage',
      condition: 'good',
      entryDate: new Date('2024-06-19'),
      sellerId: seller.id,
    },
    {
      sku: 'CAM-SONY-A7C-028',
      name: 'Sony α7C ボディ',
      category: 'camera',
      price: 198000,
      status: 'inspection',
      condition: 'very_good',
      entryDate: new Date('2024-07-05'),
      sellerId: seller.id,
    },
    {
      sku: 'CAM-NIKON-Z6II-029',
      name: 'Nikon Z6 II ボディ',
      category: 'camera',
      price: 228000,
      status: 'storage',
      condition: 'excellent',
      entryDate: new Date('2024-06-06'),
      sellerId: seller.id,
    },
    {
      sku: 'CAM-FUJIFILM-XT4-030',
      name: 'FUJIFILM X-T4 ボディ',
      category: 'camera',
      price: 168000,
      status: 'listing',
      condition: 'good',
      entryDate: new Date('2024-06-13'),
      sellerId: seller.id,
    },
    {
      sku: 'CAM-CANON-M50II-031',
      name: 'Canon EOS M50 Mark II ボディ',
      category: 'camera',
      price: 68000,
      status: 'storage',
      condition: 'good',
      entryDate: new Date('2024-06-24'),
      sellerId: seller.id,
    },
    {
      sku: 'CAM-SONY-A6600-032',
      name: 'Sony α6600 ボディ',
      category: 'camera',
      price: 128000,
      status: 'inspection',
      condition: 'very_good',
      entryDate: new Date('2024-07-06'),
      sellerId: seller.id,
    },
    {
      sku: 'CAM-PANASONIC-S1R-033',
      name: 'Panasonic LUMIX S1R ボディ',
      category: 'camera',
      price: 298000,
      status: 'storage',
      condition: 'excellent',
      entryDate: new Date('2024-06-04'),
      sellerId: seller.id,
    },
    {
      sku: 'CAM-OLYMPUS-EM5III-034',
      name: 'OLYMPUS OM-D E-M5 Mark III ボディ',
      category: 'camera',
      price: 118000,
      status: 'listing',
      condition: 'good',
      entryDate: new Date('2024-06-15'),
      sellerId: seller.id,
    },
    {
      sku: 'CAM-CANON-90D-035',
      name: 'Canon EOS 90D ボディ',
      category: 'camera',
      price: 128000,
      status: 'storage',
      condition: 'very_good',
      entryDate: new Date('2024-06-23'),
      sellerId: seller.id,
    },
    // 腕時計商品（大幅に拡張）
    {
      sku: 'WATCH-ROLEX-SUB-001',
      name: 'Rolex Submariner Date',
      category: 'watch',
      price: 1580000,
      status: 'storage',
      condition: 'excellent',
      entryDate: new Date('2024-06-15'),
      sellerId: seller.id,
    },
    {
      sku: 'WATCH-OMEGA-SPEED-002',
      name: 'Omega Speedmaster Professional',
      category: 'watch',
      price: 758000,
      status: 'storage',
      condition: 'very_good',
      entryDate: new Date('2024-06-20'),
      sellerId: seller.id,
    },
    {
      sku: 'WATCH-ROLEX-GMT-003',
      name: 'Rolex GMT-Master II',
      category: 'watch',
      price: 1890000,
      status: 'listing',
      condition: 'excellent',
      entryDate: new Date('2024-06-25'),
      sellerId: seller.id,
    },
    {
      sku: 'WATCH-SEIKO-GS-004',
      name: 'Grand Seiko SBGA211',
      category: 'watch',
      price: 658000,
      status: 'storage',
      condition: 'like_new',
      entryDate: new Date('2024-06-28'),
      sellerId: seller.id,
    },
    {
      sku: 'WATCH-CASIO-GS-005',
      name: 'Casio G-Shock MR-G',
      category: 'watch',
      price: 98000,
      status: 'inspection',
      condition: 'good',
      entryDate: new Date('2024-07-01'),
      sellerId: seller.id,
    },
    // 追加の腕時計商品（ページネーション用）
    {
      sku: 'WATCH-ROLEX-DAY-006',
      name: 'Rolex Day-Date 40',
      category: 'watch',
      price: 4280000,
      status: 'storage',
      condition: 'excellent',
      entryDate: new Date('2024-06-10'),
      sellerId: seller.id,
    },
    {
      sku: 'WATCH-PATEK-NAU-007',
      name: 'Patek Philippe Nautilus',
      category: 'watch',
      price: 12800000,
      status: 'listing',
      condition: 'excellent',
      entryDate: new Date('2024-06-05'),
      sellerId: seller.id,
    },
    {
      sku: 'WATCH-AUDEMARS-ROY-008',
      name: 'Audemars Piguet Royal Oak',
      category: 'watch',
      price: 8900000,
      status: 'sold',
      condition: 'very_good',
      entryDate: new Date('2024-05-28'),
      sellerId: seller.id,
    },
    {
      sku: 'WATCH-OMEGA-PLAN-009',
      name: 'Omega Planet Ocean',
      category: 'watch',
      price: 480000,
      status: 'storage',
      condition: 'good',
      entryDate: new Date('2024-06-22'),
      sellerId: seller.id,
    },
    {
      sku: 'WATCH-TAG-CAR-010',
      name: 'TAG Heuer Carrera',
      category: 'watch',
      price: 350000,
      status: 'inspection',
      condition: 'very_good',
      entryDate: new Date('2024-07-02'),
      sellerId: seller.id,
    },
    {
      sku: 'WATCH-BREITLING-NAV-011',
      name: 'Breitling Navitimer',
      category: 'watch',
      price: 680000,
      status: 'storage',
      condition: 'excellent',
      entryDate: new Date('2024-06-18'),
      sellerId: seller.id,
    },
    {
      sku: 'WATCH-IWC-PILOT-012',
      name: 'IWC Pilot\'s Watch',
      category: 'watch',
      price: 520000,
      status: 'listing',
      condition: 'very_good',
      entryDate: new Date('2024-06-14'),
      sellerId: seller.id,
    },
    {
      sku: 'WATCH-TUDOR-BLACK-013',
      name: 'Tudor Black Bay',
      category: 'watch',
      price: 280000,
      status: 'storage',
      condition: 'good',
      entryDate: new Date('2024-06-26'),
      sellerId: seller.id,
    },
    {
      sku: 'WATCH-LONGINES-MASTER-014',
      name: 'Longines Master Collection',
      category: 'watch',
      price: 180000,
      status: 'inspection',
      condition: 'very_good',
      entryDate: new Date('2024-07-03'),
      sellerId: seller.id,
    },
    {
      sku: 'WATCH-ZENITH-CHRONO-015',
      name: 'Zenith Chronomaster',
      category: 'watch',
      price: 780000,
      status: 'storage',
      condition: 'excellent',
      entryDate: new Date('2024-06-12'),
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

  // ロケーションデータを作成
  const locations = [
    { code: 'STD-A-01', name: '標準棚 A-01', zone: 'A', capacity: 50 },
    { code: 'STD-A-02', name: '標準棚 A-02', zone: 'A', capacity: 50 },
    { code: 'STD-B-01', name: '標準棚 B-01', zone: 'B', capacity: 30 },
    { code: 'HUM-01', name: '防湿庫 01', zone: 'H', capacity: 20 },
    { code: 'HUM-02', name: '防湿庫 02', zone: 'H', capacity: 20 },
    { code: 'VAULT-01', name: '金庫室 01', zone: 'V', capacity: 10 },
    { code: 'VAULT-02', name: '金庫室 02', zone: 'V', capacity: 15 },
    { code: 'PROC-01', name: '検品エリア 01', zone: 'P', capacity: 100 },
    { code: 'PROC-02', name: '撮影ブース 01', zone: 'P', capacity: 5 },
  ];

  const locationMap = new Map();
  for (const loc of locations) {
    const location = await prisma.location.upsert({
      where: { code: loc.code },
      update: {},
      create: loc,
    });
    locationMap.set(loc.code, location.id);
    console.log(`✅ ロケーションを作成しました: ${location.name}`);
  }

  // 商品をロケーションに関連付け（全商品を取得して更新）
  console.log('🔄 商品をロケーションに関連付け中...');
  const productsForLocation = await prisma.product.findMany();
  
  // ロケーション割り当てのルール
  const locationAssignments = [
    // 標準棚に保管する商品
    { sku: 'CAM-SONY-A7II-002', locationCode: 'STD-A-01' },
    { sku: 'CAM-PANASONIC-S5II-007', locationCode: 'STD-A-01' },
    { sku: 'CAM-SONY-A9II-010', locationCode: 'STD-A-01' },
    { sku: 'CAM-NIKON-D850-017', locationCode: 'STD-A-02' },
    { sku: 'CAM-FUJIFILM-X100V-018', locationCode: 'STD-A-02' },
    { sku: 'CAM-CANON-R10-016', locationCode: 'STD-B-01' },
    { sku: 'CAM-OLYMPUS-EM1X-014', locationCode: 'STD-B-01' },
    
    // 防湿庫に保管する商品（高価なカメラ）
    { sku: 'CAM-CANON-R6M2-003', locationCode: 'HUM-01' },
    { sku: 'CAM-FUJIFILM-XT5-005', locationCode: 'HUM-01' },
    { sku: 'CAM-NIKON-ZF-009', locationCode: 'HUM-01' },
    { sku: 'CAM-FUJIFILM-GFX100S-012', locationCode: 'HUM-02' },
    
    // 金庫室に保管する商品（超高価品）
    { sku: 'CAM-CANON-R5-006', locationCode: 'VAULT-01' }, // 売約済み
    { sku: 'CAM-LEICA-Q2-013', locationCode: 'VAULT-01' }, // 売約済み
    
    // 検品エリアの商品
    { sku: 'CAM-SONY-A7IV-001', locationCode: 'PROC-01' },
    { sku: 'CAM-SONY-A7R5-008', locationCode: 'PROC-01' },
    { sku: 'CAM-SIGMA-FP-015', locationCode: 'PROC-01' },
    { sku: 'CAM-SONY-ZV1-019', locationCode: 'PROC-01' },
    
    // 入庫中の商品（検品エリア）
    { sku: 'CAM-NIKON-Z8-004', locationCode: 'PROC-01' },
    { sku: 'CAM-CANON-R3-011', locationCode: 'PROC-01' },
    { sku: 'CAM-CANON-R7-020', locationCode: 'PROC-01' },
    { sku: 'CAM-FUJIFILM-XH2-024', locationCode: 'PROC-01' },
    { sku: 'CAM-SONY-A7C-028', locationCode: 'PROC-01' },
    { sku: 'CAM-SONY-A6600-032', locationCode: 'PROC-01' },
    
    // 追加商品のロケーション配置
    { sku: 'CAM-SONY-A1-021', locationCode: 'HUM-02' },
    { sku: 'CAM-CANON-R6-022', locationCode: 'STD-A-01' },
    { sku: 'CAM-NIKON-Z7II-023', locationCode: 'HUM-01' },
    { sku: 'CAM-PANASONIC-GH6-025', locationCode: 'STD-B-01' },
    { sku: 'CAM-OLYMPUS-EM1III-026', locationCode: 'STD-A-02' },
    { sku: 'CAM-CANON-RP-027', locationCode: 'STD-B-01' },
    { sku: 'CAM-NIKON-Z6II-029', locationCode: 'HUM-01' },
    { sku: 'CAM-FUJIFILM-XT4-030', locationCode: 'STD-A-01' },
    { sku: 'CAM-CANON-M50II-031', locationCode: 'STD-B-01' },
    { sku: 'CAM-PANASONIC-S1R-033', locationCode: 'HUM-02' },
    { sku: 'CAM-OLYMPUS-EM5III-034', locationCode: 'STD-A-02' },
    { sku: 'CAM-CANON-90D-035', locationCode: 'STD-B-01' },
    
    // 腕時計（金庫室に保管）
    { sku: 'WATCH-ROLEX-SUB-001', locationCode: 'VAULT-01' },
    { sku: 'WATCH-OMEGA-SPEED-002', locationCode: 'VAULT-02' },
    { sku: 'WATCH-ROLEX-GMT-003', locationCode: 'VAULT-02' },
    { sku: 'WATCH-SEIKO-GS-004', locationCode: 'VAULT-01' },
    { sku: 'WATCH-CASIO-GS-005', locationCode: 'PROC-01' }, // 検品中
  ];

  for (const assignment of locationAssignments) {
    const product = productsForLocation.find(p => p.sku === assignment.sku);
    const locationId = locationMap.get(assignment.locationCode);
    
    if (product && locationId) {
      await prisma.product.update({
        where: { id: product.id },
        data: { currentLocationId: locationId }
      });
      console.log(`📍 ${product.name} を ${assignment.locationCode} に配置しました`);
    }
  }

  // 注文データを作成（受注一覧デモ用）
  console.log('📝 注文データを作成中...');
  
  const orderData = [
    {
      orderNumber: 'ORD-2024-0001',
      customerId: customerUsers[0].id, // 田中太郎
      status: 'processing',
      totalAmount: 328000,
      shippingAddress: '東京都新宿区西新宿1-1-1 新宿マンション 101号室',
      paymentMethod: 'credit_card',
      notes: '配送時間指定: 午前中希望',
      orderDate: new Date('2024-12-20T09:30:00'),
      items: [
        { productSku: 'CAM-SONY-A7IV-001', quantity: 1, price: 328000 }
      ]
    },
    {
      orderNumber: 'ORD-2024-0002',
      customerId: customerUsers[1].id, // 鈴木花子
      status: 'shipped',
      totalAmount: 99800,
      shippingAddress: '大阪府大阪市中央区難波1-2-3 大阪ビル 502号室',
      paymentMethod: 'bank_transfer',
      notes: '不在時は宅配ボックスへ',
      orderDate: new Date('2024-12-19T14:20:00'),
      shippedAt: new Date('2024-12-20T10:00:00'),
      items: [
        { productSku: 'CAM-SONY-A7II-002', quantity: 1, price: 99800 }
      ]
    },
    {
      orderNumber: 'ORD-2024-0003',
      customerId: customerUsers[2].id, // 佐藤次郎
      status: 'delivered',
      totalAmount: 278000,
      shippingAddress: '愛知県名古屋市中区栄3-4-5 栄ハイツ 203号室',
      paymentMethod: 'credit_card',
      notes: '',
      orderDate: new Date('2024-12-18T11:15:00'),
      shippedAt: new Date('2024-12-19T08:30:00'),
      deliveredAt: new Date('2024-12-20T16:45:00'),
      items: [
        { productSku: 'CAM-CANON-R6M2-003', quantity: 1, price: 278000 }
      ]
    },
    {
      orderNumber: 'ORD-2024-0004',
      customerId: customerUsers[3].id, // 山田美里
      status: 'pending',
      totalAmount: 468000,
      shippingAddress: '福岡県福岡市博多区博多駅前2-6-7 博多タワー 1201号室',
      paymentMethod: 'credit_card',
      notes: '法人宛て配送',
      orderDate: new Date('2024-12-20T16:45:00'),
      items: [
        { productSku: 'CAM-NIKON-Z8-004', quantity: 1, price: 468000 }
      ]
    },
    {
      orderNumber: 'ORD-2024-0005',
      customerId: customerUsers[4].id, // 小林健太
      status: 'confirmed',
      totalAmount: 396000,
      shippingAddress: '北海道札幌市中央区大通西5-8-9 札幌センタービル 404号室',
      paymentMethod: 'paypal',
      notes: '精密機器注意',
      orderDate: new Date('2024-12-20T13:20:00'),
      items: [
        { productSku: 'CAM-FUJIFILM-XT5-005', quantity: 2, price: 198000 }
      ]
    },
    {
      orderNumber: 'ORD-2024-0006',
      customerId: customerUsers[5].id,
      status: 'shipped',
      totalAmount: 192800,
      shippingAddress: '宮城県○○市○○区○○1-10-11 ○○プラザ 601号室',
      paymentMethod: 'credit_card',
      notes: '発送完了',
      orderDate: new Date('2024-12-17T10:30:00'),
      items: [
        { productSku: 'CAM-CANON-R10-016', quantity: 1, price: 92800 },
        { productSku: 'CAM-SONY-A7III-007', quantity: 1, price: 100000 }
      ]
    },
    {
      orderNumber: 'ORD-2024-0007',
      customerId: customerUsers[6].id, // 中村雄一
      status: 'shipped',
      totalAmount: 316000,
      shippingAddress: '広島県広島市中区紙屋町2-12-13 広島商業ビル 302号室',
      paymentMethod: 'bank_transfer',
      notes: '時間指定配送: 19-21時',
      orderDate: new Date('2024-12-19T15:40:00'),
      shippedAt: new Date('2024-12-20T11:30:00'),
      items: [
        { productSku: 'CAM-NIKON-D850-017', quantity: 1, price: 158000 },
        { productSku: 'CAM-FUJIFILM-X100V-018', quantity: 1, price: 158000 }
      ]
    },
    {
      orderNumber: 'ORD-2024-0008',
      customerId: customerUsers[7].id, // 高橋優子
      status: 'processing',
      totalAmount: 202800,
      shippingAddress: '沖縄県那覇市久茂地3-14-15 那覇センタープレイス 701号室',
      paymentMethod: 'credit_card',
      notes: '離島配送、追加送料込み',
      orderDate: new Date('2024-12-20T17:10:00'),
      items: [
        { productSku: 'CAM-SONY-ZV1-019', quantity: 1, price: 64800 },
        { productSku: 'CAM-CANON-R7-020', quantity: 1, price: 138000 }
      ]
    }
  ];

  // 商品IDを取得するマップを作成
  const productMap = new Map();
  const allProducts = await prisma.product.findMany();
  allProducts.forEach(product => {
    productMap.set(product.sku, product.id);
  });

  // 注文とアイテムを作成
  console.log('📝 注文データを作成中...');
  
  for (const order of orderData) {
    const createdOrder = await prisma.order.create({
      data: {
        orderNumber: order.orderNumber,
        customerId: order.customerId,
        status: order.status,
        totalAmount: order.totalAmount,
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
        notes: order.notes,
        orderDate: order.orderDate,
        shippedAt: order.shippedAt,
        deliveredAt: order.deliveredAt,
      },
    });

    // 注文アイテムを作成
    for (const item of order.items) {
      const productId = productMap.get(item.productSku);
      if (productId) {
        await prisma.orderItem.create({
          data: {
            orderId: createdOrder.id,
            productId: productId,
            quantity: item.quantity,
            price: item.price,
          },
        });
      }
    }

    console.log(`✅ 注文を作成しました: ${order.orderNumber} - ${order.status}`);
  }

  // アクティビティデータを作成
  console.log('📋 アクティビティデータを作成中...');
  
  const activities = [
    {
      type: 'inbound',
      description: 'Sony α7 IV ボディ が入庫されました',
      userId: staff.id,
      productId: productMap.get('CAM-SONY-A7IV-001'),
      createdAt: new Date('2024-06-29T09:30:00')
    },
    {
      type: 'inspection',
      description: 'Sony α7R V ボディ の検品を開始しました',
      userId: staff.id,
      productId: productMap.get('CAM-SONY-A7R5-008'),
      createdAt: new Date('2024-06-29T10:15:00')
    },
    {
      type: 'listing',
      description: 'Sony α7 II ボディ を出品しました',
      userId: seller.id,
      productId: productMap.get('CAM-SONY-A7II-002'),
      createdAt: new Date('2024-06-20T14:30:00')
    },
    {
      type: 'sold',
      description: 'Canon EOS R5 ボディ が売約されました',
      userId: seller.id,
      productId: productMap.get('CAM-CANON-R5-006'),
      createdAt: new Date('2024-06-01T16:45:00')
    },
    {
      type: 'sold',
      description: 'Leica Q2 が売約されました',
      userId: seller.id,
      productId: productMap.get('CAM-LEICA-Q2-013'),
      createdAt: new Date('2024-05-30T11:20:00')
    },
    {
      type: 'shipping',
      description: '注文 ORD-2024-0002 を発送しました',
      userId: staff.id,
      orderId: (await prisma.order.findFirst({ where: { orderNumber: 'ORD-2024-0002' } }))?.id,
      createdAt: new Date('2024-12-20T10:00:00')
    },
    {
      type: 'label_generated',
      description: '注文 ORD-2024-0002 の配送ラベルをFedExで生成しました',
      userId: seller.id,
      orderId: (await prisma.order.findFirst({ where: { orderNumber: 'ORD-2024-0002' } }))?.id,
      metadata: JSON.stringify({ carrier: 'fedex', trackingNumber: 'FEDEX1234567890' }),
      createdAt: new Date('2024-12-20T09:50:00')
    },
    {
      type: 'delivered',
      description: '注文 ORD-2024-0003 が配送完了しました',
      userId: staff.id,
      orderId: (await prisma.order.findFirst({ where: { orderNumber: 'ORD-2024-0003' } }))?.id,
      createdAt: new Date('2024-12-20T16:45:00')
    },
    {
      type: 'label_uploaded',
      description: '注文 ORD-2024-0001 の配送ラベルをセラーがアップロードしました',
      userId: seller.id,
      orderId: (await prisma.order.findFirst({ where: { orderNumber: 'ORD-2024-0001' } }))?.id,
      metadata: JSON.stringify({ provider: 'seller', fileName: 'yamato_label_ord0001.pdf' }),
      createdAt: new Date('2024-12-20T09:40:00')
    },
    {
      type: 'inspection',
      description: 'SIGMA fp ボディ の検品を開始しました',
      userId: staff.id,
      productId: productMap.get('CAM-SIGMA-FP-015'),
      createdAt: new Date('2024-06-29T08:45:00')
    },
    {
      type: 'listing',
      description: 'Panasonic LUMIX S5 II ボディ を出品しました',
      userId: seller.id,
      productId: productMap.get('CAM-PANASONIC-S5II-007'),
      createdAt: new Date('2024-06-15T13:20:00')
    },
    {
      type: 'inbound',
      description: 'Canon EOS R3 ボディ が入庫されました',
      userId: staff.id,
      productId: productMap.get('CAM-CANON-R3-011'),
      createdAt: new Date('2024-07-01T09:00:00')
    }
  ];

  for (const activity of activities) {
    await prisma.activity.create({
      data: activity
    });
    console.log(`✅ アクティビティを作成しました: ${activity.type} - ${activity.description}`);
  }

  console.log('🎉 シードデータの作成が完了しました！');
  console.log('');
  console.log('📧 ログイン情報:');
  console.log('セラー: seller@example.com / password123');
  console.log('スタッフ: staff@example.com / password123');
  console.log('管理者: admin@example.com / password123');
  console.log('');
  // ピッキングタスクのシードデータを作成
  const pickingCustomers = [
    'NEXUS Global Trading', 'EuroTech Solutions', 'Asia Pacific Electronics',
    '株式会社東京カメラ', 'ヨーロッパ写真機材', 'アメリカンフォト', 
    'カメラワールド', '映像機器商事', 'プロフォト株式会社', 'デジタルイメージング',
    'フォトスタジオ エリート', 'カメラ専門店 レンズマスター', 'ビデオ機材センター',
    '撮影機材レンタル', 'プロカメラマン協会', 'フィルムアート', 'スタジオライト',
    'レンズテクノロジー', 'イメージングソリューション', 'カメラメンテナンス'
  ];

  const pickingProducts = [
    { name: 'Canon EOS R5 ボディ', sku: 'CAM-001', location: 'STD-A-01' },
    { name: 'Sony α7R V ボディ', sku: 'CAM-002', location: 'STD-A-02' },
    { name: 'Nikon Z9 ボディ', sku: 'CAM-003', location: 'STD-A-03' },
    { name: 'Canon EOS R6 Mark II', sku: 'CAM-004', location: 'STD-A-04' },
    { name: 'Sony FE 24-70mm F2.8 GM', sku: 'LENS-001', location: 'HUM-01' },
    { name: 'Canon RF 24-70mm F2.8L', sku: 'LENS-002', location: 'HUM-02' },
    { name: 'Nikon Z 24-70mm f/2.8 S', sku: 'LENS-003', location: 'HUM-03' },
    { name: 'Sony FE 70-200mm F2.8 GM', sku: 'LENS-004', location: 'HUM-04' },
    { name: 'Canon RF 85mm F1.2L', sku: 'LENS-005', location: 'HUM-05' },
    { name: 'Sony FE 85mm F1.4 GM', sku: 'LENS-006', location: 'HUM-06' },
    { name: 'Manfrotto 三脚 MT055', sku: 'ACC-001', location: 'DRY-01' },
    { name: 'Godox ストロボ AD600', sku: 'ACC-002', location: 'DRY-02' },
    { name: 'SanDisk CFexpress 128GB', sku: 'ACC-003', location: 'TEMP-01' },
    { name: 'Lowepro カメラバッグ', sku: 'ACC-004', location: 'TEMP-02' },
    { name: 'Peak Design ストラップ', sku: 'ACC-005', location: 'TEMP-03' }
  ];

  const pickingStaff = ['田中太郎', '佐藤花子', '鈴木一郎', '高橋美咲', '山田健太', '中村由香'];
  const shippingMethods = ['ヤマト運輸', '佐川急便', '日本郵便', 'FedEx', 'DHL Express', 'UPS'];
  const priorities = ['urgent', 'high', 'normal', 'low'];
  const statuses = ['pending', 'in_progress', 'completed', 'on_hold'];

  console.log('🎯 ピッキングタスクのシードデータを作成中...');

  // 50件のピッキングタスクを生成
  for (let i = 1; i <= 50; i++) {
    const orderNumber = `ORD-2024-${String(i + 1000).padStart(4, '0')}`;
    const customer = pickingCustomers[Math.floor(Math.random() * pickingCustomers.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const assignee = status !== 'pending' ? pickingStaff[Math.floor(Math.random() * pickingStaff.length)] : null;
    const shippingMethod = shippingMethods[Math.floor(Math.random() * shippingMethods.length)];
    
    // アイテム数を1-5個でランダム生成
    const itemCount = Math.floor(Math.random() * 5) + 1;
    const selectedProducts = [];
    for (let j = 0; j < itemCount; j++) {
      selectedProducts.push(pickingProducts[Math.floor(Math.random() * pickingProducts.length)]);
    }

    // 進捗に応じてピッキング済み数を設定
    let pickedItems = 0;
    if (status === 'completed') {
      pickedItems = itemCount;
    } else if (status === 'in_progress') {
      pickedItems = Math.floor(Math.random() * itemCount);
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 7)); // 今日から7日以内

    // ピッキングタスクをデータベースに作成
    try {
      const task = await prisma.pickingTask.create({
        data: {
          orderId: orderNumber,
          customerName: customer,
          priority: priority,
          status: status,
          assignee: assignee,
          shippingMethod: shippingMethod,
          totalItems: itemCount,
          pickedItems: pickedItems,
          dueDate: dueDate,
          items: {
            create: selectedProducts.map((product, index) => {
              const quantity = Math.floor(Math.random() * 3) + 1;
              let pickedQuantity = 0;
              let itemStatus = 'pending';
              
              if (status === 'completed') {
                pickedQuantity = quantity;
                itemStatus = 'verified';
              } else if (status === 'in_progress' && index < pickedItems) {
                pickedQuantity = quantity;
                itemStatus = 'picked';
              }

              return {
                productId: `PROD-${product.sku}`,
                productName: product.name,
                sku: product.sku,
                location: product.location,
                quantity: quantity,
                pickedQuantity: pickedQuantity,
                status: itemStatus,
                imageUrl: '/api/placeholder/60/60'
              };
            })
          }
        }
      });
      console.log(`✅ ピッキングタスク ${i} を作成しました: ${orderNumber} (${status})`);
    } catch (error) {
      console.log(`⚠️ ピッキングタスク ${i} の作成をスキップしました:`, error);
    }
  }

  // 納品プランデータを作成
  console.log('📝 納品プランデータを作成中...');
  
  const deliveryStatuses = ['Pending', 'Shipped']; // Draftを削除
  const categories = ['カメラ本体', 'レンズ', '腕時計', 'アクセサリー'];
  const brands = ['Canon', 'Sony', 'Nikon', 'FUJIFILM', 'Panasonic', 'Olympus', 'Rolex', 'Omega', 'Casio'];
  const sellerNames = ['セラーA', 'セラーB', 'セラーC', 'セラーD', 'セラーE', 'セラーF', 'セラーG', 'セラーH'];
  const deliveryAddresses = [
    '東京都○○区○○1-1-1',
    '大阪府○○市○○区○○2-2-2', 
    '愛知県○○市○○区○○3-3-3',
    '福岡県○○市○○区○○4-4-4',
    '北海道○○市○○区○○5-5-5',
    '宮城県○○市○○区○○6-6-6',
    '広島県○○市○○区○○7-7-7',
    '神奈川県○○市○○区○○8-8-8',
    '埼玉県○○市○○区○○9-9-9',
    '千葉県○○市○○区○○10-10-10',
    '京都府○○市○○区○○11-11-11',
    '兵庫県○○市○○区○○12-12-12',
    '静岡県○○市○○区○○13-13-13',
    '茨城県○○市○○区○○14-14-14',
    '栃木県○○市○○区○○15-15-15',
    '群馬県○○市○○区○○16-16-16'
  ];

  for (let i = 0; i < 100; i++) {
    const statusIndex = i % deliveryStatuses.length;
    const sellerIndex = i % sellerNames.length;
    const addressIndex = i % deliveryAddresses.length;
    
    const planNumber = `DP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${(i + 1).toString().padStart(3, '0')}`;
    const status = deliveryStatuses[statusIndex];
    const sellerName = sellerNames[sellerIndex];
    const deliveryAddress = deliveryAddresses[addressIndex];
    
    // 商品数をランダムに設定（1〜8件）
    const productCount = Math.floor(Math.random() * 8) + 1;
    let totalValue = 0;

    // Shippedの場合の追加データ
    const isShipped = status === 'Shipped';
    const shippingTrackingNumber = isShipped ? `JP${Math.floor(Math.random() * 1000000000000000).toString().padStart(15, '0')}` : null;
    const shippedAt = isShipped ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : null; // 過去30日以内
    
    const deliveryPlan = await prisma.deliveryPlan.create({
      data: {
        planNumber,
        sellerId: seller.id,
        sellerName,
        status,
        deliveryAddress,
        contactEmail: `seller${sellerIndex + 1}_${i + 1}@example.com`,
        phoneNumber: `0${Math.floor(Math.random() * 9) + 1}0-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`,
        notes: status === 'Shipped' ? `追跡番号: ${shippingTrackingNumber}` : 
               '通常の納品プランです。発送準備が完了次第、発送予定です。',
        totalItems: productCount,
        totalValue: 0, // 後で更新
        shippingTrackingNumber,
        shippedAt,
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000) // 過去90日以内のランダム日付
      }
    });

    // 商品データを作成
    for (let j = 0; j < productCount; j++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const brand = brands[Math.floor(Math.random() * brands.length)];
      const estimatedValue = Math.floor(Math.random() * 500000) + 50000; // 50,000〜550,000円
      
      let productName;
      
      if (category === 'カメラ本体') {
        const models = ['α7R V', 'EOS R5', 'Z9', 'X-T5', 'S5 II', 'OM-D E-M1X'];
        const model = models[Math.floor(Math.random() * models.length)];
        productName = `${brand} ${model}`;
      } else if (category === 'レンズ') {
        const lensTypes = ['24-70mm F2.8', '70-200mm F4', '85mm F1.4', '35mm F1.8', '50mm F1.2'];
        const model = lensTypes[Math.floor(Math.random() * lensTypes.length)];
        productName = `${brand} ${model}`;
      } else if (category === '腕時計') {
        const watchModels = ['Submariner', 'Daytona', 'Speedmaster', 'Seamaster', 'G-SHOCK'];
        const model = watchModels[Math.floor(Math.random() * watchModels.length)];
        productName = `${brand} ${model}`;
      } else {
        const accessories = ['ストラップ', 'フィルター', 'バッテリー', 'ケース', 'アダプター'];
        const model = accessories[Math.floor(Math.random() * accessories.length)];
        productName = `${brand} ${model}`;
      }

      await prisma.deliveryPlanProduct.create({
        data: {
          deliveryPlanId: deliveryPlan.id,
          name: productName,
          category,
          estimatedValue,
          description: `${category}の商品。推定価格: ¥${estimatedValue.toLocaleString()}`
        }
      });

      totalValue += estimatedValue;
    }

    // 合計金額を更新
    await prisma.deliveryPlan.update({
      where: { id: deliveryPlan.id },
      data: { totalValue }
    });

    console.log(`✅ 納品プラン ${i + 1} を作成しました: ${planNumber} (${status}, ${productCount}件, ¥${totalValue.toLocaleString()})`);
  }

  // 検品チェックリストデータを作成
  console.log('🔍 検品チェックリストデータを作成中...');
  
  const inspectionProducts = [
    'CAM-SONY-A7IV-001',
    'CAM-SONY-A7R5-008', 
    'CAM-SIGMA-FP-015',
    'CAM-SONY-ZV1-019',
    'WATCH-CASIO-GS-005',
    'WATCH-TAG-CAR-010',
    'WATCH-LONGINES-MASTER-014'
  ];

  for (const productSku of inspectionProducts) {
    const productId = productMap.get(productSku);
    if (productId) {
      await prisma.inspectionChecklist.create({
        data: {
          productId: productId,
          hasScratches: Math.random() > 0.7,
          hasDents: Math.random() > 0.8,
          hasDiscoloration: Math.random() > 0.9,
          hasDust: Math.random() > 0.6,
          powerOn: Math.random() > 0.1,
          allButtonsWork: Math.random() > 0.2,
          screenDisplay: Math.random() > 0.15,
          connectivity: Math.random() > 0.25,
          lensClarity: productSku.includes('CAM') ? Math.random() > 0.2 : true,
          aperture: productSku.includes('CAM') ? Math.random() > 0.3 : true,
          focusAccuracy: productSku.includes('CAM') ? Math.random() > 0.25 : true,
          stabilization: productSku.includes('CAM') ? Math.random() > 0.4 : true,
          createdBy: staff.id,
          notes: `${productSku.includes('CAM') ? 'カメラ' : '腕時計'}の詳細検品を実施。全体的に良好な状態です。`,
        }
      });
      console.log(`✅ 検品チェックリストを作成しました: ${productSku}`);
    }
  }

  // Shipmentデータを作成
  console.log('🚚 出荷データを作成中...');
  
  // 作成した注文データを取得
  const orders = await prisma.order.findMany({
    include: {
      items: {
        include: {
          product: true
        }
      }
    }
  });

  const carriers = ['ヤマト運輸', '佐川急便', '日本郵便', 'FedEx', 'DHL'];
  const methods = ['宅急便', '宅急便コンパクト', 'ネコポス', 'ゆうパック', 'レターパック'];
  const shipmentStatuses = ['pending', 'picked', 'packed', 'shipped', 'delivered'];
  const shipmentPriorities = ['urgent', 'high', 'normal', 'low'];

  for (const order of orders) {
    // 各注文に対して1つ以上のShipmentを作成
    const numShipments = Math.floor(Math.random() * 2) + 1; // 1〜2個のShipment
    
    for (let i = 0; i < numShipments; i++) {
      const carrier = carriers[Math.floor(Math.random() * carriers.length)];
      const method = methods[Math.floor(Math.random() * methods.length)];
      const priority = shipmentPriorities[Math.floor(Math.random() * shipmentPriorities.length)];
      
      // ステータスに応じて適切な設定
      let status = shipmentStatuses[Math.floor(Math.random() * shipmentStatuses.length)];
      
      // 注文のステータスに合わせて調整
      if (order.status === 'delivered') {
        status = 'delivered';
      } else if (order.status === 'shipped') {
        status = Math.random() > 0.5 ? 'shipped' : 'delivered';
      } else if (order.status === 'processing') {
        status = shipmentStatuses[Math.floor(Math.random() * 3)]; // pending, picked, packed のいずれか
      }
      
      const deadline = new Date(Date.now() + Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000); // 今から7日以内
      const trackingNumber = status === 'shipped' || status === 'delivered' 
        ? `${carrier.substring(0, 2).toUpperCase()}${Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0')}`
        : null;
      
      // 各ステータスに応じた日時設定
      const now = new Date();
      const pickedAt = ['picked', 'packed', 'shipped', 'delivered'].includes(status) 
        ? new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000) 
        : null;
      const packedAt = ['packed', 'shipped', 'delivered'].includes(status)
        ? new Date(pickedAt ? pickedAt.getTime() + Math.random() * 4 * 60 * 60 * 1000 : now.getTime())
        : null;
      const shippedAt = ['shipped', 'delivered'].includes(status)
        ? new Date(packedAt ? packedAt.getTime() + Math.random() * 2 * 60 * 60 * 1000 : now.getTime())
        : null;
      const deliveredAt = status === 'delivered'
        ? new Date(shippedAt ? shippedAt.getTime() + Math.random() * 24 * 60 * 60 * 1000 : now.getTime())
        : null;
      
      // 顧客名を取得
      const customer = await prisma.user.findUnique({
        where: { id: order.customerId }
      });
      
      const shipment = await prisma.shipment.create({
        data: {
          orderId: order.id,
          productId: order.items[0]?.productId || null,
          trackingNumber,
          carrier,
          method,
          status,
          priority,
          customerName: customer?.username || 'Unknown Customer',
          address: order.shippingAddress || '住所未設定',
          deadline,
          value: Math.floor(order.totalAmount / numShipments),
          notes: `${carrier}で${method}にて発送${status === 'shipped' || status === 'delivered' ? '済み' : '予定'}`,
          pickedAt,
          packedAt,
          shippedAt,
          deliveredAt,
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // 過去30日以内
        }
      });
      
      console.log(`✅ 出荷データを作成しました: Order ${order.orderNumber} - Shipment ${i + 1} (${status})`);
    }
  }
  
  console.log('📦 商品データ: 30件以上の商品を作成しました（カメラ・腕時計）');
  console.log('📍 ロケーションデータ: 9件のロケーションを作成しました');
  console.log('🛒 注文データ: 8件の注文を作成しました（様々なステータス）');
  console.log('📋 アクティビティデータ: 12件のアクティビティを作成しました');
  console.log('📝 納品プランデータ: 100件の納品プランを作成しました（全ステータス含む）');
  console.log('🎯 ピッキングタスクデータ: 50件のピッキングタスクを作成しました');
  console.log('🚚 出荷データ: 注文に対応する出荷データを作成しました');
  console.log('🔍 検品チェックリストデータ: 7件の検品データを作成しました');
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