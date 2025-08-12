import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { PDFGenerator } from '@/lib/pdf-generator';

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    // ユーザー認証
    const user = await AuthService.requireRole(request, ['staff', 'admin']);
    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const { orderId } = params;

    if (!orderId || !orderId.startsWith('DEMO-SHIP-')) {
      return NextResponse.json(
        { error: '無効なデモ注文IDです' },
        { status: 400 }
      );
    }

    // デモ配送ラベルのPDFコンテンツを生成
    const labelData = generateDemoLabelData(orderId);
    const pdfBlob = await PDFGenerator.generateShippingLabel(
      labelData, 
      labelData.carrier, 
      labelData.service
    );

    console.log(`📦 デモ配送ラベルPDF生成完了: ${orderId}`);

    // BlobをArrayBufferに変換
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // PDFファイルとしてレスポンス
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${orderId}.pdf"`,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=3600'
      }
    });

  } catch (error) {
    console.error('Demo label generation error:', error);
    return NextResponse.json(
      { error: 'デモラベル生成中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

function generateDemoLabelData(orderId: string) {
  // デモ注文IDに対応したラベル情報をPDFGeneratorの形式に変換
  const labelInfoMap: Record<string, any> = {
    'DEMO-SHIP-001': {
      orderNumber: 'DEMO-SHIP-001',
      productSku: 'SKU-CAN-5D4-001',
      productName: 'Canon EOS 5D Mark IV ボディ',
      customer: '田中太郎',
      shippingAddress: '東京都渋谷区代官山1-2-3',
      shippingMethod: 'FedEx International Priority',
      value: 350000,
      carrier: 'fedex',
      service: 'priority',
      trackingNumber: 'FX123456789JP'
    },
    'DEMO-SHIP-002': {
      orderNumber: 'DEMO-SHIP-002',
      productSku: 'SKU-NIK-D850-002',
      productName: 'Nikon D850 ボディ',
      customer: '佐藤花子',
      shippingAddress: '大阪府大阪市北区梅田2-4-5',
      shippingMethod: 'DHL Express Worldwide',
      value: 320000,
      carrier: 'dhl',
      service: 'express',
      trackingNumber: 'DHL987654321JP'
    },
    'DEMO-SHIP-003': {
      orderNumber: 'DEMO-SHIP-003',
      productSku: 'SKU-ROL-SUB-003',
      productName: 'Rolex Submariner Date',
      customer: '山田次郎',
      shippingAddress: '神奈川県横浜市中区元町3-6-7',
      shippingMethod: 'ヤマト宅急便',
      value: 1200000,
      carrier: 'yamato',
      service: 'standard',
      trackingNumber: 'YMT456789012JP'
    },
    'DEMO-SHIP-004': {
      orderNumber: 'DEMO-SHIP-004',
      productSku: 'SKU-SON-A7R5-004',
      productName: 'Sony α7R V ボディ',
      customer: '鈴木一郎',
      shippingAddress: '愛知県名古屋市中区錦1-8-9',
      shippingMethod: 'FedEx Priority Overnight',
      value: 450000,
      carrier: 'fedex',
      service: 'priority',
      trackingNumber: 'FX789123456JP'
    }
  };

  return labelInfoMap[orderId] || {
    orderNumber: orderId,
    productSku: 'SKU-DEMO-001',
    productName: 'デモ商品',
    customer: 'デモ顧客',
    shippingAddress: 'デモ住所',
    shippingMethod: 'FedEx Standard',
    value: 100000,
    carrier: 'fedex',
    service: 'standard',
    trackingNumber: 'DEMO123456789'
  };
}


