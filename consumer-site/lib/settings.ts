import { createClient } from '@/lib/supabase/server';

/**
 * システム設定をDBから取得（サーバーサイド用）
 * drawio記載: ビジネスロジック層 (lib/)
 */
export async function getSystemSettings() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('system_settings')
    .select('key, value')
    .in('key', ['default_shipping_fee', 'platform_fee_rate']);

  if (error) {
    throw new Error(`Failed to fetch system settings: ${error.message}`);
  }

  const settings = data.reduce((acc, setting) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {} as Record<string, string>);

  return {
    defaultShippingFee: parseInt(settings.default_shipping_fee || '800'),
    platformFeeRate: parseInt(settings.platform_fee_rate || '10'),
  };
}
