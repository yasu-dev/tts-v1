import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // ユーザー認証
    const user = await AuthService.requireRole(request, ['staff', 'admin']);
    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

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
      }
    };

    // デモ環境の場合、モックデータを優先
    if (orderId.startsWith('DEMO-SHIP-') && mockLabelData[orderId]) {
      console.log(`📦 デモ環境: ${orderId}の配送ラベルデータを生成`);
      const labelData = mockLabelData[orderId];
      
      // デモ配送ラベルの場合、PDF生成APIのURLに変更
      labelData.url = `/api/shipping/label/demo/${orderId}`;
      
      return NextResponse.json(labelData);
    }

    // 通常環境：データベースから注文情報とラベル情報を取得
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: orderId },
          { orderNumber: orderId }
        ]
      },
      select: {
        id: true,
        orderNumber: true,
        trackingNumber: true,
        shippingLabelUrl: true,
        shippingLabelFileName: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: '注文が見つかりません' },
        { status: 404 }
      );
    }

    if (!order.shippingLabelUrl || !order.shippingLabelFileName) {
      return NextResponse.json(
        { error: 'ラベルが生成されていません。セラーによるラベル準備をお待ちください。' },
        { status: 404 }
      );
    }

    const labelData = {
      orderId: order.orderNumber,
      url: order.shippingLabelUrl,
      fileName: order.shippingLabelFileName,
      provider: 'fedex' as const,
      uploadedAt: order.updatedAt.toISOString(),
      trackingNumber: order.trackingNumber,
      carrier: 'fedex'
    };

    return NextResponse.json(labelData);

  } catch (error) {
    console.error('Get shipping label error:', error);
    return NextResponse.json(
      { error: 'ラベル情報の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}









