import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    console.log('[DEBUG] Inspection POST request received');
    
    // 🔍 デバッグ: ユーザー情報を詳しく確認
    const currentUser = await AuthService.getUserFromRequest(request);
    console.log('[DEBUG] Current user:', currentUser);
    console.log('[DEBUG] User role:', currentUser?.role);
    console.log('[DEBUG] Required roles:', ['staff', 'admin']);
    
    const user = await AuthService.requireRole(request, ['staff', 'admin']);
    console.log('[DEBUG] User authenticated:', user?.username);

    const body = await request.json();
    console.log('[DEBUG] Request body:', body);
    const { productId, inspectionNotes, condition, status, locationId, skipPhotography, photographyDate } = body;

    if (!productId) {
      console.log('[ERROR] ProductId is missing');
      return NextResponse.json(
        { error: '商品IDが必要です' },
        { status: 400 }
      );
    }

    // productIdまたはSKUで商品を検索
    console.log('[DEBUG] Searching for product with ID:', productId);
    let product = await prisma.product.findUnique({
      where: { id: productId },
    });
    console.log('[DEBUG] Product found by ID:', !!product);

    // IDで見つからない場合、SKUで検索を試行
    if (!product) {
      console.log('[DEBUG] Searching by SKU:', productId);
      product = await prisma.product.findUnique({
        where: { sku: productId },
      });
      console.log('[DEBUG] Product found by SKU:', !!product);
    }

    // それでも見つからない場合、SKUの末尾で検索（例：006 -> CAM-*-006）
    if (!product) {
      console.log('[DEBUG] Searching by SKU ending with:', `-${productId}`);
      product = await prisma.product.findFirst({
        where: { 
          sku: { 
            endsWith: `-${productId}` 
          } 
        },
      });
      console.log('[DEBUG] Product found by SKU ending:', !!product);
    }

    if (!product) {
      console.log('[ERROR] Product not found with ID:', productId);
      return NextResponse.json(
        { error: '商品が見つかりません' },
        { status: 404 }
      );
    }

    console.log('[DEBUG] Found product:', { id: product.id, name: product.name, sku: product.sku });

    // Prepare metadata for inspection and photography status tracking
    const currentMetadata = product.metadata ? JSON.parse(product.metadata) : {};
    const updatedMetadata = {
      ...currentMetadata,
      inspectionCompleted: true,
      inspectionDate: new Date().toISOString(),
      photographyCompleted: skipPhotography ? false : !!photographyDate,
      ...(photographyDate && { photographyDate }),
      skipPhotography: !!skipPhotography,
    };

    // Update product with inspection data
    console.log('[DEBUG] Updating product with inspection data');
    console.log('[DEBUG] Update data:', {
      inspectedAt: new Date(),
      inspectedBy: user.username,
      inspectionNotes,
      metadata: JSON.stringify(updatedMetadata),
      condition,
      status: 'inspection',
      locationId
    });
    
    let updatedProduct;
    try {
      updatedProduct = await prisma.product.update({
        where: { id: product.id },
        data: {
          inspectedAt: new Date(),
          inspectedBy: user.username,
          inspectionNotes,
          metadata: JSON.stringify(updatedMetadata),
          ...(condition && {
            condition: condition.replace('新品', 'new')
                              .replace('新品同様', 'like_new')
                              .replace('極美品', 'excellent')
                              .replace('美品', 'very_good')
                              .replace('良品', 'good')
                              .replace('中古美品', 'fair')
                              .replace('中古', 'poor'),
          }),
          status: 'inspection',
          ...(locationId && { currentLocationId: locationId }),
        },
      });
      console.log('[DEBUG] Product updated successfully');
    } catch (updateError) {
      console.error('[ERROR] Failed to update product:', updateError);
      throw updateError;
    }

    // Create inventory movement if location changed
    if (locationId && locationId !== product.currentLocationId) {
      await prisma.inventoryMovement.create({
        data: {
          productId: product.id,
          fromLocationId: product.currentLocationId,
          toLocationId: locationId,
          movedBy: user.username,
          notes: '検品による移動',
        },
      });
    }

    // 検品チェックリストがある場合は更新
    const existingChecklist = await prisma.inspectionChecklist.findUnique({
      where: { productId: product.id },
    });

    if (existingChecklist) {
      await prisma.inspectionChecklist.update({
        where: { id: existingChecklist.id },
        data: {
          verifiedBy: user.username,
          verifiedAt: new Date(),
          updatedBy: user.username,
        },
      });
    }

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'inspection',
        description: `商品 ${product.name} の検品が完了しました`,
        userId: user.id,
        productId: product.id,
        metadata: JSON.stringify({
          condition,
          notes: inspectionNotes,
          skipPhotography,
          inspectionCompleted: true,
          photographyCompleted: !skipPhotography,
          hasExistingChecklist: !!existingChecklist,
        }),
      },
    });

    return NextResponse.json({ 
      success: true, 
      product: updatedProduct,
      message: '検品データを登録しました'
    });
  } catch (error) {
    console.error('Inspection registration error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    return NextResponse.json(
      { 
        error: '検品データ登録中にエラーが発生しました',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await AuthService.requireRole(request, ['staff', 'admin']);

    const body = await request.json();
    const { productId, status } = body;

    if (!productId || !status) {
      return NextResponse.json(
        { error: '商品IDとステータスが必要です' },
        { status: 400 }
      );
    }

    const validStatuses = ['inspection', 'storage', 'listing'];
    const mappedStatus = status.replace('検品', 'inspection')
                              .replace('保管', 'storage')
                              .replace('出品', 'listing');

    if (!validStatuses.includes(mappedStatus)) {
      return NextResponse.json(
        { error: '無効なステータスです' },
        { status: 400 }
      );
    }

    // productIdまたはSKUで商品を検索
    let product = await prisma.product.findUnique({
      where: { id: productId },
    });

    // IDで見つからない場合、SKUで検索を試行
    if (!product) {
      product = await prisma.product.findUnique({
        where: { sku: productId },
      });
    }

    // それでも見つからない場合、SKUの末尾で検索（例：006 -> CAM-*-006）
    if (!product) {
      product = await prisma.product.findFirst({
        where: { 
          sku: { 
            endsWith: `-${productId}` 
          } 
        },
      });
    }

    if (!product) {
      return NextResponse.json(
        { error: '商品が見つかりません' },
        { status: 404 }
      );
    }

    const updatedProduct = await prisma.product.update({
      where: { id: product.id },
      data: {
        status: mappedStatus,
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'status_change',
        description: `商品 ${product.name} のステータスが ${status} に変更されました`,
        userId: user.id,
        productId: product.id,
        metadata: JSON.stringify({
          fromStatus: product.status,
          toStatus: mappedStatus,
        }),
      },
    });

    return NextResponse.json({ 
      success: true, 
      product: updatedProduct,
      message: 'ステータスを更新しました'
    });
  } catch (error) {
    console.error('Status update error:', error);
    return NextResponse.json(
      { error: 'ステータス更新中にエラーが発生しました' },
      { status: 500 }
    );
  }
}