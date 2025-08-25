import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await AuthService.getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const productId = params.id;

    // 商品に関連する検品チェックリストを取得
    const checklist = await prisma.inspectionChecklist.findUnique({
      where: { productId },
    });

    if (!checklist) {
      // 商品のメタデータから納品プラン商品IDを取得して検索
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (product?.metadata) {
        const metadata = JSON.parse(product.metadata);
        if (metadata.deliveryPlanProductId) {
          const deliveryPlanChecklist = await prisma.inspectionChecklist.findUnique({
            where: { deliveryPlanProductId: metadata.deliveryPlanProductId },
          });

          if (deliveryPlanChecklist) {
            return NextResponse.json(deliveryPlanChecklist);
          }
        }
      }

      return NextResponse.json(null);
    }

    return NextResponse.json(checklist);
  } catch (error) {
    console.error('Error fetching inspection checklist:', error);
    return NextResponse.json(
      { error: '検品チェックリストの取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await AuthService.requireRole(request, ['staff', 'admin']);
    const productId = params.id;
    const body = await request.json();

    // 商品の存在確認
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: '商品が見つかりません' },
        { status: 404 }
      );
    }

    // 検品チェックリストを作成または更新
    const checklist = await prisma.inspectionChecklist.upsert({
      where: { productId },
      create: {
        productId,
        hasScratches: body.hasScratches || false,
        hasDents: body.hasDents || false,
        hasDiscoloration: body.hasDiscoloration || false,
        hasDust: body.hasDust || false,
        powerOn: body.powerOn || false,
        allButtonsWork: body.allButtonsWork || false,
        screenDisplay: body.screenDisplay || false,
        connectivity: body.connectivity || false,
        lensClarity: body.lensClarity || false,
        aperture: body.aperture || false,
        focusAccuracy: body.focusAccuracy || false,
        stabilization: body.stabilization || false,
        notes: body.notes || null,
        createdBy: user.username || user.email,
        verifiedBy: user.username || user.email,
        verifiedAt: new Date(),
      },
      update: {
        hasScratches: body.hasScratches,
        hasDents: body.hasDents,
        hasDiscoloration: body.hasDiscoloration,
        hasDust: body.hasDust,
        powerOn: body.powerOn,
        allButtonsWork: body.allButtonsWork,
        screenDisplay: body.screenDisplay,
        connectivity: body.connectivity,
        lensClarity: body.lensClarity,
        aperture: body.aperture,
        focusAccuracy: body.focusAccuracy,
        stabilization: body.stabilization,
        notes: body.notes,
        verifiedBy: user.username || user.email,
        verifiedAt: new Date(),
        updatedBy: user.username || user.email,
      },
    });

    return NextResponse.json({
      success: true,
      checklist,
      message: '検品チェックリストを更新しました',
    });
  } catch (error) {
    console.error('Error updating inspection checklist:', error);
    return NextResponse.json(
      { error: '検品チェックリストの更新に失敗しました' },
      { status: 500 }
    );
  }
}