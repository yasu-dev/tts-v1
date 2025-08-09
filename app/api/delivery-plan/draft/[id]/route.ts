import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '@/lib/auth';

const prisma = new PrismaClient();

// 下書きの取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await AuthService.requireRole(request, ['seller']);
    const draftId = params.id;

    if (!draftId) {
      return NextResponse.json(
        { error: '下書きIDが必要です' },
        { status: 400 }
      );
    }

    // 下書きを取得
    const draft = await prisma.deliveryPlan.findFirst({
      where: {
        id: draftId,
        sellerId: user.id,
        status: '下書き'
      }
    });

    if (!draft) {
      return NextResponse.json(
        { error: '下書きが見つかりません' },
        { status: 404 }
      );
    }

    // draftDataをJSONから復元
    let draftData = null;
    try {
      if (draft.draftData) {
        draftData = JSON.parse(draft.draftData);
      }
    } catch (parseError) {
      console.error('[ERROR] 下書きデータの復元エラー:', parseError);
      return NextResponse.json(
        { error: '下書きデータの復元に失敗しました' },
        { status: 500 }
      );
    }

    console.log('[INFO] 下書き取得成功:', {
      draftId,
      sellerId: user.id,
      hasDraftData: !!draftData
    });

    return NextResponse.json({
      success: true,
      draft: {
        id: draft.id,
        planNumber: draft.planNumber,
        status: draft.status,
        createdAt: draft.createdAt,
        updatedAt: draft.updatedAt,
        draftData: draftData
      }
    });

  } catch (error) {
    console.error('[ERROR] 下書き取得エラー:', error);
    return NextResponse.json(
      { error: '下書きの取得に失敗しました' },
      { status: 500 }
    );
  }
}

