import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { MockFallback } from '@/lib/mock-fallback';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Prismaを使用して出荷データを取得
    // TODO: 実際のPrismaクエリを実装する際は、以下のような構造になる
    // const shipments = await prisma.shipment.findMany({ where: { status: 'pending' } });
    // const carriers = await prisma.carrier.findMany({ where: { active: true } });
    
    // 現在はモックデータを返す（Prismaスキーマが整備されるまで）
    const shippingData = {
      todayShipments: [
        {
          id: "ship-001",
          orderId: "ORD-2024-0628-001",
          productId: "TWD-CAM-011",
          productName: "Nikon Z8",
          customer: "山田太郎",
          address: "東京都渋谷区1-1-1",
          shippingMethod: "ヤマト宅急便",
          priority: "urgent",
          deadline: "16:00",
          status: "梱包待ち",
          trackingNumber: "",
          value: 398000,
          locationCode: "STD-A-01",
          locationName: "標準棚A-01"
        },
        {
          id: "ship-002",
          orderId: "ORD-2024-0628-002",
          productId: "TWD-LEN-005",
          productName: "Canon RF 24-70mm F2.8",
          customer: "佐藤花子",
          address: "大阪府大阪市中央区1-1-1",
          shippingMethod: "佐川急便",
          priority: "normal",
          deadline: "18:00",
          status: "準備完了",
          trackingNumber: "1234-5678-9012",
          value: 198000,
          locationCode: "STD-A-01",
          locationName: "標準棚A-01"
        },
        {
          id: "ship-003",
          orderId: "ORD-2024-0628-003",
          productId: "TWD-WAT-001",
          productName: "Rolex Submariner",
          customer: "田中一郎",
          address: "愛知県名古屋市中区栄1-1-1",
          shippingMethod: "ヤマト宅急便（保険付き）",
          priority: "urgent",
          deadline: "15:00",
          status: "出荷完了",
          trackingNumber: "YM-2024-062801",
          value: 1200000,
          locationCode: "VAULT-01",
          locationName: "金庫室01"
        },
        {
          id: "ship-004",
          orderId: "ORD-2024-0628-004",
          productId: "TWD-LEN-007",
          productName: "Nikon Z 24-120mm F4 S",
          customer: "鈴木次郎",
          address: "福岡県福岡市博多区1-1-1",
          shippingMethod: "ヤマト宅急便",
          priority: "normal",
          deadline: "17:00",
          status: "梱包待ち",
          trackingNumber: "",
          value: 145000,
          locationCode: "HUM-01",
          locationName: "防湿庫01"
        },
        {
          id: "ship-005",
          orderId: "ORD-2024-0628-005",
          productId: "TWD-CAM-013",
          productName: "Sony α7R V",
          customer: "高橋美咲",
          address: "北海道札幌市中央区1-1-1",
          shippingMethod: "佐川急便",
          priority: "urgent",
          deadline: "16:00",
          status: "梱包待ち",
          trackingNumber: "",
          value: 498000,
          locationCode: "STD-B-02",
          locationName: "標準棚B-02"
        },
        {
          id: "ship-006",
          orderId: "ORD-2024-0628-006",
          productId: "TWD-ACC-021",
          productName: "Peak Design Everyday Backpack 30L",
          customer: "渡辺健太",
          address: "宮城県仙台市青葉区1-1-1",
          shippingMethod: "ゆうパック",
          priority: "normal",
          deadline: "18:00",
          status: "準備完了",
          trackingNumber: "",
          value: 39800,
          locationCode: "STD-B-02",
          locationName: "標準棚B-02"
        }
      ],
      carriers: [
        { id: "yamato", name: "ヤマト運輸", active: true },
        { id: "sagawa", name: "佐川急便", active: true },
        { id: "yupack", name: "ゆうパック", active: true }
      ],
      packingMaterials: [
        { id: "bubble", name: "プチプチ", stock: 50, unit: "m" },
        { id: "box_s", name: "小箱", stock: 120, unit: "個" },
        { id: "box_m", name: "中箱", stock: 80, unit: "個" },
        { id: "box_l", name: "大箱", stock: 45, unit: "個" },
        { id: "cushion", name: "緩衝材", stock: 200, unit: "個" },
        { id: "tape", name: "梱包テープ", stock: 15, unit: "巻" }
      ],
      stats: {
        todayShipped: 12,
        pendingShipments: 8,
        avgProcessingTime: "45分",
        onTimeDeliveryRate: "98.5%"
      }
    };

    return NextResponse.json(shippingData);
  } catch (error) {
    console.error('Shipping API error:', error);
    
    // Prismaエラーの場合はフォールバックデータを使用
    if (MockFallback.isPrismaError(error)) {
      console.log('Using fallback data for shipping due to Prisma error');
      try {
        const fallbackData = {
          todayShipments: [],
          carriers: [],
          packingMaterials: [],
          stats: {
            todayShipped: 0,
            pendingShipments: 0,
            avgProcessingTime: "0分",
            onTimeDeliveryRate: "0%"
          }
        };
        return NextResponse.json(fallbackData);
      } catch (fallbackError) {
        console.error('Fallback data error:', fallbackError);
      }
    }
    
    return NextResponse.json(
      { error: '出荷データの取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'updateCarrierSettings':
        // 配送業者設定の更新
        return NextResponse.json({
          success: true,
          message: '配送業者設定を更新しました',
          data: data
        });

      case 'checkMaterials':
        // 梱包資材の確認
        return NextResponse.json({
          success: true,
          message: '梱包資材を確認しました',
          materials: [
            { name: "プチプチ", available: true, stock: 50 },
            { name: "小箱", available: true, stock: 120 },
            { name: "中箱", available: true, stock: 80 },
            { name: "大箱", available: false, stock: 0 },
            { name: "緩衝材", available: true, stock: 200 },
            { name: "梱包テープ", available: true, stock: 15 }
          ]
        });

      case 'updateShipment':
        // 出荷情報の更新
        return NextResponse.json({
          success: true,
          message: '出荷情報を更新しました',
          shipment: {
            id: data.id,
            status: data.status,
            trackingNumber: data.trackingNumber || `TRK-${Date.now()}`,
            updatedAt: new Date().toISOString()
          }
        });

      default:
        return NextResponse.json(
          { error: '無効なアクションです' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Shipping POST error:', error);
    return NextResponse.json(
      { error: '処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 