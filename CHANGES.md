# 변경사항: 프론트엔드 React 분리

## 개요

기존에 Express 서버가 HTML 파일을 직접 서빙하는 모놀리식 구조에서,
**백엔드(API/WebSocket 서버)** 와 **프론트엔드(React SPA)** 를 분리하였습니다.

---

## 변경된 백엔드 파일

### `app.js`
- **`cors` 미들웨어 추가**: React 개발 서버(`http://localhost:5173`)의 요청을 허용
- **Socket.IO CORS 설정 추가**: WebSocket 연결 시 React 클라이언트 origin 허용
- **`path` 모듈 제거**: HTML 파일 서빙이 불필요해져 제거
- **`express.static("public")` 제거**: 정적 파일 서빙을 React가 담당

### `controller/chatController.js`
- **`getIndex()` 함수 제거**: main.html 서빙 → React LoginPage로 대체
- **`getChat()` 함수 제거**: chat.html 서빙 + Referer 검증 → React 라우터 + 클라이언트 인증으로 대체
- **`login()` 함수 유지**: JWT 발급 API는 변경 없음

### `route/chatRoutes.js`
- **`GET /` 라우트 제거**: HTML 서빙 불필요
- **`GET /chat` 라우트 제거**: HTML 서빙 불필요
- **`POST /login` 라우트 유지**: 로그인 API는 그대로 유지

### `socket/chatSocket.js`
- **변경 없음**: Socket.IO 이벤트 처리 로직은 동일

### `package.json`
- **`cors` 의존성 추가**: `npm install cors`

---

## 새로 추가된 프론트엔드 (`client/`)

### 기술 스택
| 항목 | 기술 |
|------|------|
| 빌드 도구 | Vite |
| UI 라이브러리 | React 19 |
| 라우팅 | react-router-dom |
| 실시간 통신 | socket.io-client |

### 디렉토리 구조
```
client/
├── vite.config.js          # 프록시 설정 (/login, /socket.io → localhost:3000)
├── index.html
└── src/
    ├── main.jsx            # 앱 진입점
    ├── App.jsx             # React Router 설정
    ├── pages/
    │   ├── LoginPage.jsx   # 로그인 페이지 (기존 main.html)
    │   ├── RoomPage.jsx    # 방 선택 페이지 (새로 추가)
    │   └── ChatPage.jsx    # 채팅 페이지 (기존 chat.html)
    ├── components/
    │   ├── MessageList.jsx # 메시지 목록 렌더링
    │   ├── MessageItem.jsx # 개별 메시지 (본인/타인 구분, 축하 이모지)
    │   ├── MessageInput.jsx# 메시지 입력 폼
    │   └── Fireworks.jsx   # 캔버스 불꽃놀이 효과
    ├── hooks/
    │   └── useSocket.js    # Socket.IO 연결/이벤트 커스텀 훅
    ├── utils/
    │   └── crypto.js       # XOR + Base64 암호화/복호화
    └── styles/
        └── App.css         # 전체 스타일 (기존 인라인 CSS 이전)
```

### 페이지별 설명

#### `LoginPage.jsx` (기존 `main.html` 대체)
- 닉네임 + 비밀번호(구호) 입력 폼
- `fetch POST /login` → JWT 토큰을 localStorage에 저장
- 성공 시 `/room` 페이지로 이동 (React Router `navigate`)

#### `RoomPage.jsx` (새로 추가)
- 기존에는 `prompt()`로 방 이름을 입력받았으나, 별도 페이지로 분리
- JWT/username이 없으면 로그인 페이지로 리다이렉트
- 방 이름 입력 후 `/chat`으로 이동 (React Router state로 방 이름 전달)
- 빈칸 입력 시 '기본방'으로 설정

#### `ChatPage.jsx` (기존 `chat.html` 대체)
- JWT/username/room 검증 (없으면 해당 페이지로 리다이렉트)
- `useSocket` 훅으로 Socket.IO 연결 관리
- 인증 실패 시 자동으로 로그인 페이지로 리다이렉트
- 축하 키워드 감지 시 `Fireworks` 컴포넌트 실행

#### `Fireworks.jsx` (기존 인라인 Canvas 코드 → React 컴포넌트)
- `forwardRef` + `useImperativeHandle`로 부모에서 `launch()` 호출 가능
- Particle, Firework 클래스 로직은 기존과 동일
- `useEffect`로 캔버스 리사이즈 이벤트 관리

#### `useSocket.js` (Socket.IO 로직 → 커스텀 훅)
- Socket.IO 연결/해제를 `useEffect`에서 관리
- `chatMessage`, `userState` 이벤트를 수신하여 messages 상태 업데이트
- `sendMessage` 함수를 `useCallback`으로 메모이제이션하여 반환
- 인증 오류 감지 시 `authError` 상태 반환

---

## 삭제된 파일 및 코드

React 분리 후 더 이상 사용되지 않는 파일과 코드를 정리하였습니다.

### 삭제된 파일/디렉토리

