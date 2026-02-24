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

## 기존 파일 (유지)

### `view/main.html`, `view/chat.html`
- 기존 HTML 파일은 삭제하지 않고 유지 (참고용)
- 백엔드에서 더 이상 서빙하지 않음

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
