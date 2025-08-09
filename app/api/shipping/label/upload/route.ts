import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';

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

    // データベースに保存（実際の実装）
    // await prisma.shippingLabel.create({
    //   data: {
    //     orderId: itemId,
    //     fileName,
    //     fileUrl,
    //     provider,
    //     uploadedBy: user.id,
    //     uploadedAt: new Date()
    //   }
    // });

    // ログ記録
    console.log('Shipping label uploaded:', {
      itemId,
      fileName,
      provider,
      uploadedBy: user.username,
      fileSize: file.size
    });

    return NextResponse.json({
      success: true,
      fileUrl,
      fileName,
      provider,
      message: '配送伝票が正常にアップロードされました'
    });

  } catch (error) {
    console.error('Shipping label upload error:', error);
    return NextResponse.json(
      { error: '伝票のアップロード中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 