| 삭제 대상 | 이유 |
|-----------|------|
| `view/main.html` | React `LoginPage.jsx`로 완전 대체 |
| `view/chat.html` | React `ChatPage.jsx`로 완전 대체 |
| `view/` 디렉토리 | 내부 파일 전부 삭제되어 빈 디렉토리 제거 |
| `public/` 디렉토리 | 정적 파일 서빙을 React(Vite)가 담당하여 불필요 |

### Vite 기본 생성 파일 정리

| 삭제 대상 | 이유 |
|-----------|------|
| `client/src/App.css` | 빈 파일 — `styles/App.css`에서 스타일 관리 |
| `client/src/index.css` | 빈 파일 — `styles/App.css`에서 스타일 관리 |
| `client/src/assets/react.svg` | Vite 기본 React 로고 — 미사용 |
| `client/src/assets/` 디렉토리 | 빈 디렉토리 제거 |
| `client/public/vite.svg` | Vite 기본 로고 — 미사용 |

### 삭제된 코드

| 파일 | 삭제 내용 | 이유 |
|------|-----------|------|
| `app.js` | `express.static("public")` 미들웨어 | `public/` 디렉토리 삭제로 불필요 |
| `app.js` | 404 HTML 응답 (인라인 HTML 템플릿) | 프론트 분리로 API 서버는 JSON 응답으로 통일 |
| `controller/chatController.js` | `getIndex()` 함수 | HTML 서빙 불필요 |
| `controller/chatController.js` | `getChat()` 함수 + Referer 검증 | HTML 서빙 불필요, 인증은 클라이언트에서 처리 |
| `controller/chatController.js` | `path` 모듈 import | 파일 경로 처리가 불필요해져 제거 |
| `route/chatRoutes.js` | `GET /` 라우트 | HTML 서빙 불필요 |
| `route/chatRoutes.js` | `GET /chat` 라우트 | HTML 서빙 불필요 |

---

## 실행 방법

### 백엔드 (Express + Socket.IO)
```bash
# 프로젝트 루트에서
npm install        # cors 의존성 설치
node app.js        # 서버 실행 (포트 3000)
```

### 프론트엔드 (React + Vite)
```bash
cd client
npm install        # React 의존성 설치
npm run dev        # 개발 서버 실행 (포트 5173)
```

### 접속
브라우저에서 `http://localhost:5173` 접속

---

## 흐름 비교

### 변경 전
```
브라우저 → Express (GET /) → main.html 서빙
         → Express (POST /login) → JWT 발급
         → Express (GET /chat + Referer 검증) → chat.html 서빙
         → Socket.IO 연결 (같은 origin)
```

### 변경 후
```
브라우저 → Vite Dev Server (localhost:5173) → React SPA
         → Vite 프록시 → Express (POST /login) → JWT 발급
         → React Router → /room → /chat
         → Socket.IO 연결 (CORS 허용, localhost:3000)
```

---

## 프로덕션 모드 추가

개발 시에는 터미널 2개(Express + Vite)가 필요했지만, 프로덕션에서는 **서버 1개로 통합** 실행할 수 있도록 변경하였습니다.

### `app.js` 변경사항
- **`NODE_ENV` 환경변수** 로 개발/프로덕션 모드 분기
- **개발 모드** (`NODE_ENV=development`, 기본값): CORS 활성화, Vite 개발 서버와 분리 운영
- **프로덕션 모드** (`NODE_ENV=production`): CORS 비활성화, `client/dist/` 정적 파일 서빙, SPA 라우팅(`{*path}` → `index.html`) 추가
- **`path` 모듈 재추가**: 프로덕션에서 `client/dist/index.html` 경로 처리에 필요

### `package.json` 스크립트 추가
| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 백엔드 개발 서버 실행 |
| `npm run build` | React 프론트엔드 빌드 (`client/dist` 생성) |
| `npm start` | 프로덕션 모드 통합 실행 (`NODE_ENV=production`) |

### 실행 비교
| 항목 | 개발 모드 | 프로덕션 모드 |
|------|-----------|---------------|
| 터미널 | 2개 (Express + Vite) | 1개 (Express만) |
| 접속 주소 | `localhost:5173` | `localhost:3000` |
| Hot Reload | O | X (빌드 필요) |

---

## npm 보안 취약점 수정

`npm audit`으로 발견된 총 7건의 취약점을 수정하였습니다.

### 백엔드 (루트) — 3건

