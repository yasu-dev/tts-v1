import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // ユーザー認証 - セラーもアップロード可能に
    const user = await AuthService.requireRole(request, ['seller', 'staff', 'admin']);
    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    // FormDataを取得
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const itemId = formData.get('itemId') as string;
    const provider = formData.get('provider') as 'seller' | 'worlddoor';
    const type = formData.get('type') as string;

    if (!file || !itemId || !provider) {
      return NextResponse.json(
        { error: '必須パラメータが不足しています' },
        { status: 400 }
      );
    }

    // ファイルサイズチェック（10MB以下）
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'ファイルサイズは10MB以下にしてください' },
        { status: 400 }
      );
    }

    // ファイル形式チェック
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'PDF、JPEG、PNGファイルのみアップロード可能です' },
        { status: 400 }
      );
    }

    // 実際の実装では、ここでファイルをS3等にアップロード
    // 今回はモック実装
    const timestamp = Date.now();
    const fileName = `shipping-label-${itemId}-${timestamp}.${file.type.split('/')[1]}`;
    const fileUrl = `/api/shipping/label/download/${fileName}`;

    // 注文情報を取得してステータス更新
    try {
      // 注文を取得
      const order = await prisma.order.findFirst({
        where: {
          OR: [
            { id: itemId },
            { orderNumber: itemId }
          ]
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });

      if (!order) {
        throw new Error('対象の注文が見つかりません');
      }

      // 注文ステータスを processing に更新
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'processing'
        }
      });

      // 関連商品のステータスを ordered に更新
      const productIds = order.items.map(item => item.productId);
      await prisma.product.updateMany({
        where: {
          id: { in: productIds }
        },
        data: {
          status: 'ordered'
        }
      });

      // アクティビティログを記録
      await prisma.activity.create({
        data: {
          type: 'label_uploaded',
          description: `外部配送業者のラベルがアップロードされました`,
          userId: user.id,
          orderId: order.id,
          metadata: JSON.stringify({
            fileName,
            provider,
            fileSize: file.size,
            fileType: file.type
          })
        }
      });

      // ログ記録
      console.log('Shipping label uploaded and status updated:', {
        orderId: order.id,
        fileName,
        provider,
        uploadedBy: user.username,
        fileSize: file.size,
        productsUpdated: productIds.length
      });

      return NextResponse.json({
        success: true,
        fileUrl,
        fileName,
        provider,
        orderId: order.id,
        productsUpdated: productIds.length,
        message: '配送伝票がアップロードされ、ピッキング開始可能になりました'
      });

    } catch (dbError) {
      console.error('データベース処理エラー:', dbError);
      // ファイルアップロードは成功したが、DB更新に失敗した場合
      return NextResponse.json({
        success: true,
        fileUrl,
        fileName,
        provider,
        warning: 'ファイルはアップロードされましたが、ステータス更新に失敗しました',
        dbError: dbError instanceof Error ? dbError.message : '不明なエラー'
      });
    }

  } catch (error) {
    console.error('Shipping label upload error:', error);
    return NextResponse.json(
      { error: '伝票のアップロード中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 