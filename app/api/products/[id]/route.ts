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

    // productIdまたはSKUで商品を検索（deliveryPlanInfo含む）
    let product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        seller: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        currentLocation: true,
      },
    });

    // IDで見つからない場合、SKUで検索を試行
    if (!product) {
      product = await prisma.product.findUnique({
        where: { sku: productId },
        include: {
          seller: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          currentLocation: true,
        },
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
        include: {
          seller: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          currentLocation: true,
        },
      });
    }

    if (!product) {
      return NextResponse.json(
        { error: '商品が見つかりません' },
        { status: 404 }
      );
    }

    // 商品のメタデータから納品プラン情報を取得
    let enrichedProduct = { ...product };
    
    if (product.metadata) {
      try {
        const metadata = JSON.parse(product.metadata);
        
        // 納品プラン関連の情報がある場合
        if (metadata.deliveryPlanId && metadata.deliveryPlanProductId) {
          // DeliveryPlanProductから撮影要望データを取得
          const deliveryPlanProduct = await prisma.deliveryPlanProduct.findUnique({
            where: { id: metadata.deliveryPlanProductId },
            include: {
              images: true,
            },
          });

          if (deliveryPlanProduct) {
            // photographyRequestsをパースして追加
            let photographyRequests = null;
            console.log('[DEBUG] deliveryPlanProduct.photographyRequests raw:', deliveryPlanProduct.photographyRequests);
            if (deliveryPlanProduct.photographyRequests) {
              try {
                photographyRequests = JSON.parse(deliveryPlanProduct.photographyRequests);
                console.log('[DEBUG] Parsed photographyRequests:', JSON.stringify(photographyRequests, null, 2));
              } catch (e) {
                console.warn('Photography requests parse error:', e);
              }
            } else {
              console.log('[DEBUG] No photographyRequests found in deliveryPlanProduct');
            }

            // deliveryPlanInfoを構築
            enrichedProduct.deliveryPlanInfo = {
              deliveryPlanId: metadata.deliveryPlanId,
              deliveryPlanProductId: metadata.deliveryPlanProductId,
              condition: metadata.condition || product.condition,
              purchasePrice: metadata.purchasePrice || product.price,
              purchaseDate: metadata.purchaseDate,
              supplier: metadata.supplier,
              supplierDetails: metadata.supplierDetails,
              photographyRequests: photographyRequests,
              images: deliveryPlanProduct.images || [],
            };
            
            console.log('[DEBUG] Final enrichedProduct.deliveryPlanInfo:', JSON.stringify(enrichedProduct.deliveryPlanInfo, null, 2));
          }
        }
      } catch (e) {
        console.warn('Product metadata parse error:', e);
        // メタデータのパースエラーは無視して続行
      }
    }

    return NextResponse.json(enrichedProduct);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: '商品情報の取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await AuthService.requireRole(request, ['staff', 'admin', 'seller']);
    const productId = params.id;
    const body = await request.json();

    // 商品の存在確認
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: '商品が見つかりません' },
        { status: 404 }
      );
    }

    // セラーは自分の商品のみ更新可能
    if (user.role === 'seller' && existingProduct.sellerId !== user.id) {
      return NextResponse.json(
        { error: '権限がありません' },
        { status: 403 }
      );
    }

    // 商品情報を更新
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name: body.name ?? existingProduct.name,
        category: body.category ?? existingProduct.category,
        price: body.price ?? existingProduct.price,
        condition: body.condition ?? existingProduct.condition,
        description: body.description ?? existingProduct.description,
        imageUrl: body.imageUrl ?? existingProduct.imageUrl,
        status: body.status ?? existingProduct.status,
        currentLocationId: body.currentLocationId ?? existingProduct.currentLocationId,
        metadata: body.metadata ?? existingProduct.metadata,
      },
    });

    // アクティビティログを記録
    await prisma.activity.create({
      data: {
        type: 'product_update',
        description: `商品 ${updatedProduct.name} が更新されました`,
        userId: user.id,
        productId: updatedProduct.id,
        metadata: JSON.stringify({
          updatedFields: Object.keys(body),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      product: updatedProduct,
      message: '商品情報を更新しました',
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: '商品情報の更新に失敗しました' },
      { status: 500 }
    );
  }
}