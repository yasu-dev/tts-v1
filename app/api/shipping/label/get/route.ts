import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    if (!orderId) {
      return NextResponse.json({ error: 'orderId は必須です' }, { status: 400 });
    }

    // 注文を検索（id または orderNumber）
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: orderId },
          { orderNumber: orderId }
        ]
      },
      include: {
        activities: true,
        shipments: true,
      }
    });

    if (!order) {
      return NextResponse.json({ error: '対象の注文が見つかりません' }, { status: 404 });
    }

    // 1) activities から最新のラベルイベントを探索
    const labelActivities = (order.activities || []).filter(a =>
      a.type === 'label_generated' || a.type === 'label_uploaded'
    );
    labelActivities.sort((a, b) => (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));

    for (const act of labelActivities) {
      try {
        const meta = act.metadata ? JSON.parse(act.metadata) : {};
        const fileName = meta.fileName;
        const carrier = meta.carrier || (act.type === 'label_generated' ? 'fedex' : (meta.carrier || 'other'));
        if (fileName) {
          // public/labels 直配信が基本。download 経由URLも将来考慮
          const url = fileName.startsWith('http') || fileName.startsWith('/')
            ? (fileName.startsWith('/labels/') ? fileName.replace('/labels/', '/labels/') : `/labels/${fileName}`)
            : `/labels/${fileName}`;
          const provider = act.type === 'label_uploaded' ? 'seller' : 'seller';
          return NextResponse.json({ url, fileName, provider, carrier });
        }
      } catch {}
    }

    // 2) shipments.notes から保管された labelFileUrl を探索（同梱ケース等）
    const shipments = order.shipments || [];
    shipments.sort((a, b) => (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    for (const s of shipments) {
      try {
        if (s.notes) {
          const notes = JSON.parse(s.notes);
          if (notes && notes.labelFileUrl) {
            const fileUrl = notes.labelFileUrl as string;
            const fileName = (notes.fileName as string) || fileUrl.split('/').pop();
            const carrier = (s.carrier || 'other').toLowerCase();
            return NextResponse.json({ url: fileUrl, fileName, provider: 'seller', carrier });
          }
        }
      } catch {}
    }

    // 見つからない
    return NextResponse.json({ error: '配送ラベルが見つかりません' }, { status: 404 });
  } catch (error) {
    console.error('[ERROR] label/get:', error);
    return NextResponse.json({ error: 'ラベル取得中にエラーが発生しました' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('📦 Label API called');

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { error: '注文IDが必要です' },
        { status: 400 }
      );
    }

    // デモ環境用のモック配送ラベルデータ
    const mockLabelData: Record<string, any> = {
      'DEMO-SHIP-001': {
        orderId: 'DEMO-SHIP-001',
        url: '/api/shipping/label/demo/DEMO-SHIP-001.pdf',
        fileName: 'fedex-label-DEMO-SHIP-001.pdf',
        provider: 'fedex',
        trackingNumber: 'FX123456789JP',
        carrier: 'fedex',
        uploadedAt: new Date().toISOString()
      },
      'DEMO-SHIP-002': {
        orderId: 'DEMO-SHIP-002',
        url: '/api/shipping/label/demo/DEMO-SHIP-002.pdf',
        fileName: 'dhl-label-DEMO-SHIP-002.pdf',
        provider: 'dhl',
        trackingNumber: 'DHL987654321JP',
        carrier: 'dhl',
        uploadedAt: new Date().toISOString()
      },
      'DEMO-SHIP-003': {
        orderId: 'DEMO-SHIP-003',
        url: '/api/shipping/label/demo/DEMO-SHIP-003.pdf',
        fileName: 'yamato-label-DEMO-SHIP-003.pdf',
        provider: 'yamato',
        trackingNumber: 'YMT456789012JP',
        carrier: 'yamato',
        uploadedAt: new Date().toISOString()
      },
      'DEMO-SHIP-004': {
        orderId: 'DEMO-SHIP-004',
        url: '/api/shipping/label/demo/DEMO-SHIP-004.pdf',
        fileName: 'fedex-label-DEMO-SHIP-004.pdf',
        provider: 'fedex',
        trackingNumber: 'FX789123456JP',
        carrier: 'fedex',
        uploadedAt: new Date().toISOString()
      },
      // 注文番号ベースでも対応
      'ORD-20240101-001': {
        orderId: 'ORD-20240101-001',
        url: '/api/shipping/label/demo/ORD-20240101-001.pdf',
        fileName: 'fedex-label-ORD-20240101-001.pdf',
        provider: 'seller',
        trackingNumber: 'FX123456789JP',
        carrier: 'fedex',
        uploadedAt: new Date().toISOString()
      },
      'ORD-20240101-002': {
        orderId: 'ORD-20240101-002',
        url: '/api/shipping/label/demo/ORD-20240101-002.pdf',
        fileName: 'dhl-label-ORD-20240101-002.pdf',
        provider: 'seller',
        trackingNumber: 'DHL987654321JP',
        carrier: 'dhl',
        uploadedAt: new Date().toISOString()
      },
      'ORD-20240102-001': {
        orderId: 'ORD-20240102-001',
        url: '/api/shipping/label/demo/ORD-20240102-001.pdf',
        fileName: 'yamato-label-ORD-20240102-001.pdf',
        provider: 'seller',
        trackingNumber: 'YMT456789012JP',
        carrier: 'yamato',
        uploadedAt: new Date().toISOString()
      },
      'ORD-20240102-002': {
        orderId: 'ORD-20240102-002',
        url: '/api/shipping/label/demo/ORD-20240102-002.pdf',
        fileName: 'fedex-label-ORD-20240102-002.pdf',
        provider: 'seller',
        trackingNumber: 'FX789123456JP',
        carrier: 'fedex',
        uploadedAt: new Date().toISOString()
      }
    };

    // デモ環境の場合、モックデータを優先（全ての注文IDに対して対応）
    if (mockLabelData[orderId]) {
      console.log(`📦 デモ環境: ${orderId}の配送ラベルデータを生成`);
      const labelData = mockLabelData[orderId];
      
      // デモ配送ラベルの場合、PDF生成APIのURLに変更
      labelData.url = `/api/shipping/label/demo/${orderId}`;
      
      return NextResponse.json(labelData);
    }
    
    // デモ環境用：パターンマッチング（ORD-で始まる注文番号など）
    if (orderId.startsWith('DEMO-SHIP-') || orderId.startsWith('ORD-')) {
      console.log(`📦 デモ環境: ${orderId}用の汎用ラベルデータを生成`);
      const genericLabelData = {
        orderId: orderId,
        url: `/api/shipping/label/demo/${orderId}`,
        fileName: `label-${orderId}.pdf`,
        provider: 'seller',
        trackingNumber: `TRK${Date.now().toString().slice(-9)}`,
        carrier: 'fedex',
        uploadedAt: new Date().toISOString()
      };
      
      return NextResponse.json(genericLabelData);
    }

    // すべてのパターンに対してデモラベルデータを返す（簡略化）
    console.log(`📦 汎用デモラベル生成: ${orderId}`);
    const fallbackLabelData = {
      orderId: orderId,
      url: `/api/shipping/label/demo/${orderId}`,
      fileName: `label-${orderId}.pdf`,
      provider: 'seller',
      trackingNumber: `TRK${Date.now().toString().slice(-9)}`,
      carrier: 'fedex',
      uploadedAt: new Date().toISOString()
    };
    
    return NextResponse.json(fallbackLabelData);

  } catch (error) {
    console.error('Get shipping label error:', error);
    return NextResponse.json(
      { error: 'ラベル情報の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}









