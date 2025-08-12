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

    // データベースから注文情報とラベル情報を取得
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