| # | 패키지 | 심각도 | 취약점 | 수정 전 → 후 |
|---|--------|--------|--------|--------------|
| 1 | `body-parser` | **moderate** | URL 인코딩 시 DoS 공격 가능 ([GHSA-wqch-xfxh-vrr4](https://github.com/advisories/GHSA-wqch-xfxh-vrr4)) | 2.2.0 → **2.2.2** |
| 2 | `jws` (jsonwebtoken 하위) | **high** | HMAC 서명 검증 우회 가능 ([GHSA-869p-cjfg-cm3x](https://github.com/advisories/GHSA-869p-cjfg-cm3x)) | <3.2.3 → **3.2.3** |
| 3 | `qs` | **high** | arrayLimit 우회로 메모리 고갈 DoS ([GHSA-6rw7-vpxm-498p](https://github.com/advisories/GHSA-6rw7-vpxm-498p), [GHSA-w7fw-mjwx-w883](https://github.com/advisories/GHSA-w7fw-mjwx-w883)) | ≤6.14.1 → **6.15.0** |

**해결 명령어**: `npm audit fix`

### 프론트엔드 (`client/`) — 4건

| # | 패키지 | 심각도 | 취약점 | 수정 전 → 후 |
|---|--------|--------|--------|--------------|
| 1 | `minimatch` | **high** | 반복 와일드카드 ReDoS 공격 ([GHSA-3ppc-4f35-3m26](https://github.com/advisories/GHSA-3ppc-4f35-3m26)) | <10.2.1 → **10.2.2** |
| 2 | `@eslint/config-array` | **high** | minimatch 취약 버전 의존 | minimatch 업그레이드로 해결 |
| 3 | `@eslint/eslintrc` | **high** | minimatch 취약 버전 의존 | minimatch 업그레이드로 해결 |
| 4 | `eslint` | **high** | 위 패키지들의 상위 의존성 | 9.x → **10.0.2** |

> 모두 개발 의존성(devDependencies)이므로 프로덕션 빌드에는 포함되지 않습니다.

**해결 명령어**: `npm audit fix --force`

### 수정 후 결과
```
루트:   found 0 vulnerabilities
client: found 0 vulnerabilities
```
  
---

## [3차] 실시간 공유 캔버스 기능 추가

### 추가된 CSS 클래스

| 클래스 | 설명 |
|---|---|
| `.shared-canvas-header` | 공유 캔버스 헤더 영역 — `border-bottom: 1px solid #333` |
| `.shared-canvas-title` | 헤더 타이틀 — `font-weight: 600`, `color: #fff` |
| `.shared-canvas-hint` | 안내 문구 — `font-size: 0.75rem`, `color: #4ecdc4` |

### 탭 구조 변경

```
sidebar-strip
  ├── ✏️  내 그림 그리기 (DrawingCanvas — 기존)
  └── 🎨  공유 캔버스   (SharedCanvas — 신규)
```

**탭 토글 로직**
- 닫힌 상태에서 탭 클릭 → 사이드바 열고 해당 탭 활성화
- 같은 탭 재클릭 → 사이드바 닫힘
- 다른 탭 클릭 → 탭 전환 (사이드바 유지)

### 신규 파일

| 파일 | 설명 |
|---|---|
| `client/src/components/SharedCanvas.jsx` | 실시간 공유 캔버스 컴포넌트 |

### 소켓 이벤트 흐름

| 이벤트 | 방향 | 페이로드 |
|---|---|---|
| `drawStroke` (획) | Client → Server → 다른 참여자 | `{ type: 'stroke', from, to, color, size, tool }` |
| `drawStroke` (지우기) | Client → Server → 다른 참여자 | `{ type: 'clear' }` |

- 서버: `socket.broadcast.to(room)` — 송신자 제외, 같은 방 전체 브로드캐스트
- 로컬 그리기 즉시 반영 + 원격 수신 즉시 반영 (양방향 실시간)

---

## [4차] 공유 캔버스 탭 반짝임 알림 추가

### 기능 설명
다른 참여자가 공유 캔버스에 그림을 그리면, 해당 탭을 보고 있지 않은 참여자의 🎨 아이콘이 반짝이며 알림을 표시합니다.

### 동작 조건

| 조건 | 결과 |
|---|---|
| 상대방이 획을 그림 + 내가 공유 캔버스 탭을 보고 있지 않음 | 🎨 아이콘 반짝임 시작 |
| 이미 공유 캔버스 탭을 열고 있는 중 | 반짝임 없음 (이미 확인 중) |
| 🎨 아이콘을 클릭해 탭 열기 | 반짝임 즉시 중단 |
| `type: 'clear'` 이벤트 수신 | 반짝임 없음 (그리기 동작이 아님) |

### 변경된 파일

#### `client/src/hooks/useSocket.js`
- `drawNotifyHandlerRef` 추가 — 알림 전용 핸들러 ref
- `drawStroke` 수신 시 `drawStrokeHandlerRef`(캔버스 렌더링)와 `drawNotifyHandlerRef`(알림) 동시 호출
- `registerDrawNotifyHandler` 함수 반환

#### `client/src/pages/ChatPage.jsx`
- `hasNewDrawing` 상태 추가
- `sidebarOpenRef`, `activeTabRef` — 콜백 내부에서 최신 상태 참조용 ref
- `useEffect`로 알림 핸들러 등록: `type === 'stroke'` + 공유 탭 미확인 시 `hasNewDrawing = true`
- `handleTabClick('shared')` 시 `hasNewDrawing = false` (확인 처리)
- 🎨 버튼에 `.blinking` 클래스 조건부 적용

#### `client/src/styles/App.css`
```css
@keyframes tab-notify {
  0%, 100% { border-color: transparent; background: transparent; box-shadow: none; }
  50%       { border-color: #4ecdc4; background: #1a3a38; box-shadow: 0 0 8px #4ecdc4; }
}

.sidebar-tab-btn.blinking {
  animation: tab-notify 0.9s ease-in-out infinite;
}
```
