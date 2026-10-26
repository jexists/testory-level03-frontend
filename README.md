<div align="center">

# Testory · Frontend

**앱 베타테스터 모집 · 신청 · 피드백 관리 서비스의 웹 화면**

<a href="https://testory-level01-frontend.vercel.app"><img src="https://img.shields.io/badge/배포_앱_열기-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="배포 앱 열기"></a>
<a href="https://testory-level01-backend.onrender.com/api/docs"><img src="https://img.shields.io/badge/API_문서-85EA2D?style=for-the-badge&logo=swagger&logoColor=black" alt="API 문서"></a>
<a href="./기획서.md"><img src="https://img.shields.io/badge/기획서-2F5BEA?style=for-the-badge&logo=markdown&logoColor=white" alt="기획서"></a>
<a href="./docs/보고서_Level01_정주애.pdf"><img src="https://img.shields.io/badge/보고서-E5484D?style=for-the-badge&logo=googledocs&logoColor=white" alt="보고서"></a>

![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript_6-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)

</div>

---

## 🔗 바로가기

| 구분 | GitHub 저장소 | 배포 주소 |
|---|---|---|
| **프론트엔드** (이 저장소) | [jexists/testory-level01-frontend](https://github.com/jexists/testory-level01-frontend) | <https://testory-level01-frontend.vercel.app> |
| **백엔드** | [jexists/testory-level01-backend](https://github.com/jexists/testory-level01-backend) | <https://testory-level01-backend.onrender.com> |

- 화면 = 사용자 경험 담당, 정원·기기 조건·취소 등 규칙 판단 = 백엔드 담당
- 브라우저 → 같은 오리진 `/api/*` → Vercel rewrite → 백엔드 API
- 기획서: [`기획서.md`](./기획서.md) (백엔드 저장소와 동일)

> ⏱ 백엔드 = Render 무료 서버. 15분 미사용 시 절전 → 첫 접속 최대 약 1분 소요. 오류 화면이면 잠시 뒤 새로고침.

---

<a id="accounts"></a>

## 👤 확인용 계정

시연 데이터로 만든 가상 계정 · 공통 비밀번호 `testory-demo-1234` · 배포 주소·로컬 모두 사용 가능

| 역할 | 이메일 | 시연 포인트 |
|---|---|---|
| 관리자 | `admin@testory.demo` | 대시보드, 모집글 관리, AI 분석 |
| 일반 사용자 | `tester01@testory.demo` | 테스트 중 모집글 피드백, 모집 중 모집글 취소 |
| 일반 사용자 | `tester20@testory.demo` | Android(갤럭시 A54) 신청 |
| 일반 사용자 | `tester19@testory.demo` | iOS(아이폰 14) 기기 조건 불일치 |

- 로컬 개발(`npm run dev`) 한정: 로그인 화면의 관리자·테스터 빠른 로그인 버튼

---

## ✨ 주요 기능

| 대상 | 기능 |
|---|---|
| **방문자** | 모집글 목록(기기 종류·모집 상태 필터, 제목 검색, 남은 자리), 모집글 상세(진행 단계, 모집·테스트·피드백 일정) |
| **테스터** | 회원가입(브라우저 OS 자동 선택, 모델 선택 또는 직접 입력), 신청·취소·재신청, 내 신청(상태 필터, 피드백 바로가기), 피드백 작성(버그·개선·칭찬), 마이페이지 기기 수정 |
| **관리자** | 대시보드(모집 중·마감 임박·AI 분석 필요 숫자 카드, 진행 단계 필터, 검색), 모집글 등록·수정·삭제·복구·마감, 신청자·피드백 조회, AI 분석(진행 상황, 근거 피드백, 참고자료, 조치 제안, 버전별 저장), 시연 데이터 초기화 |

<details>
<summary><b>화면 주소</b></summary>

| 주소 | 화면 |
|---|---|
| `/` | 모집글 목록 |
| `/recruitments/:id` | 모집글 상세 · 신청 · 피드백 |
| `/login`, `/signup` | 로그인, 회원가입 |
| `/me` | 마이페이지 (계정 정보, 내 기기) |
| `/me/applications` | 내 신청 (테스터) |
| `/admin` | 관리자 대시보드 |
| `/admin/recruitments/new`, `/admin/recruitments/:id/edit` | 모집글 등록, 수정 |
| `/admin/recruitments/:id/applicants` · `/feedbacks` · `/analysis` | 신청자 · 피드백 · AI 분석 탭 |

</details>

---

## 📸 화면 캡처

배포 주소 기준 주요 화면 15장 → [`docs/`](./docs) 폴더

<details>
<summary><b>화면 목록</b></summary>

| 번호 | 화면 | 번호 | 화면 |
|---|---|---|---|
| 01 | [모집글 목록](./docs/01_목록.png) | 09 | [관리자 모집글 등록](./docs/09_관리자_모집글등록.png) |
| 02 | [모집글 목록 (전체)](./docs/02_목록_전체.png) | 10 | [관리자 신청자](./docs/10_관리자_신청자.png) |
| 03 | [상세 · 신청 버튼](./docs/03_상세_신청버튼.png) | 11 | [AI 분석](./docs/11_AI분석.png) |
| 04 | [회원가입](./docs/04_회원가입_등록.png) | 12 | [피드백 목록](./docs/12_피드백_목록.png) |
| 05 | [로그인](./docs/05_로그인.png) | 13 | [피드백 작성](./docs/13_피드백_작성.png) |
| 06 | [신청 거절 (기기 불일치)](./docs/06_신청거절_기기불일치.png) | 14 | [관리자 피드백](./docs/14_관리자_피드백.png) |
| 07 | [내 신청](./docs/07_내신청.png) | 15 | [마이페이지](./docs/15_마이페이지.png) |
| 08 | [관리자 대시보드 · 현황](./docs/08_관리자_대시보드_현황.png) | | |

</details>

---

## 🛠 기술 스택

| 구분 | 기술 |
|---|---|
| Framework | ![Next.js](https://img.shields.io/badge/Next.js_16_(App_Router)-000000?style=flat-square&logo=nextdotjs&logoColor=white) ![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black) |
| Language | ![TypeScript](https://img.shields.io/badge/TypeScript_6-3178C6?style=flat-square&logo=typescript&logoColor=white) |
| Styling | ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white) ![IBM Plex](https://img.shields.io/badge/IBM_Plex_Sans_KR_·_Mono-052FAD?style=flat-square) |
| Form · Validation | ![React Hook Form](https://img.shields.io/badge/React_Hook_Form-EC5990?style=flat-square&logo=reacthookform&logoColor=white) ![Zod](https://img.shields.io/badge/Zod-3E67B1?style=flat-square&logo=zod&logoColor=white) |
| Icon | ![Lucide](https://img.shields.io/badge/Lucide-F56565?style=flat-square&logo=lucide&logoColor=white) |
| Test | ![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=flat-square&logo=vitest&logoColor=white) ![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=flat-square) |
| Deploy | ![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white) |

- 디자인 토큰: `src/app/globals.css` 의 `@theme` (색상 · 글자 크기 · 둥글기 · 그림자)
- 대표 컴포넌트: `SeatStrip` — 정원 대비 참여·남은 자리 칸 표시
- 화면 상태: 로딩(스켈레톤) · 빈 화면 · 오류 · 성공(토스트)

---

## 🚀 시작하기

**사전 준비:** Node.js 22.12 이상, 실행 중인 백엔드(<http://localhost:4000>)

```bash
npm ci
cp .env.example .env.local
npm run dev                    # http://localhost:3000
```

| 환경변수 | 필수 | 설명 | 예시 |
|---|---|---|---|
| `BACKEND_URL` | ✅ | 백엔드 주소 (서버 전용, 끝 `/` 없이) | 로컬 `http://localhost:4000` · 운영 Render 주소 |
| `NEXT_PUBLIC_DEMO_PASSWORD` | | 로컬 빠른 로그인용 시연 비밀번호 (백엔드 `DEMO_PASSWORD` 변경 시만) | — |

---

## 🧪 테스트 · 빌드

| 명령 | 내용 |
|---|---|
| `npm test` | 단위 테스트 (Vitest) |
| `npm run lint` | ESLint + 타입 검사 |
| `npm run build` | 운영 빌드 |
| `npm run test:e2e` | E2E (Playwright, 백엔드 4000 필요, 시작 시 시연 데이터 초기화) |

---

## ☁️ 배포 (Vercel)

| 항목 | 값 |
|---|---|
| Framework Preset | Next.js |
| Root Directory | 저장소 루트 |
| Build / Install | 기본값 (`npm run build` / `npm ci`) |
| 환경변수 | `BACKEND_URL` = `https://testory-level01-backend.onrender.com` |

1. Vercel에서 저장소 Import → `BACKEND_URL` 입력 → Deploy
2. `BACKEND_URL` 변경 시 Redeploy 필수 (빌드 시점에 rewrite 고정)
3. 배포 주소를 백엔드 `FRONTEND_URL` 에 등록 (불일치 시 로그인 403)

---

## 📁 폴더 구조

<details>
<summary><b>펼치기</b></summary>

```
src/
  app/              # 라우트 (App Router): 목록, 상세, 로그인·가입, me, admin
  features/         # 기능별 화면: auth, recruitments, applications, feedbacks, profile, admin
  components/ui/    # 공통 UI: 버튼, 입력, 배지, SeatStrip, 토스트, 대화상자
  components/layout # 헤더, 내비게이션
  lib/              # API 호출, 타입, 라벨, 날짜·기기 유틸
  proxy.ts          # 비로그인 시 /login 이동
e2e/                # Playwright 시나리오
```

</details>
