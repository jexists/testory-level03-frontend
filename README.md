# Testory Frontend (테스토리 프론트엔드)

앱 베타테스터를 모집하고, 신청과 피드백을 한곳에서 관리하는 서비스 **Testory** 의 웹 화면입니다. 화면은 사용자 경험만 담당하고, 정원·기기 조건·취소 같은 **규칙의 최종 판단은 모두 백엔드(NestJS)** 가 합니다.

- 기획서: [`기획서.md`](./기획서.md) (백엔드 저장소의 `기획서.md` 와 같은 내용)
- 백엔드 저장소: `testory-level01-backend` (이 저장소와 독립)
- 로컬 주소: <http://localhost:3000> (백엔드 <http://localhost:4000>, API 문서 <http://localhost:4000/api/docs>)
- 배포 주소: _(Vercel 배포 후 여기에 입력)_

## 확인용 데모 계정

백엔드의 시연 데이터(`npm run seed` 또는 관리자 화면의 "시연 데이터 초기화")로 만들어지는 **가상 계정**입니다. 운영 관리자 계정과는 별개입니다.

| 역할 | 이메일 | 비밀번호 |
|---|---|---|
| 관리자 | `admin@testory.demo` | `testory-demo-1234` |
| 일반 사용자(Android, 갤럭시 A54) | `tester20@testory.demo` | `testory-demo-1234` |
| 일반 사용자(iOS, 아이폰 14 — 기기 불일치 시연) | `tester19@testory.demo` | `testory-demo-1234` |
| 일반 사용자("하루칸 앱 전체 베타 테스트" 테스트 중 → 피드백 시연, "반복 일정 기능 테스트" 모집 중 → 취소 시연) | `tester01@testory.demo` | `testory-demo-1234` |

운영 환경에서는 백엔드의 `DEMO_PASSWORD` 로 정한 비밀번호가 쓰입니다.

로컬 개발(`npm run dev`)에서는 로그인 화면에 **관리자로 로그인 / 테스터로 로그인**(tester01) 빠른 로그인 버튼이 보입니다. 운영 빌드에는 들어가지 않습니다.

## 주요 기능

- **방문자**: 모집글 목록(기기 종류·모집 상태 필터 — 기본은 모집 중, 제목 검색, 남은 자리)과 상세(진행 단계, 모집 마감일·테스트 기간·피드백 마감일)
- **테스터**: 회원가입(브라우저로 OS 자동 선택 + 모델 목록 선택, 없으면 "기타"로 직접 입력), 신청·취소·재신청, 내 신청(상태 필터, 신청 당시 기기, 모집글별 내 피드백 수), 피드백 작성(유형 직접 선택, 테스트 중일 때만), 마이페이지에서 내 기기 수정(저장 전 확인 창)
- **관리자**: 대시보드(숫자 카드 모집 중·마감 임박·AI 분석 필요, 진행 단계 필터, 검색), 모집글 등록·수정(피드백 마감일, 모든 기기 / 선택한 기기만)·삭제(Soft Delete)·**복구**·마감/마감 해제, 모집글 상세 탭(신청자 · 피드백 · **AI 분석** — 버전별 저장·이전 버전 조회·확인 완료), 사용자 메뉴의 시연 데이터 초기화. 관리자는 신청·피드백을 하지 않습니다.

### 화면 주소

| 주소 | 화면 |
|---|---|
| `/` | 모집글 목록 |
| `/recruitments/:id` | 모집글 상세 + 신청 + 피드백 |
| `/login`, `/signup` | 로그인, 회원가입 |
| `/me` | 마이페이지 (계정 정보, 내 기기 수정) |
| `/me/applications` | 내 신청 (테스터만, 사용자 메뉴에서 이동) |
| `/admin` | 관리자 대시보드 (`filter`, `q`, `page`) |
| `/admin/recruitments/new`, `/admin/recruitments/:id/edit` | 모집글 등록, 수정 |
| `/admin/recruitments/:id/applicants` · `/feedbacks` · `/analysis` | 모집글 상세의 신청자 · 피드백 · AI 분석 탭 |

예전 주소 `/me/feedbacks`, `/admin/recruitments`, `/admin/feedbacks`, `/admin/analysis`, `/admin/demo` 는 위의 새 화면으로 이동시킵니다.

## 기술 스택

Next.js 16 (App Router) · React 19 · TypeScript 6 · Tailwind CSS 4 · react-hook-form + zod · lucide-react · IBM Plex Sans KR / Plex Mono(자체 포함) · Vitest · Playwright

shadcn/ui 는 쓰지 않았습니다. 필요한 컴포넌트(버튼, 입력, 대화상자, 토스트 등)가 몇 개 안 되어 직접 만드는 쪽이 의존성이 적고 디자인 토큰을 한곳에서 관리하기 쉬웠습니다. 대화상자는 브라우저 기본 `<dialog>` 를 써서 키보드·포커스 처리를 그대로 얻습니다. 전역 상태 라이브러리는 없고, 서버 상태는 Server Component 에서 가져오며 변경 후에는 `router.refresh()` 로 다시 그립니다.

## 폴더 구조

```
src/
  app/                    # 라우트 (App Router)
    page.tsx              # 모집글 목록 (서버 렌더링, 필터는 주소의 쿼리)
    recruitments/[id]/    # 상세 + 신청 + 피드백
    (auth)/login, signup  # 로그인·회원가입
    me/                   # 마이페이지, 내 신청 (로그인 필요, 내 피드백은 내 신청으로 합침)
    admin/                # 대시보드, 모집글 등록·수정, 모집글 상세 탭 (관리자만)
    loading.tsx, error.tsx, not-found.tsx
  features/               # 기능별 화면 조각: auth, recruitments, applications, feedbacks, profile, admin
  components/ui/          # 버튼·입력·배지·자리 칸(SeatStrip)·토스트·대화상자 등 공통 UI
  components/layout/      # 헤더·내비게이션
  lib/                    # api(브라우저용), server-api(서버용), types, labels, format, device
  proxy.ts                # 로그인 쿠키가 없으면 /login 으로 보내는 화면 이동용 가드
e2e/                      # Playwright 시나리오
```

