import 'server-only';
import Stripe from 'stripe';

// MVP: Stripe決済は未実装のため、ビルド時にはダミー値を使用
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_for_build';

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-09-30.clover',
  typescript: true,
});
