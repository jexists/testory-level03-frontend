import { defineConfig, devices } from '@playwright/test';

/**
 * 핵심 사용자 시나리오 E2E.
 * 백엔드가 떠 있어야 하고 시연 데이터(npm run seed)가 들어 있어야 한다. 시작할 때 시연 데이터를 다시 만든다.
 * 프론트엔드는 이 설정이 자동으로 띄운다. (E2E_PORT 로 포트를 바꿀 수 있고, 백엔드 주소는 BACKEND_URL)
 */
const port = process.env.E2E_PORT ?? '3000';

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: { baseURL: `http://localhost:${port}`, trace: 'retain-on-failure', screenshot: 'only-on-failure', locale: 'ko-KR' },
  projects: [{ name: 'desktop', use: { ...devices['Desktop Chrome'] } }],
  webServer: { command: `npx next dev -p ${port}`, url: `http://localhost:${port}`, reuseExistingServer: true, timeout: 120_000 },
});
