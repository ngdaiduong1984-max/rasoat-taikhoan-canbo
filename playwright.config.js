// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Test chạy trên BẢN DEMO (window.DEMO = true) — không cần Apps Script.
 * Playwright tự dựng máy chủ tĩnh phục vụ thư mục dự án ở cổng 8123.
 */
module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: { timeout: 7000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL: 'http://localhost:8123',
    trace: 'on-first-retry',
    locale: 'vi-VN'
  },
  webServer: {
    command: 'python3 -m http.server 8123',
    url: 'http://localhost:8123',
    reuseExistingServer: !process.env.CI,
    timeout: 30000
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
  ]
});
