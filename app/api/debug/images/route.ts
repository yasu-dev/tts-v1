import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId') || 'cmfscx38w000aa3wuhp7jayh9';

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        images: true
      }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Parse metadata
    const metadata = product.metadata ?
      (typeof product.metadata === 'string' ? JSON.parse(product.metadata) : product.metadata)
      : {};
    const staffPhotos = metadata.photos || [];

    return NextResponse.json({
      productId,
      productName: product.name,
      totalProductImages: product.images.length,
      productImages: product.images.map((img: any) => ({
        id: img.id,
        filename: img.filename,
        url: img.url ? `${img.url.substring(0, 50)}...` : null,
        category: img.category,
        hasUrl: !!img.url,
        urlType: img.url?.startsWith('data:') ? 'base64' : img.url?.startsWith('/api/') ? 'filepath' : 'unknown'
      })),
      totalStaffPhotos: staffPhotos.length,
      staffPhotos: staffPhotos.map((photo: any, index: number) => ({
        id: `staff_${photo.id || index}`,
        filename: photo.filename,
        dataUrl: photo.dataUrl ? `${photo.dataUrl.substring(0, 50)}...` : null,
        hasDataUrl: !!photo.dataUrl,
        dataUrlType: photo.dataUrl?.startsWith('data:') ? 'base64' : 'unknown',
        rawPhoto: photo
      })),
      metadata: {
        hasMetadata: !!product.metadata,
        metadataType: typeof product.metadata,
        hasPhotos: !!(metadata.photos)
      }
    });

  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch debug data', details: error.message },
      { status: 500 }
    );
  }
}