import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright E2Eテスト設定
 * @see https://playwright.dev/docs/test-configuration
 */
const targetBaseURL = process.env.BASE_URL || 'https://triage-tag-system.netlify.app'

export default defineConfig({
  testDir: './tests/e2e',

  /* 並列実行の最大ワーカー数 */
  fullyParallel: true,

  /* CIで失敗したテストのみ再試行 */
  forbidOnly: !!process.env.CI,

  /* CIでのリトライ回数 */
  retries: process.env.CI ? 2 : 0,

  /* 並列ワーカー数 */
  workers: process.env.CI ? 1 : undefined,

  /* レポーター */
  reporter: [
    ['html'],
    ['list'],
  ],

  /* 共通設定 */
  use: {
    /* ベースURL */
    baseURL: targetBaseURL,
    /* 自己署名証明書を許可（ローカルHTTPSプロキシ用） */
    ignoreHTTPSErrors: true,
    permissions: ['geolocation'],

    /* 失敗時のスクリーンショット */
    screenshot: 'only-on-failure',

    /* 失敗時のビデオ録画 */
    video: 'retain-on-failure',

    /* トレース（デバッグ用） */
    trace: 'on-first-retry',
  },

  /* プロジェクト設定（ブラウザ別） */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'], launchOptions: { slowMo: 100 } },
    },

    /* モバイルテスト */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'], launchOptions: { slowMo: 100 } },
    },
  ],

  /* 開発サーバー設定 */
  webServer: targetBaseURL.includes('localhost')
    ? (process.env.PW_USE_HTTPS === '1'
        ? [
            {
              command: 'npm run dev:ssl',
              url: 'https://localhost:3443',
              reuseExistingServer: !process.env.CI,
              timeout: 180 * 1000,
            },
          ]
        : {
            command: 'npm run dev',
            url: 'http://localhost:3000',
            reuseExistingServer: !process.env.CI,
            timeout: 120 * 1000,
          })
    : undefined,
})
