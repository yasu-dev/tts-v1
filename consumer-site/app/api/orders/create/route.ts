import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { sku_id, quantity, seller_id } = body;

    if (!sku_id || !quantity || !seller_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get SKU details
    const { data: sku, error: skuError } = await supabase
      .from('product_skus')
      .select('*, products(*)')
      .eq('id', sku_id)
      .single();

    if (skuError || !sku) {
      return NextResponse.json({ error: 'SKU not found' }, { status: 404 });
    }

    // Check stock
    if (sku.stock < quantity) {
      return NextResponse.json(
        { error: 'Insufficient stock' },
        { status: 400 }
      );
    }

    // Calculate amounts
    const subtotal_yen = sku.price_yen * quantity;
    const shipping_fee_yen = 800; // Default shipping fee
    const platform_fee_rate = 0.1;
    const platform_fee_yen = Math.floor(subtotal_yen * platform_fee_rate);
    const total_amount_yen = subtotal_yen + shipping_fee_yen;

    // Generate order number
    const order_number = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number,
        buyer_id: user.id,
        seller_id,
        status: 'paid', // Demo: directly set to paid
        subtotal_yen,
        shipping_fee_yen,
        platform_fee_yen,
        total_amount_yen,
        shipping_info: {
          name: 'デモ配送先',
          postal_code: '000-0000',
          prefecture: '東京都',
          city: '渋谷区',
          address1: 'サンプル町1-2-3',
          phone: '000-0000-0000',
        },
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error('Order creation error:', orderError);
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    // Create order item
    const { error: itemError } = await supabase.from('order_items').insert({
      order_id: order.id,
      sku_id,
      quantity,
      unit_price_yen: sku.price_yen,
      subtotal_yen,
    });

    if (itemError) {
      console.error('Order item creation error:', itemError);
      // Rollback order creation
      await supabase.from('orders').delete().eq('id', order.id);
      return NextResponse.json(
        { error: 'Failed to create order item' },
        { status: 500 }
      );
    }

    // Update SKU stock
    const { error: stockError } = await supabase
      .from('product_skus')
      .update({ stock: sku.stock - quantity })
      .eq('id', sku_id);

    if (stockError) {
      console.error('Stock update error:', stockError);
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        order_number: order.order_number,
        total_amount_yen: order.total_amount_yen,
      },
    });
  } catch (error: any) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
