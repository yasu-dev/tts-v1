import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * システム設定取得API（クライアント用）
 * drawio記載: バックエンド層 - API Routes
 */
export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('system_settings')
      .select('key, value')
      .in('key', ['default_shipping_fee', 'platform_fee_rate']);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    const settings = data.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json({
      defaultShippingFee: parseInt(settings.default_shipping_fee || '800'),
      platformFeeRate: parseInt(settings.platform_fee_rate || '10'),
    });
  } catch (error: any) {
    // TODO: 本番環境では適切なロギングサービスを使用
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
