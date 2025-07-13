import { developmentConfig } from './environments/development';
import { productionConfig } from './environments/production';

/**
 * 統一設定管理
 * 環境変数に基づいて適切な設定を返す
 */

type Environment = 'development' | 'production' | 'test';

export function getEnvironment(): Environment {
  const env = process.env.NODE_ENV as Environment;
  return env || 'development';
}

export function getConfig() {
  const environment = getEnvironment();
  
  switch (environment) {
    case 'production':
      return productionConfig;
    case 'development':
    case 'test':
    default:
      return developmentConfig;
  }
}

// 設定のエクスポート
export const config = getConfig();

/**
 * 使用例:
 * 
 * // データソースの取得
 * const dataSource = config.dataSource; // 'mock' | 'prisma' | 'api'
 * 
 * // サービス設定の取得
 * const useEbayMock = config.services.useMock;
 * const ebayApiUrl = config.services.ebay.apiUrl;
 * 
 * // 本番移行時は環境変数 NODE_ENV=production を設定するだけ
 */

// 型定義エクスポート
export type Config = typeof config;
export type DataSource = typeof config.dataSource; 