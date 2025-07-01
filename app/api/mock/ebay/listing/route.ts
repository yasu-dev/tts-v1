import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

/**
 * eBay出品APIのモック実装
 */
export const POST = requireAuth(async (req: NextRequest, { user }) => {
  try {
    const data = await req.json();
    
    // モックレスポンスを生成
    const mockListingId = `MOCK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const mockUrl = `https://www.ebay.com/itm/${mockListingId}`;
    
    // 実際のAPIでは、ここでeBayに出品リクエストを送信
    // 開発環境では成功レスポンスを返す
    
    return NextResponse.json({
      success: true,
      listingId: mockListingId,
      url: mockUrl,
      message: 'Mock listing created successfully',
      data: {
        ...data,
        status: 'active',
        createdAt: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error('Mock eBay listing error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create mock listing' },
      { status: 500 }
    );
  }
});

/**
 * eBay出品更新APIのモック実装
 */
export const PUT = requireAuth(async (req: NextRequest, { user }) => {
  try {
    const data = await req.json();
    const listingId = req.nextUrl.pathname.split('/').pop();
    
    return NextResponse.json({
      success: true,
      listingId,
      message: 'Mock listing updated successfully',
      data: {
        ...data,
        updatedAt: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error('Mock eBay update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update mock listing' },
      { status: 500 }
    );
  }
}); 