import { expect, test, type Page } from '@playwright/test';

const PASSWORD = process.env.DEMO_PASSWORD ?? 'testory-demo-1234';

async function login(page: Page, email: string) {
  await page.goto('/login');
  await page.getByLabel('이메일').fill(email);
  await page.getByLabel('비밀번호', { exact: true }).fill(PASSWORD);
  await page.getByRole('button', { name: '로그인' }).click();
  await page.waitForURL((url) => !url.pathname.startsWith('/login'));
}

test.beforeAll(async ({ request }) => {
  test.setTimeout(180_000); // 원격 DB 에 시연 데이터를 다시 만드는 데 시간이 걸린다
  // 항상 같은 시연 데이터에서 시작한다.
  const res = await request.post('/api/auth/login', { data: { email: 'admin@testory.demo', password: PASSWORD } });
  expect(res.ok()).toBeTruthy();
  const reset = await request.post('/api/admin/demo/reset');
  expect(reset.ok(), await reset.text()).toBeTruthy();
});

test('방문자는 목록을 보고 기기·상태 필터와 검색을 쓸 수 있다', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: '반복 일정 기능 테스트' })).toBeVisible();

  await page.getByRole('link', { name: '모집 중', exact: true }).click();
  await expect(page.getByRole('link', { name: '반복 일정 기능 테스트' })).toBeVisible();

  await page.getByRole('link', { name: '마감', exact: true }).click();
  await expect(page.getByRole('link', { name: '하루칸 앱 전체 베타 테스트' })).toBeVisible();

  await page.goto('/?status=ALL&q=알림');
  await expect(page.getByRole('link', { name: '알림 기능 테스트' })).toBeVisible();
});

test('방문자가 상세에서 신청하려면 로그인이 필요하다', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: '반복 일정 기능 테스트' }).click();
  await expect(page.getByRole('heading', { name: '반복 일정 기능 테스트', level: 1 })).toBeVisible();
  await expect(page.getByText('Android 전체')).toBeVisible();
  await page.getByRole('link', { name: '로그인하고 신청하기' }).click();
  await expect(page).toHaveURL(/\/login\?next=/);
});

test('테스터는 신청하고 취소하고 다시 신청한다', async ({ page }) => {
  await login(page, 'tester20@testory.demo');
  await page.goto('/');
  await page.getByRole('link', { name: '반복 일정 기능 테스트' }).click();
  await expect(page.getByText('여기서는 바꿀 수 없어요')).toBeVisible(); // 내 기기는 읽기 전용

  await page.getByRole('button', { name: '신청하기' }).click();
  await expect(page.getByText('이 모집에 참여 중이에요.')).toBeVisible();

  await page.getByRole('button', { name: '신청 취소하기' }).click();
  await page.getByRole('dialog').getByRole('button', { name: '신청 취소하기' }).click();
  await expect(page.getByRole('button', { name: '신청하기' })).toBeVisible();

  await page.getByRole('button', { name: '신청하기' }).click();
  await expect(page.getByText('이 모집에 참여 중이에요.')).toBeVisible();

  await page.goto('/me/applications');
  // 다시 신청했으면 예전 취소 기록은 목록에 보이지 않는다
  await expect(page.getByRole('heading', { name: '반복 일정 기능 테스트' })).toHaveCount(1);
  await expect(page.getByText('신청 당시 기기').first()).toBeVisible();
});

test('내 기기가 조건에 맞지 않으면 신청할 수 없다', async ({ page }) => {
  await login(page, 'tester19@testory.demo'); // 아이폰 14
  await page.goto('/');
  await page.getByRole('link', { name: '일정 공유 기능 테스트' }).click();
  await expect(page.getByText('내 기기는 이 모집의 허용 기기에 없어요')).toBeVisible();
  await expect(page.getByRole('button', { name: '신청하기' })).toBeDisabled();
});

test('참여 중인 테스터는 테스트 중에 유형을 골라 피드백을 남긴다', async ({ page }) => {
  await login(page, 'tester01@testory.demo');
  await page.goto('/?status=ALL');
  // 정원이 차서 바로 시작된 테스트 (시연 데이터)
  await page.getByRole('link', { name: '하루칸 앱 전체 베타 테스트' }).click();
  await expect(page.getByText(/피드백 마감 .*D-/)).toBeVisible();
  await page.waitForLoadState('networkidle'); // 화면이 다 뜬 뒤에 입력한다

  await page.getByLabel('제목').fill('알림 소리 설정이 저장되지 않아요');
  await page.getByLabel('내용').fill('설정을 바꾸고 나갔다 들어오면 원래대로 돌아가 있어요.');
  await page.getByRole('button', { name: '피드백 남기기' }).click();
  await expect(page.getByText('피드백 유형을 골라 주세요.')).toBeVisible(); // 유형을 안 고르면 저장되지 않는다

  await page.locator('label', { hasText: '의도와 다르게 동작했어요' }).click();
  await page.getByRole('button', { name: '피드백 남기기' }).click();
  await expect(page.getByRole('heading', { name: '알림 소리 설정이 저장되지 않아요' })).toBeVisible();
});

test('일반 사용자는 관리자 화면에 들어갈 수 없다', async ({ page }) => {
  await login(page, 'tester01@testory.demo');
  await page.goto('/admin');
  await expect(page.getByText('관리자만 볼 수 있는 화면이에요')).toBeVisible();
});

test('피드백 마감이 지난 테스트에는 피드백을 쓸 수 없다', async ({ page }) => {
  await login(page, 'tester01@testory.demo');
  await page.goto('/?status=ALL');
  await page.getByRole('link', { name: '알림 기능 테스트' }).click();
  await expect(page.getByText('피드백 마감일이 지났어요.')).toBeVisible();
  await expect(page.getByRole('button', { name: '피드백 남기기' })).toHaveCount(0);
});

test('관리자는 대시보드에서 단계별로 보고, 분석을 확인 완료하면 종료가 된다', async ({ page }) => {
  await login(page, 'admin@testory.demo');
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole('heading', { name: '대시보드', level: 1 })).toBeVisible();
  await expect(page.getByRole('link', { name: 'AI 분석 필요' }).first()).toBeVisible();

  await page.getByRole('link', { name: /^분석 완료/ }).click();
  await expect(page.getByRole('link', { name: '알림 기능 테스트' })).toBeVisible();
  await page.getByRole('link', { name: '분석 확인하기' }).click();
  await page.getByRole('button', { name: '확인 완료' }).click();
  await expect(page.getByText(/확인 완료됨/)).toBeVisible();

  await page.goto('/admin?filter=DONE');
  await expect(page.getByRole('link', { name: '알림 기능 테스트' })).toBeVisible();

  await page.goto('/admin?q=알림');
  await page.getByRole('link', { name: '알림 기능 테스트' }).click();
  await page.getByRole('link', { name: /^피드백/ }).click();
  await expect(page.getByRole('button', { name: 'AI 분석 실행' })).toBeVisible();
  await page.getByRole('link', { name: 'AI 분석' }).click();
  await expect(page.getByText('v2').first()).toBeVisible();
  await page.getByRole('link', { name: /v1/ }).first().click();
  await expect(page.getByText('반복되는 문제')).toBeVisible();
  await expect(page.getByText('절전 모드에서 알림이 늦게')).toBeVisible();
});
