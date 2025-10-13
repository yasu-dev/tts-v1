import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { getSystemSettings } from '@/lib/settings';

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

    // Get buyer profile for shipping info
    const { data: buyerProfile, error: buyerError } = await supabase
      .from('buyer_profiles')
      .select('default_shipping')
      .eq('user_id', user.id)
      .single();

    if (buyerError || !buyerProfile?.default_shipping) {
      return NextResponse.json(
        { error: 'Shipping address not found. Please set up your profile first.' },
        { status: 400 }
      );
    }

    // Get system settings from DB
    const settings = await getSystemSettings();

    // Calculate amounts
    const subtotal_yen = sku.price_yen * quantity;
    const shipping_fee_yen = settings.defaultShippingFee;
    const platform_fee_rate = settings.platformFeeRate / 100;
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
        status: 'paid', // MVP Demo: directly set to paid (no actual payment processing)
        subtotal_yen,
        shipping_fee_yen,
        platform_fee_yen,
        total_amount_yen,
        shipping_info: buyerProfile.default_shipping,
      })
      .select()
      .single();

    if (orderError || !order) {
      // TODO: 本番環境では適切なロギングサービスを使用
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
      // TODO: 本番環境では適切なロギングサービスを使用
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
      // TODO: 本番環境では適切なロギングサービスを使用
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
    // TODO: 本番環境では適切なロギングサービスを使用
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
