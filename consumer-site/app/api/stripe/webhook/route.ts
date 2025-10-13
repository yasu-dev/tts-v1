import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Service role keyを使用（RLSをバイパス）
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    // Webhook署名検証
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  // checkout.session.completed イベント処理
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const order_id = session.metadata?.order_id;

    if (!order_id) {
      console.error('No order_id in session metadata');
      return NextResponse.json(
        { error: 'No order_id' },
        { status: 400 }
      );
    }

    try {
      // 注文ステータス更新
      const { error: updateError } = await supabaseAdmin
        .from('orders')
        .update({
          status: 'paid',
          stripe_payment_intent_id: session.payment_intent as string,
        })
        .eq('id', order_id);

      if (updateError) {
        console.error('Failed to update order:', updateError);
        return NextResponse.json(
          { error: 'Failed to update order' },
          { status: 500 }
        );
      }

      // 在庫減算
      const { data: orderItems } = await supabaseAdmin
        .from('order_items')
        .select('sku_id, quantity')
        .eq('order_id', order_id);

      if (orderItems) {
        for (const item of orderItems) {
          // 現在の在庫を取得
          const { data: sku } = await supabaseAdmin
            .from('product_skus')
            .select('stock')
            .eq('id', item.sku_id)
            .single();

          if (sku) {
            // 在庫を減算
            await supabaseAdmin
              .from('product_skus')
              .update({ stock: sku.stock - item.quantity })
              .eq('id', item.sku_id);
          }
        }
      }

      // メール送信キュー登録（実装は将来的にEdge Functionで）
      // TODO: SendGrid/Resendでメール送信

      console.log(`Order ${order_id} marked as paid and stock updated`);
    } catch (error) {
      console.error('Error processing webhook:', error);
      return NextResponse.json(
        { error: 'Processing error' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
