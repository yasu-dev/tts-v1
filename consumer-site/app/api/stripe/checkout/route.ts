import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
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
    const { order_items, shipping_info } = body;

    // バリデーション
    if (!order_items || !Array.isArray(order_items) || order_items.length === 0) {
      return NextResponse.json(
        { error: 'Invalid order_items' },
        { status: 400 }
      );
    }

    // SKUの詳細を取得
    const skuIds = order_items.map((item: any) => item.sku_id);
    const { data: skus, error: skuError } = await supabase
      .from('product_skus')
      .select('*, product:products(*, seller:sellers(*))')
      .in('id', skuIds);

    if (skuError || !skus) {
      return NextResponse.json(
        { error: 'Failed to fetch SKUs' },
        { status: 400 }
      );
    }

    // 在庫チェック
    for (const item of order_items) {
      const sku = skus.find((s: any) => s.id === item.sku_id);
      if (!sku || sku.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for SKU: ${item.sku_id}` },
          { status: 400 }
        );
      }
    }

    // 金額計算
    let subtotal_yen = 0;
    const line_items = order_items.map((item: any) => {
      const sku = skus.find((s: any) => s.id === item.sku_id);
      const unit_price = sku.price_yen;
      subtotal_yen += unit_price * item.quantity;

      return {
        price_data: {
          currency: 'jpy',
          product_data: {
            name: sku.product.name,
            description: `${sku.weight_grams}g`,
          },
          unit_amount: unit_price,
        },
        quantity: item.quantity,
      };
    });

    // システム設定から送料と手数料を取得
    const { data: settings } = await supabase
      .from('system_settings')
      .select('*')
      .in('key', ['default_shipping_fee', 'platform_fee_rate']);

    const shipping_fee_yen = parseInt(
      settings?.find((s: any) => s.key === 'default_shipping_fee')?.value || '800'
    );
    const platform_fee_rate = parseInt(
      settings?.find((s: any) => s.key === 'platform_fee_rate')?.value || '10'
    );
    const platform_fee_yen = Math.floor(subtotal_yen * (platform_fee_rate / 100));
    const total_amount_yen = subtotal_yen + shipping_fee_yen;

    // 販売者IDを取得（最初のSKUの販売者）
    const seller_id = skus[0].product.seller_id;

    // 仮注文作成
    const order_number = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number,
        buyer_id: user.id,
        seller_id,
        status: 'pending',
        subtotal_yen,
        shipping_fee_yen,
        platform_fee_yen,
        total_amount_yen,
        shipping_info,
      })
      .select()
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    // 注文アイテム作成
    const orderItemsData = order_items.map((item: any) => {
      const sku = skus.find((s: any) => s.id === item.sku_id);
      return {
        order_id: order.id,
        sku_id: item.sku_id,
        quantity: item.quantity,
        unit_price_yen: sku.price_yen,
        subtotal_yen: sku.price_yen * item.quantity,
      };
    });

    await supabase.from('order_items').insert(orderItemsData);

    // Stripe Checkoutセッション作成
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/order/complete?order_id=${order.id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
      metadata: {
        order_id: order.id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    // TODO: 本番環境では適切なロギングサービスを使用
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
