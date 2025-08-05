// スタッフ在庫管理画面用の認証回避スクリプト
import { search_replace } from 'fs';

// app/api/inventory/route.tsを一時的に修正してスタッフが全商品を見られるようにする
console.log('スタッフ用全商品表示モードを有効化中...');

// 一時的にstaff用のデフォルトユーザーを設定
const staffUser = {
  id: 'staff-demo-user',
  role: 'staff',
  email: 'staff@example.com'
};

export { staffUser };