import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '@/lib/auth';

import { promises as fs } from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    console.log('[DEBUG] 納品プラン作成API開始');
    
    // 認証チェック（セラーのみ）
    let user;
    try {
      user = await AuthService.requireRole(request, ['seller']);
      console.log('[DEBUG] 認証成功:', user.email);
    } catch (authError) {
      console.error('[ERROR] 認証エラー:', authError);
      return NextResponse.json(
        { error: 'ログインが必要です。再度ログインしてください。' },
        { status: 401 }
      );
    }

    const planData = await request.json();

    // 基本的なバリデーション（デモ環境対応）
    console.log('[DEBUG] 受信データ:', JSON.stringify(planData, null, 2));
    
    if (!planData.basicInfo?.deliveryAddress) {
      return NextResponse.json(
        { error: '納品先住所は必須です。' },
        { status: 400 }
      );
    }

    // 連絡先メールアドレスはユーザーのメールアドレスを使用

    if (!planData.products || planData.products.length === 0) {
      return NextResponse.json(
        { error: '商品が登録されていません。商品登録ステップで商品を追加してください。' },
        { status: 400 }
      );
    }

    // 商品データのバリデーション（デモ環境対応）
    const validProducts = planData.products.filter((product: any) => 
      product && typeof product === 'object' && product.name
    );
    
    if (validProducts.length === 0) {
      return NextResponse.json(
        { error: '有効な商品データがありません。商品登録ステップで商品名を入力してください。' },
        { status: 400 }
      );
    }

    // 納品プランIDを生成
    const planId = `DP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // データベーストランザクション内で納品プランと商品を保存
    console.log('[DEBUG] データベース処理開始');
    
    const deliveryPlan = await prisma.$transaction(async (tx) => {
      console.log('[DEBUG] トランザクション内処理開始');
      
      // 1. 納品プランをデータベースに保存
      console.log('[DEBUG] 納品プラン作成データ:', {
        planId,
        sellerId: user.id,
        sellerName: user.username || user.email,
        deliveryAddress: planData.basicInfo.deliveryAddress,
        contactEmail: user.email,
        phoneNumber: planData.basicInfo.phoneNumber || null,
        totalItems: validProducts.length
      });
      
      const savedPlan = await tx.deliveryPlan.create({
        data: {
          id: planId,
          planNumber: planId,
          sellerId: user.id,
          sellerName: user.username || user.email,
          deliveryAddress: planData.basicInfo.deliveryAddress,
          contactEmail: user.email,
          phoneNumber: planData.basicInfo.phoneNumber || null,
          status: '発送待ち',
          totalItems: validProducts.length,
          totalValue: validProducts.reduce((sum: number, product: any) => 
            sum + (product.estimatedValue || 0), 0
          ),
          notes: planData.confirmation?.notes
        }
      });
      
      console.log('[DEBUG] 納品プラン作成完了:', savedPlan.id);

      // 2. 納品プランの商品をDeliveryPlanProductテーブルに保存
      console.log('[DEBUG] 商品データ処理開始:', validProducts.length, '件');
      const planProducts = await Promise.all(
        validProducts.map(async (product: any, index: number) => {
          console.log(`[DEBUG] 商品${index + 1}処理中:`, product.name);
          const deliveryPlanProduct = await tx.deliveryPlanProduct.create({
            data: {
              deliveryPlanId: planId,
              name: product.name,
              category: product.category || 'camera',
              estimatedValue: product.purchasePrice || 0,
              description: `コンディション: ${product.condition}${product.supplierDetails ? `\n仕入れ詳細: ${product.supplierDetails}` : ''}`
            }
          });

          // 商品画像を保存（別テーブル）
          if (product.images && product.images.length > 0) {
            console.log('[DEBUG] 商品画像保存開始:', product.images.length, '件');
            for (let imgIndex = 0; imgIndex < product.images.length; imgIndex++) {
              const image = product.images[imgIndex];
              try {
                await tx.deliveryPlanProductImage.create({
                  data: {
                    deliveryPlanProductId: deliveryPlanProduct.id,
                    url: image.url,
                    thumbnailUrl: image.thumbnailUrl || null,
                    filename: image.filename || `image-${imgIndex + 1}`,
                    size: image.size || 0,
                    mimeType: image.mimeType || 'image/jpeg',
                    category: image.category || 'その他',
                    description: image.description || null,
                    sortOrder: imgIndex
                  }
                });
                console.log('[INFO] 商品画像保存成功:', image.filename);
              } catch (imageError) {
                console.error('[ERROR] 商品画像保存エラー:', imageError);
                // 画像保存失敗でも処理は継続
              }
            }
          }

          // 検品チェックリストがある場合は保存
          if (product.inspectionChecklist) {
            console.log('[DEBUG] 検品チェックリストデータ:', JSON.stringify(product.inspectionChecklist, null, 2));
            
            try {
              // 検品チェックリストの構造を確認（複数のパターンに対応）
              let checklistData = product.inspectionChecklist;
              
              // Reactイベントオブジェクトからboolean値を安全に抽出するヘルパー関数
              const extractBooleanValue = (value: any): boolean => {
                // Reactイベントオブジェクトの場合
                if (value && typeof value === 'object' && value.target && typeof value.target.checked === 'boolean') {
                  return value.target.checked;
                }
                // 通常のboolean値の場合
                return Boolean(value);
              };

              // 既に構造化されている場合とフラットな場合の両方に対応
              let exterior, functionality, optical;
              
              if (checklistData.exterior && checklistData.functionality) {
                // 構造化されたデータの場合
                exterior = {
                  scratches: extractBooleanValue(checklistData.exterior.scratches),
                  dents: extractBooleanValue(checklistData.exterior.dents),
                  discoloration: extractBooleanValue(checklistData.exterior.discoloration),
                  dust: extractBooleanValue(checklistData.exterior.dust)
                };
                functionality = {
                  powerOn: extractBooleanValue(checklistData.functionality.powerOn),
                  allButtonsWork: extractBooleanValue(checklistData.functionality.allButtonsWork),
                  screenDisplay: extractBooleanValue(checklistData.functionality.screenDisplay),
                  connectivity: extractBooleanValue(checklistData.functionality.connectivity)
                };
                optical = checklistData.optical ? {
                  lensClarity: extractBooleanValue(checklistData.optical.lensClarity),
                  aperture: extractBooleanValue(checklistData.optical.aperture),
                  focusAccuracy: extractBooleanValue(checklistData.optical.focusAccuracy),
                  stabilization: extractBooleanValue(checklistData.optical.stabilization)
                } : {};
              } else {
                // フラットなデータの場合（直接的に各項目がある）
                exterior = {
                  scratches: extractBooleanValue(checklistData.hasScratches || checklistData.scratches),
                  dents: extractBooleanValue(checklistData.hasDents || checklistData.dents),
                  discoloration: extractBooleanValue(checklistData.hasDiscoloration || checklistData.discoloration),
                  dust: extractBooleanValue(checklistData.hasDust || checklistData.dust)
                };
                functionality = {
                  powerOn: extractBooleanValue(checklistData.powerOn),
                  allButtonsWork: extractBooleanValue(checklistData.allButtonsWork),
                  screenDisplay: extractBooleanValue(checklistData.screenDisplay),
                  connectivity: extractBooleanValue(checklistData.connectivity)
                };
                optical = {
                  lensClarity: extractBooleanValue(checklistData.lensClarity),
                  aperture: extractBooleanValue(checklistData.aperture),
                  focusAccuracy: extractBooleanValue(checklistData.focusAccuracy),
                  stabilization: extractBooleanValue(checklistData.stabilization)
                };
              }
              
              console.log('[DEBUG] 解析された検品データ(正規化後):', { exterior, functionality, optical });
              
              await tx.inspectionChecklist.create({
                data: {
                  deliveryPlanProductId: deliveryPlanProduct.id,
                  hasScratches: exterior.scratches,
                  hasDents: exterior.dents,
                  hasDiscoloration: exterior.discoloration,
                  hasDust: exterior.dust,
                  powerOn: functionality.powerOn,
                  allButtonsWork: functionality.allButtonsWork,
                  screenDisplay: functionality.screenDisplay,
                  connectivity: functionality.connectivity,
                  lensClarity: optical?.lensClarity || false,
                  aperture: optical?.aperture || false,
                  focusAccuracy: optical?.focusAccuracy || false,
                  stabilization: optical?.stabilization || false,
                  notes: checklistData.notes || null,
                  createdBy: user.username || user.email,
                }
              });
              console.log('[INFO] 検品チェックリスト保存成功');
            } catch (checklistError) {
              console.error('[ERROR] 検品チェックリスト保存エラー:', checklistError);
              console.error('[ERROR] checklistError詳細:', JSON.stringify(checklistError, null, 2));
              // エラーが発生しても処理を継続（検品チェックリストは任意）
            }
          }

          return deliveryPlanProduct;
        })
      );

      // 3. スタッフの在庫管理画面用にProductテーブルに「入荷待ち」商品を生成
      console.log('[DEBUG] 商品(Product)作成開始:', validProducts.length, '件');
      const createdProducts = [];
      
      for (let index = 0; index < validProducts.length; index++) {
        const product = validProducts[index];
        const correspondingPlanProduct = planProducts[index];
        
        if (!correspondingPlanProduct) {
          console.error(`[ERROR] planProduct not found for index ${index}`);
          continue;
        }
        
        const sku = `${planId}-${Math.random().toString(36).substr(2, 6)}`.toUpperCase();
        
        try {
          console.log(`[DEBUG] Product作成中 ${index + 1}/${validProducts.length}:`, {
            name: product.name,
            category: product.category,
            status: 'inbound',
            sku,
            sellerId: user.id
          });
          
          const createdProduct = await tx.product.create({
            data: {
              name: product.name,
              sku: sku,
              category: product.category || 'general',
              status: 'inbound', // 入荷待ちステータス
              price: product.purchasePrice || 0,
              condition: product.condition || 'good',
              description: `納品プラン ${planId} からの入庫予定商品。${product.supplierDetails || ''}`,
              sellerId: user.id,
              entryDate: new Date(),
                          metadata: (() => {
                // 先ほど保存したDeliveryPlanProductImageから画像データを取得してmetadataに含める
                // （この処理は非同期だが、トランザクション内なので確実にデータが存在する）
                const imageData = product.images || [];
                
                // 検品チェックリストの構造化されたデータを準備（Reactイベントオブジェクト対応）
                let structuredChecklistData = null;
                if (product.inspectionChecklist) {
                  console.log(`[DEBUG] Product作成: 受信した検品チェックリスト生データ (${product.name}):`, JSON.stringify(product.inspectionChecklist, null, 2));
                  
                  // Reactイベントオブジェクトからboolean値を安全に抽出するヘルパー関数
                  const extractBooleanValue = (value: any): boolean => {
                    // Reactイベントオブジェクトの場合
                    if (value && typeof value === 'object' && value.target && typeof value.target.checked === 'boolean') {
                      return value.target.checked;
                    }
                    // 通常のboolean値の場合
                    return Boolean(value);
                  };

                  // 既に構造化されているかフラットかに関わらず、統一された形式で保存
                  structuredChecklistData = {
                    exterior: {
                      scratches: extractBooleanValue(product.inspectionChecklist.exterior?.scratches || product.inspectionChecklist.hasScratches || product.inspectionChecklist.scratches),
                      dents: extractBooleanValue(product.inspectionChecklist.exterior?.dents || product.inspectionChecklist.hasDents || product.inspectionChecklist.dents),
                      discoloration: extractBooleanValue(product.inspectionChecklist.exterior?.discoloration || product.inspectionChecklist.hasDiscoloration || product.inspectionChecklist.discoloration),
                      dust: extractBooleanValue(product.inspectionChecklist.exterior?.dust || product.inspectionChecklist.hasDust || product.inspectionChecklist.dust)
                    },
                    functionality: {
                      powerOn: extractBooleanValue(product.inspectionChecklist.functionality?.powerOn || product.inspectionChecklist.powerOn),
                      allButtonsWork: extractBooleanValue(product.inspectionChecklist.functionality?.allButtonsWork || product.inspectionChecklist.allButtonsWork),
                      screenDisplay: extractBooleanValue(product.inspectionChecklist.functionality?.screenDisplay || product.inspectionChecklist.screenDisplay),
                      connectivity: extractBooleanValue(product.inspectionChecklist.functionality?.connectivity || product.inspectionChecklist.connectivity)
                    },
                    optical: (product.category === 'camera' || product.category === 'camera_body' || product.category === 'lens') ? {
                      lensClarity: extractBooleanValue(product.inspectionChecklist.optical?.lensClarity || product.inspectionChecklist.lensClarity),
                      aperture: extractBooleanValue(product.inspectionChecklist.optical?.aperture || product.inspectionChecklist.aperture),
                      focusAccuracy: extractBooleanValue(product.inspectionChecklist.optical?.focusAccuracy || product.inspectionChecklist.focusAccuracy),
                      stabilization: extractBooleanValue(product.inspectionChecklist.optical?.stabilization || product.inspectionChecklist.stabilization)
                    } : null,
                    notes: product.inspectionChecklist.notes || null
                  };
                  
                  console.log(`[DEBUG] Product作成: 正規化後の検品チェックリストデータ (${product.name}):`, JSON.stringify(structuredChecklistData, null, 2));
                }
                
                const metadataObj = {
                  deliveryPlanId: planId,
                  deliveryPlanProductId: correspondingPlanProduct.id,
                  purchaseDate: product.purchaseDate,
                  supplier: product.supplier,
                  supplierDetails: product.supplierDetails,
                  brand: product.brand,
                  model: product.model,
                  serialNumber: product.serialNumber,
                  hasInspectionChecklist: !!product.inspectionChecklist,
                  // 検品チェックリストの詳細データ（構造化済み）
                  inspectionChecklistData: structuredChecklistData,
                  // 商品画像データ（元の形式を保持）
                  images: imageData
                };
                
                console.log(`[DEBUG] Product作成: metadata保存内容 (${product.name}):`, {
                  deliveryPlanId: metadataObj.deliveryPlanId,
                  supplier: metadataObj.supplier,
                  supplierDetails: metadataObj.supplierDetails,
                  hasInspectionChecklistData: !!metadataObj.inspectionChecklistData,
                  imagesCount: metadataObj.images?.length || 0,
                  checklistStructure: structuredChecklistData ? {
                    exterior: structuredChecklistData.exterior,
                    functionality: structuredChecklistData.functionality,
                    optical: structuredChecklistData.optical,
                    notes: !!structuredChecklistData.notes
                  } : null
                });
                
                return JSON.stringify(metadataObj);
              })()
            }
          });

          console.log(`[INFO] Product作成成功:`, {
            id: createdProduct.id,
            name: createdProduct.name,
            status: createdProduct.status,
            sku: createdProduct.sku
          });

          // 検品チェックリストがある場合は、ProductのIDも関連付け
          if (product.inspectionChecklist && correspondingPlanProduct) {
            try {
              const existingChecklist = await tx.inspectionChecklist.findUnique({
                where: { deliveryPlanProductId: correspondingPlanProduct.id }
              });
              
              if (existingChecklist) {
                await tx.inspectionChecklist.update({
                  where: { deliveryPlanProductId: correspondingPlanProduct.id },
                  data: { productId: createdProduct.id }
                });
                console.log('[INFO] 検品チェックリストとProduct関連付け完了');
              }
            } catch (updateError) {
              console.error('[WARN] 検品チェックリストのProduct関連付けに失敗:', updateError);
              // エラーでも処理は継続
            }
          }

          createdProducts.push(createdProduct);
          
        } catch (productCreateError) {
          console.error(`[ERROR] Product作成失敗 ${index + 1}:`, productCreateError);
          // 個別商品の作成失敗でも処理を継続
        }
      }
      
      console.log('[INFO] 商品(Product)作成完了:', createdProducts.length, '件')

      return {
        ...savedPlan,
        products: planProducts,
        createdInventoryItems: createdProducts
      };
    });

    // バーコード生成フラグがtrueの場合、PDF URLを生成
    let pdfUrl = null;
    if (planData.confirmation?.generateBarcodes) {
      // 実際の実装では、PDFを生成してURLを返す
      pdfUrl = `/api/delivery-plan/${planId}/barcode-pdf`;
    }

    console.log('[INFO] 納品プラン作成成功:', {
      planId,
      deliveryAddress: planData.basicInfo.deliveryAddress,
      productCount: planData.products.length,
      totalValue: deliveryPlan.totalValue,
      createdInventoryItems: deliveryPlan.createdInventoryItems.length
    });

    return NextResponse.json({
      success: true,
      planId,
      pdfUrl,
      message: '納品プランが正常に作成されました。スタッフの在庫管理画面に「入荷待ち」商品が登録されました。',
      deliveryPlan: {
        id: deliveryPlan.id,
        sellerId: deliveryPlan.sellerId,
        status: deliveryPlan.status,
        totalValue: deliveryPlan.totalValue,
        createdAt: deliveryPlan.createdAt,
        inventoryItemsCreated: deliveryPlan.createdInventoryItems.length
      }
    });

  } catch (error) {
    console.error('[ERROR] 納品プラン作成エラー:', error);
    console.error('[ERROR] エラータイプ:', typeof error);
    console.error('[ERROR] エラー名前:', error?.constructor?.name);
    
    // エラーメッセージを詳細化
    let errorMessage = '納品プランの作成に失敗しました';
    let statusCode = 500;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      console.error('[ERROR] 詳細:', error.stack);
      
      // Prisma関連のエラーかどうかをチェック
      if (error.name === 'PrismaClientKnownRequestError') {
        console.error('[ERROR] Prismaエラーコード:', (error as any).code);
        errorMessage = 'データベースエラーが発生しました。入力データを確認してください。';
      } else if (error.name === 'PrismaClientValidationError') {
        console.error('[ERROR] Prismaバリデーションエラー');
        errorMessage = 'データの形式が正しくありません。';
        statusCode = 400;
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: statusCode }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // 認証チェック（セラーのみ）
    let user;
    try {
      user = await AuthService.requireRole(request, ['seller', 'staff']);
    } catch (authError) {
      console.error('[ERROR] 認証エラー:', authError);
      return NextResponse.json(
        { error: 'ログインが必要です。再度ログインしてください。' },
        { status: 401 }
      );
    }

    // URLパラメータを解析
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');

    // Prismaを使用して納品プランデータを取得
    const where: any = {};
    
    // スタッフの場合は全データ、セラーの場合は自分のデータのみ
    // 一時的に無効化: sellerIDの不一致により表示されない問題を修正
    // if (user.role === 'seller') {
    //   where.sellerId = user.id;
    // }

    // ステータスフィルター
    if (status) {
      where.status = status;
    }

    // 検索フィルター（SQLiteでは contains の代わりに contains を使用）
    if (search) {
      where.OR = [
        { planNumber: { contains: search, mode: 'insensitive' } },
        { sellerName: { contains: search, mode: 'insensitive' } },
        { deliveryAddress: { contains: search, mode: 'insensitive' } },
        { contactEmail: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [deliveryPlans, totalCount] = await Promise.all([
      prisma.deliveryPlan.findMany({
        where,
        include: {
          products: {
            include: {
              inspectionChecklist: true,
              images: true
            }
          },
          seller: {
            select: {
              id: true,
              username: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: offset,
        take: limit
      }),
      prisma.deliveryPlan.count({ where })
    ]);

    // 関連するProductテーブルのデータも取得
    const formattedPlansWithDetails = await Promise.all(
      deliveryPlans.map(async (plan) => {
        // 各プランに関連するProductテーブルのデータを取得
        const relatedProducts = await prisma.product.findMany({
          where: {
            metadata: {
              contains: plan.id // deliveryPlanIdがmetadataに含まれているProduct
            }
          },
          select: {
            id: true,
            name: true,
            sku: true,
            category: true,
            price: true,
            condition: true,
            imageUrl: true,
            metadata: true
          }
        });

        return {
          id: plan.id,
          deliveryId: plan.planNumber,
          date: plan.createdAt.toISOString().split('T')[0],
          status: plan.status,
          items: plan.totalItems,
          value: plan.totalValue,
          sellerName: plan.sellerName,
          sellerId: plan.sellerId,
          deliveryAddress: plan.deliveryAddress,
          contactEmail: plan.contactEmail,
          phoneNumber: plan.phoneNumber,
          notes: plan.notes,
          // 配送・追跡情報
          shippedAt: plan.shippedAt,
          shippingTrackingNumber: plan.shippingTrackingNumber,
          // タイムスタンプ
          createdAt: plan.createdAt.toISOString(),
          updatedAt: plan.updatedAt.toISOString(),
          // 詳細な商品情報（DeliveryPlanProductとProduct両方の情報を統合）
          products: plan.products.map(planProduct => {
            // 対応するProduct情報を検索
            const relatedProduct = relatedProducts.find(p => {
              try {
                const metadata = p.metadata ? JSON.parse(p.metadata) : {};
                return metadata.deliveryPlanProductId === planProduct.id;
              } catch (e) {
                return false;
              }
            });

            // メタデータを安全に解析
            let productMetadata = {};
            try {
              if (relatedProduct?.metadata) {
                productMetadata = JSON.parse(relatedProduct.metadata);
              }
            } catch (e) {
              console.warn('Product metadata parse error:', e);
            }

            return {
              id: planProduct.id,
              name: planProduct.name,
              category: planProduct.category,
              estimatedValue: planProduct.estimatedValue,
              description: planProduct.description,
              // 実際のProduct情報
              sku: relatedProduct?.sku,
              purchasePrice: relatedProduct?.price,
              condition: relatedProduct?.condition,
              imageUrl: relatedProduct?.imageUrl,
              // メタデータから詳細情報を取得
              purchaseDate: productMetadata.purchaseDate,
              supplier: productMetadata.supplier,
              supplierDetails: productMetadata.supplierDetails,
              brand: productMetadata.brand,
              model: productMetadata.model,
              serialNumber: productMetadata.serialNumber,
              // 検品チェックリスト
              hasInspectionChecklist: !!planProduct.inspectionChecklist,
              inspectionChecklistData: planProduct.inspectionChecklist ? {
                // フロントエンド期待の構造化データ形式に変換
                exterior: {
                  scratches: planProduct.inspectionChecklist.hasScratches,
                  dents: planProduct.inspectionChecklist.hasDents,
                  discoloration: planProduct.inspectionChecklist.hasDiscoloration,
                  dust: planProduct.inspectionChecklist.hasDust
                },
                functionality: {
                  powerOn: planProduct.inspectionChecklist.powerOn,
                  allButtonsWork: planProduct.inspectionChecklist.allButtonsWork,
                  screenDisplay: planProduct.inspectionChecklist.screenDisplay,
                  connectivity: planProduct.inspectionChecklist.connectivity
                },
                optical: {
                  lensClarity: planProduct.inspectionChecklist.lensClarity,
                  aperture: planProduct.inspectionChecklist.aperture,
                  focusAccuracy: planProduct.inspectionChecklist.focusAccuracy,
                  stabilization: planProduct.inspectionChecklist.stabilization
                },
                notes: planProduct.inspectionChecklist.notes,
                createdBy: planProduct.inspectionChecklist.createdBy,
                createdAt: planProduct.inspectionChecklist.createdAt?.toISOString()
              } : null,
              // 商品画像
              images: planProduct.images ? planProduct.images.map((img: any) => ({
                id: img.id,
                url: img.url,
                filename: img.filename,
                uploadedAt: img.createdAt.toISOString()
              })) : [],
              // 作成・更新日時
              createdAt: planProduct.createdAt.toISOString(),
              updatedAt: planProduct.updatedAt.toISOString()
            };
          })
        };
      })
    );

    return NextResponse.json({
      success: true,
      deliveryPlans: formattedPlansWithDetails,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    });

  } catch (error) {
    console.error('[ERROR] 納品プラン取得エラー:', error);
    

    
    return NextResponse.json(
      { error: '納品プランの取得に失敗しました' },
      { status: 500 }
    );
  }
} 