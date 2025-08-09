import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';

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

    // 実際の実装では、データベースからラベル情報を取得
    // ここではモック実装
    
    // モックデータ: セラーがアップロードしたラベルの情報
    const mockLabelData = {
      orderId,
      url: `/api/shipping/label/download/shipping-label-${orderId}-mock.pdf`,
      fileName: `shipping-label-${orderId}.pdf`,
      provider: 'seller' as const,
      uploadedAt: new Date().toISOString(),
      trackingNumber: `TRACK-${Date.now()}`,
      carrier: 'fedex'
    };

    // ランダムでラベルが存在しない場合をシミュレート（20%の確率）
    if (Math.random() < 0.2) {
      return NextResponse.json(
        { error: 'ラベルが見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json(mockLabelData);

  } catch (error) {
    console.error('Get shipping label error:', error);
    return NextResponse.json(
      { error: 'ラベル情報の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}








