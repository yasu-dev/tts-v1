import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { barcode: string } }
) {
  try {
    const barcode = params.barcode;

    if (!barcode) {
      return NextResponse.json(
        { error: 'バーコードが指定されていません' },
        { status: 400 }
      );
    }

    console.log(`🔍 バーコード検索: ${barcode}`);

    // バーコード形式の検証
    if (!validateBarcode(barcode)) {
      return NextResponse.json(
        { error: '無効なバーコード形式です' },
        { status: 400 }
      );
    }

    // バーコードから商品を検索
    // バーコードはSKUのみと照合（現在のスキーマにはbarcodeフィールドがないため）
    const result = await prisma.product.findFirst({
      where: {
        sku: barcode
      },
      include: {
        currentLocation: true
      }
    });

    if (!result) {
      console.log(`❌ 商品が見つかりません: ${barcode}`);
      return NextResponse.json(
        { error: '商品が見つかりません', barcode },
        { status: 404 }
      );
    }

    // 商品データを整形
    const product = {
      id: result.id,
      name: result.name,
      sku: result.sku,
      category: result.category,
      status: result.status,
      location: result.currentLocation?.name || '未設定',
      price: result.price || 0,
      condition: result.condition || '良品',
      stock: 1, // 現在のスキーマにはquantityフィールドがない
      imageUrl: result.imageUrl,
      description: result.description,
      barcode: result.sku, // 現在のスキーマにはbarcodeフィールドがない
      qrCode: `QR-${result.sku}`, // 現在のスキーマにはqrCodeフィールドがない
      createdAt: result.createdAt,
      updatedAt: result.updatedAt
    };

    console.log(`✅ 商品発見: ${product.name} (${product.sku})`);

    return NextResponse.json({ 
      success: true,
      product 
    });

  } catch (error) {
    console.error('バーコード検索エラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}

// バーコード形式の検証
function validateBarcode(barcode: string): boolean {
  if (!barcode || barcode.length < 8) return false;

  // JAN/EAN/UPC形式（8-13桁の数字）
  if (/^[0-9]{8,13}$/.test(barcode)) return true;
  
  // TWD独自形式（TWD-XXXXXXXX-XXXXX）
  if (/^TWD-[A-Z0-9]{3,}-[0-9]{3,}$/.test(barcode)) return true;
  
  // QRコード形式（QR-で始まる）
  if (/^QR-[A-Z0-9-]+$/.test(barcode)) return true;
  
  // SKU形式（CAM-BRAND-MODEL-XXX）
  if (/^[A-Z]{3}-[A-Z0-9]+-[A-Z0-9]+-[0-9]{3}$/.test(barcode)) return true;

  return false;
} 