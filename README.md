# Testory Frontend

베타테스터를 모집하고 피드백을 모아 AI로 종합 분석하는 **테스토리(Testory)** 의 웹 화면입니다.
Next.js(App Router) · TypeScript · Tailwind CSS 로 만들었고, 규칙(정원·기기 조건·권한 등)은 백엔드가 지킵니다.

- 백엔드 저장소: `testory-level01-backend`
- 기획서: [기획서.md](./기획서.md)

> **처음 열면 조금 기다려야 할 수 있어요.**
> 백엔드가 Render 무료 플랜에 있어서, 한동안 쓰지 않았다면 첫 요청에 서버가 깨어나느라 **30초~1분쯤** 걸릴 수 있습니다.
> 목록이 "불러오는 중"으로 오래 머물면 잠시 기다린 뒤 새로고침해 주세요.

## 확인용 계정 (모두 가상)
| 역할 | 이메일 | 비밀번호 | 해 볼 수 있는 일 |
|---|---|---|---|
| **관리자** | `admin@testory.demo` | `admin1234` | 현황 보기, 모집글 등록·수정·삭제·마감, 신청자 조회, 피드백 조회, **AI 분석(버전별 저장·이전 버전 보기)**, 시연 데이터 초기화 |
| **일반 사용자(테스터)** | `tester01@example.com` | `testory1234` | 모집글 신청·취소, 피드백 작성, 내 신청·내 피드백, 마이페이지에서 내 기기 수정 |

테스터는 `tester01` ~ `tester20` 까지 있고 비밀번호는 모두 같습니다. 기기가 서로 달라서 신청 결과도 달라져요.
- `tester04` (아이폰 14): "일정 공유 테스트"에 신청하면 **기기가 맞지 않아 거절**됩니다.
- `tester15` (픽셀 8): 이미 참여 중인 모집글이 있어 피드백을 남겨 볼 수 있습니다.
- "알림 기능 테스트"에는 AI 분석 v1·v2 가 미리 저장돼 있어서, 관리자로 로그인하면 바로 볼 수 있습니다.

## 화면
| 구분 | 화면 |
|---|---|
| 누구나 | 모집글 목록(기기·상태 필터, 제목 검색), 모집글 상세, 로그인, 가입 |
| 테스터 | 내 신청, 내 피드백, 마이페이지(기기 정보 수정) |
| 관리자 | 현황, 모집글 관리(등록·수정·삭제·마감), 신청자, 피드백, AI 분석, 시연 데이터 |

## 폴더 구조
```
src/
├─ app/        라우트만 둡니다(얇은 page·layout). 화면 로직은 features 에 있습니다.
├─ core/       앱 기반: config(env), api(fetch 래퍼·오류), auth(AuthProvider·가드)
├─ shared/     공통: components/ui·layout, hooks, utils, types, constants
└─ features/   기능별 묶음: auth · profile · recruitments · applications · feedbacks · analysis · dashboard · demo
```
의존 방향은 `app → features → shared / core` 입니다.

## 환경변수
| 이름 | 필수 | 뜻 |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | 예 | 백엔드(API 서버) 주소. 예: `https://testory-backend.onrender.com`. 끝에 `/` 를 붙이지 마세요. 브라우저에 공개되는 값이라 비밀값을 넣으면 안 됩니다. |

비밀값(DB 주소, API 키 등)은 이 저장소에 없고 백엔드에만 있습니다.

## 로컬 실행
```bash
npm install
cp .env.example .env.local   # NEXT_PUBLIC_API_URL 을 백엔드 주소로
npm run dev                  # http://localhost:3000
```
백엔드를 먼저 실행해 두세요(기본 `http://localhost:4000`).

## Vercel 배포
1. Vercel 에서 **Add New → Project** 로 이 저장소를 가져옵니다.
2. 설정은 자동으로 잡힙니다. 확인만 하세요.

| 설정 | 값 |
|---|---|
| Framework Preset | Next.js |
| Build Command | `next build` (기본값) |
| Output Directory | 기본값 |
| Install Command | `npm install` (기본값) |
| Node.js Version | 20 이상 |
| **Environment Variables** | `NEXT_PUBLIC_API_URL` = 배포된 백엔드 주소 |

3. 배포가 끝나면 Vercel 주소를 백엔드의 `FRONTEND_ORIGIN` 환경변수에 넣고 백엔드를 다시 배포합니다. (넣지 않으면 브라우저가 API 요청을 막습니다.)
4. `NEXT_PUBLIC_API_URL` 은 빌드할 때 화면 코드에 들어가므로, 값을 바꾸면 **다시 배포**해야 적용됩니다.
