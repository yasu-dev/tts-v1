import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params; // Next.js 15: params is now a Promise

    const { data: product, error } = await supabase
      .from('products')
      .select('*, seller:sellers(*), skus:product_skus(*), reviews:reviews(*, buyer:profiles(nickname))')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ product });
  } catch (error) {
    // TODO: 本番環境では適切なロギングサービスを使用
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