### 디자인 시스템

`src/app/globals.css` 의 `@theme` 에 토큰을 모아 두었고, 화면에서는 토큰 이름의 유틸리티(`bg-canvas`, `text-ink`, `border-line`, `bg-brand`, `rounded-control` …)만 씁니다.

- 색상: 연한 청회색 바탕(`canvas`) · 흰 패널(`surface`) · 잉크(`ink`) · 코발트 주색(`brand`) 하나. 의미색(버그/개선/칭찬, 오류)은 피드백 유형과 상태에만 씁니다.
- 글꼴: IBM Plex Sans KR(본문·제목), IBM Plex Mono(기기 모델·숫자). 글자 크기 12/14/16/18/22/28/36.
- 둥글기 4(칩·자리 칸) / 8(입력·버튼) / 12(패널·대화상자), 그림자는 2단계. 구분은 테두리가 기본입니다.
- 대표 요소 `SeatStrip`: 정원을 작은 칸으로 그려 채워진 칸(참여 중)과 빈 칸(남은 자리)을 한눈에 보여 줍니다.
- 모든 화면에 Loading(스켈레톤) · Empty · Error · Success(토스트) 상태를 두었고, 키보드 포커스 링·`aria` 연결·모션 줄이기(`prefers-reduced-motion`)를 지킵니다.

### 디자인 스킬 사용에 대해

[DesignSkill](https://www.designskill.dev/) 의 `visual-qa`(전문 확인), `accessibility-audit`, `ui-craft` 의 SKILL.md 를 읽고 그 점검 기준(가로 스크롤·겹침·대비 4.5:1·빈 상태·포커스, 아이콘+제목+글 카드 격자·전부 대문자 제목·균일한 둥글기 피하기 등)을 사람이 직접 적용했습니다. 해당 스킬을 도구로 설치·자동 실행하지는 않았습니다.

## 환경변수

| 이름 | 필수 | 설명 / 형식 | 로컬 · 운영 | 민감 |
|---|---|---|---|---|
| `BACKEND_URL` | 예 | 백엔드(NestJS) 주소. 서버에서만 쓰이고 브라우저에 노출되지 않음. 마지막 `/` 없이 | 로컬 `http://localhost:4000`, 운영 Render 서비스 주소 | 아니오 |
| `NEXT_PUBLIC_DEMO_PASSWORD` | 아니오 | 로컬 개발 전용 빠른 로그인 버튼이 쓰는 시연 계정 비밀번호. 백엔드 `DEMO_PASSWORD` 를 바꿨을 때만 적음 | 로컬만 (운영 빌드에서는 쓰지 않음) | 아니오 (시연용 가짜 계정) |

브라우저는 같은 오리진의 `/api/*` 만 호출하고, `next.config.ts` 의 rewrite 가 이를 `BACKEND_URL` 로 전달합니다. 그래서 로그인 쿠키(httpOnly, SameSite=Lax)가 항상 이 사이트의 1st-party 쿠키가 되어 브라우저의 타사 쿠키 차단에 걸리지 않고, CORS 설정도 필요 없습니다. 비밀 키는 없고, `NEXT_PUBLIC_*` 변수는 위의 로컬 개발용 하나뿐입니다.

## 로컬 실행

```bash
npm ci
cp .env.example .env.local     # BACKEND_URL 확인
npm run dev                    # http://localhost:3000
```

백엔드가 먼저 떠 있어야 합니다. 백엔드 저장소의 README 에서 `npm run migration:run`, `npm run seed`, `npm run start:dev` 순서로 실행하세요.

## 테스트와 빌드

```bash
npm test            # 단위 테스트 (Vitest)
npm run lint        # ESLint + tsc
npm run build       # 운영 빌드
npm run test:e2e    # Playwright (백엔드 4000 + 시연 데이터 필요, 처음에는 npx playwright install chromium)
```

E2E 는 시작할 때 시연 데이터를 초기화하므로 **같은 DB 의 데이터가 시연 상태로 되돌아갑니다.**

## Vercel 배포

| 항목 | 값 |
|---|---|
| Framework Preset | Next.js |
| Root Directory | 저장소 루트 |
| Build Command | `npm run build` (기본값) |
| Output Directory | 기본값 (`.next`) |
| Install Command | `npm ci` (기본값) |
| Node.js | 22.x |

1. Vercel 에서 이 저장소를 Import 합니다.
2. Environment Variables 에 `BACKEND_URL` = Render 백엔드 주소(예: `https://testory-backend.onrender.com`)를 Production·Preview 모두에 넣습니다.
3. 배포된 Vercel 주소를 **백엔드의 `FRONTEND_URL`** 에 넣습니다(미리보기 주소도 쓰려면 쉼표로 추가). 백엔드는 변경 요청의 `Origin` 이 이 목록에 있을 때만 받습니다.
4. 무료 Render 서버는 잠들 수 있어 첫 접속이 느릴 수 있습니다(약 1분).

Preview 와 Production 의 차이: 둘 다 같은 구조지만 주소가 다릅니다. Preview 에서 로그인·신청을 시험하려면 그 미리보기 주소가 백엔드 `FRONTEND_URL` 에도 들어 있어야 합니다.
