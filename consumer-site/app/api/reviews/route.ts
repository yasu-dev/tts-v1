import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 認証チェック
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { product_id, order_id, rating, comment, image_urls } = body;

    // バリデーション
    if (!product_id || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Invalid input' },
        { status: 400 }
      );
    }

    // プロフィールからニックネームを取得
    const { data: profile } = await supabase
      .from('profiles')
      .select('nickname')
      .eq('user_id', user.id)
      .single();

    // レビュー作成
    const { data: review, error } = await supabase
      .from('reviews')
      .insert({
        buyer_id: user.id,
        product_id,
        order_id,
        nickname: profile?.nickname || '匿名',
        rating,
        comment,
        image_urls,
        is_visible: true,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ review });
  } catch (error) {
    // TODO: 本番環境では適切なロギングサービスを使用
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
