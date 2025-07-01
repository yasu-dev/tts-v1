import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 動画記録を取得
 */
export const GET = requireAuth(async (req: NextRequest, { user }) => {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const orderId = searchParams.get('orderId');
    const type = searchParams.get('type');

    const where: any = {};
    
    if (productId) where.productId = productId;
    if (orderId) where.orderId = orderId;
    if (type) where.type = type;

    // 一時的にanyキャストで回避
    const records = await (prisma as any).videoRecord.findMany({
      where,
      include: {
        staff: {
          select: {
            id: true,
            username: true,
          }
        },
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          }
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedRecords = records.map((record: any) => ({
      ...record,
      staffName: record.staff.username,
      fileUrl: generateVideoUrl(record.fileUrl), // 開発環境用のURLを生成
    }));

    return NextResponse.json({ records: formattedRecords });
  } catch (error) {
    console.error('Video records fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch video records' },
      { status: 500 }
    );
  }
});

/**
 * 動画記録を登録
 */
export const POST = requireAuth(async (req: NextRequest, { user }) => {
  try {
    const data = await req.json();
    
    // スタッフユーザーのみ動画記録を作成可能
    if (user.role !== 'staff' && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // 一時的にanyキャストで回避
    const record = await (prisma as any).videoRecord.create({
      data: {
        productId: data.productId || null,
        orderId: data.orderId || null,
        type: data.type,
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize || null,
        duration: data.duration || null,
        staffId: user.id,
        notes: data.notes || null,
      }
    });

    return NextResponse.json({
      success: true,
      record
    });
  } catch (error) {
    console.error('Video record creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create video record' },
      { status: 500 }
    );
  }
});

/**
 * 開発環境用の動画URL生成
 */
function generateVideoUrl(filename: string): string {
  // 本番環境ではS3のURLを返す
  // 開発環境ではサンプル動画のURLを返す
  if (process.env.NODE_ENV === 'production') {
    return `https://s3.ap-northeast-1.amazonaws.com/${process.env.S3_BUCKET_NAME}/videos/${filename}`;
  }
  
  // 開発環境用のサンプル動画URL
  return `https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4`;
} 